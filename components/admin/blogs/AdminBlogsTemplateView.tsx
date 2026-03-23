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

type BlogRow = {
  id: string
  slug: string
  title: string
  category: string
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
  updatedAt: string | null
}

type ColumnKey = 'title' | 'category' | 'author' | 'status' | 'updated' | 'actions'
type SortKey = Exclude<ColumnKey, 'actions'>

type BlogFormState = {
  id?: string
  slug: string
  title: string
  category: string
  authorName: string
  authorRole: string
  authorAvatar: string
  date: string
  readTime: string
  image: string
  excerpt: string
  tags: string
  keywords: string
  relatedPosts: string
  content: string
  metaTitle: string
  metaDescription: string
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

const defaultForm: BlogFormState = {
  slug: '',
  title: '',
  category: '',
  authorName: '',
  authorRole: '',
  authorAvatar: '',
  date: '',
  readTime: '',
  image: '',
  excerpt: '',
  tags: '',
  keywords: '',
  relatedPosts: '',
  content: '',
  metaTitle: '',
  metaDescription: '',
  status: 'active',
}

export default function AdminBlogsTemplateView({
  blogs,
  createBlogAction,
  updateBlogAction,
  deleteBlogAction,
  bulkDeleteBlogsAction,
  bulkSetInactiveBlogsAction,
  toggleBlogActiveAction,
}: {
  blogs: BlogRow[]
  createBlogAction: (formData: FormData) => Promise<void>
  updateBlogAction: (formData: FormData) => Promise<void>
  deleteBlogAction: (formData: FormData) => Promise<void>
  bulkDeleteBlogsAction: (formData: FormData) => Promise<void>
  bulkSetInactiveBlogsAction: (formData: FormData) => Promise<void>
  toggleBlogActiveAction: (formData: FormData) => Promise<void>
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
  const [pendingToggleBlog, setPendingToggleBlog] = useState<BlogRow | null>(null)
  const [selectedBlog, setSelectedBlog] = useState<BlogRow | null>(null)
  const [addForm, setAddForm] = useState<BlogFormState>(defaultForm)
  const [editForm, setEditForm] = useState<BlogFormState>({ ...defaultForm, id: '' })
  const [toasts, setToasts] = useState<ApexToast[]>([])
  const [columns, setColumns] = useState<Record<ColumnKey, boolean>>({
    title: true,
    category: true,
    author: true,
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
    return blogs.filter((blog) => {
      const statusMatch = status === 'all' ? true : status === 'active' ? blog.isPublished : !blog.isPublished
      const searchMatch = keyword.length === 0 ? true : [blog.title, blog.slug, blog.category, blog.authorName].join(' ').toLowerCase().includes(keyword)
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
    const activeCount = blogs.filter((blog) => blog.isPublished).length
    return { all: blogs.length, active: activeCount, inactive: blogs.length - activeCount }
  }, [blogs])

  const currentPageIds = paged.map((blog) => blog.id)
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

  function toFormData(form: BlogFormState): FormData {
    const formData = new FormData()
    if (form.id) formData.set('id', form.id)
    formData.set('slug', form.slug)
    formData.set('title', form.title)
    formData.set('category', form.category)
    formData.set('authorName', form.authorName)
    formData.set('authorRole', form.authorRole)
    formData.set('authorAvatar', form.authorAvatar)
    formData.set('date', form.date)
    formData.set('readTime', form.readTime)
    formData.set('image', form.image)
    formData.set('excerpt', form.excerpt)
    formData.set('tags', form.tags)
    formData.set('keywords', form.keywords)
    formData.set('relatedPosts', form.relatedPosts)
    formData.set('content', form.content)
    formData.set('metaTitle', form.metaTitle)
    formData.set('metaDescription', form.metaDescription)
    formData.set('status', form.status)
    return formData
  }

  function openEditModal(blog: BlogRow) {
    setSelectedBlog(blog)
    setEditForm({
      id: blog.id,
      slug: blog.slug,
      title: blog.title,
      category: blog.category,
      authorName: blog.authorName,
      authorRole: blog.authorRole,
      authorAvatar: blog.authorAvatar,
      date: blog.publishedAt,
      readTime: blog.readTime,
      image: blog.image,
      excerpt: blog.excerpt,
      tags: (blog.tags ?? []).join(', '),
      keywords: (blog.keywords ?? []).join(', '),
      relatedPosts: (blog.relatedPosts ?? []).join(', '),
      content: blog.content,
      metaTitle: blog.metaTitle,
      metaDescription: blog.metaDescription,
      status: blog.isPublished ? 'active' : 'inactive',
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
    const rows = sorted.map((item) => [item.title, item.slug, item.category, item.authorName, item.isPublished ? 'Active' : 'Inactive', toRelative(item.updatedAt)])
    downloadCsv('blogs-export.csv', [['Title', 'Slug', 'Category', 'Author', 'Status', 'Last Updated'], ...rows])
    addToast('Blogs CSV exported', 'success')
  }

  async function executeConfirmedAction() {
    if (!confirmConfig) return
    setPendingAction(true)

    try {
      if (confirmConfig.kind === 'add') {
        await createBlogAction(toFormData(addForm))
        setAddOpen(false)
        setAddForm(defaultForm)
        addToast('Blog created successfully', 'success')
      }

      if (confirmConfig.kind === 'edit') {
        await updateBlogAction(toFormData(editForm))
        setEditOpen(false)
        addToast('Blog updated successfully', 'success')
      }

      if (confirmConfig.kind === 'delete' && selectedBlog) {
        const formData = new FormData()
        formData.set('id', selectedBlog.id)
        await deleteBlogAction(formData)
        addToast('Blog deleted', 'success')
      }

      if (confirmConfig.kind === 'bulkDelete') {
        const formData = new FormData()
        formData.set('ids', selectedIds.join(','))
        await bulkDeleteBlogsAction(formData)
        setSelectedIds([])
        addToast('Selected blogs deleted', 'success')
      }

      if (confirmConfig.kind === 'bulkInactive') {
        const formData = new FormData()
        formData.set('ids', selectedIds.join(','))
        await bulkSetInactiveBlogsAction(formData)
        setSelectedIds([])
        addToast('Selected blogs set to inactive', 'success')
      }

      if (confirmConfig.kind === 'toggleActive' && pendingToggleBlog) {
        const formData = new FormData()
        formData.set('id', pendingToggleBlog.id)
        await toggleBlogActiveAction(formData)
        addToast(`Blog marked ${pendingToggleBlog.isPublished ? 'inactive' : 'active'}`, 'success')
        setPendingToggleBlog(null)
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
      <ApexBreadcrumbs items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Blogs' }]} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[42px] leading-none font-bold tracking-tight apx-text">Blogs</h1>
          <p className="mt-1 text-sm apx-muted">Edit content, metadata, and author information.</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-0.5" style={{ backgroundColor: 'var(--apx-primary)' }}><Plus className="h-4 w-4" />Add Blog</button>
      </div>

      <ApexStatusTabs tabs={[{ key: 'all', label: 'All', count: counts.all }, { key: 'active', label: 'Active', count: counts.active }, { key: 'inactive', label: 'Inactive', count: counts.inactive }]} active={status} onChange={(key) => { setStatus(key as 'all' | 'active' | 'inactive'); setPage(1) }} />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:max-w-md"><ApexSearchField value={search} onChange={(value) => { setSearch(value); setPage(1) }} placeholder="Search blogs..." /></div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {selectedIds.length > 0 ? (
            <>
              <ApexButton type="button" variant="outline" className="whitespace-nowrap" onClick={() => { setConfirmConfig({ title: 'Set Blogs Inactive', description: `Set ${selectedIds.length} selected blog(s) to inactive?`, label: 'Set Inactive', tone: 'primary', kind: 'bulkInactive' }); setConfirmOpen(true) }}><Power className="h-4 w-4" />Set Inactive</ApexButton>
              <ApexButton type="button" variant="danger" className="whitespace-nowrap" onClick={() => { setConfirmConfig({ title: 'Delete Selected Blogs', description: `Delete ${selectedIds.length} selected blog(s)? This action cannot be undone.`, label: 'Delete', tone: 'danger', kind: 'bulkDelete' }); setConfirmOpen(true) }}><Trash2 className="h-4 w-4" />Delete Selected</ApexButton>
            </>
          ) : null}

          <ApexColumnsToggle columns={[{ key: 'title', label: 'Blog', visible: columns.title }, { key: 'category', label: 'Category', visible: columns.category }, { key: 'author', label: 'Author', visible: columns.author }, { key: 'status', label: 'Status', visible: columns.status }, { key: 'updated', label: 'Last Updated', visible: columns.updated }, { key: 'actions', label: 'Actions', visible: columns.actions }]} onToggle={toggleColumn} />
          <ApexExportButton onClick={exportCsv} />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--apx-border)' }}>
              <th className="w-10 px-2 py-3"><ApexCheckbox checked={allCurrentPageSelected} onChange={toggleSelectAllCurrentPage} ariaLabel="Select all current page blogs" /></th>
              {columns.title ? <th className="px-4 py-3 font-semibold apx-text"><button onClick={() => onSort('title')} className="inline-flex items-center gap-1.5" type="button">Blog{renderSortIcon('title')}</button></th> : null}
              {columns.category ? <th className="px-4 py-3 font-semibold apx-text"><button onClick={() => onSort('category')} className="inline-flex items-center gap-1.5" type="button">Category{renderSortIcon('category')}</button></th> : null}
              {columns.author ? <th className="px-4 py-3 font-semibold apx-text"><button onClick={() => onSort('author')} className="inline-flex items-center gap-1.5" type="button">Author{renderSortIcon('author')}</button></th> : null}
              {columns.status ? <th className="px-4 py-3 font-semibold apx-text"><button onClick={() => onSort('status')} className="inline-flex items-center gap-1.5" type="button">Status{renderSortIcon('status')}</button></th> : null}
              {columns.updated ? <th className="px-4 py-3 font-semibold apx-text"><button onClick={() => onSort('updated')} className="inline-flex items-center gap-1.5" type="button">Last Updated{renderSortIcon('updated')}</button></th> : null}
              {columns.actions ? <th className="px-4 py-3 text-right font-semibold apx-text">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {paged.map((blog) => (
              <tr key={blog.id} onClick={() => { setSelectedBlog(blog); setViewOpen(true) }} className={['apx-table-row cursor-pointer border-b last:border-b-0', selectedIds.includes(blog.id) ? 'apx-table-row-selected' : ''].join(' ').trim()} style={{ borderColor: 'var(--apx-border)' }}>
                <td className="px-2 py-3"><div onClick={(event) => event.stopPropagation()}><ApexCheckbox checked={selectedIds.includes(blog.id)} onChange={() => toggleSelectOne(blog.id)} ariaLabel={`Select ${blog.title}`} /></div></td>
                {columns.title ? <td className="px-4 py-3"><p className="font-semibold apx-text">{blog.title}</p><p className="text-xs apx-muted">{blog.slug}</p></td> : null}
                {columns.category ? <td className="px-4 py-3 apx-text">{blog.category || '-'}</td> : null}
                {columns.author ? <td className="px-4 py-3 apx-text">{blog.authorName || '-'}</td> : null}
                {columns.status ? <td className="px-4 py-3"><span className="inline-flex rounded-full px-2 py-1 text-xs font-semibold" style={blog.isPublished ? { backgroundColor: 'rgba(22,163,74,0.15)', color: '#15803d' } : { backgroundColor: 'rgba(100,116,139,0.2)', color: '#334155' }}>{blog.isPublished ? 'Active' : 'Inactive'}</span></td> : null}
                {columns.updated ? <td className="px-4 py-3 apx-muted">{toRelative(blog.updatedAt)}</td> : null}
                {columns.actions ? (
                  <td className="px-4 py-3"><div className="flex items-center justify-end gap-2">
                    <button type="button" onClick={(event) => { event.stopPropagation(); openEditModal(blog) }} className="apx-icon-action" aria-label={`Edit ${blog.title}`}><Edit2 className="apx-muted" /></button>
                    <button type="button" onClick={(event) => {
                      event.stopPropagation()
                      setPendingToggleBlog(blog)
                      setConfirmConfig({ title: blog.isPublished ? 'Deactivate Blog' : 'Activate Blog', description: `Set ${blog.title} as ${blog.isPublished ? 'inactive' : 'active'}?`, label: blog.isPublished ? 'Deactivate' : 'Activate', tone: 'primary', kind: 'toggleActive' })
                      setConfirmOpen(true)
                    }} className="apx-icon-action" style={blog.isPublished ? { borderColor: 'rgba(234, 88, 12, 0.45)', color: '#c2410c', backgroundColor: 'rgba(249, 115, 22, 0.08)' } : { borderColor: 'rgba(22, 163, 74, 0.5)', color: '#15803d', backgroundColor: 'rgba(22, 163, 74, 0.12)' }} aria-label={`Toggle ${blog.title} status`}><Power className="h-4 w-4" /></button>
                    <button type="button" onClick={(event) => {
                      event.stopPropagation()
                      setSelectedBlog(blog)
                      setConfirmConfig({ title: 'Delete Blog', description: `Delete ${blog.title}? This action cannot be undone.`, label: 'Delete', tone: 'danger', kind: 'delete' })
                      setConfirmOpen(true)
                    }} className="apx-icon-action-danger" aria-label={`Delete ${blog.title}`}><Trash2 /></button>
                  </div></td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ApexPagination page={safePage} totalPages={totalPages} totalItems={sorted.length} perPage={perPage} rowsOptions={[10, 20, 50, 100]} onPerPageChange={(next) => { setPerPage(next); setPage(1) }} onPageChange={setPage} />

      <ApexModal size="sm" open={addOpen} title="Add Blog" subtitle="Create a blog post entry." onClose={() => setAddOpen(false)}>
        <form onSubmit={(event) => {
          event.preventDefault()
          setConfirmConfig({ title: 'Confirm Add Blog', description: `Add ${addForm.title || 'this blog'}?`, label: 'Add Blog', tone: 'primary', kind: 'add' })
          setConfirmOpen(true)
        }} className="space-y-3">
          <ApexInput value={addForm.slug} onChange={(event) => setAddForm((prev) => ({ ...prev, slug: event.target.value }))} placeholder="Slug" required />
          <ApexInput value={addForm.title} onChange={(event) => setAddForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="Title" required />
          <ApexInput value={addForm.category} onChange={(event) => setAddForm((prev) => ({ ...prev, category: event.target.value }))} placeholder="Category" />
          <ApexInput value={addForm.date} onChange={(event) => setAddForm((prev) => ({ ...prev, date: event.target.value }))} placeholder="Published date" />
          <ApexInput value={addForm.readTime} onChange={(event) => setAddForm((prev) => ({ ...prev, readTime: event.target.value }))} placeholder="Read time" />
          <ApexInput value={addForm.image} onChange={(event) => setAddForm((prev) => ({ ...prev, image: event.target.value }))} placeholder="Image URL" />
          <ApexInput value={addForm.authorName} onChange={(event) => setAddForm((prev) => ({ ...prev, authorName: event.target.value }))} placeholder="Author name" />
          <ApexInput value={addForm.authorRole} onChange={(event) => setAddForm((prev) => ({ ...prev, authorRole: event.target.value }))} placeholder="Author role" />
          <ApexInput value={addForm.authorAvatar} onChange={(event) => setAddForm((prev) => ({ ...prev, authorAvatar: event.target.value }))} placeholder="Author avatar" />
          <ApexTextarea value={addForm.excerpt} onChange={(event) => setAddForm((prev) => ({ ...prev, excerpt: event.target.value }))} rows={2} placeholder="Excerpt" />
          <ApexInput value={addForm.tags} onChange={(event) => setAddForm((prev) => ({ ...prev, tags: event.target.value }))} placeholder="Tags (comma-separated)" />
          <ApexInput value={addForm.keywords} onChange={(event) => setAddForm((prev) => ({ ...prev, keywords: event.target.value }))} placeholder="Keywords (comma-separated)" />
          <ApexInput value={addForm.relatedPosts} onChange={(event) => setAddForm((prev) => ({ ...prev, relatedPosts: event.target.value }))} placeholder="Related posts (comma-separated)" />
          <ApexTextarea value={addForm.content} onChange={(event) => setAddForm((prev) => ({ ...prev, content: event.target.value }))} rows={6} placeholder="Content" />
          <ApexInput value={addForm.metaTitle} onChange={(event) => setAddForm((prev) => ({ ...prev, metaTitle: event.target.value }))} placeholder="Meta title" />
          <ApexInput value={addForm.metaDescription} onChange={(event) => setAddForm((prev) => ({ ...prev, metaDescription: event.target.value }))} placeholder="Meta description" />
          <ApexDropdown value={addForm.status} onChange={(value) => setAddForm((prev) => ({ ...prev, status: value as 'active' | 'inactive' }))} options={[...statusOptions]} placeholder="Select status" />
          <div className="flex justify-end gap-2 pt-2"><ApexButton type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</ApexButton><ApexButton type="submit">Save Blog</ApexButton></div>
        </form>
      </ApexModal>

      <ApexModal size="sm" open={editOpen} title="Edit Blog" subtitle="Update blog details." onClose={() => setEditOpen(false)}>
        <form onSubmit={(event) => {
          event.preventDefault()
          setConfirmConfig({ title: 'Confirm Edit Blog', description: `Save changes for ${editForm.title || 'this blog'}?`, label: 'Save Changes', tone: 'primary', kind: 'edit' })
          setConfirmOpen(true)
        }} className="space-y-3">
          <ApexInput value={editForm.slug} onChange={(event) => setEditForm((prev) => ({ ...prev, slug: event.target.value }))} placeholder="Slug" required />
          <ApexInput value={editForm.title} onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="Title" required />
          <ApexInput value={editForm.category} onChange={(event) => setEditForm((prev) => ({ ...prev, category: event.target.value }))} placeholder="Category" />
          <ApexInput value={editForm.date} onChange={(event) => setEditForm((prev) => ({ ...prev, date: event.target.value }))} placeholder="Published date" />
          <ApexInput value={editForm.readTime} onChange={(event) => setEditForm((prev) => ({ ...prev, readTime: event.target.value }))} placeholder="Read time" />
          <ApexInput value={editForm.image} onChange={(event) => setEditForm((prev) => ({ ...prev, image: event.target.value }))} placeholder="Image URL" />
          <ApexInput value={editForm.authorName} onChange={(event) => setEditForm((prev) => ({ ...prev, authorName: event.target.value }))} placeholder="Author name" />
          <ApexInput value={editForm.authorRole} onChange={(event) => setEditForm((prev) => ({ ...prev, authorRole: event.target.value }))} placeholder="Author role" />
          <ApexInput value={editForm.authorAvatar} onChange={(event) => setEditForm((prev) => ({ ...prev, authorAvatar: event.target.value }))} placeholder="Author avatar" />
          <ApexTextarea value={editForm.excerpt} onChange={(event) => setEditForm((prev) => ({ ...prev, excerpt: event.target.value }))} rows={2} placeholder="Excerpt" />
          <ApexInput value={editForm.tags} onChange={(event) => setEditForm((prev) => ({ ...prev, tags: event.target.value }))} placeholder="Tags (comma-separated)" />
          <ApexInput value={editForm.keywords} onChange={(event) => setEditForm((prev) => ({ ...prev, keywords: event.target.value }))} placeholder="Keywords (comma-separated)" />
          <ApexInput value={editForm.relatedPosts} onChange={(event) => setEditForm((prev) => ({ ...prev, relatedPosts: event.target.value }))} placeholder="Related posts (comma-separated)" />
          <ApexTextarea value={editForm.content} onChange={(event) => setEditForm((prev) => ({ ...prev, content: event.target.value }))} rows={6} placeholder="Content" />
          <ApexInput value={editForm.metaTitle} onChange={(event) => setEditForm((prev) => ({ ...prev, metaTitle: event.target.value }))} placeholder="Meta title" />
          <ApexInput value={editForm.metaDescription} onChange={(event) => setEditForm((prev) => ({ ...prev, metaDescription: event.target.value }))} placeholder="Meta description" />
          <ApexDropdown value={editForm.status} onChange={(value) => setEditForm((prev) => ({ ...prev, status: value as 'active' | 'inactive' }))} options={[...statusOptions]} placeholder="Select status" />
          <div className="flex justify-end gap-2 pt-2"><ApexButton type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</ApexButton><ApexButton type="submit">Save Changes</ApexButton></div>
        </form>
      </ApexModal>

      <ApexModal size="sm" open={viewOpen && !!selectedBlog} title="View Blog" subtitle="Read-only blog details." onClose={() => setViewOpen(false)}>
        {selectedBlog ? (
          <div className="space-y-3">
            <div><p className="text-xs uppercase tracking-wider apx-muted">Title</p><p className="mt-1 text-sm font-medium apx-text">{selectedBlog.title}</p></div>
            <div><p className="text-xs uppercase tracking-wider apx-muted">Slug</p><p className="mt-1 text-sm font-medium apx-text">{selectedBlog.slug}</p></div>
            <div><p className="text-xs uppercase tracking-wider apx-muted">Author</p><p className="mt-1 text-sm font-medium apx-text">{selectedBlog.authorName || '-'}</p></div>
            <div><p className="text-xs uppercase tracking-wider apx-muted">Status</p><p className="mt-1 text-sm font-medium apx-text">{selectedBlog.isPublished ? 'Active' : 'Inactive'}</p></div>
            <div><p className="text-xs uppercase tracking-wider apx-muted">Last Updated</p><p className="mt-1 text-sm font-medium apx-text">{toRelative(selectedBlog.updatedAt)}</p></div>
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
