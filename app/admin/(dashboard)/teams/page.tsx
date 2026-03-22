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

async function saveTeam(formData: FormData) {
  'use server'
  await requirePermission('teams', 'write')

  const id = String(formData.get('id') ?? '')
  const name = String(formData.get('name') ?? '').trim()
  const role = String(formData.get('role') ?? '').trim()
  const bio = String(formData.get('bio') ?? '').trim()
  const avatar = String(formData.get('avatar') ?? '').trim()
  const linkedin = String(formData.get('linkedin') ?? '').trim()
  const github = String(formData.get('github') ?? '').trim()
  const portfolio = String(formData.get('portfolio') ?? '').trim()
  const sortOrder = Number(formData.get('sortOrder') ?? 0)

  if (!name || !role) return

  if (id) {
    await sql(
      `update team_members
       set name = $2, role = $3, bio = $4, avatar = $5, linkedin = $6, github = $7, portfolio = $8, sort_order = $9, updated_at = now()
       where id = $1`,
      [id, name, role, bio, avatar, linkedin, github, portfolio, sortOrder]
    )
  } else {
    await sql(
      `insert into team_members(name, role, bio, avatar, linkedin, github, portfolio, sort_order, is_active)
       values ($1, $2, $3, $4, $5, $6, $7, $8, true)`,
      [name, role, bio, avatar, linkedin, github, portfolio, sortOrder]
    )
  }

  revalidatePath('/admin/teams')
  revalidatePath('/about')
}

async function deleteTeam(formData: FormData) {
  'use server'
  await requirePermission('teams', 'delete')
  const id = String(formData.get('id') ?? '')
  await sql('delete from team_members where id = $1', [id])
  revalidatePath('/admin/teams')
  revalidatePath('/about')
}

export default async function AdminTeamsPage() {
  await requirePermission('teams', 'read')

  const team = await sql<{
    id: string
    name: string
    role: string
    bio: string
    avatar: string
    linkedin: string
    github: string
    portfolio: string
    sort_order: number
  }>('select id, name, role, bio, avatar, linkedin, github, portfolio, sort_order from team_members order by sort_order asc, created_at asc')

  return (
    <div className="space-y-5">
      <ApexPageHeader title="Teams" subtitle="Maintain About page team cards and links." />

      <ApexCard>
        <ApexCardHeader title="Add Team Member" />
        <ApexCardBody>
          <form action={saveTeam}>
            <ApexFormGrid>
              <ApexInput name="name" placeholder="name" required />
              <ApexInput name="role" placeholder="role" required />
              <ApexInput name="avatar" placeholder="avatar URL" className="md:col-span-2" />
              <ApexTextarea name="bio" rows={3} placeholder="bio" className="md:col-span-2" />
              <ApexInput name="linkedin" placeholder="linkedin" />
              <ApexInput name="github" placeholder="github" />
              <ApexInput name="portfolio" placeholder="portfolio" />
              <ApexInput name="sortOrder" type="number" defaultValue={0} />
              <ApexButton type="submit" className="md:col-span-2">Save</ApexButton>
            </ApexFormGrid>
          </form>
        </ApexCardBody>
      </ApexCard>

      <div className="space-y-3">
        {team.map((member) => (
          <ApexCard key={member.id}>
            <ApexCardHeader title={member.name} subtitle={member.role} />
            <ApexCardBody>
            <form action={saveTeam} className="grid gap-3 md:grid-cols-2">
              <input type="hidden" name="id" value={member.id} />
              <ApexInput name="name" defaultValue={member.name} required />
              <ApexInput name="role" defaultValue={member.role} required />
              <ApexInput name="avatar" defaultValue={member.avatar ?? ''} className="md:col-span-2" />
              <ApexTextarea name="bio" rows={3} defaultValue={member.bio ?? ''} className="md:col-span-2" />
              <ApexInput name="linkedin" defaultValue={member.linkedin ?? ''} />
              <ApexInput name="github" defaultValue={member.github ?? ''} />
              <ApexInput name="portfolio" defaultValue={member.portfolio ?? ''} />
              <ApexInput name="sortOrder" type="number" defaultValue={member.sort_order ?? 0} />
              <div className="md:col-span-2 flex gap-2">
                <ApexButton variant="outline" type="submit">Update</ApexButton>
                <ApexButton formAction={deleteTeam} variant="danger" type="submit">Delete</ApexButton>
              </div>
            </form>
            </ApexCardBody>
          </ApexCard>
        ))}
      </div>
    </div>
  )
}
