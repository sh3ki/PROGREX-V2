import { revalidatePath } from 'next/cache'
import { createHash, randomBytes } from 'node:crypto'
import { requirePermission } from '@/lib/server/admin-permission'
import { sql } from '@/lib/server/db'
import AdminProjectsTemplateView from '@/components/admin/projects/AdminProjectsTemplateView'

async function ensureProjectsStatusColumn() {
  await sql('alter table projects add column if not exists is_published boolean not null default true')
}

async function ensureProjectResultsMetricSlots() {
  await sql(
    `update projects
     set details = jsonb_set(
       coalesce(details, '{}'::jsonb),
       '{results}',
       case
         when jsonb_typeof(coalesce(details, '{}'::jsonb)->'results') = 'array' then
           (
             (
               select jsonb_agg(
                 jsonb_build_object(
                   'value', coalesce(nullif(item->>'value', ''), 'N/A'),
                   'metric', coalesce(nullif(item->>'metric', ''), 'Additional KPI')
                 )
               )
               from (
                 select item
                 from jsonb_array_elements(coalesce(details, '{}'::jsonb)->'results') as item
                 limit 4
               ) trimmed
             ) ||
             (
               select coalesce(
                 jsonb_agg(jsonb_build_object('value', 'N/A', 'metric', 'Additional KPI')),
                 '[]'::jsonb
               )
               from generate_series(
                 1,
                 greatest(0, 4 - least(4, jsonb_array_length(coalesce(details, '{}'::jsonb)->'results')))
               )
             )
           )
         else
           jsonb_build_array(
             jsonb_build_object('value', 'N/A', 'metric', 'Additional KPI'),
             jsonb_build_object('value', 'N/A', 'metric', 'Additional KPI'),
             jsonb_build_object('value', 'N/A', 'metric', 'Additional KPI'),
             jsonb_build_object('value', 'N/A', 'metric', 'Additional KPI')
           )
       end,
       true
     ),
     updated_at = now()`
  )
}

type ProjectImageOrderItem =
  | { id: string; kind: 'existing'; url: string }
  | { id: string; kind: 'new' }

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

async function makeUniqueSlug(baseInput: string, currentId?: string) {
  const base = slugify(baseInput) || `project-${Date.now()}`

  const existing = currentId
    ? await sql<{ slug: string }>('select slug from projects where id <> $1::uuid', [currentId])
    : await sql<{ slug: string }>('select slug from projects')
  const used = new Set(existing.map((row) => row.slug))

  if (!used.has(base)) return base

  let count = 2
  let next = `${base}-${count}`
  while (used.has(next)) {
    count += 1
    next = `${base}-${count}`
  }
  return next
}

function isPositiveInt(value: number) {
  return Number.isInteger(value) && value > 0
}

function parseCommaSeparated(input: string) {
  return input
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseJson<T>(input: string, fallback: T): T {
  try {
    return JSON.parse(input) as T
  } catch {
    return fallback
  }
}

async function getFeaturedMaxOrder() {
  const rows = await sql<{ max_order: string }>(
    'select coalesce(max(feature_order), 0)::text as max_order from projects where is_featured = true'
  )
  return Number(rows[0]?.max_order ?? 0)
}

async function assertFeaturedOrderAvailable(featureOrder: number, currentId?: string) {
  if (!isPositiveInt(featureOrder)) {
    throw new Error('Featured position must be a positive whole number.')
  }

  const conflict = await sql<{ id: string }>(
    'select id from projects where is_featured = true and feature_order = $1 and id <> coalesce($2::uuid, id) limit 1',
    [featureOrder, currentId ?? null]
  )

  if (conflict.length > 0) {
    const maxOrder = await getFeaturedMaxOrder()
    throw new Error(`Featured position ${featureOrder} is already taken. Current last featured position is ${maxOrder}.`)
  }
}

async function uploadImageToCloudinary(file: File, opts: { folder: string; filename: string }) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.')
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const signatureBase = `folder=${opts.folder}&public_id=${opts.filename}&timestamp=${timestamp}${apiSecret}`
  const signature = createHash('sha1').update(signatureBase).digest('hex')

  const body = new FormData()
  body.append('file', file)
  body.append('api_key', apiKey)
  body.append('timestamp', String(timestamp))
  body.append('folder', opts.folder)
  body.append('public_id', opts.filename)
  body.append('signature', signature)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body,
  })

  const payload = (await response.json()) as { secure_url?: string; error?: { message?: string } }

  if (!response.ok || !payload.secure_url) {
    throw new Error(payload.error?.message || 'Cloudinary upload failed.')
  }

  return payload.secure_url
}

async function resolveProjectImages(input: {
  formData: FormData
  title: string
  imageOrderRaw: string
  selectedPrimaryId: string
}) {
  const order = parseJson<ProjectImageOrderItem[]>(input.imageOrderRaw, [])
  const folder = `ProgreX Projects/${slugify(input.title) || 'untitled-project'}`

  const uploadedUrlsById = new Map<string, string>()

  for (let i = 0; i < order.length; i += 1) {
    const item = order[i]
    if (item.kind !== 'new') continue

    const fieldName = `upload_${item.id}`
    const file = input.formData.get(fieldName)
    if (!(file instanceof File)) continue

    const code = randomBytes(3).toString('hex')
    const filename = `${i + 1}_${code}`
    const uploadedUrl = await uploadImageToCloudinary(file, { folder, filename })
    uploadedUrlsById.set(item.id, uploadedUrl)
  }

  const orderedImages = order
    .map((item) => {
      if (item.kind === 'existing') return item.url
      return uploadedUrlsById.get(item.id) || ''
    })
    .filter(Boolean)

  const selectedPrimary = order.find((item) => item.id === input.selectedPrimaryId)
  const primaryImage =
    selectedPrimary?.kind === 'existing'
      ? selectedPrimary.url
      : selectedPrimary
      ? uploadedUrlsById.get(selectedPrimary.id) || ''
      : ''

  return {
    primaryImage: primaryImage || orderedImages[0] || '',
    images: orderedImages,
  }
}

async function saveProject(formData: FormData) {
  'use server'
  await requirePermission('projects', 'write')
  await ensureProjectsStatusColumn()

  const id = String(formData.get('id') ?? '').trim()
  const title = String(formData.get('title') ?? '').trim()
  const systemType = String(formData.get('systemType') ?? '').trim()
  const industry = String(formData.get('industry') ?? '').trim()
  const shortDesc = String(formData.get('shortDesc') ?? '').trim()
  const categories = parseJson<string[]>(String(formData.get('categoriesJson') ?? '[]'), [])
  const tags = parseCommaSeparated(String(formData.get('tags') ?? ''))
  const baseDetails = parseJson<Record<string, unknown>>(String(formData.get('baseDetails') ?? '{}'), {})
  const overview = String(formData.get('overview') ?? '').trim()
  const problem = String(formData.get('problem') ?? '').trim()
  const solution = String(formData.get('solution') ?? '').trim()
  const featureItems = parseJson<string[]>(String(formData.get('featuresJson') ?? '[]'), []).filter(Boolean)
  const technologies = parseCommaSeparated(String(formData.get('technologies') ?? ''))
  const resultsItems = parseJson<Array<{ value: string; metric: string }>>(
    String(formData.get('resultsJson') ?? '[]'),
    []
  )
    .map((item) => ({
      value: String(item.value ?? '').trim(),
      metric: String(item.metric ?? '').trim(),
    }))
    .filter((item) => item.value || item.metric)

  if (resultsItems.length !== 4 || resultsItems.some((item) => !item.value || !item.metric)) {
    throw new Error('Projects must have exactly 4 result value + metric pairs.')
  }
  const testimonialAuthor = String(formData.get('testimonialAuthor') ?? '').trim()
  const testimonialRole = String(formData.get('testimonialRole') ?? '').trim()
  const testimonialQuote = String(formData.get('testimonialQuote') ?? '').trim()
  const positionOrder = Number(formData.get('positionOrder') ?? 0)
  const isFeatured = formData.get('isFeatured') === 'on'
  const featureOrder = Number(formData.get('featureOrder') ?? 0)
  const imageOrderRaw = String(formData.get('imageOrder') ?? '[]')
  const selectedPrimaryId = String(formData.get('selectedPrimaryImageId') ?? '')
  const status = String(formData.get('status') ?? 'active')
  const isPublished = status !== 'inactive'

  if (!title) return

  const slug = await makeUniqueSlug(title, id || undefined)

  const imagePayload = await resolveProjectImages({
    formData,
    title,
    imageOrderRaw,
    selectedPrimaryId,
  })

  if (isFeatured) {
    await assertFeaturedOrderAvailable(featureOrder, id || undefined)
  }

  const details: Record<string, unknown> = {
    ...baseDetails,
    overview,
    problem,
    solution,
    features: featureItems,
    technologies,
    results: resultsItems,
    testimonial: {
      author: testimonialAuthor,
      role: testimonialRole,
      quote: testimonialQuote,
    },
    images: imagePayload.images,
    positionOrder: isPositiveInt(positionOrder) ? positionOrder : 999,
  }

  if (id) {
    await sql(
      `update projects
       set slug = $2, title = $3, system_type = $4, industry = $5, image = $6, short_desc = $7,
           categories = $8::text[], tags = $9::text[], details = $10::jsonb,
           is_featured = $11, feature_order = $12, is_published = $13, updated_at = now()
       where id = $1`,
      [
        id,
        slug,
        title,
        systemType,
        industry,
        imagePayload.primaryImage,
        shortDesc,
        categories,
        tags,
        JSON.stringify(details),
        isFeatured,
        isFeatured ? featureOrder : 999,
        isPublished,
      ]
    )
  } else {
    await sql(
      `insert into projects(slug, title, system_type, industry, image, short_desc, categories, tags, details, is_featured, feature_order, is_published)
       values ($1, $2, $3, $4, $5, $6, $7::text[], $8::text[], $9::jsonb, $10, $11, $12)`,
      [
        slug,
        title,
        systemType,
        industry,
        imagePayload.primaryImage,
        shortDesc,
        categories,
        tags,
        JSON.stringify(details),
        isFeatured,
        isFeatured ? featureOrder : 999,
        isPublished,
      ]
    )
  }

  revalidatePath('/admin/projects')
  revalidatePath('/projects')
  revalidatePath('/')
}

async function toggleProjectFeatured(formData: FormData) {
  'use server'
  await requirePermission('projects', 'write')

  const id = String(formData.get('id') ?? '').trim()
  const nextFeaturedRaw = String(formData.get('nextFeatured') ?? '').trim()
  const nextFeatured = nextFeaturedRaw === 'true'
  const featureOrder = Number(formData.get('featureOrder') ?? 0)

  if (!id) return

  if (nextFeatured) {
    await assertFeaturedOrderAvailable(featureOrder, id)
  }

  await sql(
    `update projects
     set is_featured = $2,
         feature_order = $3,
         updated_at = now()
     where id = $1`,
    [id, nextFeatured, nextFeatured ? featureOrder : 999]
  )

  revalidatePath('/admin/projects')
  revalidatePath('/projects')
  revalidatePath('/')
}

async function saveProjectsReorder(formData: FormData) {
  'use server'
  await requirePermission('projects', 'write')

  const mode = String(formData.get('mode') ?? 'projects').trim()
  const ids = String(formData.get('ids') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (ids.length === 0) return

  for (let i = 0; i < ids.length; i += 1) {
    const projectId = ids[i]

    if (mode === 'featured') {
      await sql(
        `update projects
         set feature_order = $2,
             updated_at = now()
         where id = $1 and is_featured = true`,
        [projectId, i + 1]
      )
      continue
    }

    await sql(
      `update projects
       set details = jsonb_set(coalesce(details, '{}'::jsonb), '{positionOrder}', to_jsonb($2::int), true),
           updated_at = now()
       where id = $1`,
      [projectId, i + 1]
    )
  }

  revalidatePath('/admin/projects')
  revalidatePath('/projects')
  revalidatePath('/')
}

async function deleteProject(formData: FormData) {
  'use server'
  await requirePermission('projects', 'delete')
  const id = String(formData.get('id') ?? '')
  await sql('delete from projects where id = $1', [id])
  revalidatePath('/admin/projects')
  revalidatePath('/projects')
  revalidatePath('/')
}

async function toggleProjectActive(formData: FormData) {
  'use server'
  await requirePermission('projects', 'write')
  await ensureProjectsStatusColumn()

  const id = String(formData.get('id') ?? '').trim()
  if (!id) return

  await sql('update projects set is_published = not is_published, updated_at = now() where id = $1', [id])
  revalidatePath('/admin/projects')
  revalidatePath('/projects')
  revalidatePath('/')
}

async function bulkDeleteProjects(formData: FormData) {
  'use server'
  await requirePermission('projects', 'delete')
  await ensureProjectsStatusColumn()

  const raw = String(formData.get('ids') ?? '')
  const ids = raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (ids.length === 0) return

  await sql('delete from projects where id = any($1::uuid[])', [ids])
  revalidatePath('/admin/projects')
  revalidatePath('/projects')
  revalidatePath('/')
}

async function bulkSetInactiveProjects(formData: FormData) {
  'use server'
  await requirePermission('projects', 'write')
  await ensureProjectsStatusColumn()

  const raw = String(formData.get('ids') ?? '')
  const ids = raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (ids.length === 0) return

  await sql('update projects set is_published = false, updated_at = now() where id = any($1::uuid[])', [ids])
  revalidatePath('/admin/projects')
  revalidatePath('/projects')
  revalidatePath('/')
}

export default async function AdminProjectsPage() {
  await requirePermission('projects', 'read')
  await ensureProjectsStatusColumn()
  await ensureProjectResultsMetricSlots()

  const projects = await sql<{
    id: string
    slug: string
    title: string
    system_type: string
    industry: string
    image: string
    short_desc: string
    categories: string[]
    tags: string[]
    details: unknown
    is_featured: boolean
    feature_order: number
    is_published: boolean
    updated_at: string | null
  }>(`select id, slug, title, system_type, industry, image, short_desc, categories, tags, details, is_featured, feature_order, is_published, updated_at::text
      from projects
      order by
        case
          when (details ->> 'positionOrder') ~ '^\\d+$' then (details ->> 'positionOrder')::int
          else 999999
        end asc,
        created_at desc`)

  const categories = Array.from(
    new Set(
      projects.flatMap((project) => project.categories ?? []).filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b))

  const initialPositionOrder =
    projects.reduce((max, project) => {
      if (!project.details || typeof project.details !== 'object') return max
      const raw = (project.details as Record<string, unknown>).positionOrder
      const value = Number(raw)
      return Number.isInteger(value) && value > 0 && value > max ? value : max
    }, 0) + 1

  const initialFeaturedOrder =
    projects.reduce((max, project) => {
      if (!project.is_featured) return max
      const value = Number(project.feature_order)
      return Number.isInteger(value) && value > 0 && value > max ? value : max
    }, 0) + 1

  return (
    <AdminProjectsTemplateView
      projects={projects.map((project) => ({
        id: project.id,
        slug: project.slug,
        title: project.title,
        systemType: project.system_type ?? '',
        industry: project.industry ?? '',
        image: project.image ?? '',
        shortDesc: project.short_desc ?? '',
        categories: project.categories ?? [],
        tags: project.tags ?? [],
        details: project.details ?? {},
        isFeatured: project.is_featured,
        featureOrder: project.feature_order ?? 999,
        isPublished: project.is_published,
        updatedAt: project.updated_at,
      }))}
      categories={categories}
      initialPositionOrder={initialPositionOrder}
      initialFeaturedOrder={initialFeaturedOrder}
      createProjectAction={saveProject}
      updateProjectAction={saveProject}
      deleteProjectAction={deleteProject}
      bulkDeleteProjectsAction={bulkDeleteProjects}
      bulkSetInactiveProjectsAction={bulkSetInactiveProjects}
      toggleProjectActiveAction={toggleProjectActive}
      toggleProjectFeaturedAction={toggleProjectFeatured}
      saveProjectsReorderAction={saveProjectsReorder}
    />
  )
}
