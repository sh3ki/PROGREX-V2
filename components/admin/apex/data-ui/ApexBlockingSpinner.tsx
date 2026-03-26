'use client'

export function ApexBlockingSpinner({ label = 'Saving...' }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />
      <div
        className="relative flex flex-col items-center gap-3 rounded-2xl border px-6 py-5"
        style={{
          borderColor: 'var(--apx-border)',
          backgroundColor: 'color-mix(in oklab, var(--apx-surface) 92%, transparent)',
        }}
      >
        <span
          className="h-10 w-10 animate-spin rounded-full border-2 border-transparent"
          style={{
            borderTopColor: 'var(--apx-primary)',
            borderRightColor: 'color-mix(in oklab, var(--apx-primary) 55%, transparent)',
            borderBottomColor: 'rgba(148, 163, 184, 0.35)',
            borderLeftColor: 'rgba(148, 163, 184, 0.15)',
          }}
        />
        <p className="text-sm font-medium apx-text">{label}</p>
      </div>
    </div>
  )
}
