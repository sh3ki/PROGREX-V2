import { sql } from '@/lib/server/db'
import { requirePermission } from '@/lib/server/admin-permission'
import AdminApexDashboardView from '@/components/admin/AdminApexDashboardView'

export default async function AdminDashboardPage() {
  await requirePermission('dashboard', 'read')

  const [projects, blogs, systems, team, bookings, contacts, openBookings, openContacts, recentBookings, recentContacts] = await Promise.all([
    sql<{ count: string }>('select count(*)::text as count from projects'),
    sql<{ count: string }>('select count(*)::text as count from blogs'),
    sql<{ count: string }>('select count(*)::text as count from ready_made_systems'),
    sql<{ count: string }>('select count(*)::text as count from team_members where is_active = true'),
    sql<{ count: string }>('select count(*)::text as count from bookings'),
    sql<{ count: string }>('select count(*)::text as count from contact_submissions'),
    sql<{ count: string }>("select count(*)::text as count from bookings where lower(coalesce(status, 'new')) in ('new','scheduled','rescheduled') and coalesce(is_archived, false) = false"),
    sql<{ count: string }>("select count(*)::text as count from contact_submissions where lower(coalesce(status, 'new')) in ('new','in-progress') and coalesce(is_archived, false) = false"),
    sql<{ count: string }>("select count(*)::text as count from bookings where created_at >= now() - interval '7 days'"),
    sql<{ count: string }>("select count(*)::text as count from contact_submissions where created_at >= now() - interval '7 days'"),
  ])

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
    projects: Number(projects[0]?.count ?? '0'),
    blogs: Number(blogs[0]?.count ?? '0'),
    systems: Number(systems[0]?.count ?? '0'),
    users: Number(team[0]?.count ?? '0'),
    bookings: Number(bookings[0]?.count ?? '0'),
    contacts: Number(contacts[0]?.count ?? '0'),
    openBookings: Number(openBookings[0]?.count ?? '0'),
    openContacts: Number(openContacts[0]?.count ?? '0'),
    recentBookings: Number(recentBookings[0]?.count ?? '0'),
    recentContacts: Number(recentContacts[0]?.count ?? '0'),
    finance,
  }

  return <AdminApexDashboardView stats={stats} />
}
