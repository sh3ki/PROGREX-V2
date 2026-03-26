'use client'

import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Edit2, GripVertical, Plus, Power, Trash2 } from 'lucide-react'
import { ApexButton, ApexInput, ApexTextarea } from '@/components/admin/apex/AdminPrimitives'
import {
	ApexBlockingSpinner,
	ApexBreadcrumbs,
	ApexCheckbox,
	ApexColumnsToggle,
	ApexConfirmationModal,
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

type TeamRow = {
	id: string
	name: string
	role: string
	bio: string
	avatar: string
	email: string
	portfolio: string
	sortOrder: number
	isActive: boolean
	updatedAt: string | null
}

type ColumnKey = 'member' | 'role' | 'email' | 'portfolio' | 'order' | 'status' | 'actions'
type StatusFilter = 'all' | 'active' | 'inactive'

type TeamFormState = {
	id?: string
	name: string
	role: string
	bio: string
	email: string
	portfolio: string
	status: 'active' | 'inactive'
	sortOrder: number
	avatar: string
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

function moveItem<T>(items: T[], from: number, to: number) {
	if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return items
	const clone = [...items]
	const [picked] = clone.splice(from, 1)
	clone.splice(to, 0, picked)
	return clone
}

function defaultForm(nextOrder = 1): TeamFormState {
	return {
		name: '',
		role: '',
		bio: '',
		email: '',
		portfolio: '',
		status: 'active',
		sortOrder: nextOrder,
		avatar: '',
	}
}

function formFromRow(row: TeamRow): TeamFormState {
	return {
		id: row.id,
		name: row.name,
		role: row.role,
		bio: row.bio,
		email: row.email,
		portfolio: row.portfolio,
		status: row.isActive ? 'active' : 'inactive',
		sortOrder: Math.max(1, row.sortOrder || 1),
		avatar: row.avatar,
	}
}

export default function AdminTeamsTemplateView({
	team,
	createTeamAction,
	updateTeamAction,
	deleteTeamAction,
	bulkDeleteTeamAction,
	bulkSetInactiveTeamAction,
	toggleTeamActiveAction,
	saveTeamReorderAction,
}: {
	team: TeamRow[]
	createTeamAction: (formData: FormData) => Promise<void>
	updateTeamAction: (formData: FormData) => Promise<void>
	deleteTeamAction: (formData: FormData) => Promise<void>
	bulkDeleteTeamAction: (formData: FormData) => Promise<void>
	bulkSetInactiveTeamAction: (formData: FormData) => Promise<void>
	toggleTeamActiveAction: (formData: FormData) => Promise<void>
	saveTeamReorderAction: (formData: FormData) => Promise<void>
}) {
	const [search, setSearch] = useState('')
	const [status, setStatus] = useState<StatusFilter>('all')
	const [page, setPage] = useState(1)
	const [perPage, setPerPage] = useState(10)
	const [selectedIds, setSelectedIds] = useState<string[]>([])
	const [addOpen, setAddOpen] = useState(false)
	const [editOpen, setEditOpen] = useState(false)
	const [viewOpen, setViewOpen] = useState(false)
	const [confirmOpen, setConfirmOpen] = useState(false)
	const [pendingAction, setPendingAction] = useState(false)
	const [toasts, setToasts] = useState<ApexToast[]>([])
	const [selectedMember, setSelectedMember] = useState<TeamRow | null>(null)
	const [pendingToggleMember, setPendingToggleMember] = useState<TeamRow | null>(null)
	const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
	const [addForm, setAddForm] = useState<TeamFormState>(defaultForm(1))
	const [editForm, setEditForm] = useState<TeamFormState>(defaultForm(1))
	const [addImageFile, setAddImageFile] = useState<File | null>(null)
	const [editImageFile, setEditImageFile] = useState<File | null>(null)
	const [addImagePreview, setAddImagePreview] = useState('')
	const [editImagePreview, setEditImagePreview] = useState('')
	const [rearrangeMode, setRearrangeMode] = useState(false)
	const [dragRowId, setDragRowId] = useState<string | null>(null)
	const [reorderIds, setReorderIds] = useState<string[]>([])
	const [columns, setColumns] = useState<Record<ColumnKey, boolean>>({ member: true, role: true, email: true, portfolio: true, order: true, status: true, actions: true })
	const [confirmConfig, setConfirmConfig] = useState<{
		title: string
		description: string
		label: string
		tone: 'primary' | 'danger'
		kind: 'add' | 'edit' | 'delete' | 'bulkDelete' | 'bulkInactive' | 'toggleActive' | 'saveReorder'
	} | null>(null)

	const nextOrder = useMemo(() => {
		const maxOrder = team.reduce((max, item) => Math.max(max, item.sortOrder || 0), 0)
		return Math.max(1, maxOrder + 1)
	}, [team])

	const filtered = useMemo(() => {
		const keyword = search.trim().toLowerCase()
		return team.filter((member) => {
			const statusMatch = status === 'all' ? true : status === 'active' ? member.isActive : !member.isActive
			const searchMatch = keyword.length === 0 ? true : [member.name, member.role, member.email, member.portfolio].join(' ').toLowerCase().includes(keyword)
			return statusMatch && searchMatch
		})
	}, [team, search, status])

	const sorted = useMemo(() => [...filtered].sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999)), [filtered])

	const reorderRows = useMemo(() => {
		if (!rearrangeMode) return []
		const map = new Map(sorted.map((item) => [item.id, item]))
		return reorderIds.map((id) => map.get(id)).filter(Boolean) as TeamRow[]
	}, [rearrangeMode, reorderIds, sorted])

	const totalPages = Math.max(1, Math.ceil(sorted.length / perPage))
	const safePage = Math.min(page, totalPages)
	const paged = rearrangeMode ? reorderRows : sorted.slice((safePage - 1) * perPage, safePage * perPage)

	const counts = useMemo(() => {
		const active = team.filter((member) => member.isActive).length
		return { all: team.length, active, inactive: team.length - active }
	}, [team])

	const currentPageIds = paged.map((member) => member.id)
	const allCurrentPageSelected = currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.includes(id))

	function addToast(message: string, tone: ApexToast['tone'] = 'default') {
		const id = Date.now() + Math.floor(Math.random() * 1000)
		setToasts((prev) => [...prev, { id, message, tone }])
		setTimeout(() => setToasts((prev) => prev.filter((item) => item.id !== id)), 4000)
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

	function exportCsv() {
		const rows = sorted.map((member) => [member.name, member.role, member.email, member.portfolio || '', String(member.sortOrder || 1), member.isActive ? 'Active' : 'Inactive'])
		downloadCsv('teams-export.csv', [['Name', 'Role', 'Email', 'Portfolio', 'Position / Order', 'Status'], ...rows])
		addToast('Team CSV exported', 'success')
	}

	function toFormData(form: TeamFormState, imageFile: File | null) {
		const formData = new FormData()
		if (form.id) formData.set('id', form.id)
		formData.set('name', form.name)
		formData.set('role', form.role)
		formData.set('bio', form.bio)
		formData.set('email', form.email)
		formData.set('portfolio', form.portfolio)
		formData.set('sortOrder', String(Math.max(1, form.sortOrder || 1)))
		formData.set('status', form.status)
		if (form.avatar) formData.set('existingAvatar', form.avatar)
		if (imageFile) formData.set('profileImage', imageFile)
		return formData
	}

	async function executeConfirmedAction() {
		if (!confirmConfig) return
		setPendingAction(true)

		try {
			if (confirmConfig.kind === 'add') {
				await createTeamAction(toFormData(addForm, addImageFile))
				setAddOpen(false)
				setAddForm(defaultForm(nextOrder))
				setAddImageFile(null)
				setAddImagePreview('')
				addToast('Team member added', 'success')
			}

			if (confirmConfig.kind === 'edit') {
				await updateTeamAction(toFormData(editForm, editImageFile))
				setEditOpen(false)
				setEditImageFile(null)
				setEditImagePreview('')
				addToast('Team member updated', 'success')
			}

			if (confirmConfig.kind === 'delete' && pendingDeleteId) {
				const formData = new FormData()
				formData.set('id', pendingDeleteId)
				await deleteTeamAction(formData)
				setPendingDeleteId(null)
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
				setPendingToggleMember(null)
				addToast('Member status updated', 'success')
			}

			if (confirmConfig.kind === 'saveReorder') {
				const formData = new FormData()
				formData.set('ids', reorderIds.join(','))
				await saveTeamReorderAction(formData)
				setRearrangeMode(false)
				setReorderIds([])
				addToast('Team order saved', 'success')
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
			{pendingAction && (confirmConfig?.kind === 'add' || confirmConfig?.kind === 'edit') ? <ApexBlockingSpinner label="Saving team member..." /> : null}
			<ApexToastStack toasts={toasts} onRemove={(id) => setToasts((prev) => prev.filter((toast) => toast.id !== id))} />

			<ApexBreadcrumbs items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Teams' }]} />

			<div className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<h1 className="text-[42px] leading-none font-bold tracking-tight apx-text">Teams</h1>
					<p className="mt-1 text-sm apx-muted">Manage team members shown on the about page.</p>
				</div>

				<button
					onClick={() => {
						setAddForm(defaultForm(nextOrder))
						setAddImageFile(null)
						setAddImagePreview('')
						setAddOpen(true)
					}}
					className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-0.5"
					style={{ backgroundColor: 'var(--apx-primary)' }}
				>
					<Plus className="h-4 w-4" />
					Add Team Member
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
					setStatus(key as StatusFilter)
					setPage(1)
					setRearrangeMode(false)
					setReorderIds([])
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
						placeholder="Search team members..."
					/>
				</div>

				<div className="flex flex-wrap items-center justify-end gap-2">
					{selectedIds.length > 0 && !rearrangeMode ? (
						<>
							<ApexButton
								type="button"
								variant="outline"
								onClick={() => {
									setConfirmConfig({
										title: 'Set Members Inactive',
										description: `Set ${selectedIds.length} selected member(s) to inactive?`,
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
								onClick={() => {
									setConfirmConfig({
										title: 'Delete Selected Members',
										description: `Delete ${selectedIds.length} selected member(s)? This cannot be undone.`,
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

					{rearrangeMode ? (
						<>
							<ApexButton type="button" variant="outline" onClick={() => { setRearrangeMode(false); setReorderIds([]) }}>Cancel</ApexButton>
							<ApexButton
								type="button"
								onClick={() => {
									setConfirmConfig({
										title: 'Save Team Order',
										description: 'Save the new team order?',
										label: 'Save Order',
										tone: 'primary',
										kind: 'saveReorder',
									})
									setConfirmOpen(true)
								}}
							>
								Save
							</ApexButton>
						</>
					) : (
						<ApexButton type="button" variant="outline" onClick={() => { setReorderIds(sorted.map((item) => item.id)); setRearrangeMode(true); setPage(1) }}>
							Rearrange
						</ApexButton>
					)}

					<ApexColumnsToggle
						columns={[
							{ key: 'member', label: 'Member', visible: columns.member },
							{ key: 'role', label: 'Role', visible: columns.role },
							{ key: 'email', label: 'Email', visible: columns.email },
							{ key: 'portfolio', label: 'Portfolio', visible: columns.portfolio },
							{ key: 'order', label: 'Order', visible: columns.order },
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
							{!rearrangeMode ? (
								<th className="w-10 px-2 py-3">
									<ApexCheckbox checked={allCurrentPageSelected} onChange={toggleSelectAllCurrentPage} ariaLabel="Select all current page members" />
								</th>
							) : (
								<th className="w-14 px-2 py-3 font-semibold apx-text">Order</th>
							)}
							{columns.member ? <th className="px-4 py-3 font-semibold apx-text">Member</th> : null}
							{columns.role ? <th className="px-4 py-3 font-semibold apx-text">Role</th> : null}
							{columns.email ? <th className="px-4 py-3 font-semibold apx-text">Email</th> : null}
							{columns.portfolio ? <th className="px-4 py-3 font-semibold apx-text">Portfolio</th> : null}
							{columns.order ? <th className="px-4 py-3 font-semibold apx-text">Order</th> : null}
							{columns.status ? <th className="px-4 py-3 font-semibold apx-text">Status</th> : null}
							{columns.actions ? <th className="px-4 py-3 text-right font-semibold apx-text">Actions</th> : null}
						</tr>
					</thead>
					<tbody>
						{paged.map((member, index) => (
							<tr
								key={member.id}
								className={['apx-table-row border-b last:border-b-0', !rearrangeMode ? 'cursor-pointer' : '', selectedIds.includes(member.id) ? 'apx-table-row-selected' : ''].join(' ').trim()}
								style={{ borderColor: 'var(--apx-border)' }}
								draggable={rearrangeMode}
								onDragStart={() => setDragRowId(member.id)}
								onDragOver={(event) => { if (!rearrangeMode) return; event.preventDefault() }}
								onDrop={(event) => {
									if (!rearrangeMode || !dragRowId || dragRowId === member.id) return
									event.preventDefault()
									const from = reorderIds.indexOf(dragRowId)
									const to = reorderIds.indexOf(member.id)
									setReorderIds(moveItem(reorderIds, from, to))
									setDragRowId(null)
								}}
								onClick={() => {
									if (rearrangeMode) return
									setSelectedMember(member)
									setViewOpen(true)
								}}
							>
								{!rearrangeMode ? (
									<td className="px-2 py-3">
										<div onClick={(event) => event.stopPropagation()}>
											<ApexCheckbox checked={selectedIds.includes(member.id)} onChange={() => toggleSelectOne(member.id)} ariaLabel={`Select ${member.name}`} />
										</div>
									</td>
								) : (
									<td className="px-2 py-3">
										<div className="flex items-center gap-2">
											<GripVertical className="h-4 w-4 apx-muted" />
											<span className="text-xs font-semibold apx-text">{index + 1}</span>
										</div>
									</td>
								)}

								{columns.member ? (
									<td className="px-4 py-3">
										<div className="flex items-center gap-3">
											<div className="h-12 w-12 overflow-hidden rounded-md border" style={{ borderColor: 'var(--apx-border)' }}>
												{member.avatar ? (
													// eslint-disable-next-line @next/next/no-img-element
													<img src={member.avatar} alt={member.name} className="h-full w-full object-contain" />
												) : (
													<div className="flex h-full w-full items-center justify-center text-[10px] apx-muted">No image</div>
												)}
											</div>
											<div>
												<p className="font-semibold apx-text">{member.name}</p>
												<p className="text-xs apx-muted">{member.role || '-'}</p>
											</div>
										</div>
									</td>
								) : null}
								{columns.role ? <td className="px-4 py-3 apx-text">{member.role || '-'}</td> : null}
								{columns.email ? <td className="px-4 py-3 apx-text">{member.email || '-'}</td> : null}
								{columns.portfolio ? (
									<td className="px-4 py-3 apx-text">
										{member.portfolio ? (
											<a
												href={member.portfolio}
												target="_blank"
												rel="noreferrer"
												onClick={(event) => event.stopPropagation()}
												className="hover:underline"
												style={{ color: 'var(--apx-primary)' }}
											>
												{member.portfolio}
											</a>
										) : '-'}
									</td>
								) : null}
								{columns.order ? <td className="px-4 py-3 apx-text">{member.sortOrder || '-'}</td> : null}
								{columns.status ? (
									<td className="px-4 py-3">
										<span className="inline-flex rounded-full px-2 py-1 text-xs font-semibold" style={member.isActive ? { backgroundColor: 'rgba(22,163,74,0.15)', color: '#15803d' } : { backgroundColor: 'rgba(100,116,139,0.2)', color: '#334155' }}>
											{member.isActive ? 'Active' : 'Inactive'}
										</span>
									</td>
								) : null}
								{columns.actions ? (
									<td className="px-4 py-3">
										<div className="flex items-center justify-end gap-2">
											{rearrangeMode ? (
												<>
													<button type="button" className="apx-icon-action" onClick={(event) => { event.stopPropagation(); setReorderIds((prev) => moveItem(prev, prev.indexOf(member.id), prev.indexOf(member.id) - 1)) }} aria-label={`Move ${member.name} up`}>
														<ArrowUp className="h-4 w-4" />
													</button>
													<button type="button" className="apx-icon-action" onClick={(event) => { event.stopPropagation(); setReorderIds((prev) => moveItem(prev, prev.indexOf(member.id), prev.indexOf(member.id) + 1)) }} aria-label={`Move ${member.name} down`}>
														<ArrowDown className="h-4 w-4" />
													</button>
												</>
											) : (
												<>
													<button
														type="button"
														onClick={(event) => {
															event.stopPropagation()
															setSelectedMember(member)
															setEditForm(formFromRow(member))
															setEditImageFile(null)
															setEditImagePreview(member.avatar || '')
															setEditOpen(true)
														}}
														className="apx-icon-action"
														aria-label={`Edit ${member.name}`}
													>
														<Edit2 className="apx-muted" />
													</button>
													<button
														type="button"
														onClick={(event) => {
															event.stopPropagation()
															setPendingToggleMember(member)
															setConfirmConfig({
																title: member.isActive ? 'Deactivate Team Member' : 'Activate Team Member',
																description: `Set ${member.name} as ${member.isActive ? 'inactive' : 'active'}?`,
																label: member.isActive ? 'Deactivate' : 'Activate',
																tone: 'primary',
																kind: 'toggleActive',
															})
															setConfirmOpen(true)
														}}
														className="apx-icon-action"
														style={member.isActive ? { borderColor: 'rgba(234, 88, 12, 0.45)', color: '#c2410c', backgroundColor: 'rgba(249, 115, 22, 0.08)' } : { borderColor: 'rgba(22, 163, 74, 0.5)', color: '#15803d', backgroundColor: 'rgba(22, 163, 74, 0.12)' }}
														aria-label={`Toggle ${member.name} status`}
													>
														<Power className="h-4 w-4" />
													</button>
													<button
														type="button"
														onClick={(event) => {
															event.stopPropagation()
															setPendingDeleteId(member.id)
															setConfirmConfig({
																title: 'Delete Team Member',
																description: `Delete ${member.name}? This action cannot be undone.`,
																label: 'Delete',
																tone: 'danger',
																kind: 'delete',
															})
															setConfirmOpen(true)
														}}
														className="apx-icon-action-danger"
														aria-label={`Delete ${member.name}`}
													>
														<Trash2 />
													</button>
												</>
											)}
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

			<ApexModal size="sm" open={addOpen} title="Add Team Member" subtitle="Create a new team profile." onClose={() => setAddOpen(false)}>
				<form
					onSubmit={(event) => {
						event.preventDefault()
						setConfirmConfig({ title: 'Confirm Add Team Member', description: `Add ${addForm.name || 'this member'}?`, label: 'Add Member', tone: 'primary', kind: 'add' })
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
						<label className="mb-1 block text-xs font-medium apx-muted">Name</label>
						<ApexInput value={addForm.name} onChange={(event) => setAddForm((prev) => ({ ...prev, name: event.target.value }))} required />
					</div>
					<div className="md:col-span-2">
						<label className="mb-1 block text-xs font-medium apx-muted">Role</label>
						<ApexInput value={addForm.role} onChange={(event) => setAddForm((prev) => ({ ...prev, role: event.target.value }))} required />
					</div>
					<div className="md:col-span-2">
						<label className="mb-1 block text-xs font-medium apx-muted">Bio</label>
						<ApexTextarea rows={3} value={addForm.bio} onChange={(event) => setAddForm((prev) => ({ ...prev, bio: event.target.value }))} />
					</div>
					<div>
						<label className="mb-1 block text-xs font-medium apx-muted">Portfolio</label>
						<ApexInput value={addForm.portfolio} onChange={(event) => setAddForm((prev) => ({ ...prev, portfolio: event.target.value }))} />
					</div>
					<div>
						<label className="mb-1 block text-xs font-medium apx-muted">Email</label>
						<ApexInput type="email" value={addForm.email} onChange={(event) => setAddForm((prev) => ({ ...prev, email: event.target.value }))} />
					</div>
					<div>
						<label className="mb-1 block text-xs font-medium apx-muted">Postion / Order</label>
						<ApexInput type="number" min={1} value={String(addForm.sortOrder)} onChange={(event) => setAddForm((prev) => ({ ...prev, sortOrder: Number(event.target.value) || 1 }))} />
					</div>
					<div>
						<label className="mb-1 block text-xs font-medium apx-muted">Status</label>
						<ApexDropdown
							value={addForm.status}
							onChange={(value) => setAddForm((prev) => ({ ...prev, status: value as 'active' | 'inactive' }))}
							options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]}
						/>
					</div>
					<div className="md:col-span-2 flex justify-end gap-2 pt-2">
						<ApexButton type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</ApexButton>
						<ApexButton type="submit">Save Member</ApexButton>
					</div>
				</form>
			</ApexModal>

			<ApexModal size="sm" open={editOpen} title="Edit Team Member" subtitle="Update team profile details." onClose={() => setEditOpen(false)}>
				<form
					onSubmit={(event) => {
						event.preventDefault()
						setConfirmConfig({ title: 'Confirm Edit Team Member', description: `Save changes for ${editForm.name || 'this member'}?`, label: 'Save Changes', tone: 'primary', kind: 'edit' })
						setConfirmOpen(true)
					}}
					className="grid gap-3 md:grid-cols-2"
				>
					<div className="md:col-span-2">
						<ApexImageDropzone
							label="Profile Image"
							previewUrl={editImagePreview || editForm.avatar}
							onFileSelect={(file) => {
								setEditImageFile(file)
								setEditImagePreview(URL.createObjectURL(file))
							}}
						/>
					</div>
					<div className="md:col-span-2">
						<label className="mb-1 block text-xs font-medium apx-muted">Name</label>
						<ApexInput value={editForm.name} onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))} required />
					</div>
					<div className="md:col-span-2">
						<label className="mb-1 block text-xs font-medium apx-muted">Role</label>
						<ApexInput value={editForm.role} onChange={(event) => setEditForm((prev) => ({ ...prev, role: event.target.value }))} required />
					</div>
					<div className="md:col-span-2">
						<label className="mb-1 block text-xs font-medium apx-muted">Bio</label>
						<ApexTextarea rows={3} value={editForm.bio} onChange={(event) => setEditForm((prev) => ({ ...prev, bio: event.target.value }))} />
					</div>
					<div>
						<label className="mb-1 block text-xs font-medium apx-muted">Portfolio</label>
						<ApexInput value={editForm.portfolio} onChange={(event) => setEditForm((prev) => ({ ...prev, portfolio: event.target.value }))} />
					</div>
					<div>
						<label className="mb-1 block text-xs font-medium apx-muted">Email</label>
						<ApexInput type="email" value={editForm.email} onChange={(event) => setEditForm((prev) => ({ ...prev, email: event.target.value }))} />
					</div>
					<div>
						<label className="mb-1 block text-xs font-medium apx-muted">Postion / Order</label>
						<ApexInput type="number" min={1} value={String(editForm.sortOrder)} onChange={(event) => setEditForm((prev) => ({ ...prev, sortOrder: Number(event.target.value) || 1 }))} />
					</div>
					<div>
						<label className="mb-1 block text-xs font-medium apx-muted">Status</label>
						<ApexDropdown
							value={editForm.status}
							onChange={(value) => setEditForm((prev) => ({ ...prev, status: value as 'active' | 'inactive' }))}
							options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]}
						/>
					</div>
					<div className="md:col-span-2 flex justify-end gap-2 pt-2">
						<ApexButton type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</ApexButton>
						<ApexButton type="submit">Save Changes</ApexButton>
					</div>
				</form>
			</ApexModal>

			<ApexModal size="sm" open={viewOpen} title="View Team Member" subtitle={selectedMember?.name || ''} onClose={() => setViewOpen(false)}>
				{selectedMember ? (
					<div className="space-y-3 text-sm">
						<div className="overflow-hidden rounded-md border" style={{ borderColor: 'var(--apx-border)' }}>
							{selectedMember.avatar ? (
								// eslint-disable-next-line @next/next/no-img-element
								<img src={selectedMember.avatar} alt={selectedMember.name} className="h-48 w-full object-contain" />
							) : (
								<div className="flex h-48 w-full items-center justify-center apx-muted">No image</div>
							)}
						</div>
						<div><p className="text-xs uppercase tracking-wide apx-muted">Name</p><p className="mt-1 apx-text">{selectedMember.name || '-'}</p></div>
						<div><p className="text-xs uppercase tracking-wide apx-muted">Role</p><p className="mt-1 apx-text">{selectedMember.role || '-'}</p></div>
						<div><p className="text-xs uppercase tracking-wide apx-muted">Email</p><p className="mt-1 apx-text">{selectedMember.email || '-'}</p></div>
						<div><p className="text-xs uppercase tracking-wide apx-muted">Portfolio</p><p className="mt-1 apx-text break-all">{selectedMember.portfolio || '-'}</p></div>
						<div><p className="text-xs uppercase tracking-wide apx-muted">Postion / Order</p><p className="mt-1 apx-text">{selectedMember.sortOrder || '-'}</p></div>
						<div><p className="text-xs uppercase tracking-wide apx-muted">Status</p><p className="mt-1 apx-text">{selectedMember.isActive ? 'Active' : 'Inactive'}</p></div>
						<div><p className="text-xs uppercase tracking-wide apx-muted">Bio</p><p className="mt-1 whitespace-pre-wrap apx-text">{selectedMember.bio || '-'}</p></div>
						<div className="flex justify-end pt-2">
							<ApexButton type="button" variant="outline" onClick={() => setViewOpen(false)}>Close</ApexButton>
						</div>
					</div>
				) : null}
			</ApexModal>

			<ApexConfirmationModal
				open={confirmOpen}
				title={confirmConfig?.title || 'Confirm Action'}
				description={confirmConfig?.description || ''}
				confirmLabel={confirmConfig?.label || 'Confirm'}
				tone={confirmConfig?.tone || 'primary'}
				pending={pendingAction}
				onConfirm={executeConfirmedAction}
				onClose={() => {
					if (pendingAction) return
					setConfirmOpen(false)
					setConfirmConfig(null)
				}}
			/>
		</div>
	)
}

