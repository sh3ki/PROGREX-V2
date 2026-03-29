import { revalidatePath } from 'next/cache'
import { createHash, randomBytes } from 'node:crypto'
import { hashPassword } from '@/lib/server/auth'
import { requirePermission } from '@/lib/server/admin-permission'
import { sql } from '@/lib/server/db'
import AdminUsersTemplateView from '@/components/admin/users/AdminUsersTemplateView'

async function ensureUserProfileImageColumn() {
  await sql('alter table admin_users add column if not exists profile_image_url text')
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

async function resolveProfileImage(formData: FormData, fullName: string, fallback: string) {
  const profileImage = formData.get('profileImage')
  if (!(profileImage instanceof File) || profileImage.size <= 0) return fallback

  const base = fullName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60) || 'admin-user'
  const filename = `${base}-${randomBytes(3).toString('hex')}`
  return uploadImageToCloudinary(profileImage, {
    folder: 'ProgreX Profiles',
    filename,
  })
}

async function createUser(formData: FormData) {
  'use server'
  await requirePermission('users', 'write')
  await ensureUserProfileImageColumn()

  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const fullName = String(formData.get('fullName') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const roleId = String(formData.get('roleId') ?? '')
  const status = String(formData.get('status') ?? 'active')
  const isActive = status !== 'inactive'

  if (!email || !fullName || !password || !roleId) return

  const passwordHash = await hashPassword(password)
  const profileImageUrl = await resolveProfileImage(formData, fullName, '')

  await sql(
    `insert into admin_users(email, full_name, password_hash, role_id, is_active, profile_image_url)
     values ($1, $2, $3, $4, $5, $6)
     on conflict (email)
     do update set full_name = excluded.full_name, role_id = excluded.role_id, is_active = excluded.is_active, profile_image_url = excluded.profile_image_url, updated_at = now()`,
    [email, fullName, passwordHash, roleId, isActive, profileImageUrl]
  )

  revalidatePath('/admin/users')
}

async function updateUser(formData: FormData) {
  'use server'
  await requirePermission('users', 'write')
  await ensureUserProfileImageColumn()

  const id = String(formData.get('id') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const fullName = String(formData.get('fullName') ?? '').trim()
  const roleId = String(formData.get('roleId') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const status = String(formData.get('status') ?? 'active')
  const isActive = status !== 'inactive'
  const existingProfileImageUrl = String(formData.get('existingProfileImageUrl') ?? '').trim()

  if (!id || !email || !fullName || !roleId) return

  const profileImageUrl = await resolveProfileImage(formData, fullName, existingProfileImageUrl)

  if (password) {
    const passwordHash = await hashPassword(password)
    await sql(
      `update admin_users
       set email = $2,
           full_name = $3,
           role_id = $4,
           is_active = $5,
           profile_image_url = $6,
           password_hash = $7,
           updated_at = now()
       where id = $1`,
      [id, email, fullName, roleId, isActive, profileImageUrl, passwordHash]
    )
  } else {
    await sql(
      `update admin_users
       set email = $2,
           full_name = $3,
           role_id = $4,
           is_active = $5,
           profile_image_url = $6,
           updated_at = now()
       where id = $1`,
      [id, email, fullName, roleId, isActive, profileImageUrl]
    )
  }

  revalidatePath('/admin/users')
}

async function deleteUser(formData: FormData) {
  'use server'
  await requirePermission('users', 'delete')
  const id = String(formData.get('id') ?? '')
  await sql('delete from admin_users where id = $1', [id])
  revalidatePath('/admin/users')
}

async function toggleUserActive(formData: FormData) {
  'use server'
  await requirePermission('users', 'write')
  const id = String(formData.get('id') ?? '').trim()
  if (!id) return
  await sql('update admin_users set is_active = not is_active, updated_at = now() where id = $1', [id])
  revalidatePath('/admin/users')
}

async function changeUserPassword(formData: FormData) {
  'use server'
  await requirePermission('users', 'write')

  const id = String(formData.get('id') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  if (!id || !password) return

  const passwordHash = await hashPassword(password)
  await sql('update admin_users set password_hash = $2, updated_at = now() where id = $1', [id, passwordHash])
  revalidatePath('/admin/users')
}

async function bulkDeleteUsers(formData: FormData) {
  'use server'
  await requirePermission('users', 'delete')

  const raw = String(formData.get('ids') ?? '')
  const ids = raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (ids.length === 0) return

  await sql('delete from admin_users where id = any($1::uuid[])', [ids])
  revalidatePath('/admin/users')
}

async function bulkSetInactive(formData: FormData) {
  'use server'
  await requirePermission('users', 'write')

  const raw = String(formData.get('ids') ?? '')
  const ids = raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (ids.length === 0) return

  await sql('update admin_users set is_active = false, updated_at = now() where id = any($1::uuid[])', [ids])
  revalidatePath('/admin/users')
}

export default async function AdminUsersPage() {
  await requirePermission('users', 'read')
  await ensureUserProfileImageColumn()

  const [users, roles] = await Promise.all([
    sql<{ id: string; email: string; full_name: string; role_id: string; is_active: boolean; profile_image_url: string | null; updated_at: string | null }>(
      'select id, email, full_name, role_id, is_active, profile_image_url, updated_at::text from admin_users order by created_at desc'
    ),
    sql<{ id: string; name: string }>('select id, name from roles order by name asc'),
  ])

  const roleMap = new Map(roles.map((r) => [r.id, r.name]))
  const userRows = users.map((user) => ({
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    roleId: user.role_id,
    roleName: roleMap.get(user.role_id) ?? 'Unassigned',
    isActive: user.is_active,
    profileImageUrl: user.profile_image_url,
    updatedAt: user.updated_at,
  }))

  return (
    <AdminUsersTemplateView
      users={userRows}
      roles={roles}
      createUserAction={createUser}
      updateUserAction={updateUser}
      deleteUserAction={deleteUser}
      bulkDeleteUsersAction={bulkDeleteUsers}
      bulkSetInactiveAction={bulkSetInactive}
      toggleUserActiveAction={toggleUserActive}
      changeUserPasswordAction={changeUserPassword}
    />
  )
}
