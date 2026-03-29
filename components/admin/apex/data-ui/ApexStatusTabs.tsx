'use client'

export function ApexStatusTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: Array<{ key: string; label: string; count?: number; indicatorColor?: string }>
  active: string
  onChange: (key: string) => void
}) {
  return (
    <div className="inline-flex rounded-xl p-1" style={{ backgroundColor: 'var(--apx-surface-alt)', border: '1px solid var(--apx-border)' }}>
      {tabs.map((tab) => {
        const isActive = active === tab.key
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
            style={
              isActive
                ? { backgroundColor: 'var(--apx-primary-soft)', color: 'var(--apx-primary)', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }
                : { color: 'var(--apx-muted)' }
            }
          >
            {tab.indicatorColor ? (
              <span
                aria-hidden="true"
                className="me-1 inline-block h-1.5 w-1.5 rounded-full align-middle"
                style={{ backgroundColor: tab.indicatorColor }}
              />
            ) : null}
            {tab.label}
            {typeof tab.count === 'number' ? <span className="ms-1 opacity-80">{tab.count}</span> : null}
          </button>
        )
      })}
    </div>
  )
}
