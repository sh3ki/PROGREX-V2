import { randomBytes, randomUUID, createHash } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/server/admin-permission'
import { sql } from '@/lib/server/db'
import AdminPaymentsTemplateView from '../../../../components/admin/payments/AdminPaymentsTemplateView'

const PAYMENT_STATUSES = new Set(['pending', 'partial', 'paid', 'refunded', 'failed'])
const PAYMENT_TYPES = new Set(['initial', 'second', 'third', 'final', 'custom'])

function normalizeStatus(value: string) {
  const normalized = value.trim().toLowerCase()
  return PAYMENT_STATUSES.has(normalized) ? normalized : 'pending'
}

function normalizePaymentType(value: string) {
  const normalized = value.trim().toLowerCase()
  return PAYMENT_TYPES.has(normalized) ? normalized : 'custom'
}

function parseAmount(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
}

function invoiceCode() {
  const stamp = Date.now().toString().slice(-6)
  const salt = randomBytes(2).toString('hex').toUpperCase()
  return `INV-${stamp}-${salt}`
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
      payment_method text,
      payment_type text not null default 'custom',
      payment_date date,
      status text not null default 'pending',
      proof_url text,
      notes text,
      invoice_number text,
      invoice_status text not null default 'draft',
      invoice_due_date date,
      invoice_sent_at timestamptz,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `)

  await sql('alter table payments add column if not exists project_id uuid references ongoing_projects(id) on delete set null')
  await sql("alter table payments add column if not exists payment_type text not null default 'custom'")
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

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
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
  const currency = String(formData.get('currency') ?? 'PHP').trim().toUpperCase() || 'PHP'
  const paymentMethod = String(formData.get('paymentMethod') ?? '').trim()
  const paymentType = normalizePaymentType(String(formData.get('paymentType') ?? 'custom'))
  const paymentDate = String(formData.get('paymentDate') ?? '').trim()
  const status = normalizeStatus(String(formData.get('status') ?? 'pending'))
  const notes = String(formData.get('notes') ?? '').trim()
  const invoiceNumber = String(formData.get('invoiceNumber') ?? '').trim()
  const invoiceDueDate = String(formData.get('invoiceDueDate') ?? '').trim()

  if (!projectId) throw new Error('Project is required.')

  const project = await sql<{ project_name: string; client_name: string | null }>(
    `select op.project_name, c.full_name as client_name
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
    if (proofFile.size > 10 * 1024 * 1024) throw new Error('Proof file must be 10MB or smaller.')
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
      payment_method,
      payment_type,
      payment_date,
      status,
      proof_url,
      notes,
      invoice_number,
      invoice_status,
      invoice_due_date
    )
     values ($1, $2::uuid, $3, $4, $5, $6, nullif($7, ''), $8, nullif($9, '')::date, $10, $11, nullif($12, ''), nullif($13, ''), $14, nullif($15, '')::date)`,
    [
      randomUUID(),
      projectId,
      project[0].client_name || 'Unknown Client',
      project[0].project_name,
      amount,
      currency,
      paymentMethod,
      paymentType,
      paymentDate,
      status,
      proofUrl,
      notes,
      invoiceNumber,
      invoiceNumber ? 'generated' : 'draft',
      invoiceDueDate,
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
  const currency = String(formData.get('currency') ?? 'PHP').trim().toUpperCase() || 'PHP'
  const paymentMethod = String(formData.get('paymentMethod') ?? '').trim()
  const paymentType = normalizePaymentType(String(formData.get('paymentType') ?? 'custom'))
  const paymentDate = String(formData.get('paymentDate') ?? '').trim()
  const status = normalizeStatus(String(formData.get('status') ?? 'pending'))
  const notes = String(formData.get('notes') ?? '').trim()
  const keepProof = String(formData.get('keepProof') ?? '1') === '1'
  const invoiceNumber = String(formData.get('invoiceNumber') ?? '').trim()
  const invoiceDueDate = String(formData.get('invoiceDueDate') ?? '').trim()

  if (!projectId) throw new Error('Project is required.')

  const project = await sql<{ project_name: string; client_name: string | null }>(
    `select op.project_name, c.full_name as client_name
       from ongoing_projects op
       left join clients c on c.id = op.client_id
      where op.id = $1::uuid
      limit 1`,
    [projectId]
  )

  if (!project.length) throw new Error('Selected project was not found.')

  const existing = await sql<{ proof_url: string | null; invoice_status: string | null }>(
    'select proof_url, invoice_status from payments where id = $1',
    [id]
  )
  let proofUrl = keepProof ? (existing[0]?.proof_url ?? null) : null

  const proofFile = formData.get('proofFile')
  if (proofFile instanceof File && proofFile.size > 0) {
    if (proofFile.size > 10 * 1024 * 1024) throw new Error('Proof file must be 10MB or smaller.')
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
            payment_method = nullif($7, ''),
            payment_type = $8,
            payment_date = nullif($9, '')::date,
            status = $10,
            proof_url = $11,
            notes = nullif($12, ''),
            invoice_number = nullif($13, ''),
            invoice_due_date = nullif($14, '')::date,
            invoice_status = case
              when nullif($13, '') is not null and coalesce(invoice_status, '') = 'draft' then 'generated'
              when nullif($13, '') is null then 'draft'
              else invoice_status
            end,
            updated_at = now()
      where id = $1`,
    [
      id,
      projectId,
      project[0].client_name || 'Unknown Client',
      project[0].project_name,
      amount,
      currency,
      paymentMethod,
      paymentType,
      paymentDate,
      status,
      proofUrl,
      notes,
      invoiceNumber,
      invoiceDueDate,
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

async function generateInvoice(formData: FormData) {
  'use server'
  await requirePermission('dashboard', 'write')
  await ensurePaymentsTable()

  const id = String(formData.get('id') ?? '').trim()
  if (!id) return

  const existing = await sql<{ invoice_number: string | null }>('select invoice_number from payments where id = $1 limit 1', [id])
  const nextCode = existing[0]?.invoice_number || invoiceCode()

  await sql(
    `update payments
        set invoice_number = $2,
            invoice_status = 'generated',
            updated_at = now()
      where id = $1`,
    [id, nextCode]
  )

  revalidatePath('/admin/payment')
  revalidatePath('/admin')
}

async function markInvoiceSent(formData: FormData) {
  'use server'
  await requirePermission('dashboard', 'write')
  await ensurePaymentsTable()

  const id = String(formData.get('id') ?? '').trim()
  if (!id) return

  await sql(
    `update payments
        set invoice_status = case when coalesce(invoice_number, '') = '' then 'draft' else 'sent' end,
            invoice_sent_at = case when coalesce(invoice_number, '') = '' then invoice_sent_at else now() end,
            updated_at = now()
      where id = $1`,
    [id]
  )

  revalidatePath('/admin/payment')
  revalidatePath('/admin')
}

async function togglePaymentSettled(formData: FormData) {
  'use server'
  await requirePermission('dashboard', 'write')
  await ensurePaymentsTable()

  const id = String(formData.get('id') ?? '').trim()
  if (!id) return

  await sql(
    `update payments
        set status = case when status = 'paid' then 'pending' else 'paid' end,
            updated_at = now()
      where id = $1`,
    [id]
  )

  revalidatePath('/admin/payment')
  revalidatePath('/admin')
}

export default async function AdminPaymentPage() {
  await requirePermission('dashboard', 'read')
  await ensurePaymentsTable()

  const [rows, projects] = await Promise.all([
    sql<{
      id: string
      project_id: string | null
      client_name: string
      project_name: string | null
      amount: string
      currency: string
      payment_method: string | null
      payment_type: string | null
      payment_date: string | null
      status: string
      proof_url: string | null
      notes: string | null
      invoice_number: string | null
      invoice_status: string | null
      invoice_due_date: string | null
      invoice_sent_at: string | null
      created_at: string | null
    }>(
      `select id,
              project_id::text,
              client_name,
              project_name,
              amount::text,
              currency,
              payment_method,
              payment_type,
              payment_date::text,
              status,
              proof_url,
              notes,
              invoice_number,
              invoice_status,
              invoice_due_date::text,
              invoice_sent_at::text,
              created_at::text
         from payments
        order by payment_date desc nulls last, created_at desc`
    ),
    sql<{ id: string; project_name: string; client_name: string | null; total_price: string | null; balance: string | null }>(
      `select op.id,
              op.project_name,
              c.full_name as client_name,
              op.total_price::text,
              op.balance::text
         from ongoing_projects op
         left join clients c on c.id = op.client_id
        order by op.project_name asc`
    ),
  ])

  return (
    <AdminPaymentsTemplateView
      payments={rows.map((row) => ({
        id: row.id,
        projectId: row.project_id,
        clientName: row.client_name,
        projectName: row.project_name,
        amount: Number(row.amount ?? '0'),
        currency: row.currency || 'PHP',
        paymentMethod: row.payment_method,
        paymentType: normalizePaymentType(row.payment_type || 'custom'),
        paymentDate: row.payment_date,
        status: normalizeStatus(row.status || 'pending'),
        proofUrl: row.proof_url,
        notes: row.notes,
        invoiceNumber: row.invoice_number,
        invoiceStatus: row.invoice_status || 'draft',
        invoiceDueDate: row.invoice_due_date,
        invoiceSentAt: row.invoice_sent_at,
        createdAt: row.created_at,
      }))}
      projects={projects.map((project) => ({
        id: project.id,
        projectName: project.project_name,
        clientName: project.client_name || 'Unknown Client',
        totalPrice: Number(project.total_price || '0'),
        balance: Number(project.balance || '0'),
      }))}
      createPaymentAction={createPayment}
      updatePaymentAction={updatePayment}
      deletePaymentAction={deletePayment}
      generateInvoiceAction={generateInvoice}
      markInvoiceSentAction={markInvoiceSent}
      togglePaymentSettledAction={togglePaymentSettled}
    />
  )
}
