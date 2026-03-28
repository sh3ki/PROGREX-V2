'use client'

import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, Edit2, Plus, Power, Trash2 } from 'lucide-react'
import { ApexButton, ApexInput } from '@/components/admin/apex/AdminPrimitives'
import {
  ApexBlockingSpinner,
  ApexBreadcrumbs,
  ApexCheckbox,
  ApexColumnsToggle,
  ApexConfirmationModal,
  ApexExportButton,
  ApexImageDropzone,
  ApexModal,
  ApexPagination,
  ApexSearchField,
  ApexStatusTabs,
  ApexToast,
  ApexToastStack,
} from '@/components/admin/apex/ApexDataUi'

type ClientRow = {
  id: string
  fullName: string
  profileImage: string | null
  otherMemberNames: string[]
  role: string | null
  email: string | null
  fbLink: string | null
  phone: string | null
  clientDate: string | null
  isActive: boolean
  createdAt: string | null
}

type ColumnKey = 'client' | 'company' | 'email' | 'fbLink' | 'phone' | 'status' | 'actions'
type SortKey = Exclude<ColumnKey, 'actions'>

type ClientFormState = {
  id?: string
  fullName: string
  otherMemberNames: string
  role: string
  email: string
  fbLink: string
  phone: string
  existingProfileImage: string
}

function defaultForm(): ClientFormState {
  return {
    fullName: '',
    otherMemberNames: '',
    role: '',
    email: '',
    fbLink: '',
    phone: '',
    existingProfileImage: '',
  }
}

function formFromClient(client: ClientRow): ClientFormState {
  return {
    id: client.id,
    fullName: client.fullName,
    otherMemberNames: client.otherMemberNames.join(', '),
    role: client.role ?? '',
    email: client.email ?? '',
    fbLink: client.fbLink ?? '',
    phone: client.phone ?? '',
    existingProfileImage: client.profileImage ?? '',
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

export default function AdminClientsTemplateView({
  clients,
  createClientAction,
  updateClientAction,
  toggleClientAction,
  deleteClientAction,
  bulkToggleClientsAction,
  bulkDeleteClientsAction,
}: {
  clients: ClientRow[]
  createClientAction: (formData: FormData) => Promise<void>
  updateClientAction: (formData: FormData) => Promise<void>
  toggleClientAction: (formData: FormData) => Promise<void>
  deleteClientAction: (formData: FormData) => Promise<void>
  bulkToggleClientsAction: (formData: FormData) => Promise<void>
  bulkDeleteClientsAction: (formData: FormData) => Promise<void>
}) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [sortKey, setSortKey] = useState<SortKey>('client')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [columns, setColumns] = useState<Record<ColumnKey, boolean>>({
    client: true,
    company: true,
    email: true,
    fbLink: true,
    phone: true,
    status: true,
    actions: true,
  })

  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [toasts, setToasts] = useState<ApexToast[]>([])
  const [selectedClient, setSelectedClient] = useState<ClientRow | null>(null)
  const [addForm, setAddForm] = useState<ClientFormState>(defaultForm())
  const [editForm, setEditForm] = useState<ClientFormState>(defaultForm())
  const [addImageFile, setAddImageFile] = useState<File | null>(null)
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string
    description: string
    confirmLabel: string
    tone: 'primary' | 'danger'
    kind: 'add' | 'edit' | 'delete' | 'toggle' | 'bulkSetInactive' | 'bulkDelete'
  } | null>(null)

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return clients.filter((client) => {
      const statusMatch = status === 'all' ? true : status === 'active' ? client.isActive : !client.isActive
      const searchMatch = keyword.length === 0
        ? true
        : [
            client.fullName,
            client.otherMemberNames.join(' '),
            client.role ?? '',
            client.email ?? '',
            client.fbLink ?? '',
            client.phone ?? '',
          ]
            .join(' ')
            .toLowerCase()
            .includes(keyword)
      return statusMatch && searchMatch
    })
  }, [clients, search, status])

  const sorted = useMemo(() => {
    const list = [...filtered]
    list.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      if (sortKey === 'client') return a.fullName.localeCompare(b.fullName) * dir
      if (sortKey === 'company') return (a.role ?? '').localeCompare(b.role ?? '') * dir
      if (sortKey === 'email') return (a.email ?? '').localeCompare(b.email ?? '') * dir
      if (sortKey === 'fbLink') return (a.fbLink ?? '').localeCompare(b.fbLink ?? '') * dir
      if (sortKey === 'phone') return (a.phone ?? '').localeCompare(b.phone ?? '') * dir
      return Number(a.isActive) === Number(b.isActive) ? 0 : (a.isActive ? 1 : -1) * dir
    })
    return list
  }, [filtered, sortDir, sortKey])

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage))
  const safePage = Math.min(page, totalPages)
  const paged = sorted.slice((safePage - 1) * perPage, safePage * perPage)

  const counts = useMemo(() => {
    const active = clients.filter((client) => client.isActive).length
    return { all: clients.length, active, inactive: clients.length - active }
  }, [clients])

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

  function toFormData(form: ClientFormState, imageFile: File | null) {
    const formData = new FormData()
    if (form.id) formData.set('id', form.id)
    formData.set('fullName', form.fullName)
    formData.set('otherMemberNames', form.otherMemberNames)
    formData.set('role', form.role)
    formData.set('email', form.email)
    formData.set('fbLink', form.fbLink)
    formData.set('phone', form.phone)
    formData.set('clientDate', '')
    formData.set('existingProfileImage', form.existingProfileImage)
    if (imageFile) formData.set('profileImage', imageFile)
    return formData
  }

  function exportCsv() {
    const rows = sorted.map((client) => [
      client.fullName,
      client.otherMemberNames.join(', '),
      client.role ?? '',
      client.email ?? '',
      client.fbLink ?? '',
      client.phone ?? '',
      client.isActive ? 'Active' : 'Inactive',
    ])
    downloadCsv('clients-export.csv', [['Full Name', 'Other Members', 'Company/Org', 'Email', 'Facebook', 'Phone', 'Status'], ...rows])
    addToast('Clients CSV exported', 'success')
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
        await createClientAction(toFormData(addForm, addImageFile))
        setAddOpen(false)
        setAddImageFile(null)
        setAddForm(defaultForm())
        addToast('Client added', 'success')
      }

      if (confirmConfig.kind === 'edit') {
        await updateClientAction(toFormData(editForm, editImageFile))
        setEditOpen(false)
        setEditImageFile(null)
        addToast('Client updated', 'success')
      }

      if (confirmConfig.kind === 'toggle' && selectedClient) {
        const formData = new FormData()
        formData.set('id', selectedClient.id)
        await toggleClientAction(formData)
        addToast(selectedClient.isActive ? 'Client set inactive' : 'Client set active', 'success')
      }

      if (confirmConfig.kind === 'delete' && selectedClient) {
        const formData = new FormData()
        formData.set('id', selectedClient.id)
        await deleteClientAction(formData)
        setViewOpen(false)
        addToast('Client deleted', 'success')
      }

      if (confirmConfig.kind === 'bulkSetInactive') {
        const formData = new FormData()
        formData.set('ids', selectedIds.join(','))
        formData.set('mode', 'inactive')
        await bulkToggleClientsAction(formData)
        setSelectedIds([])
        addToast('Selected clients set inactive', 'success')
      }

      if (confirmConfig.kind === 'bulkDelete') {
        const formData = new FormData()
        formData.set('ids', selectedIds.join(','))
        await bulkDeleteClientsAction(formData)
        setSelectedIds([])
        addToast('Selected clients deleted', 'success')
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

      <ApexBreadcrumbs items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Clients' }]} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[42px] leading-none font-bold tracking-tight apx-text">Clients</h1>
          <p className="mt-1 text-sm apx-muted">Manage client profiles and statuses.</p>
        </div>

        <button
          type="button"
          onClick={() => {
            setAddForm(defaultForm())
            setAddImageFile(null)
            setAddOpen(true)
          }}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-0.5"
          style={{ backgroundColor: 'var(--apx-primary)' }}
        >
          <Plus className="h-4 w-4" />
          Add Client
        </button>
      </div>

      <ApexStatusTabs
        tabs={[
          { key: 'all', label: 'All', count: counts.all },
          { key: 'active', label: 'Active', count: counts.active, indicatorColor: '#16a34a' },
          { key: 'inactive', label: 'Inactive', count: counts.inactive, indicatorColor: '#64748b' },
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
            placeholder="Search clients..."
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
                    title: 'Set Selected Clients Inactive',
                    description: `Set ${selectedIds.length} selected client(s) inactive?`,
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
                    title: 'Delete Selected Clients',
                    description: `Delete ${selectedIds.length} selected client(s)? This cannot be undone.`,
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
              { key: 'client', label: 'Client', visible: columns.client },
              { key: 'company', label: 'Company/Org', visible: columns.company },
              { key: 'email', label: 'Email', visible: columns.email },
              { key: 'fbLink', label: 'FB Link', visible: columns.fbLink },
              { key: 'phone', label: 'Phone', visible: columns.phone },
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
                <ApexCheckbox checked={allCurrentPageSelected} onChange={toggleSelectAllCurrentPage} ariaLabel="Select all current page clients" />
              </th>
              {columns.client ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button type="button" className="inline-flex items-center gap-1.5" onClick={() => onSort('client')}>
                    Client
                    {renderSortIcon('client')}
                  </button>
                </th>
              ) : null}
              {columns.company ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button type="button" className="inline-flex items-center gap-1.5" onClick={() => onSort('company')}>
                    Company/Org
                    {renderSortIcon('company')}
                  </button>
                </th>
              ) : null}
              {columns.email ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button type="button" className="inline-flex items-center gap-1.5" onClick={() => onSort('email')}>
                    Email
                    {renderSortIcon('email')}
                  </button>
                </th>
              ) : null}
              {columns.fbLink ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button type="button" className="inline-flex items-center gap-1.5" onClick={() => onSort('fbLink')}>
                    FB Link
                    {renderSortIcon('fbLink')}
                  </button>
                </th>
              ) : null}
              {columns.phone ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button type="button" className="inline-flex items-center gap-1.5" onClick={() => onSort('phone')}>
                    Phone
                    {renderSortIcon('phone')}
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
            {paged.map((client) => (
              <tr
                key={client.id}
                className={[
                  'apx-table-row cursor-pointer border-b last:border-b-0',
                  selectedIds.includes(client.id) ? 'apx-table-row-selected' : '',
                ].join(' ').trim()}
                style={{ borderColor: 'var(--apx-border)' }}
                onClick={() => {
                  setSelectedClient(client)
                  setViewOpen(true)
                }}
              >
                <td className="px-2 py-3" onClick={(event) => event.stopPropagation()}>
                  <ApexCheckbox checked={selectedIds.includes(client.id)} onChange={() => toggleSelectOne(client.id)} ariaLabel={`Select ${client.fullName}`} />
                </td>
                {columns.client ? (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-full border" style={{ borderColor: 'var(--apx-border)' }}>
                        {client.profileImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={client.profileImage} alt={client.fullName} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] apx-muted">N/A</div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold apx-text">{client.fullName}</p>
                        <div className="space-y-0.5">
                          {client.otherMemberNames.length ? client.otherMemberNames.map((member) => (
                            <p key={`${client.id}-${member}`} className="text-xs apx-muted">{member}</p>
                          )) : <p className="text-xs apx-muted">No other members</p>}
                        </div>
                      </div>
                    </div>
                  </td>
                ) : null}
                {columns.company ? <td className="px-4 py-3 apx-text">{client.role || '-'}</td> : null}
                {columns.email ? <td className="px-4 py-3 apx-text">{client.email || '-'}</td> : null}
                {columns.fbLink ? <td className="px-4 py-3 apx-text break-all">{client.fbLink || '-'}</td> : null}
                {columns.phone ? <td className="px-4 py-3 apx-text">{client.phone || '-'}</td> : null}
                {columns.status ? (
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex rounded-full px-2 py-1 text-xs font-semibold"
                      style={
                        client.isActive
                          ? { backgroundColor: 'rgba(22,163,74,0.15)', color: '#15803d' }
                          : { backgroundColor: 'rgba(100,116,139,0.2)', color: '#334155' }
                      }
                    >
                      {client.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                ) : null}
                {columns.actions ? (
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2" onClick={(event) => event.stopPropagation()}>
                      <button
                        type="button"
                        className="apx-icon-action"
                        onClick={() => {
                          setEditForm(formFromClient(client))
                          setEditImageFile(null)
                          setSelectedClient(client)
                          setEditOpen(true)
                        }}
                        aria-label="Edit client"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="apx-icon-action"
                        onClick={() => {
                          setSelectedClient(client)
                          setConfirmConfig({
                            title: client.isActive ? 'Set Client Inactive' : 'Set Client Active',
                            description: `Update status for ${client.fullName}?`,
                            confirmLabel: client.isActive ? 'Set Inactive' : 'Set Active',
                            tone: 'primary',
                            kind: 'toggle',
                          })
                          setConfirmOpen(true)
                        }}
                        aria-label="Toggle client status"
                      >
                        <Power className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="apx-icon-action-danger"
                        onClick={() => {
                          setSelectedClient(client)
                          setConfirmConfig({
                            title: 'Delete Client',
                            description: `Delete ${client.fullName}? This cannot be undone.`,
                            confirmLabel: 'Delete',
                            tone: 'danger',
                            kind: 'delete',
                          })
                          setConfirmOpen(true)
                        }}
                        aria-label="Delete client"
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

      <ApexModal open={addOpen} title="Add Client" subtitle="Create a client profile" onClose={() => setAddOpen(false)}>
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault()
            setConfirmConfig({
              title: 'Add Client',
              description: 'Create this client profile?',
              confirmLabel: 'Save',
              tone: 'primary',
              kind: 'add',
            })
            setConfirmOpen(true)
          }}
        >
          <ApexImageDropzone previewUrl={addImageFile ? URL.createObjectURL(addImageFile) : ''} onFileSelect={setAddImageFile} label="Profile Image" />
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium apx-muted">Full Name</label>
              <ApexInput value={addForm.fullName} onChange={(event) => setAddForm((prev) => ({ ...prev, fullName: event.target.value }))} required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium apx-muted">Other Member Name(s) (comma separated)</label>
              <ApexInput value={addForm.otherMemberNames} onChange={(event) => setAddForm((prev) => ({ ...prev, otherMemberNames: event.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium apx-muted">Company/Organization</label>
              <ApexInput value={addForm.role} onChange={(event) => setAddForm((prev) => ({ ...prev, role: event.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium apx-muted">Email</label>
              <ApexInput type="email" value={addForm.email} onChange={(event) => setAddForm((prev) => ({ ...prev, email: event.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium apx-muted">Facebook Link (Optional)</label>
              <ApexInput value={addForm.fbLink} onChange={(event) => setAddForm((prev) => ({ ...prev, fbLink: event.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium apx-muted">Phone (Optional)</label>
              <ApexInput value={addForm.phone} onChange={(event) => setAddForm((prev) => ({ ...prev, phone: event.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <ApexButton type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</ApexButton>
            <ApexButton type="submit">Save Client</ApexButton>
          </div>
        </form>
      </ApexModal>

      <ApexModal open={editOpen} title="Edit Client" subtitle="Update client profile" onClose={() => setEditOpen(false)}>
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault()
            setConfirmConfig({
              title: 'Update Client',
              description: 'Save changes to this client?',
              confirmLabel: 'Update',
              tone: 'primary',
              kind: 'edit',
            })
            setConfirmOpen(true)
          }}
        >
          <ApexImageDropzone
            previewUrl={editImageFile ? URL.createObjectURL(editImageFile) : editForm.existingProfileImage}
            onFileSelect={setEditImageFile}
            label="Profile Image"
          />
          {editForm.existingProfileImage ? <p className="-mt-1 text-xs apx-muted">Current image is kept if you do not upload a new file.</p> : null}
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium apx-muted">Full Name</label>
              <ApexInput value={editForm.fullName} onChange={(event) => setEditForm((prev) => ({ ...prev, fullName: event.target.value }))} required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium apx-muted">Other Member Name(s) (comma separated)</label>
              <ApexInput value={editForm.otherMemberNames} onChange={(event) => setEditForm((prev) => ({ ...prev, otherMemberNames: event.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium apx-muted">Company/Organization</label>
              <ApexInput value={editForm.role} onChange={(event) => setEditForm((prev) => ({ ...prev, role: event.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium apx-muted">Email</label>
              <ApexInput type="email" value={editForm.email} onChange={(event) => setEditForm((prev) => ({ ...prev, email: event.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium apx-muted">Facebook Link (Optional)</label>
              <ApexInput value={editForm.fbLink} onChange={(event) => setEditForm((prev) => ({ ...prev, fbLink: event.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium apx-muted">Phone (Optional)</label>
              <ApexInput value={editForm.phone} onChange={(event) => setEditForm((prev) => ({ ...prev, phone: event.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <ApexButton type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</ApexButton>
            <ApexButton type="submit">Save Changes</ApexButton>
          </div>
        </form>
      </ApexModal>

      <ApexModal
        open={viewOpen}
        title={selectedClient?.fullName || 'Client Details'}
        subtitle="View profile details"
        onClose={() => setViewOpen(false)}
      >
        {selectedClient ? (
          <div className="space-y-3 text-sm">
            <div className="grid gap-2 md:grid-cols-2">
              <p className="apx-text"><span className="font-semibold">Company/Organization:</span> {selectedClient.role || '-'}</p>
              <p className="apx-text"><span className="font-semibold">Email:</span> {selectedClient.email || '-'}</p>
              <p className="apx-text"><span className="font-semibold">Facebook:</span> {selectedClient.fbLink || '-'}</p>
              <p className="apx-text"><span className="font-semibold">Phone:</span> {selectedClient.phone || '-'}</p>
              <p className="apx-text"><span className="font-semibold">Created:</span> {selectedClient.createdAt ? new Date(selectedClient.createdAt).toLocaleDateString() : '-'}</p>
              <p className="apx-text"><span className="font-semibold">Status:</span> {selectedClient.isActive ? 'Active' : 'Inactive'}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide apx-muted">Other Members</p>
              <p className="apx-text">{selectedClient.otherMemberNames.length ? selectedClient.otherMemberNames.join(', ') : 'none'}</p>
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
