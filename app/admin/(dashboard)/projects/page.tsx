import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/server/admin-permission'
import { sql } from '@/lib/server/db'
import AdminProjectsTemplateView from '@/components/admin/projects/AdminProjectsTemplateView'

async function ensureProjectsStatusColumn() {
  await sql('alter table projects add column if not exists is_published boolean not null default true')
}

async function saveProject(formData: FormData) {
  'use server'
  await requirePermission('projects', 'write')
  await ensureProjectsStatusColumn()

  const id = String(formData.get('id') ?? '')
  const slug = String(formData.get('slug') ?? '').trim()
  const title = String(formData.get('title') ?? '').trim()
  const systemType = String(formData.get('systemType') ?? '').trim()
  const industry = String(formData.get('industry') ?? '').trim()
  const image = String(formData.get('image') ?? '').trim()
  const shortDesc = String(formData.get('shortDesc') ?? '').trim()
  const categories = String(formData.get('categories') ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  const tags = String(formData.get('tags') ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  const detailsRaw = String(formData.get('details') ?? '{}')
  const isFeatured = formData.get('isFeatured') === 'on'
  const featureOrder = Number(formData.get('featureOrder') ?? 999)
  const status = String(formData.get('status') ?? 'active')
  const isPublished = status !== 'inactive'

  let details: unknown = {}
  try { details = JSON.parse(detailsRaw || '{}') } catch { details = {} }

  if (!slug || !title) return

  if (id) {
    await sql(
      `update projects
       set slug = $2, title = $3, system_type = $4, industry = $5, image = $6, short_desc = $7,
           categories = $8::text[], tags = $9::text[], details = $10::jsonb,
           is_featured = $11, feature_order = $12, is_published = $13, updated_at = now()
       where id = $1`,
      [id, slug, title, systemType, industry, image, shortDesc, categories, tags, JSON.stringify(details), isFeatured, featureOrder, isPublished]
    )
  } else {
    await sql(
      `insert into projects(slug, title, system_type, industry, image, short_desc, categories, tags, details, is_featured, feature_order, is_published)
       values ($1, $2, $3, $4, $5, $6, $7::text[], $8::text[], $9::jsonb, $10, $11, $12)`,
      [slug, title, systemType, industry, image, shortDesc, categories, tags, JSON.stringify(details), isFeatured, featureOrder, isPublished]
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
  }>('select id, slug, title, system_type, industry, image, short_desc, categories, tags, details, is_featured, feature_order, is_published, updated_at::text from projects order by created_at desc')

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
      createProjectAction={saveProject}
      updateProjectAction={saveProject}
      deleteProjectAction={deleteProject}
      bulkDeleteProjectsAction={bulkDeleteProjects}
      bulkSetInactiveProjectsAction={bulkSetInactiveProjects}
      toggleProjectActiveAction={toggleProjectActive}
    />
  )
}
