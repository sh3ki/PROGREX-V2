import { revalidatePath } from 'next/cache'
import { ADMIN_PERMISSION_KEYS, ADMIN_PERMISSION_LABELS } from '@/lib/server/permissions'
import { requirePermission } from '@/lib/server/admin-permission'
import { sql } from '@/lib/server/db'
import AdminRolesTemplateView from '@/components/admin/roles/AdminRolesTemplateView'

type PermissionPayload = {
  permissionKey: string
  canRead: boolean
  canWrite: boolean
  canDelete: boolean
}

async function ensureRolesIsActiveColumn() {
  await sql('alter table roles add column if not exists is_active boolean not null default true')
}

async function createRole(formData: FormData) {
  'use server'
  await requirePermission('roles', 'write')
  await ensureRolesIsActiveColumn()

  const name = String(formData.get('name') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const status = String(formData.get('status') ?? 'active')
  const rawPermissions = String(formData.get('permissions') ?? '[]')
  if (!name) return

  const isActive = status !== 'inactive'

  let permissions: PermissionPayload[] = []
  try {
    permissions = JSON.parse(rawPermissions) as PermissionPayload[]
  } catch {
    permissions = []
  }

  const rows = await sql<{ id: string }>(
    `insert into roles(name, description, is_system, is_active)
     values ($1, $2, false, $3)
     returning id`,
    [name, description, isActive]
  )

  const roleId = rows[0]?.id
  if (roleId) {
    for (const key of ADMIN_PERMISSION_KEYS) {
      const selected = permissions.find((item) => item.permissionKey === key)
      await sql(
        `insert into role_permissions(role_id, permission_key, can_read, can_write, can_delete)
         values ($1, $2, $3, $4, $5)
         on conflict (role_id, permission_key) do nothing`,
        [
          roleId,
          key,
          selected?.canRead ?? true,
          selected?.canWrite ?? false,
          selected?.canDelete ?? false,
        ]
      )
    }
  }

  revalidatePath('/admin/roles')
}

async function updateRole(formData: FormData) {
  'use server'
  await requirePermission('roles', 'write')
  await ensureRolesIsActiveColumn()

  const id = String(formData.get('id') ?? '').trim()
  const name = String(formData.get('name') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const status = String(formData.get('status') ?? 'active')
  const rawPermissions = String(formData.get('permissions') ?? '[]')

  if (!id || !name) return

  const isActive = status !== 'inactive'

  let permissions: PermissionPayload[] = []
  try {
    permissions = JSON.parse(rawPermissions) as PermissionPayload[]
  } catch {
    permissions = []
  }

  await sql(
    `update roles
     set name = $2,
         description = $3,
         is_active = $4,
         updated_at = now()
     where id = $1`,
    [id, name, description, isActive]
  )

  await sql('delete from role_permissions where role_id = $1', [id])

  for (const key of ADMIN_PERMISSION_KEYS) {
    const selected = permissions.find((item) => item.permissionKey === key)
    await sql(
      `insert into role_permissions(role_id, permission_key, can_read, can_write, can_delete)
       values ($1, $2, $3, $4, $5)`,
      [
        id,
        key,
        selected?.canRead ?? true,
        selected?.canWrite ?? false,
        selected?.canDelete ?? false,
      ]
    )
  }

  revalidatePath('/admin/roles')
}

async function deleteRole(formData: FormData) {
  'use server'
  await requirePermission('roles', 'delete')
  await ensureRolesIsActiveColumn()

  const id = String(formData.get('id') ?? '').trim()
  if (!id) return

  await sql('delete from roles where id = $1', [id])

  revalidatePath('/admin/roles')
}

async function toggleRoleActive(formData: FormData) {
  'use server'
  await requirePermission('roles', 'write')
  await ensureRolesIsActiveColumn()

  const id = String(formData.get('id') ?? '').trim()
  if (!id) return

  await sql('update roles set is_active = not is_active, updated_at = now() where id = $1', [id])
  revalidatePath('/admin/roles')
}

async function bulkDeleteRoles(formData: FormData) {
  'use server'
  await requirePermission('roles', 'delete')
  await ensureRolesIsActiveColumn()

  const raw = String(formData.get('ids') ?? '')
  const ids = raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (ids.length === 0) return

  await sql('delete from roles where id = any($1::uuid[])', [ids])
  revalidatePath('/admin/roles')
}

async function bulkSetInactiveRoles(formData: FormData) {
  'use server'
  await requirePermission('roles', 'write')
  await ensureRolesIsActiveColumn()

  const raw = String(formData.get('ids') ?? '')
  const ids = raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (ids.length === 0) return

  await sql('update roles set is_active = false, updated_at = now() where id = any($1::uuid[])', [ids])
  revalidatePath('/admin/roles')
}

export default async function AdminRolesPage() {
  await requirePermission('roles', 'read')
  await ensureRolesIsActiveColumn()

  const [roles, perms] = await Promise.all([
    sql<{ id: string; name: string; description: string | null; is_system: boolean; is_active: boolean; updated_at: string | null }>(
      'select id, name, description, is_system, is_active, updated_at::text from roles order by name asc'
    ),
    sql<{ role_id: string; permission_key: string; can_read: boolean; can_write: boolean; can_delete: boolean }>(
      'select role_id, permission_key, can_read, can_write, can_delete from role_permissions'
    ),
  ])

  return (
    <AdminRolesTemplateView
      roles={roles.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description ?? '',
        isSystem: role.is_system,
        isActive: role.is_active,
        updatedAt: role.updated_at,
      }))}
      permissions={perms.map((permission) => ({
        roleId: permission.role_id,
        permissionKey: permission.permission_key,
        canRead: permission.can_read,
        canWrite: permission.can_write,
        canDelete: permission.can_delete,
      }))}
      permissionKeys={[...ADMIN_PERMISSION_KEYS]}
      permissionLabels={ADMIN_PERMISSION_LABELS}
      createRoleAction={createRole}
      updateRoleAction={updateRole}
      deleteRoleAction={deleteRole}
      bulkDeleteRolesAction={bulkDeleteRoles}
      bulkSetInactiveRolesAction={bulkSetInactiveRoles}
      toggleRoleActiveAction={toggleRoleActive}
    />
  )
}
