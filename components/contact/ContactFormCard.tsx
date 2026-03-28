'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, Check, CheckCircle, ChevronDown, ChevronLeft, ChevronRight, Paperclip, Send, X as XIcon } from 'lucide-react'
import { ApexCheckbox } from '@/components/admin/apex/ApexDataUi'
import { useTranslation } from '@/components/TranslationProvider'

type AvailabilityEvent = {
  event_date: string
  start_time: string | null
  end_time: string | null
}

type BookingSelection = {
  date: string
  startTime: string
  durationMinutes: number
}

type FormData = {
  name: string
  email: string
  phone: string
  company: string
  service: string
  otherService: string
  budget: string
  message: string
}

const SERVICE_OPTIONS = [
  'Book a Meeting',
  'Request a Demo',
  'Ready-Made Systems',
  'Business Automation',
  'Custom Web Development',
  'Mobile App Development',
  'Custom Software Development',
  'Academic / Capstone System',
  'Partnership / Collaboration',
  'Hardware Development',
  'IT Consulting',
  'Others',
]

const DURATION_OPTIONS = [10, 20, 30, 60, 90, 120]

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

function formatDateHuman(value: string) {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime12(value: string) {
  const [hourRaw, minuteRaw] = value.split(':')
  const hour = Number(hourRaw)
  const minute = Number(minuteRaw)
  if (Number.isNaN(hour) || Number.isNaN(minute)) return value
  const date = new Date()
  date.setHours(hour, minute, 0, 0)
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

function toMinutes(time: string) {
  const [hourRaw, minuteRaw] = time.split(':')
  return Number(hourRaw) * 60 + Number(minuteRaw)
}

export default function ContactFormCard({ onSuccess }: { onSuccess?: () => void }) {
  const { t, translations } = useTranslation()
  const budgets = translations.form.budgetOptions as unknown as string[]

  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    otherService: '',
    budget: '',
    message: '',
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [fileError, setFileError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const [bookMeeting, setBookMeeting] = useState(false)
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [availability, setAvailability] = useState<AvailabilityEvent[]>([])
  const [selectedBooking, setSelectedBooking] = useState<BookingSelection | null>(null)
  const [bookingStartTime, setBookingStartTime] = useState('')
  const [bookingDuration, setBookingDuration] = useState(30)
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()))

  const fileInputRef = useRef<HTMLInputElement>(null)
  const MAX_FILE_SIZE = 10 * 1024 * 1024

  const dayEvents = useMemo(() => availability.filter((event) => event.event_date === selectedDate), [availability, selectedDate])

  const calendarCells = useMemo(() => {
    const monthStart = startOfMonth(monthCursor)
    const monthEnd = endOfMonth(monthCursor)
    const leadingOffset = monthStart.getDay()
    const totalDays = monthEnd.getDate()
    const output: Array<{ key: string; date: Date | null }> = []

    for (let i = 0; i < leadingOffset; i += 1) output.push({ key: `lead-${i}`, date: null })
    for (let day = 1; day <= totalDays; day += 1) {
      const date = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), day)
      output.push({ key: toDateKey(date), date })
    }
    while (output.length % 7 !== 0) output.push({ key: `tail-${output.length}`, date: null })
    return output
  }, [monthCursor])

  useEffect(() => {
    if (!bookingModalOpen && !bookMeeting) return
    fetch('/api/contact?mode=availability')
      .then((response) => response.json())
      .then((data: { events?: AvailabilityEvent[] }) => setAvailability(data.events || []))
      .catch(() => setAvailability([]))
  }, [bookingModalOpen, bookMeeting])

  function hasOverlap(date: string, startTime: string, durationMinutes: number) {
    const start = toMinutes(startTime)
    const end = start + durationMinutes
    return availability
      .filter((event) => event.event_date === date)
      .some((event) => {
        if (!event.start_time) return false
        const eventStart = toMinutes(event.start_time)
        const eventEnd = toMinutes(event.end_time || event.start_time)
        return start < eventEnd && end > eventStart
      })
  }

  function handleFileSelect(file: File) {
    setFileError('')
    if (file.size > MAX_FILE_SIZE) {
      setFileError(`${t('form.fileTooBig')} \"${file.name}\" is ${(file.size / 1024 / 1024).toFixed(1)} MB.`)
      return
    }
    if (attachedFiles.length >= 3) {
      setFileError('Maximum of 3 files allowed.')
      return
    }

    const allowedDocTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      'application/zip',
      'application/x-rar-compressed',
    ]

    if (!allowedDocTypes.includes(file.type)) {
      setFileError(`${file.name} is not a supported document format.`)
      return
    }

    setAttachedFiles((prev) => [...prev, file])
  }

  function validate() {
    const nextErrors: Partial<FormData> = {}
    if (!form.name.trim()) nextErrors.name = t('form.nameRequired')
    if (!form.email.trim()) nextErrors.email = t('form.emailRequired')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Enter a valid email'
    if (!form.message.trim()) nextErrors.message = t('form.messageRequired')
    if (!form.service.trim()) nextErrors.service = 'Please select a service.'
    if (form.service === 'Others' && !form.otherService.trim()) nextErrors.otherService = 'Please enter your custom service.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function saveBookingSelection() {
    if (!selectedDate || !bookingStartTime || !bookingDuration) {
      setServerError('Please complete date, start time, and duration.')
      return
    }

    if (hasOverlap(selectedDate, bookingStartTime, bookingDuration)) {
      setServerError('Selected schedule is already booked.')
      return
    }

    setSelectedBooking({ date: selectedDate, startTime: bookingStartTime, durationMinutes: bookingDuration })
    setBookingModalOpen(false)
    setServerError('')
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!validate()) return

    setLoading(true)
    setServerError('')

    try {
      if (bookMeeting && !selectedBooking) throw new Error('Please save your meeting schedule first.')

      const payload = new FormData()
      payload.set('name', form.name)
      payload.set('email', form.email)
      payload.set('phone', form.phone)
      payload.set('company', form.company)
      payload.set('service', form.service === 'Others' ? form.otherService : form.service)
      payload.set('budget', form.budget)
      payload.set('message', form.message)
      payload.set('requestMeeting', String(bookMeeting))

      if (bookMeeting && selectedBooking) {
        payload.set('meetingDate', selectedBooking.date)
        payload.set('meetingStartTime', selectedBooking.startTime)
        payload.set('meetingDurationMinutes', String(selectedBooking.durationMinutes))
      }

      attachedFiles.forEach((file) => payload.append('attachments', file))

      const response = await fetch('/api/contact', {
        method: 'POST',
        body: payload,
      })

      const data = await response.json()
      if (!response.ok) {
        const message = String(data.error || t('form.failedToSend'))
        if (message.toLowerCase().includes('valid email')) {
          setErrors((prev) => ({ ...prev, email: 'Enter a valid email' }))
        }
        throw new Error(message)
      }

      setAttachedFiles([])
      setSelectedBooking(null)
      setSubmitted(true)
      onSuccess?.()
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : t('form.serverError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence mode="wait">
      {submitted ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="glass-card rounded-2xl p-6 sm:p-12 text-center border border-nebula-700/30"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-nebula-700 to-aurora-600"
          >
            <CheckCircle size={28} className="text-white" />
          </motion.div>
          <h2 className="mb-3 text-2xl font-extrabold text-white">{t('form.successTitle')}</h2>
          <p className="mb-6 text-slate-400">
            Thank you, <strong className="text-white">{form.name}</strong>! {t('form.successMsg')}
          </p>
          <button
            onClick={() => {
              setSubmitted(false)
              setForm({ name: '', email: '', phone: '', company: '', service: '', otherService: '', budget: '', message: '' })
              setBookMeeting(false)
              setSelectedBooking(null)
              setAttachedFiles([])
            }}
            className="btn-outline text-sm px-6 py-2.5 inline-flex"
          >
            {t('form.sendAnother')}
          </button>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onSubmit={handleSubmit}
          className="glass-card rounded-2xl border border-nebula-700/20 p-6 sm:p-8 space-y-5"
        >
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-white">{t('contact.formHeading')}</h2>
            <button type="button" className="btn-primary px-4! py-2! text-xs!">
              Video Call with Our Team
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label={`${t('form.fullName')} ${t('form.required')}`} value={form.name} onChange={(v) => setForm((prev) => ({ ...prev, name: v }))} error={errors.name} placeholder={t('form.namePlaceholder')} />
            <Field label={`${t('form.email')} ${t('form.required')}`} type="email" value={form.email} onChange={(v) => setForm((prev) => ({ ...prev, email: v }))} error={errors.email} placeholder={t('form.emailPlaceholder')} />
            <Field label={t('form.phone')} type="tel" value={form.phone} onChange={(v) => setForm((prev) => ({ ...prev, phone: v }))} placeholder={t('form.phonePlaceholder')} />
            <Field label={t('form.company')} value={form.company} onChange={(v) => setForm((prev) => ({ ...prev, company: v }))} placeholder={t('form.companyPlaceholder')} />
          </div>

          <div className="rounded-xl border border-nebula-700/30 p-4">
            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-200">
                <ApexCheckbox
                  checked={bookMeeting}
                  onChange={() => {
                    const checked = !bookMeeting
                    setBookMeeting(checked)
                    if (!checked) setSelectedBooking(null)
                  }}
                  ariaLabel="Book a meeting"
                />
                Book a Meeting
              </label>

              {bookMeeting ? (
                <button type="button" onClick={() => setBookingModalOpen(true)} className="btn-primary px-4! py-2! text-xs!">
                  <CalendarDays size={14} />
                  {selectedBooking ? 'Edit Booking Calendar' : 'Open Booking Calendar'}
                </button>
              ) : null}
            </div>

            <div className="mt-3 text-xs text-slate-400">
              {selectedBooking
                ? `${formatDateHuman(selectedBooking.date)} at ${formatTime12(selectedBooking.startTime)} (${selectedBooking.durationMinutes} mins)`
                : 'No meeting schedule selected yet.'}
            </div>
          </div>

          <CustomSelect label={t('form.service')} value={form.service} onChange={(v) => setForm((prev) => ({ ...prev, service: v }))} options={SERVICE_OPTIONS} placeholder={t('form.servicePlaceholder')} />
          {errors.service ? <p className="-mt-3 text-xs text-red-400">{errors.service}</p> : null}

          {form.service === 'Others' ? (
            <Field label="Specify Other Service" value={form.otherService} onChange={(v) => setForm((prev) => ({ ...prev, otherService: v }))} error={errors.otherService} placeholder="Type your requested service" />
          ) : null}

          <CustomSelect label={t('form.budget')} value={form.budget} onChange={(v) => setForm((prev) => ({ ...prev, budget: v }))} options={budgets} placeholder={t('form.budgetPlaceholder')} />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">{t('form.projectDetails')} {t('form.required')}</label>
            <textarea
              value={form.message}
              onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
              rows={4}
              placeholder={t('form.detailsPlaceholder')}
              className={`w-full rounded-xl border bg-transparent px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 transition-all resize-none focus:outline-none ${
                errors.message ? 'border-red-500/60' : 'border-nebula-700/20 focus:border-nebula-500/60 focus:shadow-nebula-sm'
              }`}
            />
            {errors.message ? <p className="mt-1 text-xs text-red-400">{errors.message}</p> : null}

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => { event.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(event) => {
                event.preventDefault()
                setDragOver(false)
                const files = Array.from(event.dataTransfer.files)
                files.forEach((file) => handleFileSelect(file))
              }}
              className={`mt-3 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed px-4 py-3 transition-all duration-200 ${
                dragOver
                  ? 'border-nebula-400/70 bg-nebula-700/10'
                  : 'border-nebula-700/30 hover:border-nebula-500/50 hover:bg-nebula-700/05'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(event) => {
                  const files = Array.from(event.target.files || [])
                  files.forEach((file) => handleFileSelect(file))
                  event.target.value = ''
                }}
              />

              {attachedFiles.length > 0 ? (
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  {attachedFiles.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="flex min-w-0 items-center gap-2">
                      <Check size={14} className="shrink-0 text-emerald-400" />
                      <span className="truncate text-xs text-white/70">{file.name}</span>
                      <span className="shrink-0 text-xs text-slate-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          setAttachedFiles((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
                          setFileError('')
                        }}
                        className="shrink-0 text-slate-500 hover:text-red-400"
                      >
                        <XIcon size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <Paperclip size={14} className="shrink-0 text-nebula-400/60" />
                  <span className="text-xs text-slate-500">{dragOver ? t('form.fileDrop') : t('form.fileAttach')}</span>
                </>
              )}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">Up to 3 files, max 10MB each. Document formats only.</p>
            {fileError ? <p className="mt-1.5 text-xs text-red-400">{fileError}</p> : null}
          </div>

          {serverError ? <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{serverError}</p> : null}

          <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary w-full justify-center py-3.5 disabled:cursor-not-allowed disabled:opacity-50">
            <span>{loading ? t('form.sending') : t('form.send')}</span>
            {loading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <Send size={16} />
            )}
          </motion.button>

          {bookingModalOpen ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4">
              <div className="w-full max-w-4xl rounded-2xl border border-nebula-700/40 bg-[#070f1e] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">Book a Meeting</h3>
                  <button type="button" onClick={() => setBookingModalOpen(false)} className="text-slate-400 hover:text-white">
                    <XIcon size={16} />
                  </button>
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.75fr)_minmax(300px,0.8fr)]">
                  <section className="rounded-2xl border border-nebula-700/30 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button type="button" className="apx-icon-action" onClick={() => setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}>
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button type="button" className="apx-icon-action" onClick={() => setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                        <h4 className="text-3xl font-semibold text-white">{monthCursor.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</h4>
                      </div>
                      <button type="button" className="apx-btn-outline" onClick={() => { const now = new Date(); setMonthCursor(startOfMonth(now)); setSelectedDate(toDateKey(now)) }}>
                        Today
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => (
                        <div key={label}>{label}</div>
                      ))}
                    </div>

                    <div className="mt-2 grid grid-cols-7 gap-2">
                      {calendarCells.map((cell) => {
                        if (!cell.date) return <div key={cell.key} className="h-24 rounded-xl border border-transparent" />
                        const key = toDateKey(cell.date)
                        const isSelected = key === selectedDate
                        const count = availability.filter((event) => event.event_date === key && event.start_time).length
                        return (
                          <button
                            key={cell.key}
                            type="button"
                            onClick={() => setSelectedDate(key)}
                            className="flex aspect-square min-h-24 flex-col items-start justify-start rounded-xl border p-2 text-left transition"
                            style={{
                              borderColor: isSelected ? 'var(--apx-primary)' : 'rgba(103,232,249,0.18)',
                              backgroundColor: isSelected ? 'color-mix(in oklab, var(--apx-primary) 18%, transparent)' : 'rgba(103,232,249,0.03)',
                            }}
                          >
                            <div className="mb-1 flex w-full items-start justify-between">
                              <span className="text-sm font-semibold text-white">{cell.date.getDate()}</span>
                              {count > 0 ? <span className="text-[10px] text-slate-400">{count}</span> : null}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </section>

                  <section className="space-y-3 rounded-2xl border border-nebula-700/30 p-4">
                    <p className="text-sm font-semibold text-white">{formatDateHuman(selectedDate)}</p>

                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-300">Start Time</label>
                        <input
                          type="time"
                          value={bookingStartTime}
                          onChange={(event) => setBookingStartTime(event.target.value)}
                          className="w-full rounded-xl border border-nebula-700/30 bg-transparent px-3 py-2 text-sm text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-300">Duration</label>
                        <select
                          value={String(bookingDuration)}
                          onChange={(event) => setBookingDuration(Number(event.target.value) || 30)}
                          className="w-full rounded-xl border border-nebula-700/30 bg-transparent px-3 py-2 text-sm text-slate-200"
                        >
                          {DURATION_OPTIONS.map((minutes) => (
                            <option key={minutes} value={minutes}>{minutes} minutes</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="rounded-xl border border-nebula-700/30 p-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Booked Slots</p>
                      <div className="max-h-40 space-y-1 overflow-y-auto">
                        {dayEvents.filter((event) => event.start_time).length === 0 ? (
                          <p className="text-xs text-emerald-300">No occupied slots for this date.</p>
                        ) : (
                          dayEvents
                            .filter((event) => event.start_time)
                            .map((event, index) => (
                              <p key={`${event.event_date}-${event.start_time}-${index}`} className="text-xs text-slate-300">
                                Booked {formatTime12(event.start_time || '')}{event.end_time ? ` - ${formatTime12(event.end_time)}` : ''}
                              </p>
                            ))
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button type="button" onClick={() => setBookingModalOpen(false)} className="apx-btn-outline">
                        Cancel
                      </button>
                      <button type="button" onClick={saveBookingSelection} className="btn-primary px-4! py-2! text-xs!">
                        Save
                      </button>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          ) : null}
        </motion.form>
      )}
    </AnimatePresence>
  )
}

function CustomSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <label className="mb-1.5 block text-sm font-medium text-slate-300">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-sm transition-all duration-200"
        style={{
          background: open ? 'rgba(14,165,233,0.08)' : 'rgba(103,232,249,0.04)',
          border: `1px solid ${open ? 'rgba(14,165,233,0.45)' : 'rgba(103,232,249,0.18)'}`,
          color: value ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)',
        }}
      >
        <span>{value || placeholder}</span>
        <ChevronDown size={14} className="shrink-0 text-nebula-400/60 transition-transform duration-200" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl"
            style={{
              background: 'rgba(3,3,15,0.97)',
              border: '1px solid rgba(103,232,249,0.15)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(14,165,233,0.08)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, #0EA5E9, #7C3AED, transparent)' }} />
            <div className="max-h-52 overflow-y-auto py-1.5">
              {options.map((opt) => {
                const isSelected = opt === value
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      onChange(opt)
                      setOpen(false)
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-all duration-150"
                    style={{
                      background: isSelected ? 'rgba(14,165,233,0.10)' : 'transparent',
                      color: isSelected ? '#93E6FB' : 'rgba(255,255,255,0.6)',
                    }}
                  >
                    <span className="flex-1">{opt}</span>
                    {isSelected ? <Check size={13} className="shrink-0 text-nebula-400" /> : null}
                  </button>
                )
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  error,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  placeholder?: string
  type?: string
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-white/60">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-transparent px-4 py-2.5 text-sm text-white/80 placeholder-white/25 transition-all focus:outline-none ${
          error ? 'border-red-500/60' : 'border-nebula-700/20 focus:border-nebula-500/60 focus:shadow-nebula-sm'
        }`}
      />
      {error ? <p className="mt-1 text-xs text-red-400">{error}</p> : null}
    </div>
  )
}
