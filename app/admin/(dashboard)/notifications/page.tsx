import { requirePermission } from '@/lib/server/admin-permission'

const notifications = [
  { id: 'n1', title: 'New booking received', detail: 'A new booking was submitted from the website contact flow.', level: 'info', when: '2 min ago' },
  { id: 'n2', title: 'Payment marked as paid', detail: 'Invoice INV-2026-014 was marked as paid.', level: 'success', when: '1 hr ago' },
  { id: 'n3', title: 'Contact inquiry unresolved', detail: '3 inquiries have been in-progress for more than 3 days.', level: 'warning', when: '3 hrs ago' },
  { id: 'n4', title: 'Role update completed', detail: 'Permissions for Content Manager were updated.', level: 'info', when: 'yesterday' },
]

function badge(level: string) {
  if (level === 'success') return { label: 'Success', bg: '#dcfce7', fg: '#166534' }
  if (level === 'warning') return { label: 'Warning', bg: '#fef3c7', fg: '#92400e' }
  return { label: 'Info', bg: '#dbeafe', fg: '#1d4ed8' }
}

export default async function AdminNotificationsPage() {
  await requirePermission('dashboard', 'read')

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight apx-text">Notifications</h1>
        <p className="mt-1 text-sm apx-muted">Latest platform and workflow updates.</p>
      </div>

      <div className="rounded-2xl border" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
        <ul className="divide-y" style={{ borderColor: 'var(--apx-border)' }}>
          {notifications.map((item) => {
            const status = badge(item.level)
            return (
              <li key={item.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-4">
                <div>
                  <p className="font-semibold apx-text">{item.title}</p>
                  <p className="mt-1 text-sm apx-muted">{item.detail}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full px-2.5 py-1 text-xs font-medium" style={{ backgroundColor: status.bg, color: status.fg }}>{status.label}</span>
                  <span className="text-xs apx-muted">{item.when}</span>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
