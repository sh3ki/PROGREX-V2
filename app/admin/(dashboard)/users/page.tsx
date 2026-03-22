import { revalidatePath } from 'next/cache'
import { hashPassword } from '@/lib/server/auth'
import { requirePermission } from '@/lib/server/admin-permission'
import { sql } from '@/lib/server/db'
import AdminUsersTemplateView from '@/components/admin/users/AdminUsersTemplateView'

async function createUser(formData: FormData) {
  'use server'
  await requirePermission('users', 'write')

  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const fullName = String(formData.get('fullName') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const roleId = String(formData.get('roleId') ?? '')
  const status = String(formData.get('status') ?? 'active')
  const isActive = status !== 'inactive'

  if (!email || !fullName || !password || !roleId) return

  const passwordHash = await hashPassword(password)

  await sql(
    `insert into admin_users(email, full_name, password_hash, role_id, is_active)
     values ($1, $2, $3, $4, $5)
     on conflict (email)
     do update set full_name = excluded.full_name, role_id = excluded.role_id, is_active = excluded.is_active, updated_at = now()`,
    [email, fullName, passwordHash, roleId, isActive]
  )

  revalidatePath('/admin/users')
}

async function updateUser(formData: FormData) {
  'use server'
  await requirePermission('users', 'write')

  const id = String(formData.get('id') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const fullName = String(formData.get('fullName') ?? '').trim()
  const roleId = String(formData.get('roleId') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const status = String(formData.get('status') ?? 'active')
  const isActive = status !== 'inactive'

  if (!id || !email || !fullName || !roleId) return

  if (password) {
    const passwordHash = await hashPassword(password)
    await sql(
      `update admin_users
       set email = $2,
           full_name = $3,
           role_id = $4,
           is_active = $5,
           password_hash = $6,
           updated_at = now()
       where id = $1`,
      [id, email, fullName, roleId, isActive, passwordHash]
    )
  } else {
    await sql(
      `update admin_users
       set email = $2,
           full_name = $3,
           role_id = $4,
           is_active = $5,
           updated_at = now()
       where id = $1`,
      [id, email, fullName, roleId, isActive]
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

  const [users, roles] = await Promise.all([
    sql<{ id: string; email: string; full_name: string; role_id: string; is_active: boolean; updated_at: string | null }>(
      'select id, email, full_name, role_id, is_active, updated_at::text from admin_users order by created_at desc'
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
