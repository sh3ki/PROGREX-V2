import { sql } from './db'
import type { AdminPermissionKey } from './permissions'

export type RolePermission = {
  permissionKey: AdminPermissionKey
  canRead: boolean
  canWrite: boolean
  canDelete: boolean
}

export async function getRolePermissions(roleId: string): Promise<RolePermission[]> {
  const rows = await sql<{
    permission_key: AdminPermissionKey
    can_read: boolean
    can_write: boolean
    can_delete: boolean
  }>(
    `select permission_key, can_read, can_write, can_delete
     from role_permissions
     where role_id = $1`,
    [roleId]
  )

  return rows.map((r) => ({
    permissionKey: r.permission_key,
    canRead: r.can_read,
    canWrite: r.can_write,
    canDelete: r.can_delete,
  }))
}

export async function hasPermission(roleId: string, permissionKey: AdminPermissionKey, action: 'read' | 'write' | 'delete') {
  const rows = await sql<{ can_read: boolean; can_write: boolean; can_delete: boolean }>(
    `select can_read, can_write, can_delete
     from role_permissions
     where role_id = $1 and permission_key = $2
     limit 1`,
    [roleId, permissionKey]
  )

  const perm = rows[0]
  if (!perm) return false
  if (action === 'read') return perm.can_read
  if (action === 'write') return perm.can_write
  return perm.can_delete
}
