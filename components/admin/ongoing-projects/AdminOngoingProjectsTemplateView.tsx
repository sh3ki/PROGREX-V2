'use client'

import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, Download, Edit2, Plus, Trash2 } from 'lucide-react'
import { ApexButton, ApexInput, ApexSelect, ApexTextarea } from '@/components/admin/apex/AdminPrimitives'
import {
  ApexBlockingSpinner,
  ApexBreadcrumbs,
  ApexColumnsToggle,
  ApexConfirmationModal,
  ApexExportButton,
  ApexModal,
  ApexPagination,
  ApexSearchField,
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
  category: string | null
  assignedTeamIds: string[]
  agreementFileUrl: string | null
  projectScopeFileUrl: string | null
  paymentTerm: string | null
  totalPrice: string | null
  balance: string | null
}

type ClientOption = { id: string; fullName: string }
type TeamMemberOption = { id: string; name: string }

type ColumnKey = 'project' | 'dates' | 'client' | 'category' | 'team' | 'payment' | 'actions'
type SortKey = Exclude<ColumnKey, 'actions'>

type ProjectFormState = {
  id?: string
  projectName: string
  projectDescription: string
  startDate: string
  targetDate: string
  clientId: string
  category: string
  assignedTeamIds: string[]
  paymentTerm: string
  totalPrice: string
  balance: string
  existingAgreementFileUrl: string
  existingScopeFileUrl: string
}

function defaultForm(): ProjectFormState {
  return {
    projectName: '',
    projectDescription: '',
    startDate: '',
    targetDate: '',
    clientId: '',
    category: '',
    assignedTeamIds: [],
    paymentTerm: 'One-time Payment',
    totalPrice: '',
    balance: '',
    existingAgreementFileUrl: '',
    existingScopeFileUrl: '',
  }
}

function formFromProject(project: ProjectRow): ProjectFormState {
  return {
    id: project.id,
    projectName: project.projectName,
    projectDescription: project.projectDescription ?? '',
    startDate: project.startDate ?? '',
    targetDate: project.targetDate ?? '',
    clientId: project.clientId ?? '',
    category: project.category ?? '',
    assignedTeamIds: project.assignedTeamIds ?? [],
    paymentTerm: project.paymentTerm ?? 'One-time Payment',
    totalPrice: project.totalPrice ?? '',
    balance: project.balance ?? '',
    existingAgreementFileUrl: project.agreementFileUrl ?? '',
    existingScopeFileUrl: project.projectScopeFileUrl ?? '',
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

export default function AdminOngoingProjectsTemplateView({
  projects,
  clients,
  teamMembers,
  createProjectAction,
  updateProjectAction,
  deleteProjectAction,
}: {
  projects: ProjectRow[]
  clients: ClientOption[]
  teamMembers: TeamMemberOption[]
  createProjectAction: (formData: FormData) => Promise<void>
  updateProjectAction: (formData: FormData) => Promise<void>
  deleteProjectAction: (formData: FormData) => Promise<void>
}) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('project')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [columns, setColumns] = useState<Record<ColumnKey, boolean>>({
    project: true,
    dates: true,
    client: true,
    category: true,
    team: true,
    payment: true,
    actions: true,
  })

  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [toasts, setToasts] = useState<ApexToast[]>([])
  const [selectedProject, setSelectedProject] = useState<ProjectRow | null>(null)
  const [addForm, setAddForm] = useState<ProjectFormState>(defaultForm())
  const [editForm, setEditForm] = useState<ProjectFormState>(defaultForm())
  const [addAgreementFile, setAddAgreementFile] = useState<File | null>(null)
  const [addScopeFile, setAddScopeFile] = useState<File | null>(null)
  const [editAgreementFile, setEditAgreementFile] = useState<File | null>(null)
  const [editScopeFile, setEditScopeFile] = useState<File | null>(null)
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string
    description: string
    confirmLabel: string
    tone: 'primary' | 'danger'
    kind: 'add' | 'edit' | 'delete'
  } | null>(null)

  const teamById = useMemo(() => new Map(teamMembers.map((member) => [member.id, member.name])), [teamMembers])

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return projects.filter((project) => {
      if (!keyword) return true
      const teamNames = (project.assignedTeamIds ?? []).map((id) => teamById.get(id) ?? '').join(' ')
      return [
        project.projectName,
        project.projectDescription ?? '',
        project.clientName ?? '',
        project.category ?? '',
        project.paymentTerm ?? '',
        teamNames,
      ]
        .join(' ')
        .toLowerCase()
        .includes(keyword)
    })
  }, [projects, search, teamById])

  const sorted = useMemo(() => {
    const list = [...filtered]
    list.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      if (sortKey === 'project') return a.projectName.localeCompare(b.projectName) * dir
      if (sortKey === 'dates') return `${a.startDate ?? ''} ${a.targetDate ?? ''}`.localeCompare(`${b.startDate ?? ''} ${b.targetDate ?? ''}`) * dir
      if (sortKey === 'client') return (a.clientName ?? '').localeCompare(b.clientName ?? '') * dir
      if (sortKey === 'category') return (a.category ?? '').localeCompare(b.category ?? '') * dir
      if (sortKey === 'team') {
        const aNames = (a.assignedTeamIds ?? []).map((id) => teamById.get(id) ?? '').join(', ')
        const bNames = (b.assignedTeamIds ?? []).map((id) => teamById.get(id) ?? '').join(', ')
        return aNames.localeCompare(bNames) * dir
      }
      return `${a.paymentTerm ?? ''} ${a.totalPrice ?? ''} ${a.balance ?? ''}`.localeCompare(`${b.paymentTerm ?? ''} ${b.totalPrice ?? ''} ${b.balance ?? ''}`) * dir
    })
    return list
  }, [filtered, sortDir, sortKey, teamById])

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage))
  const safePage = Math.min(page, totalPages)
  const paged = sorted.slice((safePage - 1) * perPage, safePage * perPage)

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

  function toFormData(form: ProjectFormState, agreementFile: File | null, scopeFile: File | null) {
    const formData = new FormData()
    if (form.id) formData.set('id', form.id)
    formData.set('projectName', form.projectName)
    formData.set('projectDescription', form.projectDescription)
    formData.set('startDate', form.startDate)
    formData.set('targetDate', form.targetDate)
    formData.set('clientId', form.clientId)
    formData.set('category', form.category)
    for (const teamId of form.assignedTeamIds) formData.append('assignedTeamIds', teamId)
    formData.set('paymentTerm', form.paymentTerm)
    formData.set('totalPrice', form.totalPrice)
    formData.set('balance', form.balance)
    formData.set('existingAgreementFileUrl', form.existingAgreementFileUrl)
    formData.set('existingScopeFileUrl', form.existingScopeFileUrl)
    if (agreementFile) formData.set('agreementFile', agreementFile)
    if (scopeFile) formData.set('scopeFile', scopeFile)
    return formData
  }

  function exportCsv() {
    const rows = sorted.map((project) => [
      project.projectName,
      project.projectDescription ?? '',
      project.startDate ?? '',
      project.targetDate ?? '',
      project.clientName ?? '',
      project.category ?? '',
      (project.assignedTeamIds ?? []).map((id) => teamById.get(id) ?? id).join(', '),
      project.paymentTerm ?? '',
      project.totalPrice ?? '0',
      project.balance ?? '0',
    ])
    downloadCsv('ongoing-projects-export.csv', [['Project', 'Description', 'Start Date', 'Target Date', 'Client', 'Category', 'Team', 'Payment Term', 'Total Price', 'Balance'], ...rows])
    addToast('Ongoing projects CSV exported', 'success')
  }

  async function executeConfirmedAction() {
    if (!confirmConfig) return
    setPending(true)

    try {
      if (confirmConfig.kind === 'add') {
        await createProjectAction(toFormData(addForm, addAgreementFile, addScopeFile))
        setAddOpen(false)
        setAddForm(defaultForm())
        setAddAgreementFile(null)
        setAddScopeFile(null)
        addToast('Project added', 'success')
      }

      if (confirmConfig.kind === 'edit') {
        await updateProjectAction(toFormData(editForm, editAgreementFile, editScopeFile))
        setEditOpen(false)
        setEditAgreementFile(null)
        setEditScopeFile(null)
        addToast('Project updated', 'success')
      }

      if (confirmConfig.kind === 'delete' && selectedProject) {
        const formData = new FormData()
        formData.set('id', selectedProject.id)
        await deleteProjectAction(formData)
        setViewOpen(false)
        addToast('Project deleted', 'success')
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
            setAddAgreementFile(null)
            setAddScopeFile(null)
            setAddOpen(true)
          }}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-0.5"
          style={{ backgroundColor: 'var(--apx-primary)' }}
        >
          <Plus className="h-4 w-4" />
          Add Ongoing Project
        </button>
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
          <ApexColumnsToggle
            columns={[
              { key: 'project', label: 'Project', visible: columns.project },
              { key: 'dates', label: 'Dates', visible: columns.dates },
              { key: 'client', label: 'Client', visible: columns.client },
              { key: 'category', label: 'Category', visible: columns.category },
              { key: 'team', label: 'Team', visible: columns.team },
              { key: 'payment', label: 'Payment', visible: columns.payment },
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
              {columns.project ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button type="button" className="inline-flex items-center gap-1.5" onClick={() => onSort('project')}>
                    Project
                    {renderSortIcon('project')}
                  </button>
                </th>
              ) : null}
              {columns.dates ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button type="button" className="inline-flex items-center gap-1.5" onClick={() => onSort('dates')}>
                    Dates
                    {renderSortIcon('dates')}
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
              {columns.category ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button type="button" className="inline-flex items-center gap-1.5" onClick={() => onSort('category')}>
                    Category
                    {renderSortIcon('category')}
                  </button>
                </th>
              ) : null}
              {columns.team ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button type="button" className="inline-flex items-center gap-1.5" onClick={() => onSort('team')}>
                    Team
                    {renderSortIcon('team')}
                  </button>
                </th>
              ) : null}
              {columns.payment ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button type="button" className="inline-flex items-center gap-1.5" onClick={() => onSort('payment')}>
                    Payment
                    {renderSortIcon('payment')}
                  </button>
                </th>
              ) : null}
              {columns.actions ? <th className="px-4 py-3 text-right font-semibold apx-text">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {paged.map((project) => (
              <tr
                key={project.id}
                className="apx-table-row cursor-pointer border-b last:border-b-0"
                style={{ borderColor: 'var(--apx-border)' }}
                onClick={() => {
                  setSelectedProject(project)
                  setViewOpen(true)
                }}
              >
                {columns.project ? (
                  <td className="px-4 py-3">
                    <p className="font-semibold apx-text">{project.projectName}</p>
                    <p className="line-clamp-2 text-xs apx-muted">{project.projectDescription || '-'}</p>
                  </td>
                ) : null}
                {columns.dates ? <td className="px-4 py-3 apx-text">{project.startDate || '-'} • {project.targetDate || '-'}</td> : null}
                {columns.client ? <td className="px-4 py-3 apx-text">{project.clientName || '-'}</td> : null}
                {columns.category ? <td className="px-4 py-3 apx-text">{project.category || '-'}</td> : null}
                {columns.team ? (
                  <td className="px-4 py-3 apx-text">
                    {(project.assignedTeamIds ?? []).length
                      ? project.assignedTeamIds.map((id) => teamById.get(id) ?? id).join(', ')
                      : '-'}
                  </td>
                ) : null}
                {columns.payment ? (
                  <td className="px-4 py-3">
                    <p className="apx-text">{project.paymentTerm || '-'}</p>
                    <p className="text-xs apx-muted">Total: {project.totalPrice || '0'} • Balance: {project.balance || '0'}</p>
                  </td>
                ) : null}
                {columns.actions ? (
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2" onClick={(event) => event.stopPropagation()}>
                      <button
                        type="button"
                        className="apx-icon-action"
                        onClick={() => {
                          setEditForm(formFromProject(project))
                          setEditAgreementFile(null)
                          setEditScopeFile(null)
                          setSelectedProject(project)
                          setEditOpen(true)
                        }}
                        aria-label="Edit project"
                      >
                        <Edit2 className="h-4 w-4" />
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
            ))}
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

      <ApexModal open={addOpen} title="Add Ongoing Project" subtitle="Create a project record" onClose={() => setAddOpen(false)}>
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault()
            setConfirmConfig({
              title: 'Add Ongoing Project',
              description: 'Create this project?',
              confirmLabel: 'Save',
              tone: 'primary',
              kind: 'add',
            })
            setConfirmOpen(true)
          }}
        >
          <ProjectFormFields
            form={addForm}
            onChange={setAddForm}
            clients={clients}
            teamMembers={teamMembers}
            onAgreementFileChange={setAddAgreementFile}
            onScopeFileChange={setAddScopeFile}
          />
          <div className="flex justify-end gap-2 pt-1">
            <ApexButton type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</ApexButton>
            <ApexButton type="submit">Save Project</ApexButton>
          </div>
        </form>
      </ApexModal>

      <ApexModal open={editOpen} title="Edit Ongoing Project" subtitle="Update project details" onClose={() => setEditOpen(false)}>
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault()
            setConfirmConfig({
              title: 'Update Ongoing Project',
              description: 'Save project changes?',
              confirmLabel: 'Update',
              tone: 'primary',
              kind: 'edit',
            })
            setConfirmOpen(true)
          }}
        >
          <ProjectFormFields
            form={editForm}
            onChange={setEditForm}
            clients={clients}
            teamMembers={teamMembers}
            onAgreementFileChange={setEditAgreementFile}
            onScopeFileChange={setEditScopeFile}
          />
          <p className="text-xs apx-muted">Existing files are preserved when no new file is uploaded.</p>
          <div className="flex justify-end gap-2 pt-1">
            <ApexButton type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</ApexButton>
            <ApexButton type="submit">Save Changes</ApexButton>
          </div>
        </form>
      </ApexModal>

      <ApexModal
        open={viewOpen}
        title={selectedProject?.projectName || 'Project Details'}
        subtitle="View delivery details"
        onClose={() => setViewOpen(false)}
      >
        {selectedProject ? (
          <div className="space-y-3 text-sm">
            <div className="grid gap-2 md:grid-cols-2">
              <p className="apx-text"><span className="font-semibold">Client:</span> {selectedProject.clientName || '-'}</p>
              <p className="apx-text"><span className="font-semibold">Category:</span> {selectedProject.category || '-'}</p>
              <p className="apx-text"><span className="font-semibold">Start Date:</span> {selectedProject.startDate || '-'}</p>
              <p className="apx-text"><span className="font-semibold">Target Date:</span> {selectedProject.targetDate || '-'}</p>
              <p className="apx-text"><span className="font-semibold">Payment Term:</span> {selectedProject.paymentTerm || '-'}</p>
              <p className="apx-text"><span className="font-semibold">Total / Balance:</span> {selectedProject.totalPrice || '0'} / {selectedProject.balance || '0'}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide apx-muted">Description</p>
              <p className="apx-text">{selectedProject.projectDescription || '-'}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide apx-muted">Assigned Team</p>
              <p className="apx-text">
                {(selectedProject.assignedTeamIds ?? []).length
                  ? selectedProject.assignedTeamIds.map((id) => teamById.get(id) ?? id).join(', ')
                  : '-'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedProject.agreementFileUrl ? (
                <ApexButton type="button" variant="outline" onClick={() => window.open(selectedProject.agreementFileUrl || '', '_blank', 'noopener,noreferrer')}>
                  <Download className="h-4 w-4" />
                  Agreement
                </ApexButton>
              ) : null}
              {selectedProject.projectScopeFileUrl ? (
                <ApexButton type="button" variant="outline" onClick={() => window.open(selectedProject.projectScopeFileUrl || '', '_blank', 'noopener,noreferrer')}>
                  <Download className="h-4 w-4" />
                  Project Scope
                </ApexButton>
              ) : null}
            </div>
            <div className="flex flex-wrap justify-end gap-2 pt-1">
              <ApexButton
                type="button"
                variant="outline"
                onClick={() => {
                  setEditForm(formFromProject(selectedProject))
                  setEditAgreementFile(null)
                  setEditScopeFile(null)
                  setEditOpen(true)
                }}
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </ApexButton>
              <ApexButton
                type="button"
                variant="danger"
                onClick={() => {
                  setConfirmConfig({
                    title: 'Delete Ongoing Project',
                    description: `Delete ${selectedProject.projectName}? This cannot be undone.`,
                    confirmLabel: 'Delete',
                    tone: 'danger',
                    kind: 'delete',
                  })
                  setConfirmOpen(true)
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </ApexButton>
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

function ProjectFormFields({
  form,
  onChange,
  clients,
  teamMembers,
  onAgreementFileChange,
  onScopeFileChange,
}: {
  form: ProjectFormState
  onChange: (next: ProjectFormState) => void
  clients: ClientOption[]
  teamMembers: TeamMemberOption[]
  onAgreementFileChange: (file: File | null) => void
  onScopeFileChange: (file: File | null) => void
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div>
        <label className="mb-1 block text-xs font-medium apx-muted">Project Name</label>
        <ApexInput value={form.projectName} onChange={(event) => onChange({ ...form, projectName: event.target.value })} required />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium apx-muted">Category</label>
        <ApexInput value={form.category} onChange={(event) => onChange({ ...form, category: event.target.value })} />
      </div>

      <div className="md:col-span-2">
        <label className="mb-1 block text-xs font-medium apx-muted">Project Description</label>
        <ApexTextarea value={form.projectDescription} onChange={(event) => onChange({ ...form, projectDescription: event.target.value })} rows={3} />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium apx-muted">Start Date</label>
        <ApexInput type="date" value={form.startDate} onChange={(event) => onChange({ ...form, startDate: event.target.value })} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium apx-muted">Target Date</label>
        <ApexInput type="date" value={form.targetDate} onChange={(event) => onChange({ ...form, targetDate: event.target.value })} />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium apx-muted">Client Name</label>
        <ApexSelect value={form.clientId} onChange={(event) => onChange({ ...form, clientId: event.target.value })}>
          <option value="">Select client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>{client.fullName}</option>
          ))}
        </ApexSelect>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium apx-muted">Assigned Team Member (multi-select)</label>
        <ApexSelect
          multiple
          className="h-28"
          value={form.assignedTeamIds}
          onChange={(event) => {
            const values = Array.from(event.target.selectedOptions).map((option) => option.value)
            onChange({ ...form, assignedTeamIds: values })
          }}
        >
          {teamMembers.map((member) => (
            <option key={member.id} value={member.id}>{member.name}</option>
          ))}
        </ApexSelect>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium apx-muted">Agreement Upload (Optional)</label>
        <ApexInput type="file" onChange={(event) => onAgreementFileChange(event.target.files?.[0] ?? null)} />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium apx-muted">Project Scope Upload (Optional)</label>
        <ApexInput type="file" onChange={(event) => onScopeFileChange(event.target.files?.[0] ?? null)} />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium apx-muted">Payment Term</label>
        <ApexSelect value={form.paymentTerm} onChange={(event) => onChange({ ...form, paymentTerm: event.target.value })}>
          <option value="One-time Payment">One-time Payment</option>
          <option value="Progress-based">Progress-based</option>
          <option value="Monthly billing">Monthly billing</option>
        </ApexSelect>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium apx-muted">Total Price</label>
        <ApexInput type="number" step="0.01" value={form.totalPrice} onChange={(event) => onChange({ ...form, totalPrice: event.target.value })} />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium apx-muted">Balance</label>
        <ApexInput type="number" step="0.01" value={form.balance} onChange={(event) => onChange({ ...form, balance: event.target.value })} />
      </div>
    </div>
  )
}
