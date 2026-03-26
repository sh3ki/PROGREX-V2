'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Phone, MapPin, Send, CheckCircle, Github, Twitter, Facebook, Instagram, Youtube, ChevronDown, Check, Paperclip, X as XIcon, ExternalLink, CalendarDays } from 'lucide-react'

const TikTokIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.31 6.31 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.51a8.18 8.18 0 004.78 1.53V7.59a4.85 4.85 0 01-1.01-.9z" />
  </svg>
)

const WhatsAppIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)
import SectionWrapper from '@/components/SectionWrapper'
import ConstellationDecor from '@/components/ConstellationDecor'
import { useTranslation } from '@/components/TranslationProvider'

interface FormData {
  name: string
  email: string
  phone: string
  company: string
  service: string
  otherService: string
  budget: string
  message: string
}

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

const BOOKING_DURATION_OPTIONS = [5, 10, 15, 30, 60, 90, 120]

export default function ContactClient() {
  const { t, translations } = useTranslation()
  const budgets = translations.form.budgetOptions as unknown as string[]
  const socialLabels = translations.contact.socialLabels as unknown as string[]

  const [form, setForm] = useState<FormData>({
    name: '', email: '', phone: '', company: '', service: '', otherService: '', budget: '', message: '',
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
  const [bookingDraft, setBookingDraft] = useState<BookingSelection>({ date: '', startTime: '', durationMinutes: 30 })
  const [customDuration, setCustomDuration] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const MAX_FILE_SIZE = 10 * 1024 * 1024

  function toMinutes(time: string) {
    const [hourRaw, minuteRaw] = time.split(':')
    return Number(hourRaw) * 60 + Number(minuteRaw)
  }

  function hasBookingOverlap(date: string, startTime: string, durationMinutes: number) {
    const dateEvents = availability.filter((event) => event.event_date === date)
    const start = toMinutes(startTime)
    const end = start + durationMinutes
    return dateEvents.some((event) => {
      if (!event.start_time) return false
      const eventStart = toMinutes(event.start_time)
      const eventEnd = toMinutes(event.end_time || event.start_time)
      return start < eventEnd && end > eventStart
    })
  }

  const handleFileSelect = (file: File) => {
    setFileError('')
    if (file.size > MAX_FILE_SIZE) {
      setFileError(`${t('form.fileTooBig')} "${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)} MB.`)
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

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {}
    if (!form.name.trim()) newErrors.name = t('form.nameRequired')
    if (!form.email.trim()) newErrors.email = t('form.emailRequired')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = t('form.invalidEmail')
    if (!form.message.trim()) newErrors.message = t('form.messageRequired')
    if (!form.service.trim()) newErrors.service = 'Please select a service.'
    if (form.service === 'Others' && !form.otherService.trim()) newErrors.otherService = 'Please enter your custom service.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  useEffect(() => {
    if (!bookingModalOpen && !bookMeeting) return
    fetch('/api/contact?mode=availability')
      .then((response) => response.json())
      .then((data: { events?: AvailabilityEvent[] }) => setAvailability(data.events || []))
      .catch(() => setAvailability([]))
  }, [bookingModalOpen, bookMeeting])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setServerError('')
    try {
      if (bookMeeting && !selectedBooking) {
        throw new Error('Please save your meeting schedule first.')
      }

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

      const res = await fetch('/api/contact', {
        method: 'POST',
        body: payload,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('form.failedToSend'))
      setAttachedFiles([])
      setSelectedBooking(null)
      setSubmitted(true)
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : t('form.serverError'))
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function saveBookingSelection() {
    const duration = customDuration.trim() ? Number(customDuration) : bookingDraft.durationMinutes
    if (!bookingDraft.date || !bookingDraft.startTime || !duration) {
      setServerError('Please complete date, start time, and duration for the meeting.')
      return
    }

    if (hasBookingOverlap(bookingDraft.date, bookingDraft.startTime, duration)) {
      setServerError('The selected meeting time overlaps an existing schedule.')
      return
    }

    setSelectedBooking({ date: bookingDraft.date, startTime: bookingDraft.startTime, durationMinutes: duration })
    setBookingModalOpen(false)
    setServerError('')
  }

  return (
    <>
      {/* Hero */}
      <section className="relative pt-28 pb-4 overflow-hidden bg-section-a">
        <div className="absolute inset-0 bg-dot-grid opacity-15" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-125 h-75 sm:h-100 bg-nebula-700/10 rounded-full blur-[100px]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="eyebrow-badge mb-4 justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-nebula-500 animate-pulse" />
              {t('contact.badge')}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
              {t('contact.title')} <span className="text-gradient-nebula">{t('contact.highlight')}</span>
            </h1>
            <p className="text-slate-300 text-lg max-w-xl mx-auto leading-relaxed">
              {t('contact.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      <SectionWrapper className="bg-section-a" decoration={<ConstellationDecor name="gemini" side="right" offsetY="15%" />}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Form */}
          <div className="lg:col-span-3">
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
                    className="w-16 h-16 rounded-full bg-linear-to-br from-nebula-700 to-aurora-600 flex items-center justify-center mx-auto mb-6 shadow-nebula"
                  >
                    <CheckCircle size={28} className="text-white" />
                  </motion.div>
                  <h2 className="text-2xl font-extrabold text-white mb-3">{t('form.successTitle')}</h2>
                  <p className="text-slate-400 leading-relaxed mb-6">
                    Thank you, <strong className="text-white">{form.name}</strong>! {t('form.successMsg')}
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false)
                      setForm({ name: '', email: '', phone: '', company: '', service: '', otherService: '', budget: '', message: '' })
                      setAttachedFiles([])
                      setSelectedBooking(null)
                      setBookMeeting(false)
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
                  className="glass-card rounded-2xl p-6 sm:p-8 border border-nebula-700/20 space-y-5"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h2 className="text-xl font-bold text-white">{t('contact.formHeading')}</h2>
                    <button
                      type="button"
                      className="rounded-lg border border-nebula-500/50 px-3 py-1.5 text-xs font-semibold text-nebula-200 transition hover:bg-nebula-700/20"
                    >
                      Video Call with Our Team
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label={`${t('form.fullName')} ${t('form.required')}`} value={form.name} onChange={(v) => handleChange('name', v)} error={errors.name} placeholder={t('form.namePlaceholder')} />
                    <Field label={`${t('form.email')} ${t('form.required')}`} type="email" value={form.email} onChange={(v) => handleChange('email', v)} error={errors.email} placeholder={t('form.emailPlaceholder')} />
                    <Field label={t('form.phone')} type="tel" value={form.phone} onChange={(v) => handleChange('phone', v)} placeholder={t('form.phonePlaceholder')} />
                    <Field label={t('form.company')} value={form.company} onChange={(v) => handleChange('company', v)} placeholder={t('form.companyPlaceholder')} />
                  </div>

                  <div className="rounded-xl border border-nebula-700/30 p-4">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-200">
                      <input
                        type="checkbox"
                        checked={bookMeeting}
                        onChange={(event) => {
                          const checked = event.target.checked
                          setBookMeeting(checked)
                          if (!checked) setSelectedBooking(null)
                        }}
                        className="h-4 w-4 rounded border-nebula-700/40 bg-transparent"
                      />
                      Book a Meeting
                    </label>

                    {bookMeeting ? (
                      <div className="mt-3 space-y-2">
                        {selectedBooking ? (
                          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                            {selectedBooking.date} at {selectedBooking.startTime} ({selectedBooking.durationMinutes} minutes)
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400">No meeting schedule selected yet.</p>
                        )}
                        <button
                          type="button"
                          onClick={() => setBookingModalOpen(true)}
                          className="inline-flex items-center gap-2 rounded-lg border border-nebula-500/50 px-3 py-2 text-xs font-semibold text-nebula-100 transition hover:bg-nebula-700/25"
                        >
                          <CalendarDays size={14} />
                          {selectedBooking ? 'Edit Booking Schedule' : 'Open Booking Calendar'}
                        </button>
                      </div>
                    ) : null}
                  </div>

                  {/* Service */}
                  <CustomSelect
                    label={t('form.service')}
                    value={form.service}
                    onChange={(v) => handleChange('service', v)}
                    options={SERVICE_OPTIONS}
                    placeholder={t('form.servicePlaceholder')}
                  />
                  {errors.service && <p className="-mt-3 text-xs text-red-400">{errors.service}</p>}

                  {form.service === 'Others' ? (
                    <Field
                      label="Specify Other Service"
                      value={form.otherService}
                      onChange={(v) => handleChange('otherService', v)}
                      error={errors.otherService}
                      placeholder="Type your requested service"
                    />
                  ) : null}

                  {/* Budget */}
                  <CustomSelect
                    label={t('form.budget')}
                    value={form.budget}
                    onChange={(v) => handleChange('budget', v)}
                    options={budgets}
                    placeholder={t('form.budgetPlaceholder')}
                  />

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('form.projectDetails')} {t('form.required')}</label>
                    <textarea
                      value={form.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      rows={4}
                      placeholder={t('form.detailsPlaceholder')}
                      className={`w-full px-4 py-2.5 rounded-xl glass border bg-transparent text-slate-200 text-sm placeholder-slate-500 focus:outline-none transition-all resize-none ${
                        errors.message ? 'border-red-500/60' : 'border-nebula-700/20 focus:border-nebula-500/60 focus:shadow-nebula-sm'
                      }`}
                    />
                    {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}

                    {/* File attachment drop zone */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault()
                        setDragOver(false)
                        const files = Array.from(e.dataTransfer.files)
                        files.forEach((file) => handleFileSelect(file))
                      }}
                      className={`mt-3 flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed cursor-pointer transition-all duration-200 ${
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
                        onChange={(e) => {
                          const files = Array.from(e.target.files || [])
                          files.forEach((file) => handleFileSelect(file))
                          e.target.value = ''
                        }}
                      />
                      {attachedFiles.length > 0 ? (
                        <>
                          <div className="flex flex-1 flex-col gap-1.5 min-w-0">
                            {attachedFiles.map((file, index) => (
                              <div key={`${file.name}-${index}`} className="flex items-center gap-2 min-w-0">
                                <Check size={14} className="text-emerald-400 shrink-0" />
                                <span className="text-white/70 text-xs truncate">{file.name}</span>
                                <span className="text-slate-500 text-xs shrink-0">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setAttachedFiles((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
                                    setFileError('')
                                  }}
                                  className="shrink-0 text-slate-500 hover:text-red-400 transition-colors"
                                >
                                  <XIcon size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <>
                          <Paperclip size={14} className="text-nebula-400/60 shrink-0" />
                          <span className="text-slate-500 text-xs">
                            {dragOver ? t('form.fileDrop') : t('form.fileAttach')}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">Up to 3 files, max 10MB each. Document formats only.</p>
                    {fileError && <p className="text-red-400 text-xs mt-1.5">{fileError}</p>}
                  </div>

                  {serverError && (
                    <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{serverError}</p>
                  )}

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary w-full justify-center py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{loading ? t('form.sending') : t('form.send')}</span>
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      <Send size={16} />
                    )}
                  </motion.button>

                  {bookingModalOpen ? (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4">
                      <div className="w-full max-w-2xl rounded-2xl border border-nebula-700/40 bg-[#070f1e] p-5">
                        <div className="mb-4 flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-white">Book a Meeting</h3>
                          <button type="button" onClick={() => setBookingModalOpen(false)} className="text-slate-400 hover:text-white">
                            <XIcon size={16} />
                          </button>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-xs font-medium text-slate-300">Date</label>
                            <input
                              type="date"
                              value={bookingDraft.date}
                              onChange={(event) => setBookingDraft((prev) => ({ ...prev, date: event.target.value }))}
                              className="w-full rounded-xl border border-nebula-700/30 bg-transparent px-3 py-2 text-sm text-slate-200"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-slate-300">Start Time</label>
                            <input
                              type="time"
                              value={bookingDraft.startTime}
                              onChange={(event) => setBookingDraft((prev) => ({ ...prev, startTime: event.target.value }))}
                              className="w-full rounded-xl border border-nebula-700/30 bg-transparent px-3 py-2 text-sm text-slate-200"
                            />
                          </div>

                          <div>
                            <label className="mb-1 block text-xs font-medium text-slate-300">Duration</label>
                            <select
                              value={String(bookingDraft.durationMinutes)}
                              onChange={(event) => setBookingDraft((prev) => ({ ...prev, durationMinutes: Number(event.target.value) || 30 }))}
                              className="w-full rounded-xl border border-nebula-700/30 bg-transparent px-3 py-2 text-sm text-slate-200"
                            >
                              {BOOKING_DURATION_OPTIONS.map((minutes) => (
                                <option key={minutes} value={minutes}>{minutes} minutes</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-slate-300">Custom Minutes (Optional)</label>
                            <input
                              type="number"
                              min={1}
                              value={customDuration}
                              onChange={(event) => setCustomDuration(event.target.value)}
                              placeholder="e.g. 45"
                              className="w-full rounded-xl border border-nebula-700/30 bg-transparent px-3 py-2 text-sm text-slate-200"
                            />
                          </div>
                        </div>

                        <div className="mt-4 rounded-xl border border-nebula-700/30 p-3">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Booked Slots</p>
                          {!bookingDraft.date ? (
                            <p className="text-xs text-slate-500">Select a date to view occupied times.</p>
                          ) : (
                            <div className="space-y-1">
                              {availability
                                .filter((event) => event.event_date === bookingDraft.date && event.start_time)
                                .map((event, index) => (
                                  <p key={`${event.event_date}-${event.start_time}-${index}`} className="text-xs text-slate-300">
                                    booked {event.start_time}{event.end_time ? ` - ${event.end_time}` : ''}
                                  </p>
                                ))}
                              {availability.filter((event) => event.event_date === bookingDraft.date && event.start_time).length === 0 ? (
                                <p className="text-xs text-emerald-300">No occupied slots for this date.</p>
                              ) : null}
                            </div>
                          )}
                        </div>

                        <div className="mt-5 flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setBookingModalOpen(false)}
                            className="rounded-lg border border-nebula-700/30 px-3 py-2 text-xs font-semibold text-slate-300"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={saveBookingSelection}
                            className="rounded-lg bg-nebula-600 px-3 py-2 text-xs font-semibold text-white"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-5">
            <div className="glass-card rounded-2xl p-6 border border-nebula-700/20">
              <h3 className="text-white font-bold mb-5">{t('contact.infoHeading')}</h3>
              <div className="space-y-4">
                {[
                  { icon: <Mail size={16} />, label: t('contact.generalLabel'), value: 'info@progrex.cloud', href: 'mailto:info@progrex.cloud' },
                  { icon: <Mail size={16} />, label: t('contact.contactLabel'), value: 'contact@progrex.cloud', href: 'mailto:contact@progrex.cloud' },
                  { icon: <Mail size={16} />, label: t('contact.supportLabel'), value: 'support@progrex.cloud', href: 'mailto:support@progrex.cloud' },
                  { icon: <Phone size={16} />, label: t('contact.phoneLabel'), value: '+63 956 593 4460', href: 'tel:+639565934460' },
                  { icon: <MapPin size={16} />, label: t('contact.officeLabel'), value: 'Calauan, Laguna, Philippines', href: 'https://maps.app.goo.gl/obdsRKxLpNnmu2Bd8' },
                ].map((item) => (
                  <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 group">
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-nebula-700 to-aurora-600 flex items-center justify-center text-white shrink-0 group-hover:shadow-nebula-sm transition-all">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">{item.label}</div>
                      <div className="text-sm text-white/70 group-hover:text-nebula-300 transition-colors">{item.value}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Map — Calauan, Laguna (static-like: pointer events disabled on iframe, click opens Google Maps) */}
            <a
              href="https://maps.app.goo.gl/obdsRKxLpNnmu2Bd8"
              target="_blank"
              rel="noopener noreferrer"
              className="block glass-card rounded-2xl p-1 border border-nebula-700/20 overflow-hidden group cursor-pointer"
            >
              <div className="h-48 rounded-xl overflow-hidden relative">
                <iframe
                  title="Calauan, Laguna, Philippines"
                  src="https://maps.google.com/maps?q=Calauan,+Laguna,+Philippines&t=&z=13&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)', pointerEvents: 'none' }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                {/* hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1.5 text-white text-xs font-mono bg-black/70 px-3 py-1.5 rounded-lg border border-white/10">
                    <ExternalLink size={11} /> {t('contact.openMaps')}
                  </span>
                </div>
              </div>
            </a>

            {/* Social */}
            <div className="glass-card rounded-2xl p-5 pr-4 border border-nebula-700/20">
              <h4 className="text-white font-bold text-sm mb-4">{t('contact.followUs')}</h4>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: <Facebook size={16} />, label: socialLabels[0], href: 'https://www.facebook.com/progrex.tech' },
                  { icon: <Instagram size={16} />, label: socialLabels[1], href: 'https://www.instagram.com/progrex.tech' },
                  { icon: <Twitter size={16} />, label: socialLabels[2], href: 'https://x.com/progrex_tech' },
                  { icon: <TikTokIcon size={16} />, label: socialLabels[3], href: 'https://www.tiktok.com/@progrex.tech' },
                  { icon: <Youtube size={16} />, label: socialLabels[4], href: 'https://www.youtube.com/@progrex.technologies' },
                  { icon: <WhatsAppIcon size={16} />, label: socialLabels[5], href: 'https://wa.me/639565934460' },
                  { icon: <Github size={16} />, label: socialLabels[6], href: 'https://github.com/progrex-tech' },
                  { icon: <MapPin size={16} />, label: socialLabels[7], href: 'https://maps.app.goo.gl/obdsRKxLpNnmu2Bd8' },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-9 h-9 rounded-lg glass border border-nebula-700/20 flex items-center justify-center text-white/40 hover:text-nebula-300 hover:border-nebula-500/50 hover:shadow-nebula-sm transition-all duration-200"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Response time */}
            <div className="glass-card rounded-2xl p-5 border border-nebula-700/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-sm font-mono">{t('contact.responseStatus')}</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                {t('contact.responseMsg')} <strong className="text-white">{t('contact.responseTime')}</strong>{t('contact.responseUrgent')}
              </p>
            </div>
          </div>
        </div>
      </SectionWrapper>
    </>
  )
}

// ── Custom Dropdown (Navbar-style) ───────────────────────────────────────────
function CustomSelect({
  label, value, onChange, options, placeholder,
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
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all duration-200"
        style={{
          background: open ? 'rgba(14,165,233,0.08)' : 'rgba(103,232,249,0.04)',
          border: `1px solid ${open ? 'rgba(14,165,233,0.45)' : 'rgba(103,232,249,0.18)'}`,
          color: value ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)',
        }}
      >
        <span>{value || placeholder}</span>
        <ChevronDown
          size={14}
          className="shrink-0 text-nebula-400/60 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-full mt-2 rounded-xl overflow-hidden z-50"
            style={{
              background: 'rgba(3,3,15,0.97)',
              border: '1px solid rgba(103,232,249,0.15)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(14,165,233,0.08)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Top gradient line */}
            <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, #0EA5E9, #7C3AED, transparent)' }} />
            <div className="py-1.5 max-h-52 overflow-y-auto">
              {options.map((opt) => {
                const isSelected = opt === value
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => { onChange(opt); setOpen(false) }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-all duration-150"
                    style={{
                      background: isSelected ? 'rgba(14,165,233,0.10)' : 'transparent',
                      color: isSelected ? '#93E6FB' : 'rgba(255,255,255,0.6)',
                    }}
                    onMouseEnter={(e) => { if (!isSelected) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#fff' } }}
                    onMouseLeave={(e) => { if (!isSelected) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' } }}
                  >
                    <span className="flex-1">{opt}</span>
                    {isSelected && <Check size={13} className="shrink-0 text-nebula-400" />}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Reusable text / email / tel field ────────────────────────────────────────
function Field({
  label, value, onChange, error, placeholder, type = 'text',
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
      <label className="block text-sm font-medium text-white/60 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 rounded-xl glass border bg-transparent text-white/80 text-sm placeholder-white/25 focus:outline-none transition-all ${
          error ? 'border-red-500/60' : 'border-nebula-700/20 focus:border-nebula-500/60 focus:shadow-nebula-sm'
        }`}
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}
