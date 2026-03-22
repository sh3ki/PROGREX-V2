import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/server/admin-permission'
import { sql } from '@/lib/server/db'
import {
  ApexButton,
  ApexCard,
  ApexCardBody,
  ApexCardHeader,
  ApexInput,
  ApexPageHeader,
  ApexTextarea,
} from '@/components/admin/apex/AdminPrimitives'

async function saveSystem(formData: FormData) {
  'use server'
  await requirePermission('systems', 'write')

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

  let details: unknown = {}
  try { details = JSON.parse(detailsRaw || '{}') } catch { details = {} }

  if (!slug || !name) return

  if (id) {
    await sql(
      `update ready_made_systems
       set slug = $2, name = $3, category = $4, industry = $5, tagline = $6,
           short_desc = $7, image = $8, has_demo = $9, sort_order = $10,
           details = $11::jsonb, updated_at = now()
       where id = $1`,
      [id, slug, name, category, industry, tagline, shortDesc, image, hasDemo, sortOrder, JSON.stringify(details)]
    )
  } else {
    await sql(
      `insert into ready_made_systems(slug, name, category, industry, tagline, short_desc, image, has_demo, sort_order, details, is_published)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, true)`,
      [slug, name, category, industry, tagline, shortDesc, image, hasDemo, sortOrder, JSON.stringify(details)]
    )
  }

  revalidatePath('/admin/systems')
  revalidatePath('/ready-made-systems')
  revalidatePath('/')
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
  }>('select id, slug, name, category, industry, tagline, short_desc, image, has_demo, sort_order, details from ready_made_systems order by sort_order asc, created_at asc')

  return (
    <div className="space-y-5">
      <ApexPageHeader title="Ready-Made Systems" subtitle="Manage productized systems shown on landing and systems pages." />

      <div className="space-y-3">
        {systems.map((system) => (
          <ApexCard key={system.id}>
            <ApexCardHeader title={system.name} subtitle={system.slug} />
            <ApexCardBody>
            <form action={saveSystem} className="grid gap-3 md:grid-cols-2">
              <input type="hidden" name="id" value={system.id} />
              <ApexInput name="slug" defaultValue={system.slug} required />
              <ApexInput name="name" defaultValue={system.name} required />
              <ApexInput name="category" defaultValue={system.category ?? ''} />
              <ApexInput name="industry" defaultValue={system.industry ?? ''} />
              <ApexInput name="tagline" defaultValue={system.tagline ?? ''} className="md:col-span-2" />
              <ApexTextarea name="shortDesc" rows={2} defaultValue={system.short_desc ?? ''} className="md:col-span-2" />
              <ApexInput name="image" defaultValue={system.image ?? ''} className="md:col-span-2" />
              <label className="text-xs apx-muted"><input type="checkbox" name="hasDemo" defaultChecked={system.has_demo} /> Has demo</label>
              <ApexInput name="sortOrder" type="number" defaultValue={system.sort_order ?? 0} />
              <ApexTextarea name="details" rows={8} defaultValue={JSON.stringify(system.details ?? {}, null, 2)} className="font-mono text-xs md:col-span-2" />
              <div className="md:col-span-2 flex gap-2">
                <ApexButton variant="outline" type="submit">Update</ApexButton>
                <ApexButton formAction={deleteSystem} variant="danger" type="submit">Delete</ApexButton>
              </div>
            </form>
            </ApexCardBody>
          </ApexCard>
        ))}
      </div>
    </div>
  )
}
