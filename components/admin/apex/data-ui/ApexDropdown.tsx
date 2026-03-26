'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'

type Option = { value: string; label: string; color?: string }

export function ApexDropdown({
  value,
  options,
  placeholder,
  onChange,
  disabled = false,
}: {
  value: string
  options: Option[]
  placeholder?: string
  onChange: (value: string) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [openUp, setOpenUp] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  const computeDirection = useCallback(() => {
    if (!rootRef.current) return
    const rect = rootRef.current.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const estimatedMenuHeight = Math.min(options.length * 36 + 12, 220)
    const spaceBelow = viewportHeight - rect.bottom
    const spaceAbove = rect.top
    setOpenUp(spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow)
  }, [options.length])

  useEffect(() => {
    function onDocumentClick(event: MouseEvent) {
      if (!rootRef.current) return
      if (!rootRef.current.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener('mousedown', onDocumentClick)
    return () => document.removeEventListener('mousedown', onDocumentClick)
  }, [])

  useEffect(() => {
    if (!open) return

    function onResizeOrScroll() {
      computeDirection()
    }
    window.addEventListener('resize', onResizeOrScroll)
    window.addEventListener('scroll', onResizeOrScroll, true)
    return () => {
      window.removeEventListener('resize', onResizeOrScroll)
      window.removeEventListener('scroll', onResizeOrScroll, true)
    }
  }, [computeDirection, open])

  const selected = options.find((option) => option.value === value)

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!open) computeDirection()
          setOpen((prev) => !prev)
        }}
        className="flex h-10 w-full items-center justify-between rounded-xl border px-3 text-sm transition disabled:opacity-50"
        style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface-alt)', color: 'var(--apx-text)' }}
      >
        <span className={['inline-flex items-center gap-2', selected ? 'apx-text' : 'apx-muted'].join(' ')}>
          {selected?.color ? <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: selected.color }} /> : null}
          {selected?.label ?? placeholder ?? 'Select option'}
        </span>
        <ChevronDown className={['h-4 w-4 transition-transform', open ? 'rotate-180' : 'rotate-0'].join(' ')} />
      </button>

      {open ? (
        <div
          className={[
            'absolute left-0 right-0 z-50 overflow-hidden rounded-xl border py-1 shadow-xl',
            openUp ? 'bottom-full mb-2' : 'mt-2',
          ].join(' ')}
          style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}
        >
          {options.map((option) => {
            const isSelected = option.value === value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
                className="apx-dropdown-option flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors"
                style={
                  isSelected
                    ? { backgroundColor: 'var(--apx-primary-soft)', color: 'var(--apx-primary)' }
                    : { color: 'var(--apx-text)' }
                }
              >
                <span className="inline-flex items-center gap-2">
                  {option.color ? <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: option.color }} /> : null}
                  {option.label}
                </span>
                {isSelected ? <Check className="h-4 w-4" /> : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
