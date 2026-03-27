'use client'

import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, Edit2, Plus, Power, Trash2 } from 'lucide-react'
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

type BlogColumnKey = 'image' | 'title' | 'category' | 'author' | 'date' | 'status' | 'actions'
type SortKey = Exclude<BlogColumnKey, 'image' | 'actions'>

type BlogRow = {
	id: string
	slug: string
	title: string
	category: string
	teamMemberId: string | null
	authorName: string
	authorRole: string
	authorAvatar: string
	publishedAt: string
	readTime: string
	image: string
	excerpt: string
	tags: string[]
	keywords: string[]
	relatedPosts: string[]
	content: string
	metaTitle: string
	metaDescription: string
	isPublished: boolean
}

type TeamOption = {
	id: string
	name: string
	role: string
	avatar: string
	isActive: boolean
}

type BlogFormState = {
	id?: string
	title: string
	slug: string
	category: string
	teamMemberId: string
	publishedAt: string
	readTime: string
	excerpt: string
	tags: string
	keywords: string
	content: string
	metaTitle: string
	metaDescription: string
	status: 'published' | 'draft'
	image: string
}

function slugify(value: string) {
	return value
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9\s-]/g, '')
		.trim()
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
}

function defaultForm(teamOptions: TeamOption[]): BlogFormState {
	return {
		title: '',
		slug: '',
		category: 'Tech',
		teamMemberId: teamOptions.find((item) => item.isActive)?.id ?? teamOptions[0]?.id ?? '',
		publishedAt: new Date().toISOString().slice(0, 10),
		readTime: '8 min read',
		excerpt: '',
		tags: '',
		keywords: '',
		content: '',
		metaTitle: '',
		metaDescription: '',
		status: 'published',
		image: '',
	}
}

function formFromBlog(blog: BlogRow): BlogFormState {
	return {
		id: blog.id,
		title: blog.title,
		slug: blog.slug,
		category: blog.category || 'Tech',
		teamMemberId: blog.teamMemberId || '',
		publishedAt: blog.publishedAt || '',
		readTime: blog.readTime || '',
		excerpt: blog.excerpt || '',
		tags: (blog.tags || []).join(', '),
		keywords: (blog.keywords || []).join(', '),
		content: blog.content || '',
		metaTitle: blog.metaTitle || '',
		metaDescription: blog.metaDescription || '',
		status: blog.isPublished ? 'published' : 'draft',
		image: blog.image || '',
	}
}

function buildFormData(form: BlogFormState, imageFile: File | null) {
	const body = new FormData()
	if (form.id) body.set('id', form.id)
	body.set('title', form.title)
	body.set('slug', form.slug)
	body.set('category', form.category)
	body.set('teamMemberId', form.teamMemberId)
	body.set('date', form.publishedAt)
	body.set('readTime', form.readTime)
	body.set('excerpt', form.excerpt)
	body.set('tags', form.tags)
	body.set('keywords', form.keywords)
	body.set('content', form.content)
	body.set('metaTitle', form.metaTitle)
	body.set('metaDescription', form.metaDescription)
	body.set('status', form.status)
	if (form.image) body.set('existingImage', form.image)
	if (imageFile) body.set('coverImage', imageFile)
	return body
}

function withProgrexRole(role: string) {
	const value = role.trim()
	if (!value) return 'PROGREX'
	return value.toLowerCase().includes('progrex') ? value : `${value}, PROGREX`
}

function categoryBadgeStyle() {
	return { backgroundColor: 'var(--apx-primary-soft)', color: 'var(--apx-primary)' }
}

export default function AdminBlogsTemplateView({
	blogs,
	teamOptions,
	createBlogAction,
	updateBlogAction,
	deleteBlogAction,
	bulkDeleteBlogAction,
	bulkSetDraftBlogAction,
	togglePublishAction,
	generateBlogDraftAction,
}: {
	blogs: BlogRow[]
	teamOptions: TeamOption[]
	createBlogAction: (formData: FormData) => Promise<void>
	updateBlogAction: (formData: FormData) => Promise<void>
	deleteBlogAction: (formData: FormData) => Promise<void>
	bulkDeleteBlogAction: (formData: FormData) => Promise<void>
	bulkSetDraftBlogAction: (formData: FormData) => Promise<void>
	togglePublishAction: (formData: FormData) => Promise<void>
	generateBlogDraftAction: (formData: FormData) => Promise<{
		title: string
		slug: string
		category: string
		publishedAt: string
		readTime: string
		excerpt: string
		tags: string
		keywords: string
		content: string
		metaTitle: string
		metaDescription: string
		image: string
		imageCandidates: string[]
	}>
}) {
	const [search, setSearch] = useState('')
	const [status, setStatus] = useState<'all' | 'published' | 'draft'>('all')
	const [sortKey, setSortKey] = useState<SortKey>('date')
	const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
	const [page, setPage] = useState(1)
	const [perPage, setPerPage] = useState(10)
	const [selectedIds, setSelectedIds] = useState<string[]>([])
	const [addOpen, setAddOpen] = useState(false)
	const [editOpen, setEditOpen] = useState(false)
	const [viewOpen, setViewOpen] = useState(false)
	const [confirmOpen, setConfirmOpen] = useState(false)
	const [pending, setPending] = useState(false)
	const [generatingBlog, setGeneratingBlog] = useState(false)
	const [selectedBlog, setSelectedBlog] = useState<BlogRow | null>(null)
	const [toasts, setToasts] = useState<ApexToast[]>([])
	const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
	const [pendingToggleId, setPendingToggleId] = useState<string | null>(null)
	const [addForm, setAddForm] = useState<BlogFormState>(defaultForm(teamOptions))
	const [editForm, setEditForm] = useState<BlogFormState>(defaultForm(teamOptions))
	const [addImageFile, setAddImageFile] = useState<File | null>(null)
	const [editImageFile, setEditImageFile] = useState<File | null>(null)
	const [addImagePreview, setAddImagePreview] = useState('')
	const [editImagePreview, setEditImagePreview] = useState('')
	const [generatedImageCandidates, setGeneratedImageCandidates] = useState<string[]>([])
	const [confirmConfig, setConfirmConfig] = useState<{
		title: string
		description: string
		confirmLabel: string
		tone: 'primary' | 'danger'
		kind: 'create' | 'update' | 'delete' | 'toggle' | 'bulkDelete' | 'bulkDraft' | 'generate'
	} | null>(null)
	const [columns, setColumns] = useState<Record<BlogColumnKey, boolean>>({
		image: true,
		title: true,
		category: true,
		author: true,
		date: true,
		status: true,
		actions: true,
	})

	const filtered = useMemo(() => {
		const needle = search.trim().toLowerCase()
		return blogs.filter((blog) => {
			const statusMatch = status === 'all' ? true : status === 'published' ? blog.isPublished : !blog.isPublished
			const searchMatch = needle.length === 0
				? true
				: [blog.title, blog.slug, blog.category, blog.authorName, ...(blog.tags || [])].join(' ').toLowerCase().includes(needle)
			return statusMatch && searchMatch
		})
	}, [blogs, search, status])

	const sorted = useMemo(() => {
		const items = [...filtered]
		items.sort((a, b) => {
			const direction = sortDir === 'asc' ? 1 : -1
			if (sortKey === 'title') return a.title.localeCompare(b.title) * direction
			if (sortKey === 'category') return a.category.localeCompare(b.category) * direction
			if (sortKey === 'author') return a.authorName.localeCompare(b.authorName) * direction
			if (sortKey === 'status') {
				const aValue = a.isPublished ? 1 : 0
				const bValue = b.isPublished ? 1 : 0
				return (aValue - bValue) * direction
			}

			const aDate = new Date(a.publishedAt || '1970-01-01').getTime()
			const bDate = new Date(b.publishedAt || '1970-01-01').getTime()
			return (aDate - bDate) * direction
		})
		return items
	}, [filtered, sortDir, sortKey])

	const totalPages = Math.max(1, Math.ceil(sorted.length / perPage))
	const safePage = Math.min(page, totalPages)
	const paged = sorted.slice((safePage - 1) * perPage, safePage * perPage)
	const currentIds = paged.map((item) => item.id)
	const currentAllSelected = currentIds.length > 0 && currentIds.every((id) => selectedIds.includes(id))

	const statusCounts = useMemo(() => {
		const published = blogs.filter((item) => item.isPublished).length
		return { all: blogs.length, published, draft: blogs.length - published }
	}, [blogs])

	const teamDropdownOptions = useMemo(
		() => teamOptions.map((item) => ({ value: item.id, label: `${item.name} - ${withProgrexRole(item.role)}` })),
		[teamOptions]
	)

	function toggleColumn(key: string) {
		const typedKey = key as BlogColumnKey
		setColumns((prev) => ({ ...prev, [typedKey]: !prev[typedKey] }))
	}

	function addToast(message: string, tone: ApexToast['tone'] = 'default') {
		const id = Date.now() + Math.floor(Math.random() * 1000)
		setToasts((prev) => [...prev, { id, message, tone }])
		setTimeout(() => setToasts((prev) => prev.filter((item) => item.id !== id)), 4000)
	}

	function toggleSelectAllCurrentPage() {
		if (currentAllSelected) {
			setSelectedIds((prev) => prev.filter((id) => !currentIds.includes(id)))
			return
		}
		setSelectedIds((prev) => Array.from(new Set([...prev, ...currentIds])))
	}

	function toggleOne(id: string) {
		setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
	}

	function resetAddForm() {
		setAddForm(defaultForm(teamOptions))
		setAddImageFile(null)
		setAddImagePreview('')
		setGeneratedImageCandidates([])
	}

	async function runGenerateBlogDraft() {
		setGeneratingBlog(true)
		try {
			const body = new FormData()
			body.set('category', addForm.category)
			const generated = await generateBlogDraftAction(body)
			setAddForm((prev) => ({
				...prev,
				title: generated.title,
				slug: generated.slug,
				category: generated.category,
				publishedAt: generated.publishedAt,
				readTime: generated.readTime,
				excerpt: generated.excerpt,
				tags: generated.tags,
				keywords: generated.keywords,
				content: generated.content,
				metaTitle: generated.metaTitle,
				metaDescription: generated.metaDescription,
				image: generated.image,
			}))
			setGeneratedImageCandidates(generated.imageCandidates || [])
			setAddImageFile(null)
			setAddImagePreview(generated.image)
			addToast('Blog draft generated.', 'success')
		} catch (error) {
			addToast(error instanceof Error ? error.message : 'Failed to generate blog draft.', 'danger')
		} finally {
			setGeneratingBlog(false)
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

	async function runConfirmed() {
		if (!confirmConfig) return
		setPending(true)

		try {
			if (confirmConfig.kind === 'create') {
				await createBlogAction(buildFormData(addForm, addImageFile))
				setAddOpen(false)
				resetAddForm()
				addToast('Blog created successfully.', 'success')
			}

			if (confirmConfig.kind === 'update') {
				await updateBlogAction(buildFormData(editForm, editImageFile))
				setEditOpen(false)
				setEditImageFile(null)
				setEditImagePreview('')
				addToast('Blog updated successfully.', 'success')
			}

			if (confirmConfig.kind === 'delete' && pendingDeleteId) {
				const body = new FormData()
				body.set('id', pendingDeleteId)
				await deleteBlogAction(body)
				setPendingDeleteId(null)
				addToast('Blog deleted.', 'success')
			}

			if (confirmConfig.kind === 'bulkDelete') {
				const body = new FormData()
				body.set('ids', selectedIds.join(','))
				await bulkDeleteBlogAction(body)
				setSelectedIds([])
				addToast('Selected blogs deleted.', 'success')
			}

			if (confirmConfig.kind === 'bulkDraft') {
				const body = new FormData()
				body.set('ids', selectedIds.join(','))
				await bulkSetDraftBlogAction(body)
				setSelectedIds([])
				addToast('Selected blogs set to draft.', 'success')
			}

			if (confirmConfig.kind === 'toggle' && pendingToggleId) {
				const body = new FormData()
				body.set('id', pendingToggleId)
				await togglePublishAction(body)
				setPendingToggleId(null)
				addToast('Blog status updated.', 'success')
			}

			if (confirmConfig.kind === 'generate') {
				await runGenerateBlogDraft()
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
			{(pending && (confirmConfig?.kind === 'create' || confirmConfig?.kind === 'update' || confirmConfig?.kind === 'generate')) ? <ApexBlockingSpinner label={confirmConfig?.kind === 'generate' ? 'Generating blog draft...' : 'Saving blog post...'} /> : null}
			<ApexToastStack toasts={toasts} onRemove={(id) => setToasts((prev) => prev.filter((item) => item.id !== id))} />

			<ApexBreadcrumbs items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Blogs' }]} />

			<div className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<h1 className="text-[42px] leading-none font-bold tracking-tight apx-text">Blogs</h1>
					<p className="mt-1 text-sm apx-muted">Manage blog posts shown in your public blog listing.</p>
				</div>
				<button
					onClick={() => {
						resetAddForm()
						setAddOpen(true)
					}}
					className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-0.5"
					style={{ backgroundColor: 'var(--apx-primary)' }}
				>
					<Plus className="h-4 w-4" />
					Add Blog Post
				</button>
			</div>

			<ApexStatusTabs
				tabs={[
					{ key: 'all', label: 'All', count: statusCounts.all },
					{ key: 'published', label: 'Published', count: statusCounts.published, indicatorColor: '#16a34a' },
					{ key: 'draft', label: 'Draft', count: statusCounts.draft, indicatorColor: '#64748b' },
				]}
				active={status}
				onChange={(key) => {
					setStatus(key as 'all' | 'published' | 'draft')
					setPage(1)
				}}
			/>

			<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<div className="w-full md:max-w-md">
					<ApexSearchField value={search} onChange={(value) => { setSearch(value); setPage(1) }} placeholder="Search blogs..." />
				</div>
				<div className="flex flex-wrap items-center justify-end gap-2">
					{selectedIds.length > 0 ? (
						<>
							<ApexButton
								type="button"
								variant="outline"
								onClick={() => {
									setConfirmConfig({
										title: 'Set Selected Blog Posts to Draft',
										description: `Set ${selectedIds.length} selected blog post(s) to draft?`,
										confirmLabel: 'Set Draft',
										tone: 'primary',
										kind: 'bulkDraft',
									})
									setConfirmOpen(true)
								}}
							>
								<Power className="h-4 w-4" />
								Set Draft
							</ApexButton>
							<ApexButton
								type="button"
								variant="danger"
								onClick={() => {
									setConfirmConfig({
										title: 'Delete Selected Blog Posts',
										description: `Delete ${selectedIds.length} selected blog post(s)? This cannot be undone.`,
										confirmLabel: 'Delete Selected',
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
							{ key: 'image', label: 'Image', visible: columns.image },
							{ key: 'title', label: 'Title', visible: columns.title },
							{ key: 'category', label: 'Category', visible: columns.category },
							{ key: 'author', label: 'Author', visible: columns.author },
							{ key: 'date', label: 'Date', visible: columns.date },
							{ key: 'status', label: 'Status', visible: columns.status },
							{ key: 'actions', label: 'Actions', visible: columns.actions },
						]}
						onToggle={toggleColumn}
					/>

					<ApexExportButton
						onClick={() => {
							const header = ['Title', 'Slug', 'Category', 'Author', 'Date', 'Status']
							const rows = filtered.map((item) => [item.title, item.slug, item.category, item.authorName, item.publishedAt, item.isPublished ? 'Published' : 'Draft'])
							const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n')
							const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
							const url = URL.createObjectURL(blob)
							const link = document.createElement('a')
							link.href = url
							link.download = 'blogs-export.csv'
							link.click()
							URL.revokeObjectURL(url)
							addToast('Blogs CSV exported.', 'success')
						}}
					/>
				</div>
			</div>

			<div className="overflow-x-auto rounded-2xl border" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
				<table className="w-full text-left text-sm">
					<thead>
						<tr className="border-b" style={{ borderColor: 'var(--apx-border)' }}>
							<th className="w-10 px-2 py-3">
								<ApexCheckbox checked={currentAllSelected} onChange={toggleSelectAllCurrentPage} ariaLabel="Select all visible blogs" />
							</th>
							{columns.image ? <th className="px-4 py-3 font-semibold apx-text">Image</th> : null}
							{columns.title ? (
								<th className="px-4 py-3 font-semibold apx-text">
									<button type="button" className="inline-flex items-center gap-1.5" onClick={() => onSort('title')}>
										Title
										{renderSortIcon('title')}
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
							{columns.author ? (
								<th className="px-4 py-3 font-semibold apx-text">
									<button type="button" className="inline-flex items-center gap-1.5" onClick={() => onSort('author')}>
										Author
										{renderSortIcon('author')}
									</button>
								</th>
							) : null}
							{columns.date ? (
								<th className="px-4 py-3 font-semibold apx-text">
									<button type="button" className="inline-flex items-center gap-1.5" onClick={() => onSort('date')}>
										Date
										{renderSortIcon('date')}
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
						{paged.map((blog) => (
							<tr
								key={blog.id}
								className="apx-table-row cursor-pointer border-b last:border-b-0"
								style={{ borderColor: 'var(--apx-border)' }}
								onClick={() => {
									setSelectedBlog(blog)
									setViewOpen(true)
								}}
							>
								<td className="px-2 py-3">
									<div onClick={(event) => event.stopPropagation()}>
										<ApexCheckbox checked={selectedIds.includes(blog.id)} onChange={() => toggleOne(blog.id)} ariaLabel={`Select ${blog.title}`} />
									</div>
								</td>
								{columns.image ? (
									<td className="px-4 py-3">
									<div className="h-14 w-24 overflow-hidden rounded-md border" style={{ borderColor: 'var(--apx-border)' }}>
										{blog.image ? (
											// eslint-disable-next-line @next/next/no-img-element
											<img src={blog.image} alt={blog.title} className="h-full w-full object-contain" />
										) : (
											<div className="flex h-full w-full items-center justify-center text-[10px] apx-muted">No image</div>
										)}
									</div>
									</td>
								) : null}
								{columns.title ? (
									<td className="px-4 py-3">
									<p className="font-semibold apx-text">{blog.title}</p>
									{/* <p className="text-xs apx-muted">{blog.slug}</p> */}
									</td>
								) : null}
								{columns.category ? (
									<td className="px-4 py-3">
										<span className="inline-flex rounded-full px-2 py-1 text-xs font-semibold" style={categoryBadgeStyle()}>
											{blog.category || '-'}
										</span>
									</td>
								) : null}
								{columns.author ? (
									<td className="px-4 py-3">
									<p className="apx-text">{blog.authorName || '-'}</p>
									</td>
								) : null}
								{columns.date ? <td className="px-4 py-3 apx-text">{blog.publishedAt || '-'}</td> : null}
								{columns.status ? (
									<td className="px-4 py-3">
									<span className="inline-flex rounded-full px-2 py-1 text-xs font-semibold" style={blog.isPublished ? { backgroundColor: 'rgba(22,163,74,0.15)', color: '#15803d' } : { backgroundColor: 'rgba(100,116,139,0.2)', color: '#334155' }}>
										{blog.isPublished ? 'Published' : 'Draft'}
									</span>
									</td>
								) : null}
								{columns.actions ? (
									<td className="px-4 py-3">
									<div className="flex items-center justify-end gap-2">
										{/* <button
											type="button"
											onClick={() => {
												setSelectedBlog(blog)
												setViewOpen(true)
											}}
											className="apx-icon-action"
											aria-label={`View ${blog.title}`}
										>
											<Eye className="h-4 w-4" />
										</button> */}
										<button
											type="button"
											onClick={(event) => {
												event.stopPropagation()
												setSelectedBlog(blog)
												setEditForm(formFromBlog(blog))
												setEditImageFile(null)
												setEditImagePreview(blog.image || '')
												setEditOpen(true)
											}}
											className="apx-icon-action"
											aria-label={`Edit ${blog.title}`}
										>
											<Edit2 className="h-4 w-4" />
										</button>
										<button
											type="button"
											onClick={(event) => {
												event.stopPropagation()
												setPendingToggleId(blog.id)
												setConfirmConfig({
													title: blog.isPublished ? 'Unpublish Blog Post' : 'Publish Blog Post',
													description: `Set ${blog.title} as ${blog.isPublished ? 'draft' : 'published'}?`,
													confirmLabel: blog.isPublished ? 'Set Draft' : 'Publish',
													tone: 'primary',
													kind: 'toggle',
												})
												setConfirmOpen(true)
											}}
											className="apx-icon-action"
											style={blog.isPublished ? { borderColor: 'rgba(234, 88, 12, 0.45)', color: '#c2410c', backgroundColor: 'rgba(249, 115, 22, 0.08)' } : { borderColor: 'rgba(22, 163, 74, 0.5)', color: '#15803d', backgroundColor: 'rgba(22, 163, 74, 0.12)' }}
											aria-label={`Toggle status for ${blog.title}`}
										>
											<Power className="h-4 w-4" />
										</button>
										<button
											type="button"
											onClick={(event) => {
												event.stopPropagation()
												setPendingDeleteId(blog.id)
												setConfirmConfig({
													title: 'Delete Blog Post',
													description: `Delete ${blog.title}? This action cannot be undone.`,
													confirmLabel: 'Delete',
													tone: 'danger',
													kind: 'delete',
												})
												setConfirmOpen(true)
											}}
											className="apx-icon-action-danger"
											aria-label={`Delete ${blog.title}`}
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
				totalItems={sorted.length}
				perPage={perPage}
				rowsOptions={[10, 20, 50, 100]}
				onPerPageChange={(next) => {
					setPerPage(next)
					setPage(1)
				}}
				onPageChange={setPage}
			/>

			<ApexModal open={addOpen} size="xl" title="Add Blog Post" subtitle="Create a new blog post." onClose={() => setAddOpen(false)}>
				<form
					onSubmit={(event) => {
						event.preventDefault()
						setConfirmConfig({
							title: 'Create Blog Post',
							description: 'Save this blog post now?',
							confirmLabel: 'Create',
							tone: 'primary',
							kind: 'create',
						})
						setConfirmOpen(true)
					}}
					className="grid gap-3 md:grid-cols-2"
				>
					<div className="md:col-span-2">
						<ApexImageDropzone
							label="Cover Image"
							previewUrl={addImagePreview || addForm.image}
							onFileSelect={(file) => {
								setAddImageFile(file)
								setAddImagePreview(URL.createObjectURL(file))
							}}
						/>
					</div>

					{generatedImageCandidates.length > 1 ? (
						<div className="md:col-span-2">
							<label className="mb-1 block text-xs font-medium apx-muted">Generated Image Options</label>
							<div className="grid grid-cols-2 gap-2 md:grid-cols-5">
								{generatedImageCandidates.map((imageUrl) => (
									<button
										key={imageUrl}
										type="button"
										onClick={() => {
											setAddForm((prev) => ({ ...prev, image: imageUrl }))
											setAddImagePreview(imageUrl)
											setAddImageFile(null)
										}}
										className="overflow-hidden rounded-md border p-0"
										style={{ borderColor: addForm.image === imageUrl ? 'var(--apx-primary)' : 'var(--apx-border)' }}
									>
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img src={imageUrl} alt="Generated preview option" className="h-16 w-full object-cover" />
									</button>
								))}
							</div>
						</div>
					) : null}

					<div className="md:col-span-2">
						<label className="mb-1 block text-xs font-medium apx-muted">Title</label>
						<ApexInput
							required
							value={addForm.title}
							onChange={(event) => {
								const title = event.target.value
								setAddForm((prev) => ({ ...prev, title, slug: slugify(title) }))
							}}
						/>
					</div>

					{/* <div className="md:col-span-2">
						<label className="mb-1 block text-xs font-medium apx-muted">Slug (auto)</label>
						<ApexInput value={addForm.slug} readOnly />
					</div> */}

					<div>
						<label className="mb-1 block text-xs font-medium apx-muted">Category</label>
						<ApexDropdown
							value={addForm.category}
							onChange={(value) => setAddForm((prev) => ({ ...prev, category: value }))}
							options={[
								{ value: 'Tech', label: 'Tech' },
								{ value: 'Business', label: 'Business' },
								{ value: 'Academic', label: 'Academic' },
								{ value: 'Case Studies', label: 'Case Studies' },
							]}
						/>
					</div>

					<div>
						<label className="mb-1 block text-xs font-medium apx-muted">Author (Team Member)</label>
						<ApexDropdown value={addForm.teamMemberId} onChange={(value) => setAddForm((prev) => ({ ...prev, teamMemberId: value }))} options={teamDropdownOptions} />
					</div>

					<div>
						<label className="mb-1 block text-xs font-medium apx-muted">Date</label>
						<ApexInput type="date" value={addForm.publishedAt} onChange={(event) => setAddForm((prev) => ({ ...prev, publishedAt: event.target.value }))} />
					</div>

					<div>
						<label className="mb-1 block text-xs font-medium apx-muted">Status</label>
						<ApexDropdown value={addForm.status} onChange={(value) => setAddForm((prev) => ({ ...prev, status: value as 'published' | 'draft' }))} options={[{ value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft' }]} />
					</div>

					<div className="md:col-span-2">
						<label className="mb-1 block text-xs font-medium apx-muted">Read Time</label>
						<ApexInput value={addForm.readTime} onChange={(event) => setAddForm((prev) => ({ ...prev, readTime: event.target.value }))} placeholder="e.g. 8 min read" />
					</div>

					<div className="md:col-span-2">
						<label className="mb-1 block text-xs font-medium apx-muted">Excerpt</label>
						<ApexTextarea rows={3} value={addForm.excerpt} onChange={(event) => setAddForm((prev) => ({ ...prev, excerpt: event.target.value }))} />
					</div>

					<div>
						<label className="mb-1 block text-xs font-medium apx-muted">Tags (comma separated)</label>
						<ApexInput value={addForm.tags} onChange={(event) => setAddForm((prev) => ({ ...prev, tags: event.target.value }))} />
					</div>

					<div>
						<label className="mb-1 block text-xs font-medium apx-muted">Keywords (comma separated)</label>
						<ApexInput value={addForm.keywords} onChange={(event) => setAddForm((prev) => ({ ...prev, keywords: event.target.value }))} />
					</div>

					<div className="md:col-span-2">
						<label className="mb-1 block text-xs font-medium apx-muted">Content</label>
						<ApexTextarea rows={10} value={addForm.content} onChange={(event) => setAddForm((prev) => ({ ...prev, content: event.target.value }))} />
					</div>

					<div>
						<label className="mb-1 block text-xs font-medium apx-muted">Meta Title</label>
						<ApexInput value={addForm.metaTitle} onChange={(event) => setAddForm((prev) => ({ ...prev, metaTitle: event.target.value }))} />
					</div>

					<div>
						<label className="mb-1 block text-xs font-medium apx-muted">Meta Description</label>
						<ApexInput value={addForm.metaDescription} onChange={(event) => setAddForm((prev) => ({ ...prev, metaDescription: event.target.value }))} />
					</div>

					<div className="md:col-span-2 flex justify-end gap-2 pt-2">
						<ApexButton type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</ApexButton>
						<ApexButton
							type="button"
							variant="outline"
							onClick={() => {
								setConfirmConfig({
									title: 'Generate Blog Draft',
									description: `Generate an SEO blog draft for ${addForm.category}? This will overwrite current draft fields in this modal.`,
									confirmLabel: 'Generate',
									tone: 'primary',
									kind: 'generate',
								})
								setConfirmOpen(true)
							}}
							disabled={generatingBlog}
						>
							{generatingBlog ? 'Generating...' : 'Generate Blog'}
						</ApexButton>
						<ApexButton type="submit">Save Blog</ApexButton>
					</div>
				</form>
			</ApexModal>

			<ApexModal open={editOpen} size="xl" title="Edit Blog Post" subtitle="Update blog details." onClose={() => setEditOpen(false)}>
				<form
					onSubmit={(event) => {
						event.preventDefault()
						setConfirmConfig({
							title: 'Save Blog Changes',
							description: `Save changes to ${editForm.title || 'this post'}?`,
							confirmLabel: 'Save Changes',
							tone: 'primary',
							kind: 'update',
						})
						setConfirmOpen(true)
					}}
					className="grid gap-3 md:grid-cols-2"
				>
					<div className="md:col-span-2">
						<ApexImageDropzone
							label="Cover Image"
							previewUrl={editImagePreview || editForm.image}
							onFileSelect={(file) => {
								setEditImageFile(file)
								setEditImagePreview(URL.createObjectURL(file))
							}}
						/>
					</div>

					<div className="md:col-span-2">
						<label className="mb-1 block text-xs font-medium apx-muted">Title</label>
						<ApexInput
							required
							value={editForm.title}
							onChange={(event) => {
								const title = event.target.value
								setEditForm((prev) => ({ ...prev, title, slug: slugify(title) }))
							}}
						/>
					</div>

					{/* <div className="md:col-span-2">
						<label className="mb-1 block text-xs font-medium apx-muted">Slug (auto)</label>
						<ApexInput value={editForm.slug} readOnly />
					</div> */}

					<div>
						<label className="mb-1 block text-xs font-medium apx-muted">Category</label>
						<ApexDropdown value={editForm.category} onChange={(value) => setEditForm((prev) => ({ ...prev, category: value }))} options={[{ value: 'Tech', label: 'Tech' }, { value: 'Business', label: 'Business' }, { value: 'Academic', label: 'Academic' }, { value: 'Case Studies', label: 'Case Studies' }]} />
					</div>

					<div>
						<label className="mb-1 block text-xs font-medium apx-muted">Author (Team Member)</label>
						<ApexDropdown value={editForm.teamMemberId} onChange={(value) => setEditForm((prev) => ({ ...prev, teamMemberId: value }))} options={teamDropdownOptions} />
					</div>

					<div>
						<label className="mb-1 block text-xs font-medium apx-muted">Date</label>
						<ApexInput type="date" value={editForm.publishedAt} onChange={(event) => setEditForm((prev) => ({ ...prev, publishedAt: event.target.value }))} />
					</div>

					<div>
						<label className="mb-1 block text-xs font-medium apx-muted">Status</label>
						<ApexDropdown value={editForm.status} onChange={(value) => setEditForm((prev) => ({ ...prev, status: value as 'published' | 'draft' }))} options={[{ value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft' }]} />
					</div>

					<div className="md:col-span-2">
						<label className="mb-1 block text-xs font-medium apx-muted">Read Time</label>
						<ApexInput value={editForm.readTime} onChange={(event) => setEditForm((prev) => ({ ...prev, readTime: event.target.value }))} />
					</div>

					<div className="md:col-span-2">
						<label className="mb-1 block text-xs font-medium apx-muted">Excerpt</label>
						<ApexTextarea rows={3} value={editForm.excerpt} onChange={(event) => setEditForm((prev) => ({ ...prev, excerpt: event.target.value }))} />
					</div>

					<div>
						<label className="mb-1 block text-xs font-medium apx-muted">Tags (comma separated)</label>
						<ApexInput value={editForm.tags} onChange={(event) => setEditForm((prev) => ({ ...prev, tags: event.target.value }))} />
					</div>

					<div>
						<label className="mb-1 block text-xs font-medium apx-muted">Keywords (comma separated)</label>
						<ApexInput value={editForm.keywords} onChange={(event) => setEditForm((prev) => ({ ...prev, keywords: event.target.value }))} />
					</div>

					<div className="md:col-span-2">
						<label className="mb-1 block text-xs font-medium apx-muted">Content</label>
						<ApexTextarea rows={10} value={editForm.content} onChange={(event) => setEditForm((prev) => ({ ...prev, content: event.target.value }))} />
					</div>

					<div>
						<label className="mb-1 block text-xs font-medium apx-muted">Meta Title</label>
						<ApexInput value={editForm.metaTitle} onChange={(event) => setEditForm((prev) => ({ ...prev, metaTitle: event.target.value }))} />
					</div>

					<div>
						<label className="mb-1 block text-xs font-medium apx-muted">Meta Description</label>
						<ApexInput value={editForm.metaDescription} onChange={(event) => setEditForm((prev) => ({ ...prev, metaDescription: event.target.value }))} />
					</div>

					<div className="md:col-span-2 flex justify-end gap-2 pt-2">
						<ApexButton type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</ApexButton>
						<ApexButton type="submit">Save Changes</ApexButton>
					</div>
				</form>
			</ApexModal>

			<ApexModal open={viewOpen} size="lg" title="View Blog Post" subtitle={selectedBlog?.title || ''} onClose={() => setViewOpen(false)}>
				{selectedBlog ? (
					<div className="space-y-3 text-sm">
						<div className="overflow-hidden rounded-md border" style={{ borderColor: 'var(--apx-border)' }}>
							{selectedBlog.image ? (
								// eslint-disable-next-line @next/next/no-img-element
								<img src={selectedBlog.image} alt={selectedBlog.title} className="h-56 w-full object-contain" />
							) : (
								<div className="flex h-56 w-full items-center justify-center apx-muted">No image</div>
							)}
						</div>
						<div><p className="text-xs uppercase tracking-wide apx-muted">Title</p><p className="mt-1 apx-text">{selectedBlog.title}</p></div>
						<div><p className="text-xs uppercase tracking-wide apx-muted">Slug</p><p className="mt-1 apx-text">{selectedBlog.slug}</p></div>
						<div className="grid gap-3 md:grid-cols-3">
							<div><p className="text-xs uppercase tracking-wide apx-muted">Category</p><p className="mt-1 apx-text">{selectedBlog.category || '-'}</p></div>
							<div><p className="text-xs uppercase tracking-wide apx-muted">Date</p><p className="mt-1 apx-text">{selectedBlog.publishedAt || '-'}</p></div>
							<div><p className="text-xs uppercase tracking-wide apx-muted">Status</p><p className="mt-1 apx-text">{selectedBlog.isPublished ? 'Published' : 'Draft'}</p></div>
						</div>
						<div><p className="text-xs uppercase tracking-wide apx-muted">Author</p><p className="mt-1 apx-text">{selectedBlog.authorName || '-'}</p></div>
						<div><p className="text-xs uppercase tracking-wide apx-muted">Excerpt</p><p className="mt-1 whitespace-pre-wrap apx-text">{selectedBlog.excerpt || '-'}</p></div>
						<div><p className="text-xs uppercase tracking-wide apx-muted">Content</p><p className="mt-1 whitespace-pre-wrap apx-text">{selectedBlog.content || '-'}</p></div>
						<div><p className="text-xs uppercase tracking-wide apx-muted">Tags</p><p className="mt-1 apx-text">{(selectedBlog.tags || []).join(', ') || '-'}</p></div>
						<div><p className="text-xs uppercase tracking-wide apx-muted">Keywords</p><p className="mt-1 apx-text">{(selectedBlog.keywords || []).join(', ') || '-'}</p></div>
						<div><p className="text-xs uppercase tracking-wide apx-muted">Related Posts (Auto)</p><p className="mt-1 apx-text">{(selectedBlog.relatedPosts || []).join(', ') || '-'}</p></div>
					</div>
				) : null}
			</ApexModal>

			<ApexConfirmationModal
				open={confirmOpen}
				title={confirmConfig?.title || 'Confirm action'}
				description={confirmConfig?.description || ''}
				confirmLabel={confirmConfig?.confirmLabel || 'Confirm'}
				tone={confirmConfig?.tone || 'primary'}
				pending={pending}
				onConfirm={runConfirmed}
				onClose={() => {
					if (pending) return
					setConfirmOpen(false)
					setConfirmConfig(null)
				}}
			/>
		</div>
	)
}

