import nodemailer from 'nodemailer'
import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/server/admin-permission'
import { sql } from '@/lib/server/db'
import AdminContactSubmissionsTemplateView from '@/components/admin/contact-submissions/AdminContactSubmissionsTemplateView'

const CONTACT_STATUSES = new Set(['new', 'in-progress', 'replied', 'resolved'])

function normalizeContactStatus(value: string) {
  const input = value.trim().toLowerCase()
  return CONTACT_STATUSES.has(input) ? input : 'new'
}

async function ensureContactColumns() {
  await sql('alter table contact_submissions add column if not exists is_active boolean not null default true')
}

async function createContactSubmission(formData: FormData) {
  'use server'
  await requirePermission('bookings', 'write')
  await ensureContactColumns()

  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()
  const company = String(formData.get('company') ?? '').trim()
  const service = String(formData.get('service') ?? '').trim()
  const budget = String(formData.get('budget') ?? '').trim()
  const message = String(formData.get('message') ?? '').trim()
  const status = normalizeContactStatus(String(formData.get('status') ?? 'new'))
  const isActive = String(formData.get('isActive') ?? 'true') !== 'false'

  if (!name || !email || !message) return

  await sql(
    `insert into contact_submissions(name, email, phone, company, service, budget, message, status, is_active)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [name, email, phone || null, company || null, service || null, budget || null, message, status, isActive]
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
  const phone = String(formData.get('phone') ?? '').trim()
  const company = String(formData.get('company') ?? '').trim()
  const service = String(formData.get('service') ?? '').trim()
  const budget = String(formData.get('budget') ?? '').trim()
  const message = String(formData.get('message') ?? '').trim()
  const status = normalizeContactStatus(String(formData.get('status') ?? 'new'))
  const isActive = String(formData.get('isActive') ?? 'true') !== 'false'

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
         updated_at = now()
     where id = $1::uuid`,
    [id, name || null, email || null, phone || null, company || null, service || null, budget || null, message || null, status, isActive]
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

async function bulkSetInactiveContactSubmissions(formData: FormData) {
  'use server'
  await requirePermission('bookings', 'write')

  const ids = String(formData.get('ids') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (ids.length === 0) return
  await sql('update contact_submissions set is_active = false, updated_at = now() where id = any($1::uuid[])', [ids])
  revalidatePath('/admin/contact-submissions')
}

async function sendReply(formData: FormData) {
  'use server'
  await requirePermission('bookings', 'write')

  const id = String(formData.get('id') ?? '').trim()
  const toEmail = String(formData.get('email') ?? '').trim()
  const senderName = String(formData.get('name') ?? '').trim()
  const subject = String(formData.get('subject') ?? 'Re: Your PROGREX inquiry').trim()
  const reply = String(formData.get('reply') ?? '').trim()
  if (!id || !toEmail || !reply) return

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  await transporter.sendMail({
    from: `"PROGREX" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject,
    html: `<p>Hello ${senderName || 'there'},</p><p>${reply.replace(/\n/g, '<br/>')}</p><p>Best regards,<br/>PROGREX Team</p>`,
  })

  await sql(
    `update contact_submissions
     set admin_reply = $2, status = 'replied', replied_at = now(), updated_at = now()
     where id = $1::uuid`,
    [id, reply]
  )

  revalidatePath('/admin/contact-submissions')
}

export default async function AdminContactSubmissionsPage() {
  await requirePermission('bookings', 'read')
  await ensureContactColumns()

  const contacts = await sql<{
    id: string
    name: string
    email: string
    phone: string | null
    company: string | null
    service: string | null
    budget: string | null
    message: string
    status: string
    admin_reply: string | null
    is_active: boolean
    created_at: string | null
  }>(
    `select id, name, email, phone, company, service, budget, message, status, admin_reply, is_active, created_at::text
     from contact_submissions
     order by created_at desc`
  )

  return (
    <AdminContactSubmissionsTemplateView
      submissions={contacts.map((item) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        phone: item.phone,
        company: item.company,
        service: item.service,
        budget: item.budget,
        message: item.message,
        status: item.status || 'new',
        adminReply: item.admin_reply,
        isActive: item.is_active,
        createdAt: item.created_at,
      }))}
      createSubmissionAction={createContactSubmission}
      updateSubmissionAction={updateContactSubmission}
      deleteSubmissionAction={deleteContactSubmission}
      bulkDeleteSubmissionsAction={bulkDeleteContactSubmissions}
      bulkSetInactiveSubmissionsAction={bulkSetInactiveContactSubmissions}
      sendReplyAction={sendReply}
    />
  )
}
