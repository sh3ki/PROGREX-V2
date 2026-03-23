'use client'

import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, Edit2, Plus, Power, Trash2 } from 'lucide-react'
import { ApexButton, ApexInput, ApexTextarea } from '@/components/admin/apex/AdminPrimitives'
import {
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

type ProjectRow = {
  id: string
  slug: string
  title: string
  systemType: string
  industry: string
  image: string
  shortDesc: string
  categories: string[]
  tags: string[]
  details: unknown
  isFeatured: boolean
  featureOrder: number
  isPublished: boolean
  updatedAt: string | null
}

type ColumnKey = 'title' | 'type' | 'industry' | 'status' | 'updated' | 'actions'
type SortKey = Exclude<ColumnKey, 'actions'>

type ProjectFormState = {
  id?: string
  slug: string
  title: string
  systemType: string
  industry: string
  image: string
  shortDesc: string
  categories: string
  tags: string
  details: string
  isFeatured: boolean
  featureOrder: number
  status: 'active' | 'inactive'
}

function toRelative(value: string | null) {
  if (!value) return 'Never'

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

const defaultForm: ProjectFormState = {
  slug: '',
  title: '',
  systemType: '',
  industry: '',
  image: '',
  shortDesc: '',
  categories: '',
  tags: '',
  details: '{}',
  isFeatured: false,
  featureOrder: 999,
  status: 'active',
}

export default function AdminProjectsTemplateView({
  projects,
  createProjectAction,
  updateProjectAction,
  deleteProjectAction,
  bulkDeleteProjectsAction,
  bulkSetInactiveProjectsAction,
  toggleProjectActiveAction,
}: {
  projects: ProjectRow[]
  createProjectAction: (formData: FormData) => Promise<void>
  updateProjectAction: (formData: FormData) => Promise<void>
  deleteProjectAction: (formData: FormData) => Promise<void>
  bulkDeleteProjectsAction: (formData: FormData) => Promise<void>
  bulkSetInactiveProjectsAction: (formData: FormData) => Promise<void>
  toggleProjectActiveAction: (formData: FormData) => Promise<void>
}) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [sortKey, setSortKey] = useState<SortKey>('title')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState(false)
  const [pendingToggleProject, setPendingToggleProject] = useState<ProjectRow | null>(null)
  const [selectedProject, setSelectedProject] = useState<ProjectRow | null>(null)
  const [addForm, setAddForm] = useState<ProjectFormState>(defaultForm)
  const [editForm, setEditForm] = useState<ProjectFormState>({ ...defaultForm, id: '' })
  const [toasts, setToasts] = useState<ApexToast[]>([])
  const [columns, setColumns] = useState<Record<ColumnKey, boolean>>({
    title: true,
    type: true,
    industry: true,
    status: true,
    updated: true,
    actions: true,
  })

  const [confirmConfig, setConfirmConfig] = useState<{
    title: string
    description: string
    label: string
    tone: 'primary' | 'danger'
    kind: 'add' | 'edit' | 'delete' | 'bulkDelete' | 'bulkInactive' | 'toggleActive'
  } | null>(null)

  const statusOptions = useMemo(() => [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ] as const, [])

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return projects.filter((project) => {
      const statusMatch = status === 'all' ? true : status === 'active' ? project.isPublished : !project.isPublished
      const searchMatch =
        keyword.length === 0
          ? true
          : [project.title, project.slug, project.systemType, project.industry].join(' ').toLowerCase().includes(keyword)

      return statusMatch && searchMatch
    })
  }, [projects, search, status])

  const sorted = useMemo(() => {
    const items = [...filtered]

    items.sort((a, b) => {
      const direction = sortDir === 'asc' ? 1 : -1
      if (sortKey === 'title') return a.title.localeCompare(b.title) * direction
      if (sortKey === 'type') return a.systemType.localeCompare(b.systemType) * direction
      if (sortKey === 'industry') return a.industry.localeCompare(b.industry) * direction
      if (sortKey === 'status') return (Number(a.isPublished) - Number(b.isPublished)) * direction

      const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
      const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
      return (aTime - bTime) * direction
    })

    return items
  }, [filtered, sortDir, sortKey])

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage))
  const safePage = Math.min(page, totalPages)
  const paged = sorted.slice((safePage - 1) * perPage, safePage * perPage)

  const counts = useMemo(() => {
    const activeCount = projects.filter((project) => project.isPublished).length
    return {
      all: projects.length,
      active: activeCount,
      inactive: projects.length - activeCount,
    }
  }, [projects])

  const currentPageIds = paged.map((project) => project.id)
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

  function toFormData(form: ProjectFormState): FormData {
    const formData = new FormData()
    if (form.id) formData.set('id', form.id)
    formData.set('slug', form.slug)
    formData.set('title', form.title)
    formData.set('systemType', form.systemType)
    formData.set('industry', form.industry)
    formData.set('image', form.image)
    formData.set('shortDesc', form.shortDesc)
    formData.set('categories', form.categories)
    formData.set('tags', form.tags)
    formData.set('details', form.details)
    formData.set('featureOrder', String(form.featureOrder))
    formData.set('status', form.status)
    if (form.isFeatured) formData.set('isFeatured', 'on')
    return formData
  }

  function openEditModal(project: ProjectRow) {
    setSelectedProject(project)
    setEditForm({
      id: project.id,
      slug: project.slug,
      title: project.title,
      systemType: project.systemType,
      industry: project.industry,
      image: project.image,
      shortDesc: project.shortDesc,
      categories: (project.categories ?? []).join(', '),
      tags: (project.tags ?? []).join(', '),
      details: JSON.stringify(project.details ?? {}, null, 2),
      isFeatured: project.isFeatured,
      featureOrder: project.featureOrder,
      status: project.isPublished ? 'active' : 'inactive',
    })
    setEditOpen(true)
  }

  function openViewModal(project: ProjectRow) {
    setSelectedProject(project)
    setViewOpen(true)
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

  function exportCsv() {
    const headers: string[] = []
    if (columns.title) {
      headers.push('Title')
      headers.push('Slug')
    }
    if (columns.type) headers.push('System Type')
    if (columns.industry) headers.push('Industry')
    if (columns.status) headers.push('Status')
    if (columns.updated) headers.push('Last Updated')

    const rows = sorted.map((item) => {
      const row: string[] = []
      if (columns.title) {
        row.push(item.title)
        row.push(item.slug)
      }
      if (columns.type) row.push(item.systemType)
      if (columns.industry) row.push(item.industry)
      if (columns.status) row.push(item.isPublished ? 'Active' : 'Inactive')
      if (columns.updated) row.push(toRelative(item.updatedAt))
      return row
    })

    downloadCsv('projects-export.csv', [headers, ...rows])
    addToast('Projects CSV exported', 'success')
  }

  async function executeConfirmedAction() {
    if (!confirmConfig) return
    setPendingAction(true)

    try {
      if (confirmConfig.kind === 'add') {
        await createProjectAction(toFormData(addForm))
        setAddOpen(false)
        setAddForm(defaultForm)
        addToast('Project created successfully', 'success')
      }

      if (confirmConfig.kind === 'edit') {
        await updateProjectAction(toFormData(editForm))
        setEditOpen(false)
        addToast('Project updated successfully', 'success')
      }

      if (confirmConfig.kind === 'delete' && selectedProject) {
        const formData = new FormData()
        formData.set('id', selectedProject.id)
        await deleteProjectAction(formData)
        setSelectedProject(null)
        addToast('Project deleted', 'success')
      }

      if (confirmConfig.kind === 'bulkDelete') {
        const formData = new FormData()
        formData.set('ids', selectedIds.join(','))
        await bulkDeleteProjectsAction(formData)
        setSelectedIds([])
        addToast('Selected projects deleted', 'success')
      }

      if (confirmConfig.kind === 'bulkInactive') {
        const formData = new FormData()
        formData.set('ids', selectedIds.join(','))
        await bulkSetInactiveProjectsAction(formData)
        setSelectedIds([])
        addToast('Selected projects set to inactive', 'success')
      }

      if (confirmConfig.kind === 'toggleActive' && pendingToggleProject) {
        const formData = new FormData()
        formData.set('id', pendingToggleProject.id)
        await toggleProjectActiveAction(formData)
        addToast(`Project marked ${pendingToggleProject.isPublished ? 'inactive' : 'active'}`, 'success')
        setPendingToggleProject(null)
      }

      setConfirmOpen(false)
      setConfirmConfig(null)
    } finally {
      setPendingAction(false)
    }
  }

  return (
    <div className="space-y-4">
      <ApexToastStack toasts={toasts} onRemove={(id) => setToasts((prev) => prev.filter((toast) => toast.id !== id))} />

      <ApexBreadcrumbs items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Projects' }]} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[42px] leading-none font-bold tracking-tight apx-text">Projects</h1>
          <p className="mt-1 text-sm apx-muted">Manage showcase projects for homepage and project listings.</p>
        </div>

        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-0.5"
          style={{ backgroundColor: 'var(--apx-primary)' }}
        >
          <Plus className="h-4 w-4" />
          Add Project
        </button>
      </div>

      <ApexStatusTabs
        tabs={[
          { key: 'all', label: 'All', count: counts.all },
          { key: 'active', label: 'Active', count: counts.active },
          { key: 'inactive', label: 'Inactive', count: counts.inactive },
        ]}
        active={status}
        onChange={(key) => {
          setStatus(key as 'all' | 'active' | 'inactive')
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
            placeholder="Search projects..."
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
                    title: 'Set Projects Inactive',
                    description: `Set ${selectedIds.length} selected project(s) to inactive?`,
                    label: 'Set Inactive',
                    tone: 'primary',
                    kind: 'bulkInactive',
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
                className="whitespace-nowrap"
                onClick={() => {
                  setConfirmConfig({
                    title: 'Delete Selected Projects',
                    description: `Delete ${selectedIds.length} selected project(s)? This action cannot be undone.`,
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
              { key: 'title', label: 'Project', visible: columns.title },
              { key: 'type', label: 'System Type', visible: columns.type },
              { key: 'industry', label: 'Industry', visible: columns.industry },
              { key: 'status', label: 'Status', visible: columns.status },
              { key: 'updated', label: 'Last Updated', visible: columns.updated },
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
                <ApexCheckbox checked={allCurrentPageSelected} onChange={toggleSelectAllCurrentPage} ariaLabel="Select all current page projects" />
              </th>
              {columns.title ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button onClick={() => onSort('title')} className="inline-flex items-center gap-1.5" type="button">
                    Project
                    {renderSortIcon('title')}
                  </button>
                </th>
              ) : null}
              {columns.type ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button onClick={() => onSort('type')} className="inline-flex items-center gap-1.5" type="button">
                    System Type
                    {renderSortIcon('type')}
                  </button>
                </th>
              ) : null}
              {columns.industry ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button onClick={() => onSort('industry')} className="inline-flex items-center gap-1.5" type="button">
                    Industry
                    {renderSortIcon('industry')}
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
              {columns.updated ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button onClick={() => onSort('updated')} className="inline-flex items-center gap-1.5" type="button">
                    Last Updated
                    {renderSortIcon('updated')}
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
                onClick={() => openViewModal(project)}
                className={[
                  'apx-table-row cursor-pointer border-b last:border-b-0',
                  selectedIds.includes(project.id) ? 'apx-table-row-selected' : '',
                ].join(' ').trim()}
                style={{ borderColor: 'var(--apx-border)' }}
              >
                <td className="px-2 py-3">
                  <div onClick={(event) => event.stopPropagation()}>
                    <ApexCheckbox
                      checked={selectedIds.includes(project.id)}
                      onChange={() => toggleSelectOne(project.id)}
                      ariaLabel={`Select ${project.title}`}
                    />
                  </div>
                </td>
                {columns.title ? (
                  <td className="px-4 py-3">
                    <p className="font-semibold apx-text">{project.title}</p>
                    <p className="text-xs apx-muted">{project.slug}</p>
                  </td>
                ) : null}
                {columns.type ? <td className="px-4 py-3 apx-text">{project.systemType || '-'}</td> : null}
                {columns.industry ? <td className="px-4 py-3 apx-text">{project.industry || '-'}</td> : null}
                {columns.status ? (
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full px-2 py-1 text-xs font-semibold" style={project.isPublished ? { backgroundColor: 'rgba(22,163,74,0.15)', color: '#15803d' } : { backgroundColor: 'rgba(100,116,139,0.2)', color: '#334155' }}>
                      {project.isPublished ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                ) : null}
                {columns.updated ? <td className="px-4 py-3 apx-muted">{toRelative(project.updatedAt)}</td> : null}
                {columns.actions ? (
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          openEditModal(project)
                        }}
                        className="apx-icon-action"
                        aria-label={`Edit ${project.title}`}
                      >
                        <Edit2 className="apx-muted" />
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          setPendingToggleProject(project)
                          setConfirmConfig({
                            title: project.isPublished ? 'Deactivate Project' : 'Activate Project',
                            description: `Set ${project.title} as ${project.isPublished ? 'inactive' : 'active'}?`,
                            label: project.isPublished ? 'Deactivate' : 'Activate',
                            tone: 'primary',
                            kind: 'toggleActive',
                          })
                          setConfirmOpen(true)
                        }}
                        className="apx-icon-action"
                        style={
                          project.isPublished
                            ? {
                                borderColor: 'rgba(234, 88, 12, 0.45)',
                                color: '#c2410c',
                                backgroundColor: 'rgba(249, 115, 22, 0.08)',
                              }
                            : {
                                borderColor: 'rgba(22, 163, 74, 0.5)',
                                color: '#15803d',
                                backgroundColor: 'rgba(22, 163, 74, 0.12)',
                              }
                        }
                        aria-label={`Toggle ${project.title} status`}
                      >
                        <Power className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          setSelectedProject(project)
                          setConfirmConfig({
                            title: 'Delete Project',
                            description: `Delete ${project.title}? This action cannot be undone.`,
                            label: 'Delete',
                            tone: 'danger',
                            kind: 'delete',
                          })
                          setConfirmOpen(true)
                        }}
                        className="apx-icon-action-danger"
                        aria-label={`Delete ${project.title}`}
                      >
                        <Trash2 />
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

      <ApexModal size="sm" open={addOpen} title="Add Project" subtitle="Create a showcase project." onClose={() => setAddOpen(false)}>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            setConfirmConfig({
              title: 'Confirm Add Project',
              description: `Add ${addForm.title || 'this project'}?`,
              label: 'Add Project',
              tone: 'primary',
              kind: 'add',
            })
            setConfirmOpen(true)
          }}
          className="space-y-3"
        >
          <ApexInput value={addForm.slug} onChange={(event) => setAddForm((prev) => ({ ...prev, slug: event.target.value }))} placeholder="Slug" required />
          <ApexInput value={addForm.title} onChange={(event) => setAddForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="Title" required />
          <ApexInput value={addForm.systemType} onChange={(event) => setAddForm((prev) => ({ ...prev, systemType: event.target.value }))} placeholder="System type" />
          <ApexInput value={addForm.industry} onChange={(event) => setAddForm((prev) => ({ ...prev, industry: event.target.value }))} placeholder="Industry" />
          <ApexInput value={addForm.image} onChange={(event) => setAddForm((prev) => ({ ...prev, image: event.target.value }))} placeholder="Image URL" />
          <ApexTextarea value={addForm.shortDesc} onChange={(event) => setAddForm((prev) => ({ ...prev, shortDesc: event.target.value }))} rows={2} placeholder="Short description" />
          <ApexInput value={addForm.categories} onChange={(event) => setAddForm((prev) => ({ ...prev, categories: event.target.value }))} placeholder="Categories (comma-separated)" />
          <ApexInput value={addForm.tags} onChange={(event) => setAddForm((prev) => ({ ...prev, tags: event.target.value }))} placeholder="Tags (comma-separated)" />
          <ApexTextarea value={addForm.details} onChange={(event) => setAddForm((prev) => ({ ...prev, details: event.target.value }))} rows={5} placeholder="Details JSON" className="font-mono text-xs" />
          <ApexInput value={String(addForm.featureOrder)} onChange={(event) => setAddForm((prev) => ({ ...prev, featureOrder: Number(event.target.value) || 0 }))} type="number" placeholder="Feature order" />
          <div className="flex items-center gap-2">
            <ApexCheckbox checked={addForm.isFeatured} onChange={() => setAddForm((prev) => ({ ...prev, isFeatured: !prev.isFeatured }))} ariaLabel="Mark project as featured" />
            <span className="text-sm apx-muted">Featured</span>
          </div>
          <ApexDropdown value={addForm.status} onChange={(value) => setAddForm((prev) => ({ ...prev, status: value as 'active' | 'inactive' }))} options={[...statusOptions]} placeholder="Select status" />

          <div className="flex justify-end gap-2 pt-2">
            <ApexButton type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</ApexButton>
            <ApexButton type="submit">Save Project</ApexButton>
          </div>
        </form>
      </ApexModal>

      <ApexModal size="sm" open={editOpen} title="Edit Project" subtitle="Update project details." onClose={() => setEditOpen(false)}>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            setConfirmConfig({
              title: 'Confirm Edit Project',
              description: `Save changes for ${editForm.title || 'this project'}?`,
              label: 'Save Changes',
              tone: 'primary',
              kind: 'edit',
            })
            setConfirmOpen(true)
          }}
          className="space-y-3"
        >
          <ApexInput value={editForm.slug} onChange={(event) => setEditForm((prev) => ({ ...prev, slug: event.target.value }))} placeholder="Slug" required />
          <ApexInput value={editForm.title} onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="Title" required />
          <ApexInput value={editForm.systemType} onChange={(event) => setEditForm((prev) => ({ ...prev, systemType: event.target.value }))} placeholder="System type" />
          <ApexInput value={editForm.industry} onChange={(event) => setEditForm((prev) => ({ ...prev, industry: event.target.value }))} placeholder="Industry" />
          <ApexInput value={editForm.image} onChange={(event) => setEditForm((prev) => ({ ...prev, image: event.target.value }))} placeholder="Image URL" />
          <ApexTextarea value={editForm.shortDesc} onChange={(event) => setEditForm((prev) => ({ ...prev, shortDesc: event.target.value }))} rows={2} placeholder="Short description" />
          <ApexInput value={editForm.categories} onChange={(event) => setEditForm((prev) => ({ ...prev, categories: event.target.value }))} placeholder="Categories (comma-separated)" />
          <ApexInput value={editForm.tags} onChange={(event) => setEditForm((prev) => ({ ...prev, tags: event.target.value }))} placeholder="Tags (comma-separated)" />
          <ApexTextarea value={editForm.details} onChange={(event) => setEditForm((prev) => ({ ...prev, details: event.target.value }))} rows={5} placeholder="Details JSON" className="font-mono text-xs" />
          <ApexInput value={String(editForm.featureOrder)} onChange={(event) => setEditForm((prev) => ({ ...prev, featureOrder: Number(event.target.value) || 0 }))} type="number" placeholder="Feature order" />
          <div className="flex items-center gap-2">
            <ApexCheckbox checked={editForm.isFeatured} onChange={() => setEditForm((prev) => ({ ...prev, isFeatured: !prev.isFeatured }))} ariaLabel="Mark project as featured" />
            <span className="text-sm apx-muted">Featured</span>
          </div>
          <ApexDropdown value={editForm.status} onChange={(value) => setEditForm((prev) => ({ ...prev, status: value as 'active' | 'inactive' }))} options={[...statusOptions]} placeholder="Select status" />

          <div className="flex justify-end gap-2 pt-2">
            <ApexButton type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</ApexButton>
            <ApexButton type="submit">Save Changes</ApexButton>
          </div>
        </form>
      </ApexModal>

      <ApexModal size="sm" open={viewOpen && !!selectedProject} title="View Project" subtitle="Read-only project details." onClose={() => setViewOpen(false)}>
        {selectedProject ? (
          <div className="space-y-3">
            <div>
              <p className="text-xs uppercase tracking-wider apx-muted">Title</p>
              <p className="mt-1 text-sm font-medium apx-text">{selectedProject.title}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider apx-muted">Slug</p>
              <p className="mt-1 text-sm font-medium apx-text">{selectedProject.slug}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider apx-muted">System Type / Industry</p>
              <p className="mt-1 text-sm font-medium apx-text">{selectedProject.systemType || '-'} / {selectedProject.industry || '-'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider apx-muted">Status</p>
              <p className="mt-1 text-sm font-medium apx-text">{selectedProject.isPublished ? 'Active' : 'Inactive'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider apx-muted">Last Updated</p>
              <p className="mt-1 text-sm font-medium apx-text">{toRelative(selectedProject.updatedAt)}</p>
            </div>
            <div className="flex justify-end pt-2">
              <ApexButton type="button" variant="outline" onClick={() => setViewOpen(false)}>Close</ApexButton>
            </div>
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
