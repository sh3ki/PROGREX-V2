import { randomBytes, randomUUID, createHash } from 'node:crypto'
import nodemailer from 'nodemailer'
import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/server/admin-permission'
import { sql } from '@/lib/server/db'
import {
  generateInvoicePdf,
  getProjectInvoicePayload,
  getSinglePaymentInvoicePayload,
} from '@/lib/server/paymentInvoice'
import AdminPaymentsTemplateView from '@/components/admin/payments/AdminPaymentsTemplateView'

const PAYMENT_STATUSES = new Set(['pending', 'partial', 'paid', 'refunded', 'failed'])
const PAYMENT_METHODS = new Set(['Cash', 'Gcash', 'Bank Transfer', 'Credit Card', 'PayPal'])

type CurrencyOption = {
  code: string
  symbol: string
  label: string
}

const CURRENCIES: CurrencyOption[] = [
  { code: 'PHP', symbol: '₱', label: 'Philippine Peso' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
]

function normalizeStatus(value: string) {
  const normalized = value.trim().toLowerCase()
  return PAYMENT_STATUSES.has(normalized) ? normalized : 'pending'
}

function normalizePaymentMethod(value: string) {
  const trimmed = value.trim()
  return PAYMENT_METHODS.has(trimmed) ? trimmed : 'Gcash'
}

function parseAmount(value: string) {
  const sanitized = value.replace(/[^0-9.\-]/g, '')
  const parsed = Number(sanitized)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
}

function resolveCurrency(value: string): CurrencyOption {
  const byCode = CURRENCIES.find((item) => item.code === value.toUpperCase())
  return byCode || CURRENCIES[0]
}

async function ensurePaymentsTable() {
  await sql(`
    create table if not exists payments (
      id text primary key,
      project_id uuid references ongoing_projects(id) on delete set null,
      client_name text not null,
      project_name text,
      amount numeric(12, 2) not null default 0,
      currency text not null default 'PHP',
      currency_symbol text not null default '₱',
      currency_label text not null default 'Philippine Peso',
      payment_method text,
      payment_date date,
      status text not null default 'pending',
      proof_url text,
      notes text,
      or_number text,
      invoice_number text,
      invoice_status text not null default 'draft',
      invoice_due_date date,
      invoice_sent_at timestamptz,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `)

  await sql('alter table payments add column if not exists project_id uuid references ongoing_projects(id) on delete set null')
  await sql("alter table payments add column if not exists currency_symbol text not null default '₱'")
  await sql("alter table payments add column if not exists currency_label text not null default 'Philippine Peso'")
  await sql('alter table payments add column if not exists or_number text')
  await sql('alter table payments add column if not exists invoice_number text')
  await sql("alter table payments add column if not exists invoice_status text not null default 'draft'")
  await sql('alter table payments add column if not exists invoice_due_date date')
  await sql('alter table payments add column if not exists invoice_sent_at timestamptz')
}

async function uploadProofToCloudinary(file: File, opts: { folder: string; filename: string }) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.')
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const signatureBase = `folder=${opts.folder}&public_id=${opts.filename}&timestamp=${timestamp}${apiSecret}`
  const signature = createHash('sha1').update(signatureBase).digest('hex')

  const body = new FormData()
  body.append('file', file)
  body.append('api_key', apiKey)
  body.append('timestamp', String(timestamp))
  body.append('folder', opts.folder)
  body.append('public_id', opts.filename)
  body.append('signature', signature)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body,
  })

  const payload = (await response.json()) as { secure_url?: string; error?: { message?: string } }
  if (!response.ok || !payload.secure_url) {
    throw new Error(payload.error?.message || 'Cloudinary upload failed.')
  }

  return payload.secure_url
}

async function createPayment(formData: FormData) {
  'use server'
  await requirePermission('dashboard', 'write')
  await ensurePaymentsTable()

  const projectId = String(formData.get('projectId') ?? '').trim()
  const amount = parseAmount(String(formData.get('amount') ?? '0'))
  const currency = resolveCurrency(String(formData.get('currency') ?? 'PHP'))
  const paymentMethod = normalizePaymentMethod(String(formData.get('paymentMethod') ?? 'Gcash'))
  const paymentDate = String(formData.get('paymentDate') ?? '').trim()
  const status = normalizeStatus(String(formData.get('status') ?? 'pending'))
  const notes = String(formData.get('notes') ?? '').trim()
  const orNumber = String(formData.get('orNumber') ?? '').trim()

  if (!projectId) throw new Error('Project is required.')

  const project = await sql<{ project_name: string; category: string | null; client_name: string | null }>(
    `select op.project_name,
            op.category,
            c.full_name as client_name
       from ongoing_projects op
       left join clients c on c.id = op.client_id
      where op.id = $1::uuid
      limit 1`,
    [projectId]
  )

  if (!project.length) throw new Error('Selected project was not found.')

  let proofUrl: string | null = null
  const proofFile = formData.get('proofFile')
  if (proofFile instanceof File && proofFile.size > 0) {
    if (!proofFile.type.startsWith('image/')) throw new Error('Proof of payment must be an image.')
    if (proofFile.size > 10 * 1024 * 1024) throw new Error('Proof image must be 10MB or smaller.')
    const baseName = proofFile.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60) || 'payment-proof'
    const filename = `${baseName}-${randomBytes(3).toString('hex')}`
    proofUrl = await uploadProofToCloudinary(proofFile, { folder: 'ProgreX Payments', filename })
  }

  await sql(
    `insert into payments (
      id,
      project_id,
      client_name,
      project_name,
      amount,
      currency,
      currency_symbol,
      currency_label,
      payment_method,
      payment_date,
      status,
      proof_url,
      notes,
      or_number,
      invoice_status
    )
     values ($1, $2::uuid, $3, $4, $5, $6, $7, $8, $9, nullif($10, '')::date, $11, $12, nullif($13, ''), nullif($14, ''), 'draft')`,
    [
      randomUUID(),
      projectId,
      project[0].client_name || 'Unknown Client',
      project[0].project_name,
      amount,
      currency.code,
      currency.symbol,
      currency.label,
      paymentMethod,
      paymentDate,
      status,
      proofUrl,
      notes,
      orNumber,
    ]
  )

  revalidatePath('/admin/payment')
  revalidatePath('/admin')
}

async function updatePayment(formData: FormData) {
  'use server'
  await requirePermission('dashboard', 'write')
  await ensurePaymentsTable()

  const id = String(formData.get('id') ?? '').trim()
  if (!id) throw new Error('Payment ID is required.')

  const projectId = String(formData.get('projectId') ?? '').trim()
  const amount = parseAmount(String(formData.get('amount') ?? '0'))
  const currency = resolveCurrency(String(formData.get('currency') ?? 'PHP'))
  const paymentMethod = normalizePaymentMethod(String(formData.get('paymentMethod') ?? 'Gcash'))
  const paymentDate = String(formData.get('paymentDate') ?? '').trim()
  const status = normalizeStatus(String(formData.get('status') ?? 'pending'))
  const notes = String(formData.get('notes') ?? '').trim()
  const keepProof = String(formData.get('keepProof') ?? '1') === '1'
  const orNumber = String(formData.get('orNumber') ?? '').trim()

  if (!projectId) throw new Error('Project is required.')

  const project = await sql<{ project_name: string; category: string | null; client_name: string | null }>(
    `select op.project_name,
            op.category,
            c.full_name as client_name
       from ongoing_projects op
       left join clients c on c.id = op.client_id
      where op.id = $1::uuid
      limit 1`,
    [projectId]
  )

  if (!project.length) throw new Error('Selected project was not found.')

  const existing = await sql<{ proof_url: string | null }>('select proof_url from payments where id = $1', [id])
  let proofUrl = keepProof ? (existing[0]?.proof_url ?? null) : null

  const proofFile = formData.get('proofFile')
  if (proofFile instanceof File && proofFile.size > 0) {
    if (!proofFile.type.startsWith('image/')) throw new Error('Proof of payment must be an image.')
    if (proofFile.size > 10 * 1024 * 1024) throw new Error('Proof image must be 10MB or smaller.')
    const baseName = proofFile.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60) || 'payment-proof'
    const filename = `${baseName}-${randomBytes(3).toString('hex')}`
    proofUrl = await uploadProofToCloudinary(proofFile, { folder: 'ProgreX Payments', filename })
  }

  await sql(
    `update payments
        set project_id = $2::uuid,
            client_name = $3,
            project_name = $4,
            amount = $5,
            currency = $6,
            currency_symbol = $7,
            currency_label = $8,
            payment_method = $9,
            payment_date = nullif($10, '')::date,
            status = $11,
            proof_url = $12,
            notes = nullif($13, ''),
            or_number = nullif($14, ''),
            updated_at = now()
      where id = $1`,
    [
      id,
      projectId,
      project[0].client_name || 'Unknown Client',
      project[0].project_name,
      amount,
      currency.code,
      currency.symbol,
      currency.label,
      paymentMethod,
      paymentDate,
      status,
      proofUrl,
      notes,
      orNumber,
    ]
  )

  revalidatePath('/admin/payment')
  revalidatePath('/admin')
}

async function deletePayment(formData: FormData) {
  'use server'
  await requirePermission('dashboard', 'delete')
  await ensurePaymentsTable()

  const id = String(formData.get('id') ?? '').trim()
  if (!id) return

  await sql('delete from payments where id = $1', [id])
  revalidatePath('/admin/payment')
  revalidatePath('/admin')
}

async function sendTransactionInvoiceEmail(formData: FormData) {
  'use server'
  await requirePermission('dashboard', 'write')
  await ensurePaymentsTable()

  const id = String(formData.get('id') ?? '').trim()
  if (!id) return

  const payload = await getSinglePaymentInvoicePayload(id)
  if (!payload) throw new Error('Payment invoice data not found.')
  if (!payload.clientEmail) throw new Error('Client email is not set for this payment.')

  const pdfBytes = await generateInvoicePdf(payload)

  const smtpHost = process.env.SMTP_HOST || 'smtp.zoho.com'
  const smtpPort = Number(process.env.SMTP_PORT || 587)
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const smtpSecure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true'

  if (!smtpUser || !smtpPass) throw new Error('Email transport is not configured.')

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: { user: smtpUser, pass: smtpPass },
  })

  await transporter.sendMail({
    from: `"ProgreX Team" <${smtpUser}>`,
    to: payload.clientEmail,
    subject: `Invoice ${payload.invoiceNumber} - ${payload.projectName}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:#050511;border:1px solid #1c2d4d;border-radius:14px;overflow:hidden;"><div style="padding:20px 24px;background:linear-gradient(135deg,#0EA5E9 0%,#2563eb 100%);"><h1 style="margin:0;color:#fff;font-size:20px;">Your ProgreX Invoice</h1><p style="margin:6px 0 0;color:#e6f4ff;font-size:13px;">Please find your invoice attached.</p></div><div style="padding:22px 24px;color:#dbeafe;"><p style="margin:0 0 12px;font-size:14px;">Hello ${payload.clientName},</p><p style="margin:0 0 12px;font-size:14px;line-height:1.7;">Attached is your invoice <strong>${payload.invoiceNumber}</strong> for project <strong>${payload.projectName}</strong>.</p><p style="margin:0;font-size:14px;line-height:1.7;">If you have any questions, please reply to this email.</p><p style="margin:20px 0 8px;font-size:14px;">Best regards,</p><p style="margin:0;font-size:14px;font-weight:700;">ProgreX Team</p></div></div>`,
    attachments: [
      {
        filename: `${payload.invoiceNumber}.pdf`,
        content: Buffer.from(pdfBytes),
        contentType: 'application/pdf',
      },
    ],
  })

  await sql("update payments set invoice_status = 'sent', invoice_sent_at = now(), updated_at = now() where id = $1", [id])
  revalidatePath('/admin/payment')
}

async function sendProjectInvoiceEmail(formData: FormData) {
  'use server'
  await requirePermission('dashboard', 'write')
  await ensurePaymentsTable()

  const projectId = String(formData.get('projectId') ?? '').trim()
  if (!projectId) return

  const payload = await getProjectInvoicePayload(projectId)
  if (!payload) throw new Error('Project invoice data not found.')
  if (!payload.clientEmail) throw new Error('Client email is not set for this project.')

  const pdfBytes = await generateInvoicePdf(payload)

  const smtpHost = process.env.SMTP_HOST || 'smtp.zoho.com'
  const smtpPort = Number(process.env.SMTP_PORT || 587)
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const smtpSecure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true'

  if (!smtpUser || !smtpPass) throw new Error('Email transport is not configured.')

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: { user: smtpUser, pass: smtpPass },
  })

  await transporter.sendMail({
    from: `"ProgreX Team" <${smtpUser}>`,
    to: payload.clientEmail,
    subject: `Project Invoice ${payload.invoiceNumber} - ${payload.projectName}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:#050511;border:1px solid #1c2d4d;border-radius:14px;overflow:hidden;"><div style="padding:20px 24px;background:linear-gradient(135deg,#0EA5E9 0%,#2563eb 100%);"><h1 style="margin:0;color:#fff;font-size:20px;">Project Invoice Summary</h1><p style="margin:6px 0 0;color:#e6f4ff;font-size:13px;">All recorded payments from oldest to latest.</p></div><div style="padding:22px 24px;color:#dbeafe;"><p style="margin:0 0 12px;font-size:14px;">Hello ${payload.clientName},</p><p style="margin:0 0 12px;font-size:14px;line-height:1.7;">Attached is the complete payment invoice for <strong>${payload.projectName}</strong>.</p><p style="margin:0;font-size:14px;line-height:1.7;">If you have any questions, please reply to this email.</p><p style="margin:20px 0 8px;font-size:14px;">Best regards,</p><p style="margin:0;font-size:14px;font-weight:700;">ProgreX Team</p></div></div>`,
    attachments: [
      {
        filename: `${payload.invoiceNumber}.pdf`,
        content: Buffer.from(pdfBytes),
        contentType: 'application/pdf',
      },
    ],
  })

  await sql("update payments set invoice_status = 'sent', invoice_sent_at = now(), updated_at = now() where project_id = $1::uuid", [projectId])
  revalidatePath('/admin/payment')
}

export default async function AdminPaymentPage() {
  await requirePermission('dashboard', 'read')
  await ensurePaymentsTable()

  const [rows, projects, totals] = await Promise.all([
    sql<{
      id: string
      project_id: string | null
      project_name: string | null
      category: string | null
      client_name: string
      client_email: string | null
      amount: string
      currency: string
      currency_symbol: string | null
      currency_label: string | null
      payment_method: string | null
      payment_date: string | null
      status: string
      proof_url: string | null
      notes: string | null
      or_number: string | null
      invoice_number: string | null
      invoice_status: string | null
      invoice_due_date: string | null
      invoice_sent_at: string | null
      created_at: string | null
      total_price: string | null
      project_paid: string | null
      project_balance: string | null
    }>(
      `select p.id,
              p.project_id::text,
              p.project_name,
              op.category,
              p.client_name,
              c.email as client_email,
              p.amount::text,
              p.currency,
              p.currency_symbol,
              p.currency_label,
              p.payment_method,
              p.payment_date::text,
              p.status,
              p.proof_url,
              p.notes,
              p.or_number,
              p.invoice_number,
              p.invoice_status,
              p.invoice_due_date::text,
              p.invoice_sent_at::text,
              p.created_at::text,
              op.total_price::text,
              (
                select coalesce(sum(px.amount), 0)::text
                  from payments px
                 where px.project_id = p.project_id
                   and px.status in ('paid', 'partial')
              ) as project_paid,
              (
                coalesce(op.total_price, 0) - (
                  select coalesce(sum(px.amount), 0)
                    from payments px
                   where px.project_id = p.project_id
                     and px.status in ('paid', 'partial')
                )
              )::text as project_balance
         from payments p
         left join ongoing_projects op on op.id = p.project_id
         left join clients c on c.full_name = p.client_name
        order by p.payment_date desc nulls last, p.created_at desc`
    ),
    sql<{ id: string; project_name: string; category: string | null; client_name: string | null; client_email: string | null; total_price: string | null }>(
      `select op.id,
              op.project_name,
              op.category,
              c.full_name as client_name,
              c.email as client_email,
              op.total_price::text
         from ongoing_projects op
         left join clients c on c.id = op.client_id
        order by op.project_name asc`
    ),
    sql<{ total_projected: string | null; total_collected: string | null }>(
      `select
          (select coalesce(sum(total_price), 0)::text from ongoing_projects) as total_projected,
          (select coalesce(sum(amount), 0)::text from payments where status in ('paid', 'partial')) as total_collected`
    ),
  ])

  const totalProjected = Number(totals[0]?.total_projected || '0')
  const totalCollected = Number(totals[0]?.total_collected || '0')
  const totalBalance = Math.max(totalProjected - totalCollected, 0)

  return (
    <AdminPaymentsTemplateView
      payments={rows.map((row) => ({
        id: row.id,
        projectId: row.project_id,
        projectName: row.project_name,
        category: row.category,
        clientName: row.client_name,
        clientEmail: row.client_email,
        totalPrice: Number(row.total_price || '0'),
        amount: Number(row.amount || '0'),
        currency: row.currency || 'PHP',
        currencySymbol: row.currency_symbol || '₱',
        currencyLabel: row.currency_label || 'Philippine Peso',
        paymentMethod: row.payment_method,
        paymentDate: row.payment_date,
        status: normalizeStatus(row.status || 'pending'),
        proofUrl: row.proof_url,
        notes: row.notes,
        orNumber: row.or_number,
        invoiceNumber: row.invoice_number,
        invoiceStatus: row.invoice_status || 'draft',
        invoiceDueDate: row.invoice_due_date,
        invoiceSentAt: row.invoice_sent_at,
        projectPaid: Number(row.project_paid || '0'),
        projectBalance: Number(row.project_balance || '0'),
        createdAt: row.created_at,
      }))}
      projects={projects.map((project) => ({
        id: project.id,
        projectName: project.project_name,
        category: project.category,
        clientName: project.client_name || 'Unknown Client',
        clientEmail: project.client_email,
        totalPrice: Number(project.total_price || '0'),
      }))}
      currencies={CURRENCIES}
      stats={{ totalProjected, totalCollected, totalBalance }}
      createPaymentAction={createPayment}
      updatePaymentAction={updatePayment}
      deletePaymentAction={deletePayment}
      sendTransactionInvoiceEmailAction={sendTransactionInvoiceEmail}
      sendProjectInvoiceEmailAction={sendProjectInvoiceEmail}
    />
  )
}
