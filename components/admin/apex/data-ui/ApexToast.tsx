'use client'

import { X } from 'lucide-react'

export type ApexToast = { id: number; message: string; tone?: 'default' | 'success' | 'danger' }

export function ApexToastStack({ toasts, onRemove }: { toasts: ApexToast[]; onRemove: (id: number) => void }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed right-4 top-20 z-95 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="rounded-xl border px-3 py-2 text-sm shadow-lg"
          style={{ width: `${Math.min(460, Math.max(250, 160 + toast.message.length * 7))}px` }}
        >
          <div
            className="rounded-lg px-2 py-1"
          style={
            toast.tone === 'success'
              ? { borderColor: 'rgba(16,185,129,0.45)', backgroundColor: 'rgba(16,185,129,0.12)', color: '#065f46' }
              : toast.tone === 'danger'
              ? { borderColor: 'rgba(244,63,94,0.45)', backgroundColor: 'rgba(244,63,94,0.12)', color: '#9f1239' }
              : { borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)', color: 'var(--apx-text)' }
          }
        >
          <div className="flex items-center justify-between gap-3">
            <span>{toast.message}</span>
            <button onClick={() => onRemove(toast.id)} aria-label="Dismiss notification">
              <X className="h-4 w-4" />
            </button>
          </div>
          </div>
        </div>
      ))}
    </div>
  )
}
