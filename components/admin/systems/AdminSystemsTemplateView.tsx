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

type SystemRow = {
  id: string
  slug: string
  name: string
  category: string
  industry: string
  tagline: string
  shortDesc: string
  image: string
  hasDemo: boolean
  sortOrder: number
  details: unknown
  isPublished: boolean
  updatedAt: string | null
}

type ColumnKey = 'name' | 'category' | 'industry' | 'status' | 'updated' | 'actions'
type SortKey = Exclude<ColumnKey, 'actions'>

type SystemFormState = {
  id?: string
  slug: string
  name: string
  category: string
  industry: string
  tagline: string
  shortDesc: string
  image: string
  hasDemo: boolean
  sortOrder: number
  details: string
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

const defaultForm: SystemFormState = {
  slug: '',
  name: '',
  category: '',
  industry: '',
  tagline: '',
  shortDesc: '',
  image: '',
  hasDemo: false,
  sortOrder: 0,
  details: '{}',
  status: 'active',
}

export default function AdminSystemsTemplateView({
  systems,
  createSystemAction,
  updateSystemAction,
  deleteSystemAction,
  bulkDeleteSystemsAction,
  bulkSetInactiveSystemsAction,
  toggleSystemActiveAction,
}: {
  systems: SystemRow[]
  createSystemAction: (formData: FormData) => Promise<void>
  updateSystemAction: (formData: FormData) => Promise<void>
  deleteSystemAction: (formData: FormData) => Promise<void>
  bulkDeleteSystemsAction: (formData: FormData) => Promise<void>
  bulkSetInactiveSystemsAction: (formData: FormData) => Promise<void>
  toggleSystemActiveAction: (formData: FormData) => Promise<void>
}) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState(false)
  const [pendingToggleSystem, setPendingToggleSystem] = useState<SystemRow | null>(null)
  const [selectedSystem, setSelectedSystem] = useState<SystemRow | null>(null)
  const [addForm, setAddForm] = useState<SystemFormState>(defaultForm)
  const [editForm, setEditForm] = useState<SystemFormState>({ ...defaultForm, id: '' })
  const [toasts, setToasts] = useState<ApexToast[]>([])
  const [columns, setColumns] = useState<Record<ColumnKey, boolean>>({
    name: true,
    category: true,
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
    return systems.filter((system) => {
      const statusMatch = status === 'all' ? true : status === 'active' ? system.isPublished : !system.isPublished
      const searchMatch = keyword.length === 0 ? true : [system.name, system.slug, system.category, system.industry].join(' ').toLowerCase().includes(keyword)
      return statusMatch && searchMatch
    })
  }, [systems, search, status])

  const sorted = useMemo(() => {
    const items = [...filtered]

    items.sort((a, b) => {
      const direction = sortDir === 'asc' ? 1 : -1
      if (sortKey === 'name') return a.name.localeCompare(b.name) * direction
      if (sortKey === 'category') return a.category.localeCompare(b.category) * direction
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
    const activeCount = systems.filter((system) => system.isPublished).length
    return { all: systems.length, active: activeCount, inactive: systems.length - activeCount }
  }, [systems])

  const currentPageIds = paged.map((system) => system.id)
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

  function toFormData(form: SystemFormState): FormData {
    const formData = new FormData()
    if (form.id) formData.set('id', form.id)
    formData.set('slug', form.slug)
    formData.set('name', form.name)
    formData.set('category', form.category)
    formData.set('industry', form.industry)
    formData.set('tagline', form.tagline)
    formData.set('shortDesc', form.shortDesc)
    formData.set('image', form.image)
    formData.set('sortOrder', String(form.sortOrder))
    formData.set('details', form.details)
    formData.set('status', form.status)
    if (form.hasDemo) formData.set('hasDemo', 'on')
    return formData
  }

  function openEditModal(system: SystemRow) {
    setSelectedSystem(system)
    setEditForm({
      id: system.id,
      slug: system.slug,
      name: system.name,
      category: system.category,
      industry: system.industry,
      tagline: system.tagline,
      shortDesc: system.shortDesc,
      image: system.image,
      hasDemo: system.hasDemo,
      sortOrder: system.sortOrder,
      details: JSON.stringify(system.details ?? {}, null, 2),
      status: system.isPublished ? 'active' : 'inactive',
    })
    setEditOpen(true)
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
    const rows = sorted.map((item) => [item.name, item.slug, item.category, item.industry, item.isPublished ? 'Active' : 'Inactive', toRelative(item.updatedAt)])
    downloadCsv('systems-export.csv', [['Name', 'Slug', 'Category', 'Industry', 'Status', 'Last Updated'], ...rows])
    addToast('Systems CSV exported', 'success')
  }

  async function executeConfirmedAction() {
    if (!confirmConfig) return
    setPendingAction(true)

    try {
      if (confirmConfig.kind === 'add') {
        await createSystemAction(toFormData(addForm))
        setAddOpen(false)
        setAddForm(defaultForm)
        addToast('System created successfully', 'success')
      }

      if (confirmConfig.kind === 'edit') {
        await updateSystemAction(toFormData(editForm))
        setEditOpen(false)
        addToast('System updated successfully', 'success')
      }

      if (confirmConfig.kind === 'delete' && selectedSystem) {
        const formData = new FormData()
        formData.set('id', selectedSystem.id)
        await deleteSystemAction(formData)
        addToast('System deleted', 'success')
      }

      if (confirmConfig.kind === 'bulkDelete') {
        const formData = new FormData()
        formData.set('ids', selectedIds.join(','))
        await bulkDeleteSystemsAction(formData)
        setSelectedIds([])
        addToast('Selected systems deleted', 'success')
      }

      if (confirmConfig.kind === 'bulkInactive') {
        const formData = new FormData()
        formData.set('ids', selectedIds.join(','))
        await bulkSetInactiveSystemsAction(formData)
        setSelectedIds([])
        addToast('Selected systems set to inactive', 'success')
      }

      if (confirmConfig.kind === 'toggleActive' && pendingToggleSystem) {
        const formData = new FormData()
        formData.set('id', pendingToggleSystem.id)
        await toggleSystemActiveAction(formData)
        addToast(`System marked ${pendingToggleSystem.isPublished ? 'inactive' : 'active'}`, 'success')
        setPendingToggleSystem(null)
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
      <ApexBreadcrumbs items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Ready-Made Systems' }]} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[42px] leading-none font-bold tracking-tight apx-text">Ready-Made Systems</h1>
          <p className="mt-1 text-sm apx-muted">Manage productized systems shown on landing and systems pages.</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-0.5" style={{ backgroundColor: 'var(--apx-primary)' }}><Plus className="h-4 w-4" />Add System</button>
      </div>

      <ApexStatusTabs tabs={[{ key: 'all', label: 'All', count: counts.all }, { key: 'active', label: 'Active', count: counts.active }, { key: 'inactive', label: 'Inactive', count: counts.inactive }]} active={status} onChange={(key) => { setStatus(key as 'all' | 'active' | 'inactive'); setPage(1) }} />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:max-w-md"><ApexSearchField value={search} onChange={(value) => { setSearch(value); setPage(1) }} placeholder="Search systems..." /></div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {selectedIds.length > 0 ? (
            <>
              <ApexButton type="button" variant="outline" className="whitespace-nowrap" onClick={() => { setConfirmConfig({ title: 'Set Systems Inactive', description: `Set ${selectedIds.length} selected system(s) to inactive?`, label: 'Set Inactive', tone: 'primary', kind: 'bulkInactive' }); setConfirmOpen(true) }}><Power className="h-4 w-4" />Set Inactive</ApexButton>
              <ApexButton type="button" variant="danger" className="whitespace-nowrap" onClick={() => { setConfirmConfig({ title: 'Delete Selected Systems', description: `Delete ${selectedIds.length} selected system(s)? This action cannot be undone.`, label: 'Delete', tone: 'danger', kind: 'bulkDelete' }); setConfirmOpen(true) }}><Trash2 className="h-4 w-4" />Delete Selected</ApexButton>
            </>
          ) : null}

          <ApexColumnsToggle columns={[{ key: 'name', label: 'Name', visible: columns.name }, { key: 'category', label: 'Category', visible: columns.category }, { key: 'industry', label: 'Industry', visible: columns.industry }, { key: 'status', label: 'Status', visible: columns.status }, { key: 'updated', label: 'Last Updated', visible: columns.updated }, { key: 'actions', label: 'Actions', visible: columns.actions }]} onToggle={toggleColumn} />
          <ApexExportButton onClick={exportCsv} />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--apx-border)' }}>
              <th className="w-10 px-2 py-3"><ApexCheckbox checked={allCurrentPageSelected} onChange={toggleSelectAllCurrentPage} ariaLabel="Select all current page systems" /></th>
              {columns.name ? <th className="px-4 py-3 font-semibold apx-text"><button onClick={() => onSort('name')} className="inline-flex items-center gap-1.5" type="button">Name{renderSortIcon('name')}</button></th> : null}
              {columns.category ? <th className="px-4 py-3 font-semibold apx-text"><button onClick={() => onSort('category')} className="inline-flex items-center gap-1.5" type="button">Category{renderSortIcon('category')}</button></th> : null}
              {columns.industry ? <th className="px-4 py-3 font-semibold apx-text"><button onClick={() => onSort('industry')} className="inline-flex items-center gap-1.5" type="button">Industry{renderSortIcon('industry')}</button></th> : null}
              {columns.status ? <th className="px-4 py-3 font-semibold apx-text"><button onClick={() => onSort('status')} className="inline-flex items-center gap-1.5" type="button">Status{renderSortIcon('status')}</button></th> : null}
              {columns.updated ? <th className="px-4 py-3 font-semibold apx-text"><button onClick={() => onSort('updated')} className="inline-flex items-center gap-1.5" type="button">Last Updated{renderSortIcon('updated')}</button></th> : null}
              {columns.actions ? <th className="px-4 py-3 text-right font-semibold apx-text">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {paged.map((system) => (
              <tr key={system.id} onClick={() => { setSelectedSystem(system); setViewOpen(true) }} className={['apx-table-row cursor-pointer border-b last:border-b-0', selectedIds.includes(system.id) ? 'apx-table-row-selected' : ''].join(' ').trim()} style={{ borderColor: 'var(--apx-border)' }}>
                <td className="px-2 py-3"><div onClick={(event) => event.stopPropagation()}><ApexCheckbox checked={selectedIds.includes(system.id)} onChange={() => toggleSelectOne(system.id)} ariaLabel={`Select ${system.name}`} /></div></td>
                {columns.name ? <td className="px-4 py-3"><p className="font-semibold apx-text">{system.name}</p><p className="text-xs apx-muted">{system.slug}</p></td> : null}
                {columns.category ? <td className="px-4 py-3 apx-text">{system.category || '-'}</td> : null}
                {columns.industry ? <td className="px-4 py-3 apx-text">{system.industry || '-'}</td> : null}
                {columns.status ? <td className="px-4 py-3"><span className="inline-flex rounded-full px-2 py-1 text-xs font-semibold" style={system.isPublished ? { backgroundColor: 'rgba(22,163,74,0.15)', color: '#15803d' } : { backgroundColor: 'rgba(100,116,139,0.2)', color: '#334155' }}>{system.isPublished ? 'Active' : 'Inactive'}</span></td> : null}
                {columns.updated ? <td className="px-4 py-3 apx-muted">{toRelative(system.updatedAt)}</td> : null}
                {columns.actions ? (
                  <td className="px-4 py-3"><div className="flex items-center justify-end gap-2">
                    <button type="button" onClick={(event) => { event.stopPropagation(); openEditModal(system) }} className="apx-icon-action" aria-label={`Edit ${system.name}`}><Edit2 className="apx-muted" /></button>
                    <button type="button" onClick={(event) => {
                      event.stopPropagation()
                      setPendingToggleSystem(system)
                      setConfirmConfig({ title: system.isPublished ? 'Deactivate System' : 'Activate System', description: `Set ${system.name} as ${system.isPublished ? 'inactive' : 'active'}?`, label: system.isPublished ? 'Deactivate' : 'Activate', tone: 'primary', kind: 'toggleActive' })
                      setConfirmOpen(true)
                    }} className="apx-icon-action" style={system.isPublished ? { borderColor: 'rgba(234, 88, 12, 0.45)', color: '#c2410c', backgroundColor: 'rgba(249, 115, 22, 0.08)' } : { borderColor: 'rgba(22, 163, 74, 0.5)', color: '#15803d', backgroundColor: 'rgba(22, 163, 74, 0.12)' }} aria-label={`Toggle ${system.name} status`}><Power className="h-4 w-4" /></button>
                    <button type="button" onClick={(event) => {
                      event.stopPropagation()
                      setSelectedSystem(system)
                      setConfirmConfig({ title: 'Delete System', description: `Delete ${system.name}? This action cannot be undone.`, label: 'Delete', tone: 'danger', kind: 'delete' })
                      setConfirmOpen(true)
                    }} className="apx-icon-action-danger" aria-label={`Delete ${system.name}`}><Trash2 /></button>
                  </div></td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ApexPagination page={safePage} totalPages={totalPages} totalItems={sorted.length} perPage={perPage} rowsOptions={[10, 20, 50, 100]} onPerPageChange={(next) => { setPerPage(next); setPage(1) }} onPageChange={setPage} />

      <ApexModal size="sm" open={addOpen} title="Add System" subtitle="Create a ready-made system entry." onClose={() => setAddOpen(false)}>
        <form onSubmit={(event) => {
          event.preventDefault()
          setConfirmConfig({ title: 'Confirm Add System', description: `Add ${addForm.name || 'this system'}?`, label: 'Add System', tone: 'primary', kind: 'add' })
          setConfirmOpen(true)
        }} className="space-y-3">
          <ApexInput value={addForm.slug} onChange={(event) => setAddForm((prev) => ({ ...prev, slug: event.target.value }))} placeholder="Slug" required />
          <ApexInput value={addForm.name} onChange={(event) => setAddForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Name" required />
          <ApexInput value={addForm.category} onChange={(event) => setAddForm((prev) => ({ ...prev, category: event.target.value }))} placeholder="Category" />
          <ApexInput value={addForm.industry} onChange={(event) => setAddForm((prev) => ({ ...prev, industry: event.target.value }))} placeholder="Industry" />
          <ApexInput value={addForm.tagline} onChange={(event) => setAddForm((prev) => ({ ...prev, tagline: event.target.value }))} placeholder="Tagline" />
          <ApexTextarea value={addForm.shortDesc} onChange={(event) => setAddForm((prev) => ({ ...prev, shortDesc: event.target.value }))} rows={2} placeholder="Short description" />
          <ApexInput value={addForm.image} onChange={(event) => setAddForm((prev) => ({ ...prev, image: event.target.value }))} placeholder="Image URL" />
          <ApexInput value={String(addForm.sortOrder)} onChange={(event) => setAddForm((prev) => ({ ...prev, sortOrder: Number(event.target.value) || 0 }))} type="number" placeholder="Sort order" />
          <ApexTextarea value={addForm.details} onChange={(event) => setAddForm((prev) => ({ ...prev, details: event.target.value }))} rows={5} placeholder="Details JSON" className="font-mono text-xs" />
          <div className="flex items-center gap-2"><ApexCheckbox checked={addForm.hasDemo} onChange={() => setAddForm((prev) => ({ ...prev, hasDemo: !prev.hasDemo }))} ariaLabel="Set has demo" /><span className="text-sm apx-muted">Has Demo</span></div>
          <ApexDropdown value={addForm.status} onChange={(value) => setAddForm((prev) => ({ ...prev, status: value as 'active' | 'inactive' }))} options={[...statusOptions]} placeholder="Select status" />
          <div className="flex justify-end gap-2 pt-2"><ApexButton type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</ApexButton><ApexButton type="submit">Save System</ApexButton></div>
        </form>
      </ApexModal>

      <ApexModal size="sm" open={editOpen} title="Edit System" subtitle="Update system details." onClose={() => setEditOpen(false)}>
        <form onSubmit={(event) => {
          event.preventDefault()
          setConfirmConfig({ title: 'Confirm Edit System', description: `Save changes for ${editForm.name || 'this system'}?`, label: 'Save Changes', tone: 'primary', kind: 'edit' })
          setConfirmOpen(true)
        }} className="space-y-3">
          <ApexInput value={editForm.slug} onChange={(event) => setEditForm((prev) => ({ ...prev, slug: event.target.value }))} placeholder="Slug" required />
          <ApexInput value={editForm.name} onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Name" required />
          <ApexInput value={editForm.category} onChange={(event) => setEditForm((prev) => ({ ...prev, category: event.target.value }))} placeholder="Category" />
          <ApexInput value={editForm.industry} onChange={(event) => setEditForm((prev) => ({ ...prev, industry: event.target.value }))} placeholder="Industry" />
          <ApexInput value={editForm.tagline} onChange={(event) => setEditForm((prev) => ({ ...prev, tagline: event.target.value }))} placeholder="Tagline" />
          <ApexTextarea value={editForm.shortDesc} onChange={(event) => setEditForm((prev) => ({ ...prev, shortDesc: event.target.value }))} rows={2} placeholder="Short description" />
          <ApexInput value={editForm.image} onChange={(event) => setEditForm((prev) => ({ ...prev, image: event.target.value }))} placeholder="Image URL" />
          <ApexInput value={String(editForm.sortOrder)} onChange={(event) => setEditForm((prev) => ({ ...prev, sortOrder: Number(event.target.value) || 0 }))} type="number" placeholder="Sort order" />
          <ApexTextarea value={editForm.details} onChange={(event) => setEditForm((prev) => ({ ...prev, details: event.target.value }))} rows={5} placeholder="Details JSON" className="font-mono text-xs" />
          <div className="flex items-center gap-2"><ApexCheckbox checked={editForm.hasDemo} onChange={() => setEditForm((prev) => ({ ...prev, hasDemo: !prev.hasDemo }))} ariaLabel="Set has demo" /><span className="text-sm apx-muted">Has Demo</span></div>
          <ApexDropdown value={editForm.status} onChange={(value) => setEditForm((prev) => ({ ...prev, status: value as 'active' | 'inactive' }))} options={[...statusOptions]} placeholder="Select status" />
          <div className="flex justify-end gap-2 pt-2"><ApexButton type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</ApexButton><ApexButton type="submit">Save Changes</ApexButton></div>
        </form>
      </ApexModal>

      <ApexModal size="sm" open={viewOpen && !!selectedSystem} title="View System" subtitle="Read-only system details." onClose={() => setViewOpen(false)}>
        {selectedSystem ? (
          <div className="space-y-3">
            <div><p className="text-xs uppercase tracking-wider apx-muted">Name</p><p className="mt-1 text-sm font-medium apx-text">{selectedSystem.name}</p></div>
            <div><p className="text-xs uppercase tracking-wider apx-muted">Slug</p><p className="mt-1 text-sm font-medium apx-text">{selectedSystem.slug}</p></div>
            <div><p className="text-xs uppercase tracking-wider apx-muted">Status</p><p className="mt-1 text-sm font-medium apx-text">{selectedSystem.isPublished ? 'Active' : 'Inactive'}</p></div>
            <div><p className="text-xs uppercase tracking-wider apx-muted">Last Updated</p><p className="mt-1 text-sm font-medium apx-text">{toRelative(selectedSystem.updatedAt)}</p></div>
            <div className="flex justify-end pt-2"><ApexButton type="button" variant="outline" onClick={() => setViewOpen(false)}>Close</ApexButton></div>
          </div>
        ) : null}
      </ApexModal>

      <ApexConfirmationModal open={confirmOpen && !!confirmConfig} title={confirmConfig?.title ?? 'Confirm Action'} description={confirmConfig?.description ?? 'Proceed with this action?'} confirmLabel={confirmConfig?.label ?? 'Confirm'} tone={confirmConfig?.tone ?? 'primary'} pending={pendingAction} onClose={() => {
        if (pendingAction) return
        setConfirmOpen(false)
        setConfirmConfig(null)
      }} onConfirm={executeConfirmedAction} />
    </div>
  )
}
