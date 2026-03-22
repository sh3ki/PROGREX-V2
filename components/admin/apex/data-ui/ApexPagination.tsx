'use client'

import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ApexDropdown } from './ApexDropdown'

export function ApexPagination({
  page,
  totalPages,
  totalItems,
  perPage,
  rowsOptions,
  onPerPageChange,
  onPageChange,
}: {
  page: number
  totalPages: number
  totalItems: number
  perPage: number
  rowsOptions?: number[]
  onPerPageChange?: (value: number) => void
  onPageChange: (next: number) => void
}) {
  const start = totalItems === 0 ? 0 : (page - 1) * perPage + 1
  const end = Math.min(page * perPage, totalItems)

  const pages = useMemo(() => {
    const items: number[] = []
    for (let i = 1; i <= totalPages; i += 1) items.push(i)
    return items
  }, [totalPages])

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
      <p className="text-sm apx-muted">
        Showing {start}-{end} of {totalItems}
      </p>
      <div className="inline-flex items-center gap-2">
        {onPerPageChange ? (
          <div className="inline-flex items-center gap-2">
            <span className="text-sm apx-muted">Rows</span>
            <div className="w-23">
              <ApexDropdown
                value={String(perPage)}
                onChange={(value) => onPerPageChange(Number(value))}
                options={(rowsOptions ?? [5, 10, 20, 50]).map((option) => ({ value: String(option), label: String(option) }))}
              />
            </div>
          </div>
        ) : null}

        <div className="inline-flex items-center gap-1">
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(Math.max(1, page - 1))}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border disabled:opacity-40"
            style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {pages.map((num) => (
            <button
              key={num}
              onClick={() => onPageChange(num)}
              className="h-8 min-w-8 rounded-lg border px-2 text-sm font-medium"
              style={
                num === page
                  ? { borderColor: 'var(--apx-primary)', backgroundColor: 'var(--apx-primary)', color: '#fff' }
                  : { borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)', color: 'var(--apx-text)' }
              }
            >
              {num}
            </button>
          ))}

          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border disabled:opacity-40"
            style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
