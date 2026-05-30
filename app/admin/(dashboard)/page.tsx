import { sql } from '@/lib/server/db'
import { requirePermission } from '@/lib/server/admin-permission'
import AdminApexDashboardView from '@/components/admin/AdminApexDashboardView'

export default async function AdminDashboardPage() {
  await requirePermission('dashboard', 'read')

  const [counts] = await sql<{
    projects: number; blogs: number; systems: number; team: number
    bookings: number; contacts: number; open_bookings: number; open_contacts: number
    recent_bookings: number; recent_contacts: number
  }>(`select
    (select count(*) from projects)::int as projects,
    (select count(*) from blogs)::int as blogs,
    (select count(*) from ready_made_systems)::int as systems,
    (select count(*) from team_members where is_active = true)::int as team,
    (select count(*) from bookings)::int as bookings,
    (select count(*) from contact_submissions)::int as contacts,
    (select count(*) from bookings where lower(coalesce(status,'new')) in ('new','scheduled','rescheduled') and coalesce(is_archived,false) = false)::int as open_bookings,
    (select count(*) from contact_submissions where lower(coalesce(status,'new')) in ('new','in-progress') and coalesce(is_archived,false) = false)::int as open_contacts,
    (select count(*) from bookings where created_at >= now() - interval '7 days')::int as recent_bookings,
    (select count(*) from contact_submissions where created_at >= now() - interval '7 days')::int as recent_contacts
  `)

  const paymentsTable = await sql<{ table_name: string | null }>("select to_regclass('public.payments')::text as table_name")

  let finance = {
    totalPayments: 0,
    paidCount: 0,
    pendingCount: 0,
    last30Amount: 0,
  }

  if (paymentsTable[0]?.table_name) {
    const [totals] = await Promise.all([
      sql<{
        total_amount: string
        paid_count: string
        pending_count: string
        last_30_amount: string
      }>(
        `select
           coalesce(sum(amount), 0)::text as total_amount,
           count(*) filter (where lower(coalesce(status, 'pending')) = 'paid')::text as paid_count,
           count(*) filter (where lower(coalesce(status, 'pending')) in ('pending', 'partial'))::text as pending_count,
           coalesce(sum(amount) filter (where payment_date >= current_date - interval '30 days'), 0)::text as last_30_amount
         from payments`
      ),
    ])

    finance = {
      totalPayments: Number(totals[0]?.total_amount ?? '0'),
      paidCount: Number(totals[0]?.paid_count ?? '0'),
      pendingCount: Number(totals[0]?.pending_count ?? '0'),
      last30Amount: Number(totals[0]?.last_30_amount ?? '0'),
    }
  }

  const stats = {
    projects: counts?.projects ?? 0,
    blogs: counts?.blogs ?? 0,
    systems: counts?.systems ?? 0,
    users: counts?.team ?? 0,
    bookings: counts?.bookings ?? 0,
    contacts: counts?.contacts ?? 0,
    openBookings: counts?.open_bookings ?? 0,
    openContacts: counts?.open_contacts ?? 0,
    recentBookings: counts?.recent_bookings ?? 0,
    recentContacts: counts?.recent_contacts ?? 0,
    finance,
  }

  return <AdminApexDashboardView stats={stats} />
}
