import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/server/admin-permission'
import { sql } from '@/lib/server/db'
import AdminSystemsTemplateView from '@/components/admin/systems/AdminSystemsTemplateView'

async function ensureSystemsStatusColumn() {
  await sql('alter table ready_made_systems add column if not exists is_published boolean not null default true')
}

async function saveSystem(formData: FormData) {
  'use server'
  await requirePermission('systems', 'write')
  await ensureSystemsStatusColumn()

  const id = String(formData.get('id') ?? '')
  const slug = String(formData.get('slug') ?? '').trim()
  const name = String(formData.get('name') ?? '').trim()
  const category = String(formData.get('category') ?? '').trim()
  const industry = String(formData.get('industry') ?? '').trim()
  const tagline = String(formData.get('tagline') ?? '').trim()
  const shortDesc = String(formData.get('shortDesc') ?? '').trim()
  const image = String(formData.get('image') ?? '').trim()
  const hasDemo = formData.get('hasDemo') === 'on'
  const sortOrder = Number(formData.get('sortOrder') ?? 0)
  const detailsRaw = String(formData.get('details') ?? '{}')
  const status = String(formData.get('status') ?? 'active')
  const isPublished = status !== 'inactive'

  let details: unknown = {}
  try { details = JSON.parse(detailsRaw || '{}') } catch { details = {} }

  if (!slug || !name) return

  if (id) {
    await sql(
      `update ready_made_systems
       set slug = $2, name = $3, category = $4, industry = $5, tagline = $6,
           short_desc = $7, image = $8, has_demo = $9, sort_order = $10,
           details = $11::jsonb, is_published = $12, updated_at = now()
       where id = $1`,
      [id, slug, name, category, industry, tagline, shortDesc, image, hasDemo, sortOrder, JSON.stringify(details), isPublished]
    )
  } else {
    await sql(
      `insert into ready_made_systems(slug, name, category, industry, tagline, short_desc, image, has_demo, sort_order, details, is_published)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11)`,
      [slug, name, category, industry, tagline, shortDesc, image, hasDemo, sortOrder, JSON.stringify(details), isPublished]
    )
  }

  revalidatePath('/admin/systems')
  revalidatePath('/ready-made-systems')
  revalidatePath('/')
}

async function toggleSystemActive(formData: FormData) {
  'use server'
  await requirePermission('systems', 'write')
  await ensureSystemsStatusColumn()

  const id = String(formData.get('id') ?? '').trim()
  if (!id) return

  await sql('update ready_made_systems set is_published = not is_published, updated_at = now() where id = $1', [id])
  revalidatePath('/admin/systems')
  revalidatePath('/ready-made-systems')
}

async function bulkDeleteSystems(formData: FormData) {
  'use server'
  await requirePermission('systems', 'delete')
  await ensureSystemsStatusColumn()

  const raw = String(formData.get('ids') ?? '')
  const ids = raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (ids.length === 0) return

  await sql('delete from ready_made_systems where id = any($1::uuid[])', [ids])
  revalidatePath('/admin/systems')
  revalidatePath('/ready-made-systems')
}

async function bulkSetInactiveSystems(formData: FormData) {
  'use server'
  await requirePermission('systems', 'write')
  await ensureSystemsStatusColumn()

  const raw = String(formData.get('ids') ?? '')
  const ids = raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (ids.length === 0) return

  await sql('update ready_made_systems set is_published = false, updated_at = now() where id = any($1::uuid[])', [ids])
  revalidatePath('/admin/systems')
  revalidatePath('/ready-made-systems')
}

async function deleteSystem(formData: FormData) {
  'use server'
  await requirePermission('systems', 'delete')
  const id = String(formData.get('id') ?? '')
  await sql('delete from ready_made_systems where id = $1', [id])
  revalidatePath('/admin/systems')
  revalidatePath('/ready-made-systems')
}

export default async function AdminSystemsPage() {
  await requirePermission('systems', 'read')
  await ensureSystemsStatusColumn()

  const systems = await sql<{
    id: string
    slug: string
    name: string
    category: string
    industry: string
    tagline: string
    short_desc: string
    image: string
    has_demo: boolean
    sort_order: number
    details: unknown
    is_published: boolean
    updated_at: string | null
  }>('select id, slug, name, category, industry, tagline, short_desc, image, has_demo, sort_order, details, is_published, updated_at::text from ready_made_systems order by sort_order asc, created_at asc')

  return (
    <AdminSystemsTemplateView
      systems={systems.map((system) => ({
        id: system.id,
        slug: system.slug,
        name: system.name,
        category: system.category ?? '',
        industry: system.industry ?? '',
        tagline: system.tagline ?? '',
        shortDesc: system.short_desc ?? '',
        image: system.image ?? '',
        hasDemo: system.has_demo,
        sortOrder: system.sort_order ?? 0,
        details: system.details ?? {},
        isPublished: system.is_published,
        updatedAt: system.updated_at,
      }))}
      createSystemAction={saveSystem}
      updateSystemAction={saveSystem}
      deleteSystemAction={deleteSystem}
      bulkDeleteSystemsAction={bulkDeleteSystems}
      bulkSetInactiveSystemsAction={bulkSetInactiveSystems}
      toggleSystemActiveAction={toggleSystemActive}
    />
  )
}
