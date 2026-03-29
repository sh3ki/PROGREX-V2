'use client'

import { X } from 'lucide-react'

export type ApexToast = { id: number; message: string; tone?: 'default' | 'success' | 'danger' }

export function ApexToastStack({ toasts, onRemove }: { toasts: ApexToast[]; onRemove: (id: number) => void }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed right-2 top-2 z-120 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="rounded-xl px-4 py-3 text-sm shadow-xl"
          style={{ width: `${Math.min(460, Math.max(250, 160 + toast.message.length * 7))}px` }}
        >
          <div
            className="rounded-lg p-3"
          style={
            toast.tone === 'success'
              ? { backgroundColor: '#052e26', color: '#6ee7b7' }
              : toast.tone === 'danger'
              ? { backgroundColor: '#3b0a18', color: '#fda4af' }
              : { backgroundColor: '#0f172a', color: '#e2e8f0' }
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
