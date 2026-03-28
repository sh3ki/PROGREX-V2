import type { ReactNode } from 'react'

export function ApexPageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight apx-text">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm apx-muted">{subtitle}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  )
}

export function ApexCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`apx-card ${className}`.trim()}>{children}</div>
}

export function ApexCardHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 pb-3">
      <div>
        <h2 className="text-base font-semibold apx-text">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-xs apx-muted">{subtitle}</p> : null}
      </div>
      {right ? <div>{right}</div> : null}
    </div>
  )
}

export function ApexCardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`px-5 pb-5 ${className}`.trim()}>{children}</div>
}

export function ApexFormGrid({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`grid gap-3 md:grid-cols-2 ${className}`.trim()}>{children}</div>
}

export function ApexInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`apx-input ${props.className ?? ''}`.trim()} />
}

export function ApexDateInput(props: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  return <ApexInput {...props} type="date" />
}

export function ApexTimeInput(props: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  return <ApexInput {...props} type="time" />
}

export function ApexTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`apx-textarea ${props.className ?? ''}`.trim()} />
}

export function ApexSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`apx-select ${props.className ?? ''}`.trim()} />
}

export function ApexButton({ variant = 'primary', className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'danger' }) {
  const variantClass = variant === 'primary' ? 'apx-btn-primary' : variant === 'danger' ? 'apx-btn-danger' : 'apx-btn-outline'
  return <button {...props} className={`${variantClass} ${className}`.trim()} />
}

export function ApexTable({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-x-auto ${className}`.trim()}>
      <table className="w-full text-left text-sm apx-text">{children}</table>
    </div>
  )
}

export function ApexBadge({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'success' | 'danger' | 'warning' }) {
  const toneClass =
    tone === 'success'
      ? 'apx-badge-success'
      : tone === 'danger'
      ? 'apx-badge-danger'
      : tone === 'warning'
      ? 'apx-badge-warning'
      : 'apx-badge'

  return <span className={toneClass}>{children}</span>
}
