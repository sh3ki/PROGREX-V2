import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/server/admin-permission'
import { sql } from '@/lib/server/db'
import AdminCalendarTemplateView from '@/components/admin/calendar/AdminCalendarTemplateView'

async function createEvent(formData: FormData) {
  'use server'
  await requirePermission('calendar', 'write')

  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const startAt = String(formData.get('startAt') ?? '')
  const endAt = String(formData.get('endAt') ?? '')
  const location = String(formData.get('location') ?? '').trim()
  const meetingLink = String(formData.get('meetingLink') ?? '').trim()

  if (!title || !startAt || !endAt) return

  await sql(
    `insert into calendar_events(title, description, start_at, end_at, location, meeting_link)
     values ($1, $2, $3::timestamptz, $4::timestamptz, $5, $6)`,
    [title, description, startAt, endAt, location, meetingLink]
  )

  revalidatePath('/admin/calendar')
}

async function deleteEvent(formData: FormData) {
  'use server'
  await requirePermission('calendar', 'delete')
  const id = String(formData.get('id') ?? '')
  await sql('delete from calendar_events where id = $1', [id])
  revalidatePath('/admin/calendar')
}

export default async function AdminCalendarPage() {
  await requirePermission('calendar', 'read')

  const events = await sql<{
    id: string
    title: string
    description: string
    start_at: string
    end_at: string
    location: string
    meeting_link: string
  }>(
    `select id, title, description, start_at::text, end_at::text, location, meeting_link
     from calendar_events
     order by start_at asc`
  )

  return (
    <AdminCalendarTemplateView
      events={events.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description ?? '',
        startAt: event.start_at,
        endAt: event.end_at,
        location: event.location ?? '',
        meetingLink: event.meeting_link ?? '',
      }))}
      createEventAction={createEvent}
      deleteEventAction={deleteEvent}
    />
  )
}
