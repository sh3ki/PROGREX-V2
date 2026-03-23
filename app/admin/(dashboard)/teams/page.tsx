import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/server/admin-permission'
import { sql } from '@/lib/server/db'
import AdminTeamsTemplateView from '@/components/admin/teams/AdminTeamsTemplateView'

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
  const status = String(formData.get('status') ?? 'active')
  const isActive = status !== 'inactive'

  if (!name || !role) return

  if (id) {
    await sql(
      `update team_members
       set name = $2, role = $3, bio = $4, avatar = $5, linkedin = $6, github = $7, portfolio = $8, sort_order = $9, is_active = $10, updated_at = now()
       where id = $1`,
      [id, name, role, bio, avatar, linkedin, github, portfolio, sortOrder, isActive]
    )
  } else {
    await sql(
      `insert into team_members(name, role, bio, avatar, linkedin, github, portfolio, sort_order, is_active)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [name, role, bio, avatar, linkedin, github, portfolio, sortOrder, isActive]
    )
  }

  revalidatePath('/admin/teams')
  revalidatePath('/about')
}

async function toggleTeamActive(formData: FormData) {
  'use server'
  await requirePermission('teams', 'write')

  const id = String(formData.get('id') ?? '').trim()
  if (!id) return

  await sql('update team_members set is_active = not is_active, updated_at = now() where id = $1', [id])
  revalidatePath('/admin/teams')
  revalidatePath('/about')
}

async function bulkDeleteTeam(formData: FormData) {
  'use server'
  await requirePermission('teams', 'delete')

  const raw = String(formData.get('ids') ?? '')
  const ids = raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (ids.length === 0) return

  await sql('delete from team_members where id = any($1::uuid[])', [ids])
  revalidatePath('/admin/teams')
  revalidatePath('/about')
}

async function bulkSetInactiveTeam(formData: FormData) {
  'use server'
  await requirePermission('teams', 'write')

  const raw = String(formData.get('ids') ?? '')
  const ids = raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (ids.length === 0) return

  await sql('update team_members set is_active = false, updated_at = now() where id = any($1::uuid[])', [ids])
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
    is_active: boolean
    updated_at: string | null
  }>('select id, name, role, bio, avatar, linkedin, github, portfolio, sort_order, is_active, updated_at::text from team_members order by sort_order asc, created_at asc')

  return (
    <AdminTeamsTemplateView
      team={team.map((member) => ({
        id: member.id,
        name: member.name,
        role: member.role,
        bio: member.bio ?? '',
        avatar: member.avatar ?? '',
        linkedin: member.linkedin ?? '',
        github: member.github ?? '',
        portfolio: member.portfolio ?? '',
        sortOrder: member.sort_order ?? 0,
        isActive: member.is_active,
        updatedAt: member.updated_at,
      }))}
      createTeamAction={saveTeam}
      updateTeamAction={saveTeam}
      deleteTeamAction={deleteTeam}
      bulkDeleteTeamAction={bulkDeleteTeam}
      bulkSetInactiveTeamAction={bulkSetInactiveTeam}
      toggleTeamActiveAction={toggleTeamActive}
    />
  )
}
