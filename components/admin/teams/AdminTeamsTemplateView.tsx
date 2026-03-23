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

type TeamRow = {
  id: string
  name: string
  role: string
  bio: string
  avatar: string
  linkedin: string
  github: string
  portfolio: string
  sortOrder: number
  isActive: boolean
  updatedAt: string | null
}

type ColumnKey = 'name' | 'role' | 'sortOrder' | 'status' | 'updated' | 'actions'
type SortKey = Exclude<ColumnKey, 'actions'>

type TeamFormState = {
  id?: string
  name: string
  role: string
  bio: string
  avatar: string
  linkedin: string
  github: string
  portfolio: string
  sortOrder: number
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

const defaultForm: TeamFormState = {
  name: '',
  role: '',
  bio: '',
  avatar: '',
  linkedin: '',
  github: '',
  portfolio: '',
  sortOrder: 0,
  status: 'active',
}

export default function AdminTeamsTemplateView({
  team,
  createTeamAction,
  updateTeamAction,
  deleteTeamAction,
  bulkDeleteTeamAction,
  bulkSetInactiveTeamAction,
  toggleTeamActiveAction,
}: {
  team: TeamRow[]
  createTeamAction: (formData: FormData) => Promise<void>
  updateTeamAction: (formData: FormData) => Promise<void>
  deleteTeamAction: (formData: FormData) => Promise<void>
  bulkDeleteTeamAction: (formData: FormData) => Promise<void>
  bulkSetInactiveTeamAction: (formData: FormData) => Promise<void>
  toggleTeamActiveAction: (formData: FormData) => Promise<void>
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
  const [pendingToggleMember, setPendingToggleMember] = useState<TeamRow | null>(null)
  const [selectedMember, setSelectedMember] = useState<TeamRow | null>(null)
  const [addForm, setAddForm] = useState<TeamFormState>(defaultForm)
  const [editForm, setEditForm] = useState<TeamFormState>({ ...defaultForm, id: '' })
  const [toasts, setToasts] = useState<ApexToast[]>([])
  const [columns, setColumns] = useState<Record<ColumnKey, boolean>>({
    name: true,
    role: true,
    sortOrder: true,
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
    return team.filter((member) => {
      const statusMatch = status === 'all' ? true : status === 'active' ? member.isActive : !member.isActive
      const searchMatch = keyword.length === 0 ? true : [member.name, member.role].join(' ').toLowerCase().includes(keyword)
      return statusMatch && searchMatch
    })
  }, [team, search, status])

  const sorted = useMemo(() => {
    const items = [...filtered]

    items.sort((a, b) => {
      const direction = sortDir === 'asc' ? 1 : -1
      if (sortKey === 'name') return a.name.localeCompare(b.name) * direction
      if (sortKey === 'role') return a.role.localeCompare(b.role) * direction
      if (sortKey === 'sortOrder') return (a.sortOrder - b.sortOrder) * direction
      if (sortKey === 'status') return (Number(a.isActive) - Number(b.isActive)) * direction

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
    const activeCount = team.filter((member) => member.isActive).length
    return { all: team.length, active: activeCount, inactive: team.length - activeCount }
  }, [team])

  const currentPageIds = paged.map((member) => member.id)
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

  function toFormData(form: TeamFormState): FormData {
    const formData = new FormData()
    if (form.id) formData.set('id', form.id)
    formData.set('name', form.name)
    formData.set('role', form.role)
    formData.set('bio', form.bio)
    formData.set('avatar', form.avatar)
    formData.set('linkedin', form.linkedin)
    formData.set('github', form.github)
    formData.set('portfolio', form.portfolio)
    formData.set('sortOrder', String(form.sortOrder))
    formData.set('status', form.status)
    return formData
  }

  function openEditModal(member: TeamRow) {
    setSelectedMember(member)
    setEditForm({
      id: member.id,
      name: member.name,
      role: member.role,
      bio: member.bio,
      avatar: member.avatar,
      linkedin: member.linkedin,
      github: member.github,
      portfolio: member.portfolio,
      sortOrder: member.sortOrder,
      status: member.isActive ? 'active' : 'inactive',
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
    const rows = sorted.map((item) => [item.name, item.role, String(item.sortOrder), item.isActive ? 'Active' : 'Inactive', toRelative(item.updatedAt)])
    downloadCsv('team-export.csv', [['Name', 'Role', 'Sort Order', 'Status', 'Last Updated'], ...rows])
    addToast('Team CSV exported', 'success')
  }

  async function executeConfirmedAction() {
    if (!confirmConfig) return
    setPendingAction(true)

    try {
      if (confirmConfig.kind === 'add') {
        await createTeamAction(toFormData(addForm))
        setAddOpen(false)
        setAddForm(defaultForm)
        addToast('Team member created successfully', 'success')
      }

      if (confirmConfig.kind === 'edit') {
        await updateTeamAction(toFormData(editForm))
        setEditOpen(false)
        addToast('Team member updated successfully', 'success')
      }

      if (confirmConfig.kind === 'delete' && selectedMember) {
        const formData = new FormData()
        formData.set('id', selectedMember.id)
        await deleteTeamAction(formData)
        addToast('Team member deleted', 'success')
      }

      if (confirmConfig.kind === 'bulkDelete') {
        const formData = new FormData()
        formData.set('ids', selectedIds.join(','))
        await bulkDeleteTeamAction(formData)
        setSelectedIds([])
        addToast('Selected members deleted', 'success')
      }

      if (confirmConfig.kind === 'bulkInactive') {
        const formData = new FormData()
        formData.set('ids', selectedIds.join(','))
        await bulkSetInactiveTeamAction(formData)
        setSelectedIds([])
        addToast('Selected members set to inactive', 'success')
      }

      if (confirmConfig.kind === 'toggleActive' && pendingToggleMember) {
        const formData = new FormData()
        formData.set('id', pendingToggleMember.id)
        await toggleTeamActiveAction(formData)
        addToast(`Member marked ${pendingToggleMember.isActive ? 'inactive' : 'active'}`, 'success')
        setPendingToggleMember(null)
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

      <ApexBreadcrumbs items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Teams' }]} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[42px] leading-none font-bold tracking-tight apx-text">Teams</h1>
          <p className="mt-1 text-sm apx-muted">Maintain About page team cards and links.</p>
        </div>

        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-0.5"
          style={{ backgroundColor: 'var(--apx-primary)' }}
        >
          <Plus className="h-4 w-4" />
          Add Member
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
          <ApexSearchField value={search} onChange={(value) => { setSearch(value); setPage(1) }} placeholder="Search team..." />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {selectedIds.length > 0 ? (
            <>
              <ApexButton type="button" variant="outline" className="whitespace-nowrap" onClick={() => {
                setConfirmConfig({ title: 'Set Team Inactive', description: `Set ${selectedIds.length} selected member(s) to inactive?`, label: 'Set Inactive', tone: 'primary', kind: 'bulkInactive' })
                setConfirmOpen(true)
              }}>
                <Power className="h-4 w-4" />
                Set Inactive
              </ApexButton>
              <ApexButton type="button" variant="danger" className="whitespace-nowrap" onClick={() => {
                setConfirmConfig({ title: 'Delete Selected Members', description: `Delete ${selectedIds.length} selected member(s)? This action cannot be undone.`, label: 'Delete', tone: 'danger', kind: 'bulkDelete' })
                setConfirmOpen(true)
              }}>
                <Trash2 className="h-4 w-4" />
                Delete Selected
              </ApexButton>
            </>
          ) : null}

          <ApexColumnsToggle
            columns={[
              { key: 'name', label: 'Name', visible: columns.name },
              { key: 'role', label: 'Role', visible: columns.role },
              { key: 'sortOrder', label: 'Sort Order', visible: columns.sortOrder },
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
              <th className="w-10 px-2 py-3"><ApexCheckbox checked={allCurrentPageSelected} onChange={toggleSelectAllCurrentPage} ariaLabel="Select all current page members" /></th>
              {columns.name ? <th className="px-4 py-3 font-semibold apx-text"><button onClick={() => onSort('name')} className="inline-flex items-center gap-1.5" type="button">Name{renderSortIcon('name')}</button></th> : null}
              {columns.role ? <th className="px-4 py-3 font-semibold apx-text"><button onClick={() => onSort('role')} className="inline-flex items-center gap-1.5" type="button">Role{renderSortIcon('role')}</button></th> : null}
              {columns.sortOrder ? <th className="px-4 py-3 font-semibold apx-text"><button onClick={() => onSort('sortOrder')} className="inline-flex items-center gap-1.5" type="button">Sort{renderSortIcon('sortOrder')}</button></th> : null}
              {columns.status ? <th className="px-4 py-3 font-semibold apx-text"><button onClick={() => onSort('status')} className="inline-flex items-center gap-1.5" type="button">Status{renderSortIcon('status')}</button></th> : null}
              {columns.updated ? <th className="px-4 py-3 font-semibold apx-text"><button onClick={() => onSort('updated')} className="inline-flex items-center gap-1.5" type="button">Last Updated{renderSortIcon('updated')}</button></th> : null}
              {columns.actions ? <th className="px-4 py-3 text-right font-semibold apx-text">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {paged.map((member) => (
              <tr key={member.id} onClick={() => { setSelectedMember(member); setViewOpen(true) }} className={['apx-table-row cursor-pointer border-b last:border-b-0', selectedIds.includes(member.id) ? 'apx-table-row-selected' : ''].join(' ').trim()} style={{ borderColor: 'var(--apx-border)' }}>
                <td className="px-2 py-3"><div onClick={(event) => event.stopPropagation()}><ApexCheckbox checked={selectedIds.includes(member.id)} onChange={() => toggleSelectOne(member.id)} ariaLabel={`Select ${member.name}`} /></div></td>
                {columns.name ? <td className="px-4 py-3"><p className="font-semibold apx-text">{member.name}</p></td> : null}
                {columns.role ? <td className="px-4 py-3 apx-text">{member.role}</td> : null}
                {columns.sortOrder ? <td className="px-4 py-3 apx-text">{member.sortOrder}</td> : null}
                {columns.status ? <td className="px-4 py-3"><span className="inline-flex rounded-full px-2 py-1 text-xs font-semibold" style={member.isActive ? { backgroundColor: 'rgba(22,163,74,0.15)', color: '#15803d' } : { backgroundColor: 'rgba(100,116,139,0.2)', color: '#334155' }}>{member.isActive ? 'Active' : 'Inactive'}</span></td> : null}
                {columns.updated ? <td className="px-4 py-3 apx-muted">{toRelative(member.updatedAt)}</td> : null}
                {columns.actions ? (
                  <td className="px-4 py-3"><div className="flex items-center justify-end gap-2">
                    <button type="button" onClick={(event) => { event.stopPropagation(); openEditModal(member) }} className="apx-icon-action" aria-label={`Edit ${member.name}`}><Edit2 className="apx-muted" /></button>
                    <button type="button" onClick={(event) => {
                      event.stopPropagation()
                      setPendingToggleMember(member)
                      setConfirmConfig({ title: member.isActive ? 'Deactivate Member' : 'Activate Member', description: `Set ${member.name} as ${member.isActive ? 'inactive' : 'active'}?`, label: member.isActive ? 'Deactivate' : 'Activate', tone: 'primary', kind: 'toggleActive' })
                      setConfirmOpen(true)
                    }} className="apx-icon-action" style={member.isActive ? { borderColor: 'rgba(234, 88, 12, 0.45)', color: '#c2410c', backgroundColor: 'rgba(249, 115, 22, 0.08)' } : { borderColor: 'rgba(22, 163, 74, 0.5)', color: '#15803d', backgroundColor: 'rgba(22, 163, 74, 0.12)' }} aria-label={`Toggle ${member.name} status`}><Power className="h-4 w-4" /></button>
                    <button type="button" onClick={(event) => {
                      event.stopPropagation()
                      setSelectedMember(member)
                      setConfirmConfig({ title: 'Delete Team Member', description: `Delete ${member.name}? This action cannot be undone.`, label: 'Delete', tone: 'danger', kind: 'delete' })
                      setConfirmOpen(true)
                    }} className="apx-icon-action-danger" aria-label={`Delete ${member.name}`}><Trash2 /></button>
                  </div></td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ApexPagination page={safePage} totalPages={totalPages} totalItems={sorted.length} perPage={perPage} rowsOptions={[10, 20, 50, 100]} onPerPageChange={(next) => { setPerPage(next); setPage(1) }} onPageChange={setPage} />

      <ApexModal size="sm" open={addOpen} title="Add Team Member" subtitle="Create a team card entry." onClose={() => setAddOpen(false)}>
        <form onSubmit={(event) => {
          event.preventDefault()
          setConfirmConfig({ title: 'Confirm Add Team Member', description: `Add ${addForm.name || 'this member'}?`, label: 'Add Member', tone: 'primary', kind: 'add' })
          setConfirmOpen(true)
        }} className="space-y-3">
          <ApexInput value={addForm.name} onChange={(event) => setAddForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Name" required />
          <ApexInput value={addForm.role} onChange={(event) => setAddForm((prev) => ({ ...prev, role: event.target.value }))} placeholder="Role" required />
          <ApexInput value={addForm.avatar} onChange={(event) => setAddForm((prev) => ({ ...prev, avatar: event.target.value }))} placeholder="Avatar URL" />
          <ApexTextarea value={addForm.bio} onChange={(event) => setAddForm((prev) => ({ ...prev, bio: event.target.value }))} rows={3} placeholder="Bio" />
          <ApexInput value={addForm.linkedin} onChange={(event) => setAddForm((prev) => ({ ...prev, linkedin: event.target.value }))} placeholder="LinkedIn" />
          <ApexInput value={addForm.github} onChange={(event) => setAddForm((prev) => ({ ...prev, github: event.target.value }))} placeholder="GitHub" />
          <ApexInput value={addForm.portfolio} onChange={(event) => setAddForm((prev) => ({ ...prev, portfolio: event.target.value }))} placeholder="Portfolio" />
          <ApexInput value={String(addForm.sortOrder)} onChange={(event) => setAddForm((prev) => ({ ...prev, sortOrder: Number(event.target.value) || 0 }))} type="number" placeholder="Sort order" />
          <ApexDropdown value={addForm.status} onChange={(value) => setAddForm((prev) => ({ ...prev, status: value as 'active' | 'inactive' }))} options={[...statusOptions]} placeholder="Select status" />
          <div className="flex justify-end gap-2 pt-2"><ApexButton type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</ApexButton><ApexButton type="submit">Save Member</ApexButton></div>
        </form>
      </ApexModal>

      <ApexModal size="sm" open={editOpen} title="Edit Team Member" subtitle="Update team card details." onClose={() => setEditOpen(false)}>
        <form onSubmit={(event) => {
          event.preventDefault()
          setConfirmConfig({ title: 'Confirm Edit Team Member', description: `Save changes for ${editForm.name || 'this member'}?`, label: 'Save Changes', tone: 'primary', kind: 'edit' })
          setConfirmOpen(true)
        }} className="space-y-3">
          <ApexInput value={editForm.name} onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Name" required />
          <ApexInput value={editForm.role} onChange={(event) => setEditForm((prev) => ({ ...prev, role: event.target.value }))} placeholder="Role" required />
          <ApexInput value={editForm.avatar} onChange={(event) => setEditForm((prev) => ({ ...prev, avatar: event.target.value }))} placeholder="Avatar URL" />
          <ApexTextarea value={editForm.bio} onChange={(event) => setEditForm((prev) => ({ ...prev, bio: event.target.value }))} rows={3} placeholder="Bio" />
          <ApexInput value={editForm.linkedin} onChange={(event) => setEditForm((prev) => ({ ...prev, linkedin: event.target.value }))} placeholder="LinkedIn" />
          <ApexInput value={editForm.github} onChange={(event) => setEditForm((prev) => ({ ...prev, github: event.target.value }))} placeholder="GitHub" />
          <ApexInput value={editForm.portfolio} onChange={(event) => setEditForm((prev) => ({ ...prev, portfolio: event.target.value }))} placeholder="Portfolio" />
          <ApexInput value={String(editForm.sortOrder)} onChange={(event) => setEditForm((prev) => ({ ...prev, sortOrder: Number(event.target.value) || 0 }))} type="number" placeholder="Sort order" />
          <ApexDropdown value={editForm.status} onChange={(value) => setEditForm((prev) => ({ ...prev, status: value as 'active' | 'inactive' }))} options={[...statusOptions]} placeholder="Select status" />
          <div className="flex justify-end gap-2 pt-2"><ApexButton type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</ApexButton><ApexButton type="submit">Save Changes</ApexButton></div>
        </form>
      </ApexModal>

      <ApexModal size="sm" open={viewOpen && !!selectedMember} title="View Team Member" subtitle="Read-only team details." onClose={() => setViewOpen(false)}>
        {selectedMember ? (
          <div className="space-y-3">
            <div><p className="text-xs uppercase tracking-wider apx-muted">Name</p><p className="mt-1 text-sm font-medium apx-text">{selectedMember.name}</p></div>
            <div><p className="text-xs uppercase tracking-wider apx-muted">Role</p><p className="mt-1 text-sm font-medium apx-text">{selectedMember.role}</p></div>
            <div><p className="text-xs uppercase tracking-wider apx-muted">Status</p><p className="mt-1 text-sm font-medium apx-text">{selectedMember.isActive ? 'Active' : 'Inactive'}</p></div>
            <div><p className="text-xs uppercase tracking-wider apx-muted">Last Updated</p><p className="mt-1 text-sm font-medium apx-text">{toRelative(selectedMember.updatedAt)}</p></div>
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
