'use client'

import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, Check, Edit2, Plus, Power, ShieldCheck, Trash2 } from 'lucide-react'
import { ApexButton, ApexInput } from '@/components/admin/apex/AdminPrimitives'
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

type RoleRow = {
  id: string
  name: string
  description: string
  isSystem: boolean
  isActive: boolean
  updatedAt: string | null
}

type RolePermission = {
  roleId: string
  permissionKey: string
  canRead: boolean
  canWrite: boolean
  canDelete: boolean
}

type ColumnKey = 'name' | 'description' | 'status' | 'type' | 'lastUpdated' | 'actions'
type SortKey = Exclude<ColumnKey, 'actions'>

type RoleFormState = {
  id?: string
  name: string
  description: string
  status: 'active' | 'inactive'
  permissions: Record<string, { canRead: boolean; canWrite: boolean; canDelete: boolean }>
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

function buildDefaultPermissionState(permissionKeys: string[]) {
  return Object.fromEntries(
    permissionKeys.map((key) => [key, { canRead: true, canWrite: false, canDelete: false }]),
  )
}

export default function AdminRolesTemplateView({
  roles,
  permissions,
  permissionKeys,
  permissionLabels,
  createRoleAction,
  updateRoleAction,
  deleteRoleAction,
  bulkDeleteRolesAction,
  bulkSetInactiveRolesAction,
  toggleRoleActiveAction,
}: {
  roles: RoleRow[]
  permissions: RolePermission[]
  permissionKeys: string[]
  permissionLabels: Record<string, string>
  createRoleAction: (formData: FormData) => Promise<void>
  updateRoleAction: (formData: FormData) => Promise<void>
  deleteRoleAction: (formData: FormData) => Promise<void>
  bulkDeleteRolesAction: (formData: FormData) => Promise<void>
  bulkSetInactiveRolesAction: (formData: FormData) => Promise<void>
  toggleRoleActiveAction: (formData: FormData) => Promise<void>
}) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [columns, setColumns] = useState<Record<ColumnKey, boolean>>({
    name: true,
    description: true,
    status: true,
    type: true,
    lastUpdated: true,
    actions: true,
  })

  const [toasts, setToasts] = useState<ApexToast[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState(false)
  const [selectedRole, setSelectedRole] = useState<RoleRow | null>(null)
  const [pendingToggleRole, setPendingToggleRole] = useState<RoleRow | null>(null)

  const [confirmConfig, setConfirmConfig] = useState<{
    title: string
    description: string
    label: string
    tone: 'primary' | 'danger'
    kind: 'add' | 'edit' | 'delete' | 'bulkDelete' | 'bulkInactive' | 'toggleActive'
  } | null>(null)

  const [addForm, setAddForm] = useState<RoleFormState>({
    name: '',
    description: '',
    status: 'active',
    permissions: buildDefaultPermissionState(permissionKeys),
  })
  const [editForm, setEditForm] = useState<RoleFormState>({
    id: '',
    name: '',
    description: '',
    status: 'active',
    permissions: buildDefaultPermissionState(permissionKeys),
  })

  const permissionMap = useMemo(() => {
    const map = new Map<string, RolePermission>()
    for (const item of permissions) {
      map.set(`${item.roleId}:${item.permissionKey}`, item)
    }
    return map
  }, [permissions])

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return roles.filter((role) => {
      const statusMatch =
        status === 'all' ? true : status === 'active' ? role.isActive : !role.isActive
      const searchMatch =
        keyword.length === 0
          ? true
          : [role.name, role.description, role.isSystem ? 'system' : 'custom', role.isActive ? 'active' : 'inactive']
              .join(' ')
              .toLowerCase()
              .includes(keyword)

      return statusMatch && searchMatch
    })
  }, [roles, search, status])

  const sorted = useMemo(() => {
    const items = [...filtered]

    items.sort((a, b) => {
      const direction = sortDir === 'asc' ? 1 : -1

      if (sortKey === 'name') return a.name.localeCompare(b.name) * direction
      if (sortKey === 'description') return a.description.localeCompare(b.description) * direction
      if (sortKey === 'status') return (Number(a.isActive) - Number(b.isActive)) * direction
      if (sortKey === 'type') return (Number(a.isSystem) - Number(b.isSystem)) * direction

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
    const activeCount = roles.filter((role) => role.isActive).length
    return {
      all: roles.length,
      active: activeCount,
      inactive: roles.length - activeCount,
    }
  }, [roles])

  const visiblePermissionKeys = useMemo(
    () => permissionKeys.filter((key) => permissionLabels[key]),
    [permissionKeys, permissionLabels],
  )

  const statusOptions = useMemo(() => [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ] as const, [])

  const currentPageSelectableIds = paged.map((role) => role.id)
  const allCurrentPageSelected =
    currentPageSelectableIds.length > 0 && currentPageSelectableIds.every((id) => selectedIds.includes(id))

  function addToast(message: string, tone: ApexToast['tone'] = 'default') {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setToasts((prev) => [...prev, { id, message, tone }])
    setTimeout(() => setToasts((prev) => prev.filter((item) => item.id !== id)), 3500)
  }

  function toggleColumn(key: string) {
    const typedKey = key as ColumnKey
    setColumns((prev) => ({ ...prev, [typedKey]: !prev[typedKey] }))
  }

  function togglePermission(
    formType: 'add' | 'edit',
    permissionKey: string,
    action: 'canRead' | 'canWrite' | 'canDelete',
    checked: boolean,
  ) {
    if (formType === 'add') {
      setAddForm((prev) => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [permissionKey]: {
            ...(prev.permissions[permissionKey] ?? { canRead: true, canWrite: false, canDelete: false }),
            [action]: checked,
          },
        },
      }))
      return
    }

    setEditForm((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permissionKey]: {
          ...(prev.permissions[permissionKey] ?? { canRead: true, canWrite: false, canDelete: false }),
          [action]: checked,
        },
      },
    }))
  }

  function togglePermissionAll(formType: 'add' | 'edit', permissionKey: string, checked: boolean) {
    const nextValue = { canRead: checked, canWrite: checked, canDelete: checked }

    if (formType === 'add') {
      setAddForm((prev) => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [permissionKey]: nextValue,
        },
      }))
      return
    }

    setEditForm((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permissionKey]: nextValue,
      },
    }))
  }

  function applyAllPermissions(formType: 'add' | 'edit', checked: boolean) {
    const nextPermissions = Object.fromEntries(
      visiblePermissionKeys.map((key) => [key, { canRead: checked, canWrite: checked, canDelete: checked }]),
    ) as Record<string, { canRead: boolean; canWrite: boolean; canDelete: boolean }>

    if (formType === 'add') {
      setAddForm((prev) => ({ ...prev, permissions: nextPermissions }))
      return
    }

    setEditForm((prev) => ({ ...prev, permissions: nextPermissions }))
  }

  function buildRolePermissionState(roleId: string) {
    const result = buildDefaultPermissionState(permissionKeys)

    for (const key of permissionKeys) {
      const current = permissionMap.get(`${roleId}:${key}`)
      if (!current) continue
      result[key] = {
        canRead: current.canRead,
        canWrite: current.canWrite,
        canDelete: current.canDelete,
      }
    }

    return result
  }

  function getRolePermission(roleId: string, permissionKey: string) {
    return permissionMap.get(`${roleId}:${permissionKey}`) ?? {
      roleId,
      permissionKey,
      canRead: false,
      canWrite: false,
      canDelete: false,
    }
  }

  function openView(role: RoleRow) {
    setSelectedRole(role)
    setViewOpen(true)
  }

  function openEdit(role: RoleRow) {
    setSelectedRole(role)
    setEditForm({
      id: role.id,
      name: role.name,
      description: role.description,
      status: role.isActive ? 'active' : 'inactive',
      permissions: buildRolePermissionState(role.id),
    })
    setEditOpen(true)
  }

  function toggleSelectAllCurrentPage() {
    if (allCurrentPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentPageSelectableIds.includes(id)))
      return
    }

    setSelectedIds((prev) => Array.from(new Set([...prev, ...currentPageSelectableIds])))
  }

  function toggleSelectOne(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  function exportCsv() {
    const headers: string[] = []
    if (columns.name) headers.push('Role')
    if (columns.description) headers.push('Description')
    if (columns.status) headers.push('Status')
    if (columns.type) headers.push('Type')
    if (columns.lastUpdated) headers.push('Last Updated')

    const rows = sorted.map((item) => {
      const row: string[] = []
      if (columns.name) row.push(item.name)
      if (columns.description) row.push(item.description || '-')
      if (columns.status) row.push(item.isActive ? 'Active' : 'Inactive')
      if (columns.type) row.push(item.isSystem ? 'System' : 'Custom')
      if (columns.lastUpdated) row.push(toRelative(item.updatedAt))
      return row
    })

    downloadCsv('roles-export.csv', [headers, ...rows])
    addToast('Roles CSV exported', 'success')
  }

  function toFormData(form: RoleFormState): FormData {
    const payload = visiblePermissionKeys.map((key) => ({
      permissionKey: key,
      canRead: form.permissions[key]?.canRead ?? true,
      canWrite: form.permissions[key]?.canWrite ?? false,
      canDelete: form.permissions[key]?.canDelete ?? false,
    }))

    const formData = new FormData()
    if (form.id) formData.set('id', form.id)
    formData.set('name', form.name)
    formData.set('description', form.description)
    formData.set('status', form.status)
    formData.set('permissions', JSON.stringify(payload))
    return formData
  }

  async function executeConfirmedAction() {
    if (!confirmConfig) return
    setPendingAction(true)

    try {
      if (confirmConfig.kind === 'add') {
        await createRoleAction(toFormData(addForm))
        setAddOpen(false)
        setAddForm({
          name: '',
          description: '',
          status: 'active',
          permissions: buildDefaultPermissionState(permissionKeys),
        })
        addToast('Role created successfully', 'success')
      }

      if (confirmConfig.kind === 'edit') {
        await updateRoleAction(toFormData(editForm))
        setEditOpen(false)
        setSelectedRole(null)
        addToast('Role updated successfully', 'success')
      }

      if (confirmConfig.kind === 'delete' && selectedRole) {
        const formData = new FormData()
        formData.set('id', selectedRole.id)
        await deleteRoleAction(formData)
        setSelectedRole(null)
        addToast('Role deleted', 'success')
      }

      if (confirmConfig.kind === 'bulkDelete') {
        const formData = new FormData()
        formData.set('ids', selectedIds.join(','))
        await bulkDeleteRolesAction(formData)
        setSelectedIds([])
        addToast('Selected roles deleted', 'success')
      }

      if (confirmConfig.kind === 'bulkInactive') {
        const formData = new FormData()
        formData.set('ids', selectedIds.join(','))
        await bulkSetInactiveRolesAction(formData)
        setSelectedIds([])
        addToast('Selected roles set to inactive', 'success')
      }

      if (confirmConfig.kind === 'toggleActive' && pendingToggleRole) {
        const formData = new FormData()
        formData.set('id', pendingToggleRole.id)
        await toggleRoleActiveAction(formData)
        addToast(`Role marked ${pendingToggleRole.isActive ? 'inactive' : 'active'}`, 'success')
        setPendingToggleRole(null)
      }

      setConfirmOpen(false)
      setConfirmConfig(null)
    } finally {
      setPendingAction(false)
    }
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

  return (
    <div className="space-y-4">
      <ApexToastStack toasts={toasts} onRemove={(id) => setToasts((prev) => prev.filter((toast) => toast.id !== id))} />

      <ApexBreadcrumbs items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Roles' }]} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[42px] leading-none font-bold tracking-tight apx-text">Roles</h1>
          <p className="mt-1 text-sm apx-muted">Manage role access and module permissions.</p>
        </div>

        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-0.5"
          style={{ backgroundColor: 'var(--apx-primary)' }}
        >
          <Plus className="h-4 w-4" />
          Add Role
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
            placeholder="Search roles..."
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
                    title: 'Set Roles Inactive',
                    description: `Set ${selectedIds.length} selected role(s) to inactive?`,
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
                    title: 'Delete Selected Roles',
                    description: `Delete ${selectedIds.length} selected role(s)? This action cannot be undone.`,
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
              { key: 'name', label: 'Role', visible: columns.name },
              { key: 'description', label: 'Description', visible: columns.description },
              { key: 'status', label: 'Status', visible: columns.status },
              { key: 'type', label: 'Type', visible: columns.type },
              { key: 'lastUpdated', label: 'Last Updated', visible: columns.lastUpdated },
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
                <ApexCheckbox checked={allCurrentPageSelected} onChange={toggleSelectAllCurrentPage} ariaLabel="Select all current page roles" />
              </th>
              {columns.name ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button onClick={() => onSort('name')} className="inline-flex items-center gap-1.5" type="button">
                    Role
                    {renderSortIcon('name')}
                  </button>
                </th>
              ) : null}
              {columns.description ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button onClick={() => onSort('description')} className="inline-flex items-center gap-1.5" type="button">
                    Description
                    {renderSortIcon('description')}
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
              {columns.type ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button onClick={() => onSort('type')} className="inline-flex items-center gap-1.5" type="button">
                    Type
                    {renderSortIcon('type')}
                  </button>
                </th>
              ) : null}
              {columns.lastUpdated ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button onClick={() => onSort('lastUpdated')} className="inline-flex items-center gap-1.5" type="button">
                    Last Updated
                    {renderSortIcon('lastUpdated')}
                  </button>
                </th>
              ) : null}
              {columns.actions ? <th className="px-4 py-3 text-right font-semibold apx-text">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {paged.map((role) => (
              <tr
                key={role.id}
                onClick={() => openView(role)}
                className={[
                  'apx-table-row cursor-pointer border-b last:border-b-0',
                  selectedIds.includes(role.id) ? 'apx-table-row-selected' : '',
                ].join(' ').trim()}
                style={{ borderColor: 'var(--apx-border)' }}
              >
                <td className="px-2 py-3">
                  <div onClick={(event) => event.stopPropagation()}>
                    <ApexCheckbox
                      checked={selectedIds.includes(role.id)}
                      onChange={() => toggleSelectOne(role.id)}
                      ariaLabel={`Select ${role.name}`}
                    />
                  </div>
                </td>
                {columns.name ? (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--apx-primary-soft)', color: 'var(--apx-primary)' }}>
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <p className="font-semibold apx-text">{role.name}</p>
                    </div>
                  </td>
                ) : null}
                {columns.description ? <td className="px-4 py-3 apx-muted">{role.description || '-'}</td> : null}
                {columns.status ? (
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full px-2 py-1 text-xs font-semibold" style={role.isActive ? { backgroundColor: 'rgba(22,163,74,0.15)', color: '#15803d' } : { backgroundColor: 'rgba(100,116,139,0.2)', color: '#334155' }}>
                      {role.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                ) : null}
                {columns.type ? (
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full px-2 py-1 text-xs font-semibold" style={role.isSystem ? { backgroundColor: 'rgba(59,130,246,0.16)', color: '#1d4ed8' } : { backgroundColor: 'rgba(16,185,129,0.16)', color: '#047857' }}>
                      {role.isSystem ? 'System' : 'Custom'}
                    </span>
                  </td>
                ) : null}
                {columns.lastUpdated ? <td className="px-4 py-3 apx-muted">{toRelative(role.updatedAt)}</td> : null}
                {columns.actions ? (
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          openEdit(role)
                        }}
                        className="apx-icon-action"
                        aria-label={`Edit ${role.name}`}
                      >
                        <Edit2 className="apx-muted" />
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          setPendingToggleRole(role)
                          setConfirmConfig({
                            title: role.isActive ? 'Deactivate Role' : 'Activate Role',
                            description: `Set ${role.name} as ${role.isActive ? 'inactive' : 'active'}?`,
                            label: role.isActive ? 'Deactivate' : 'Activate',
                            tone: 'primary',
                            kind: 'toggleActive',
                          })
                          setConfirmOpen(true)
                        }}
                        className="apx-icon-action"
                        style={
                          role.isActive
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
                        aria-label={`Toggle ${role.name} active status`}
                      >
                        <Power className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          setSelectedRole(role)
                          setConfirmConfig({
                            title: 'Delete Role',
                            description: `Delete ${role.name}? This action cannot be undone.`,
                            label: 'Delete',
                            tone: 'danger',
                            kind: 'delete',
                          })
                          setConfirmOpen(true)
                        }}
                        className="apx-icon-action-danger"
                        aria-label={`Delete ${role.name}`}
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

      <ApexModal
        size="sm"
        open={addOpen}
        title="Add Role"
        subtitle="Create a new role and define its access."
        onClose={() => setAddOpen(false)}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault()
            setConfirmConfig({
              title: 'Confirm Add Role',
              description: `Add ${addForm.name || 'this role'}?`,
              label: 'Add Role',
              tone: 'primary',
              kind: 'add',
            })
            setConfirmOpen(true)
          }}
          className="space-y-4"
        >
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Role Name</label>
            <ApexInput value={addForm.name} onChange={(event) => setAddForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Role name" required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Description</label>
            <ApexInput value={addForm.description} onChange={(event) => setAddForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="Role description" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Status</label>
            <ApexDropdown
              value={addForm.status}
              onChange={(value) => setAddForm((prev) => ({ ...prev, status: value as 'active' | 'inactive' }))}
              options={[...statusOptions]}
              placeholder="Select status"
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-medium apx-muted">Permissions</p>
            <div className="mb-2 flex justify-end gap-2">
              <ApexButton type="button" variant="outline" className="text-xs" onClick={() => applyAllPermissions('add', true)}>
                Check All
              </ApexButton>
              <ApexButton type="button" variant="outline" className="text-xs" onClick={() => applyAllPermissions('add', false)}>
                Clear All
              </ApexButton>
            </div>
            <div className="rounded-xl border" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface-alt)' }}>
              <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-2 border-b px-3 py-2 text-[11px] font-semibold uppercase tracking-wide apx-muted" style={{ borderColor: 'var(--apx-border)' }}>
                <span>All</span>
                <span>Permission</span>
                <span>Read</span>
                <span>Write</span>
                <span>Delete</span>
              </div>
              <div className="max-h-56 space-y-1 overflow-y-auto p-2">
                {visiblePermissionKeys.map((key) => (
                  <div key={`add-${key}`} className="grid items-center gap-2 rounded-lg px-2 py-2 grid-cols-[auto_1fr_auto_auto_auto]">
                    <ApexCheckbox
                      checked={
                        (addForm.permissions[key]?.canRead ?? false) &&
                        (addForm.permissions[key]?.canWrite ?? false) &&
                        (addForm.permissions[key]?.canDelete ?? false)
                      }
                      onChange={() =>
                        togglePermissionAll(
                          'add',
                          key,
                          !(
                            (addForm.permissions[key]?.canRead ?? false) &&
                            (addForm.permissions[key]?.canWrite ?? false) &&
                            (addForm.permissions[key]?.canDelete ?? false)
                          ),
                        )
                      }
                      ariaLabel={`Toggle all access for ${permissionLabels[key]}`}
                    />
                    <p className="text-xs font-medium apx-text">{permissionLabels[key]}</p>
                    <ApexCheckbox
                      checked={addForm.permissions[key]?.canRead ?? true}
                      onChange={() =>
                        togglePermission('add', key, 'canRead', !(addForm.permissions[key]?.canRead ?? true))
                      }
                      ariaLabel={`Allow read for ${permissionLabels[key]}`}
                    />
                    <ApexCheckbox
                      checked={addForm.permissions[key]?.canWrite ?? false}
                      onChange={() =>
                        togglePermission('add', key, 'canWrite', !(addForm.permissions[key]?.canWrite ?? false))
                      }
                      ariaLabel={`Allow write for ${permissionLabels[key]}`}
                    />
                    <ApexCheckbox
                      checked={addForm.permissions[key]?.canDelete ?? false}
                      onChange={() =>
                        togglePermission('add', key, 'canDelete', !(addForm.permissions[key]?.canDelete ?? false))
                      }
                      ariaLabel={`Allow delete for ${permissionLabels[key]}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <ApexButton type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</ApexButton>
            <ApexButton type="submit">Save Role</ApexButton>
          </div>
        </form>
      </ApexModal>

      <ApexModal
        size="sm"
        open={editOpen}
        title="Edit Role"
        subtitle="Update role details and permissions."
        onClose={() => setEditOpen(false)}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault()
            setConfirmConfig({
              title: 'Confirm Edit Role',
              description: `Save changes for ${editForm.name || 'this role'}?`,
              label: 'Save Changes',
              tone: 'primary',
              kind: 'edit',
            })
            setConfirmOpen(true)
          }}
          className="space-y-4"
        >
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Role Name</label>
            <ApexInput value={editForm.name} onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Role name" required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Description</label>
            <ApexInput value={editForm.description} onChange={(event) => setEditForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="Role description" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Status</label>
            <ApexDropdown
              value={editForm.status}
              onChange={(value) => setEditForm((prev) => ({ ...prev, status: value as 'active' | 'inactive' }))}
              options={[...statusOptions]}
              placeholder="Select status"
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-medium apx-muted">Permissions</p>
            <div className="mb-2 flex justify-end gap-2">
              <ApexButton type="button" variant="outline" className="text-xs" onClick={() => applyAllPermissions('edit', true)}>
                Check All
              </ApexButton>
              <ApexButton type="button" variant="outline" className="text-xs" onClick={() => applyAllPermissions('edit', false)}>
                Clear All
              </ApexButton>
            </div>
            <div className="rounded-xl border" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface-alt)' }}>
              <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-2 border-b px-3 py-2 text-[11px] font-semibold uppercase tracking-wide apx-muted" style={{ borderColor: 'var(--apx-border)' }}>
                <span>All</span>
                <span>Permission</span>
                <span>Read</span>
                <span>Write</span>
                <span>Delete</span>
              </div>
              <div className="max-h-56 space-y-1 overflow-y-auto p-2">
                {visiblePermissionKeys.map((key) => (
                  <div key={`edit-${key}`} className="grid items-center gap-2 rounded-lg px-2 py-2 grid-cols-[auto_1fr_auto_auto_auto]">
                    <ApexCheckbox
                      checked={
                        (editForm.permissions[key]?.canRead ?? false) &&
                        (editForm.permissions[key]?.canWrite ?? false) &&
                        (editForm.permissions[key]?.canDelete ?? false)
                      }
                      onChange={() =>
                        togglePermissionAll(
                          'edit',
                          key,
                          !(
                            (editForm.permissions[key]?.canRead ?? false) &&
                            (editForm.permissions[key]?.canWrite ?? false) &&
                            (editForm.permissions[key]?.canDelete ?? false)
                          ),
                        )
                      }
                      ariaLabel={`Toggle all access for ${permissionLabels[key]}`}
                    />
                    <p className="text-xs font-medium apx-text">{permissionLabels[key]}</p>
                    <ApexCheckbox
                      checked={editForm.permissions[key]?.canRead ?? true}
                      onChange={() =>
                        togglePermission('edit', key, 'canRead', !(editForm.permissions[key]?.canRead ?? true))
                      }
                      ariaLabel={`Allow read for ${permissionLabels[key]}`}
                    />
                    <ApexCheckbox
                      checked={editForm.permissions[key]?.canWrite ?? false}
                      onChange={() =>
                        togglePermission('edit', key, 'canWrite', !(editForm.permissions[key]?.canWrite ?? false))
                      }
                      ariaLabel={`Allow write for ${permissionLabels[key]}`}
                    />
                    <ApexCheckbox
                      checked={editForm.permissions[key]?.canDelete ?? false}
                      onChange={() =>
                        togglePermission('edit', key, 'canDelete', !(editForm.permissions[key]?.canDelete ?? false))
                      }
                      ariaLabel={`Allow delete for ${permissionLabels[key]}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <ApexButton type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</ApexButton>
            <ApexButton type="submit">Save Changes</ApexButton>
          </div>
        </form>
      </ApexModal>

      <ApexModal
        size="sm"
        open={viewOpen && !!selectedRole}
        title="View Role"
        subtitle="Read-only role details and permission coverage."
        onClose={() => {
          setViewOpen(false)
          setSelectedRole(null)
        }}
      >
        {selectedRole ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--apx-primary-soft)', color: 'var(--apx-primary)' }}>
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-semibold apx-text">{selectedRole.name}</p>
                <p className="text-xs apx-muted">{selectedRole.isSystem ? 'System role' : 'Custom role'}</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wider apx-muted">Role Name</p>
                <p className="mt-1 text-sm font-medium apx-text">{selectedRole.name}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider apx-muted">Description</p>
                <p className="mt-1 text-sm font-medium apx-text">{selectedRole.description || '-'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider apx-muted">Status</p>
                <p className="mt-1 text-sm font-medium apx-text">{selectedRole.isActive ? 'Active' : 'Inactive'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider apx-muted">Last Updated</p>
                <p className="mt-1 text-sm font-medium apx-text">{toRelative(selectedRole.updatedAt)}</p>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider apx-muted">Permission Coverage</p>
              <div className="mt-2 overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface-alt)' }}>
                <table className="w-full min-w-90 text-left text-xs">
                  <thead>
                    <tr className="border-b" style={{ borderColor: 'var(--apx-border)' }}>
                      <th className="px-3 py-2 font-semibold apx-text">Permission</th>
                      <th className="px-3 py-2 font-semibold apx-text">Read</th>
                      <th className="px-3 py-2 font-semibold apx-text">Write</th>
                      <th className="px-3 py-2 font-semibold apx-text">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visiblePermissionKeys.map((key) => {
                      const current = getRolePermission(selectedRole.id, key)
                      return (
                        <tr key={`view-${selectedRole.id}-${key}`} className="border-b last:border-b-0" style={{ borderColor: 'var(--apx-border)' }}>
                          <td className="px-3 py-2 apx-text">{permissionLabels[key]}</td>
                          <td className="px-3 py-2 apx-text">{current.canRead ? <Check className="h-3.5 w-3.5" /> : <span className="apx-muted">No</span>}</td>
                          <td className="px-3 py-2 apx-text">{current.canWrite ? <Check className="h-3.5 w-3.5" /> : <span className="apx-muted">No</span>}</td>
                          <td className="px-3 py-2 apx-text">{current.canDelete ? <Check className="h-3.5 w-3.5" /> : <span className="apx-muted">No</span>}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <ApexButton
                type="button"
                variant="outline"
                onClick={() => {
                  setViewOpen(false)
                  setSelectedRole(null)
                }}
              >
                Close
              </ApexButton>
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
