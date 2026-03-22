import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/server/admin-permission'
import { sql } from '@/lib/server/db'
import {
  ApexButton,
  ApexCard,
  ApexCardBody,
  ApexCardHeader,
  ApexFormGrid,
  ApexInput,
  ApexPageHeader,
  ApexTextarea,
} from '@/components/admin/apex/AdminPrimitives'

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
    [title, description, startAt, endAt, location, meetingLink],
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
     order by start_at asc`,
  )

  return (
    <div className="space-y-5">
      <ApexPageHeader title="Calendar" subtitle="Plan events, schedules, and appointment windows." />

      <ApexCard>
        <ApexCardHeader title="New Event" subtitle="Use exact date-time to keep booking windows accurate." />
        <ApexCardBody>
          <form action={createEvent}>
            <ApexFormGrid>
              <ApexInput name="title" placeholder="Event title" required />
              <ApexInput name="location" placeholder="Location" />
              <ApexInput name="startAt" type="datetime-local" required />
              <ApexInput name="endAt" type="datetime-local" required />
              <ApexInput name="meetingLink" placeholder="Meeting link" className="md:col-span-2" />
              <ApexTextarea name="description" rows={3} placeholder="Description" className="md:col-span-2" />
              <ApexButton type="submit" className="md:col-span-2">
                Add Event
              </ApexButton>
            </ApexFormGrid>
          </form>
        </ApexCardBody>
      </ApexCard>

      <div className="space-y-3">
        {events.map((event) => (
          <ApexCard key={event.id}>
            <ApexCardBody className="pt-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold apx-text">{event.title}</h3>
                  <p className="text-xs apx-muted">
                    {new Date(event.start_at).toLocaleString()} - {new Date(event.end_at).toLocaleString()}
                  </p>
                  {event.location && <p className="mt-1 text-sm apx-muted">{event.location}</p>}
                  {event.description && <p className="mt-1 text-sm apx-muted">{event.description}</p>}
                </div>
                <form action={deleteEvent}>
                  <input type="hidden" name="id" value={event.id} />
                  <ApexButton variant="danger" type="submit">
                    Delete
                  </ApexButton>
                </form>
              </div>
            </ApexCardBody>
          </ApexCard>
        ))}
      </div>
    </div>
  )
}
