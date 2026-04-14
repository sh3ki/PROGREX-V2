'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, Archive, CalendarPlus, Check, ChevronDown, Download, Edit2, Mail, Plus, Trash2 } from 'lucide-react'
import { ApexButton, ApexDateInput, ApexInput, ApexTextarea, ApexTimeInput } from '@/components/admin/apex/AdminPrimitives'
import {
  ApexFileDropzone,
  ApexBlockingSpinner,
  ApexBreadcrumbs,
  ApexCheckbox,
  ApexColumnsToggle,
  ApexConfirmationModal,
  ApexDropdown,
  ApexExportButton,
  ApexModal,
  ApexPagination,
  ApexSearchField,
  ApexStatusTabs,
  ApexToast,
  ApexToastStack,
} from '@/components/admin/apex/ApexDataUi'

type BookingRow = {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  service: string | null
  status: string
  isActive: boolean
  isArchived: boolean
  requestedDate: string | null
  requestedStartTime: string | null
  requestedDurationMinutes: number | null
  budget: string | null
  projectDetails: string | null
  attachmentUrls: string[]
  createdAt: string | null
}

type ColumnKey = 'requester' | 'service' | 'schedule' | 'budget' | 'created' | 'status' | 'actions'
type SortKey = Exclude<ColumnKey, 'actions'>

type BookingFormState = {
  id?: string
  name: string
  email: string
  phone: string
  company: string
  service: string
  requestedDate: string
  requestedStartTime: string
  requestedDurationMinutes: number
  status: string
  budget: string
  projectDetails: string
}

const STATUS_OPTIONS = ['pending', 'new', 'scheduled', 'rescheduled', 'done', 'rejected']

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

const BUDGET_OPTIONS = ['Below ₱10,000', '₱10,000 - ₱50,000', '₱50,000 - ₱150,000', '₱150,000 - ₱500,000', '₱500,000+', "Let's Discuss"]
const DURATION_OPTIONS = [10, 20, 30, 60, 90, 120]

function formatDateLabel(value: string | null) {
  if (!value) return '-'
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTimeLabel(value: string | null) {
  if (!value) return '-'
  const [hourRaw, minuteRaw] = value.split(':')
  const hour = Number(hourRaw)
  const minute = Number(minuteRaw)
  if (Number.isNaN(hour) || Number.isNaN(minute)) return value
  const date = new Date()
  date.setHours(hour, minute, 0, 0)
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function computeEndTime(startTime: string | null, durationMinutes: number | null) {
  if (!startTime || !durationMinutes) return ''
  const [hourRaw, minuteRaw] = startTime.split(':')
  const hour = Number(hourRaw)
  const minute = Number(minuteRaw)
  if (Number.isNaN(hour) || Number.isNaN(minute)) return ''
  const date = new Date()
  date.setHours(hour, minute + durationMinutes, 0, 0)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function defaultForm(): BookingFormState {
  return {
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    requestedDate: '',
    requestedStartTime: '',
    requestedDurationMinutes: 30,
    status: 'new',
    budget: '',
    projectDetails: '',
  }
}

function formFromBooking(booking: BookingRow): BookingFormState {
  return {
    id: booking.id,
    name: booking.name,
    email: booking.email,
    phone: booking.phone ?? '',
    company: booking.company ?? '',
    service: booking.service ?? '',
    requestedDate: booking.requestedDate ?? '',
    requestedStartTime: booking.requestedStartTime ?? '',
    requestedDurationMinutes: booking.requestedDurationMinutes ?? 30,
    status: booking.status,
    budget: booking.budget ?? '',
    projectDetails: booking.projectDetails ?? '',
  }
}

function normalizeStatusForEdit(value: string) {
  return STATUS_OPTIONS.includes(value) ? value : 'pending'
}

function downloadCsv(filename: string, rows: string[][]) {
  const content = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n')
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function normalizePhone(value: string) {
  return value.replace(/\D+/g, '').slice(0, 20)
}

export default function AdminBookingsTemplateView({
  bookings,
  createBookingAction,
  updateBookingAction,
  deleteBookingAction,
  bulkDeleteBookingsAction,
  bulkArchiveBookingsAction,
  toggleArchiveBookingAction,
  sendBookingEmailAction,
}: {
  bookings: BookingRow[]
  createBookingAction: (formData: FormData) => Promise<void>
  updateBookingAction: (formData: FormData) => Promise<void>
  deleteBookingAction: (formData: FormData) => Promise<void>
  bulkDeleteBookingsAction: (formData: FormData) => Promise<void>
  bulkArchiveBookingsAction: (formData: FormData) => Promise<void>
  toggleArchiveBookingAction: (formData: FormData) => Promise<void>
  sendBookingEmailAction: (formData: FormData) => Promise<void>
}) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('created')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [columns, setColumns] = useState<Record<ColumnKey, boolean>>({ requester: true, service: true, schedule: true, budget: true, created: true, status: true, actions: true })
  const [toasts, setToasts] = useState<ApexToast[]>([])
  const [pending, setPending] = useState(false)

  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [filesOpen, setFilesOpen] = useState(false)
  const [emailOpen, setEmailOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const [selectedBooking, setSelectedBooking] = useState<BookingRow | null>(null)
  const [statusTargetBooking, setStatusTargetBooking] = useState<BookingRow | null>(null)
  const [statusDraft, setStatusDraft] = useState('new')
  const [statusMenu, setStatusMenu] = useState<null | { bookingId: string; top: number; left: number; width: number }>(null)
  const [filesTargetBooking, setFilesTargetBooking] = useState<BookingRow | null>(null)
  const [selectedFileUrls, setSelectedFileUrls] = useState<string[]>([])
  const [addForm, setAddForm] = useState<BookingFormState>(defaultForm())
  const [editForm, setEditForm] = useState<BookingFormState>(defaultForm())
  const [addAttachments, setAddAttachments] = useState<File[]>([])
  const [editAttachments, setEditAttachments] = useState<File[]>([])
  const [editKeptAttachmentUrls, setEditKeptAttachmentUrls] = useState<string[]>([])
  const [emailSubject, setEmailSubject] = useState('Your PROGREX booking update')
  const [emailReply, setEmailReply] = useState('')
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string
    description: string
    confirmLabel: string
    tone: 'primary' | 'danger'
    kind: 'add' | 'edit' | 'delete' | 'bulkDelete' | 'bulkArchive' | 'toggleArchive' | 'sendEmail' | 'updateStatus'
  } | null>(null)

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return bookings.filter((booking) => {
      const statusMatch =
        status === 'all'
          ? true
          : status === 'archived'
          ? booking.isArchived
          : booking.status === status && !booking.isArchived
      const searchMatch = keyword.length === 0
        ? true
        : [booking.name, booking.email, booking.service ?? '', booking.company ?? '', booking.projectDetails ?? ''].join(' ').toLowerCase().includes(keyword)
      return statusMatch && searchMatch
    })
  }, [bookings, search, status])

  const sorted = useMemo(() => {
    const list = [...filtered]
    list.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      if (sortKey === 'requester') return a.name.localeCompare(b.name) * dir
      if (sortKey === 'service') return (a.service ?? '').localeCompare(b.service ?? '') * dir
      if (sortKey === 'schedule') return `${a.requestedDate ?? ''} ${a.requestedStartTime ?? ''}`.localeCompare(`${b.requestedDate ?? ''} ${b.requestedStartTime ?? ''}`) * dir
      if (sortKey === 'budget') return (a.budget ?? '').localeCompare(b.budget ?? '') * dir
      if (sortKey === 'created') return (a.createdAt ?? '').localeCompare(b.createdAt ?? '') * dir
      if (sortKey === 'status') return a.status.localeCompare(b.status) * dir
      return 0
    })
    return list
  }, [filtered, sortDir, sortKey])

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage))
  const safePage = Math.min(page, totalPages)
  const paged = sorted.slice((safePage - 1) * perPage, safePage * perPage)

  const counts = useMemo(() => ({
    all: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    new: bookings.filter((b) => b.status === 'new').length,
    scheduled: bookings.filter((b) => b.status === 'scheduled').length,
    rescheduled: bookings.filter((b) => b.status === 'rescheduled').length,
    done: bookings.filter((b) => b.status === 'done').length,
    rejected: bookings.filter((b) => b.status === 'rejected').length,
    archived: bookings.filter((b) => b.isArchived).length,
  }), [bookings])

  const currentPageIds = paged.map((item) => item.id)
  const allCurrentPageSelected = currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.includes(id))

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as HTMLElement
      if (target.closest('[data-booking-status-menu="true"]')) return
      if (target.closest('[data-booking-status-trigger="true"]')) return
      setStatusMenu(null)
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setStatusMenu(null)
    }

    function handleViewportChange() {
      setStatusMenu(null)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)
    window.addEventListener('resize', handleViewportChange)
    window.addEventListener('scroll', handleViewportChange, true)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
      window.removeEventListener('resize', handleViewportChange)
      window.removeEventListener('scroll', handleViewportChange, true)
    }
  }, [])

  function addToast(message: string, tone: ApexToast['tone'] = 'default') {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setToasts((prev) => [...prev, { id, message, tone }])
    setTimeout(() => setToasts((prev) => prev.filter((item) => item.id !== id)), 3500)
  }

  function toFormData(form: BookingFormState, attachments: File[] = [], keptAttachmentUrls: string[] = []) {
    const formData = new FormData()
    if (form.id) formData.set('id', form.id)
    formData.set('name', form.name)
    formData.set('email', form.email)
    formData.set('phone', normalizePhone(form.phone))
    formData.set('company', form.company)
    formData.set('service', form.service)
    formData.set('requestedDate', form.requestedDate)
    formData.set('requestedStartTime', form.requestedStartTime)
    formData.set('requestedDurationMinutes', String(form.requestedDurationMinutes || 0))
    formData.set('status', form.status)
    formData.set('budget', form.budget)
    formData.set('projectDetails', form.projectDetails)
    if (form.id) formData.set('keptAttachmentUrls', keptAttachmentUrls.join('||'))
    for (const file of attachments.slice(0, 3)) formData.append('attachments', file)
    return formData
  }

  function goToCalendarPrefill(booking: BookingRow) {
    const title = `${booking.name}${booking.service ? ` - ${booking.service}` : ''}`
    const endTime = computeEndTime(booking.requestedStartTime, booking.requestedDurationMinutes)
    const query = new URLSearchParams({
      openAdd: '1',
      title,
      eventDate: booking.requestedDate || '',
      startTime: booking.requestedStartTime || '',
      endTime,
      description: booking.projectDetails || '',
    })
    window.location.href = `/admin/calendar?${query.toString()}`
  }

  function openFileUrl(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  function exportCsv() {
    const rows = sorted.map((row) => [
      row.name,
      row.email,
      row.service ?? '',
      row.status,
      row.requestedDate ?? '',
      row.requestedStartTime ?? '',
      row.budget ?? '',
      row.createdAt ?? '',
    ])
    downloadCsv('bookings-export.csv', [['Name', 'Email', 'Service', 'Status', 'Date', 'Time', 'Budget', 'Created'], ...rows])
    addToast('Bookings CSV exported', 'success')
  }

  function onSort(nextKey: SortKey) {
    if (sortKey === nextKey) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(nextKey)
    setSortDir('asc')
  }

  function renderSortIcon(key: SortKey) {
    if (sortKey !== key) return <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
    return sortDir === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
  }

  function toggleColumn(key: string) {
    const typed = key as ColumnKey
    setColumns((prev) => ({ ...prev, [typed]: !prev[typed] }))
  }

  function toggleSelectAllCurrentPage() {
    if (allCurrentPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id)))
      return
    }
    setSelectedIds((prev) => Array.from(new Set([...prev, ...currentPageIds])))
  }

  function toggleSelectOne(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  async function executeConfirmedAction() {
    if (!confirmConfig) return
    setPending(true)

    try {
      if (confirmConfig.kind === 'add') {
        await createBookingAction(toFormData(addForm, addAttachments))
        setAddOpen(false)
        setAddForm(defaultForm())
        setAddAttachments([])
        addToast('Booking added', 'success')
      }

      if (confirmConfig.kind === 'edit') {
        await updateBookingAction(toFormData(editForm, editAttachments, editKeptAttachmentUrls))
        setEditOpen(false)
        setEditAttachments([])
        addToast('Booking updated', 'success')
      }

      if (confirmConfig.kind === 'updateStatus' && statusTargetBooking) {
        const next = formFromBooking(statusTargetBooking)
        next.status = normalizeStatusForEdit(statusDraft)
        await updateBookingAction(toFormData(next, [], statusTargetBooking.attachmentUrls || []))
        setStatusTargetBooking(null)
        addToast('Booking status updated', 'success')
      }

      if (confirmConfig.kind === 'delete' && selectedBooking) {
        const formData = new FormData()
        formData.set('id', selectedBooking.id)
        await deleteBookingAction(formData)
        setViewOpen(false)
        addToast('Booking deleted', 'success')
      }

      if (confirmConfig.kind === 'bulkDelete') {
        const formData = new FormData()
        formData.set('ids', selectedIds.join(','))
        await bulkDeleteBookingsAction(formData)
        setSelectedIds([])
        addToast('Selected bookings deleted', 'success')
      }

      if (confirmConfig.kind === 'bulkArchive') {
        const formData = new FormData()
        formData.set('ids', selectedIds.join(','))
        await bulkArchiveBookingsAction(formData)
        setSelectedIds([])
        addToast('Selected bookings archived', 'success')
      }

      if (confirmConfig.kind === 'toggleArchive' && selectedBooking) {
        const formData = new FormData()
        formData.set('id', selectedBooking.id)
        await toggleArchiveBookingAction(formData)
        addToast(selectedBooking.isArchived ? 'Booking unarchived' : 'Booking archived', 'success')
      }

      if (confirmConfig.kind === 'sendEmail' && selectedBooking && emailReply.trim()) {
        const formData = new FormData()
        formData.set('email', selectedBooking.email)
        formData.set('name', selectedBooking.name)
        formData.set('subject', emailSubject.trim() || 'Your PROGREX booking update')
        formData.set('reply', emailReply)
        await sendBookingEmailAction(formData)
        setEmailSubject('Your PROGREX booking update')
        setEmailReply('')
        setEmailOpen(false)
        addToast('Email sent', 'success')
      }

      setConfirmConfig(null)
      setConfirmOpen(false)
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Action failed.', 'danger')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-4">
      {pending ? <ApexBlockingSpinner label="Processing..." /> : null}
      <ApexToastStack toasts={toasts} onRemove={(id) => setToasts((prev) => prev.filter((item) => item.id !== id))} />

      <ApexBreadcrumbs items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Bookings' }]} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[42px] leading-none font-bold tracking-tight apx-text">Bookings</h1>
          <p className="mt-1 text-sm apx-muted">Manage booking requests.</p>
        </div>

        <button
          onClick={() => {
            setAddForm(defaultForm())
            setAddAttachments([])
            setAddOpen(true)
          }}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-0.5"
          style={{ backgroundColor: 'var(--apx-primary)' }}
        >
          <Plus className="h-4 w-4" />
          Add Booking
        </button>
      </div>

      <ApexStatusTabs
        tabs={[
          { key: 'all', label: 'All', count: counts.all },
          { key: 'pending', label: 'Pending', count: counts.pending, indicatorColor: '#64748b' },
          { key: 'new', label: 'New', count: counts.new, indicatorColor: '#3b82f6' },
          { key: 'scheduled', label: 'Scheduled', count: counts.scheduled, indicatorColor: '#eab308' },
          { key: 'rescheduled', label: 'Rescheduled', count: counts.rescheduled, indicatorColor: '#f97316' },
          { key: 'done', label: 'Done', count: counts.done, indicatorColor: '#22c55e' },
          { key: 'rejected', label: 'Rejected', count: counts.rejected, indicatorColor: '#ef4444' },
          { key: 'archived', label: 'Archived', count: counts.archived, indicatorColor: '#64748b' },
        ]}
        active={status}
        onChange={(key) => {
          setStatus(key)
          setPage(1)
          setSelectedIds([])
        }}
      />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:max-w-md">
          <ApexSearchField
            value={search}
            onChange={(value) => {
              setSearch(value)
              setPage(1)
            }}
            placeholder="Search bookings..."
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {selectedIds.length > 0 ? (
            <>
              <ApexButton
                type="button"
                variant="outline"
                onClick={() => {
                  setConfirmConfig({
                    title: 'Archive Selected Bookings',
                    description: `Archive ${selectedIds.length} selected booking(s)?`,
                    confirmLabel: 'Archive',
                    tone: 'primary',
                    kind: 'bulkArchive',
                  })
                  setConfirmOpen(true)
                }}
              >
                <Archive className="h-4 w-4" />
                Archive
              </ApexButton>
              <ApexButton
                type="button"
                variant="danger"
                onClick={() => {
                  setConfirmConfig({
                    title: 'Delete Selected Bookings',
                    description: `Delete ${selectedIds.length} selected booking(s)? This cannot be undone.`,
                    confirmLabel: 'Delete',
                    tone: 'danger',
                    kind: 'bulkDelete',
                  })
                  setConfirmOpen(true)
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected
              </ApexButton>
            </>
          ) : null}

          <ApexColumnsToggle
            columns={[
              { key: 'requester', label: 'Requester', visible: columns.requester },
              { key: 'service', label: 'Service', visible: columns.service },
              { key: 'schedule', label: 'Schedule', visible: columns.schedule },
              { key: 'budget', label: 'Budget', visible: columns.budget },
              { key: 'created', label: 'Created', visible: columns.created },
              { key: 'status', label: 'Status', visible: columns.status },
              { key: 'actions', label: 'Actions', visible: columns.actions },
            ]}
            onToggle={toggleColumn}
          />
          <ApexExportButton onClick={exportCsv} />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--apx-border)' }}>
              <th className="w-10 px-2 py-3">
                <ApexCheckbox checked={allCurrentPageSelected} onChange={toggleSelectAllCurrentPage} ariaLabel="Select all current page bookings" />
              </th>
              {columns.requester ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button type="button" className="inline-flex items-center gap-1.5" onClick={() => onSort('requester')}>
                    Requester
                    {renderSortIcon('requester')}
                  </button>
                </th>
              ) : null}
              {columns.service ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button type="button" className="inline-flex items-center gap-1.5" onClick={() => onSort('service')}>
                    Service
                    {renderSortIcon('service')}
                  </button>
                </th>
              ) : null}
              {columns.schedule ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button type="button" className="inline-flex items-center gap-1.5" onClick={() => onSort('schedule')}>
                    Schedule
                    {renderSortIcon('schedule')}
                  </button>
                </th>
              ) : null}
              {columns.budget ? <th className="px-4 py-3 font-semibold apx-text">Budget</th> : null}
              {columns.created ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button type="button" className="inline-flex items-center gap-1.5" onClick={() => onSort('created')}>
                    Created
                    {renderSortIcon('created')}
                  </button>
                </th>
              ) : null}
              {columns.status ? (
                <th className="px-4 py-3 font-semibold apx-text" style={{ minWidth: '12rem' }}>
                  <button type="button" className="inline-flex items-center gap-1.5" onClick={() => onSort('status')}>
                    Status
                    {renderSortIcon('status')}
                  </button>
                </th>
              ) : null}
              {columns.actions ? <th className="px-4 py-3 text-right font-semibold apx-text">Actions</th> : null}
            </tr>
          </thead>

          <tbody>
            {paged.map((booking) => (
              <tr
                key={booking.id}
                className={['apx-table-row border-b last:border-b-0 cursor-pointer', selectedIds.includes(booking.id) ? 'apx-table-row-selected' : ''].join(' ').trim()}
                style={{ borderColor: 'var(--apx-border)' }}
                onClick={() => {
                  setSelectedBooking(booking)
                  setViewOpen(true)
                }}
              >
                <td className="px-2 py-3" onClick={(event) => event.stopPropagation()}>
                  <ApexCheckbox checked={selectedIds.includes(booking.id)} onChange={() => toggleSelectOne(booking.id)} ariaLabel={`Select ${booking.name}`} />
                </td>
                {columns.requester ? (
                  <td className="px-4 py-3">
                    <p className="font-semibold apx-text">{booking.name}</p>
                    <p className="text-xs apx-muted">{booking.company || '-'}</p>
					<p className="text-xs apx-muted">{booking.email || '-'}</p>
					<p className="text-xs apx-muted">{booking.phone || '-'}</p>
                  </td>
                ) : null}
                {columns.service ? <td className="px-4 py-3 apx-text">{booking.service || '-'}</td> : null}
                {columns.schedule ? (
                  <td className="px-4 py-3 apx-text">
                    {booking.requestedDate ? (
                      <div>
                        <p>{formatDateLabel(booking.requestedDate)}</p>
                        <p className="text-xs apx-muted">{formatTimeLabel(booking.requestedStartTime)} | {booking.requestedDurationMinutes || 0} mins</p>
                      </div>
                    ) : '-'}
                  </td>
                ) : null}
                {columns.budget ? <td className="px-4 py-3 apx-text">{booking.budget || '-'}</td> : null}
                {columns.created ? <td className="px-4 py-3 apx-text">{formatDateLabel(booking.createdAt?.slice(0, 10) ?? null)}</td> : null}
                {columns.status ? (
                  <td className="px-4 py-3" style={{ minWidth: '12rem' }} onClick={(event) => event.stopPropagation()}>
                    <button
                      type="button"
                      data-booking-status-trigger="true"
                      onClick={(event) => {
                        const rect = (event.currentTarget as HTMLButtonElement).getBoundingClientRect()
                        setStatusMenu((prev) => {
                          if (prev?.bookingId === booking.id) return null
                          return {
                            bookingId: booking.id,
                            top: rect.bottom + 6,
                            left: rect.left,
                            width: Math.max(rect.width, 152),
                          }
                        })
                      }}
                      className="inline-flex h-8 min-w-38 items-center justify-between rounded-lg border px-2.5 text-xs font-medium capitalize transition"
                      style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface-alt)', color: 'var(--apx-text)' }}
                    >
                      <span>{booking.status}</span>
                      <ChevronDown className="h-3.5 w-3.5 opacity-80" />
                    </button>
                  </td>
                ) : null}
                {columns.actions ? (
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2" onClick={(event) => event.stopPropagation()}>
                      <button
                        type="button"
                        className="apx-icon-action"
                        onClick={() => goToCalendarPrefill(booking)}
                        aria-label={`Add ${booking.name} to calendar`}
                      >
                        <CalendarPlus className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="apx-icon-action"
                        onClick={() => {
                          setSelectedBooking(booking)
                          setEmailSubject('Your PROGREX booking update')
                          setEmailReply('')
                          setEmailOpen(true)
                        }}
                        aria-label={`Email ${booking.name}`}
                      >
                        <Mail className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="apx-icon-action"
                        onClick={() => {
                          setFilesTargetBooking(booking)
                          setSelectedFileUrls([])
                          setFilesOpen(true)
                        }}
                        aria-label={`Files for ${booking.name}`}
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="apx-icon-action"
                        onClick={() => {
                          setSelectedBooking(booking)
                          setEditForm(formFromBooking(booking))
                          setEditKeptAttachmentUrls(booking.attachmentUrls || [])
                          setEditAttachments([])
                          setEditOpen(true)
                        }}
                        aria-label={`Edit ${booking.name}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="apx-icon-action"
                        style={{ color: booking.isArchived ? '#16a34a' : '#f97316' }}
                        onClick={() => {
                          setSelectedBooking(booking)
                          setConfirmConfig({
                            title: booking.isArchived ? 'Unarchive Booking' : 'Archive Booking',
                            description: `${booking.isArchived ? 'Unarchive' : 'Archive'} ${booking.name}?`,
                            confirmLabel: booking.isArchived ? 'Unarchive' : 'Archive',
                            tone: booking.isArchived ? 'primary' : 'danger',
                            kind: 'toggleArchive',
                          })
                          setConfirmOpen(true)
                        }}
                        aria-label={`Archive toggle ${booking.name}`}
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="apx-icon-action-danger"
                        onClick={() => {
                          setSelectedBooking(booking)
                          setConfirmConfig({
                            title: 'Delete Booking',
                            description: `Delete ${booking.name}? This cannot be undone.`,
                            confirmLabel: 'Delete',
                            tone: 'danger',
                            kind: 'delete',
                          })
                          setConfirmOpen(true)
                        }}
                        aria-label={`Delete ${booking.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {statusMenu ? (
        <div
          data-booking-status-menu="true"
          className="fixed z-80 overflow-hidden rounded-xl border py-1 shadow-2xl"
          style={{
            top: statusMenu.top,
            left: statusMenu.left,
            minWidth: `${statusMenu.width}px`,
            borderColor: 'var(--apx-border)',
            backgroundColor: 'var(--apx-surface)',
          }}
        >
          {STATUS_OPTIONS.map((option) => {
            const booking = paged.find((item) => item.id === statusMenu.bookingId) || sorted.find((item) => item.id === statusMenu.bookingId)
            const isCurrent = booking?.status === option
            return (
              <button
                key={option}
                type="button"
                className="flex w-full items-center justify-between px-2.5 py-1.5 text-left text-xs capitalize transition-colors hover:bg-black/5"
                style={isCurrent ? { color: 'var(--apx-primary)', backgroundColor: 'var(--apx-primary-soft)' } : { color: 'var(--apx-text)' }}
                onClick={() => {
                  if (!booking) return
                  setStatusMenu(null)
                  setStatusTargetBooking(booking)
                  setStatusDraft(normalizeStatusForEdit(option))
                  setConfirmConfig({
                    title: 'Update Booking Status',
                    description: `Set status to ${normalizeStatusForEdit(option)}?`,
                    confirmLabel: 'Save Status',
                    tone: 'primary',
                    kind: 'updateStatus',
                  })
                  setConfirmOpen(true)
                }}
              >
                <span>{option}</span>
                {isCurrent ? <Check className="h-3.5 w-3.5" /> : null}
              </button>
            )
          })}
        </div>
      ) : null}

      <ApexPagination
        page={safePage}
        totalPages={totalPages}
        totalItems={sorted.length}
        perPage={perPage}
        rowsOptions={[10, 20, 50, 100]}
        onPerPageChange={(next) => {
          setPerPage(next)
          setPage(1)
        }}
        onPageChange={setPage}
      />

      <ApexModal size="md" open={addOpen} title="Add Booking" subtitle="Create a booking manually." onClose={() => setAddOpen(false)}>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            setConfirmConfig({
              title: 'Confirm Add Booking',
              description: `Add booking for ${addForm.name || 'this requester'}?`,
              confirmLabel: 'Add Booking',
              tone: 'primary',
              kind: 'add',
            })
            setConfirmOpen(true)
          }}
          className="grid gap-3 md:grid-cols-2"
        >
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Name</label>
            <ApexInput value={addForm.name} onChange={(event) => setAddForm((prev) => ({ ...prev, name: event.target.value }))} required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Email</label>
            <ApexInput type="email" value={addForm.email} onChange={(event) => setAddForm((prev) => ({ ...prev, email: event.target.value }))} required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Phone</label>
            <ApexInput type="tel" inputMode="numeric" maxLength={20} value={addForm.phone} onChange={(event) => setAddForm((prev) => ({ ...prev, phone: normalizePhone(event.target.value) }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Company</label>
            <ApexInput value={addForm.company} onChange={(event) => setAddForm((prev) => ({ ...prev, company: event.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Budget</label>
            <ApexDropdown
              value={addForm.budget}
              options={BUDGET_OPTIONS.map((option) => ({ value: option, label: option }))}
              placeholder="Select budget"
              onChange={(value) => setAddForm((prev) => ({ ...prev, budget: value }))}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Service</label>
            <ApexDropdown
              value={addForm.service}
              options={SERVICE_OPTIONS.map((option) => ({ value: option, label: option }))}
              placeholder="Select service"
              onChange={(value) => setAddForm((prev) => ({ ...prev, service: value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Date</label>
            <ApexDateInput value={addForm.requestedDate} onChange={(event) => setAddForm((prev) => ({ ...prev, requestedDate: event.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Start Time</label>
            <ApexTimeInput value={addForm.requestedStartTime} onChange={(event) => setAddForm((prev) => ({ ...prev, requestedStartTime: event.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Duration (mins)</label>
            <ApexDropdown
              value={String(addForm.requestedDurationMinutes || 30)}
              options={DURATION_OPTIONS.map((option) => ({ value: String(option), label: `${option} mins` }))}
              onChange={(value) => setAddForm((prev) => ({ ...prev, requestedDurationMinutes: Number(value) || 30 }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Status</label>
            <ApexDropdown
              value={addForm.status}
              options={STATUS_OPTIONS.map((option) => ({ value: option, label: option }))}
              onChange={(value) => setAddForm((prev) => ({ ...prev, status: normalizeStatusForEdit(value) }))}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Project Details</label>
            <ApexTextarea rows={4} value={addForm.projectDetails} onChange={(event) => setAddForm((prev) => ({ ...prev, projectDetails: event.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Attachments (optional, up to 3)</label>
            <ApexFileDropzone maxFiles={3} maxSizeMb={10} files={addAttachments} onFilesChange={setAddAttachments} />
            {addAttachments.length ? <p className="mt-1 text-xs apx-muted">{addAttachments.length} file(s) selected</p> : null}
          </div>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <ApexButton type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</ApexButton>
            <ApexButton type="submit">Save Booking</ApexButton>
          </div>
        </form>
      </ApexModal>

      <ApexModal size="md" open={editOpen} title="Edit Booking" subtitle="Update booking details." onClose={() => setEditOpen(false)}>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            setConfirmConfig({
              title: 'Confirm Edit Booking',
              description: `Save changes for ${editForm.name || 'this booking'}?`,
              confirmLabel: 'Save Changes',
              tone: 'primary',
              kind: 'edit',
            })
            setConfirmOpen(true)
          }}
          className="grid gap-3 md:grid-cols-2"
        >
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Name</label>
            <ApexInput value={editForm.name} onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))} required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Email</label>
            <ApexInput type="email" value={editForm.email} onChange={(event) => setEditForm((prev) => ({ ...prev, email: event.target.value }))} required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Phone</label>
            <ApexInput type="tel" inputMode="numeric" maxLength={20} value={editForm.phone} onChange={(event) => setEditForm((prev) => ({ ...prev, phone: normalizePhone(event.target.value) }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Company</label>
            <ApexInput value={editForm.company} onChange={(event) => setEditForm((prev) => ({ ...prev, company: event.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Budget</label>
            <ApexDropdown
              value={editForm.budget}
              options={BUDGET_OPTIONS.map((option) => ({ value: option, label: option }))}
              placeholder="Select budget"
              onChange={(value) => setEditForm((prev) => ({ ...prev, budget: value }))}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Service</label>
            <ApexDropdown
              value={editForm.service}
              options={SERVICE_OPTIONS.map((option) => ({ value: option, label: option }))}
              placeholder="Select service"
              onChange={(value) => setEditForm((prev) => ({ ...prev, service: value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Date</label>
            <ApexDateInput value={editForm.requestedDate} onChange={(event) => setEditForm((prev) => ({ ...prev, requestedDate: event.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Start Time</label>
            <ApexTimeInput value={editForm.requestedStartTime} onChange={(event) => setEditForm((prev) => ({ ...prev, requestedStartTime: event.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Duration (mins)</label>
            <ApexDropdown
              value={String(editForm.requestedDurationMinutes || 30)}
              options={DURATION_OPTIONS.map((option) => ({ value: String(option), label: `${option} mins` }))}
              onChange={(value) => setEditForm((prev) => ({ ...prev, requestedDurationMinutes: Number(value) || 30 }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Status</label>
            <ApexDropdown
              value={editForm.status}
              options={STATUS_OPTIONS.map((option) => ({ value: option, label: option }))}
              onChange={(value) => setEditForm((prev) => ({ ...prev, status: normalizeStatusForEdit(value) }))}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Project Details</label>
            <ApexTextarea rows={4} value={editForm.projectDetails} onChange={(event) => setEditForm((prev) => ({ ...prev, projectDetails: event.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Existing Attachments</label>
            <div className="space-y-2">
              {(editKeptAttachmentUrls || []).map((url) => {
                return (
                  <div key={url} className="flex items-center justify-between rounded-lg border px-3 py-2 gap-6" style={{ borderColor: 'var(--apx-border)' }}>
                    <span className="truncate text-xs apx-text">{url.split('/').pop() || 'file'}</span>
                    <ApexButton
                      type="button"
                      variant="danger"
                      onClick={() => setEditKeptAttachmentUrls((prev) => prev.filter((item) => item !== url))}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </ApexButton>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Add Attachments (up to 3 total)</label>
            <ApexFileDropzone
              maxFiles={Math.max(0, 3 - editKeptAttachmentUrls.length)}
              maxSizeMb={10}
              files={editAttachments}
              onFilesChange={setEditAttachments}
            />
            {editAttachments.length ? <p className="mt-1 text-xs apx-muted">{editAttachments.length} new file(s) selected</p> : null}
          </div>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <ApexButton type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</ApexButton>
            <ApexButton type="submit">Save Changes</ApexButton>
          </div>
        </form>
      </ApexModal>

      <ApexModal size="md" open={viewOpen} title="Booking Details" subtitle="View complete booking information." onClose={() => setViewOpen(false)}>
        {selectedBooking ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium apx-muted">Name</p>
                <p className="apx-text font-semibold">{selectedBooking.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium apx-muted">Email</p>
                <p className="apx-text">{selectedBooking.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium apx-muted">Phone</p>
                <p className="apx-text">{selectedBooking.phone || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-medium apx-muted">Company</p>
                <p className="apx-text">{selectedBooking.company || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-medium apx-muted">Service</p>
                <p className="apx-text">{selectedBooking.service || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-medium apx-muted">Status</p>
                <p className="apx-text">{selectedBooking.isArchived ? 'archived' : selectedBooking.status}</p>
              </div>
              <div>
                <p className="text-xs font-medium apx-muted">Schedule</p>
                <p className="apx-text">{formatDateLabel(selectedBooking.requestedDate)} {selectedBooking.requestedStartTime ? `| ${formatTimeLabel(selectedBooking.requestedStartTime)}` : ''}</p>
              </div>
              <div>
                <p className="text-xs font-medium apx-muted">Duration</p>
                <p className="apx-text">{selectedBooking.requestedDurationMinutes || 0} mins</p>
              </div>
              <div>
                <p className="text-xs font-medium apx-muted">Budget</p>
                <p className="apx-text">{selectedBooking.budget || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-medium apx-muted">Created</p>
                <p className="apx-text">{formatDateLabel(selectedBooking.createdAt?.slice(0, 10) ?? null)}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium apx-muted">Project Details</p>
              <p className="apx-text whitespace-pre-wrap">{selectedBooking.projectDetails || '-'}</p>
            </div>
            <div>
              <p className="text-xs font-medium apx-muted">Attachments</p>
              <div className="mt-1 space-y-1">
                {(selectedBooking.attachmentUrls || []).length ? (
                  selectedBooking.attachmentUrls.map((url) => (
                    <button key={url} type="button" className="inline-flex items-center gap-1.5 text-xs apx-text hover:underline" onClick={() => openFileUrl(url)}>
                      <Download className="h-3.5 w-3.5" />
                      {url.split('/').pop() || 'file'}
                    </button>
                  ))
                ) : (
                  <p className="text-xs apx-muted">No attachments</p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <ApexButton type="button" variant="outline" onClick={() => setViewOpen(false)}>Close</ApexButton>
            </div>
          </div>
        ) : null}
      </ApexModal>

      <ApexModal size="md" open={emailOpen} title="Send Booking Email" subtitle="Write a subject and response." onClose={() => setEmailOpen(false)}>
        {selectedBooking ? (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium apx-muted">To</label>
              <ApexInput value={selectedBooking.email} disabled />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium apx-muted">Subject</label>
              <ApexInput value={emailSubject} onChange={(event) => setEmailSubject(event.target.value)} placeholder="Email subject" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium apx-muted">Message</label>
              <ApexTextarea rows={5} value={emailReply} onChange={(event) => setEmailReply(event.target.value)} placeholder="Write your response..." />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <ApexButton type="button" variant="outline" onClick={() => setEmailOpen(false)}>Cancel</ApexButton>
              <ApexButton
                type="button"
                onClick={() => {
                  setConfirmConfig({
                    title: 'Send Booking Email',
                    description: `Send reply to ${selectedBooking.email}?`,
                    confirmLabel: 'Send',
                    tone: 'primary',
                    kind: 'sendEmail',
                  })
                  setConfirmOpen(true)
                }}
                disabled={!emailReply.trim()}
              >
                <Mail className="h-4 w-4" />
                Send Email
              </ApexButton>
            </div>
          </div>
        ) : null}
      </ApexModal>

      <ApexModal size="md" open={filesOpen} title="Booking Files" subtitle="Download attached files." onClose={() => setFilesOpen(false)}>
        {filesTargetBooking ? (
          <div className="space-y-3">
            <div className="space-y-2">
              {(filesTargetBooking.attachmentUrls || []).length ? (
                filesTargetBooking.attachmentUrls.map((url) => (
                  <div key={url} className="flex items-center justify-between rounded-lg border px-3 py-2 gap-6" style={{ borderColor: 'var(--apx-border)' }}>
                    <div className="flex items-center gap-2 truncate">
                      <ApexCheckbox
                        checked={selectedFileUrls.includes(url)}
                        onChange={() => {
                          setSelectedFileUrls((prev) => (prev.includes(url) ? prev.filter((item) => item !== url) : [...prev, url]))
                        }}
                        ariaLabel="Select file"
                      />
                      <span className="truncate text-xs apx-text">{url.split('/').pop() || 'file'}</span>
                    </div>
                    <ApexButton type="button" variant="outline" onClick={() => openFileUrl(url)}>
                      <Download className="h-4 w-4" />
                      Download
                    </ApexButton>
                  </div>
                ))
              ) : (
                <p className="text-sm apx-muted">No attachments found.</p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <ApexButton type="button" variant="outline" onClick={() => setFilesOpen(false)}>Close</ApexButton>
              <ApexButton
                type="button"
                onClick={() => {
                  for (const url of selectedFileUrls) openFileUrl(url)
                }}
                disabled={selectedFileUrls.length === 0}
              >
                <Download className="h-4 w-4" />
                Download Selected
              </ApexButton>
            </div>
          </div>
        ) : null}
      </ApexModal>

      <ApexConfirmationModal
        open={confirmOpen && Boolean(confirmConfig)}
        title={confirmConfig?.title || 'Confirm'}
        description={confirmConfig?.description || 'Please confirm this action.'}
        confirmLabel={confirmConfig?.confirmLabel || 'Confirm'}
        tone={confirmConfig?.tone || 'primary'}
        pending={pending}
        onClose={() => {
          if (pending) return
          setConfirmOpen(false)
          setConfirmConfig(null)
        }}
        onConfirm={executeConfirmedAction}
      />
    </div>
  )
}
