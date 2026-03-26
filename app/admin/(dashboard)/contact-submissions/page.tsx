import nodemailer from 'nodemailer'
import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/server/admin-permission'
import { sql } from '@/lib/server/db'
import { ApexButton, ApexSelect, ApexTextarea } from '@/components/admin/apex/AdminPrimitives'
import { ApexBreadcrumbs } from '@/components/admin/apex/ApexDataUi'

async function updateContactStatus(formData: FormData) {
  'use server'
  await requirePermission('bookings', 'write')
  const id = String(formData.get('id') ?? '').trim()
  const status = String(formData.get('status') ?? 'new').trim() || 'new'
  if (!id) return
  await sql('update contact_submissions set status = $2, updated_at = now() where id = $1::uuid', [id, status])
  revalidatePath('/admin/contact-submissions')
}

async function replyContact(formData: FormData) {
  'use server'
  await requirePermission('bookings', 'write')

  const id = String(formData.get('id') ?? '').trim()
  const toEmail = String(formData.get('email') ?? '').trim()
  const senderName = String(formData.get('name') ?? '').trim()
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
    subject: 'Re: Your PROGREX inquiry',
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

  const contacts = await sql<{
    id: string
    name: string
    email: string
    service: string | null
    message: string
    status: string
    admin_reply: string | null
    created_at: string
  }>(
    `select id, name, email, service, message, status, admin_reply, created_at::text
     from contact_submissions
     order by created_at desc`
  )

  return (
    <div className="space-y-4">
      <ApexBreadcrumbs items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Contact Submissions' }]} />

      <div>
        <h1 className="text-[42px] leading-none font-bold tracking-tight apx-text">Contact Submissions</h1>
        <p className="mt-1 text-sm apx-muted">Messages submitted from the website contact form.</p>
      </div>

      <section className="space-y-3 rounded-2xl border p-4" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
        {contacts.map((item) => (
          <article key={item.id} className="rounded-xl border p-4" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface-alt)' }}>
            <p className="font-semibold apx-text">{item.name} <span className="apx-muted">({item.email})</span></p>
            <p className="text-sm apx-muted">{item.service || 'General inquiry'}</p>
            <p className="mt-1 text-sm apx-text whitespace-pre-wrap">{item.message}</p>

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
          </article>
        ))}
      </section>
    </div>
  )
}
