import { Activity, BriefcaseBusiness, CircleDollarSign, ClipboardCheck, FolderKanban, Inbox, Newspaper, Sparkles, Users } from 'lucide-react'

type OverviewStats = {
  projects: number
  users: number
  systems: number
  bookings: number
  blogs: number
  contacts: number
  openBookings: number
  openContacts: number
  recentBookings: number
  recentContacts: number
  finance: {
    totalPayments: number
    paidCount: number
    pendingCount: number
    last30Amount: number
  }
}

function formatPeso(value: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(value)
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(100, Math.round(value)))
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  tone,
}: {
  title: string
  value: string
  subtitle: string
  icon: React.ReactNode
  tone: string
}) {
  return (
    <div
      className="rounded-2xl border p-4"
      style={{
        borderColor: 'var(--apx-border)',
        backgroundColor: 'color-mix(in oklab, var(--apx-surface) 90%, transparent)',
      }}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide apx-muted">{title}</p>
          <p className="mt-1 text-2xl font-bold leading-none apx-text">{value}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: tone }}>
          {icon}
        </div>
      </div>
      <p className="text-xs apx-muted">{subtitle}</p>
    </div>
  )
}

export default function AdminApexDashboardView({ stats }: { stats: OverviewStats }) {
  const openWorkload = stats.openBookings + stats.openContacts
  const weeklyLeads = stats.recentBookings + stats.recentContacts
  const teamCapacity = clampPercent((openWorkload / Math.max(stats.users * 6, 1)) * 100)
  const paymentCompletion = clampPercent((stats.finance.paidCount / Math.max(stats.finance.paidCount + stats.finance.pendingCount, 1)) * 100)

  const dataGroups = [
    { label: 'Projects', value: stats.projects, icon: <FolderKanban className="h-4 w-4 text-slate-900" /> },
    { label: 'Blogs', value: stats.blogs, icon: <Newspaper className="h-4 w-4 text-slate-900" /> },
    { label: 'Systems', value: stats.systems, icon: <BriefcaseBusiness className="h-4 w-4 text-slate-900" /> },
    { label: 'Team', value: stats.users, icon: <Users className="h-4 w-4 text-slate-900" /> },
  ]

  return (
    <div className="space-y-5">
      <section
        className="overflow-hidden rounded-3xl border p-5 sm:p-6"
        style={{
          borderColor: 'var(--apx-border)',
          background:
            'radial-gradient(circle at 8% 16%, color-mix(in oklab, var(--apx-primary) 22%, transparent) 0%, transparent 38%), radial-gradient(circle at 94% 86%, color-mix(in oklab, var(--apx-primary) 18%, transparent) 0%, transparent 36%), color-mix(in oklab, var(--apx-surface) 92%, transparent)',
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight apx-text sm:text-4xl">Dashboard Command Center</h1>
            <p className="mt-2 max-w-2xl text-sm apx-muted">
              Live operations snapshot across bookings, contact leads, projects, and payments.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium" style={{ borderColor: 'var(--apx-border)' }}>
            <Sparkles className="h-3.5 w-3.5" style={{ color: 'var(--apx-primary)' }} />
            <span className="apx-text">Weekly leads: {weeklyLeads}</span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Open Workload"
          value={String(openWorkload)}
          subtitle={`${stats.openBookings} booking(s) and ${stats.openContacts} contact inquiry(ies) in queue.`}
          icon={<Activity className="h-4 w-4 text-slate-900" />}
          tone="#c6f1ff"
        />
        <MetricCard
          title="Leads (Last 7 Days)"
          value={String(weeklyLeads)}
          subtitle={`${stats.recentBookings} booking lead(s), ${stats.recentContacts} contact lead(s).`}
          icon={<Inbox className="h-4 w-4 text-slate-900" />}
          tone="#ffecc7"
        />
        <MetricCard
          title="Team Capacity"
          value={`${teamCapacity}%`}
          subtitle={`Based on ${stats.users} active team member(s) and current queue.`}
          icon={<ClipboardCheck className="h-4 w-4 text-slate-900" />}
          tone="#d6f8df"
        />
        <MetricCard
          title="Payments (30 Days)"
          value={formatPeso(stats.finance.last30Amount)}
          subtitle={`${stats.finance.pendingCount} pending or partial, ${stats.finance.paidCount} paid.`}
          icon={<CircleDollarSign className="h-4 w-4 text-slate-900" />}
          tone="#ebddff"
        />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div
          className="xl:col-span-7 rounded-2xl border p-5"
          style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}
        >
          <h2 className="text-base font-semibold apx-text">Operational Mix</h2>
          <p className="mt-1 text-xs apx-muted">Key system entities currently available in your workspace.</p>
          <div className="mt-5 space-y-4">
            {dataGroups.map((item) => {
              const total = Math.max(stats.projects + stats.blogs + stats.systems + stats.users, 1)
              const width = clampPercent((item.value / total) * 100)
              return (
                <div key={item.label}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100">{item.icon}</span>
                      <span className="apx-text">{item.label}</span>
                    </div>
                    <span className="font-semibold apx-text">{item.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: 'color-mix(in oklab, var(--apx-border) 65%, transparent)' }}>
                    <div className="h-full rounded-full" style={{ width: `${width}%`, backgroundColor: 'var(--apx-primary)' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div
          className="xl:col-span-5 rounded-2xl border p-5"
          style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}
        >
          <h2 className="text-base font-semibold apx-text">Finance Health</h2>
          <p className="mt-1 text-xs apx-muted">Payments overview from your payment tracker.</p>

          <div className="mt-5 rounded-2xl border p-4" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'color-mix(in oklab, var(--apx-surface-alt) 86%, transparent)' }}>
            <p className="text-xs uppercase tracking-wide apx-muted">Total Recorded Payments</p>
            <p className="mt-1 text-2xl font-bold apx-text">{formatPeso(stats.finance.totalPayments)}</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full" style={{ backgroundColor: 'color-mix(in oklab, var(--apx-border) 65%, transparent)' }}>
              <div className="h-full rounded-full" style={{ width: `${paymentCompletion}%`, backgroundColor: 'var(--apx-primary)' }} />
            </div>
            <p className="mt-2 text-xs apx-muted">Collection completion: {paymentCompletion}%</p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border p-3" style={{ borderColor: 'var(--apx-border)' }}>
              <p className="text-xs uppercase tracking-wide apx-muted">Paid</p>
              <p className="mt-1 text-xl font-semibold apx-text">{stats.finance.paidCount}</p>
            </div>
            <div className="rounded-xl border p-3" style={{ borderColor: 'var(--apx-border)' }}>
              <p className="text-xs uppercase tracking-wide apx-muted">Pending / Partial</p>
              <p className="mt-1 text-xl font-semibold apx-text">{stats.finance.pendingCount}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
