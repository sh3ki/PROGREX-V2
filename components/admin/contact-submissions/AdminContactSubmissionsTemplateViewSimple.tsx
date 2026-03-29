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

type ContactSubmission = {
	id: string
	name: string
	email: string
	phone: string | null
	company: string | null
	service: string | null
	status: string
	isActive: boolean
	isArchived: boolean
	attachmentUrls: string[]
	createdAt: string | null
}

type Toast = { id: number; message: string; tone?: 'default' | 'success' | 'danger' }

const statusColor = (status: string) => {
	const colors: Record<string, string> = {
		new: '#3b82f6', 
		'in-progress': '#a855f7', 
		replied: '#eab308',
		resolved: '#22c55e', 
		archived: '#64748b',
	}
	return colors[status] || '#64748b'
}

export default function AdminContactSubmissionsTemplateView({
	submissions,
	deleteContactSubmissionAction,
	bulkDeleteContactSubmissionsAction,
	sendContactEmailAction,
}: {
	submissions: ContactSubmission[]
	deleteContactSubmissionAction: (formData: FormData) => Promise<void>
	bulkDeleteContactSubmissionsAction: (formData: FormData) => Promise<void>
	sendContactEmailAction: (formData: FormData) => Promise<void>
}) {
	const [search, setSearch] = useState('')
	const [statusFilter, setStatusFilter] = useState('all')
	const [selectedIds, setSelectedIds] = useState<string[]>([])
	const [toasts, setToasts] = useState<Toast[]>([])
	const [pending, setPending] = useState(false)
	const [viewOpen, setViewOpen] = useState(false)
	const [activeSubmission, setActiveSubmission] = useState<ContactSubmission | null>(null)
	const [emailContent, setEmailContent] = useState('')
	const [confirmKind, setConfirmKind] = useState<string>('')

	function addToast(msg: string, tone: 'success' | 'danger' = 'success') {
		const id = toasts.length ? Math.max(...toasts.map(t => t.id)) + 1 : 1
		setToasts(prev => [...prev, { id, message: msg, tone }])
		setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000)
	}

	const filtered = useMemo(() => {
		const result = submissions.filter(s => {
			if (statusFilter !== 'all' && s.status !== statusFilter) return false
			if (search && !s.name.toLowerCase().includes(search) && !s.email.toLowerCase().includes(search)) return false
			return true
		})
		return result.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
	}, [submissions, search, statusFilter])

	const counts = useMemo(() => ({
		all: submissions.length,
		new: submissions.filter(s => s.status === 'new').length,
		'in-progress': submissions.filter(s => s.status === 'in-progress').length,
		replied: submissions.filter(s => s.status === 'replied').length,
		resolved: submissions.filter(s => s.status === 'resolved').length,
		archived: submissions.filter(s => s.status === 'archived').length,
	}), [submissions])

	async function executeConfirmed() {
		if (!pending) setPending(true)
		try {
			if (confirmKind === 'delete' && activeSubmission) {
				const body = new FormData()
				body.set('id', activeSubmission.id)
				await deleteContactSubmissionAction(body)
				setViewOpen(false)
				addToast('Submission deleted', 'success')
			}
			if (confirmKind === 'bulkDelete') {
				const body = new FormData()
				body.set('ids', selectedIds.join(','))
				await bulkDeleteContactSubmissionsAction(body)
				setSelectedIds([])
				addToast('Submissions deleted', 'success')
			}
			if (confirmKind === 'sendEmail' && activeSubmission && emailContent) {
				const body = new FormData()
				body.set('email', activeSubmission.email)
				body.set('name', activeSubmission.name)
				body.set('reply', emailContent)
				await sendContactEmailAction(body)
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

			<ApexBreadcrumbs items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Contact Submissions' }]} />

			<div className="flex items-start justify-between gap-4">
				<div>
					<h1 className="text-[42px] font-bold apx-text">Contact Submissions</h1>
					<p className="text-sm apx-muted mt-1">Manage contact form submissions</p>
				</div>
			</div>

			<ApexStatusTabs
				tabs={[
					{ key: 'all', label: 'All', count: counts.all },
					{ key: 'new', label: 'New', count: counts.new, indicatorColor: '#3b82f6' },
					{ key: 'in-progress', label: 'In Progress', count: counts['in-progress'], indicatorColor: '#a855f7' },
					{ key: 'replied', label: 'Replied', count: counts.replied, indicatorColor: '#eab308' },
					{ key: 'resolved', label: 'Resolved', count: counts.resolved, indicatorColor: '#22c55e' },
					{ key: 'archived', label: 'Archived', count: counts.archived, indicatorColor: '#64748b' },
				]}
				active={statusFilter}
				onChange={(key) => { setStatusFilter(key); setSelectedIds([]) }}
			/>

			<div className="rounded-xl border p-4 space-y-4" style={{ borderColor: 'var(--apx-border)' }}>
				<div className="flex gap-2">
					<ApexSearchField value={search} onChange={setSearch} placeholder="Search submissions..." />
					<ApexExportButton onClick={() => {
						const csv = [['Name', 'Email', 'Service', 'Status', 'Company'], ...filtered.map(s => [s.name, s.email, s.service||'', s.status, s.company||''])]
							.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
						const a = document.createElement('a')
						a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
						a.download = `submissions-${new Date().toISOString().slice(0,10)}.csv`
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
										setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map(s => s.id))
									}} />
								</th>
								<th className="px-3 py-2 text-left font-semibold apx-text">Name / Email</th>
								<th className="px-3 py-2 text-left font-semibold apx-text">Service</th>
								<th className="px-3 py-2 text-left font-semibold apx-text">Status</th>
								<th className="px-3 py-2 text-left font-semibold apx-text">Company</th>
								<th className="px-3 py-2 text-right font-semibold apx-text">Actions</th>
							</tr>
						</thead>
						<tbody>
							{filtered.map(submission => (
								<tr key={submission.id} style={{ borderBottom: '1px solid var(--apx-border)' }} className="hover:opacity-80">
									<td className="px-3 py-2">
										<ApexCheckbox 
											checked={selectedIds.includes(submission.id)}
											onChange={() => {
											setSelectedIds(selectedIds.includes(submission.id)
												? selectedIds.filter(id => id !== submission.id)
												: [...selectedIds, submission.id])
										}} />
									</td>
									<td className="px-3 py-2 apx-text cursor-pointer" onClick={() => { setActiveSubmission(submission); setViewOpen(true) }}>
										<div className="font-semibold">{submission.name}</div>
										<div className="text-xs apx-muted">{submission.email}</div>
									</td>
									<td className="px-3 py-2 apx-text text-sm">{submission.service || '—'}</td>
									<td className="px-3 py-2">
										<span className="px-2 py-1 rounded text-xs font-semibold text-white" style={{ background: statusColor(submission.status) }}>
											{submission.status}
										</span>
									</td>
									<td className="px-3 py-2 apx-text text-sm">{submission.company || '—'}</td>
									<td className="px-3 py-2 text-right space-x-1">
										<button onClick={() => { setActiveSubmission(submission); setViewOpen(true) }} className="apx-icon-action"><Mail className="h-4 w-4" /></button>
										<button onClick={() => { setActiveSubmission(submission); setEmailContent(''); setConfirmKind('sendEmail') }} className="apx-icon-action"><Edit2 className="h-4 w-4" /></button>
										<button onClick={() => { setActiveSubmission(submission); setConfirmKind('delete') }} className="apx-icon-action hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			<ApexModal open={viewOpen} title="Submission Details" onClose={() => setViewOpen(false)}>
				{activeSubmission && (
					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div><label className="text-xs font-semibold apx-muted">Name</label><p className="mt-1 apx-text font-semibold">{activeSubmission.name}</p></div>
							<div><label className="text-xs font-semibold apx-muted">Email</label><p className="mt-1 apx-text">{activeSubmission.email}</p></div>
							<div><label className="text-xs font-semibold apx-muted">Service</label><p className="mt-1 apx-text">{activeSubmission.service || '—'}</p></div>
							<div><label className="text-xs font-semibold apx-muted">Status</label><p className="mt-1 apx-text">{activeSubmission.status}</p></div>
						</div>
						<div className="flex gap-2"><ApexButton onClick={() => setConfirmKind('delete')}>Delete</ApexButton><ApexButton variant="outline" onClick={() => setViewOpen(false)}>Close</ApexButton></div>
					</div>
				)}
			</ApexModal>

			<ApexConfirmationModal
				open={Boolean(confirmKind)}
				title="Confirm"
				description={confirmKind === 'delete' ? 'Delete this submission?' : confirmKind === 'bulkDelete' ? `Delete ${selectedIds.length} submissions?` : 'Send email?'}
				confirmLabel="Confirm"
				tone={confirmKind === 'delete' || confirmKind === 'bulkDelete' ? 'danger' : 'primary'}
				onClose={() => setConfirmKind('')}
				onConfirm={executeConfirmed}
			/>
		</div>
	)
}
