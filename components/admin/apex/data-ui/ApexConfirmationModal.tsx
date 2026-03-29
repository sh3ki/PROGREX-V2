'use client'

import { ApexModal } from './ApexModal'
import { ApexButton } from '@/components/admin/apex/AdminPrimitives'

export function ApexConfirmationModal({
  open,
  title,
  description,
  confirmLabel,
  tone = 'danger',
  pending = false,
  onConfirm,
  onClose,
}: {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  tone?: 'danger' | 'primary'
  pending?: boolean
  onConfirm: () => void | Promise<void>
  onClose: () => void
}) {
  return (
    <ApexModal open={open} title={title} subtitle={description} onClose={onClose} size="sm" layer="top">
      <div className="flex justify-end gap-2 pt-2">
        <ApexButton type="button" variant="outline" onClick={onClose} disabled={pending}>Cancel</ApexButton>
        <ApexButton type="button" variant={tone === 'danger' ? 'danger' : 'primary'} onClick={() => void onConfirm()} disabled={pending}>
          {pending ? 'Please wait...' : confirmLabel}
        </ApexButton>
      </div>
    </ApexModal>
  )
}
