'use client'

import { Check } from 'lucide-react'

export function ApexCheckbox({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean
  onChange: () => void
  ariaLabel?: string
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-label={ariaLabel}
      aria-pressed={checked}
      className="inline-flex h-4 w-4 items-center justify-center rounded border transition-all duration-150"
      style={
        checked
          ? { borderColor: 'var(--apx-primary)', backgroundColor: 'var(--apx-primary)', color: '#fff' }
          : { borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)', color: 'transparent' }
      }
    >
      <Check className="h-3 w-3" />
    </button>
  )
}
