import { randomBytes, randomUUID, createHash } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/server/admin-permission'
import { sql } from '@/lib/server/db'
import AdminPaymentsTemplateView from '@/components/admin/payments/AdminPaymentsTemplateView'

const PAYMENT_STATUSES = new Set(['pending', 'partial', 'paid', 'refunded', 'failed'])

function normalizeStatus(value: string) {
  const normalized = value.trim().toLowerCase()
  return PAYMENT_STATUSES.has(normalized) ? normalized : 'pending'
}

function parseAmount(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
}

async function ensurePaymentsTable() {
  await sql(`
    create table if not exists payments (
      id text primary key,
      client_name text not null,
      project_name text,
      amount numeric(12, 2) not null default 0,
      currency text not null default 'PHP',
      payment_method text,
      payment_date date,
      status text not null default 'pending',
      proof_url text,
      notes text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `)
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

  const clientName = String(formData.get('clientName') ?? '').trim()
  const projectName = String(formData.get('projectName') ?? '').trim()
  const amount = parseAmount(String(formData.get('amount') ?? '0'))
  const currency = String(formData.get('currency') ?? 'PHP').trim().toUpperCase() || 'PHP'
  const paymentMethod = String(formData.get('paymentMethod') ?? '').trim()
  const paymentDate = String(formData.get('paymentDate') ?? '').trim()
  const status = normalizeStatus(String(formData.get('status') ?? 'pending'))
  const notes = String(formData.get('notes') ?? '').trim()

  if (!clientName) throw new Error('Client name is required.')

  let proofUrl: string | null = null
  const proofFile = formData.get('proofFile')
  if (proofFile instanceof File && proofFile.size > 0) {
    if (proofFile.size > 10 * 1024 * 1024) throw new Error('Proof file must be 10MB or smaller.')
    const baseName = proofFile.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60) || 'payment-proof'
    const filename = `${baseName}-${randomBytes(3).toString('hex')}`
    proofUrl = await uploadProofToCloudinary(proofFile, { folder: 'ProgreX Payments', filename })
  }

  await sql(
    `insert into payments (id, client_name, project_name, amount, currency, payment_method, payment_date, status, proof_url, notes)
     values ($1, $2, $3, $4, $5, $6, nullif($7, '')::date, $8, $9, $10)`,
    [randomUUID(), clientName, projectName || null, amount, currency, paymentMethod || null, paymentDate, status, proofUrl, notes || null]
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

  const clientName = String(formData.get('clientName') ?? '').trim()
  const projectName = String(formData.get('projectName') ?? '').trim()
  const amount = parseAmount(String(formData.get('amount') ?? '0'))
  const currency = String(formData.get('currency') ?? 'PHP').trim().toUpperCase() || 'PHP'
  const paymentMethod = String(formData.get('paymentMethod') ?? '').trim()
  const paymentDate = String(formData.get('paymentDate') ?? '').trim()
  const status = normalizeStatus(String(formData.get('status') ?? 'pending'))
  const notes = String(formData.get('notes') ?? '').trim()
  const keepProof = String(formData.get('keepProof') ?? '1') === '1'

  if (!clientName) throw new Error('Client name is required.')

  const existing = await sql<{ proof_url: string | null }>('select proof_url from payments where id = $1', [id])
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
     set client_name = $2,
         project_name = $3,
         amount = $4,
         currency = $5,
         payment_method = $6,
         payment_date = nullif($7, '')::date,
         status = $8,
         proof_url = $9,
         notes = $10,
         updated_at = now()
     where id = $1`,
    [id, clientName, projectName || null, amount, currency, paymentMethod || null, paymentDate, status, proofUrl, notes || null]
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

export default async function AdminPaymentPage() {
  await requirePermission('dashboard', 'read')
  await ensurePaymentsTable()

  const rows = await sql<{
    id: string
    client_name: string
    project_name: string | null
    amount: string
    currency: string
    payment_method: string | null
    payment_date: string | null
    status: string
    proof_url: string | null
    notes: string | null
    created_at: string | null
  }>(
    `select id,
            client_name,
            project_name,
            amount::text,
            currency,
            payment_method,
            payment_date::text,
            status,
            proof_url,
            notes,
            created_at::text
     from payments
     order by payment_date desc nulls last, created_at desc`
  )

  return (
    <AdminPaymentsTemplateView
      payments={rows.map((row) => ({
        id: row.id,
        clientName: row.client_name,
        projectName: row.project_name,
        amount: Number(row.amount ?? '0'),
        currency: row.currency || 'PHP',
        paymentMethod: row.payment_method,
        paymentDate: row.payment_date,
        status: normalizeStatus(row.status || 'pending'),
        proofUrl: row.proof_url,
        notes: row.notes,
        createdAt: row.created_at,
      }))}
      createPaymentAction={createPayment}
      updatePaymentAction={updatePayment}
      deletePaymentAction={deletePayment}
    />
  )
}
