'use client'

import { useMemo, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Edit2,
  GripVertical,
  Plus,
  Power,
  Star,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { ApexButton, ApexInput, ApexTextarea } from '@/components/admin/apex/AdminPrimitives'
import {
  ApexBlockingSpinner,
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

type ProjectRow = {
  id: string
  slug: string
  title: string
  systemType: string
  industry: string
  image: string
  shortDesc: string
  categories: string[]
  tags: string[]
  details: unknown
  isFeatured: boolean
  featureOrder: number
  isPublished: boolean
  updatedAt: string | null
}

type ColumnKey = 'project' | 'type' | 'industry' | 'category' | 'order' | 'status' | 'actions'
type SortKey = 'project' | 'type' | 'industry' | 'category' | 'order' | 'status'
type StatusFilter = 'all' | 'featured' | 'active' | 'inactive'

type ProjectImageItem = {
  id: string
  source: 'existing' | 'new'
  url: string
  file?: File
}

type ResultPair = { value: string; metric: string }

type ProjectFormState = {
  id?: string
  title: string
  systemType: string
  industry: string
  categories: string[]
  shortDesc: string
  tags: string
  technologies: string
  status: 'active' | 'inactive'
  positionOrder: number
  isFeatured: boolean
  featureOrder: number
  problem: string
  overview: string
  solution: string
  results: ResultPair[]
  features: string[]
  testimonialAuthor: string
  testimonialRole: string
  testimonialQuote: string
  imageItems: ProjectImageItem[]
  selectedPrimaryImageId: string
  baseDetails: string
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

function readPositionOrder(details: unknown) {
  if (!details || typeof details !== 'object') return 999
  const raw = (details as Record<string, unknown>).positionOrder
  const value = Number(raw)
  return Number.isInteger(value) && value > 0 ? value : 999
}

function readPositionOrderForDefault(details: unknown) {
  if (!details || typeof details !== 'object') return null
  const raw = (details as Record<string, unknown>).positionOrder
  const value = Number(raw)
  return Number.isInteger(value) && value > 0 ? value : null
}

function toProjectOrderValue(project: ProjectRow) {
  return readPositionOrder(project.details)
}

function getDetailsObject(details: unknown) {
  if (!details || typeof details !== 'object') return {}
  return details as Record<string, unknown>
}

function getDetailsImages(project: ProjectRow) {
  const details = getDetailsObject(project.details)
  const images = Array.isArray(details.images)
    ? details.images.map((item) => String(item)).filter(Boolean)
    : []
  if (images.length > 0) return images
  return project.image ? [project.image] : []
}

function getDetailsFeatures(project: ProjectRow) {
  const details = getDetailsObject(project.details)
  return Array.isArray(details.features)
    ? details.features.map((item) => String(item)).filter(Boolean)
    : []
}

function getDetailsTechnologies(project: ProjectRow) {
  const details = getDetailsObject(project.details)
  return Array.isArray(details.technologies)
    ? details.technologies.map((item) => String(item)).filter(Boolean)
    : []
}

function getDetailsResults(project: ProjectRow): ResultPair[] {
  const details = getDetailsObject(project.details)
  const rows = Array.isArray(details.results)
    ? details.results
        .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
        .map((item) => ({
          value: String(item.value ?? '').trim(),
          metric: String(item.metric ?? '').trim(),
        }))
        .filter((item) => item.value || item.metric)
    : []

  const normalized = [...rows]
  while (normalized.length < 4) normalized.push({ value: '', metric: '' })
  return normalized.slice(0, 4)
}

function getDetailsTestimonial(project: ProjectRow) {
  const details = getDetailsObject(project.details)
  const testimonial = details.testimonial && typeof details.testimonial === 'object'
    ? (details.testimonial as Record<string, unknown>)
    : {}

  return {
    author: String(testimonial.author ?? '').trim(),
    role: String(testimonial.role ?? '').trim(),
    quote: String(testimonial.quote ?? '').trim(),
  }
}

function parseTags(tags: string[]) {
  return tags.join(', ')
}

function normalizeFeatureOrder(project: ProjectRow) {
  return Number.isInteger(project.featureOrder) && project.featureOrder > 0 ? project.featureOrder : 1
}

function defaultForm(positionOrder = 1, featureOrder = 1): ProjectFormState {
  return {
    title: '',
    systemType: '',
    industry: '',
    categories: [],
    shortDesc: '',
    tags: '',
    technologies: '',
    status: 'active',
    positionOrder,
    isFeatured: false,
    featureOrder,
    problem: '',
    overview: '',
    solution: '',
    results: [
      { value: '', metric: '' },
      { value: '', metric: '' },
      { value: '', metric: '' },
      { value: '', metric: '' },
    ],
    features: ['', ''],
    testimonialAuthor: '',
    testimonialRole: '',
    testimonialQuote: '',
    imageItems: [],
    selectedPrimaryImageId: '',
    baseDetails: '{}',
  }
}

function formFromProject(project: ProjectRow): ProjectFormState {
  const details = getDetailsObject(project.details)
  const detailsImages = getDetailsImages(project)
  const imageItems = detailsImages.map((url, index) => ({
    id: `existing-${project.id}-${index}`,
    source: 'existing' as const,
    url,
  }))
  const selectedPrimary = imageItems.find((item) => item.url === project.image)?.id || imageItems[0]?.id || ''
  const testimonial = getDetailsTestimonial(project)
  const features = getDetailsFeatures(project)
  const technologies = getDetailsTechnologies(project)

  return {
    id: project.id,
    title: project.title,
    systemType: project.systemType,
    industry: project.industry,
    categories: project.categories ?? [],
    shortDesc: project.shortDesc,
    tags: parseTags(project.tags ?? []),
    technologies: technologies.join(', '),
    status: project.isPublished ? 'active' : 'inactive',
    positionOrder: toProjectOrderValue(project),
    isFeatured: project.isFeatured,
    featureOrder: normalizeFeatureOrder(project),
    problem: String(details.problem ?? ''),
    overview: String(details.overview ?? ''),
    solution: String(details.solution ?? ''),
    results: getDetailsResults(project),
    features: features.length > 0 ? features : ['', ''],
    testimonialAuthor: testimonial.author,
    testimonialRole: testimonial.role,
    testimonialQuote: testimonial.quote,
    imageItems,
    selectedPrimaryImageId: selectedPrimary,
    baseDetails: JSON.stringify(details),
  }
}

function readErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message
  return 'Action failed. Please try again.'
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

function moveItem<T>(items: T[], from: number, to: number) {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return items
  const clone = [...items]
  const [picked] = clone.splice(from, 1)
  clone.splice(to, 0, picked)
  return clone
}

function ProjectFormModal({
  title,
  subtitle,
  open,
  form,
  categories,
  pending,
  onClose,
  onSubmit,
  onChange,
}: {
  title: string
  subtitle: string
  open: boolean
  form: ProjectFormState
  categories: string[]
  pending: boolean
  onClose: () => void
  onSubmit: () => void
  onChange: (next: ProjectFormState) => void
}) {
  const [dragOver, setDragOver] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [stepError, setStepError] = useState('')

  const selectedImage = form.imageItems[previewIndex] || null

  function addFiles(files: FileList | File[]) {
    const nextItems: ProjectImageItem[] = []
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return
      const url = URL.createObjectURL(file)
      nextItems.push({
        id: `new-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        source: 'new',
        file,
        url,
      })
    })

    if (nextItems.length === 0) return

    const merged = [...form.imageItems, ...nextItems]
    const selectedPrimaryImageId = form.selectedPrimaryImageId || merged[0]?.id || ''
    onChange({ ...form, imageItems: merged, selectedPrimaryImageId })
  }

  function removeImage(id: string) {
    const filtered = form.imageItems.filter((item) => item.id !== id)
    const selectedPrimaryImageId = filtered.find((item) => item.id === form.selectedPrimaryImageId)
      ? form.selectedPrimaryImageId
      : filtered[0]?.id || ''
    onChange({ ...form, imageItems: filtered, selectedPrimaryImageId })
    setPreviewIndex((prev) => {
      if (filtered.length === 0) return 0
      return Math.min(prev, filtered.length - 1)
    })
  }

  function moveImageByIndex(from: number, to: number) {
    const reordered = moveItem(form.imageItems, from, to)
    onChange({ ...form, imageItems: reordered })
    setPreviewIndex((prev) => Math.min(prev, reordered.length - 1))
  }

  function toggleCategory(category: string) {
    const exists = form.categories.includes(category)
    const categoriesNext = exists
      ? form.categories.filter((item) => item !== category)
      : [...form.categories, category]
    onChange({ ...form, categories: categoriesNext })
  }

  function validateStep(targetStep: 1 | 2 | 3) {
    if (targetStep === 1) {
      if (form.imageItems.length === 0) return 'Project images are required.'
      if (!form.selectedPrimaryImageId) return 'Please select a card image.'
      if (!form.title.trim()) return 'Title is required.'
      if (!form.systemType.trim()) return 'System Type is required.'
      if (!form.industry.trim()) return 'Industry is required.'
      if (form.categories.length === 0) return 'At least one category is required.'
      return ''
    }

    if (targetStep === 2) {
      if (!form.shortDesc.trim()) return 'Short Description is required.'
      if (!form.tags.trim()) return 'Tags are required.'
      if (!form.status) return 'Status is required.'
      if (!Number.isInteger(form.positionOrder) || form.positionOrder < 1) return 'Position / Order must be at least 1.'
      if (!Number.isInteger(form.featureOrder) || form.featureOrder < 1) return 'Featured Position / Order must be at least 1.'
      if (!form.problem.trim()) return 'Problem is required.'
      if (!form.overview.trim()) return 'Overview is required.'
      if (!form.solution.trim()) return 'Solution is required.'
      const invalidResult = form.results.some((result) => !result.value.trim() || !result.metric.trim())
      if (invalidResult) return 'All Results fields (value and metric) are required.'
      return ''
    }

    const hasFeatures = form.features.length > 0
    if (!hasFeatures || form.features.some((feature) => !feature.trim())) return 'All Features fields are required.'
    if (!form.technologies.trim()) return 'Technologies are required.'
    if (!form.testimonialAuthor.trim()) return 'Testimonial Author is required.'
    if (!form.testimonialRole.trim()) return 'Testimonial Role is required.'
    if (!form.testimonialQuote.trim()) return 'Testimonial Quote is required.'
    return ''
  }

  function goNext() {
    const error = validateStep(step)
    if (error) {
      setStepError(error)
      return
    }
    setStepError('')
    setStep((prev) => (Math.min(prev + 1, 3) as 1 | 2 | 3))
  }

  function handleSave() {
    if (step !== 3) return
    const error = validateStep(3)
    if (error) {
      setStepError(error)
      return
    }
    setStepError('')
    onSubmit()
  }

  const summaryCategories = form.categories.length > 0 ? form.categories.join(', ') : 'Select categories'

  return (
    <ApexModal size="xl" open={open} title={title} subtitle={subtitle} onClose={onClose}>
      <form
        onSubmit={(event) => {
          event.preventDefault()
        }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between rounded-lg px-3 py-2" style={{ backgroundColor: 'var(--apx-surface-alt)' }}>
          <div className="flex items-center gap-2">
            <span className={['text-xs font-semibold', step === 1 ? 'apx-text' : 'apx-muted'].join(' ')}>Step 1: Basic</span>
            <span className="apx-muted">/</span>
            <span className={['text-xs font-semibold', step === 2 ? 'apx-text' : 'apx-muted'].join(' ')}>Step 2: Content</span>
            <span className="apx-muted">/</span>
            <span className={['text-xs font-semibold', step === 3 ? 'apx-text' : 'apx-muted'].join(' ')}>Step 3: Final</span>
          </div>
          <div className="text-xs apx-muted">{step} of 3</div>
        </div>

        {step === 1 ? (
        <>
        <div
          className={[
            'rounded-xl border p-4 transition',
            dragOver ? 'border-dashed' : '',
          ].join(' ')}
          style={{
            borderColor: dragOver ? 'var(--apx-primary)' : 'var(--apx-border)',
            backgroundColor: 'var(--apx-surface-alt)',
          }}
          onDragOver={(event) => {
            event.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={(event) => {
            event.preventDefault()
            setDragOver(false)
          }}
          onDrop={(event) => {
            event.preventDefault()
            setDragOver(false)
            if (event.dataTransfer.files?.length) addFiles(event.dataTransfer.files)
          }}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide apx-muted">Project Images</p>
              <p className="text-xs apx-muted">Drag and drop images, reorder them, and choose one card image.</p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold" style={{ borderColor: 'var(--apx-border)' }}>
              <Upload className="h-3.5 w-3.5" />
              Select Images
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) => {
                  if (event.target.files?.length) addFiles(event.target.files)
                }}
              />
            </label>
          </div>

          <div className="mb-3 overflow-hidden rounded-lg border" style={{ borderColor: 'var(--apx-border)' }}>
            <div className="relative mx-auto aspect-video w-full max-w-3xl bg-black/10">
              {selectedImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selectedImage.url} alt="Project preview" className="h-full w-full object-contain" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm apx-muted">No image selected</div>
              )}
              {form.imageItems.length > 1 ? (
                <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    className="rounded-md border p-1.5"
                    style={{ borderColor: 'var(--apx-border)', backgroundColor: 'rgba(0,0,0,0.45)', color: '#fff' }}
                    onClick={() => setPreviewIndex((prev) => (prev - 1 + form.imageItems.length) % form.imageItems.length)}
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded-md border p-1.5"
                    style={{ borderColor: 'var(--apx-border)', backgroundColor: 'rgba(0,0,0,0.45)', color: '#fff' }}
                    onClick={() => setPreviewIndex((prev) => (prev + 1) % form.imageItems.length)}
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="max-h-68 overflow-y-auto pr-1">
          <div className="grid gap-2 sm:grid-cols-2">
            {form.imageItems.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-2 rounded-lg border p-2"
                style={{
                  borderColor: form.selectedPrimaryImageId === item.id ? 'var(--apx-primary)' : 'var(--apx-border)',
                  backgroundColor: 'var(--apx-surface)',
                }}
              >
                <button
                  type="button"
                  className="shrink-0"
                  onClick={() => setPreviewIndex(index)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt="thumb" className="h-10 w-14 rounded object-contain" />
                </button>
                <div className="flex flex-1 items-center gap-1">
                  <ApexCheckbox
                    checked={form.selectedPrimaryImageId === item.id}
                    onChange={() => onChange({ ...form, selectedPrimaryImageId: item.id })}
                    ariaLabel="Set as card image"
                  />
                  <span className="text-xs apx-muted">Card image</span>
                </div>
                <button
                  type="button"
                  className="rounded border p-1"
                  style={{ borderColor: 'var(--apx-border)' }}
                  onClick={() => moveImageByIndex(index, index - 1)}
                  disabled={index === 0}
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="rounded border p-1"
                  style={{ borderColor: 'var(--apx-border)' }}
                  onClick={() => moveImageByIndex(index, index + 1)}
                  disabled={index === form.imageItems.length - 1}
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button type="button" className="rounded border p-1 text-rose-500" style={{ borderColor: 'var(--apx-border)' }} onClick={() => removeImage(item.id)}>
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Title</label>
            <ApexInput value={form.title} onChange={(event) => onChange({ ...form, title: event.target.value })} required />
            <p className="mt-1 text-[11px] apx-muted">Slug: {slugify(form.title) || 'auto-generated'}</p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">System Type</label>
            <ApexInput value={form.systemType} onChange={(event) => onChange({ ...form, systemType: event.target.value })} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Industry</label>
            <ApexInput value={form.industry} onChange={(event) => onChange({ ...form, industry: event.target.value })} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Categories</label>
            <div className="relative">
              <button
                type="button"
                className="flex h-10 w-full items-center justify-between rounded-xl border px-3 text-sm"
                style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface-alt)', color: 'var(--apx-text)' }}
                onClick={() => setCategoryOpen((prev) => !prev)}
              >
                <span className={form.categories.length > 0 ? 'apx-text' : 'apx-muted'}>{summaryCategories}</span>
                <ArrowDown className={['h-3.5 w-3.5 transition-transform', categoryOpen ? 'rotate-180' : 'rotate-0'].join(' ')} />
              </button>
              {categoryOpen ? (
                <div className="absolute bottom-full left-0 right-0 z-60 mb-2 max-h-44 overflow-y-auto rounded-xl border p-2" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
                  {categories.map((category) => (
                    <label key={category} className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs apx-text hover:bg-black/5">
                      <ApexCheckbox
                        checked={form.categories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        ariaLabel={`Toggle ${category}`}
                      />
                      {category}
                    </label>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
        </>
        ) : step === 2 ? (
        <div className="grid gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Short Description</label>
            <ApexTextarea value={form.shortDesc} onChange={(event) => onChange({ ...form, shortDesc: event.target.value })} rows={2} />
          </div>

          <div className="md:col-span-2 grid gap-3 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-medium apx-muted">Tags (comma-separated)</label>
              <ApexInput value={form.tags} onChange={(event) => onChange({ ...form, tags: event.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium apx-muted">Status</label>
              <ApexDropdown
                value={form.status}
                onChange={(value) => onChange({ ...form, status: value as 'active' | 'inactive' })}
                options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Position / Order</label>
            <ApexInput
              type="number"
              min={1}
              value={String(form.positionOrder)}
              onChange={(event) => onChange({ ...form, positionOrder: Number(event.target.value) || 1 })}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium apx-muted">Featured Position / Order</label>
            <div className="grid grid-cols-[auto_1fr] items-center gap-2">
              <label className="flex items-center gap-2 text-sm apx-text">
                <ApexCheckbox
                  checked={form.isFeatured}
                  onChange={() => onChange({ ...form, isFeatured: !form.isFeatured })}
                  ariaLabel="Set project as featured"
                />
                Featured
              </label>
              <ApexInput
                type="number"
                min={1}
                value={String(form.featureOrder)}
                onChange={(event) => onChange({ ...form, featureOrder: Number(event.target.value) || 1 })}
                disabled={!form.isFeatured}
              />
            </div>
          </div>

          <div className="md:col-span-2 grid gap-3 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium apx-muted">Problem</label>
              <ApexTextarea value={form.problem} onChange={(event) => onChange({ ...form, problem: event.target.value })} rows={4} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium apx-muted">Overview</label>
              <ApexTextarea value={form.overview} onChange={(event) => onChange({ ...form, overview: event.target.value })} rows={4} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium apx-muted">Solution</label>
              <ApexTextarea value={form.solution} onChange={(event) => onChange({ ...form, solution: event.target.value })} rows={4} />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Results</label>
            <div className="grid gap-2">
              {form.results.map((result, index) => (
                <div key={`result-${index}`} className="grid gap-2 md:grid-cols-2">
                  <ApexInput
                    placeholder={`Value ${index + 1}`}
                    value={result.value}
                    onChange={(event) => {
                      const next = [...form.results]
                      next[index] = { ...next[index], value: event.target.value }
                      onChange({ ...form, results: next })
                    }}
                  />
                  <ApexInput
                    placeholder={`Metric ${index + 1}`}
                    value={result.metric}
                    onChange={(event) => {
                      const next = [...form.results]
                      next[index] = { ...next[index], metric: event.target.value }
                      onChange({ ...form, results: next })
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

        </div>
        ) : (
        <div className="grid gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-xs font-medium apx-muted">Features</label>
              <ApexButton
                type="button"
                variant="outline"
                className="text-xs"
                onClick={() => onChange({ ...form, features: [...form.features, ''] })}
              >
                Add Feature
              </ApexButton>
            </div>
            <div className="max-h-66 overflow-y-auto pr-1">
            <div className="grid gap-2 md:grid-cols-2">
              {form.features.map((feature, index) => (
                <div key={`feature-${index}`} className="flex items-center gap-1">
                  <ApexInput
                    value={feature}
                    onChange={(event) => {
                      const next = [...form.features]
                      next[index] = event.target.value
                      onChange({ ...form, features: next })
                    }}
                  />
                  <button
                    type="button"
                    className="rounded border p-1"
                    style={{ borderColor: 'var(--apx-border)' }}
                    onClick={() => {
                      const next = moveItem(form.features, index, index - 1)
                      onChange({ ...form, features: next })
                    }}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    className="rounded border p-1"
                    style={{ borderColor: 'var(--apx-border)' }}
                    onClick={() => {
                      const next = moveItem(form.features, index, index + 1)
                      onChange({ ...form, features: next })
                    }}
                    disabled={index === form.features.length - 1}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    className="rounded border p-1 text-rose-500"
                    style={{ borderColor: 'var(--apx-border)' }}
                    onClick={() => {
                      const next = form.features.filter((_, itemIndex) => itemIndex !== index)
                      onChange({ ...form, features: next.length ? next : [''] })
                    }}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium apx-muted">Technologies (comma-separated)</label>
            <ApexInput
              value={form.technologies}
              onChange={(event) => onChange({ ...form, technologies: event.target.value })}
              placeholder="React, Next.js, PostgreSQL"
            />
          </div>

          <div className="md:col-span-2 grid gap-3 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium apx-muted">Testimonial Author</label>
              <ApexInput value={form.testimonialAuthor} onChange={(event) => onChange({ ...form, testimonialAuthor: event.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium apx-muted">Testimonial Role</label>
              <ApexInput value={form.testimonialRole} onChange={(event) => onChange({ ...form, testimonialRole: event.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium apx-muted">Testimonial Quote</label>
              <ApexTextarea value={form.testimonialQuote} onChange={(event) => onChange({ ...form, testimonialQuote: event.target.value })} rows={2} />
            </div>
          </div>
        </div>
        )}

        {stepError ? <p className="text-xs text-rose-400">{stepError}</p> : null}

        <div className="flex justify-end gap-2 border-t pt-4" style={{ borderColor: 'var(--apx-border)' }}>
          {step > 1 ? <ApexButton type="button" variant="outline" onClick={() => {
            setStep((prev) => (prev === 1 ? 1 : ((prev - 1) as 1 | 2 | 3)))
            setStepError('')
          }} disabled={pending}>Back</ApexButton> : null}
          <ApexButton type="button" variant="outline" onClick={onClose} disabled={pending}>Cancel</ApexButton>
          {step < 3 ? (
            <ApexButton type="button" onClick={goNext} disabled={pending}>Next</ApexButton>
          ) : (
            <ApexButton type="button" onClick={handleSave} disabled={pending}>{pending ? 'Saving...' : 'Save Project'}</ApexButton>
          )}
        </div>
      </form>
    </ApexModal>
  )
}

function ProjectViewModal({
  open,
  project,
  onClose,
}: {
  open: boolean
  project: ProjectRow
  onClose: () => void
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [previewIndex, setPreviewIndex] = useState(0)

  const images = getDetailsImages(project)
  const activeImage = images[previewIndex] || images[0] || ''
  const results = getDetailsResults(project)
  const features = getDetailsFeatures(project)
  const technologies = getDetailsTechnologies(project)
  const testimonial = getDetailsTestimonial(project)
  const details = getDetailsObject(project.details)

  return (
    <ApexModal size="xl" open={open} title="View Project" subtitle={project.title} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg px-3 py-2" style={{ backgroundColor: 'var(--apx-surface-alt)' }}>
          <div className="flex items-center gap-2">
            <span className={['text-xs font-semibold', step === 1 ? 'apx-text' : 'apx-muted'].join(' ')}>Step 1: Basic</span>
            <span className="apx-muted">/</span>
            <span className={['text-xs font-semibold', step === 2 ? 'apx-text' : 'apx-muted'].join(' ')}>Step 2: Content</span>
            <span className="apx-muted">/</span>
            <span className={['text-xs font-semibold', step === 3 ? 'apx-text' : 'apx-muted'].join(' ')}>Step 3: Final</span>
          </div>
          <div className="text-xs apx-muted">{step} of 3</div>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide apx-muted">Project Images</p>
              <div className="overflow-hidden rounded-lg">
                <div className="relative mx-auto aspect-video w-full max-w-3xl bg-black/10">
                  <div className="absolute top-2 right-2 z-10 rounded-md px-2 py-1 text-[10px] font-mono" style={{ backgroundColor: 'rgba(0,0,0,0.45)', color: '#fff', border: '1px solid rgba(255,255,255,0.18)' }}>
                    {images.length > 0 ? `${previewIndex + 1}/${images.length}` : '0/0'}
                  </div>
                  {activeImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={activeImage} alt={`${project.title} preview`} className="h-full w-full object-contain" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm apx-muted">No image available</div>
                  )}

                  {images.length > 1 ? (
                    <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        className="rounded-md border p-1.5"
                        style={{ borderColor: 'var(--apx-border)', backgroundColor: 'rgba(0,0,0,0.45)', color: '#fff' }}
                        onClick={() => setPreviewIndex((prev) => (prev - 1 + images.length) % images.length)}
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="rounded-md border p-1.5"
                        style={{ borderColor: 'var(--apx-border)', backgroundColor: 'rgba(0,0,0,0.45)', color: '#fff' }}
                        onClick={() => setPreviewIndex((prev) => (prev + 1) % images.length)}
                        aria-label="Next image"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide apx-muted">Title</p>
                <p className="mt-1 text-sm font-semibold apx-text">{project.title}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide apx-muted">System Type</p>
                <p className="mt-1 text-sm apx-text">{project.systemType || '-'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide apx-muted">Slug</p>
                <p className="mt-1 text-sm apx-text">{project.slug || '-'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide apx-muted">Industry</p>
                <p className="mt-1 text-sm apx-text">{project.industry || '-'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide apx-muted">Categories</p>
                <p className="mt-1 text-sm apx-text">{project.categories.length > 0 ? project.categories.join(', ') : '-'}</p>
              </div>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="md:col-span-3">
                <p className="text-xs uppercase tracking-wide apx-muted">Short Description</p>
                <p className="mt-1 text-sm apx-text whitespace-pre-wrap">{project.shortDesc || '-'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide apx-muted">Tags</p>
                <p className="mt-1 text-sm apx-text">{project.tags.length > 0 ? project.tags.join(', ') : '-'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide apx-muted">Status</p>
                <p className="mt-1 text-sm apx-text">{project.isPublished ? 'Active' : 'Inactive'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide apx-muted">Position / Order</p>
                <p className="mt-1 text-sm apx-text">{toProjectOrderValue(project)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide apx-muted">Featured Position / Order</p>
                <p className="mt-1 text-sm apx-text">{project.isFeatured ? project.featureOrder : '-'}</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-wide apx-muted">Problem</p>
                <p className="mt-1 text-sm apx-text whitespace-pre-wrap">{String(details.problem ?? '-') || '-'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide apx-muted">Overview</p>
                <p className="mt-1 text-sm apx-text whitespace-pre-wrap">{String(details.overview ?? '-') || '-'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide apx-muted">Solution</p>
                <p className="mt-1 text-sm apx-text whitespace-pre-wrap">{String(details.solution ?? '-') || '-'}</p>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide apx-muted">Results</p>
              <div className="mt-2 grid gap-2 md:grid-cols-4">
                {results.map((result, index) => (
                  <div key={`view-result-${index}`} className="rounded-lg px-3 py-2" style={{ backgroundColor: 'var(--apx-surface-alt)' }}>
                    <p className="text-sm font-semibold apx-text">{result.value || '-'}</p>
                    <p className="text-xs apx-muted">{result.metric || 'Metric'}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide apx-muted">Features</p>
                <span className="text-xs apx-muted">{features.length} item(s)</span>
              </div>
              <div className="max-h-66 overflow-y-auto pr-1">
                <div className="grid gap-2 md:grid-cols-2">
                  {(features.length > 0 ? features : ['-']).map((feature, index) => (
                    <div key={`view-feature-${index}`} className="rounded-lg px-3 py-2 text-sm apx-text" style={{ backgroundColor: 'var(--apx-surface-alt)' }}>
                      {feature || '-'}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide apx-muted">Technologies</p>
                <span className="text-xs apx-muted">{technologies.length} item(s)</span>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {(technologies.length > 0 ? technologies : ['-']).map((technology, index) => (
                  <div key={`view-tech-${index}`} className="rounded-lg px-3 py-2 text-sm apx-text" style={{ backgroundColor: 'var(--apx-surface-alt)' }}>
                    {technology || '-'}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-wide apx-muted">Testimonial Author</p>
                <p className="mt-1 text-sm apx-text">{testimonial.author || '-'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide apx-muted">Testimonial Role</p>
                <p className="mt-1 text-sm apx-text">{testimonial.role || '-'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide apx-muted">Testimonial Quote</p>
                <p className="mt-1 text-sm apx-text whitespace-pre-wrap">{testimonial.quote || '-'}</p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-between pt-4">
          <ApexButton
            type="button"
            variant="outline"
            onClick={() => setStep((prev) => (prev === 1 ? 1 : ((prev - 1) as 1 | 2 | 3)))}
            disabled={step === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </ApexButton>

          <div className="text-xs apx-muted">Step {step} of 3</div>

          <div className="flex items-center gap-2">
            <ApexButton type="button" variant="outline" onClick={onClose}>Close</ApexButton>
            {step < 3 ? (
              <ApexButton type="button" onClick={() => setStep((prev) => (Math.min(prev + 1, 3) as 1 | 2 | 3))}>
                Next
                <ChevronRight className="h-4 w-4" />
              </ApexButton>
            ) : null}
          </div>
        </div>
      </div>
    </ApexModal>
  )
}

export default function AdminProjectsTemplateView({
  projects,
  categories,
  initialPositionOrder,
  initialFeaturedOrder,
  createProjectAction,
  updateProjectAction,
  deleteProjectAction,
  bulkDeleteProjectsAction,
  bulkSetInactiveProjectsAction,
  toggleProjectActiveAction,
  toggleProjectFeaturedAction,
  saveProjectsReorderAction,
}: {
  projects: ProjectRow[]
  categories: string[]
  initialPositionOrder: number
  initialFeaturedOrder: number
  createProjectAction: (formData: FormData) => Promise<void>
  updateProjectAction: (formData: FormData) => Promise<void>
  deleteProjectAction: (formData: FormData) => Promise<void>
  bulkDeleteProjectsAction: (formData: FormData) => Promise<void>
  bulkSetInactiveProjectsAction: (formData: FormData) => Promise<void>
  toggleProjectActiveAction: (formData: FormData) => Promise<void>
  toggleProjectFeaturedAction: (formData: FormData) => Promise<void>
  saveProjectsReorderAction: (formData: FormData) => Promise<void>
}) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [sortKey, setSortKey] = useState<SortKey>('order')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectRow | null>(null)
  const [pendingFeaturedProject, setPendingFeaturedProject] = useState<ProjectRow | null>(null)
  const [pendingToggleProject, setPendingToggleProject] = useState<ProjectRow | null>(null)
  const [toasts, setToasts] = useState<ApexToast[]>([])
  const [columns, setColumns] = useState<Record<ColumnKey, boolean>>({
    project: true,
    type: true,
    industry: true,
    category: true,
    order: true,
    status: true,
    actions: true,
  })
  const [addForm, setAddForm] = useState<ProjectFormState>(defaultForm(initialPositionOrder, initialFeaturedOrder))
  const [editForm, setEditForm] = useState<ProjectFormState>(defaultForm(initialPositionOrder, initialFeaturedOrder))
  const [rearrangeMode, setRearrangeMode] = useState(false)
  const [reorderIds, setReorderIds] = useState<string[]>([])
  const [dragRowId, setDragRowId] = useState<string | null>(null)
  const [featuredPositionInput, setFeaturedPositionInput] = useState(1)
  const [categoryFilterOpen, setCategoryFilterOpen] = useState(false)
  const [selectedCategoryFilters, setSelectedCategoryFilters] = useState<string[]>(categories)

  const nextPositionOrder = useMemo(() => {
    const maxFromRows = projects.reduce((max, project) => {
      const value = readPositionOrderForDefault(project.details)
      return value && value > max ? value : max
    }, 0)
    return Math.max(initialPositionOrder, maxFromRows + 1, 1)
  }, [initialPositionOrder, projects])

  const nextFeaturedOrder = useMemo(() => {
    const maxFromRows = projects.reduce((max, project) => {
      if (!project.isFeatured) return max
      const value = normalizeFeatureOrder(project)
      return value > max ? value : max
    }, 0)
    return Math.max(initialFeaturedOrder, maxFromRows + 1, 1)
  }, [initialFeaturedOrder, projects])

  const [confirmConfig, setConfirmConfig] = useState<{
    title: string
    description: string
    label: string
    tone: 'primary' | 'danger'
    kind:
      | 'add'
      | 'edit'
      | 'delete'
      | 'bulkDelete'
      | 'bulkInactive'
      | 'toggleActive'
      | 'toggleFeatured'
      | 'saveReorder'
  } | null>(null)

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return projects.filter((project) => {
      const statusMatch =
        status === 'all'
          ? true
          : status === 'featured'
          ? project.isFeatured
          : status === 'active'
          ? project.isPublished
          : !project.isPublished
      const searchMatch =
        keyword.length === 0
          ? true
          : [project.title, project.slug, project.systemType, project.industry].join(' ').toLowerCase().includes(keyword)
      const categoryMatch =
        selectedCategoryFilters.length === 0
          ? true
          : project.categories.some((category) => selectedCategoryFilters.includes(category))

      return statusMatch && searchMatch && categoryMatch
    })
  }, [projects, search, selectedCategoryFilters, status])

  const sorted = useMemo(() => {
    const items = [...filtered]

    if (status === 'featured') {
      items.sort((a, b) => a.featureOrder - b.featureOrder)
      return items
    }

    items.sort((a, b) => {
      if (sortKey === 'project') {
        const direction = sortDir === 'asc' ? 1 : -1
        return a.title.localeCompare(b.title) * direction
      }
      if (sortKey === 'type') {
        const direction = sortDir === 'asc' ? 1 : -1
        return a.systemType.localeCompare(b.systemType) * direction
      }
      if (sortKey === 'industry') {
        const direction = sortDir === 'asc' ? 1 : -1
        return a.industry.localeCompare(b.industry) * direction
      }
      if (sortKey === 'category') {
        const direction = sortDir === 'asc' ? 1 : -1
        const aLabel = (a.categories[0] || '').toLowerCase()
        const bLabel = (b.categories[0] || '').toLowerCase()
        return aLabel.localeCompare(bLabel) * direction
      }
      if (sortKey === 'order') {
        const direction = sortDir === 'asc' ? 1 : -1
        return (toProjectOrderValue(a) - toProjectOrderValue(b)) * direction
      }
      if (sortKey === 'status') {
        const direction = sortDir === 'asc' ? 1 : -1
        return (Number(a.isPublished) - Number(b.isPublished)) * direction
      }
      return 0
    })
    return items
  }, [filtered, sortDir, sortKey, status])

  const reorderRows = useMemo(() => {
    if (!rearrangeMode) return []
    const map = new Map(sorted.map((item) => [item.id, item]))
    return reorderIds.map((id) => map.get(id)).filter(Boolean) as ProjectRow[]
  }, [rearrangeMode, reorderIds, sorted])

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage))
  const safePage = Math.min(page, totalPages)
  const paged = rearrangeMode
    ? reorderRows
    : sorted.slice((safePage - 1) * perPage, safePage * perPage)

  const counts = useMemo(() => {
    const activeCount = projects.filter((project) => project.isPublished).length
    const featuredCount = projects.filter((project) => project.isFeatured).length
    return {
      all: projects.length,
      featured: featuredCount,
      active: activeCount,
      inactive: projects.length - activeCount,
    }
  }, [projects])

  const currentPageIds = paged.map((project) => project.id)
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

  function toggleCategoryFilter(category: string) {
    setSelectedCategoryFilters((prev) => {
      if (prev.includes(category)) {
        return prev.filter((item) => item !== category)
      }
      return [...prev, category]
    })
  }

  function selectAllCategoryFilters() {
    setSelectedCategoryFilters(categories)
  }

  function clearCategoryFilters() {
    setSelectedCategoryFilters([])
  }

  const categoryFilterLabel =
    selectedCategoryFilters.length === categories.length
      ? 'All Categories'
      : selectedCategoryFilters.length === 0
      ? 'No Category'
      : `${selectedCategoryFilters.length} Selected`

  function toFormData(form: ProjectFormState): FormData {
    const formData = new FormData()
    if (form.id) formData.set('id', form.id)
    formData.set('title', form.title)
    formData.set('systemType', form.systemType)
    formData.set('industry', form.industry)
    formData.set('categoriesJson', JSON.stringify(form.categories))
    formData.set('shortDesc', form.shortDesc)
    formData.set('tags', form.tags)
    formData.set('status', form.status)
    formData.set('positionOrder', String(form.positionOrder))
    formData.set('featureOrder', String(form.featureOrder))
    if (form.isFeatured) formData.set('isFeatured', 'on')
    formData.set('problem', form.problem)
    formData.set('overview', form.overview)
    formData.set('solution', form.solution)
    formData.set('resultsJson', JSON.stringify(form.results))
    formData.set('featuresJson', JSON.stringify(form.features.map((item) => item.trim()).filter(Boolean)))
    formData.set('technologies', form.technologies)
    formData.set('testimonialAuthor', form.testimonialAuthor)
    formData.set('testimonialRole', form.testimonialRole)
    formData.set('testimonialQuote', form.testimonialQuote)
    formData.set('baseDetails', form.baseDetails)

    const imageOrder = form.imageItems.map((item) => {
      if (item.source === 'existing') {
        return { id: item.id, kind: 'existing', url: item.url }
      }
      return { id: item.id, kind: 'new' }
    })
    formData.set('imageOrder', JSON.stringify(imageOrder))
    formData.set('selectedPrimaryImageId', form.selectedPrimaryImageId)

    form.imageItems.forEach((item) => {
      if (item.source !== 'new' || !item.file) return
      formData.set(`upload_${item.id}`, item.file)
    })

    return formData
  }

  function openEditModal(project: ProjectRow) {
    setSelectedProject(project)
    setEditForm(formFromProject(project))
    setEditOpen(true)
  }

  function openViewModal(project: ProjectRow) {
    setSelectedProject(project)
    setViewOpen(true)
  }

  function onSort(nextKey: SortKey) {
    if (status === 'featured') return
    if (sortKey === nextKey) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortKey(nextKey)
    setSortDir('asc')
  }

  function renderSortIcon(key: SortKey) {
    if (status === 'featured') return <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
    if (sortKey !== key) return <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
    return sortDir === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
  }

  function exportCsv() {
    const rows = sorted.map((item) => [
      item.title,
      item.slug,
      item.systemType,
      item.industry,
      item.categories.join(', '),
      item.isPublished ? 'Active' : 'Inactive',
      item.isFeatured ? `Featured #${item.featureOrder}` : 'No',
      String(toProjectOrderValue(item)),
      toRelative(item.updatedAt),
    ])
    downloadCsv('projects-export.csv', [['Project', 'Slug', 'System Type', 'Industry', 'Category', 'Status', 'Featured', 'Order', 'Updated'], ...rows])
    addToast('Projects CSV exported', 'success')
  }

  function enterRearrange() {
    setReorderIds(sorted.map((item) => item.id))
    setRearrangeMode(true)
    setPage(1)
  }

  function cancelRearrange() {
    setRearrangeMode(false)
    setReorderIds([])
  }

  function moveReorderItem(id: string, direction: -1 | 1) {
    const index = reorderIds.indexOf(id)
    if (index === -1) return
    const next = moveItem(reorderIds, index, index + direction)
    setReorderIds(next)
  }

  async function executeConfirmedAction() {
    if (!confirmConfig) return
    setPendingAction(true)

    try {
      if (confirmConfig.kind === 'add') {
        await createProjectAction(toFormData(addForm))
        setAddOpen(false)
        setAddForm(defaultForm(nextPositionOrder, nextFeaturedOrder))
        addToast('Project created successfully', 'success')
      }

      if (confirmConfig.kind === 'edit') {
        await updateProjectAction(toFormData(editForm))
        setEditOpen(false)
        addToast('Project updated successfully', 'success')
      }

      if (confirmConfig.kind === 'delete' && selectedProject) {
        const formData = new FormData()
        formData.set('id', selectedProject.id)
        await deleteProjectAction(formData)
        setSelectedProject(null)
        addToast('Project deleted', 'success')
      }

      if (confirmConfig.kind === 'bulkDelete') {
        const formData = new FormData()
        formData.set('ids', selectedIds.join(','))
        await bulkDeleteProjectsAction(formData)
        setSelectedIds([])
        addToast('Selected projects deleted', 'success')
      }

      if (confirmConfig.kind === 'bulkInactive') {
        const formData = new FormData()
        formData.set('ids', selectedIds.join(','))
        await bulkSetInactiveProjectsAction(formData)
        setSelectedIds([])
        addToast('Selected projects set to inactive', 'success')
      }

      if (confirmConfig.kind === 'toggleActive' && pendingToggleProject) {
        const formData = new FormData()
        formData.set('id', pendingToggleProject.id)
        await toggleProjectActiveAction(formData)
        addToast(`Project marked ${pendingToggleProject.isPublished ? 'inactive' : 'active'}`, 'success')
        setPendingToggleProject(null)
      }

      if (confirmConfig.kind === 'toggleFeatured' && pendingFeaturedProject) {
        const formData = new FormData()
        formData.set('id', pendingFeaturedProject.id)
        formData.set('nextFeatured', String(!pendingFeaturedProject.isFeatured))
        if (!pendingFeaturedProject.isFeatured) {
          formData.set('featureOrder', String(featuredPositionInput || 1))
        }
        await toggleProjectFeaturedAction(formData)
        addToast(
          pendingFeaturedProject.isFeatured
            ? 'Project removed from featured'
            : 'Project marked as featured',
          'success'
        )
        setPendingFeaturedProject(null)
      }

      if (confirmConfig.kind === 'saveReorder') {
        const formData = new FormData()
        formData.set('ids', reorderIds.join(','))
        formData.set('mode', status === 'featured' ? 'featured' : 'projects')
        await saveProjectsReorderAction(formData)
        setRearrangeMode(false)
        setReorderIds([])
        addToast(status === 'featured' ? 'Featured order saved' : 'Project order saved', 'success')
      }

      setConfirmOpen(false)
      setConfirmConfig(null)
    } catch (error) {
      addToast(readErrorMessage(error), 'danger')
    } finally {
      setPendingAction(false)
    }
  }

  return (
    <div className="space-y-4">
      {pendingAction && confirmConfig?.kind === 'add' ? <ApexBlockingSpinner label="Saving project..." /> : null}
      <ApexToastStack toasts={toasts} onRemove={(id) => setToasts((prev) => prev.filter((toast) => toast.id !== id))} />

      <ApexBreadcrumbs items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Projects' }]} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[42px] leading-none font-bold tracking-tight apx-text">Projects</h1>
          <p className="mt-1 text-sm apx-muted">Manage showcase projects for homepage and project listings.</p>
        </div>

        <button
          onClick={() => {
            setAddForm(defaultForm(nextPositionOrder, nextFeaturedOrder))
            setAddOpen(true)
          }}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-0.5"
          style={{ backgroundColor: 'var(--apx-primary)' }}
        >
          <Plus className="h-4 w-4" />
          Add Project
        </button>
      </div>

      <ApexStatusTabs
        tabs={[
          { key: 'all', label: 'All', count: counts.all },
          { key: 'featured', label: 'Featured', count: counts.featured, indicatorColor: '#f59e0b' },
          { key: 'active', label: 'Active', count: counts.active, indicatorColor: '#16a34a' },
          { key: 'inactive', label: 'Inactive', count: counts.inactive, indicatorColor: '#64748b' },
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
            placeholder="Search projects..."
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {selectedIds.length > 0 && !rearrangeMode ? (
            <>
              <ApexButton
                type="button"
                variant="outline"
                className="whitespace-nowrap"
                onClick={() => {
                  setConfirmConfig({
                    title: 'Set Projects Inactive',
                    description: `Set ${selectedIds.length} selected project(s) to inactive?`,
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
                    title: 'Delete Selected Projects',
                    description: `Delete ${selectedIds.length} selected project(s)? This action cannot be undone.`,
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
              <ApexButton type="button" variant="outline" onClick={cancelRearrange}>Cancel</ApexButton>
              <ApexButton
                type="button"
                onClick={() => {
                  setConfirmConfig({
                    title: status === 'featured' ? 'Save Featured Order' : 'Save Project Order',
                    description:
                      status === 'featured'
                        ? 'Save the new featured position order?'
                        : 'Save the new project position order?',
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
            <ApexButton type="button" variant="outline" onClick={enterRearrange}>
              Rearrange
            </ApexButton>
          )}

          <div className="relative">
              <button
              type="button"
                className="inline-flex h-8 min-w-30 items-center justify-between gap-2 rounded-lg border px-3 text-xs"
              style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}
              onClick={() => setCategoryFilterOpen((prev) => !prev)}
            >
              <span className="truncate">{categoryFilterLabel}</span>
              <ArrowDown className={['h-3 w-3 transition-transform', categoryFilterOpen ? 'rotate-180' : 'rotate-0'].join(' ')} />
            </button>

            {categoryFilterOpen ? (
              <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border p-2 shadow-xl" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <button type="button" className="text-xs font-semibold apx-text" onClick={selectAllCategoryFilters}>All</button>
                  <button type="button" className="text-xs font-semibold apx-muted" onClick={clearCategoryFilters}>None</button>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {categories.map((category) => (
                    <label key={`filter-${category}`} className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs apx-text hover:bg-black/5">
                      <ApexCheckbox
                        checked={selectedCategoryFilters.includes(category)}
                        onChange={() => toggleCategoryFilter(category)}
                        ariaLabel={`Toggle ${category} filter`}
                      />
                      {category}
                    </label>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <ApexColumnsToggle
            columns={[
              { key: 'project', label: 'Project', visible: columns.project },
              { key: 'type', label: 'System Type', visible: columns.type },
              { key: 'industry', label: 'Industry', visible: columns.industry },
              { key: 'category', label: 'Category', visible: columns.category },
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
                  <ApexCheckbox checked={allCurrentPageSelected} onChange={toggleSelectAllCurrentPage} ariaLabel="Select all current page projects" />
                </th>
              ) : (
                <th className="w-14 px-2 py-3 font-semibold apx-text">Order</th>
              )}

              {columns.project ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button onClick={() => onSort('project')} className="inline-flex items-center gap-1.5" type="button">
                    Project
                    {renderSortIcon('project')}
                  </button>
                </th>
              ) : null}
              {columns.type ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button onClick={() => onSort('type')} className="inline-flex items-center gap-1.5" type="button">
                    System Type
                    {renderSortIcon('type')}
                  </button>
                </th>
              ) : null}
              {columns.industry ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button onClick={() => onSort('industry')} className="inline-flex items-center gap-1.5" type="button">
                    Industry
                    {renderSortIcon('industry')}
                  </button>
                </th>
              ) : null}
              {columns.category ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button onClick={() => onSort('category')} className="inline-flex items-center gap-1.5" type="button">
                    Category
                    {renderSortIcon('category')}
                  </button>
                </th>
              ) : null}
              {columns.order ? (
                <th className="px-4 py-3 font-semibold apx-text">
                  <button onClick={() => onSort('order')} className="inline-flex items-center gap-1.5" type="button">
                    Order
                    {renderSortIcon('order')}
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
              {columns.actions ? <th className="px-4 py-3 text-right font-semibold apx-text">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {paged.map((project, index) => {
              const images = getDetailsImages(project)
              const displayImage = project.image || images[0] || ''
              return (
                <tr
                  key={project.id}
                  className={[
                    'apx-table-row border-b last:border-b-0',
                    !rearrangeMode ? 'cursor-pointer' : '',
                    selectedIds.includes(project.id) ? 'apx-table-row-selected' : '',
                  ].join(' ').trim()}
                  style={{ borderColor: 'var(--apx-border)' }}
                  draggable={rearrangeMode}
                  onDragStart={() => setDragRowId(project.id)}
                  onDragOver={(event) => {
                    if (!rearrangeMode) return
                    event.preventDefault()
                  }}
                  onDrop={(event) => {
                    if (!rearrangeMode || !dragRowId || dragRowId === project.id) return
                    event.preventDefault()
                    const fromIndex = reorderIds.indexOf(dragRowId)
                    const toIndex = reorderIds.indexOf(project.id)
                    setReorderIds(moveItem(reorderIds, fromIndex, toIndex))
                    setDragRowId(null)
                  }}
                  onClick={() => {
                    if (rearrangeMode) return
                    openViewModal(project)
                  }}
                >
                  {!rearrangeMode ? (
                    <td className="px-2 py-3">
                      <div onClick={(event) => event.stopPropagation()}>
                        <ApexCheckbox
                          checked={selectedIds.includes(project.id)}
                          onChange={() => toggleSelectOne(project.id)}
                          ariaLabel={`Select ${project.title}`}
                        />
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

                  {columns.project ? (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="aspect-video h-14 w-24 shrink-0 overflow-hidden rounded-md border" style={{ borderColor: 'var(--apx-border)' }}>
                          {displayImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={displayImage} alt={project.title} className="h-full w-full object-contain" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] apx-muted">No image</div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold apx-text">{project.title}</p>
                        </div>
                      </div>
                    </td>
                  ) : null}
                  {columns.type ? <td className="px-4 py-3 apx-text">{project.systemType || '-'}</td> : null}
                  {columns.industry ? <td className="px-4 py-3 apx-text">{project.industry || '-'}</td> : null}
                  {columns.category ? <td className="px-4 py-3 apx-text">{project.categories.length > 0 ? project.categories.join(', ') : '-'}</td> : null}
                  {columns.order ? (
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className="inline-flex rounded-full px-2 py-1 text-xs font-semibold"
                          style={{ backgroundColor: 'var(--apx-primary-soft)', color: 'var(--apx-primary)' }}
                        >
                          Project #{toProjectOrderValue(project)}
                        </span>
                        {project.isFeatured ? (
                          <span className="inline-flex rounded-full px-2 py-1 text-xs font-semibold" style={{ backgroundColor: 'rgba(250,204,21,0.16)', color: '#a16207' }}>
                            Featured #{project.featureOrder}
                          </span>
                        ) : null}
                      </div>
                    </td>
                  ) : null}
                  {columns.status ? (
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex rounded-full px-2 py-1 text-xs font-semibold" style={project.isPublished ? { backgroundColor: 'rgba(22,163,74,0.15)', color: '#15803d' } : { backgroundColor: 'rgba(100,116,139,0.2)', color: '#334155' }}>
                          {project.isPublished ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                  ) : null}
                  {columns.actions ? (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {rearrangeMode ? (
                          <>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation()
                                moveReorderItem(project.id, -1)
                              }}
                              className="apx-icon-action"
                              aria-label={`Move ${project.title} up`}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation()
                                moveReorderItem(project.id, 1)
                              }}
                              className="apx-icon-action"
                              aria-label={`Move ${project.title} down`}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation()
                                setPendingFeaturedProject(project)
                                setFeaturedPositionInput(project.isFeatured ? project.featureOrder : nextFeaturedOrder)
                                setConfirmConfig({
                                  title: project.isFeatured ? 'Remove from Featured' : 'Set as Featured',
                                  description: project.isFeatured
                                    ? `Remove ${project.title} from featured projects?`
                                    : `Set ${project.title} as featured.`,
                                  label: project.isFeatured ? 'Remove Featured' : 'Set Featured',
                                  tone: 'primary',
                                  kind: 'toggleFeatured',
                                })
                                setConfirmOpen(true)
                              }}
                              className="apx-icon-action"
                              style={
                                project.isFeatured
                                  ? {
                                      borderColor: 'rgba(250, 204, 21, 0.45)',
                                      color: '#a16207',
                                      backgroundColor: 'rgba(250, 204, 21, 0.14)',
                                    }
                                  : undefined
                              }
                              aria-label={`Toggle featured for ${project.title}`}
                            >
                              <Star className="h-4 w-4" />
                            </button>
                            
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation()
                                openEditModal(project)
                              }}
                              className="apx-icon-action"
                              aria-label={`Edit ${project.title}`}
                            >
                              <Edit2 className="apx-muted" />
                            </button>

                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation()
                                setPendingToggleProject(project)
                                setConfirmConfig({
                                  title: project.isPublished ? 'Deactivate Project' : 'Activate Project',
                                  description: `Set ${project.title} as ${project.isPublished ? 'inactive' : 'active'}?`,
                                  label: project.isPublished ? 'Deactivate' : 'Activate',
                                  tone: 'primary',
                                  kind: 'toggleActive',
                                })
                                setConfirmOpen(true)
                              }}
                              className="apx-icon-action"
                              style={
                                project.isPublished
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
                              aria-label={`Toggle ${project.title} status`}
                            >
                              <Power className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation()
                                setSelectedProject(project)
                                setConfirmConfig({
                                  title: 'Delete Project',
                                  description: `Delete ${project.title}? This action cannot be undone.`,
                                  label: 'Delete',
                                  tone: 'danger',
                                  kind: 'delete',
                                })
                                setConfirmOpen(true)
                              }}
                              className="apx-icon-action-danger"
                              aria-label={`Delete ${project.title}`}
                            >
                              <Trash2 />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  ) : null}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {!rearrangeMode ? (
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
      ) : null}

      {viewOpen && selectedProject ? (
        <ProjectViewModal
          key={`project-view-${selectedProject.id}-${viewOpen ? 'open' : 'closed'}`}
          open={viewOpen}
          project={selectedProject}
          onClose={() => {
            setViewOpen(false)
            setSelectedProject(null)
          }}
        />
      ) : null}

      <ProjectFormModal
        key={addOpen ? 'project-add-open' : 'project-add-closed'}
        title="Add Project"
        subtitle="Create a showcase project entry."
        open={addOpen}
        form={addForm}
        categories={categories}
        pending={pendingAction}
        onClose={() => setAddOpen(false)}
        onSubmit={() => {
          setConfirmConfig({
            title: 'Confirm Add Project',
            description: `Add ${addForm.title || 'this project'}?`,
            label: 'Add Project',
            tone: 'primary',
            kind: 'add',
          })
          setConfirmOpen(true)
        }}
        onChange={setAddForm}
      />

      <ProjectFormModal
        key={selectedProject ? `project-edit-${selectedProject.id}-${editOpen ? 'open' : 'closed'}` : 'project-edit-empty'}
        title="Edit Project"
        subtitle="Update project details."
        open={editOpen}
        form={editForm}
        categories={categories}
        pending={pendingAction}
        onClose={() => setEditOpen(false)}
        onSubmit={() => {
          setConfirmConfig({
            title: 'Confirm Edit Project',
            description: `Save changes for ${editForm.title || 'this project'}?`,
            label: 'Save Changes',
            tone: 'primary',
            kind: 'edit',
          })
          setConfirmOpen(true)
        }}
        onChange={setEditForm}
      />

      {confirmOpen && confirmConfig?.kind === 'toggleFeatured' && pendingFeaturedProject && !pendingFeaturedProject.isFeatured ? (
        <ApexModal
          size="sm"
          open
          title="Featured Position"
          subtitle={`Set featured position for ${pendingFeaturedProject.title}.`}
          onClose={() => {
            if (pendingAction) return
            setConfirmOpen(false)
            setConfirmConfig(null)
            setPendingFeaturedProject(null)
          }}
          layer="top"
        >
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium apx-muted">Featured Position / Order</label>
              <ApexInput
                type="number"
                min={1}
                value={String(featuredPositionInput)}
                onChange={(event) => setFeaturedPositionInput(Number(event.target.value) || 1)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <ApexButton
                type="button"
                variant="outline"
                onClick={() => {
                  setConfirmOpen(false)
                  setConfirmConfig(null)
                  setPendingFeaturedProject(null)
                }}
              >
                Cancel
              </ApexButton>
              <ApexButton
                type="button"
                onClick={executeConfirmedAction}
                disabled={pendingAction}
              >
                {pendingAction ? 'Saving...' : 'Continue'}
              </ApexButton>
            </div>
          </div>
        </ApexModal>
      ) : null}

      <ApexConfirmationModal
        open={confirmOpen && !!confirmConfig && !(confirmConfig.kind === 'toggleFeatured' && pendingFeaturedProject && !pendingFeaturedProject.isFeatured)}
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
