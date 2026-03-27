'use client'

import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, CalendarClock, Edit2, Mail, Plus, Trash2, UserX } from 'lucide-react'
import { ApexButton, ApexInput, ApexTextarea } from '@/components/admin/apex/AdminPrimitives'
import {
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
  message: string | null
  status: string
  isApproved: boolean
  isActive: boolean
  requestedDate: string | null
  requestedStartTime: string | null
  requestedDurationMinutes: number | null
  createdAt: string | null
}

type ColumnKey = 'requester' | 'service' | 'schedule' | 'status' | 'active' | 'createdAt' | 'actions'
type SortKey = Exclude<ColumnKey, 'actions'>
type StatusFilter = 'all' | 'active' | 'inactive'

type BookingFormState = {
  id?: string
  name: string
  email: string
  phone: string
  company: string
  service: string
  message: string
  status: string
  requestedDate: string
  requestedStartTime: string
  requestedDurationMinutes: number
  isApproved: boolean
  isActive: boolean
}

const BOOKING_STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'in-review', label: 'In Review' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'rescheduled', label: 'Rescheduled' },
  { value: 'done', label: 'Done' },
  { value: 'rejected', label: 'Rejected' },
]

const ACTIVE_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

function toRelative(value: string | null) {
  if (!value) return 'Unknown'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown'

  const diffMs = Date.now() - date.getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`

  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`

  return date.toLocaleDateString()
}

function downloadCsv(filename: string, rows: string[][]) {
  const content = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function statusBadgeStyle(status: string) {
  if (status === 'done') return { backgroundColor: 'rgba(22,163,74,0.15)', color: '#15803d' }
  if (status === 'scheduled' || status === 'rescheduled') return { backgroundColor: 'rgba(37,99,235,0.16)', color: '#1d4ed8' }
  if (status === 'rejected') return { backgroundColor: 'rgba(220,38,38,0.16)', color: '#b91c1c' }
  if (status === 'in-review') return { backgroundColor: 'rgba(245,158,11,0.18)', color: '#b45309' }
  return { backgroundColor: 'rgba(100,116,139,0.2)', color: '#334155' }
}

function defaultForm(): BookingFormState {
  return {
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    message: '',
    status: 'new',
    requestedDate: '',
    requestedStartTime: '',
    requestedDurationMinutes: 30,
    isApproved: false,
    isActive: true,
  }
}

function formFromBooking(item: BookingRow): BookingFormState {
  return {
    id: item.id,
    name: item.name,
    email: item.email,
    phone: item.phone || '',
    company: item.company || '',
    service: item.service || '',
    message: item.message || '',
    status: item.status || 'new',
    requestedDate: item.requestedDate || '',
    requestedStartTime: item.requestedStartTime || '',
    requestedDurationMinutes: item.requestedDurationMinutes || 30,
    isApproved: item.isApproved,
    isActive: item.isActive,
  }
}

export default function AdminBookingsTemplateView({
  bookings,
  createBookingAction,
  updateBookingAction,
  deleteBookingAction,
  bulkDeleteBookingsAction,
  bulkSetInactiveBookingsAction,
  sendBookingEmailAction,
}: {
  bookings: BookingRow[]
  createBookingAction: (formData: FormData) => Promise<void>
  updateBookingAction: (formData: FormData) => Promise<void>
  deleteBookingAction: (formData: FormData) => Promise<void>
  bulkDeleteBookingsAction: (formData: FormData) => Promise<void>
  bulkSetInactiveBookingsAction: (formData: FormData) => Promise<void>
  sendBookingEmailAction: (formData: FormData) => Promise<void>
}) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [columns, setColumns] = useState<Record<ColumnKey, boolean>>({
    requester: true,
    service: true,
    schedule: true,
    status: true,
    active: true,
    createdAt: true,
    actions: true,
  })

  const [toasts, setToasts] = useState<ApexToast[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectedRow, setSelectedRow] = useState<BookingRow | null>(null)

  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [emailOpen, setEmailOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState(false)

  const [addForm, setAddForm] = useState<BookingFormState>(defaultForm())
  const [editForm, setEditForm] = useState<BookingFormState>(defaultForm())
  const [emailForm, setEmailForm] = useState({ id: '', toEmail: '', name: '', subject: 'Your PROGREX booking update', reply: '' })
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const [confirmConfig, setConfirmConfig] = useState<{
    title: string
    description: string
    label: string
    tone: 'primary' | 'danger'
    kind: 'add' | 'edit' | 'delete' | 'bulkDelete' | 'bulkInactive' | 'email' | 'quickStatus'
    rowId?: string
    nextStatus?: string
  } | null>(null)

  const counts = useMemo(() => {
    const active = bookings.filter((item) => item.isActive).length
    return { all: bookings.length, active, inactive: bookings.length - active }
  }, [bookings])

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return bookings.filter((item) => {
      const statusMatch = statusFilter === 'all' ? true : statusFilter === 'active' ? item.isActive : !item.isActive
      const searchMatch = needle.length === 0
        ? true
        : [item.name, item.email, item.phone || '', item.company || '', item.service || '', item.message || '', item.status]
            .join(' ')
            .toLowerCase()
            .includes(needle)

      return statusMatch && searchMatch
    })
  }, [bookings, search, statusFilter])

  const sorted = useMemo(() => {
    const items = [...filtered]
    items.sort((a, b) => {
      const direction = sortDir === 'asc' ? 1 : -1
      if (sortKey === 'requester') return a.name.localeCompare(b.name) * direction
      if (sortKey === 'service') return (a.service || '').localeCompare(b.service || '') * direction
      if (sortKey === 'status') return a.status.localeCompare(b.status) * direction
      if (sortKey === 'active') return (Number(a.isActive) - Number(b.isActive)) * direction
      if (sortKey === 'schedule') {
        const aDate = `${a.requestedDate || ''} ${a.requestedStartTime || ''}`
        const bDate = `${b.requestedDate || ''} ${b.requestedStartTime || ''}`
        return aDate.localeCompare(bDate) * direction
      }

      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return (aTime - bTime) * direction
    })
    return items
  }, [filtered, sortDir, sortKey])

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage))
  const safePage = Math.min(page, totalPages)
  const paged = sorted.slice((safePage - 1) * perPage, safePage * perPage)

  const currentPageIds = paged.map((item) => item.id)
  const allCurrentPageSelected = currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.includes(id))

  function addToast(message: string, tone: ApexToast['tone'] = 'default') {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setToasts((prev) => [...prev, { id, message, tone }])
    setTimeout(() => setToasts((prev) => prev.filter((item) => item.id !== id)), 3500)
  }

  function toggleColumn(key: string) {
    const typedKey = key as ColumnKey
    setColumns((prev) => ({ ...prev, [typedKey]: !prev[typedKey] }))
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

  function exportCsv() {
    const rows = sorted.map((item) => [
      item.name,
      item.email,
      item.phone || '',
      item.company || '',
      item.service || '',
      item.requestedDate || '',
      item.requestedStartTime || '',
      String(item.requestedDurationMinutes || ''),
      item.status,
      item.isActive ? 'Active' : 'Inactive',
      toRelative(item.createdAt),
    ])

    downloadCsv('bookings-export.csv', [['Name', 'Email', 'Phone', 'Company', 'Service', 'Date', 'Start Time', 'Duration Minutes', 'Status', 'Record Status', 'Created'], ...rows])
    addToast('Bookings CSV exported', 'success')
  }

  function formToBody(form: BookingFormState) {
    const body = new FormData()
    if (form.id) body.set('id', form.id)
    body.set('name', form.name)
    body.set('email', form.email)
    body.set('phone', form.phone)
    body.set('company', form.company)
    body.set('service', form.service)
    body.set('message', form.message)
    body.set('status', form.status)
    body.set('requestedDate', form.requestedDate)
    body.set('requestedStartTime', form.requestedStartTime)
    body.set('requestedDurationMinutes', String(form.requestedDurationMinutes || 0))
    body.set('isApproved', String(form.isApproved))
    body.set('isActive', String(form.isActive))
    return body
  }

  async function executeConfirmedAction() {
    if (!confirmConfig) return
    setPendingAction(true)

    try {
      if (confirmConfig.kind === 'add') {
        await createBookingAction(formToBody(addForm))
        setAddOpen(false)
        setAddForm(defaultForm())
        addToast('Booking created', 'success')
      }

      if (confirmConfig.kind === 'edit') {
        await updateBookingAction(formToBody(editForm))
        setEditOpen(false)
        addToast('Booking updated', 'success')
      }

      if (confirmConfig.kind === 'quickStatus' && confirmConfig.rowId && confirmConfig.nextStatus) {
        const row = bookings.find((item) => item.id === confirmConfig.rowId)
        if (row) {
          await updateBookingAction(formToBody({ ...formFromBooking(row), status: confirmConfig.nextStatus }))
          addToast('Booking status updated', 'success')
        }
      }

      if (confirmConfig.kind === 'delete' && pendingDeleteId) {
        const body = new FormData()
        body.set('id', pendingDeleteId)
        await deleteBookingAction(body)
        setPendingDeleteId(null)
        addToast('Booking deleted', 'success')
      }

      if (confirmConfig.kind === 'bulkDelete') {
        const body = new FormData()
        body.set('ids', selectedIds.join(','))
        await bulkDeleteBookingsAction(body)
        setSelectedIds([])
        addToast('Selected bookings deleted', 'success')
      }

      if (confirmConfig.kind === 'bulkInactive') {
        const body = new FormData()
        body.set('ids', selectedIds.join(','))
        await bulkSetInactiveBookingsAction(body)
        setSelectedIds([])
        addToast('Selected bookings set to inactive', 'success')
      }

      if (confirmConfig.kind === 'email') {
        const body = new FormData()
        body.set('id', emailForm.id)
        body.set('email', emailForm.toEmail)
        body.set('name', emailForm.name)
        body.set('subject', emailForm.subject)
        body.set('reply', emailForm.reply)
        await sendBookingEmailAction(body)
        setEmailOpen(false)
        setEmailForm({ id: '', toEmail: '', name: '', subject: 'Your PROGREX booking update', reply: '' })
        addToast('Email sent', 'success')
      }

      setConfirmOpen(false)
      setConfirmConfig(null)
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Action failed.', 'danger')
    } finally {
      setPendingAction(false)
    }
  }

  return (
    <div className="space-y-4">
      {pendingAction && (confirmConfig?.kind === 'add' || confirmConfig?.kind === 'edit') ? <ApexBlockingSpinner label="Saving booking..." /> : null}
      <ApexToastStack toasts={toasts} onRemove={(id) => setToasts((prev) => prev.filter((item) => item.id !== id))} />

      <ApexBreadcrumbs items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Bookings' }]} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[42px] leading-none font-bold tracking-tight apx-text">Bookings</h1>
          <p className="mt-1 text-sm apx-muted">Manage booking requests from the contact page.</p>
        </div>

        <button
          onClick={() => {
            setAddForm(defaultForm())
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
          { key: 'active', label: 'Active', count: counts.active, indicatorColor: '#16a34a' },
          { key: 'inactive', label: 'Inactive', count: counts.inactive, indicatorColor: '#64748b' },
        ]}
        active={statusFilter}
        onChange={(key) => {
          setStatusFilter(key as StatusFilter)
          setPage(1)
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
                className="whitespace-nowrap"
                onClick={() => {
                  setConfirmConfig({
                    title: 'Set Bookings Inactive',
                    description: `Set ${selectedIds.length} selected booking(s) to inactive?`,
                    label: 'Set Inactive',
                    tone: 'primary',
                    kind: 'bulkInactive',
                  })
                  setConfirmOpen(true)
                }}
              >
                <UserX className="h-4 w-4" />
                Set Inactive
              </ApexButton>
              <ApexButton
                type="button"
                variant="danger"
                className="whitespace-nowrap"
                onClick={() => {
                  setConfirmConfig({
                    title: 'Delete Selected Bookings',
                    description: `Delete ${selectedIds.length} selected booking(s)? This action cannot be undone.`,
                    label: 'Delete',
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
              { key: 'schedule', label: 'Meeting Schedule', visible: columns.schedule },
              { key: 'status', label: 'Status', visible: columns.status },
              { key: 'active', label: 'Record Status', visible: columns.active },
              { key: 'createdAt', label: 'Created', visible: columns.createdAt },
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
                  <button onClick={() => onSort('requester')} className="inline-flex items-center gap-1.5" type="button">
                    Requester
                    {renderSortIcon('requester')}
                  </button>
                </th>
              ) : null}
              {columns.service ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button onClick={() => onSort('service')} className="inline-flex items-center gap-1.5" type="button">
                    Service
                    {renderSortIcon('service')}
                  </button>
                </th>
              ) : null}
              {columns.schedule ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button onClick={() => onSort('schedule')} className="inline-flex items-center gap-1.5" type="button">
                    Schedule
                    {renderSortIcon('schedule')}
                  </button>
                </th>
              ) : null}
              {columns.status ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button onClick={() => onSort('status')} className="inline-flex items-center gap-1.5" type="button">
                    Status
                    {renderSortIcon('status')}
                  </button>
                </th>
              ) : null}
              {columns.active ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button onClick={() => onSort('active')} className="inline-flex items-center gap-1.5" type="button">
                    Record Status
                    {renderSortIcon('active')}
                  </button>
                </th>
              ) : null}
              {columns.createdAt ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button onClick={() => onSort('createdAt')} className="inline-flex items-center gap-1.5" type="button">
                    Created
                    {renderSortIcon('createdAt')}
                  </button>
                </th>
              ) : null}
              {columns.actions ? <th className="px-4 py-3 font-semibold apx-text text-right">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {paged.map((item) => (
              <tr
                key={item.id}
                onClick={() => {
                  setSelectedRow(item)
                  setViewOpen(true)
                }}
                className={[
                  'apx-table-row cursor-pointer border-b last:border-b-0',
                  selectedIds.includes(item.id) ? 'apx-table-row-selected' : '',
                ].join(' ').trim()}
                style={{ borderColor: 'var(--apx-border)' }}
              >
                <td className="px-2 py-3">
                  <div onClick={(event) => event.stopPropagation()}>
                    <ApexCheckbox checked={selectedIds.includes(item.id)} onChange={() => toggleSelectOne(item.id)} ariaLabel={`Select ${item.name}`} />
                  </div>
                </td>
                {columns.requester ? (
                  <td className="px-4 py-3">
                    <p className="font-semibold apx-text">{item.name}</p>
                    <p className="text-xs apx-muted">{item.email}</p>
                    {item.phone ? <p className="text-xs apx-muted">{item.phone}</p> : null}
                  </td>
                ) : null}
                {columns.service ? <td className="px-4 py-3 apx-text">{item.service || '-'}</td> : null}
                {columns.schedule ? (
                  <td className="px-4 py-3">
                    {item.requestedDate && item.requestedStartTime ? (
                      <div className="text-xs apx-text">
                        <p>{item.requestedDate}</p>
                        <p className="apx-muted">{item.requestedStartTime} • {item.requestedDurationMinutes || 0} min</p>
                      </div>
                    ) : (
                      <span className="text-xs apx-muted">No meeting slot</span>
                    )}
                  </td>
                ) : null}
                {columns.status ? (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
                      <span className="inline-flex rounded-full px-2 py-1 text-xs font-semibold" style={statusBadgeStyle(item.status)}>{item.status}</span>
                      <div className="min-w-36">
                        <ApexDropdown
                          value={item.status}
                          onChange={(value) => {
                            if (value === item.status) return
                            setConfirmConfig({
                              title: 'Change Booking Status',
                              description: `Set ${item.name} status to ${value}?`,
                              label: 'Save Status',
                              tone: 'primary',
                              kind: 'quickStatus',
                              rowId: item.id,
                              nextStatus: value,
                            })
                            setConfirmOpen(true)
                          }}
                          options={BOOKING_STATUS_OPTIONS}
                        />
                      </div>
                    </div>
                  </td>
                ) : null}
                {columns.active ? (
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full px-2 py-1 text-xs font-semibold" style={item.isActive ? { backgroundColor: 'rgba(22,163,74,0.15)', color: '#15803d' } : { backgroundColor: 'rgba(100,116,139,0.2)', color: '#334155' }}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                ) : null}
                {columns.createdAt ? <td className="px-4 py-3 apx-muted">{toRelative(item.createdAt)}</td> : null}
                {columns.actions ? (
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2" onClick={(event) => event.stopPropagation()}>
                      <button
                        type="button"
                        className="apx-icon-action"
                        onClick={() => {
                          setEditForm(formFromBooking(item))
                          setEditOpen(true)
                        }}
                        aria-label={`Reschedule ${item.name}`}
                      >
                        <CalendarClock className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="apx-icon-action"
                        onClick={() => {
                          setEmailForm({ id: item.id, toEmail: item.email, name: item.name, subject: 'Your PROGREX booking update', reply: '' })
                          setEmailOpen(true)
                        }}
                        aria-label={`Email ${item.name}`}
                      >
                        <Mail className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="apx-icon-action"
                        onClick={() => {
                          setEditForm(formFromBooking(item))
                          setEditOpen(true)
                        }}
                        aria-label={`Edit ${item.name}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="apx-icon-action-danger"
                        onClick={() => {
                          setPendingDeleteId(item.id)
                          setConfirmConfig({
                            title: 'Delete Booking',
                            description: `Delete booking for ${item.name}? This action cannot be undone.`,
                            label: 'Delete',
                            tone: 'danger',
                            kind: 'delete',
                          })
                          setConfirmOpen(true)
                        }}
                        aria-label={`Delete ${item.name}`}
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

      <ApexModal open={addOpen} size="sm" title="Add Booking" subtitle="Create a booking request manually." onClose={() => setAddOpen(false)}>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            setConfirmConfig({
              title: 'Create Booking',
              description: `Create booking for ${addForm.name || 'this requester'}?`,
              label: 'Create Booking',
              tone: 'primary',
              kind: 'add',
            })
            setConfirmOpen(true)
          }}
          className="grid gap-3 md:grid-cols-2"
        >
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Name</label>
            <ApexInput required value={addForm.name} onChange={(event) => setAddForm((prev) => ({ ...prev, name: event.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Email</label>
            <ApexInput required type="email" value={addForm.email} onChange={(event) => setAddForm((prev) => ({ ...prev, email: event.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Phone</label>
            <ApexInput value={addForm.phone} onChange={(event) => setAddForm((prev) => ({ ...prev, phone: event.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Company</label>
            <ApexInput value={addForm.company} onChange={(event) => setAddForm((prev) => ({ ...prev, company: event.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Service</label>
            <ApexInput value={addForm.service} onChange={(event) => setAddForm((prev) => ({ ...prev, service: event.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Date</label>
            <ApexInput type="date" value={addForm.requestedDate} onChange={(event) => setAddForm((prev) => ({ ...prev, requestedDate: event.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Start Time</label>
            <ApexInput type="time" value={addForm.requestedStartTime} onChange={(event) => setAddForm((prev) => ({ ...prev, requestedStartTime: event.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Duration (minutes)</label>
            <ApexInput type="number" min={1} value={String(addForm.requestedDurationMinutes)} onChange={(event) => setAddForm((prev) => ({ ...prev, requestedDurationMinutes: Number(event.target.value) || 0 }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Status</label>
            <ApexDropdown value={addForm.status} onChange={(value) => setAddForm((prev) => ({ ...prev, status: value }))} options={BOOKING_STATUS_OPTIONS} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Record Status</label>
            <ApexDropdown value={addForm.isActive ? 'active' : 'inactive'} onChange={(value) => setAddForm((prev) => ({ ...prev, isActive: value === 'active' }))} options={ACTIVE_OPTIONS} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Message</label>
            <ApexTextarea rows={3} value={addForm.message} onChange={(event) => setAddForm((prev) => ({ ...prev, message: event.target.value }))} />
          </div>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <ApexButton type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</ApexButton>
            <ApexButton type="submit">Save Booking</ApexButton>
          </div>
        </form>
      </ApexModal>

      <ApexModal open={editOpen} size="sm" title="Edit Booking" subtitle="Update booking details." onClose={() => setEditOpen(false)}>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            setConfirmConfig({
              title: 'Save Booking Changes',
              description: `Save changes for ${editForm.name || 'this booking'}?`,
              label: 'Save Changes',
              tone: 'primary',
              kind: 'edit',
            })
            setConfirmOpen(true)
          }}
          className="grid gap-3 md:grid-cols-2"
        >
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Name</label>
            <ApexInput required value={editForm.name} onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Email</label>
            <ApexInput required type="email" value={editForm.email} onChange={(event) => setEditForm((prev) => ({ ...prev, email: event.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Phone</label>
            <ApexInput value={editForm.phone} onChange={(event) => setEditForm((prev) => ({ ...prev, phone: event.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Company</label>
            <ApexInput value={editForm.company} onChange={(event) => setEditForm((prev) => ({ ...prev, company: event.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Service</label>
            <ApexInput value={editForm.service} onChange={(event) => setEditForm((prev) => ({ ...prev, service: event.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Date</label>
            <ApexInput type="date" value={editForm.requestedDate} onChange={(event) => setEditForm((prev) => ({ ...prev, requestedDate: event.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Start Time</label>
            <ApexInput type="time" value={editForm.requestedStartTime} onChange={(event) => setEditForm((prev) => ({ ...prev, requestedStartTime: event.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Duration (minutes)</label>
            <ApexInput type="number" min={1} value={String(editForm.requestedDurationMinutes)} onChange={(event) => setEditForm((prev) => ({ ...prev, requestedDurationMinutes: Number(event.target.value) || 0 }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Status</label>
            <ApexDropdown value={editForm.status} onChange={(value) => setEditForm((prev) => ({ ...prev, status: value }))} options={BOOKING_STATUS_OPTIONS} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Record Status</label>
            <ApexDropdown value={editForm.isActive ? 'active' : 'inactive'} onChange={(value) => setEditForm((prev) => ({ ...prev, isActive: value === 'active' }))} options={ACTIVE_OPTIONS} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Message</label>
            <ApexTextarea rows={3} value={editForm.message} onChange={(event) => setEditForm((prev) => ({ ...prev, message: event.target.value }))} />
          </div>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <ApexButton type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</ApexButton>
            <ApexButton type="submit">Save Changes</ApexButton>
          </div>
        </form>
      </ApexModal>

      <ApexModal open={emailOpen} size="sm" title="Send Booking Email" subtitle="Send an update to the requester." onClose={() => setEmailOpen(false)}>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            setConfirmConfig({
              title: 'Send Email',
              description: `Send this booking update to ${emailForm.toEmail}?`,
              label: 'Send Email',
              tone: 'primary',
              kind: 'email',
            })
            setConfirmOpen(true)
          }}
          className="space-y-3"
        >
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Subject</label>
            <ApexInput value={emailForm.subject} onChange={(event) => setEmailForm((prev) => ({ ...prev, subject: event.target.value }))} required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Message</label>
            <ApexTextarea rows={5} value={emailForm.reply} onChange={(event) => setEmailForm((prev) => ({ ...prev, reply: event.target.value }))} required />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <ApexButton type="button" variant="outline" onClick={() => setEmailOpen(false)}>Cancel</ApexButton>
            <ApexButton type="submit">Send</ApexButton>
          </div>
        </form>
      </ApexModal>

      <ApexModal
        size="sm"
        open={viewOpen && !!selectedRow}
        title="Booking Details"
        subtitle="Read-only booking information."
        onClose={() => {
          setViewOpen(false)
          setSelectedRow(null)
        }}
      >
        {selectedRow ? (
          <div className="space-y-3 text-sm">
            <div><p className="text-xs uppercase tracking-wide apx-muted">Requester</p><p className="mt-1 apx-text font-semibold">{selectedRow.name}</p><p className="text-xs apx-muted">{selectedRow.email}</p></div>
            <div><p className="text-xs uppercase tracking-wide apx-muted">Contact</p><p className="mt-1 apx-text">{selectedRow.phone || '-'}</p><p className="text-xs apx-muted">{selectedRow.company || '-'}</p></div>
            <div><p className="text-xs uppercase tracking-wide apx-muted">Service</p><p className="mt-1 apx-text">{selectedRow.service || '-'}</p></div>
            <div><p className="text-xs uppercase tracking-wide apx-muted">Schedule</p><p className="mt-1 apx-text">{selectedRow.requestedDate && selectedRow.requestedStartTime ? `${selectedRow.requestedDate} ${selectedRow.requestedStartTime} (${selectedRow.requestedDurationMinutes || 0} min)` : 'No meeting slot'}</p></div>
            <div><p className="text-xs uppercase tracking-wide apx-muted">Message</p><p className="mt-1 whitespace-pre-wrap apx-text">{selectedRow.message || '-'}</p></div>
            <div><p className="text-xs uppercase tracking-wide apx-muted">Status</p><span className="mt-1 inline-flex rounded-full px-2 py-1 text-xs font-semibold" style={statusBadgeStyle(selectedRow.status)}>{selectedRow.status}</span></div>
          </div>
        ) : null}
      </ApexModal>

      <ApexConfirmationModal
        open={confirmOpen && !!confirmConfig}
        title={confirmConfig?.title ?? 'Confirm Action'}
        description={confirmConfig?.description ?? 'Proceed with this action?'}
        confirmLabel={confirmConfig?.label ?? 'Confirm'}
        tone={confirmConfig?.tone ?? 'primary'}
        pending={pendingAction}
        onClose={() => {
          if (pendingAction) return
          setConfirmOpen(false)
          setConfirmConfig(null)
        }}
        onConfirm={executeConfirmedAction}
      />
    </div>
  )
}
