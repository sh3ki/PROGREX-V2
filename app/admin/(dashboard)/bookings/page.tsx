import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/server/admin-permission'
import { sql } from '@/lib/server/db'
import { ApexButton, ApexSelect } from '@/components/admin/apex/AdminPrimitives'
import { ApexBreadcrumbs } from '@/components/admin/apex/ApexDataUi'

async function updateBookingStatus(formData: FormData) {
  'use server'
  await requirePermission('bookings', 'write')

  const id = String(formData.get('id') ?? '').trim()
  const status = String(formData.get('status') ?? 'new').trim() || 'new'
  if (!id) return

  await sql('update bookings set status = $2, updated_at = now() where id = $1::uuid', [id, status])
  revalidatePath('/admin/bookings')
}

export default async function AdminBookingsPage() {
  await requirePermission('bookings', 'read')

  await sql("alter table bookings add column if not exists is_approved boolean not null default false")
  await sql('alter table bookings add column if not exists requested_date date')
  await sql('alter table bookings add column if not exists requested_start_time text')
  await sql('alter table bookings add column if not exists requested_duration_minutes integer')

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
    requested_date: string | null
    requested_start_time: string | null
    requested_duration_minutes: number | null
    created_at: string
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
            case when requested_date is null then null else to_char(requested_date, 'YYYY-MM-DD') end as requested_date,
            requested_start_time,
            requested_duration_minutes,
            created_at::text
     from bookings
     order by created_at desc`
  )

  return (
    <div className="space-y-4">
      <ApexBreadcrumbs items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Bookings' }]} />

      <div>
        <h1 className="text-[42px] leading-none font-bold tracking-tight apx-text">Bookings</h1>
        <p className="mt-1 text-sm apx-muted">Booking requests submitted from the contact page.</p>
      </div>

      <section className="overflow-x-auto rounded-2xl border" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--apx-border)' }}>
              <th className="px-4 py-3 font-semibold apx-text">Requester</th>
              <th className="px-4 py-3 font-semibold apx-text">Service</th>
              <th className="px-4 py-3 font-semibold apx-text">Meeting Request</th>
              <th className="px-4 py-3 font-semibold apx-text">Approval</th>
              <th className="px-4 py-3 font-semibold apx-text">Status</th>
              <th className="px-4 py-3 text-right font-semibold apx-text">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((item) => (
              <tr key={item.id} className="border-b last:border-b-0" style={{ borderColor: 'var(--apx-border)' }}>
                <td className="px-4 py-3">
                  <p className="font-semibold apx-text">{item.name}</p>
                  <p className="text-xs apx-muted">{item.email}</p>
                  {item.phone ? <p className="text-xs apx-muted">{item.phone}</p> : null}
                </td>
                <td className="px-4 py-3 apx-text">{item.service || '-'}</td>
                <td className="px-4 py-3">
                  {item.requested_date && item.requested_start_time ? (
                    <div className="text-xs apx-text">
                      <p>{item.requested_date}</p>
                      <p className="apx-muted">{item.requested_start_time} • {item.requested_duration_minutes || 0} min</p>
                    </div>
                  ) : (
                    <span className="text-xs apx-muted">No meeting slot</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="inline-flex rounded-full px-2 py-1 text-xs font-semibold"
                    style={item.is_approved ? { backgroundColor: 'rgba(22,163,74,0.15)', color: '#15803d' } : { backgroundColor: 'rgba(249,115,22,0.15)', color: '#c2410c' }}
                  >
                    {item.is_approved ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td className="px-4 py-3 apx-text">{item.status}</td>
                <td className="px-4 py-3">
                  <form action={updateBookingStatus} className="flex items-center justify-end gap-2">
                    <input type="hidden" name="id" value={item.id} />
                    <ApexSelect name="status" defaultValue={item.status} className="text-xs">
                      <option value="new">new</option>
                      <option value="in-review">in-review</option>
                      <option value="scheduled">scheduled</option>
                      <option value="done">done</option>
                      <option value="rejected">rejected</option>
                    </ApexSelect>
                    <ApexButton type="submit" variant="outline">Save</ApexButton>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
