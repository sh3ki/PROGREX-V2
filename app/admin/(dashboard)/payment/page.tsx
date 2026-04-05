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
  await sql('alter table ongoing_projects add column if not exists invoice_no text')

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
      invoice_pdf_url text,
      invoice_pdf_public_id text,
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
  await sql('alter table payments add column if not exists invoice_pdf_url text')
  await sql('alter table payments add column if not exists invoice_pdf_public_id text')
}

async function uploadInvoicePdfToCloudinary(bytes: Uint8Array, opts: { folder: string; filename: string }) {
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
  body.append('file', new Blob([Buffer.from(bytes)], { type: 'application/pdf' }), `${opts.filename}.pdf`)
  body.append('api_key', apiKey)
  body.append('timestamp', String(timestamp))
  body.append('folder', opts.folder)
  body.append('public_id', opts.filename)
  body.append('signature', signature)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
    method: 'POST',
    body,
  })

  const payload = (await response.json()) as { secure_url?: string; public_id?: string; error?: { message?: string } }
  if (!response.ok || !payload.secure_url || !payload.public_id) {
    throw new Error(payload.error?.message || 'Cloudinary invoice upload failed.')
  }

  return { secureUrl: payload.secure_url, publicId: payload.public_id }
}

async function deleteRawFromCloudinary(publicId: string | null) {
  if (!publicId) return

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) return

  const timestamp = Math.floor(Date.now() / 1000)
  const signatureBase = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`
  const signature = createHash('sha1').update(signatureBase).digest('hex')

  const body = new FormData()
  body.append('public_id', publicId)
  body.append('timestamp', String(timestamp))
  body.append('api_key', apiKey)
  body.append('signature', signature)
  body.append('resource_type', 'raw')

  await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/destroy`, {
    method: 'POST',
    body,
  })
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

function slugifyInvoicePart(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 70) || 'project'
}

function normalizeInvoiceFilename(value: string) {
  return value.replace(/[^a-zA-Z0-9\- ]+/g, '').replace(/\s+/g, ' ').trim().slice(0, 120) || 'Invoice'
}

function buildTransactionInvoiceNumber(projectInvoiceNo: string, paymentId: string) {
  return `${projectInvoiceNo}-TXN-${paymentId.replace(/[^a-z0-9]/gi, '').slice(0, 6).toUpperCase()}`
}

async function getProjectInvoiceNumber(projectId: string) {
  const rows = await sql<{ invoice_no: string | null; start_date: string | null }>(
    `select invoice_no,
            to_char(coalesce(start_date, now()::date), 'YYYY-MM-DD') as start_date
       from ongoing_projects
      where id = $1::uuid
      limit 1`,
    [projectId]
  )
  const invoiceNo = String(rows[0]?.invoice_no || '').trim()
  if (invoiceNo) return invoiceNo
  const fallbackDate = String(rows[0]?.start_date || '').trim()
  const match = fallbackDate.match(/^(\d{4})-(\d{2})-\d{2}$/)
  const yearMonth = match ? `${match[1]}-${match[2]}` : `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  const fallback = `INV-${yearMonth}-001`
  await sql('update ongoing_projects set invoice_no = $2, updated_at = now() where id = $1::uuid', [projectId, fallback])
  return fallback
}

async function createOrReplaceTransactionInvoice(paymentId: string) {
  const paymentRows = await sql<{ project_id: string | null; invoice_pdf_public_id: string | null; project_name: string | null }>(
    'select project_id::text, invoice_pdf_public_id, project_name from payments where id = $1 limit 1',
    [paymentId]
  )
  if (!paymentRows.length) throw new Error('Payment not found.')

  const projectId = String(paymentRows[0].project_id || '').trim()
  if (!projectId) throw new Error('Payment has no project.')

  const payload = await getSinglePaymentInvoicePayload(paymentId)
  if (!payload) throw new Error('Payment invoice data not found.')

  const projectInvoiceNo = await getProjectInvoiceNumber(projectId)
  const invoiceNumber = buildTransactionInvoiceNumber(projectInvoiceNo, paymentId)
  const existingRows = await sql<{ invoice_pdf_url: string | null; invoice_pdf_public_id: string | null }>(
    'select invoice_pdf_url, invoice_pdf_public_id from payments where id = $1 limit 1',
    [paymentId]
  )
  const existingInvoiceUrl = String(existingRows[0]?.invoice_pdf_url || '').trim()
  const existingInvoicePublicId = String(existingRows[0]?.invoice_pdf_public_id || '').trim()

  if (existingInvoiceUrl && existingInvoicePublicId) {
    const pdfBytes = await generateInvoicePdf({ ...payload, invoiceNumber })
    return { invoiceNumber, invoicePdfUrl: existingInvoiceUrl, payload: { ...payload, invoiceNumber }, pdfBytes }
  }

  const pdfBytes = await generateInvoicePdf({ ...payload, invoiceNumber })
  const folderName = `ProgreX Invoices/${slugifyInvoicePart(payload.projectName)}`
  const uploaded = await uploadInvoicePdfToCloudinary(pdfBytes, {
    folder: folderName,
    filename: invoiceNumber,
  })

  await sql(
    `update payments
        set invoice_number = $2,
            invoice_status = 'generated',
            invoice_pdf_url = $3,
            invoice_pdf_public_id = $4,
            updated_at = now()
      where id = $1`,
    [paymentId, invoiceNumber, uploaded.secureUrl, uploaded.publicId]
  )

  return { invoiceNumber, invoicePdfUrl: uploaded.secureUrl, payload: { ...payload, invoiceNumber }, pdfBytes }
}

async function createOrReplaceProjectInvoice(projectId: string) {
  const payload = await getProjectInvoicePayload(projectId)
  if (!payload) throw new Error('Project invoice data not found.')

  const projectInvoiceNo = await getProjectInvoiceNumber(projectId)
  const pdfBytes = await generateInvoicePdf({ ...payload, invoiceNumber: projectInvoiceNo })

  const existing = await sql<{ invoice_pdf_public_id: string | null }>(
    `select invoice_pdf_public_id
       from payments
      where project_id = $1::uuid
        and invoice_pdf_public_id is not null
      order by updated_at desc nulls last, created_at desc nulls last
      limit 1`,
    [projectId]
  )
  await deleteRawFromCloudinary(existing[0]?.invoice_pdf_public_id ?? null)

  const folderName = `ProgreX Invoices/${slugifyInvoicePart(payload.projectName)}`
  const projectFilename = normalizeInvoiceFilename(`${payload.projectName} - Invoice`)
  const uploaded = await uploadInvoicePdfToCloudinary(pdfBytes, {
    folder: folderName,
    filename: projectFilename,
  })

  await sql(
    `update payments
        set invoice_number = $2,
            invoice_status = 'generated',
            invoice_pdf_url = $3,
            invoice_pdf_public_id = $4,
            updated_at = now()
      where project_id = $1::uuid`,
    [projectId, projectInvoiceNo, uploaded.secureUrl, uploaded.publicId]
  )

  return { invoiceNumber: projectInvoiceNo, invoicePdfUrl: uploaded.secureUrl, payload: { ...payload, invoiceNumber: projectInvoiceNo }, pdfBytes }
}

async function sendTransactionInvoiceEmail(formData: FormData) {
  'use server'
  try {
    await requirePermission('dashboard', 'write')
    await ensurePaymentsTable()

    const id = String(formData.get('id') ?? '').trim()
    if (!id) return { ok: false as const, message: 'Payment ID is missing.' }

    const generated = await createOrReplaceTransactionInvoice(id)
    if (!generated.payload.clientEmail) return { ok: false as const, message: 'Client email is not set for this payment.' }

    const smtpHost = process.env.SMTP_HOST || 'smtp.zoho.com'
    const smtpPort = Number(process.env.SMTP_PORT || 587)
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const smtpSecure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true'

    if (!smtpUser || !smtpPass) return { ok: false as const, message: 'Email transport is not configured.' }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: { user: smtpUser, pass: smtpPass },
    })

    await transporter.sendMail({
      from: `"ProgreX Team" <${smtpUser}>`,
      to: generated.payload.clientEmail,
      subject: `Invoice ${generated.invoiceNumber} - ${generated.payload.projectName}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:#050511;border:1px solid #1c2d4d;border-radius:14px;overflow:hidden;"><div style="padding:20px 24px;background:linear-gradient(135deg,#0EA5E9 0%,#2563eb 100%);"><h1 style="margin:0;color:#fff;font-size:20px;">Your ProgreX Invoice</h1><p style="margin:6px 0 0;color:#e6f4ff;font-size:13px;">Please find your invoice attached.</p></div><div style="padding:22px 24px;color:#dbeafe;"><p style="margin:0 0 12px;font-size:14px;">Hello ${generated.payload.clientName},</p><p style="margin:0 0 12px;font-size:14px;line-height:1.7;">Attached is your invoice <strong>${generated.invoiceNumber}</strong> for project <strong>${generated.payload.projectName}</strong>.</p><p style="margin:0;font-size:14px;line-height:1.7;">If you have any questions, please reply to this email.</p><p style="margin:20px 0 8px;font-size:14px;">Best regards,</p><p style="margin:0;font-size:14px;font-weight:700;">ProgreX Team</p></div></div>`,
      attachments: [
        {
          filename: `${generated.invoiceNumber}.pdf`,
          content: Buffer.from(generated.pdfBytes),
          contentType: 'application/pdf',
        },
      ],
    })

    await sql("update payments set invoice_status = 'sent', invoice_sent_at = now(), updated_at = now() where id = $1", [id])
    revalidatePath('/admin/payment')
    return { ok: true as const, message: 'Invoice email sent.', invoicePdfUrl: generated.invoicePdfUrl }
  } catch (error) {
    console.error('sendTransactionInvoiceEmail error', error)
    return { ok: false as const, message: error instanceof Error ? error.message : 'Failed to send invoice email.' }
  }
}

async function generateTransactionInvoice(formData: FormData) {
  'use server'
  try {
    await requirePermission('dashboard', 'write')
    await ensurePaymentsTable()

    const id = String(formData.get('id') ?? '').trim()
    if (!id) return { ok: false as const, message: 'Payment ID is missing.' }

    const generated = await createOrReplaceTransactionInvoice(id)
    revalidatePath('/admin/payment')
    return { ok: true as const, message: 'Invoice generated.', invoicePdfUrl: generated.invoicePdfUrl }
  } catch (error) {
    console.error('generateTransactionInvoice error', error)
    return { ok: false as const, message: error instanceof Error ? error.message : 'Failed to generate invoice.' }
  }
}

async function sendProjectInvoiceEmail(formData: FormData) {
  'use server'
  try {
    await requirePermission('dashboard', 'write')
    await ensurePaymentsTable()

    const projectId = String(formData.get('projectId') ?? '').trim()
    if (!projectId) return { ok: false as const, message: 'Project is required.' }

    const generated = await createOrReplaceProjectInvoice(projectId)
    if (!generated.payload.clientEmail) return { ok: false as const, message: 'Client email is not set for this project.' }

    const smtpHost = process.env.SMTP_HOST || 'smtp.zoho.com'
    const smtpPort = Number(process.env.SMTP_PORT || 587)
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const smtpSecure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true'

    if (!smtpUser || !smtpPass) return { ok: false as const, message: 'Email transport is not configured.' }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: { user: smtpUser, pass: smtpPass },
    })

    await transporter.sendMail({
      from: `"ProgreX Team" <${smtpUser}>`,
      to: generated.payload.clientEmail,
      subject: `Project Invoice ${generated.invoiceNumber} - ${generated.payload.projectName}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:#050511;border:1px solid #1c2d4d;border-radius:14px;overflow:hidden;"><div style="padding:20px 24px;background:linear-gradient(135deg,#0EA5E9 0%,#2563eb 100%);"><h1 style="margin:0;color:#fff;font-size:20px;">Project Invoice Summary</h1><p style="margin:6px 0 0;color:#e6f4ff;font-size:13px;">All recorded payments from oldest to latest.</p></div><div style="padding:22px 24px;color:#dbeafe;"><p style="margin:0 0 12px;font-size:14px;">Hello ${generated.payload.clientName},</p><p style="margin:0 0 12px;font-size:14px;line-height:1.7;">Attached is the complete payment invoice for <strong>${generated.payload.projectName}</strong>.</p><p style="margin:0;font-size:14px;line-height:1.7;">If you have any questions, please reply to this email.</p><p style="margin:20px 0 8px;font-size:14px;">Best regards,</p><p style="margin:0;font-size:14px;font-weight:700;">ProgreX Team</p></div></div>`,
      attachments: [
        {
          filename: `${generated.invoiceNumber}.pdf`,
          content: Buffer.from(generated.pdfBytes),
          contentType: 'application/pdf',
        },
      ],
    })

    await sql("update payments set invoice_status = 'sent', invoice_sent_at = now(), updated_at = now() where project_id = $1::uuid", [projectId])
    revalidatePath('/admin/payment')
    return { ok: true as const, message: 'Project invoice email sent.', invoicePdfUrl: generated.invoicePdfUrl }
  } catch (error) {
    console.error('sendProjectInvoiceEmail error', error)
    return { ok: false as const, message: error instanceof Error ? error.message : 'Failed to send project invoice email.' }
  }
}

async function generateProjectInvoice(formData: FormData) {
  'use server'
  try {
    await requirePermission('dashboard', 'write')
    await ensurePaymentsTable()

    const projectId = String(formData.get('projectId') ?? '').trim()
    if (!projectId) return { ok: false as const, message: 'Project is required.' }

    const generated = await createOrReplaceProjectInvoice(projectId)
    revalidatePath('/admin/payment')
    return { ok: true as const, message: 'Project invoice generated.', invoicePdfUrl: generated.invoicePdfUrl }
  } catch (error) {
    console.error('generateProjectInvoice error', error)
    return { ok: false as const, message: error instanceof Error ? error.message : 'Failed to generate project invoice.' }
  }
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
      invoice_pdf_url: string | null
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
              p.invoice_pdf_url,
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
    sql<{ id: string; project_name: string; category: string | null; client_name: string | null; client_email: string | null; total_price: string | null; invoice_no: string | null }>(
      `select op.id,
              op.project_name,
              op.category,
              c.full_name as client_name,
              c.email as client_email,
              op.total_price::text,
              op.invoice_no
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
        invoicePdfUrl: row.invoice_pdf_url,
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
        invoiceNo: project.invoice_no,
      }))}
      currencies={CURRENCIES}
      stats={{ totalProjected, totalCollected, totalBalance }}
      createPaymentAction={createPayment}
      updatePaymentAction={updatePayment}
      deletePaymentAction={deletePayment}
      generateTransactionInvoiceAction={generateTransactionInvoice}
      sendTransactionInvoiceEmailAction={sendTransactionInvoiceEmail}
      generateProjectInvoiceAction={generateProjectInvoice}
      sendProjectInvoiceEmailAction={sendProjectInvoiceEmail}
    />
  )
}
