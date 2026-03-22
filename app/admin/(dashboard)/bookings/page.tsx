import nodemailer from 'nodemailer'
import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/server/admin-permission'
import { sql } from '@/lib/server/db'
import {
  ApexButton,
  ApexCard,
  ApexCardBody,
  ApexCardHeader,
  ApexPageHeader,
  ApexSelect,
  ApexTextarea,
} from '@/components/admin/apex/AdminPrimitives'

async function updateBookingStatus(formData: FormData) {
  'use server'
  await requirePermission('bookings', 'write')
  const id = String(formData.get('id') ?? '')
  const status = String(formData.get('status') ?? 'new')
  await sql('update bookings set status = $2, updated_at = now() where id = $1', [id, status])
  revalidatePath('/admin/bookings')
}

async function updateContactStatus(formData: FormData) {
  'use server'
  await requirePermission('bookings', 'write')
  const id = String(formData.get('id') ?? '')
  const status = String(formData.get('status') ?? 'new')
  await sql('update contact_submissions set status = $2, updated_at = now() where id = $1', [id, status])
  revalidatePath('/admin/bookings')
}

async function replyContact(formData: FormData) {
  'use server'
  await requirePermission('bookings', 'write')

  const id = String(formData.get('id') ?? '')
  const toEmail = String(formData.get('email') ?? '')
  const senderName = String(formData.get('name') ?? '')
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
    subject: `Re: Your PROGREX inquiry`,
    html: `<p>Hello ${senderName || 'there'},</p><p>${reply.replace(/\n/g, '<br/>')}</p><p>Best regards,<br/>PROGREX Team</p>`,
  })

  await sql(
    `update contact_submissions
     set admin_reply = $2, status = 'replied', replied_at = now(), updated_at = now()
     where id = $1`,
    [id, reply]
  )

  revalidatePath('/admin/bookings')
}

export default async function AdminBookingsPage() {
  await requirePermission('bookings', 'read')

  const [bookings, contacts] = await Promise.all([
    sql<{ id: string; name: string; email: string; phone: string; service: string; message: string; status: string; created_at: string }>(
      `select id, name, email, phone, service, message, status, created_at::text
       from bookings
       order by created_at desc`
    ),
    sql<{ id: string; name: string; email: string; service: string; message: string; status: string; admin_reply: string; created_at: string }>(
      `select id, name, email, service, message, status, admin_reply, created_at::text
       from contact_submissions
       order by created_at desc`
    ),
  ])

  return (
    <div className="space-y-5">
      <ApexPageHeader title="Orders & Inquiries" subtitle="Track booking requests and send contact replies." />

      <ApexCard>
        <ApexCardHeader title="Bookings" subtitle={`${bookings.length} entry(ies)`} />
        <ApexCardBody className="space-y-3">
        {bookings.map((item) => (
          <div key={item.id} className="rounded-xl border p-4" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface-alt)' }}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold apx-text">{item.name} <span className="apx-muted">({item.email})</span></p>
                <p className="text-sm apx-muted">{item.service || 'General inquiry'}</p>
                <p className="text-sm apx-muted">{item.message}</p>
              </div>
              <form action={updateBookingStatus} className="flex gap-2">
                <input type="hidden" name="id" value={item.id} />
                <ApexSelect name="status" defaultValue={item.status} className="text-xs">
                  <option value="new">new</option>
                  <option value="scheduled">scheduled</option>
                  <option value="done">done</option>
                </ApexSelect>
                <ApexButton variant="outline" type="submit">Save</ApexButton>
              </form>
            </div>
          </div>
        ))}
        </ApexCardBody>
      </ApexCard>

      <ApexCard>
        <ApexCardHeader title="Contact Submissions" subtitle={`${contacts.length} message(s)`} />
        <ApexCardBody className="space-y-3">
        {contacts.map((item) => (
          <div key={item.id} className="rounded-xl border p-4" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface-alt)' }}>
            <p className="font-semibold apx-text">{item.name} <span className="apx-muted">({item.email})</span></p>
            <p className="text-sm apx-muted">{item.service || 'General inquiry'}</p>
            <p className="text-sm apx-muted">{item.message}</p>

            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <form action={updateContactStatus} className="flex gap-2">
                <input type="hidden" name="id" value={item.id} />
                <ApexSelect name="status" defaultValue={item.status} className="text-xs">
                  <option value="new">new</option>
                  <option value="in-progress">in-progress</option>
                  <option value="replied">replied</option>
                </ApexSelect>
                <ApexButton variant="outline" type="submit">Save Status</ApexButton>
              </form>

              <form action={replyContact} className="space-y-2">
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="email" value={item.email} />
                <input type="hidden" name="name" value={item.name} />
                <ApexTextarea name="reply" rows={3} defaultValue={item.admin_reply ?? ''} placeholder="Write email reply..." className="text-xs" />
                <ApexButton type="submit">Send Reply Email</ApexButton>
              </form>
            </div>
          </div>
        ))}
        </ApexCardBody>
      </ApexCard>
    </div>
  )
}
