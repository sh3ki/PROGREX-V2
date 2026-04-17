import nodemailer from 'nodemailer'
import { createHash, randomBytes } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/server/admin-permission'
import { sql } from '@/lib/server/db'
import AdminContactSubmissionsTemplateView from '@/components/admin/contact-submissions/AdminContactSubmissionsTemplateView'

const CONTACT_STATUSES = new Set(['pending', 'new', 'in-progress', 'replied', 'resolved', 'archived'])

function normalizeContactStatus(value: string) {
  const input = value.trim().toLowerCase()
  return CONTACT_STATUSES.has(input) ? input : 'new'
}

function normalizePhone(value: string) {
  return value.replace(/\D+/g, '').slice(0, 20)
}

async function uploadRawToCloudinary(file: File, opts: { folder: string; filename: string }) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) throw new Error('Cloudinary is not configured.')

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

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, { method: 'POST', body })
  const payload = (await response.json()) as { secure_url?: string; error?: { message?: string } }
  if (!response.ok || !payload.secure_url) throw new Error(payload.error?.message || 'Cloudinary upload failed.')
  return payload.secure_url
}

async function ensureContactColumns() {
  await sql('alter table contact_submissions add column if not exists service text')
  await sql('alter table contact_submissions add column if not exists budget text')
  await sql('alter table contact_submissions add column if not exists message text')
  await sql('alter table contact_submissions add column if not exists status text not null default \'new\'')
  await sql('alter table contact_submissions add column if not exists is_active boolean not null default true')
  await sql('alter table contact_submissions add column if not exists is_archived boolean not null default false')
  await sql('alter table contact_submissions add column if not exists attachment_urls text[] default array[]::text[]')
  await sql('alter table contact_submissions add column if not exists request_meeting boolean not null default false')
}

async function createContactSubmission(formData: FormData) {
  'use server'
  await requirePermission('bookings', 'write')
  await ensureContactColumns()

  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const phone = normalizePhone(String(formData.get('phone') ?? ''))
  const company = String(formData.get('company') ?? '').trim()
  const service = String(formData.get('service') ?? '').trim()
  const budget = String(formData.get('budget') ?? '').trim()
  const message = String(formData.get('message') ?? '').trim()
  const status = normalizeContactStatus(String(formData.get('status') ?? 'new'))
  const isActive = String(formData.get('isActive') ?? 'true') !== 'false'

  if (!name || !email) return

  const uploadedUrls: string[] = []
  const files = formData.getAll('attachments').filter((entry) => entry instanceof File) as File[]
  for (const file of files.slice(0, 3)) {
    if (file.size > 10 * 1024 * 1024) continue
    const baseName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60) || 'contact-file'
    const filename = `${baseName}-${randomBytes(3).toString('hex')}`
    try {
      const url = await uploadRawToCloudinary(file, { folder: 'ProgreX Contact File Upload', filename })
      uploadedUrls.push(url)
    } catch {}
  }

  await sql(
    `insert into contact_submissions(name, email, phone, company, service, budget, message, status, is_active, attachment_urls)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::text[])`,
    [name, email, phone || null, company || null, service || null, budget || null, message || null, status, isActive, uploadedUrls]
  )

  revalidatePath('/admin/contact-submissions')
}

async function updateContactSubmission(formData: FormData) {
  'use server'
  await requirePermission('bookings', 'write')
  await ensureContactColumns()

  const id = String(formData.get('id') ?? '').trim()
  if (!id) return

  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const phone = normalizePhone(String(formData.get('phone') ?? ''))
  const company = String(formData.get('company') ?? '').trim()
  const service = String(formData.get('service') ?? '').trim()
  const budget = String(formData.get('budget') ?? '').trim()
  const message = String(formData.get('message') ?? '').trim()
  const status = normalizeContactStatus(String(formData.get('status') ?? 'new'))
  const isActive = String(formData.get('isActive') ?? 'true') !== 'false'

  const existing = await sql<{ attachment_urls: string[] }>('select attachment_urls from contact_submissions where id = $1::uuid', [id])
  const existingUrls = existing[0]?.attachment_urls || []
  const keptUrls = String(formData.get('keptAttachmentUrls') ?? '').split('||').filter(Boolean)
  let uploadedUrls = existingUrls.filter((url) => keptUrls.includes(url))

  const files = formData.getAll('attachments').filter((entry) => entry instanceof File) as File[]
  for (const file of files.slice(0, Math.max(0, 3 - uploadedUrls.length))) {
    if (file.size > 10 * 1024 * 1024) continue
    const baseName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60) || 'contact-file'
    const filename = `${baseName}-${randomBytes(3).toString('hex')}`
    try {
      const url = await uploadRawToCloudinary(file, { folder: 'ProgreX Contact File Upload', filename })
      uploadedUrls.push(url)
    } catch {}
  }

  if (uploadedUrls.length > 3) uploadedUrls = uploadedUrls.slice(0, 3)

  await sql(
    `update contact_submissions
     set name = $2,
         email = $3,
         phone = $4,
         company = $5,
         service = $6,
         budget = $7,
         message = $8,
         status = $9,
         is_active = $10,
         attachment_urls = $11::text[],
         updated_at = now()
     where id = $1::uuid`,
    [id, name || null, email || null, phone || null, company || null, service || null, budget || null, message || null, status, isActive, uploadedUrls]
  )

  revalidatePath('/admin/contact-submissions')
}

async function deleteContactSubmission(formData: FormData) {
  'use server'
  await requirePermission('bookings', 'delete')
  const id = String(formData.get('id') ?? '').trim()
  if (!id) return
  await sql('delete from contact_submissions where id = $1::uuid', [id])
  revalidatePath('/admin/contact-submissions')
}

async function bulkDeleteContactSubmissions(formData: FormData) {
  'use server'
  await requirePermission('bookings', 'delete')

  const ids = String(formData.get('ids') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (ids.length === 0) return

  await sql('delete from contact_submissions where id = any($1::uuid[])', [ids])
  revalidatePath('/admin/contact-submissions')
}

async function updateContactSubmissionStatus(formData: FormData) {
  'use server'
  await requirePermission('bookings', 'write')

  const id = String(formData.get('id') ?? '').trim()
  const status = normalizeContactStatus(String(formData.get('status') ?? 'new'))

  if (!id) return

  await sql('update contact_submissions set status = $2, updated_at = now() where id = $1::uuid', [id, status])
  revalidatePath('/admin/contact-submissions')
}

async function bulkArchiveContactSubmissions(formData: FormData) {
  'use server'
  await requirePermission('bookings', 'write')

  const ids = String(formData.get('ids') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (ids.length === 0) return

  await sql('update contact_submissions set is_archived = true, updated_at = now() where id = any($1::uuid[])', [ids])
  revalidatePath('/admin/contact-submissions')
}

async function toggleArchiveContactSubmission(formData: FormData) {
  'use server'
  await requirePermission('bookings', 'write')

  const id = String(formData.get('id') ?? '').trim()
  if (!id) return

  await sql('update contact_submissions set is_archived = not is_archived, updated_at = now() where id = $1::uuid', [id])
  revalidatePath('/admin/contact-submissions')
}

async function sendContactEmail(formData: FormData) {
  'use server'
  await requirePermission('bookings', 'write')

  const toEmail = String(formData.get('email') ?? '').trim()
  const senderName = String(formData.get('name') ?? '').trim()
  const subject = String(formData.get('subject') ?? 'Your message has been received').trim()
  const reply = String(formData.get('reply') ?? '').trim()

  if (!toEmail || !reply) return

  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com'
  const smtpPort = Number(process.env.SMTP_PORT) || 465
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const secure = smtpPort === 465

  if (!smtpUser || !smtpPass) {
    throw new Error('SMTP credentials not configured.')
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure,
    auth: { user: smtpUser, pass: smtpPass },
  })

  await transporter.sendMail({
    from: `"ProgreX Team" <${smtpUser}>`,
    to: toEmail,
    subject,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:#050511;border:1px solid #1c2d4d;border-radius:14px;overflow:hidden;">
        <div style="padding:20px 24px;background:linear-gradient(135deg,#0EA5E9 0%,#2563eb 100%);">
          <h1 style="margin:0;color:#fff;font-size:20px;">Contact Response</h1>
          <p style="margin:6px 0 0;color:#e6f4ff;font-size:13px;">Message from ProgreX Team</p>
        </div>
        <div style="padding:22px 24px;color:#dbeafe;">
          <p style="margin:0 0 12px;font-size:14px;">Hello ${senderName || 'there'},</p>
          <p style="margin:0;font-size:14px;line-height:1.7;white-space:pre-line;background:#050510;padding:16px;border-radius:8px;border:1px solid #1e1b4b;">${reply}</p>
          <p style="margin:20px 0 8px;font-size:14px;">Best regards,</p>
          <p style="margin:0;font-size:14px;font-weight:700;">ProgreX Team</p>
        </div>
      </div>
    `,
  })

  revalidatePath('/admin/contact-submissions')
}

export default async function AdminContactSubmissionsPage() {
  await requirePermission('bookings', 'read')
  await ensureContactColumns()

  const submissions = await sql<{
    id: string
    name: string
    email: string
    phone: string | null
    company: string | null
    service: string | null
    budget: string | null
    message: string | null
    status: string
    is_active: boolean
    is_archived: boolean
    attachment_urls: string[]
    created_at: string | null
  }>(
    `select id, name, email, phone, company, service, budget, message, status, is_active, is_archived, attachment_urls, created_at::text
     from contact_submissions
     where coalesce(request_meeting, false) = false
     order by created_at desc`
  )

  return (
    <AdminContactSubmissionsTemplateView
      submissions={submissions.map((item) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        phone: item.phone,
        company: item.company,
        service: item.service,
        budget: item.budget,
        message: item.message,
        status: item.status || 'pending',
        isActive: item.is_active,
        isArchived: item.is_archived,
        attachmentUrls: item.attachment_urls || [],
        createdAt: item.created_at,
      }))}
      createContactSubmissionAction={createContactSubmission}
      updateContactSubmissionAction={updateContactSubmission}
      deleteContactSubmissionAction={deleteContactSubmission}
      bulkDeleteContactSubmissionsAction={bulkDeleteContactSubmissions}
      bulkArchiveContactSubmissionsAction={bulkArchiveContactSubmissions}
      toggleArchiveContactSubmissionAction={toggleArchiveContactSubmission}
      updateContactSubmissionStatusAction={updateContactSubmissionStatus}
      sendContactEmailAction={sendContactEmail}
    />
  )
}
