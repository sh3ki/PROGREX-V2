import nodemailer from 'nodemailer'
import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/server/admin-permission'
import { sql } from '@/lib/server/db'
import AdminBookingsTemplateView from '@/components/admin/bookings/AdminBookingsTemplateView'

const BOOKING_STATUSES = new Set(['new', 'in-review', 'scheduled', 'rescheduled', 'done', 'rejected'])

function normalizeBookingStatus(value: string) {
  const input = value.trim().toLowerCase()
  return BOOKING_STATUSES.has(input) ? input : 'new'
}

async function ensureBookingColumns() {
  await sql("alter table bookings add column if not exists is_approved boolean not null default false")
  await sql('alter table bookings add column if not exists requested_date date')
  await sql('alter table bookings add column if not exists requested_start_time text')
  await sql('alter table bookings add column if not exists requested_duration_minutes integer')
  await sql('alter table bookings add column if not exists is_active boolean not null default true')
}

async function createBooking(formData: FormData) {
  'use server'
  await requirePermission('bookings', 'write')
  await ensureBookingColumns()

  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()
  const company = String(formData.get('company') ?? '').trim()
  const service = String(formData.get('service') ?? '').trim()
  const message = String(formData.get('message') ?? '').trim()
  const status = normalizeBookingStatus(String(formData.get('status') ?? 'new'))
  const requestedDate = String(formData.get('requestedDate') ?? '').trim()
  const requestedStartTime = String(formData.get('requestedStartTime') ?? '').trim()
  const requestedDurationMinutes = Number(formData.get('requestedDurationMinutes') ?? 0) || 0
  const isApproved = String(formData.get('isApproved') ?? 'false') === 'true'
  const isActive = String(formData.get('isActive') ?? 'true') !== 'false'

  if (!name || !email) return

  await sql(
    `insert into bookings(name, email, phone, company, service, message, source, status, is_approved, requested_date, requested_start_time, requested_duration_minutes, is_active)
     values ($1, $2, $3, $4, $5, $6, 'admin-manual', $7, $8, nullif($9, '')::date, nullif($10, ''), $11, $12)`,
    [name, email, phone || null, company || null, service || null, message || null, status, isApproved, requestedDate, requestedStartTime, requestedDurationMinutes || null, isActive]
  )

  revalidatePath('/admin/bookings')
}

async function updateBooking(formData: FormData) {
  'use server'
  await requirePermission('bookings', 'write')
  await ensureBookingColumns()

  const id = String(formData.get('id') ?? '').trim()
  if (!id) return

  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()
  const company = String(formData.get('company') ?? '').trim()
  const service = String(formData.get('service') ?? '').trim()
  const message = String(formData.get('message') ?? '').trim()
  const status = normalizeBookingStatus(String(formData.get('status') ?? 'new'))
  const requestedDate = String(formData.get('requestedDate') ?? '').trim()
  const requestedStartTime = String(formData.get('requestedStartTime') ?? '').trim()
  const requestedDurationMinutes = Number(formData.get('requestedDurationMinutes') ?? 0) || 0
  const isApproved = String(formData.get('isApproved') ?? 'false') === 'true'
  const isActive = String(formData.get('isActive') ?? 'true') !== 'false'

  await sql(
    `update bookings
     set name = $2,
         email = $3,
         phone = $4,
         company = $5,
         service = $6,
         message = $7,
         status = $8,
         requested_date = nullif($9, '')::date,
         requested_start_time = nullif($10, ''),
         requested_duration_minutes = $11,
         is_approved = $12,
         is_active = $13,
         updated_at = now()
     where id = $1::uuid`,
    [id, name || null, email || null, phone || null, company || null, service || null, message || null, status, requestedDate, requestedStartTime, requestedDurationMinutes || null, isApproved, isActive]
  )

  revalidatePath('/admin/bookings')
}

async function deleteBooking(formData: FormData) {
  'use server'
  await requirePermission('bookings', 'delete')
  const id = String(formData.get('id') ?? '').trim()
  if (!id) return
  await sql('delete from bookings where id = $1::uuid', [id])
  revalidatePath('/admin/bookings')
}

async function bulkDeleteBookings(formData: FormData) {
  'use server'
  await requirePermission('bookings', 'delete')

  const ids = String(formData.get('ids') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (ids.length === 0) return

  await sql('delete from bookings where id = any($1::uuid[])', [ids])
  revalidatePath('/admin/bookings')
}

async function bulkSetInactiveBookings(formData: FormData) {
  'use server'
  await requirePermission('bookings', 'write')

  const ids = String(formData.get('ids') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (ids.length === 0) return

  await sql('update bookings set is_active = false, updated_at = now() where id = any($1::uuid[])', [ids])
  revalidatePath('/admin/bookings')
}

async function sendBookingEmail(formData: FormData) {
  'use server'
  await requirePermission('bookings', 'write')

  const id = String(formData.get('id') ?? '').trim()
  const toEmail = String(formData.get('email') ?? '').trim()
  const senderName = String(formData.get('name') ?? '').trim()
  const subject = String(formData.get('subject') ?? 'Your PROGREX booking update').trim()
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

  revalidatePath('/admin/bookings')
}

export default async function AdminBookingsPage() {
  await requirePermission('bookings', 'read')
  await ensureBookingColumns()

  const bookings = await sql<{
    id: string
    name: string
    email: string
    phone: string | null
    company: string | null
    service: string | null
    message: string | null
    status: string
    is_approved: boolean
    is_active: boolean
    requested_date: string | null
    requested_start_time: string | null
    requested_duration_minutes: number | null
    created_at: string | null
  }>(
    `select id,
            name,
            email,
            phone,
            company,
            service,
            message,
            status,
            is_approved,
            is_active,
            case when requested_date is null then null else to_char(requested_date, 'YYYY-MM-DD') end as requested_date,
            requested_start_time,
            requested_duration_minutes,
            created_at::text
     from bookings
     order by created_at desc`
  )

  return (
    <AdminBookingsTemplateView
      bookings={bookings.map((item) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        phone: item.phone,
        company: item.company,
        service: item.service,
        message: item.message,
        status: item.status || 'new',
        isApproved: item.is_approved,
        isActive: item.is_active,
        requestedDate: item.requested_date,
        requestedStartTime: item.requested_start_time,
        requestedDurationMinutes: item.requested_duration_minutes,
        createdAt: item.created_at,
      }))}
      createBookingAction={createBooking}
      updateBookingAction={updateBooking}
      deleteBookingAction={deleteBooking}
      bulkDeleteBookingsAction={bulkDeleteBookings}
      bulkSetInactiveBookingsAction={bulkSetInactiveBookings}
      sendBookingEmailAction={sendBookingEmail}
    />
  )
}
