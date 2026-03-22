'use client'

export function ApexBreadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <nav className="mb-2 flex items-center gap-2 text-sm apx-muted" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className="flex items-center gap-2">
          {item.href ? (
            <a href={item.href} className="hover:underline">{item.label}</a>
          ) : (
            <span className="font-medium apx-text">{item.label}</span>
          )}
          {index < items.length - 1 ? <span className="apx-muted">›</span> : null}
        </div>
      ))}
    </nav>
  )
}
