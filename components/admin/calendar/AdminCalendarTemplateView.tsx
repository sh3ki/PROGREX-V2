'use client'

import { useMemo, useState } from 'react'
import { CalendarClock, ChevronLeft, ChevronRight, Edit2, Plus, Trash2 } from 'lucide-react'
import { ApexButton, ApexInput, ApexTextarea } from '@/components/admin/apex/AdminPrimitives'
import { ApexBlockingSpinner, ApexBreadcrumbs, ApexConfirmationModal, ApexDropdown, ApexModal } from '@/components/admin/apex/ApexDataUi'

type CalendarEvent = {
  id: string
  title: string
  description: string
  eventDate: string
  startTime: string
  endTime: string
  location: string
  meetingLink: string
  color: string
}

type EventFormState = {
  id?: string
  title: string
  eventDate: string
  color: string
  startTime: string
  endTime: string
  location: string
  meetingLink: string
  description: string
}

type ConfirmKind = 'create' | 'update' | 'delete'

const COLOR_OPTIONS = [
  { value: 'primary', label: 'Primary (Theme)' },
  { value: 'blue', label: 'Blue' },
  { value: 'emerald', label: 'Emerald' },
  { value: 'amber', label: 'Amber' },
  { value: 'rose', label: 'Rose' },
  { value: 'violet', label: 'Violet' },
]

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

function toDateKey(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
}

function toDateLabel(value: string) {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

function toDateShort(value: string) {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function colorTheme(color: string) {
  if (color === 'blue') return { chipBg: 'rgba(37,99,235,0.18)', chipText: '#1d4ed8', cardBg: 'rgba(37,99,235,0.1)', border: 'rgba(37,99,235,0.35)' }
  if (color === 'emerald') return { chipBg: 'rgba(5,150,105,0.18)', chipText: '#047857', cardBg: 'rgba(5,150,105,0.1)', border: 'rgba(5,150,105,0.35)' }
  if (color === 'amber') return { chipBg: 'rgba(217,119,6,0.2)', chipText: '#b45309', cardBg: 'rgba(217,119,6,0.11)', border: 'rgba(217,119,6,0.35)' }
  if (color === 'rose') return { chipBg: 'rgba(225,29,72,0.2)', chipText: '#be123c', cardBg: 'rgba(225,29,72,0.11)', border: 'rgba(225,29,72,0.35)' }
  if (color === 'violet') return { chipBg: 'rgba(124,58,237,0.2)', chipText: '#6d28d9', cardBg: 'rgba(124,58,237,0.11)', border: 'rgba(124,58,237,0.35)' }
  return {
    chipBg: 'var(--apx-primary-soft)',
    chipText: 'var(--apx-primary)',
    cardBg: 'color-mix(in oklab, var(--apx-primary) 12%, transparent)',
    border: 'color-mix(in oklab, var(--apx-primary) 38%, var(--apx-border))',
  }
}

function formatTime(value: string) {
  if (!value) return ''
  const [hourRaw, minuteRaw] = value.split(':')
  const hour = Number(hourRaw)
  const minute = Number(minuteRaw)
  if (Number.isNaN(hour) || Number.isNaN(minute)) return value
  const date = new Date()
  date.setHours(hour, minute, 0, 0)
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

function defaultForm(date = ''): EventFormState {
  return {
    title: '',
    eventDate: date,
    color: 'primary',
    startTime: '',
    endTime: '',
    location: '',
    meetingLink: '',
    description: '',
  }
}

function formFromEvent(event: CalendarEvent): EventFormState {
  return {
    id: event.id,
    title: event.title,
    eventDate: event.eventDate,
    color: event.color || 'primary',
    startTime: event.startTime || '',
    endTime: event.endTime || '',
    location: event.location || '',
    meetingLink: event.meetingLink || '',
    description: event.description || '',
  }
}

export default function AdminCalendarTemplateView({
  events,
  createEventAction,
  updateEventAction,
  deleteEventAction,
}: {
  events: CalendarEvent[]
  createEventAction: (formData: FormData) => Promise<void>
  updateEventAction: (formData: FormData) => Promise<void>
  deleteEventAction: (formData: FormData) => Promise<void>
}) {
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState(false)
  const [confirmKind, setConfirmKind] = useState<ConfirmKind>('create')
  const [activeEvent, setActiveEvent] = useState<CalendarEvent | null>(null)
  const [addForm, setAddForm] = useState<EventFormState>(defaultForm(''))
  const [editForm, setEditForm] = useState<EventFormState>(defaultForm(''))

  const monthStart = startOfMonth(monthCursor)
  const monthEnd = endOfMonth(monthCursor)
  const leadingOffset = monthStart.getDay()
  const totalDays = monthEnd.getDate()
  const todayKey = toDateKey(new Date())

  const cells = useMemo(() => {
    const output: Array<{ date: Date | null; key: string }> = []
    for (let i = 0; i < leadingOffset; i += 1) output.push({ date: null, key: `lead-${i}` })

    for (let day = 1; day <= totalDays; day += 1) {
      const value = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), day)
      output.push({ date: value, key: toDateKey(value) })
    }

    while (output.length % 7 !== 0) output.push({ date: null, key: `tail-${output.length}` })
    return output
  }, [leadingOffset, monthCursor, totalDays])

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    events.forEach((event) => {
      const key = event.eventDate
      if (!key) return
      const list = map.get(key) ?? []
      list.push(event)
      map.set(key, list)
    })

    map.forEach((value, key) => {
      map.set(
        key,
        value.sort((a, b) => {
          const aValue = a.startTime || '99:99'
          const bValue = b.startTime || '99:99'
          return aValue.localeCompare(bValue)
        }),
      )
    })

    return map
  }, [events])

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return []
    return eventsByDate.get(selectedDate) ?? []
  }, [eventsByDate, selectedDate])

  const tomorrowEvents = useMemo(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const key = toDateKey(tomorrow)
    return (eventsByDate.get(key) ?? []).slice(0)
  }, [eventsByDate])

  const selectedLabel = selectedDate ? toDateLabel(selectedDate) : ''

  async function executeConfirmedAction() {
    setPendingAction(true)

    try {
      if (confirmKind === 'create') {
        const formData = new FormData()
        formData.set('title', addForm.title)
        formData.set('eventDate', addForm.eventDate)
        formData.set('color', addForm.color)
        formData.set('startTime', addForm.startTime)
        formData.set('endTime', addForm.endTime)
        formData.set('location', addForm.location)
        formData.set('meetingLink', addForm.meetingLink)
        formData.set('description', addForm.description)
        await createEventAction(formData)
        setAddOpen(false)
        setAddForm(defaultForm(selectedDate))
      }

      if (confirmKind === 'update' && editForm.id) {
        const formData = new FormData()
        formData.set('id', editForm.id)
        formData.set('title', editForm.title)
        formData.set('eventDate', editForm.eventDate)
        formData.set('color', editForm.color)
        formData.set('startTime', editForm.startTime)
        formData.set('endTime', editForm.endTime)
        formData.set('location', editForm.location)
        formData.set('meetingLink', editForm.meetingLink)
        formData.set('description', editForm.description)
        await updateEventAction(formData)
        setEditOpen(false)
      }

      if (confirmKind === 'delete' && activeEvent) {
        const formData = new FormData()
        formData.set('id', activeEvent.id)
        await deleteEventAction(formData)
        setViewOpen(false)
        setEditOpen(false)
        setActiveEvent(null)
      }

      setConfirmOpen(false)
    } finally {
      setPendingAction(false)
    }
  }

  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="space-y-4">
      {(pendingAction && (confirmKind === 'create' || confirmKind === 'update')) ? <ApexBlockingSpinner label="Saving event..." /> : null}

      <ApexBreadcrumbs items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Calendar' }]} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[42px] leading-none font-bold tracking-tight apx-text">Calendar</h1>
          <p className="mt-1 text-sm apx-muted">Schedule and manage events.</p>
        </div>
        <button
          onClick={() => {
            setAddForm(defaultForm(selectedDate))
            setAddOpen(true)
          }}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-0.5"
          style={{ backgroundColor: 'var(--apx-primary)' }}
        >
          <Plus className="h-4 w-4" />
          Add Event
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section className="rounded-2xl border p-4" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button type="button" className="apx-icon-action" onClick={() => setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))} aria-label="Previous month">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button type="button" className="apx-icon-action" onClick={() => setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))} aria-label="Next month">
                <ChevronRight className="h-4 w-4" />
              </button>
              <h2 className="text-3xl font-semibold apx-text">{monthCursor.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</h2>
            </div>

            <ApexButton
              type="button"
              variant="outline"
              onClick={() => {
                const now = new Date()
                setMonthCursor(startOfMonth(now))
                setSelectedDate(toDateKey(now))
              }}
            >
              Today
            </ApexButton>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide apx-muted">
            {weekdayLabels.map((label) => (
              <div key={label} className="pb-1">{label}</div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-2">
            {cells.map((cell) => {
              if (!cell.date) {
                return <div key={cell.key} className="h-28 rounded-xl border border-transparent" />
              }

              const key = toDateKey(cell.date)
              const isToday = key === todayKey
              const isSelected = key === selectedDate
              const dayEvents = eventsByDate.get(key) ?? []

              return (
                <button
                  key={cell.key}
                  type="button"
                  onClick={() => setSelectedDate(key)}
                  className="h-28 rounded-xl border p-2 text-left transition"
                  style={{
                    borderColor: isSelected || isToday ? 'var(--apx-primary)' : 'var(--apx-border)',
                    backgroundColor: isSelected || isToday ? 'var(--apx-primary-soft)' : 'var(--apx-surface-alt)',
                  }}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold"
                      style={isSelected || isToday ? { backgroundColor: 'var(--apx-primary)', color: '#fff' } : { color: 'var(--apx-text)' }}
                    >
                      {cell.date.getDate()}
                    </span>
                    {dayEvents.length > 0 ? <span className="text-[10px] apx-muted">{dayEvents.length} event{dayEvents.length > 1 ? 's' : ''}</span> : null}
                  </div>

                  <div className="space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((event) => {
                      const theme = colorTheme(event.color)
                      return (
                        <p
                          key={event.id}
                          title={event.title}
                          className="truncate rounded px-1.5 py-0.5 text-[10px] font-semibold"
                          style={{ backgroundColor: theme.chipBg, color: theme.chipText }}
                        >
                          {event.title}
                        </p>
                      )
                    })}
                    {dayEvents.length > 2 ? <p className="text-[10px] apx-muted">+{dayEvents.length - 2} more events</p> : null}
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <div className="space-y-4">
          <section className="rounded-2xl border p-4" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
            {!selectedDate ? (
              <div className="flex min-h-62.5 flex-col items-center justify-center text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--apx-surface-alt)' }}>
                  <CalendarClock className="h-5 w-5 apx-muted" />
                </div>
                <p className="text-sm font-semibold apx-text">No selected date</p>
                <p className="mt-1 text-xs apx-muted">Click a date in the calendar to view events.</p>
              </div>
            ) : (
              <>
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xl leading-none font-bold apx-text">{selectedLabel}</h3>
                    <p className="mt-1 text-sm apx-muted">{selectedDateEvents.length} event{selectedDateEvents.length === 1 ? '' : 's'}</p>
                  </div>
                  <ApexButton
                    type="button"
                    onClick={() => {
                      setAddForm(defaultForm(selectedDate))
                      setAddOpen(true)
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </ApexButton>
                </div>

                {selectedDateEvents.length === 0 ? (
                  <div className="flex min-h-42.5 flex-col items-center justify-center rounded-xl border text-center" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface-alt)' }}>
                    <p className="text-sm apx-muted">No events for this day</p>
                    <button
                      type="button"
                      className="mt-2 text-sm font-semibold"
                      style={{ color: 'var(--apx-primary)' }}
                      onClick={() => {
                        setAddForm(defaultForm(selectedDate))
                        setAddOpen(true)
                      }}
                    >
                      Create one
                    </button>
                  </div>
                ) : (
                  <div className="max-h-62.5 space-y-2 overflow-y-auto pe-1">
                    {selectedDateEvents.map((event) => {
                      const theme = colorTheme(event.color)
                      return (
                        <article
                          key={event.id}
                          className="cursor-pointer rounded-xl border p-3 transition hover:-translate-y-0.5"
                          style={{ borderColor: theme.border, backgroundColor: theme.cardBg }}
                          onClick={() => {
                            setActiveEvent(event)
                            setViewOpen(true)
                          }}
                        >
                          <div className="mb-1 flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold apx-text">{event.title}</p>
                              <p className="mt-1 text-xs apx-muted">
                                {[formatTime(event.startTime), event.endTime ? `- ${formatTime(event.endTime)}` : ''].filter(Boolean).join(' ')
                                  || 'Time not specified'}
                              </p>
                            </div>
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                className="apx-icon-action"
                                aria-label={`Edit ${event.title}`}
                                onClick={() => {
                                  setActiveEvent(event)
                                  setEditForm(formFromEvent(event))
                                  setEditOpen(true)
                                }}
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                className="apx-icon-action-danger"
                                aria-label={`Delete ${event.title}`}
                                onClick={() => {
                                  setActiveEvent(event)
                                  setConfirmKind('delete')
                                  setConfirmOpen(true)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {event.location ? <p className="text-xs apx-muted">{event.location}</p> : null}
                          {event.description ? <p className="mt-1 line-clamp-2 text-xs apx-muted">{event.description}</p> : null}
                        </article>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </section>

          <section className="rounded-2xl border p-4" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
            <h3 className="mb-3 text-lg font-semibold apx-text">Upcoming Events</h3>
            {tomorrowEvents.length === 0 ? (
              <p className="py-4 text-center text-xs apx-muted">No upcoming events for tomorrow</p>
            ) : (
              <div className="space-y-2">
                {tomorrowEvents.map((event) => (
                  <article key={event.id} className="rounded-lg border px-3 py-2" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface-alt)' }}>
                    <p className="text-sm font-semibold apx-text">{event.title}</p>
                    <p className="text-xs apx-muted">{toDateShort(event.eventDate)}</p>
                    <p className="text-xs apx-muted">
                      {[formatTime(event.startTime), event.endTime ? `- ${formatTime(event.endTime)}` : ''].filter(Boolean).join(' ')
                        || 'Time not specified'}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <ApexModal open={addOpen} size="md" title="Add Event" subtitle="Create a new calendar event." onClose={() => setAddOpen(false)}>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            setConfirmKind('create')
            setConfirmOpen(true)
          }}
          className="grid gap-3 md:grid-cols-2"
        >
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Title</label>
            <ApexInput required value={addForm.title} onChange={(event) => setAddForm((prev) => ({ ...prev, title: event.target.value }))} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Date</label>
            <ApexInput required type="date" value={addForm.eventDate} onChange={(event) => setAddForm((prev) => ({ ...prev, eventDate: event.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Color</label>
            <ApexDropdown value={addForm.color} onChange={(value) => setAddForm((prev) => ({ ...prev, color: value }))} options={COLOR_OPTIONS} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Start Time (Optional)</label>
            <ApexInput type="time" value={addForm.startTime} onChange={(event) => setAddForm((prev) => ({ ...prev, startTime: event.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">End Time (Optional)</label>
            <ApexInput type="time" value={addForm.endTime} onChange={(event) => setAddForm((prev) => ({ ...prev, endTime: event.target.value }))} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Location (Optional)</label>
            <ApexInput value={addForm.location} onChange={(event) => setAddForm((prev) => ({ ...prev, location: event.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Meeting Link (Optional)</label>
            <ApexInput value={addForm.meetingLink} onChange={(event) => setAddForm((prev) => ({ ...prev, meetingLink: event.target.value }))} />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Description (Optional)</label>
            <ApexTextarea rows={4} value={addForm.description} onChange={(event) => setAddForm((prev) => ({ ...prev, description: event.target.value }))} />
          </div>

          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <ApexButton type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</ApexButton>
            <ApexButton type="submit">Save Event</ApexButton>
          </div>
        </form>
      </ApexModal>

      <ApexModal open={editOpen} size="md" title="Edit Event" subtitle="Update event details." onClose={() => setEditOpen(false)}>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            setConfirmKind('update')
            setConfirmOpen(true)
          }}
          className="grid gap-3 md:grid-cols-2"
        >
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Title</label>
            <ApexInput required value={editForm.title} onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Date</label>
            <ApexInput required type="date" value={editForm.eventDate} onChange={(event) => setEditForm((prev) => ({ ...prev, eventDate: event.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Color</label>
            <ApexDropdown value={editForm.color} onChange={(value) => setEditForm((prev) => ({ ...prev, color: value }))} options={COLOR_OPTIONS} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Start Time (Optional)</label>
            <ApexInput type="time" value={editForm.startTime} onChange={(event) => setEditForm((prev) => ({ ...prev, startTime: event.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">End Time (Optional)</label>
            <ApexInput type="time" value={editForm.endTime} onChange={(event) => setEditForm((prev) => ({ ...prev, endTime: event.target.value }))} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Location (Optional)</label>
            <ApexInput value={editForm.location} onChange={(event) => setEditForm((prev) => ({ ...prev, location: event.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Meeting Link (Optional)</label>
            <ApexInput value={editForm.meetingLink} onChange={(event) => setEditForm((prev) => ({ ...prev, meetingLink: event.target.value }))} />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Description (Optional)</label>
            <ApexTextarea rows={4} value={editForm.description} onChange={(event) => setEditForm((prev) => ({ ...prev, description: event.target.value }))} />
          </div>

          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <ApexButton type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</ApexButton>
            <ApexButton type="submit">Save Changes</ApexButton>
          </div>
        </form>
      </ApexModal>

      <ApexModal open={viewOpen} size="sm" title="View Event" subtitle={activeEvent?.title || ''} onClose={() => setViewOpen(false)}>
        {activeEvent ? (
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide apx-muted">Title</p>
              <p className="mt-1 apx-text">{activeEvent.title}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide apx-muted">Date</p>
              <p className="mt-1 apx-text">{toDateLabel(activeEvent.eventDate)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide apx-muted">Time</p>
              <p className="mt-1 apx-text">
                {[formatTime(activeEvent.startTime), activeEvent.endTime ? `- ${formatTime(activeEvent.endTime)}` : ''].filter(Boolean).join(' ') || 'Time not specified'}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide apx-muted">Location</p>
              <p className="mt-1 apx-text">{activeEvent.location || '-'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide apx-muted">Meeting Link</p>
              {activeEvent.meetingLink ? (
                <a href={activeEvent.meetingLink} target="_blank" rel="noreferrer" style={{ color: 'var(--apx-primary)' }} className="mt-1 inline-block hover:underline">
                  {activeEvent.meetingLink}
                </a>
              ) : (
                <p className="mt-1 apx-text">-</p>
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide apx-muted">Description</p>
              <p className="mt-1 whitespace-pre-wrap apx-text">{activeEvent.description || '-'}</p>
            </div>
          </div>
        ) : null}
      </ApexModal>

      <ApexConfirmationModal
        open={confirmOpen}
        title={confirmKind === 'delete' ? 'Delete Event' : confirmKind === 'create' ? 'Save New Event' : 'Save Event Changes'}
        description={confirmKind === 'delete' ? 'Delete this event? This cannot be undone.' : 'Are you sure you want to save this event?'}
        confirmLabel={confirmKind === 'delete' ? 'Delete' : 'Save'}
        tone={confirmKind === 'delete' ? 'danger' : 'primary'}
        pending={pendingAction}
        onConfirm={executeConfirmedAction}
        onClose={() => {
          if (pendingAction) return
          setConfirmOpen(false)
        }}
      />
    </div>
  )
}
