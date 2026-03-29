'use client'

import { Download } from 'lucide-react'

export function ApexExportButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="apx-btn-outline"
      style={{ backgroundColor: 'var(--apx-surface)' }}
    >
      <Download className="h-4 w-4" />
      Export
    </button>
  )
}
