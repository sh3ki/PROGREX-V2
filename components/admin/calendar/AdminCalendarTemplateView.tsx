'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { ApexButton, ApexInput, ApexTextarea } from '@/components/admin/apex/AdminPrimitives'
import { ApexBreadcrumbs, ApexConfirmationModal, ApexModal } from '@/components/admin/apex/ApexDataUi'

type CalendarEvent = {
  id: string
  title: string
  description: string
  startAt: string
  endAt: string
  location: string
  meetingLink: string
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

function toDateKey(input: string) {
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatDateTime(input: string) {
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString()
}

export default function AdminCalendarTemplateView({
  events,
  createEventAction,
  deleteEventAction,
}: {
  events: CalendarEvent[]
  createEventAction: (formData: FormData) => Promise<void>
  deleteEventAction: (formData: FormData) => Promise<void>
}) {
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()))
  const [addOpen, setAddOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const monthStart = startOfMonth(monthCursor)
  const monthEnd = endOfMonth(monthCursor)
  const leadingDayOffset = monthStart.getDay()
  const totalDays = monthEnd.getDate()

  const cells = useMemo(() => {
    const output: Array<{ date: Date | null; key: string }> = []
    for (let i = 0; i < leadingDayOffset; i += 1) output.push({ date: null, key: `pad-start-${i}` })
    for (let day = 1; day <= totalDays; day += 1) {
      const value = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), day)
      output.push({ date: value, key: toDateKey(value.toISOString()) })
    }
    while (output.length % 7 !== 0) output.push({ date: null, key: `pad-end-${output.length}` })
    return output
  }, [leadingDayOffset, monthCursor, totalDays])

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    events.forEach((event) => {
      const key = toDateKey(event.startAt)
      if (!key) return
      const list = map.get(key) ?? []
      list.push(event)
      map.set(key, list)
    })
    return map
  }, [events])

  const monthEvents = useMemo(() => {
    return events
      .filter((event) => {
        const start = new Date(event.startAt)
        return start.getMonth() === monthCursor.getMonth() && start.getFullYear() === monthCursor.getFullYear()
      })
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
  }, [events, monthCursor])

  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="space-y-4">
      <ApexBreadcrumbs items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Calendar' }]} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[42px] leading-none font-bold tracking-tight apx-text">Calendar</h1>
          <p className="mt-1 text-sm apx-muted">Manage internal events and booking slots.</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-0.5"
          style={{ backgroundColor: 'var(--apx-primary)' }}
        >
          <Plus className="h-4 w-4" />
          Add Event
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <section className="rounded-2xl border p-4" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold apx-text">{monthCursor.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                className="apx-icon-action"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                className="apx-icon-action"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide apx-muted">
            {weekdayLabels.map((label) => (
              <div key={label} className="pb-1">{label}</div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-2">
            {cells.map((cell, index) => {
              if (!cell.date) {
                return <div key={`empty-${cell.key}-${index}`} className="h-22 rounded-xl border border-transparent" />
              }

              const dayKey = `${cell.date.getFullYear()}-${String(cell.date.getMonth() + 1).padStart(2, '0')}-${String(cell.date.getDate()).padStart(2, '0')}`
              const dayEvents = eventsByDate.get(dayKey) ?? []
              const today = new Date()
              const isToday = today.getFullYear() === cell.date.getFullYear() && today.getMonth() === cell.date.getMonth() && today.getDate() === cell.date.getDate()

              return (
                <div
                  key={cell.key}
                  className="h-22 rounded-xl border p-2"
                  style={{
                    borderColor: isToday ? 'var(--apx-primary)' : 'var(--apx-border)',
                    backgroundColor: isToday ? 'var(--apx-primary-soft)' : 'var(--apx-surface-alt)',
                  }}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-semibold apx-text">{cell.date.getDate()}</span>
                    {dayEvents.length > 0 ? (
                      <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold" style={{ backgroundColor: 'var(--apx-primary-soft)', color: 'var(--apx-primary)' }}>
                        {dayEvents.length}
                      </span>
                    ) : null}
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((event) => (
                      <p key={event.id} className="truncate rounded bg-black/15 px-1.5 py-0.5 text-[10px] apx-text">
                        {event.title}
                      </p>
                    ))}
                    {dayEvents.length > 2 ? <p className="text-[10px] apx-muted">+{dayEvents.length - 2} more</p> : null}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="rounded-2xl border p-4" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
          <h2 className="mb-3 text-lg font-semibold apx-text">Upcoming in Month</h2>
          <div className="space-y-3">
            {monthEvents.length === 0 ? <p className="text-sm apx-muted">No events in this month.</p> : null}
            {monthEvents.map((event) => (
              <article key={event.id} className="rounded-xl border p-3" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface-alt)' }}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold apx-text">{event.title}</p>
                    <p className="text-xs apx-muted">{formatDateTime(event.startAt)} - {formatDateTime(event.endAt)}</p>
                    {event.location ? <p className="mt-1 text-xs apx-muted">Location: {event.location}</p> : null}
                    {event.meetingLink ? (
                      <a href={event.meetingLink} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs font-medium" style={{ color: 'var(--apx-primary)' }}>
                        Meeting Link
                      </a>
                    ) : null}
                    {event.description ? <p className="mt-2 text-xs apx-muted">{event.description}</p> : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteId(event.id)
                      setConfirmOpen(true)
                    }}
                    className="apx-icon-action-danger"
                    aria-label={`Delete ${event.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <ApexModal open={addOpen} size="md" title="Add Calendar Event" subtitle="Create a new event or appointment slot." onClose={() => setAddOpen(false)}>
        <form action={createEventAction} className="grid gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Event Title</label>
            <ApexInput name="title" required placeholder="Event title" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Start Date & Time</label>
            <ApexInput name="startAt" type="datetime-local" required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">End Date & Time</label>
            <ApexInput name="endAt" type="datetime-local" required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Location</label>
            <ApexInput name="location" placeholder="Office, online, etc." />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Meeting Link</label>
            <ApexInput name="meetingLink" placeholder="https://..." />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Description</label>
            <ApexTextarea name="description" rows={4} placeholder="Optional details" />
          </div>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <ApexButton type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</ApexButton>
            <ApexButton type="submit">Add Event</ApexButton>
          </div>
        </form>
      </ApexModal>

      <ApexConfirmationModal
        open={confirmOpen}
        title="Delete Event"
        description="Are you sure you want to delete this event?"
        confirmLabel="Delete"
        tone="danger"
        onConfirm={async () => {
          if (!deleteId) return
          const body = new FormData()
          body.set('id', deleteId)
          await deleteEventAction(body)
          setConfirmOpen(false)
          setDeleteId(null)
        }}
        onClose={() => {
          setConfirmOpen(false)
          setDeleteId(null)
        }}
      />
    </div>
  )
}
