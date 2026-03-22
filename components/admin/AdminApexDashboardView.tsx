type OverviewStats = {
  projects: number
  users: number
  systems: number
  bookings: number
  blogs: number
  contacts: number
}

type SparklineProps = {
  stroke: string
  fill: string
  d: string
}

function Sparkline({ stroke, fill, d }: SparklineProps) {
  return (
    <div className="h-12 w-full">
      <svg viewBox="0 0 430 48" className="h-12 w-full" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id={fill} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.22" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${d} L430,48 L0,48 Z`} fill={`url(#${fill})`} />
        <path d={d} fill="none" stroke={stroke} strokeWidth="2" />
      </svg>
    </div>
  )
}

export default function AdminApexDashboardView({ stats }: { stats: OverviewStats }) {
  const totalRevenue = (stats.projects * 620 + stats.systems * 740 + stats.bookings * 80).toLocaleString()
  const activeUsers = (stats.users * 13 + stats.contacts * 7 + 2400).toLocaleString()
  const totalOrders = (stats.bookings + stats.projects + stats.systems + stats.blogs + 1200).toLocaleString()
  const pageViews = `${Math.max(220, stats.contacts * 2 + stats.users + stats.projects)}K`

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Welcome back, Aigars. Here&apos;s what&apos;s happening with your business today.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-[#f2c3ab] hover:shadow-md">
          <div className="p-5 pb-0">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-500">Total Revenue</p>
                <p className="text-[38px] leading-none font-bold tracking-tight text-slate-900">${totalRevenue}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-emerald-600">+12.5%</span>
                  <span className="text-xs text-slate-500">vs last month</span>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff1e8] text-lg text-[#d8510b]">$</div>
            </div>
          </div>
          <Sparkline
            stroke="#d8510b"
            fill="gradient-revenue"
            d="M0,27 C38,16 67,37 98,26 C131,14 160,31 195,21 C225,12 259,26 292,18 C326,10 355,22 386,15 C402,11 417,9 430,8"
          />
        </div>

        <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-[#9adbd7] hover:shadow-md">
          <div className="p-5 pb-0">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-500">Active Users</p>
                <p className="text-[38px] leading-none font-bold tracking-tight text-slate-900">{activeUsers}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-emerald-600">+8.2%</span>
                  <span className="text-xs text-slate-500">vs last month</span>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9f8f7] text-[#12939a]">👥</div>
            </div>
          </div>
          <Sparkline
            stroke="#12939a"
            fill="gradient-users"
            d="M0,28 C26,20 52,21 78,24 C104,27 129,17 156,20 C180,23 208,12 234,17 C260,22 286,10 312,15 C338,20 364,11 390,13 C406,14 420,10 430,7"
          />
        </div>

        <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-[#b6d8f9] hover:shadow-md">
          <div className="p-5 pb-0">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-500">Total Orders</p>
                <p className="text-[38px] leading-none font-bold tracking-tight text-slate-900">{totalOrders}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-rose-600">-3.1%</span>
                  <span className="text-xs text-slate-500">vs last month</span>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf4ff] text-[#246ad5]">🛒</div>
            </div>
          </div>
          <Sparkline
            stroke="#246ad5"
            fill="gradient-orders"
            d="M0,13 C32,9 57,2 84,4 C112,7 138,17 166,17 C194,17 221,11 250,17 C280,22 306,17 334,21 C358,25 386,15 410,17 C420,17 426,18 430,20"
          />
        </div>

        <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-[#f6d38f] hover:shadow-md">
          <div className="p-5 pb-0">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-500">Page Views</p>
                <p className="text-[38px] leading-none font-bold tracking-tight text-slate-900">{pageViews}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-emerald-600">+24.7%</span>
                  <span className="text-xs text-slate-500">vs last month</span>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff6e5] text-[#cd8a03]">◉</div>
            </div>
          </div>
          <Sparkline
            stroke="#cd8a03"
            fill="gradient-views"
            d="M0,27 C34,25 65,27 98,24 C131,21 162,23 195,21 C226,18 258,17 292,15 C322,14 354,12 386,9 C404,8 418,7 430,6"
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="col-span-full rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-8">
          <div className="flex items-center justify-between px-6 pt-6 pb-2">
            <div>
              <div className="text-base font-semibold text-slate-900">Overview</div>
              <p className="mt-0.5 text-xs text-slate-500">Monthly performance for the current year</p>
            </div>
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-0.5 text-xs">
              <button className="rounded-lg bg-white px-3 py-1.5 font-medium text-slate-900 shadow-sm">Revenue</button>
              <button className="rounded-lg px-3 py-1.5 font-medium text-slate-500">Orders</button>
              <button className="rounded-lg px-3 py-1.5 font-medium text-slate-500">Profit</button>
            </div>
          </div>
          <div className="px-6 pb-6 pt-4">
            <div className="h-80 w-full rounded-xl bg-[#fffaf7] p-4">
              <svg viewBox="0 0 860 280" className="h-full w-full" preserveAspectRatio="none" aria-hidden="true">
                <line x1="0" y1="260" x2="860" y2="260" stroke="#d6dce6" strokeDasharray="4 6" />
                <line x1="0" y1="195" x2="860" y2="195" stroke="#d6dce6" strokeDasharray="4 6" />
                <line x1="0" y1="130" x2="860" y2="130" stroke="#d6dce6" strokeDasharray="4 6" />
                <line x1="0" y1="65" x2="860" y2="65" stroke="#d6dce6" strokeDasharray="4 6" />
                <line x1="0" y1="10" x2="860" y2="10" stroke="#d6dce6" strokeDasharray="4 6" />

                <defs>
                  <linearGradient id="main-overview" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d8510b" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#d8510b" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,195 C70,165 135,190 205,150 C270,112 336,125 405,140 C468,155 535,90 604,88 C668,86 734,74 860,36 L860,260 L0,260 Z" fill="url(#main-overview)" />
                <path d="M0,195 C70,165 135,190 205,150 C270,112 336,125 405,140 C468,155 535,90 604,88 C668,86 734,74 860,36" fill="none" stroke="#d8510b" strokeWidth="3" />
              </svg>
            </div>
          </div>
        </div>

        <div className="col-span-full flex flex-col gap-4 xl:col-span-4">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="px-6 pb-2 pt-6">
              <div className="text-base font-semibold text-slate-900">Traffic Sources</div>
              <p className="text-xs text-slate-500">Where your visitors come from</p>
            </div>
            <div className="px-6 pb-6">
              <div className="flex items-center gap-4">
                <div className="relative h-36 w-36 shrink-0 rounded-full" style={{ background: 'conic-gradient(#d8510b 0 35%, #12939a 35% 63%, #246ad5 63% 85%, #9a59c6 85% 100%)' }}>
                  <div className="absolute inset-5.5 rounded-full bg-white" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-slate-900">{pageViews}</span>
                    <span className="text-[10px] text-slate-500">Visits</span>
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#d8510b]" /><span className="text-slate-500">Direct</span></div>
                    <span className="font-semibold text-slate-900">35%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#12939a]" /><span className="text-slate-500">Organic</span></div>
                    <span className="font-semibold text-slate-900">28%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#246ad5]" /><span className="text-slate-500">Referral</span></div>
                    <span className="font-semibold text-slate-900">22%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#9a59c6]" /><span className="text-slate-500">Social</span></div>
                    <span className="font-semibold text-slate-900">15%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="px-6 pb-2 pt-6">
              <div className="text-base font-semibold text-slate-900">Monthly Goals</div>
              <p className="text-xs text-slate-500">Track progress toward targets</p>
            </div>
            <div className="space-y-5 px-6 pb-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-900">Monthly Revenue</span>
                  <span className="text-slate-500">88%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#ffe9de]"><div className="h-full w-[88%] rounded-full bg-[#d8510b]" /></div>
                <div className="flex items-center justify-between text-[11px] text-slate-500"><span>{totalRevenue}</span><span>Target: 55,000</span></div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-900">New Customers</span>
                  <span className="text-slate-500">85%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#e4f5f4]"><div className="h-full w-[85%] rounded-full bg-[#12939a]" /></div>
                <div className="flex items-center justify-between text-[11px] text-slate-500"><span>{activeUsers}</span><span>Target: 3,500</span></div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-900">Conversion Rate</span>
                  <span className="text-slate-500">76%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#e7eefb]"><div className="h-full w-[76%] rounded-full bg-[#246ad5]" /></div>
                <div className="flex items-center justify-between text-[11px] text-slate-500"><span>3.8</span><span>Target: 5</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
