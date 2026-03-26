import { revalidatePath } from 'next/cache'
import { createHash, randomBytes } from 'node:crypto'
import { requirePermission } from '@/lib/server/admin-permission'
import { sql } from '@/lib/server/db'
import AdminTeamsTemplateView from '@/components/admin/teams/AdminTeamsTemplateView'

async function ensureTeamColumns() {
  await sql('alter table team_members add column if not exists avatar text')
  await sql('alter table team_members add column if not exists portfolio text')
  await sql('alter table team_members add column if not exists email text')
  await sql('alter table team_members add column if not exists sort_order integer not null default 1')
  await sql('alter table team_members add column if not exists is_active boolean not null default true')
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

async function resolveTeamAvatar(formData: FormData, name: string, fallback: string) {
  const profileImage = formData.get('profileImage')
  if (!(profileImage instanceof File) || profileImage.size <= 0) return fallback

  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60) || 'team-member'
  const filename = `${base}-${randomBytes(3).toString('hex')}`
  return uploadImageToCloudinary(profileImage, {
    folder: 'ProgreX Team',
    filename,
  })
}

async function saveTeam(formData: FormData) {
  'use server'
  await requirePermission('teams', 'write')
  await ensureTeamColumns()

  const id = String(formData.get('id') ?? '')
  const name = String(formData.get('name') ?? '').trim()
  const role = String(formData.get('role') ?? '').trim()
  const bio = String(formData.get('bio') ?? '').trim()
  const existingAvatar = String(formData.get('existingAvatar') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const portfolio = String(formData.get('portfolio') ?? '').trim()
  const avatar = await resolveTeamAvatar(formData, name, existingAvatar)
  const sortOrder = Math.max(1, Number(formData.get('sortOrder') ?? 1) || 1)
  const status = String(formData.get('status') ?? 'active')
  const isActive = status !== 'inactive'

  if (!name || !role) return

  if (id) {
    await sql(
      `update team_members
       set name = $2, role = $3, bio = $4, avatar = $5, email = $6, portfolio = $7, sort_order = $8, is_active = $9, updated_at = now()
       where id = $1`,
      [id, name, role, bio, avatar, email, portfolio, sortOrder, isActive]
    )
  } else {
    await sql(
      `insert into team_members(name, role, bio, avatar, email, portfolio, sort_order, is_active)
       values ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [name, role, bio, avatar, email, portfolio, sortOrder, isActive]
    )
  }

  revalidatePath('/admin/teams')
  revalidatePath('/about')
}

async function saveTeamReorder(formData: FormData) {
  'use server'
  await requirePermission('teams', 'write')

  const ids = String(formData.get('ids') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (ids.length === 0) return

  for (let i = 0; i < ids.length; i += 1) {
    await sql('update team_members set sort_order = $2, updated_at = now() where id = $1', [ids[i], i + 1])
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
  await ensureTeamColumns()

  const team = await sql<{
    id: string
    name: string
    role: string
    bio: string
    avatar: string
    email: string
    portfolio: string
    sort_order: number
    is_active: boolean
    updated_at: string | null
  }>('select id, name, role, bio, avatar, email, portfolio, sort_order, is_active, updated_at::text from team_members order by sort_order asc, created_at asc')

  return (
    <AdminTeamsTemplateView
      team={team.map((member) => ({
        id: member.id,
        name: member.name,
        role: member.role,
        bio: member.bio ?? '',
        avatar: member.avatar ?? '',
        email: member.email ?? '',
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
      saveTeamReorderAction={saveTeamReorder}
    />
  )
}
