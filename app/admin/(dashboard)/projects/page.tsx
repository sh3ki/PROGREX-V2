import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/server/admin-permission'
import { sql } from '@/lib/server/db'
import {
  ApexButton,
  ApexCard,
  ApexCardBody,
  ApexCardHeader,
  ApexFormGrid,
  ApexInput,
  ApexPageHeader,
  ApexTextarea,
} from '@/components/admin/apex/AdminPrimitives'

async function saveProject(formData: FormData) {
  'use server'
  await requirePermission('projects', 'write')

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

  let details: unknown = {}
  try { details = JSON.parse(detailsRaw || '{}') } catch { details = {} }

  if (!slug || !title) return

  if (id) {
    await sql(
      `update projects
       set slug = $2, title = $3, system_type = $4, industry = $5, image = $6, short_desc = $7,
           categories = $8::text[], tags = $9::text[], details = $10::jsonb,
           is_featured = $11, feature_order = $12, updated_at = now()
       where id = $1`,
      [id, slug, title, systemType, industry, image, shortDesc, categories, tags, JSON.stringify(details), isFeatured, featureOrder]
    )
  } else {
    await sql(
      `insert into projects(slug, title, system_type, industry, image, short_desc, categories, tags, details, is_featured, feature_order, is_published)
       values ($1, $2, $3, $4, $5, $6, $7::text[], $8::text[], $9::jsonb, $10, $11, true)`,
      [slug, title, systemType, industry, image, shortDesc, categories, tags, JSON.stringify(details), isFeatured, featureOrder]
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

export default async function AdminProjectsPage() {
  await requirePermission('projects', 'read')

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
  }>('select id, slug, title, system_type, industry, image, short_desc, categories, tags, details, is_featured, feature_order from projects order by created_at desc')

  return (
    <div className="space-y-5">
      <ApexPageHeader title="Projects" subtitle="Manage showcase projects for homepage and project listings." />

      <ApexCard>
        <ApexCardHeader title="Create New Project" />
        <ApexCardBody>
          <form action={saveProject}>
            <ApexFormGrid>
              <ApexInput name="slug" placeholder="slug" required />
              <ApexInput name="title" placeholder="title" required />
              <ApexInput name="systemType" placeholder="system type" />
              <ApexInput name="industry" placeholder="industry" />
              <ApexInput name="image" placeholder="image url" className="md:col-span-2" />
              <ApexTextarea name="shortDesc" rows={2} placeholder="short description" className="md:col-span-2" />
              <ApexInput name="categories" placeholder="categories (comma-separated)" />
              <ApexInput name="tags" placeholder="tags (comma-separated)" />
              <ApexTextarea name="details" rows={6} defaultValue="{}" className="font-mono text-xs md:col-span-2" />
              <label className="text-xs apx-muted"><input type="checkbox" name="isFeatured" /> Featured</label>
              <ApexInput name="featureOrder" type="number" defaultValue={999} />
              <ApexButton type="submit" className="md:col-span-2">Save</ApexButton>
            </ApexFormGrid>
          </form>
        </ApexCardBody>
      </ApexCard>

      <div className="space-y-3">
        {projects.map((project) => (
          <ApexCard key={project.id}>
            <ApexCardHeader title={project.title} subtitle={project.slug} />
            <ApexCardBody>
            <form action={saveProject} className="grid gap-3 md:grid-cols-2">
              <input type="hidden" name="id" value={project.id} />
              <ApexInput name="slug" defaultValue={project.slug} required />
              <ApexInput name="title" defaultValue={project.title} required />
              <ApexInput name="systemType" defaultValue={project.system_type ?? ''} />
              <ApexInput name="industry" defaultValue={project.industry ?? ''} />
              <ApexInput name="image" defaultValue={project.image ?? ''} className="md:col-span-2" />
              <ApexTextarea name="shortDesc" rows={2} defaultValue={project.short_desc ?? ''} className="md:col-span-2" />
              <ApexInput name="categories" defaultValue={(project.categories ?? []).join(', ')} />
              <ApexInput name="tags" defaultValue={(project.tags ?? []).join(', ')} />
              <ApexTextarea name="details" rows={6} defaultValue={JSON.stringify(project.details ?? {}, null, 2)} className="font-mono text-xs md:col-span-2" />
              <label className="text-xs apx-muted"><input type="checkbox" name="isFeatured" defaultChecked={project.is_featured} /> Featured</label>
              <ApexInput name="featureOrder" type="number" defaultValue={project.feature_order ?? 999} />
              <div className="md:col-span-2 flex gap-2">
                <ApexButton variant="outline" type="submit">Update</ApexButton>
                <ApexButton formAction={deleteProject} variant="danger" type="submit">Delete</ApexButton>
              </div>
            </form>
            </ApexCardBody>
          </ApexCard>
        ))}
      </div>
    </div>
  )
}
