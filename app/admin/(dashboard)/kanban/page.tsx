import { requirePermission } from '@/lib/server/admin-permission'

const lanes = [
  {
    name: 'Backlog',
    cards: ['Finalize booking status UX polish', 'Prepare Q2 marketing systems brief', 'Review pending contact replies'],
  },
  {
    name: 'In Progress',
    cards: ['Build payment tracking admin module', 'Refine dashboard operations metrics'],
  },
  {
    name: 'Review',
    cards: ['Validate cloud upload constraints', 'QA admin access control checks'],
  },
  {
    name: 'Done',
    cards: ['Hydration-safe sidebar collapse state', 'Bookings compact status popup'],
  },
]

export default async function AdminKanbanPage() {
  await requirePermission('dashboard', 'read')

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight apx-text">Kanban</h1>
        <p className="mt-1 text-sm apx-muted">Task progression board for admin operations.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-4">
        {lanes.map((lane) => (
          <section key={lane.name} className="rounded-2xl border p-3" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
            <h2 className="px-1 pb-2 text-sm font-semibold apx-text">{lane.name}</h2>
            <div className="space-y-2">
              {lane.cards.map((card) => (
                <div key={card} className="rounded-xl border p-3 text-sm apx-text" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface-alt)' }}>
                  {card}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
