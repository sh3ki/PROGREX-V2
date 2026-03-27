'use client'

import { useMemo, useState } from 'react'
import { Edit2, Mail, Trash2 } from 'lucide-react'
import { ApexButton } from '@/components/admin/apex/AdminPrimitives'
import {
	ApexBlockingSpinner,
	ApexBreadcrumbs,
	ApexCheckbox,
	ApexConfirmationModal,
	ApexExportButton,
	ApexModal,
	ApexSearchField,
	ApexStatusTabs,
	ApexToastStack,
} from '@/components/admin/apex/ApexDataUi'

type BookingRow = {
	id: string
	name: string
	email: string
	phone: string | null
	company: string | null
	service: string | null
	status: string
	isActive: boolean
	isArchived: boolean
	requestedDate: string | null
	requestedStartTime: string | null
	requestedDurationMinutes: number | null
	budget: string | null
	projectDetails: string | null
	attachmentUrls: string[]
	createdAt: string | null
}

type Toast = { id: number; message: string; tone?: 'default' | 'success' | 'danger' }

const statusColor = (status: string) => {
	const colors: Record<string, string> = {
		new: '#3b82f6', scheduled: '#eab308', rescheduled: '#f97316',
		done: '#22c55e', rejected: '#ef4444',
	}
	return colors[status] || '#64748b'
}

export default function AdminBookingsTemplateView({
	bookings,
	deleteBookingAction,
	bulkDeleteBookingsAction,
	sendBookingEmailAction,
}: {
	bookings: BookingRow[]
	createBookingAction?: (formData: FormData) => Promise<void>
	updateBookingAction?: (formData: FormData) => Promise<void>
	deleteBookingAction: (formData: FormData) => Promise<void>
	bulkDeleteBookingsAction: (formData: FormData) => Promise<void>
	bulkSetInactiveBookingsAction?: (formData: FormData) => Promise<void>
	bulkArchiveBookingsAction?: (formData: FormData) => Promise<void>
	toggleArchiveBookingAction?: (formData: FormData) => Promise<void>
	sendBookingEmailAction: (formData: FormData) => Promise<void>
}) {
	const [search, setSearch] = useState('')
	const [statusFilter, setStatusFilter] = useState('all')
	const [selectedIds, setSelectedIds] = useState<string[]>([])
	const [toasts, setToasts] = useState<Toast[]>([])
	const [pending, setPending] = useState(false)
	const [viewOpen, setViewOpen] = useState(false)
	const [activeBooking, setActiveBooking] = useState<BookingRow | null>(null)
	const [emailContent, setEmailContent] = useState('')
	const [confirmKind, setConfirmKind] = useState<string>('')

	function addToast(msg: string, tone: 'success' | 'danger' = 'success') {
		const id = toasts.length ? Math.max(...toasts.map(t => t.id)) + 1 : 1
		setToasts(prev => [...prev, { id, message: msg, tone }])
		setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000)
	}

	const filtered = useMemo(() => {
		const result = bookings.filter(b => {
			if (statusFilter !== 'all' && b.status !== statusFilter) return false
			if (search && !b.name.toLowerCase().includes(search) && !b.email.toLowerCase().includes(search)) return false
			return true
		})
		return result.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
	}, [bookings, search, statusFilter])

	const counts = useMemo(() => ({
		all: bookings.length,
		new: bookings.filter(b => b.status === 'new').length,
		scheduled: bookings.filter(b => b.status === 'scheduled').length,
		rescheduled: bookings.filter(b => b.status === 'rescheduled').length,
		done: bookings.filter(b => b.status === 'done').length,
		rejected: bookings.filter(b => b.status === 'rejected').length,
	}), [bookings])

	async function executeConfirmed() {
		if (!pending) setPending(true)
		try {
			if (confirmKind === 'delete' && activeBooking) {
				const body = new FormData()
				body.set('id', activeBooking.id)
				await deleteBookingAction(body)
				setViewOpen(false)
				addToast('Booking deleted', 'success')
			}
			if (confirmKind === 'bulkDelete') {
				const body = new FormData()
				body.set('ids', selectedIds.join(','))
				await bulkDeleteBookingsAction(body)
				setSelectedIds([])
				addToast('Bookings deleted', 'success')
			}
			if (confirmKind === 'sendEmail' && activeBooking && emailContent) {
				const body = new FormData()
				body.set('email', activeBooking.email)
				body.set('name', activeBooking.name)
				body.set('reply', emailContent)
				await sendBookingEmailAction(body)
				setEmailContent('')
				setViewOpen(false)
				addToast('Email sent', 'success')
			}
			setConfirmKind('')
		} catch (err) {
			addToast(err instanceof Error ? err.message : 'Action failed', 'danger')
		} finally {
			setPending(false)
		}
	}

	return (
		<div className="space-y-4">
			{pending && <ApexBlockingSpinner label="Saving..." />}
			<ApexToastStack toasts={toasts} onRemove={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

			<ApexBreadcrumbs items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Bookings' }]} />

			<div className="flex items-start justify-between gap-4">
				<div>
					<h1 className="text-[42px] font-bold apx-text">Bookings</h1>
					<p className="text-sm apx-muted mt-1">Manage booking requests</p>
				</div>
			</div>

			<ApexStatusTabs
				tabs={[
					{ key: 'all', label: 'All', count: counts.all },
					{ key: 'new', label: 'New', count: counts.new, indicatorColor: '#3b82f6' },
					{ key: 'scheduled', label: 'Scheduled', count: counts.scheduled, indicatorColor: '#eab308' },
					{ key: 'rescheduled', label: 'Rescheduled', count: counts.rescheduled, indicatorColor: '#f97316' },
					{ key: 'done', label: 'Done', count: counts.done, indicatorColor: '#22c55e' },
					{ key: 'rejected', label: 'Rejected', count: counts.rejected, indicatorColor: '#ef4444' },
				]}
				active={statusFilter}
				onChange={(key) => { setStatusFilter(key); setSelectedIds([]) }}
			/>

			<div className="rounded-xl border p-4 space-y-4" style={{ borderColor: 'var(--apx-border)' }}>
				<div className="flex gap-2">
					<ApexSearchField value={search} onChange={setSearch} placeholder="Search bookings..." />
					<ApexExportButton onClick={() => {
						const csv = [['Name', 'Email', 'Service', 'Status', 'Budget'], ...filtered.map(b => [b.name, b.email, b.service||'', b.status, b.budget||''])]
							.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
						const a = document.createElement('a')
						a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
						a.download = `bookings-${new Date().toISOString().slice(0,10)}.csv`
						a.click()
					}} />
					{selectedIds.length > 0 && (
						<ApexButton variant="danger" onClick={() => { setConfirmKind('bulkDelete'); }}>
							Delete ({selectedIds.length})
						</ApexButton>
					)}
				</div>

				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr style={{ borderBottom: '1px solid var(--apx-border)' }}>
								<th className="px-3 py-2 text-left">
									<ApexCheckbox 
										checked={selectedIds.length === filtered.length && filtered.length > 0}
										onChange={() => {
										setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map(b => b.id))
									}} />
								</th>
								<th className="px-3 py-2 text-left font-semibold apx-text">Name / Email</th>
								<th className="px-3 py-2 text-left font-semibold apx-text">Service</th>
								<th className="px-3 py-2 text-left font-semibold apx-text">Status</th>
								<th className="px-3 py-2 text-left font-semibold apx-text">Budget</th>
								<th className="px-3 py-2 text-right font-semibold apx-text">Actions</th>
							</tr>
						</thead>
						<tbody>
							{filtered.map(booking => (
								<tr key={booking.id} style={{ borderBottom: '1px solid var(--apx-border)' }} className="hover:opacity-80">
									<td className="px-3 py-2">
										<ApexCheckbox 
											checked={selectedIds.includes(booking.id)}
											onChange={() => {
											setSelectedIds(selectedIds.includes(booking.id)
												? selectedIds.filter(id => id !== booking.id)
												: [...selectedIds, booking.id])
										}} />
									</td>
									<td className="px-3 py-2 apx-text cursor-pointer" onClick={() => { setActiveBooking(booking); setViewOpen(true) }}>
										<div className="font-semibold">{booking.name}</div>
										<div className="text-xs apx-muted">{booking.email}</div>
									</td>
									<td className="px-3 py-2 apx-text text-sm">{booking.service || '—'}</td>
									<td className="px-3 py-2">
										<span className="px-2 py-1 rounded text-xs font-semibold text-white" style={{ background: statusColor(booking.status) }}>
											{booking.status}
										</span>
									</td>
									<td className="px-3 py-2 apx-text text-sm">{booking.budget || '—'}</td>
									<td className="px-3 py-2 text-right space-x-1">
										<button onClick={() => { setActiveBooking(booking); setViewOpen(true) }} className="apx-icon-action"><Mail className="h-4 w-4" /></button>
										<button onClick={() => { setActiveBooking(booking); setEmailContent(''); setConfirmKind('sendEmail') }} className="apx-icon-action"><Edit2 className="h-4 w-4" /></button>
										<button onClick={() => { setActiveBooking(booking); setConfirmKind('delete') }} className="apx-icon-action hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			<ApexModal open={viewOpen} title="Booking Details" onClose={() => setViewOpen(false)}>
				{activeBooking && (
					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div><label className="text-xs font-semibold apx-muted">Name</label><p className="mt-1 apx-text font-semibold">{activeBooking.name}</p></div>
							<div><label className="text-xs font-semibold apx-muted">Email</label><p className="mt-1 apx-text">{activeBooking.email}</p></div>
							<div><label className="text-xs font-semibold apx-muted">Service</label><p className="mt-1 apx-text">{activeBooking.service || '—'}</p></div>
							<div><label className="text-xs font-semibold apx-muted">Status</label><p className="mt-1 apx-text">{activeBooking.status}</p></div>
						</div>
						<div><label className="text-xs font-semibold apx-muted">Project Details</label><p className="mt-1 apx-text whitespace-pre">{activeBooking.projectDetails || '—'}</p></div>
						<div className="flex gap-2"><ApexButton onClick={() => setConfirmKind('delete')}>Delete</ApexButton><ApexButton variant="outline" onClick={() => setViewOpen(false)}>Close</ApexButton></div>
					</div>
				)}
			</ApexModal>

			<ApexConfirmationModal
				open={Boolean(confirmKind)}
				title="Confirm"
				description={confirmKind === 'delete' ? 'Delete this booking?' : confirmKind === 'bulkDelete' ? `Delete ${selectedIds.length} bookings?` : 'Send email?'}
				confirmLabel="Confirm"
				tone={confirmKind === 'delete' || confirmKind === 'bulkDelete' ? 'danger' : 'primary'}
				onClose={() => setConfirmKind('')}
				onConfirm={executeConfirmed}
			/>
		</div>
	)
}

