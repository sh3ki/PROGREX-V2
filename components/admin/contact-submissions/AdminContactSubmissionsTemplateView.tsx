'use client'

import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, Archive, Download, Edit2, Mail, Plus, Trash2 } from 'lucide-react'
import { ApexButton, ApexInput, ApexTextarea } from '@/components/admin/apex/AdminPrimitives'
import {
  ApexBlockingSpinner,
  ApexBreadcrumbs,
  ApexCheckbox,
  ApexColumnsToggle,
  ApexConfirmationModal,
  ApexDropdown,
  ApexExportButton,
  ApexFileDropzone,
  ApexModal,
  ApexPagination,
  ApexSearchField,
  ApexStatusTabs,
  ApexToast,
  ApexToastStack,
} from '@/components/admin/apex/ApexDataUi'

type ContactSubmission = {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  service: string | null
  budget?: string | null
  message?: string | null
  status: string
  isActive: boolean
  isArchived: boolean
  attachmentUrls: string[]
  createdAt: string | null
}

type ContactFormState = {
  id?: string
  name: string
  email: string
  phone: string
  company: string
  service: string
  budget: string
  message: string
  status: string
}

type ColumnKey = 'requester' | 'service' | 'budget' | 'created' | 'status' | 'actions'
type SortKey = Exclude<ColumnKey, 'actions'>

const STATUS_OPTIONS = ['new', 'in-progress', 'replied', 'resolved', 'archived']
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

function defaultForm(): ContactFormState {
  return {
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    budget: '',
    message: '',
    status: 'new',
  }
}

function formFromSubmission(row: ContactSubmission): ContactFormState {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? '',
    company: row.company ?? '',
    service: row.service ?? '',
    budget: row.budget ?? '',
    message: row.message ?? '',
    status: row.status,
  }
}

function formatCreated(value: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString()
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

export default function AdminContactSubmissionsTemplateView({
  submissions,
  createContactSubmissionAction,
  updateContactSubmissionAction,
  deleteContactSubmissionAction,
  bulkDeleteContactSubmissionsAction,
  bulkArchiveContactSubmissionsAction,
  toggleArchiveContactSubmissionAction,
  updateContactSubmissionStatusAction,
  sendContactEmailAction,
}: {
  submissions: ContactSubmission[]
  createContactSubmissionAction: (formData: FormData) => Promise<void>
  updateContactSubmissionAction: (formData: FormData) => Promise<void>
  deleteContactSubmissionAction: (formData: FormData) => Promise<void>
  bulkDeleteContactSubmissionsAction: (formData: FormData) => Promise<void>
  bulkArchiveContactSubmissionsAction: (formData: FormData) => Promise<void>
  toggleArchiveContactSubmissionAction: (formData: FormData) => Promise<void>
  updateContactSubmissionStatusAction: (formData: FormData) => Promise<void>
  sendContactEmailAction: (formData: FormData) => Promise<void>
}) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('created')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [columns, setColumns] = useState<Record<ColumnKey, boolean>>({ requester: true, service: true, budget: true, created: true, status: true, actions: true })
  const [toasts, setToasts] = useState<ApexToast[]>([])
  const [pending, setPending] = useState(false)

  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [filesOpen, setFilesOpen] = useState(false)
  const [emailOpen, setEmailOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null)
  const [filesTargetSubmission, setFilesTargetSubmission] = useState<ContactSubmission | null>(null)
  const [selectedFileUrls, setSelectedFileUrls] = useState<string[]>([])
  const [addForm, setAddForm] = useState<ContactFormState>(defaultForm())
  const [editForm, setEditForm] = useState<ContactFormState>(defaultForm())
  const [addAttachments, setAddAttachments] = useState<File[]>([])
  const [editAttachments, setEditAttachments] = useState<File[]>([])
  const [editKeptAttachmentUrls, setEditKeptAttachmentUrls] = useState<string[]>([])
  const [emailSubject, setEmailSubject] = useState('Your message has been received')
  const [emailReply, setEmailReply] = useState('')
  const [statusDraft, setStatusDraft] = useState('new')

  const [confirmConfig, setConfirmConfig] = useState<{
    title: string
    description: string
    confirmLabel: string
    tone: 'primary' | 'danger'
    kind: 'add' | 'edit' | 'delete' | 'bulkDelete' | 'bulkArchive' | 'toggleArchive' | 'saveStatus' | 'sendEmail'
  } | null>(null)

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return submissions.filter((item) => {
      const statusMatch = status === 'all' ? true : item.status === status
      const searchMatch = keyword.length === 0
        ? true
        : [item.name, item.email, item.company ?? '', item.service ?? ''].join(' ').toLowerCase().includes(keyword)
      return statusMatch && searchMatch
    })
  }, [submissions, search, status])

  const sorted = useMemo(() => {
    const list = [...filtered]
    list.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      if (sortKey === 'requester') return a.name.localeCompare(b.name) * dir
      if (sortKey === 'service') return (a.service ?? '').localeCompare(b.service ?? '') * dir
      if (sortKey === 'budget') return (a.budget ?? '').localeCompare(b.budget ?? '') * dir
      if (sortKey === 'status') return a.status.localeCompare(b.status) * dir
      return (a.createdAt ?? '').localeCompare(b.createdAt ?? '') * dir
    })
    return list
  }, [filtered, sortDir, sortKey])

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage))
  const safePage = Math.min(page, totalPages)
  const paged = sorted.slice((safePage - 1) * perPage, safePage * perPage)

  const counts = useMemo(() => ({
    all: submissions.length,
    new: submissions.filter((s) => s.status === 'new').length,
    inProgress: submissions.filter((s) => s.status === 'in-progress').length,
    replied: submissions.filter((s) => s.status === 'replied').length,
    resolved: submissions.filter((s) => s.status === 'resolved').length,
    archived: submissions.filter((s) => s.status === 'archived').length,
  }), [submissions])

  const currentPageIds = paged.map((item) => item.id)
  const allCurrentPageSelected = currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.includes(id))

  function addToast(message: string, tone: ApexToast['tone'] = 'default') {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setToasts((prev) => [...prev, { id, message, tone }])
    setTimeout(() => setToasts((prev) => prev.filter((item) => item.id !== id)), 3500)
  }

  function toggleColumn(key: string) {
    const typed = key as ColumnKey
    setColumns((prev) => ({ ...prev, [typed]: !prev[typed] }))
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
    const rows = sorted.map((row) => [row.name, row.email, row.service ?? '', row.budget ?? '', row.status, formatCreated(row.createdAt)])
    downloadCsv('contact-submissions-export.csv', [['Name', 'Email', 'Service', 'Budget', 'Status', 'Created'], ...rows])
    addToast('Contact submissions CSV exported', 'success')
  }

  function toFormData(form: ContactFormState, attachments: File[] = [], keptAttachmentUrls: string[] = []) {
    const formData = new FormData()
    if (form.id) formData.set('id', form.id)
    formData.set('name', form.name)
    formData.set('email', form.email)
    formData.set('phone', form.phone)
    formData.set('company', form.company)
    formData.set('service', form.service)
    formData.set('budget', form.budget)
    formData.set('message', form.message)
    formData.set('status', form.status)
    if (form.id) formData.set('keptAttachmentUrls', keptAttachmentUrls.join('||'))
    for (const file of attachments.slice(0, 5)) formData.append('attachments', file)
    return formData
  }

  function openFileUrl(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  async function executeConfirmedAction() {
    if (!confirmConfig) return
    setPending(true)

    try {
      if (confirmConfig.kind === 'add') {
        await createContactSubmissionAction(toFormData(addForm, addAttachments))
        setAddOpen(false)
        setAddForm(defaultForm())
        setAddAttachments([])
        addToast('Submission added', 'success')
      }

      if (confirmConfig.kind === 'edit') {
        await updateContactSubmissionAction(toFormData(editForm, editAttachments, editKeptAttachmentUrls))
        setEditOpen(false)
        setEditAttachments([])
        addToast('Submission updated', 'success')
      }

      if (confirmConfig.kind === 'delete' && selectedSubmission) {
        const formData = new FormData()
        formData.set('id', selectedSubmission.id)
        await deleteContactSubmissionAction(formData)
        setViewOpen(false)
        addToast('Submission deleted', 'success')
      }

      if (confirmConfig.kind === 'bulkDelete') {
        const formData = new FormData()
        formData.set('ids', selectedIds.join(','))
        await bulkDeleteContactSubmissionsAction(formData)
        setSelectedIds([])
        addToast('Selected submissions deleted', 'success')
      }

      if (confirmConfig.kind === 'bulkArchive') {
        const formData = new FormData()
        formData.set('ids', selectedIds.join(','))
        await bulkArchiveContactSubmissionsAction(formData)
        setSelectedIds([])
        addToast('Selected submissions archived', 'success')
      }

      if (confirmConfig.kind === 'toggleArchive' && selectedSubmission) {
        const formData = new FormData()
        formData.set('id', selectedSubmission.id)
        await toggleArchiveContactSubmissionAction(formData)
        addToast(selectedSubmission.isArchived ? 'Submission unarchived' : 'Submission archived', 'success')
      }

      if (confirmConfig.kind === 'saveStatus' && selectedSubmission) {
        const formData = new FormData()
        formData.set('id', selectedSubmission.id)
        formData.set('status', statusDraft)
        await updateContactSubmissionStatusAction(formData)
        addToast('Submission status updated', 'success')
      }

      if (confirmConfig.kind === 'sendEmail' && selectedSubmission && emailReply.trim()) {
        const formData = new FormData()
        formData.set('email', selectedSubmission.email)
        formData.set('name', selectedSubmission.name)
        formData.set('subject', emailSubject.trim() || 'Your message has been received')
        formData.set('reply', emailReply)
        await sendContactEmailAction(formData)
        setEmailSubject('Your message has been received')
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

      <ApexBreadcrumbs items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Contact Submissions' }]} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[42px] leading-none font-bold tracking-tight apx-text">Contact Submissions</h1>
          <p className="mt-1 text-sm apx-muted">Manage inquiries from the contact form.</p>
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
          Add Submission
        </button>
      </div>

      <ApexStatusTabs
        tabs={[
          { key: 'all', label: 'All', count: counts.all },
          { key: 'new', label: 'New', count: counts.new, indicatorColor: '#3b82f6' },
          { key: 'in-progress', label: 'In Progress', count: counts.inProgress, indicatorColor: '#a855f7' },
          { key: 'replied', label: 'Replied', count: counts.replied, indicatorColor: '#eab308' },
          { key: 'resolved', label: 'Resolved', count: counts.resolved, indicatorColor: '#22c55e' },
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
            placeholder="Search contact submissions..."
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
                    title: 'Archive Selected Submissions',
                    description: `Archive ${selectedIds.length} selected submission(s)?`,
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
                    title: 'Delete Selected Submissions',
                    description: `Delete ${selectedIds.length} selected submission(s)? This cannot be undone.`,
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
                <ApexCheckbox checked={allCurrentPageSelected} onChange={toggleSelectAllCurrentPage} ariaLabel="Select all current page submissions" />
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
              {columns.budget ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button type="button" className="inline-flex items-center gap-1.5" onClick={() => onSort('budget')}>
                    Budget
                    {renderSortIcon('budget')}
                  </button>
                </th>
              ) : null}
              {columns.status ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button type="button" className="inline-flex items-center gap-1.5" onClick={() => onSort('status')}>
                    Status
                    {renderSortIcon('status')}
                  </button>
                </th>
              ) : null}
              {columns.created ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button type="button" className="inline-flex items-center gap-1.5" onClick={() => onSort('created')}>
                    Created
                    {renderSortIcon('created')}
                  </button>
                </th>
              ) : null}
              {columns.actions ? <th className="px-4 py-3 text-right font-semibold apx-text">Actions</th> : null}
            </tr>
          </thead>

          <tbody>
            {paged.map((submission) => (
              <tr
                key={submission.id}
                className={['apx-table-row border-b last:border-b-0 cursor-pointer', selectedIds.includes(submission.id) ? 'apx-table-row-selected' : ''].join(' ').trim()}
                style={{ borderColor: 'var(--apx-border)' }}
                onClick={() => {
                  setSelectedSubmission(submission)
                  setStatusDraft(submission.status)
                  setViewOpen(true)
                }}
              >
                <td className="px-2 py-3" onClick={(event) => event.stopPropagation()}>
                  <ApexCheckbox checked={selectedIds.includes(submission.id)} onChange={() => toggleSelectOne(submission.id)} ariaLabel={`Select ${submission.name}`} />
                </td>
                {columns.requester ? (
                  <td className="px-4 py-3">
                    <p className="font-semibold apx-text">{submission.name}</p>
                    <p className="text-xs apx-muted">{submission.company || '-'}</p>
                    <p className="text-xs apx-muted">{submission.email} {submission.phone ? `• ${submission.phone}` : ''}</p>
                  </td>
                ) : null}
                {columns.service ? <td className="px-4 py-3 apx-text">{submission.service || '-'}</td> : null}
                {columns.budget ? <td className="px-4 py-3 apx-text">{submission.budget || '-'}</td> : null}
                {columns.created ? <td className="px-4 py-3 apx-text">{formatCreated(submission.createdAt)}</td> : null}
                {columns.status ? (
                  <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                    <ApexDropdown
                      value={submission.status}
                      options={STATUS_OPTIONS.map((option) => ({ value: option, label: option }))}
                      onChange={(value) => {
                        setSelectedSubmission(submission)
                        setStatusDraft(value)
                        setConfirmConfig({
                          title: 'Update Status',
                          description: `Set status to ${value}?`,
                          confirmLabel: 'Save Status',
                          tone: 'primary',
                          kind: 'saveStatus',
                        })
                        setConfirmOpen(true)
                      }}
                    />
                  </td>
                ) : null}
                {columns.actions ? (
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2" onClick={(event) => event.stopPropagation()}>
                      <button
                        type="button"
                        className="apx-icon-action"
                        onClick={() => {
                          setFilesTargetSubmission(submission)
                          setSelectedFileUrls([])
                          setFilesOpen(true)
                        }}
                        aria-label={`Files for ${submission.name}`}
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="apx-icon-action"
                        onClick={() => {
                          setSelectedSubmission(submission)
                          setEmailSubject('Your message has been received')
                          setEmailReply('')
                          setEmailOpen(true)
                        }}
                        aria-label={`Email ${submission.name}`}
                      >
                        <Mail className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="apx-icon-action"
                        onClick={() => {
                          setSelectedSubmission(submission)
                          setEditForm(formFromSubmission(submission))
                          setEditKeptAttachmentUrls(submission.attachmentUrls || [])
                          setEditAttachments([])
                          setEditOpen(true)
                        }}
                        aria-label={`Edit ${submission.name}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="apx-icon-action"
                        onClick={() => {
                          setSelectedSubmission(submission)
                          setConfirmConfig({
                            title: submission.isArchived ? 'Unarchive Submission' : 'Archive Submission',
                            description: `${submission.isArchived ? 'Unarchive' : 'Archive'} ${submission.name}?`,
                            confirmLabel: submission.isArchived ? 'Unarchive' : 'Archive',
                            tone: submission.isArchived ? 'primary' : 'danger',
                            kind: 'toggleArchive',
                          })
                          setConfirmOpen(true)
                        }}
                        aria-label={`Archive toggle ${submission.name}`}
                        style={{ color: submission.isArchived ? '#16a34a' : '#f97316' }}
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="apx-icon-action-danger"
                        onClick={() => {
                          setSelectedSubmission(submission)
                          setConfirmConfig({
                            title: 'Delete Contact Submission',
                            description: `Delete ${submission.name}? This cannot be undone.`,
                            confirmLabel: 'Delete',
                            tone: 'danger',
                            kind: 'delete',
                          })
                          setConfirmOpen(true)
                        }}
                        aria-label={`Delete ${submission.name}`}
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

      <ApexModal size="md" open={addOpen} title="Add Contact Submission" subtitle="Create a manual contact submission." onClose={() => setAddOpen(false)}>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            setConfirmConfig({
              title: 'Confirm Add Submission',
              description: `Add submission for ${addForm.name || 'this contact'}?`,
              confirmLabel: 'Add Submission',
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
            <ApexInput value={addForm.phone} onChange={(event) => setAddForm((prev) => ({ ...prev, phone: event.target.value }))} />
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
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Status</label>
            <ApexDropdown
              value={addForm.status}
              options={STATUS_OPTIONS.map((option) => ({ value: option, label: option }))}
              onChange={(value) => setAddForm((prev) => ({ ...prev, status: value }))}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Message / Details</label>
            <ApexTextarea rows={4} value={addForm.message} onChange={(event) => setAddForm((prev) => ({ ...prev, message: event.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Attachments (optional, up to 5)</label>
            <ApexFileDropzone maxFiles={5} maxSizeMb={10} files={addAttachments} onFilesChange={setAddAttachments} />
          </div>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <ApexButton type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</ApexButton>
            <ApexButton type="submit">Save Submission</ApexButton>
          </div>
        </form>
      </ApexModal>

      <ApexModal size="md" open={editOpen} title="Edit Contact Submission" subtitle="Update contact submission details." onClose={() => setEditOpen(false)}>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            setConfirmConfig({
              title: 'Confirm Edit Submission',
              description: `Save changes for ${editForm.name || 'this contact'}?`,
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
            <ApexInput value={editForm.phone} onChange={(event) => setEditForm((prev) => ({ ...prev, phone: event.target.value }))} />
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
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Status</label>
            <ApexDropdown
              value={editForm.status}
              options={STATUS_OPTIONS.map((option) => ({ value: option, label: option }))}
              onChange={(value) => setEditForm((prev) => ({ ...prev, status: value }))}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Message / Details</label>
            <ApexTextarea rows={4} value={editForm.message} onChange={(event) => setEditForm((prev) => ({ ...prev, message: event.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Existing Attachments</label>
            <div className="space-y-1">
              {(selectedSubmission?.attachmentUrls || []).map((url) => {
                const keep = editKeptAttachmentUrls.includes(url)
                return (
                  <div key={url} className="flex items-center justify-between rounded-lg border px-2 py-1" style={{ borderColor: 'var(--apx-border)' }}>
                    <button type="button" className="truncate text-left text-xs apx-text hover:underline" onClick={() => openFileUrl(url)}>{url.split('/').pop() || 'file'}</button>
                    <ApexButton type="button" variant={keep ? 'outline' : 'danger'} className="px-2 py-1 text-xs" onClick={() => {
                      setEditKeptAttachmentUrls((prev) => (prev.includes(url) ? prev.filter((item) => item !== url) : [...prev, url]))
                    }}>{keep ? 'Keep' : 'Removed'}</ApexButton>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Add Attachments (up to 5 total)</label>
            <ApexFileDropzone
              maxFiles={Math.max(0, 5 - editKeptAttachmentUrls.length)}
              maxSizeMb={10}
              files={editAttachments}
              onFilesChange={setEditAttachments}
            />
          </div>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <ApexButton type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</ApexButton>
            <ApexButton type="submit">Save Changes</ApexButton>
          </div>
        </form>
      </ApexModal>

      <ApexModal size="md" open={filesOpen} title="Submission Files" subtitle="Download attached files." onClose={() => setFilesOpen(false)}>
        {filesTargetSubmission ? (
          <div className="space-y-3">
            <div className="space-y-2">
              {(filesTargetSubmission.attachmentUrls || []).length ? (
                filesTargetSubmission.attachmentUrls.map((url) => (
                  <div key={url} className="flex items-center justify-between rounded-lg border px-3 py-2" style={{ borderColor: 'var(--apx-border)' }}>
                    <div className="flex items-center gap-2">
                      <ApexCheckbox
                        checked={selectedFileUrls.includes(url)}
                        onChange={() => setSelectedFileUrls((prev) => (prev.includes(url) ? prev.filter((item) => item !== url) : [...prev, url]))}
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

      <ApexModal size="md" open={viewOpen} title="Submission Details" subtitle="View full inquiry details." onClose={() => setViewOpen(false)}>
        {selectedSubmission ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium apx-muted">Name</p>
                <p className="apx-text font-semibold">{selectedSubmission.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium apx-muted">Email</p>
                <p className="apx-text">{selectedSubmission.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium apx-muted">Service</p>
                <p className="apx-text">{selectedSubmission.service || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-medium apx-muted">Company</p>
                <p className="apx-text">{selectedSubmission.company || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-medium apx-muted">Phone</p>
                <p className="apx-text">{selectedSubmission.phone || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-medium apx-muted">Budget</p>
                <p className="apx-text">{selectedSubmission.budget || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-medium apx-muted">Created</p>
                <p className="apx-text">{formatCreated(selectedSubmission.createdAt)}</p>
              </div>
            </div>

            <div>
              <p className="mb-1 block text-xs font-medium apx-muted">Project Details</p>
              <p className="apx-text whitespace-pre-wrap">{selectedSubmission.message || '-'}</p>
            </div>
            <div>
              <p className="mb-1 block text-xs font-medium apx-muted">Attachments</p>
              <div className="space-y-1">
                {(selectedSubmission.attachmentUrls || []).length ? (
                  selectedSubmission.attachmentUrls.map((url) => (
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

      <ApexModal size="md" open={emailOpen} title="Send Contact Email" subtitle="Write a subject and response." onClose={() => setEmailOpen(false)}>
        {selectedSubmission ? (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium apx-muted">To</label>
              <ApexInput value={selectedSubmission.email} disabled />
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
                    title: 'Send Contact Email',
                    description: `Send reply to ${selectedSubmission.email}?`,
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
