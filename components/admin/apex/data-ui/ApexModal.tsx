'use client'

import type { ReactNode } from 'react'
import { X } from 'lucide-react'

const APX_MODAL_CONTAINER_STYLE = {
  borderColor: 'var(--apx-border)',
  backgroundColor: 'color-mix(in oklab, var(--apx-surface) 93%, transparent)',
  backdropFilter: 'blur(8px)',
} as const

export function ApexModal({
  open,
  title,
  subtitle,
  onClose,
  size = 'lg',
  layer = 'base',
  children,
}: {
  open: boolean
  title: string
  subtitle?: string
  onClose: () => void
  size?: 'sm' | 'md' | 'lg' | 'xl'
  layer?: 'base' | 'top'
  children: ReactNode
}) {
  if (!open) return null

  const maxWidthClass =
    size === 'sm' ? 'max-w-md' : size === 'md' ? 'max-w-xl' : size === 'xl' ? 'max-w-5xl' : 'max-w-2xl'
  const layerClass = layer === 'top' ? 'z-[120]' : 'z-90'

  return (
    <div className={['fixed inset-0 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]', layerClass].join(' ')}>
      <div className={['flex max-h-[90vh] w-full flex-col rounded-2xl border p-4 shadow-2xl', maxWidthClass].join(' ')} style={APX_MODAL_CONTAINER_STYLE}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold apx-text">{title}</h3>
            {subtitle ? <p className="mt-1 text-sm apx-muted">{subtitle}</p> : null}
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 apx-muted hover:apx-text" aria-label="Close modal">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto pt-2">{children}</div>
      </div>
    </div>
  )
}
