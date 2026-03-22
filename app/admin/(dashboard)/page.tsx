import { sql } from '@/lib/server/db'
import { requirePermission } from '@/lib/server/admin-permission'
import AdminApexDashboardView from '@/components/admin/AdminApexDashboardView'

export default async function AdminDashboardPage() {
  await requirePermission('dashboard', 'read')

  const [projects, blogs, systems, team, bookings, contacts] = await Promise.all([
    sql<{ count: string }>('select count(*)::text as count from projects'),
    sql<{ count: string }>('select count(*)::text as count from blogs'),
    sql<{ count: string }>('select count(*)::text as count from ready_made_systems'),
    sql<{ count: string }>('select count(*)::text as count from team_members where is_active = true'),
    sql<{ count: string }>('select count(*)::text as count from bookings'),
    sql<{ count: string }>('select count(*)::text as count from contact_submissions'),
  ])

  const stats = {
    projects: Number(projects[0]?.count ?? '0'),
    blogs: Number(blogs[0]?.count ?? '0'),
    systems: Number(systems[0]?.count ?? '0'),
    users: Number(team[0]?.count ?? '0'),
    bookings: Number(bookings[0]?.count ?? '0'),
    contacts: Number(contacts[0]?.count ?? '0'),
  }

  return <AdminApexDashboardView stats={stats} />
}
