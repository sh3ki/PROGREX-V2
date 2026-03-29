'use client'

import { Search } from 'lucide-react'

export function ApexSearchField({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label
      className="flex w-full items-center gap-2 rounded-xl border px-3 py-2"
      style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}
    >
      <Search className="h-4 w-4 apx-muted" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? 'Search...'}
        className="w-full bg-transparent text-sm outline-none apx-text"
      />
    </label>
  )
}
