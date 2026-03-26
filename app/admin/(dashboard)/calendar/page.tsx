import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/server/admin-permission'
import { sql } from '@/lib/server/db'
import AdminCalendarTemplateView from '@/components/admin/calendar/AdminCalendarTemplateView'

function combineDateTime(date: string, time: string) {
  const safeDate = date.trim()
  if (!safeDate) return ''
  const safeTime = time.trim() || '00:00'
  return `${safeDate}T${safeTime}:00`
}

async function ensureCalendarColumns() {
  await sql("alter table calendar_events add column if not exists event_date date")
  await sql("alter table calendar_events add column if not exists color text not null default 'primary'")
  await sql("alter table calendar_events add column if not exists start_time text")
  await sql("alter table calendar_events add column if not exists end_time text")
  await sql('alter table calendar_events alter column end_at drop not null')

  await sql(`
    update calendar_events
    set event_date = coalesce(event_date, start_at::date),
        start_time = coalesce(start_time, to_char(start_at, 'HH24:MI')),
        end_time = coalesce(end_time, case when end_at is null then '' else to_char(end_at, 'HH24:MI') end),
        color = coalesce(nullif(trim(color), ''), 'primary')
  `)
}

async function createEvent(formData: FormData) {
  'use server'
  await requirePermission('calendar', 'write')
  await ensureCalendarColumns()

  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const eventDate = String(formData.get('eventDate') ?? '').trim()
  const startTime = String(formData.get('startTime') ?? '').trim()
  const endTime = String(formData.get('endTime') ?? '').trim()
  const location = String(formData.get('location') ?? '').trim()
  const meetingLink = String(formData.get('meetingLink') ?? '').trim()
  const color = String(formData.get('color') ?? 'primary').trim() || 'primary'

  if (!title || !eventDate) return

  const startAt = combineDateTime(eventDate, startTime)
  const endAt = endTime ? combineDateTime(eventDate, endTime) : null

  await sql(
    `insert into calendar_events(title, description, event_date, start_time, end_time, start_at, end_at, location, meeting_link, color)
     values ($1, $2, $3::date, $4, $5, $6::timestamptz, $7::timestamptz, $8, $9, $10)`,
    [title, description, eventDate, startTime, endTime, startAt, endAt, location, meetingLink, color],
  )

  revalidatePath('/admin/calendar')
}

async function updateEvent(formData: FormData) {
  'use server'
  await requirePermission('calendar', 'write')
  await ensureCalendarColumns()

  const id = String(formData.get('id') ?? '').trim()
  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const eventDate = String(formData.get('eventDate') ?? '').trim()
  const startTime = String(formData.get('startTime') ?? '').trim()
  const endTime = String(formData.get('endTime') ?? '').trim()
  const location = String(formData.get('location') ?? '').trim()
  const meetingLink = String(formData.get('meetingLink') ?? '').trim()
  const color = String(formData.get('color') ?? 'primary').trim() || 'primary'

  if (!id || !title || !eventDate) return

  const startAt = combineDateTime(eventDate, startTime)
  const endAt = endTime ? combineDateTime(eventDate, endTime) : null

  await sql(
    `update calendar_events
     set title = $2,
         description = $3,
         event_date = $4::date,
         start_time = $5,
         end_time = $6,
         start_at = $7::timestamptz,
         end_at = $8::timestamptz,
         location = $9,
         meeting_link = $10,
         color = $11,
         updated_at = now()
     where id = $1::uuid`,
    [id, title, description, eventDate, startTime, endTime, startAt, endAt, location, meetingLink, color],
  )

  revalidatePath('/admin/calendar')
}

async function deleteEvent(formData: FormData) {
  'use server'
  await requirePermission('calendar', 'delete')

  const id = String(formData.get('id') ?? '').trim()
  if (!id) return

  await sql('delete from calendar_events where id = $1::uuid', [id])
  revalidatePath('/admin/calendar')
}

export default async function AdminCalendarPage() {
  await requirePermission('calendar', 'read')
  await ensureCalendarColumns()

  const events = await sql<{
    id: string
    title: string
    description: string
    event_date: string
    start_time: string | null
    end_time: string | null
    location: string
    meeting_link: string
    color: string | null
  }>(
    `select id,
            title,
            description,
            to_char(event_date, 'YYYY-MM-DD') as event_date,
            coalesce(start_time, '') as start_time,
            coalesce(end_time, '') as end_time,
            location,
            meeting_link,
            coalesce(color, 'primary') as color
     from calendar_events
     order by event_date asc, start_time asc`,
  )

  return (
    <AdminCalendarTemplateView
      events={events.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description ?? '',
        eventDate: event.event_date,
        startTime: event.start_time ?? '',
        endTime: event.end_time ?? '',
        location: event.location ?? '',
        meetingLink: event.meeting_link ?? '',
        color: event.color ?? 'primary',
      }))}
      createEventAction={createEvent}
      updateEventAction={updateEvent}
      deleteEventAction={deleteEvent}
    />
  )
}
