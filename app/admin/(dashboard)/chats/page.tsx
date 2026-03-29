import { requirePermission } from '@/lib/server/admin-permission'

const rooms = [
  { id: 'c1', title: 'Sales Pipeline', members: 4, unread: 5, last: 'Client asked for revised estimate.' },
  { id: 'c2', title: 'Delivery Team', members: 7, unread: 0, last: 'Sprint handoff complete and documented.' },
  { id: 'c3', title: 'Support Queue', members: 3, unread: 2, last: 'Escalated issue waiting for engineering review.' },
]

export default async function AdminChatsPage() {
  await requirePermission('dashboard', 'read')

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight apx-text">Chats</h1>
        <p className="mt-1 text-sm apx-muted">Conversation rooms for internal coordination.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {rooms.map((room) => (
          <article key={room.id} className="rounded-2xl border p-4" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold apx-text">{room.title}</h2>
              {room.unread > 0 ? <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">{room.unread} unread</span> : null}
            </div>
            <p className="mt-1 text-xs apx-muted">{room.members} member(s)</p>
            <p className="mt-3 rounded-xl border px-3 py-2 text-sm apx-muted" style={{ borderColor: 'var(--apx-border)' }}>{room.last}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
