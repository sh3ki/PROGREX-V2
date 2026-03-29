'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowDown, ArrowUp, ArrowUpDown, CreditCard, Download, Edit2, Eye, Files, Mail, Plus, Power, Trash2 } from 'lucide-react'
import { ApexButton, ApexDateInput, ApexInput, ApexTextarea } from '@/components/admin/apex/AdminPrimitives'
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

type ProjectRow = {
  id: string
  projectName: string
  projectDescription: string | null
  startDate: string | null
  targetDate: string | null
  clientId: string | null
  clientName: string | null
  clientProfileImage: string | null
  category: string | null
  assignedTeamIds: string[]
  agreementFileUrl: string | null
  projectScopeFileUrl: string | null
  otherFileUrls: string[]
  paymentTerm: string | null
  isActive: boolean
  totalPrice: string | null
  balance: string | null
}

type ClientOption = { id: string; fullName: string; profileImage: string | null }
type TeamMemberOption = { id: string; name: string; avatar: string }

type ColumnKey = 'project' | 'client' | 'team' | 'startDate' | 'targetDate' | 'price' | 'balance' | 'status' | 'actions'
type SortKey = Exclude<ColumnKey, 'actions'>
type StatusFilter = 'all' | 'active' | 'inactive'

type ProjectFormState = {
  id?: string
  projectName: string
  projectDescription: string
  startDate: string
  targetDate: string
  clientId: string
  categories: string[]
  assignedTeamIds: string[]
  paymentTerm: string
  status: 'active' | 'inactive'
  totalPrice: string
  balance: string
  existingAgreementFileUrl: string
  existingScopeFileUrl: string
  keptOtherFileUrls: string[]
}

const PAYMENT_TERMS = ['One-time Payment', 'Progress-based', 'Monthly billing']

function defaultForm(): ProjectFormState {
  return {
    projectName: '',
    projectDescription: '',
    startDate: '',
    targetDate: '',
    clientId: '',
    categories: [],
    assignedTeamIds: [],
    paymentTerm: 'One-time Payment',
    status: 'active',
    totalPrice: '',
    balance: '',
    existingAgreementFileUrl: '',
    existingScopeFileUrl: '',
    keptOtherFileUrls: [],
  }
}

function formatDateLabel(value: string | null) {
  if (!value) return '-'
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function parseCurrencyInput(value: string) {
  const normalized = value.replace(/[^0-9.\-]/g, '')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

function formatCurrency(value: string | number | null) {
  const amount = typeof value === 'number' ? value : parseCurrencyInput(String(value ?? '0'))
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
}

function formatCurrencyInput(value: string) {
  if (!value.trim()) return ''
  return formatCurrency(parseCurrencyInput(value))
}

function toSubmissionCurrency(value: string) {
  return parseCurrencyInput(value).toFixed(2)
}

function formFromProject(project: ProjectRow): ProjectFormState {
  return {
    id: project.id,
    projectName: project.projectName,
    projectDescription: project.projectDescription ?? '',
    startDate: project.startDate ?? '',
    targetDate: project.targetDate ?? '',
    clientId: project.clientId ?? '',
    categories: project.category ? project.category.split(',').map((item) => item.trim()).filter(Boolean) : [],
    assignedTeamIds: project.assignedTeamIds ?? [],
    paymentTerm: project.paymentTerm ?? 'One-time Payment',
    status: project.isActive ? 'active' : 'inactive',
    totalPrice: formatCurrency(project.totalPrice),
    balance: formatCurrency(project.balance),
    existingAgreementFileUrl: project.agreementFileUrl ?? '',
    existingScopeFileUrl: project.projectScopeFileUrl ?? '',
    keptOtherFileUrls: project.otherFileUrls ?? [],
  }
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

function fileNameFromUrl(url: string) {
  const raw = url.split('/').pop() || 'file'
  return raw.split('?')[0]
}

function openFile(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

function downloadFile(url: string) {
  const link = document.createElement('a')
  link.href = url
  link.download = fileNameFromUrl(url)
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
  link.click()
}

export default function AdminOngoingProjectsTemplateView({
  projects,
  clients,
  teamMembers,
  categories,
  createProjectAction,
  updateProjectAction,
  updateProjectFilesAction,
  toggleProjectAction,
  bulkSetInactiveProjectsAction,
  bulkDeleteProjectsAction,
  deleteProjectAction,
}: {
  projects: ProjectRow[]
  clients: ClientOption[]
  teamMembers: TeamMemberOption[]
  categories: string[]
  createProjectAction: (formData: FormData) => Promise<void>
  updateProjectAction: (formData: FormData) => Promise<void>
  updateProjectFilesAction: (formData: FormData) => Promise<void>
  toggleProjectAction: (formData: FormData) => Promise<void>
  bulkSetInactiveProjectsAction: (formData: FormData) => Promise<void>
  bulkDeleteProjectsAction: (formData: FormData) => Promise<void>
  deleteProjectAction: (formData: FormData) => Promise<void>
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [sortKey, setSortKey] = useState<SortKey>('project')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [columns, setColumns] = useState<Record<ColumnKey, boolean>>({
    project: true,
    client: true,
    team: true,
    startDate: true,
    targetDate: true,
    price: true,
    balance: true,
    status: true,
    actions: true,
  })

  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [filesOpen, setFilesOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [toasts, setToasts] = useState<ApexToast[]>([])
  const [selectedProject, setSelectedProject] = useState<ProjectRow | null>(null)
  const [addForm, setAddForm] = useState<ProjectFormState>(defaultForm())
  const [editForm, setEditForm] = useState<ProjectFormState>(defaultForm())
  const [addAgreementFiles, setAddAgreementFiles] = useState<File[]>([])
  const [addScopeFiles, setAddScopeFiles] = useState<File[]>([])
  const [addOtherFiles, setAddOtherFiles] = useState<File[]>([])
  const [editAgreementFiles, setEditAgreementFiles] = useState<File[]>([])
  const [editScopeFiles, setEditScopeFiles] = useState<File[]>([])
  const [editOtherFiles, setEditOtherFiles] = useState<File[]>([])
  const [fileAgreementFiles, setFileAgreementFiles] = useState<File[]>([])
  const [fileScopeFiles, setFileScopeFiles] = useState<File[]>([])
  const [fileOtherFiles, setFileOtherFiles] = useState<File[]>([])
  const [fileKeptOtherUrls, setFileKeptOtherUrls] = useState<string[]>([])

  const [confirmConfig, setConfirmConfig] = useState<{
    title: string
    description: string
    confirmLabel: string
    tone: 'primary' | 'danger'
    kind: 'add' | 'edit' | 'delete' | 'toggle' | 'bulkSetInactive' | 'bulkDelete'
  } | null>(null)

  const queryHandledRef = useRef(false)

  useEffect(() => {
    if (queryHandledRef.current) return

    const openAdd = searchParams.get('openAdd')
    if (openAdd !== '1') return

    const clientId = searchParams.get('clientId') ?? ''
    const hasClient = clientId && clients.some((client) => client.id === clientId)
    const next = defaultForm()
    next.clientId = hasClient ? clientId : ''
    setAddForm(next)
    setAddAgreementFiles([])
    setAddScopeFiles([])
    setAddOtherFiles([])
    setAddOpen(true)
    queryHandledRef.current = true
    router.replace('/admin/ongoing-projects')
  }, [clients, router, searchParams])

  const teamById = useMemo(() => new Map(teamMembers.map((member) => [member.id, member])), [teamMembers])
  const clientById = useMemo(() => new Map(clients.map((client) => [client.id, client])), [clients])

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return projects.filter((project) => {
      const statusMatch =
        status === 'all'
          ? true
          : status === 'active'
          ? project.isActive
          : !project.isActive
      if (!statusMatch) return false

      if (!keyword) return true
      const teamNames = (project.assignedTeamIds ?? []).map((id) => teamById.get(id)?.name ?? '').join(' ')
      return [project.projectName, project.projectDescription ?? '', project.clientName ?? '', project.category ?? '', project.paymentTerm ?? '', teamNames]
        .join(' ')
        .toLowerCase()
        .includes(keyword)
    })
  }, [projects, search, status, teamById])

  const sorted = useMemo(() => {
    const list = [...filtered]
    list.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      if (sortKey === 'project') return a.projectName.localeCompare(b.projectName) * dir
      if (sortKey === 'client') return (a.clientName ?? '').localeCompare(b.clientName ?? '') * dir
      if (sortKey === 'team') {
        const aNames = (a.assignedTeamIds ?? []).map((id) => teamById.get(id)?.name ?? '').join(', ')
        const bNames = (b.assignedTeamIds ?? []).map((id) => teamById.get(id)?.name ?? '').join(', ')
        return aNames.localeCompare(bNames) * dir
      }
      if (sortKey === 'startDate') return (a.startDate ?? '').localeCompare(b.startDate ?? '') * dir
      if (sortKey === 'targetDate') return (a.targetDate ?? '').localeCompare(b.targetDate ?? '') * dir
      if (sortKey === 'price') return parseCurrencyInput(a.totalPrice ?? '0') > parseCurrencyInput(b.totalPrice ?? '0') ? dir : -dir
      if (sortKey === 'balance') return parseCurrencyInput(a.balance ?? '0') > parseCurrencyInput(b.balance ?? '0') ? dir : -dir
      return Number(a.isActive) === Number(b.isActive) ? 0 : (a.isActive ? 1 : -1) * dir
    })
    return list
  }, [filtered, sortDir, sortKey, teamById])

  const counts = useMemo(() => ({
    all: projects.length,
    active: projects.filter((item) => item.isActive).length,
    inactive: projects.filter((item) => !item.isActive).length,
  }), [projects])

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
    const typed = key as ColumnKey
    setColumns((prev) => ({ ...prev, [typed]: !prev[typed] }))
  }

  function onSort(next: SortKey) {
    if (sortKey === next) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(next)
    setSortDir('asc')
  }

  function renderSortIcon(key: SortKey) {
    if (sortKey !== key) return <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
    return sortDir === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
  }

  function toFormData(form: ProjectFormState, agreementFiles: File[] = [], scopeFiles: File[] = [], otherFiles: File[] = []) {
    const formData = new FormData()
    if (form.id) formData.set('id', form.id)
    formData.set('projectName', form.projectName)
    formData.set('projectDescription', form.projectDescription)
    formData.set('startDate', form.startDate)
    formData.set('targetDate', form.targetDate)
    formData.set('clientId', form.clientId)
    formData.set('category', form.categories.join(', '))
    for (const teamId of form.assignedTeamIds) formData.append('assignedTeamIds', teamId)
    formData.set('paymentTerm', form.paymentTerm)
    formData.set('status', form.status)
    formData.set('totalPrice', toSubmissionCurrency(form.totalPrice))
    formData.set('balance', toSubmissionCurrency(form.balance))
    formData.set('existingAgreementFileUrl', form.existingAgreementFileUrl)
    formData.set('existingScopeFileUrl', form.existingScopeFileUrl)
    formData.set('keptOtherFileUrls', form.keptOtherFileUrls.join('||'))
    if (agreementFiles[0]) formData.set('agreementFile', agreementFiles[0])
    if (scopeFiles[0]) formData.set('scopeFile', scopeFiles[0])
    for (const file of otherFiles.slice(0, 5)) formData.append('otherFiles', file)
    return formData
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
    const rows = sorted.map((project) => [
      project.projectName,
      project.category ?? '',
      project.clientName ?? '',
      (project.assignedTeamIds ?? []).map((id) => teamById.get(id)?.name ?? id).join(', '),
      formatDateLabel(project.startDate),
      formatDateLabel(project.targetDate),
      formatCurrency(project.totalPrice),
      project.paymentTerm ?? '',
      formatCurrency(project.balance),
      project.isActive ? 'Active' : 'Inactive',
    ])
    downloadCsv('ongoing-projects-export.csv', [['Project Name', 'Category', 'Client', 'Team', 'Start Date', 'Target Date', 'Price', 'Payment Term', 'Balance', 'Status'], ...rows])
    addToast('Ongoing projects CSV exported', 'success')
  }

  async function saveFilesModal() {
    if (!selectedProject) return
    setPending(true)
    try {
      const formData = new FormData()
      formData.set('id', selectedProject.id)
      formData.set('projectName', selectedProject.projectName)
      formData.set('existingAgreementFileUrl', fileAgreementFiles[0] ? '' : (selectedProject.agreementFileUrl || ''))
      formData.set('existingScopeFileUrl', fileScopeFiles[0] ? '' : (selectedProject.projectScopeFileUrl || ''))
      formData.set('keptOtherFileUrls', fileKeptOtherUrls.join('||'))
      if (fileAgreementFiles[0]) formData.set('agreementFile', fileAgreementFiles[0])
      if (fileScopeFiles[0]) formData.set('scopeFile', fileScopeFiles[0])
      for (const file of fileOtherFiles.slice(0, 5)) formData.append('otherFiles', file)
      await updateProjectFilesAction(formData)
      setFilesOpen(false)
      setFileAgreementFiles([])
      setFileScopeFiles([])
      setFileOtherFiles([])
      addToast('Project files updated', 'success')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to update files.', 'danger')
    } finally {
      setPending(false)
    }
  }

  async function executeConfirmedAction() {
    if (!confirmConfig) return
    setPending(true)

    try {
      if (confirmConfig.kind === 'add') {
        await createProjectAction(toFormData(addForm, addAgreementFiles, addScopeFiles, addOtherFiles))
        setAddOpen(false)
        setAddForm(defaultForm())
        setAddAgreementFiles([])
        setAddScopeFiles([])
        setAddOtherFiles([])
        addToast('Project added', 'success')
      }

      if (confirmConfig.kind === 'edit') {
        await updateProjectAction(toFormData(editForm, editAgreementFiles, editScopeFiles, editOtherFiles))
        setEditOpen(false)
        setEditAgreementFiles([])
        setEditScopeFiles([])
        setEditOtherFiles([])
        addToast('Project updated', 'success')
      }

      if (confirmConfig.kind === 'toggle' && selectedProject) {
        const formData = new FormData()
        formData.set('id', selectedProject.id)
        await toggleProjectAction(formData)
        addToast(selectedProject.isActive ? 'Project set inactive' : 'Project set active', 'success')
      }

      if (confirmConfig.kind === 'delete' && selectedProject) {
        const formData = new FormData()
        formData.set('id', selectedProject.id)
        await deleteProjectAction(formData)
        setViewOpen(false)
        addToast('Project deleted', 'success')
      }

      if (confirmConfig.kind === 'bulkSetInactive') {
        const formData = new FormData()
        formData.set('ids', selectedIds.join(','))
        await bulkSetInactiveProjectsAction(formData)
        setSelectedIds([])
        addToast('Selected projects set inactive', 'success')
      }

      if (confirmConfig.kind === 'bulkDelete') {
        const formData = new FormData()
        formData.set('ids', selectedIds.join(','))
        await bulkDeleteProjectsAction(formData)
        setSelectedIds([])
        addToast('Selected projects deleted', 'success')
      }

      setConfirmOpen(false)
      setConfirmConfig(null)
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

      <ApexBreadcrumbs items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Ongoing Projects' }]} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[42px] leading-none font-bold tracking-tight apx-text">Ongoing Projects</h1>
          <p className="mt-1 text-sm apx-muted">Track active client projects and delivery details.</p>
        </div>

        <button
          type="button"
          onClick={() => {
            setAddForm(defaultForm())
            setAddAgreementFiles([])
            setAddScopeFiles([])
            setAddOtherFiles([])
            setAddOpen(true)
          }}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-0.5"
          style={{ backgroundColor: 'var(--apx-primary)' }}
        >
          <Plus className="h-4 w-4" />
          Add Ongoing Project
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ApexStatusTabs
          tabs={[
            { key: 'all', label: 'All', count: counts.all },
            { key: 'active', label: 'Active', count: counts.active, indicatorColor: '#16a34a' },
            { key: 'inactive', label: 'Inactive', count: counts.inactive, indicatorColor: '#f97316' },
          ]}
          active={status}
          onChange={(value) => {
            setStatus(value as StatusFilter)
            setPage(1)
          }}
        />
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:max-w-md">
          <ApexSearchField
            value={search}
            onChange={(value) => {
              setSearch(value)
              setPage(1)
            }}
            placeholder="Search ongoing projects..."
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          {selectedIds.length > 0 ? (
            <>
              <ApexButton
                type="button"
                variant="outline"
                onClick={() => {
                  setConfirmConfig({
                    title: 'Set Selected Projects Inactive',
                    description: `Set ${selectedIds.length} selected project(s) inactive?`,
                    confirmLabel: 'Set Inactive',
                    tone: 'primary',
                    kind: 'bulkSetInactive',
                  })
                  setConfirmOpen(true)
                }}
              >
                <Power className="h-4 w-4" />
                Set Inactive
              </ApexButton>
              <ApexButton
                type="button"
                variant="danger"
                onClick={() => {
                  setConfirmConfig({
                    title: 'Delete Selected Projects',
                    description: `Delete ${selectedIds.length} selected project(s)? This cannot be undone.`,
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
              { key: 'project', label: 'Project Name', visible: columns.project },
              { key: 'client', label: 'Client', visible: columns.client },
              { key: 'team', label: 'Team List', visible: columns.team },
              { key: 'startDate', label: 'Start Date', visible: columns.startDate },
              { key: 'targetDate', label: 'Target Date', visible: columns.targetDate },
              { key: 'price', label: 'Price', visible: columns.price },
              { key: 'balance', label: 'Balance', visible: columns.balance },
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
              <th className="px-2 py-3">
                <ApexCheckbox checked={allCurrentPageSelected} onChange={toggleSelectAllCurrentPage} ariaLabel="Select all projects on page" />
              </th>
              {columns.project ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button type="button" className="inline-flex items-center gap-1.5" onClick={() => onSort('project')}>
                    Project Name
                    {renderSortIcon('project')}
                  </button>
                </th>
              ) : null}
              {columns.client ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button type="button" className="inline-flex items-center gap-1.5" onClick={() => onSort('client')}>
                    Client
                    {renderSortIcon('client')}
                  </button>
                </th>
              ) : null}
              {columns.team ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button type="button" className="inline-flex items-center gap-1.5" onClick={() => onSort('team')}>
                    Team List
                    {renderSortIcon('team')}
                  </button>
                </th>
              ) : null}
              {columns.startDate ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button type="button" className="inline-flex items-center gap-1.5" onClick={() => onSort('startDate')}>
                    Start Date
                    {renderSortIcon('startDate')}
                  </button>
                </th>
              ) : null}
              {columns.targetDate ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button type="button" className="inline-flex items-center gap-1.5" onClick={() => onSort('targetDate')}>
                    Target Date
                    {renderSortIcon('targetDate')}
                  </button>
                </th>
              ) : null}
              {columns.price ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button type="button" className="inline-flex items-center gap-1.5" onClick={() => onSort('price')}>
                    Price
                    {renderSortIcon('price')}
                  </button>
                </th>
              ) : null}
              {columns.balance ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button type="button" className="inline-flex items-center gap-1.5" onClick={() => onSort('balance')}>
                    Balance
                    {renderSortIcon('balance')}
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
              {columns.actions ? <th className="px-4 py-3 text-right font-semibold apx-text">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {paged.map((project) => {
              const client = project.clientId ? clientById.get(project.clientId) : null
              return (
                <tr
                  key={project.id}
                  className="apx-table-row cursor-pointer border-b last:border-b-0"
                  style={{ borderColor: 'var(--apx-border)' }}
                  onClick={() => {
                    setSelectedProject(project)
                    setViewOpen(true)
                  }}
                >
                  <td className="px-2 py-3" onClick={(event) => event.stopPropagation()}>
                    <ApexCheckbox checked={selectedIds.includes(project.id)} onChange={() => toggleSelectOne(project.id)} ariaLabel={`Select ${project.projectName}`} />
                  </td>
                  {columns.project ? (
                    <td className="px-4 py-3">
                      <p className="font-semibold apx-text">{project.projectName}</p>
                      <p className="text-xs apx-muted">{project.category || '-'}</p>
                    </td>
                  ) : null}
                  {columns.client ? (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {client?.profileImage || project.clientProfileImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={client?.profileImage || project.clientProfileImage || ''} alt={project.clientName || 'Client'} className="h-6 w-6 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-700">{(project.clientName || 'C').slice(0, 1).toUpperCase()}</div>
                        )}
                        <span className="apx-text">{project.clientName || '-'}</span>
                      </div>
                    </td>
                  ) : null}
                  {columns.team ? (
                    <td className="px-4 py-3">
                      {(project.assignedTeamIds ?? []).length ? (
                        <div className="space-y-1">
                          {project.assignedTeamIds.map((id) => {
                            const member = teamById.get(id)
                            return (
                              <div key={`${project.id}-${id}`} className="flex items-center gap-2">
                                {member?.avatar ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={member.avatar} alt={member.name} className="h-5 w-5 rounded-full object-cover" />
                                ) : (
                                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[9px] font-semibold text-slate-700">{(member?.name || '?').slice(0, 1).toUpperCase()}</div>
                                )}
                                <span className="text-xs apx-text">{member?.name || id}</span>
                              </div>
                            )
                          })}
                        </div>
                      ) : <span className="apx-muted">-</span>}
                    </td>
                  ) : null}
                  {columns.startDate ? <td className="px-4 py-3 apx-text">{formatDateLabel(project.startDate)}</td> : null}
                  {columns.targetDate ? <td className="px-4 py-3 apx-text">{formatDateLabel(project.targetDate)}</td> : null}
                  {columns.price ? (
                    <td className="px-4 py-3">
                      <p className="apx-text">{formatCurrency(project.totalPrice)}</p>
                      <p className="text-xs apx-muted">{project.paymentTerm || '-'}</p>
                    </td>
                  ) : null}
                  {columns.balance ? <td className="px-4 py-3 apx-text">{formatCurrency(project.balance)}</td> : null}
                  {columns.status ? (
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex rounded-full px-2 py-1 text-xs font-semibold"
                        style={
                          project.isActive
                            ? { backgroundColor: 'rgba(22,163,74,0.15)', color: '#15803d' }
                            : { backgroundColor: 'rgba(249,115,22,0.15)', color: '#c2410c' }
                        }
                      >
                        {project.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  ) : null}
                  {columns.actions ? (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2" onClick={(event) => event.stopPropagation()}>
                        <button type="button" className="apx-icon-action" onClick={() => addToast('Make payment is not connected yet.', 'default')} aria-label="Make payment"><CreditCard className="h-4 w-4" /></button>
                        <button type="button" className="apx-icon-action" onClick={() => addToast('Email action is not connected yet.', 'default')} aria-label="Email project"><Mail className="h-4 w-4" /></button>
                        <button
                          type="button"
                          className="apx-icon-action"
                          onClick={() => {
                            setSelectedProject(project)
                            setFileAgreementFiles([])
                            setFileScopeFiles([])
                            setFileOtherFiles([])
                            setFileKeptOtherUrls(project.otherFileUrls || [])
                            setFilesOpen(true)
                          }}
                          aria-label="Manage files"
                        >
                          <Files className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="apx-icon-action"
                          onClick={() => {
                            setEditForm(formFromProject(project))
                            setEditAgreementFiles([])
                            setEditScopeFiles([])
                            setEditOtherFiles([])
                            setSelectedProject(project)
                            setEditOpen(true)
                          }}
                          aria-label="Edit project"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="apx-icon-action"
                          onClick={() => {
                            setSelectedProject(project)
                            setConfirmConfig({
                              title: project.isActive ? 'Set Ongoing Project Inactive' : 'Set Ongoing Project Active',
                              description: `Update status for ${project.projectName}?`,
                              confirmLabel: project.isActive ? 'Set Inactive' : 'Set Active',
                              tone: 'primary',
                              kind: 'toggle',
                            })
                            setConfirmOpen(true)
                          }}
                          style={project.isActive ? { borderColor: 'rgba(234, 88, 12, 0.45)', color: '#c2410c', backgroundColor: 'rgba(249, 115, 22, 0.08)' } : { borderColor: 'rgba(22, 163, 74, 0.5)', color: '#15803d', backgroundColor: 'rgba(22, 163, 74, 0.12)' }}
                          aria-label="Toggle project status"
                        >
                          <Power className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="apx-icon-action-danger"
                          onClick={() => {
                            setSelectedProject(project)
                            setConfirmConfig({
                              title: 'Delete Ongoing Project',
                              description: `Delete ${project.projectName}? This cannot be undone.`,
                              confirmLabel: 'Delete',
                              tone: 'danger',
                              kind: 'delete',
                            })
                            setConfirmOpen(true)
                          }}
                          aria-label="Delete project"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ApexPagination
        page={safePage}
        totalPages={totalPages}
        perPage={perPage}
        totalItems={sorted.length}
        onPageChange={setPage}
        onPerPageChange={(value) => {
          setPerPage(value)
          setPage(1)
        }}
      />

      <ApexModal size="md" open={addOpen} title="Add Ongoing Project" subtitle="Create a project record" onClose={() => setAddOpen(false)}>
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault()
            setConfirmConfig({ title: 'Add Ongoing Project', description: 'Create this project?', confirmLabel: 'Save', tone: 'primary', kind: 'add' })
            setConfirmOpen(true)
          }}
        >
          <ProjectFormFields
            form={addForm}
            onChange={setAddForm}
            clients={clients}
            teamMembers={teamMembers}
            categories={categories}
            agreementFiles={addAgreementFiles}
            scopeFiles={addScopeFiles}
            otherFiles={addOtherFiles}
            onAgreementFilesChange={setAddAgreementFiles}
            onScopeFilesChange={setAddScopeFiles}
            onOtherFilesChange={setAddOtherFiles}
          />
          <div className="flex justify-end gap-2 pt-1">
            <ApexButton type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</ApexButton>
            <ApexButton type="submit">Save Project</ApexButton>
          </div>
        </form>
      </ApexModal>

      <ApexModal size="md" open={editOpen} title="Edit Ongoing Project" subtitle="Update project details" onClose={() => setEditOpen(false)}>
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault()
            setConfirmConfig({ title: 'Update Ongoing Project', description: 'Save project changes?', confirmLabel: 'Update', tone: 'primary', kind: 'edit' })
            setConfirmOpen(true)
          }}
        >
          <ProjectFormFields
            form={editForm}
            onChange={setEditForm}
            clients={clients}
            teamMembers={teamMembers}
            categories={categories}
            agreementFiles={editAgreementFiles}
            scopeFiles={editScopeFiles}
            otherFiles={editOtherFiles}
            onAgreementFilesChange={setEditAgreementFiles}
            onScopeFilesChange={setEditScopeFiles}
            onOtherFilesChange={setEditOtherFiles}
          />

          <div className="space-y-2 rounded-xl border p-3" style={{ borderColor: 'var(--apx-border)' }}>
            <p className="text-xs font-medium apx-muted">Existing Other Files</p>
            {(editForm.keptOtherFileUrls || []).length ? (
              <div className="space-y-1">
                {editForm.keptOtherFileUrls.map((url) => (
                  <div key={url} className="flex items-center justify-between rounded border px-2 py-1" style={{ borderColor: 'var(--apx-border)' }}>
                    <span className="truncate text-xs apx-text">{fileNameFromUrl(url)}</span>
                    <button
                      type="button"
                      className="apx-icon-action-danger"
                      onClick={() => setEditForm((prev) => ({ ...prev, keptOtherFileUrls: prev.keptOtherFileUrls.filter((item) => item !== url) }))}
                      aria-label="Remove file from db list"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : <p className="text-xs apx-muted">No existing files.</p>}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <ApexButton type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</ApexButton>
            <ApexButton type="submit">Save Changes</ApexButton>
          </div>
        </form>
      </ApexModal>

      <ApexModal size="md" open={filesOpen} title="Project Files" subtitle="Upload, replace, and review files." onClose={() => setFilesOpen(false)}>
        {selectedProject ? (
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2 rounded-xl border p-3" style={{ borderColor: 'var(--apx-border)' }}>
                <p className="text-xs font-medium apx-muted">Agreement File</p>
                {selectedProject.agreementFileUrl ? (
                  <div className="flex items-center justify-between rounded border px-2 py-1" style={{ borderColor: 'var(--apx-border)' }}>
                    <span className="truncate text-xs apx-text">{fileNameFromUrl(selectedProject.agreementFileUrl)}</span>
                    <span className="flex items-center gap-1">
                      <button type="button" className="apx-icon-action" onClick={() => openFile(selectedProject.agreementFileUrl || '')}><Eye className="h-3.5 w-3.5" /></button>
                      <button type="button" className="apx-icon-action" onClick={() => downloadFile(selectedProject.agreementFileUrl || '')}><Download className="h-3.5 w-3.5" /></button>
                    </span>
                  </div>
                ) : <p className="text-xs apx-muted">No file uploaded.</p>}
              </div>

              <div className="space-y-2 rounded-xl border p-3" style={{ borderColor: 'var(--apx-border)' }}>
                <p className="text-xs font-medium apx-muted">Project Scope File</p>
                {selectedProject.projectScopeFileUrl ? (
                  <div className="flex items-center justify-between rounded border px-2 py-1" style={{ borderColor: 'var(--apx-border)' }}>
                    <span className="truncate text-xs apx-text">{fileNameFromUrl(selectedProject.projectScopeFileUrl)}</span>
                    <span className="flex items-center gap-1">
                      <button type="button" className="apx-icon-action" onClick={() => openFile(selectedProject.projectScopeFileUrl || '')}><Eye className="h-3.5 w-3.5" /></button>
                      <button type="button" className="apx-icon-action" onClick={() => downloadFile(selectedProject.projectScopeFileUrl || '')}><Download className="h-3.5 w-3.5" /></button>
                    </span>
                  </div>
                ) : <p className="text-xs apx-muted">No file uploaded.</p>}
              </div>
            </div>

            <div className="space-y-2 rounded-xl border p-3" style={{ borderColor: 'var(--apx-border)' }}>
              <p className="text-xs font-medium apx-muted">Other Files</p>
              {fileKeptOtherUrls.length ? (
                <div className="space-y-1">
                  {fileKeptOtherUrls.map((url) => (
                    <div key={url} className="flex items-center justify-between rounded border px-2 py-1" style={{ borderColor: 'var(--apx-border)' }}>
                      <span className="truncate text-xs apx-text">{fileNameFromUrl(url)}</span>
                      <span className="flex items-center gap-1">
                        <button type="button" className="apx-icon-action" onClick={() => openFile(url)}><Eye className="h-3.5 w-3.5" /></button>
                        <button type="button" className="apx-icon-action" onClick={() => downloadFile(url)}><Download className="h-3.5 w-3.5" /></button>
                        <button type="button" className="apx-icon-action-danger" onClick={() => setFileKeptOtherUrls((prev) => prev.filter((item) => item !== url))}><Trash2 className="h-3.5 w-3.5" /></button>
                      </span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-xs apx-muted">No files uploaded.</p>}
            </div>

            <ApexFileDropzone label="Replace Agreement File" files={fileAgreementFiles} onFilesChange={(files) => setFileAgreementFiles(files.slice(0, 1))} maxFiles={1} maxSizeMb={10} />
            <ApexFileDropzone label="Replace Project Scope File" files={fileScopeFiles} onFilesChange={(files) => setFileScopeFiles(files.slice(0, 1))} maxFiles={1} maxSizeMb={10} />
            <ApexFileDropzone label="Add Other Files" files={fileOtherFiles} onFilesChange={(files) => setFileOtherFiles(files.slice(0, 5))} maxFiles={5} maxSizeMb={10} />

            <div className="flex justify-end gap-2 pt-1">
              <ApexButton type="button" variant="outline" onClick={() => setFilesOpen(false)}>Cancel</ApexButton>
              <ApexButton type="button" onClick={saveFilesModal}>Save Files</ApexButton>
            </div>
          </div>
        ) : null}
      </ApexModal>

      <ApexModal size="md" open={viewOpen} title="Ongoing Project Details" subtitle="View complete project information." onClose={() => setViewOpen(false)}>
        {selectedProject ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium apx-muted">Project Name</p>
                <p className="apx-text font-semibold">{selectedProject.projectName}</p>
              </div>
              <div>
                <p className="text-xs font-medium apx-muted">Client</p>
                <div className="mt-1 flex items-center gap-2">
                  {selectedProject.clientProfileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selectedProject.clientProfileImage} alt={selectedProject.clientName || 'Client'} className="h-6 w-6 rounded-full object-cover" />
                  ) : null}
                  <p className="apx-text">{selectedProject.clientName || '-'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium apx-muted">Category</p>
                <p className="apx-text">{selectedProject.category || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-medium apx-muted">Status</p>
                <p className="apx-text">{selectedProject.isActive ? 'Active' : 'Inactive'}</p>
              </div>
              <div>
                <p className="text-xs font-medium apx-muted">Start Date</p>
                <p className="apx-text">{formatDateLabel(selectedProject.startDate)}</p>
              </div>
              <div>
                <p className="text-xs font-medium apx-muted">Target Date</p>
                <p className="apx-text">{formatDateLabel(selectedProject.targetDate)}</p>
              </div>
              <div>
                <p className="text-xs font-medium apx-muted">Payment Term</p>
                <p className="apx-text">{selectedProject.paymentTerm || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-medium apx-muted">Total Price</p>
                <p className="apx-text">{formatCurrency(selectedProject.totalPrice)}</p>
              </div>
              <div>
                <p className="text-xs font-medium apx-muted">Balance</p>
                <p className="apx-text">{formatCurrency(selectedProject.balance)}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium apx-muted">Description</p>
              <p className="apx-text whitespace-pre-wrap">{selectedProject.projectDescription || '-'}</p>
            </div>
            <div>
              <p className="text-xs font-medium apx-muted">Assigned Team</p>
              {(selectedProject.assignedTeamIds ?? []).length ? (
                <div className="mt-1 space-y-1">
                  {selectedProject.assignedTeamIds.map((id) => {
                    const member = teamById.get(id)
                    return (
                      <div key={`view-${selectedProject.id}-${id}`} className="flex items-center gap-2">
                        {member?.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={member.avatar} alt={member.name} className="h-6 w-6 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-700">{(member?.name || '?').slice(0, 1).toUpperCase()}</div>
                        )}
                        <span className="apx-text">{member?.name || id}</span>
                      </div>
                    )
                  })}
                </div>
              ) : <p className="apx-muted">-</p>}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <FileLinksCard title="Agreement File" url={selectedProject.agreementFileUrl} />
              <FileLinksCard title="Project Scope File" url={selectedProject.projectScopeFileUrl} />
            </div>
            <div>
              <p className="mb-1 text-xs font-medium apx-muted">Other Files</p>
              {(selectedProject.otherFileUrls || []).length ? (
                <div className="space-y-1">
                  {selectedProject.otherFileUrls.map((url) => (
                    <div key={url} className="flex items-center justify-between rounded border px-2 py-1" style={{ borderColor: 'var(--apx-border)' }}>
                      <span className="truncate text-xs apx-text">{fileNameFromUrl(url)}</span>
                      <span className="flex items-center gap-1">
                        <button type="button" className="apx-icon-action" onClick={() => openFile(url)}><Eye className="h-3.5 w-3.5" /></button>
                        <button type="button" className="apx-icon-action" onClick={() => downloadFile(url)}><Download className="h-3.5 w-3.5" /></button>
                      </span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-xs apx-muted">No files uploaded</p>}
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <ApexButton type="button" variant="outline" onClick={() => setViewOpen(false)}>Close</ApexButton>
            </div>
          </div>
        ) : null}
      </ApexModal>

      <ApexConfirmationModal
        open={confirmOpen}
        title={confirmConfig?.title || 'Confirm action'}
        description={confirmConfig?.description || 'Proceed with this action?'}
        confirmLabel={confirmConfig?.confirmLabel || 'Confirm'}
        tone={confirmConfig?.tone || 'primary'}
        pending={pending}
        onClose={() => {
          if (pending) return
          setConfirmOpen(false)
        }}
        onConfirm={executeConfirmedAction}
      />
    </div>
  )
}

function FileLinksCard({ title, url }: { title: string; url: string | null }) {
  return (
    <div className="space-y-1 rounded-xl border p-3" style={{ borderColor: 'var(--apx-border)' }}>
      <p className="text-xs font-medium apx-muted">{title}</p>
      {url ? (
        <div className="flex items-center justify-between rounded border px-2 py-1" style={{ borderColor: 'var(--apx-border)' }}>
          <span className="truncate text-xs apx-text">{fileNameFromUrl(url)}</span>
          <span className="flex items-center gap-1">
            <button type="button" className="apx-icon-action" onClick={() => openFile(url)}><Eye className="h-3.5 w-3.5" /></button>
            <button type="button" className="apx-icon-action" onClick={() => downloadFile(url)}><Download className="h-3.5 w-3.5" /></button>
          </span>
        </div>
      ) : <p className="text-xs apx-muted">No file uploaded</p>}
    </div>
  )
}

function ProjectFormFields({
  form,
  onChange,
  clients,
  teamMembers,
  categories,
  agreementFiles,
  scopeFiles,
  otherFiles,
  onAgreementFilesChange,
  onScopeFilesChange,
  onOtherFilesChange,
}: {
  form: ProjectFormState
  onChange: (next: ProjectFormState) => void
  clients: ClientOption[]
  teamMembers: TeamMemberOption[]
  categories: string[]
  agreementFiles: File[]
  scopeFiles: File[]
  otherFiles: File[]
  onAgreementFilesChange: (files: File[]) => void
  onScopeFilesChange: (files: File[]) => void
  onOtherFilesChange: (files: File[]) => void
}) {
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [teamOpen, setTeamOpen] = useState(false)

  const categorySummary = form.categories.length > 0 ? form.categories.join(', ') : 'Select categories'
  const teamSummary = form.assignedTeamIds.length > 0 ? form.assignedTeamIds.map((id) => teamMembers.find((member) => member.id === id)?.name || id).join(', ') : 'Select team members'

  function toggleCategory(category: string) {
    const exists = form.categories.includes(category)
    const next = exists ? form.categories.filter((item) => item !== category) : [...form.categories, category]
    onChange({ ...form, categories: next })
  }

  function toggleTeam(id: string) {
    const exists = form.assignedTeamIds.includes(id)
    const next = exists ? form.assignedTeamIds.filter((item) => item !== id) : [...form.assignedTeamIds, id]
    onChange({ ...form, assignedTeamIds: next })
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="md:col-span-2">
        <label className="mb-1 block text-xs font-medium apx-muted">Project Name</label>
        <ApexInput value={form.projectName} onChange={(event) => onChange({ ...form, projectName: event.target.value })} required />
      </div>

      <div className="md:col-span-2">
        <label className="mb-1 block text-xs font-medium apx-muted">Category</label>
        <div className="relative">
          <button
            type="button"
            className="flex h-10 w-full items-center justify-between rounded-xl border px-3 text-sm"
            style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface-alt)', color: 'var(--apx-text)' }}
            onClick={() => setCategoryOpen((prev) => !prev)}
          >
            <span className={form.categories.length > 0 ? 'apx-text' : 'apx-muted'}>{categorySummary}</span>
            <ArrowDown className={['h-3.5 w-3.5 transition-transform', categoryOpen ? 'rotate-180' : 'rotate-0'].join(' ')} />
          </button>
          {categoryOpen ? (
            <div className="absolute left-0 right-0 top-full z-60 mt-2 max-h-44 overflow-y-auto rounded-xl border p-2" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
              {categories.map((category) => (
                <label key={category} className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs apx-text hover:bg-black/5">
                  <ApexCheckbox checked={form.categories.includes(category)} onChange={() => toggleCategory(category)} ariaLabel={`Toggle ${category}`} />
                  {category}
                </label>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="md:col-span-2">
        <label className="mb-1 block text-xs font-medium apx-muted">Project Description</label>
        <ApexTextarea value={form.projectDescription} onChange={(event) => onChange({ ...form, projectDescription: event.target.value })} rows={3} />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium apx-muted">Start Date</label>
        <ApexDateInput value={form.startDate} onChange={(event) => onChange({ ...form, startDate: event.target.value })} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium apx-muted">Target Date</label>
        <ApexDateInput value={form.targetDate} onChange={(event) => onChange({ ...form, targetDate: event.target.value })} />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium apx-muted">Client</label>
        <ApexDropdown value={form.clientId} placeholder="Select client" options={[{ value: '', label: 'Select client' }, ...clients.map((client) => ({ value: client.id, label: client.fullName }))]} onChange={(value) => onChange({ ...form, clientId: value })} />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium apx-muted">Assigned Team Member</label>
        <div className="relative">
          <button
            type="button"
            className="flex h-10 w-full items-center justify-between rounded-xl border px-3 text-sm"
            style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface-alt)', color: 'var(--apx-text)' }}
            onClick={() => setTeamOpen((prev) => !prev)}
          >
            <span className={form.assignedTeamIds.length > 0 ? 'apx-text' : 'apx-muted'}>{teamSummary}</span>
            <ArrowDown className={['h-3.5 w-3.5 transition-transform', teamOpen ? 'rotate-180' : 'rotate-0'].join(' ')} />
          </button>
          {teamOpen ? (
            <div className="absolute left-0 right-0 top-full z-60 mt-2 max-h-44 overflow-y-auto rounded-xl border p-2" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
              {teamMembers.map((member) => (
                <label key={member.id} className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs apx-text hover:bg-black/5">
                  <ApexCheckbox checked={form.assignedTeamIds.includes(member.id)} onChange={() => toggleTeam(member.id)} ariaLabel={`Toggle ${member.name}`} />
                  {member.name}
                </label>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="md:col-span-2">
        <ApexFileDropzone label="Agreement Upload" hint="Click or drag agreement file" files={agreementFiles} onFilesChange={(files) => onAgreementFilesChange(files.slice(0, 1))} maxFiles={1} maxSizeMb={10} />
      </div>

      <div className="md:col-span-2">
        <ApexFileDropzone label="Project Scope Upload" hint="Click or drag project scope file" files={scopeFiles} onFilesChange={(files) => onScopeFilesChange(files.slice(0, 1))} maxFiles={1} maxSizeMb={10} />
      </div>

      <div className="md:col-span-2">
        <ApexFileDropzone label="Other Files" hint="Click or drag files" files={otherFiles} onFilesChange={(files) => onOtherFilesChange(files.slice(0, 5))} maxFiles={5} maxSizeMb={10} />
      </div>

      <div className="md:col-span-2 grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium apx-muted">Payment Term</label>
          <ApexDropdown value={form.paymentTerm} options={PAYMENT_TERMS.map((term) => ({ value: term, label: term }))} onChange={(value) => onChange({ ...form, paymentTerm: value })} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium apx-muted">Status</label>
          <ApexDropdown value={form.status} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} onChange={(value) => onChange({ ...form, status: value as 'active' | 'inactive' })} />
        </div>
      </div>

      <div className="md:col-span-2 grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium apx-muted">Total Price</label>
          <ApexInput
            type="text"
            value={form.totalPrice}
            onChange={(event) => onChange({ ...form, totalPrice: event.target.value })}
            onBlur={() => onChange({ ...form, totalPrice: formatCurrencyInput(form.totalPrice) })}
            placeholder="₱ 0.00"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium apx-muted">Balance</label>
          <ApexInput
            type="text"
            value={form.balance}
            onChange={(event) => onChange({ ...form, balance: event.target.value })}
            onBlur={() => onChange({ ...form, balance: formatCurrencyInput(form.balance) })}
            placeholder="₱ 0.00"
          />
        </div>
      </div>
    </div>
  )
}
