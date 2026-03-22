'use client'

import { useEffect, useRef, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'

export function ApexColumnsToggle({
  columns,
  onToggle,
}: {
  columns: Array<{ key: string; label: string; visible: boolean }>
  onToggle: (key: string) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onDocumentClick(event: MouseEvent) {
      if (!rootRef.current) return
      if (!rootRef.current.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener('mousedown', onDocumentClick)
    return () => document.removeEventListener('mousedown', onDocumentClick)
  }, [])

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="apx-btn-outline"
        style={{ backgroundColor: 'var(--apx-surface)' }}
      >
        <SlidersHorizontal className="h-4 w-4" />
        Columns
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-52 rounded-xl border p-2" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
          {columns.map((column) => (
            <label key={column.key} className="apx-list-hover flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm apx-text transition-colors">
              <input type="checkbox" checked={column.visible} onChange={() => onToggle(column.key)} className="accent-(--apx-primary)" />
              {column.label}
            </label>
          ))}
        </div>
      ) : null}
    </div>
  )
}
