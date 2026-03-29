import { requirePermission } from '@/lib/server/admin-permission'

const logs = [
  { id: 'a1', actor: 'admin@progrex.ph', action: 'Updated booking status', target: 'Booking #BK-2026-01', at: '2026-01-12 09:14' },
  { id: 'a2', actor: 'ops@progrex.ph', action: 'Archived contact submission', target: 'Submission #CS-2026-18', at: '2026-01-12 08:52' },
  { id: 'a3', actor: 'admin@progrex.ph', action: 'Changed role permissions', target: 'Role: Content Manager', at: '2026-01-11 17:25' },
  { id: 'a4', actor: 'finance@progrex.ph', action: 'Created payment record', target: 'Invoice INV-2026-014', at: '2026-01-11 16:09' },
]

export default async function AdminAuditLogsPage() {
  await requirePermission('dashboard', 'read')

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight apx-text">Audit Logs</h1>
        <p className="mt-1 text-sm apx-muted">Recent admin actions for accountability and traceability.</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--apx-border)' }}>
              <th className="px-4 py-3 font-semibold apx-text">Actor</th>
              <th className="px-4 py-3 font-semibold apx-text">Action</th>
              <th className="px-4 py-3 font-semibold apx-text">Target</th>
              <th className="px-4 py-3 font-semibold apx-text">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((entry) => (
              <tr key={entry.id} className="border-b last:border-b-0" style={{ borderColor: 'var(--apx-border)' }}>
                <td className="px-4 py-3 apx-text">{entry.actor}</td>
                <td className="px-4 py-3 apx-text">{entry.action}</td>
                <td className="px-4 py-3 apx-muted">{entry.target}</td>
                <td className="px-4 py-3 apx-muted">{entry.at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
