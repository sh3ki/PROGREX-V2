'use client'

import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, Edit2, KeyRound, Plus, Power, Trash2, UserX } from 'lucide-react'
import {
  ApexButton,
  ApexInput,
} from '@/components/admin/apex/AdminPrimitives'
import {
  ApexBlockingSpinner,
  ApexBreadcrumbs,
  ApexCheckbox,
  ApexConfirmationModal,
  ApexColumnsToggle,
  ApexDropdown,
  ApexExportButton,
  ApexImageDropzone,
  ApexModal,
  ApexPagination,
  ApexSearchField,
  ApexStatusTabs,
  ApexToast,
  ApexToastStack,
} from '@/components/admin/apex/ApexDataUi'

type RoleOption = { id: string; name: string }

type UserRow = {
  id: string
  fullName: string
  email: string
  roleId: string
  roleName: string
  isActive: boolean
  profileImageUrl: string | null
  updatedAt: string | null
}

type ColumnKey = 'name' | 'role' | 'status' | 'lastActive' | 'actions'
type SortKey = Exclude<ColumnKey, 'actions'>

type PreparedUser = UserRow & {
  username: string
  statusLabel: string
  relativeLastActive: string
}

type UserFormState = {
  id?: string
  fullName: string
  email: string
  password: string
  confirmPassword?: string
  roleId: string
  status: 'active' | 'inactive'
  profileImageUrl?: string
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

export default function AdminUsersTemplateView({
  users,
  roles,
  createUserAction,
  updateUserAction,
  deleteUserAction,
  bulkDeleteUsersAction,
  bulkSetInactiveAction,
  toggleUserActiveAction,
  changeUserPasswordAction,
}: {
  users: UserRow[]
  roles: RoleOption[]
  createUserAction: (formData: FormData) => Promise<void>
  updateUserAction: (formData: FormData) => Promise<void>
  deleteUserAction: (formData: FormData) => Promise<void>
  bulkDeleteUsersAction: (formData: FormData) => Promise<void>
  bulkSetInactiveAction: (formData: FormData) => Promise<void>
  toggleUserActiveAction: (formData: FormData) => Promise<void>
  changeUserPasswordAction: (formData: FormData) => Promise<void>
}) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmConfig, setConfirmConfig] = useState<{ title: string; description: string; label: string; tone: 'primary' | 'danger'; kind: 'add' | 'edit' | 'delete' | 'bulkDelete' | 'bulkInactive' | 'password' | 'toggleActive' } | null>(null)
  const [pendingAction, setPendingAction] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ id: '', fullName: '', password: '', confirmPassword: '' })
  const [selectedUser, setSelectedUser] = useState<PreparedUser | null>(null)
  const [pendingToggleUser, setPendingToggleUser] = useState<PreparedUser | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [addForm, setAddForm] = useState<UserFormState>({ fullName: '', email: '', password: '', confirmPassword: '', roleId: '', status: 'active', profileImageUrl: '' })
  const [editForm, setEditForm] = useState<UserFormState>({ id: '', fullName: '', email: '', password: '', roleId: '', status: 'active', profileImageUrl: '' })
  const [addImageFile, setAddImageFile] = useState<File | null>(null)
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [addImagePreview, setAddImagePreview] = useState('')
  const [editImagePreview, setEditImagePreview] = useState('')
  const [toasts, setToasts] = useState<ApexToast[]>([])
  const [columns, setColumns] = useState<Record<ColumnKey, boolean>>({
    name: true,
    role: true,
    status: true,
    lastActive: true,
    actions: true,
  })

  const roleOptions = useMemo(() => roles.map((role) => ({ value: role.id, label: role.name })), [roles])
  const statusOptions = useMemo(() => [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ] as const, [])

  const prepared = useMemo<PreparedUser[]>(
    () =>
      users.map((user) => ({
        ...user,
        username: user.email.split('@')[0] ?? user.email,
        statusLabel: user.isActive ? 'Active' : 'Inactive',
        relativeLastActive: toRelative(user.updatedAt),
      })),
    [users],
  )

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return prepared.filter((user) => {
      const statusMatch =
        status === 'all' ? true : status === 'active' ? user.isActive : status === 'inactive' ? !user.isActive : false

      const searchMatch =
        keyword.length === 0
          ? true
          : [user.fullName, user.email, user.roleName, user.username].join(' ').toLowerCase().includes(keyword)

      return statusMatch && searchMatch
    })
  }, [prepared, search, status])

  const sorted = useMemo(() => {
    const items = [...filtered]

    items.sort((a, b) => {
      const direction = sortDir === 'asc' ? 1 : -1
      if (sortKey === 'name') return a.fullName.localeCompare(b.fullName) * direction
      if (sortKey === 'role') return a.roleName.localeCompare(b.roleName) * direction
      if (sortKey === 'status') {
        const aValue = a.isActive ? 1 : 0
        const bValue = b.isActive ? 1 : 0
        return (aValue - bValue) * direction
      }

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
    const activeCount = prepared.filter((user) => user.isActive).length
    const inactiveCount = prepared.filter((user) => !user.isActive).length
    return {
      all: prepared.length,
      active: activeCount,
      inactive: inactiveCount,
      suspended: 0,
    }
  }, [prepared])

  function addToast(message: string, tone: ApexToast['tone'] = 'default') {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setToasts((prev) => [...prev, { id, message, tone }])
    setTimeout(() => setToasts((prev) => prev.filter((item) => item.id !== id)), 3500)
  }

  function toggleColumn(key: string) {
    const typedKey = key as ColumnKey
    setColumns((prev) => ({ ...prev, [typedKey]: !prev[typedKey] }))
  }

  function exportCsv() {
    const headers: string[] = []
    if (columns.name) {
      headers.push('Name')
      headers.push('Email')
    }
    if (columns.role) headers.push('Role')
    if (columns.status) headers.push('Status')
    if (columns.lastActive) headers.push('Last Active')

    const rows = sorted.map((item) => {
      const row: string[] = []
      if (columns.name) {
        row.push(item.fullName)
        row.push(item.email)
      }
      if (columns.role) row.push(item.roleName)
      if (columns.status) row.push(item.statusLabel)
      if (columns.lastActive) row.push(item.relativeLastActive)
      return row
    })

    downloadCsv('users-export.csv', [headers, ...rows])
    addToast('Users CSV exported', 'success')
  }

  function openViewModal(user: PreparedUser) {
    setSelectedUser(user)
    setViewOpen(true)
  }

  function openPasswordModal(user: PreparedUser) {
    setPasswordForm({ id: user.id, fullName: user.fullName, password: '', confirmPassword: '' })
    setPasswordModalOpen(true)
  }

  function openEditModal(user: PreparedUser) {
    setSelectedUser(user)
    setEditForm({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      password: '',
      roleId: user.roleId,
      status: user.isActive ? 'active' : 'inactive',
      profileImageUrl: user.profileImageUrl ?? '',
    })
    setEditImageFile(null)
    setEditImagePreview(user.profileImageUrl ?? '')
    setEditOpen(true)
  }

  function promptDelete(user: PreparedUser) {
    setSelectedUser(user)
    setPendingDeleteId(user.id)
    setConfirmConfig({
      title: 'Delete User',
      description: `Delete ${user.fullName}? This action cannot be undone.`,
      label: 'Delete',
      tone: 'danger',
      kind: 'delete',
    })
    setConfirmOpen(true)
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

  const currentPageIds = paged.map((user) => user.id)
  const allCurrentPageSelected = currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.includes(id))

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

  function toFormData(form: UserFormState): FormData {
    const formData = new FormData()
    if (form.id) formData.set('id', form.id)
    formData.set('fullName', form.fullName)
    formData.set('email', form.email)
    formData.set('password', form.password)
    formData.set('roleId', form.roleId)
    formData.set('status', form.status)

    if (form.profileImageUrl) {
      formData.set('existingProfileImageUrl', form.profileImageUrl)
    }

    if (!form.id && addImageFile) {
      formData.set('profileImage', addImageFile)
    }

    if (form.id && editImageFile) {
      formData.set('profileImage', editImageFile)
    }

    return formData
  }

  async function executeConfirmedAction() {
    if (!confirmConfig) return
    setPendingAction(true)

    try {
      if (confirmConfig.kind === 'add') {
        await createUserAction(toFormData(addForm))
        setAddOpen(false)
        setAddForm({ fullName: '', email: '', password: '', confirmPassword: '', roleId: '', status: 'active', profileImageUrl: '' })
        setAddImageFile(null)
        setAddImagePreview('')
        addToast('User created successfully', 'success')
      }

      if (confirmConfig.kind === 'edit') {
        await updateUserAction(toFormData(editForm))
        setEditOpen(false)
        setEditImageFile(null)
        setEditImagePreview('')
        addToast('User updated successfully', 'success')
      }

      if (confirmConfig.kind === 'delete' && pendingDeleteId) {
        const formData = new FormData()
        formData.set('id', pendingDeleteId)
        await deleteUserAction(formData)
        setPendingDeleteId(null)
        setSelectedUser(null)
        addToast('User deleted', 'success')
      }

      if (confirmConfig.kind === 'bulkDelete') {
        const formData = new FormData()
        formData.set('ids', selectedIds.join(','))
        await bulkDeleteUsersAction(formData)
        setSelectedIds([])
        addToast('Selected users deleted', 'success')
      }

      if (confirmConfig.kind === 'bulkInactive') {
        const formData = new FormData()
        formData.set('ids', selectedIds.join(','))
        await bulkSetInactiveAction(formData)
        setSelectedIds([])
        addToast('Selected users set to inactive', 'success')
      }

      if (confirmConfig.kind === 'password') {
        await submitPasswordChange()
      }

      if (confirmConfig.kind === 'toggleActive' && pendingToggleUser) {
        const formData = new FormData()
        formData.set('id', pendingToggleUser.id)
        await toggleUserActiveAction(formData)
        addToast(`User marked ${pendingToggleUser.isActive ? 'inactive' : 'active'}`, 'success')
        setPendingToggleUser(null)
      }

      setConfirmOpen(false)
      setConfirmConfig(null)
    } finally {
      setPendingAction(false)
    }
  }

  async function submitPasswordChange() {
    if (!passwordForm.id || !passwordForm.password) return
    const formData = new FormData()
    formData.set('id', passwordForm.id)
    formData.set('password', passwordForm.password)
    await changeUserPasswordAction(formData)
    setPasswordModalOpen(false)
    setPasswordForm({ id: '', fullName: '', password: '', confirmPassword: '' })
    addToast('Password updated successfully', 'success')
  }

  return (
    <div className="space-y-4">
      {pendingAction && (confirmConfig?.kind === 'add' || confirmConfig?.kind === 'edit') ? <ApexBlockingSpinner label="Saving user..." /> : null}
      <ApexToastStack toasts={toasts} onRemove={(id) => setToasts((prev) => prev.filter((toast) => toast.id !== id))} />

      <ApexBreadcrumbs items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Users' }]} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[42px] leading-none font-bold tracking-tight apx-text">Users</h1>
          <p className="mt-1 text-sm apx-muted">Manage team members, roles, and permissions.</p>
        </div>

        <button
          onClick={() => {
            setAddForm({ fullName: '', email: '', password: '', confirmPassword: '', roleId: '', status: 'active', profileImageUrl: '' })
            setAddImageFile(null)
            setAddImagePreview('')
            setAddOpen(true)
          }}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-0.5"
          style={{ backgroundColor: 'var(--apx-primary)' }}
        >
          <Plus className="h-4 w-4" />
          Add User
        </button>
      </div>

      <ApexStatusTabs
        tabs={[
          { key: 'all', label: 'All', count: counts.all },
          { key: 'active', label: 'Active', count: counts.active },
          { key: 'inactive', label: 'Inactive', count: counts.inactive },
          { key: 'suspended', label: 'Suspended', count: counts.suspended },
        ]}
        active={status}
        onChange={(key) => {
          setStatus(key as 'all' | 'active' | 'inactive' | 'suspended')
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
            placeholder="Search users..."
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
                    title: 'Set Users Inactive',
                    description: `Set ${selectedIds.length} selected user(s) to inactive?`,
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
                    title: 'Delete Selected Users',
                    description: `Delete ${selectedIds.length} selected user(s)? This action cannot be undone.`,
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
              { key: 'name', label: 'Name', visible: columns.name },
              { key: 'role', label: 'Role', visible: columns.role },
              { key: 'status', label: 'Status', visible: columns.status },
              { key: 'lastActive', label: 'Last Active', visible: columns.lastActive },
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
                <ApexCheckbox checked={allCurrentPageSelected} onChange={toggleSelectAllCurrentPage} ariaLabel="Select all current page users" />
              </th>
              {columns.name ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button onClick={() => onSort('name')} className="inline-flex items-center gap-1.5" type="button">
                    Name
                    {renderSortIcon('name')}
                  </button>
                </th>
              ) : null}
              {columns.role ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button onClick={() => onSort('role')} className="inline-flex items-center gap-1.5" type="button">
                    Role
                    {renderSortIcon('role')}
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
              {columns.lastActive ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button onClick={() => onSort('lastActive')} className="inline-flex items-center gap-1.5" type="button">
                    Last Active
                    {renderSortIcon('lastActive')}
                  </button>
                </th>
              ) : null}
              {columns.actions ? <th className="px-4 py-3 font-semibold apx-text text-right">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {paged.map((user) => {
              const initials = user.fullName
                .split(' ')
                .map((part) => part[0] ?? '')
                .join('')
                .slice(0, 2)
                .toUpperCase()

              return (
                <tr
                  key={user.id}
                  onClick={() => openViewModal(user)}
                  className={[
                    'apx-table-row cursor-pointer border-b last:border-b-0',
                    selectedIds.includes(user.id) ? 'apx-table-row-selected' : '',
                  ].join(' ').trim()}
                  style={{ borderColor: 'var(--apx-border)' }}
                >
                  <td className="px-2 py-3">
                    <div onClick={(event) => event.stopPropagation()}>
                      <ApexCheckbox
                        checked={selectedIds.includes(user.id)}
                        onChange={() => toggleSelectOne(user.id)}
                        ariaLabel={`Select ${user.fullName}`}
                      />
                    </div>
                  </td>

                  {columns.name ? (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 overflow-hidden rounded-full border" style={{ borderColor: 'var(--apx-border)' }}>
                          {user.profileImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={user.profileImageUrl} alt={user.fullName} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs font-semibold" style={{ backgroundColor: 'var(--apx-primary-soft)', color: 'var(--apx-primary)' }}>
                              {initials}
                            </div>
                          )}
                        </div>
                        <button type="button" onClick={(event) => { event.stopPropagation(); openViewModal(user) }} className="text-left">
                          <p className="font-semibold apx-text">{user.fullName}</p>
                          <p className="text-xs apx-muted">{user.email}</p>
                        </button>
                      </div>
                    </td>
                  ) : null}

                  {columns.role ? <td className="px-4 py-3 apx-text">{user.roleName}</td> : null}
                  {columns.status ? (
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full px-2 py-1 text-xs font-semibold" style={user.isActive ? { backgroundColor: 'rgba(22,163,74,0.15)', color: '#15803d' } : { backgroundColor: 'rgba(100,116,139,0.2)', color: '#334155' }}>
                        {user.statusLabel}
                      </span>
                    </td>
                  ) : null}
                  {columns.lastActive ? <td className="px-4 py-3 apx-muted">{user.relativeLastActive}</td> : null}
                  {columns.actions ? (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={(event) => { event.stopPropagation(); openEditModal(user) }}
                          className="apx-icon-action"
                          aria-label={`Edit ${user.fullName}`}
                        >
                          <Edit2 className="apx-muted" />
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            setPendingToggleUser(user)
                            setConfirmConfig({
                              title: user.isActive ? 'Deactivate User' : 'Activate User',
                              description: `Set ${user.fullName} as ${user.isActive ? 'inactive' : 'active'}?`,
                              label: user.isActive ? 'Deactivate' : 'Activate',
                              tone: 'primary',
                              kind: 'toggleActive',
                            })
                            setConfirmOpen(true)
                          }}
                          className="apx-icon-action"
                          style={
                            user.isActive
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
                          aria-label={`Toggle ${user.fullName} active status`}
                        >
                          <Power className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(event) => { event.stopPropagation(); openPasswordModal(user) }}
                          className="apx-icon-action"
                          aria-label={`Change ${user.fullName} password`}
                        >
                          <KeyRound className="apx-muted" />
                        </button>
                        <button type="button" onClick={(event) => { event.stopPropagation(); promptDelete(user) }} className="apx-icon-action-danger" aria-label={`Delete ${user.fullName}`}>
                          <Trash2 />
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
        title="Add User"
        subtitle="Create a new admin account."
        onClose={() => setAddOpen(false)}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (!addForm.password || !addForm.confirmPassword) {
              addToast('Please fill in both password fields', 'danger')
              return
            }
            if (addForm.password !== addForm.confirmPassword) {
              addToast('Passwords do not match', 'danger')
              return
            }
            setConfirmConfig({
              title: 'Confirm Add User',
              description: `Add ${addForm.fullName || 'this user'}?`,
              label: 'Add User',
              tone: 'primary',
              kind: 'add',
            })
            setConfirmOpen(true)
          }}
          className="grid gap-3 md:grid-cols-2"
        >
          <div className="md:col-span-2">
            <ApexImageDropzone
              label="Profile Image"
              previewUrl={addImagePreview}
              onFileSelect={(file) => {
                setAddImageFile(file)
                setAddImagePreview(URL.createObjectURL(file))
              }}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Full Name</label>
            <ApexInput value={addForm.fullName} onChange={(event) => setAddForm((prev) => ({ ...prev, fullName: event.target.value }))} name="fullName" placeholder="Full name" required />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Email</label>
            <ApexInput value={addForm.email} onChange={(event) => setAddForm((prev) => ({ ...prev, email: event.target.value }))} name="email" placeholder="Email" type="email" required />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Password</label>
            <ApexInput value={addForm.password} onChange={(event) => setAddForm((prev) => ({ ...prev, password: event.target.value }))} name="password" placeholder="Password" type="password" required />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Confirm Password</label>
            <ApexInput value={addForm.confirmPassword ?? ''} onChange={(event) => setAddForm((prev) => ({ ...prev, confirmPassword: event.target.value }))} placeholder="Confirm password" type="password" required />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Role</label>
            <ApexDropdown value={addForm.roleId} onChange={(value) => setAddForm((prev) => ({ ...prev, roleId: value }))} options={roleOptions} placeholder="Select role" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Status</label>
            <ApexDropdown value={addForm.status} onChange={(value) => setAddForm((prev) => ({ ...prev, status: value as 'active' | 'inactive' }))} options={[...statusOptions]} placeholder="Select status" />
          </div>

          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <ApexButton type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</ApexButton>
            <ApexButton type="submit">Save User</ApexButton>
          </div>
        </form>
      </ApexModal>

      <ApexModal
        size="sm"
        open={editOpen}
        title="Edit User"
        subtitle="Update user details and access."
        onClose={() => setEditOpen(false)}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault()
            setConfirmConfig({
              title: 'Confirm Edit User',
              description: `Save changes for ${editForm.fullName || 'this user'}?`,
              label: 'Save Changes',
              tone: 'primary',
              kind: 'edit',
            })
            setConfirmOpen(true)
          }}
          className="grid gap-3 md:grid-cols-2"
        >
          <div className="md:col-span-2">
            <ApexImageDropzone
              label="Profile Image"
              previewUrl={editImagePreview || editForm.profileImageUrl || ''}
              onFileSelect={(file) => {
                setEditImageFile(file)
                setEditImagePreview(URL.createObjectURL(file))
              }}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Full Name</label>
            <ApexInput value={editForm.fullName} onChange={(event) => setEditForm((prev) => ({ ...prev, fullName: event.target.value }))} placeholder="Full name" required />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Email</label>
            <ApexInput value={editForm.email} onChange={(event) => setEditForm((prev) => ({ ...prev, email: event.target.value }))} placeholder="Email" type="email" required />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Role</label>
            <ApexDropdown value={editForm.roleId} onChange={(value) => setEditForm((prev) => ({ ...prev, roleId: value }))} options={roleOptions} placeholder="Select role" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Status</label>
            <ApexDropdown value={editForm.status} onChange={(value) => setEditForm((prev) => ({ ...prev, status: value as 'active' | 'inactive' }))} options={[...statusOptions]} placeholder="Select status" />
          </div>

          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <ApexButton type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</ApexButton>
            <ApexButton type="submit">Save Changes</ApexButton>
          </div>
        </form>
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

      <ApexModal
        size="sm"
        open={passwordModalOpen}
        title="Change Password"
        subtitle={`Set a new password for ${passwordForm.fullName || 'this user'}.`}
        onClose={() => setPasswordModalOpen(false)}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (!passwordForm.password || !passwordForm.confirmPassword) {
              addToast('Please fill in both password fields', 'danger')
              return
            }
            if (passwordForm.password !== passwordForm.confirmPassword) {
              addToast('Passwords do not match', 'danger')
              return
            }
            setConfirmConfig({
              title: 'Confirm Password Change',
              description: `Change password for ${passwordForm.fullName}?`,
              label: 'Change Password',
              tone: 'primary',
              kind: 'password',
            })
            setConfirmOpen(true)
          }}
          className="space-y-3"
        >
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">New Password</label>
            <ApexInput value={passwordForm.password} onChange={(event) => setPasswordForm((prev) => ({ ...prev, password: event.target.value }))} type="password" placeholder="New password" required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Confirm Password</label>
            <ApexInput value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))} type="password" placeholder="Confirm password" required />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <ApexButton type="button" variant="outline" onClick={() => setPasswordModalOpen(false)}>Cancel</ApexButton>
            <ApexButton type="submit" disabled={pendingAction}>Save Password</ApexButton>
          </div>
        </form>
      </ApexModal>

      <ApexModal
        size="sm"
        open={viewOpen && !!selectedUser}
        title="User Profile"
        subtitle="Read-only user information."
        onClose={() => {
          setViewOpen(false)
          setSelectedUser(null)
        }}
      >
        {selectedUser ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 overflow-hidden rounded-full border" style={{ borderColor: 'var(--apx-border)' }}>
                {selectedUser.profileImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedUser.profileImageUrl} alt={selectedUser.fullName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-semibold" style={{ backgroundColor: 'var(--apx-primary-soft)', color: 'var(--apx-primary)' }}>
                    {selectedUser.fullName
                      .split(' ')
                      .map((part) => part[0] ?? '')
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="text-base font-semibold apx-text">{selectedUser.fullName}</p>
                <p className="text-xs apx-muted">{selectedUser.email}</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wider apx-muted">Full Name</p>
                <p className="mt-1 text-sm font-medium apx-text">{selectedUser.fullName}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider apx-muted">Email</p>
                <p className="mt-1 text-sm font-medium apx-text">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider apx-muted">Role</p>
                <p className="mt-1 text-sm font-medium apx-text">{selectedUser.roleName}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider apx-muted">Status</p>
                <p className="mt-1 text-sm font-medium apx-text">{selectedUser.statusLabel}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider apx-muted">Last Active</p>
                <p className="mt-1 text-sm font-medium apx-text">{selectedUser.relativeLastActive}</p>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end pt-2">
              <ApexButton type="button" variant="outline" onClick={() => {
                setViewOpen(false)
                setSelectedUser(null)
              }}>
                Close
              </ApexButton>
            </div>
          </div>
        ) : null}
      </ApexModal>
    </div>
  )
}
