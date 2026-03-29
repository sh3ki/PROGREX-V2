import { hasPermission } from './rbac'
import { requireAdmin } from './auth'
import type { AdminPermissionKey } from './permissions'

export async function requirePermission(permission: AdminPermissionKey, action: 'read' | 'write' | 'delete') {
  const admin = await requireAdmin()
  const allowed = await hasPermission(admin.roleId, permission, action)
  if (!allowed) {
    throw new Error('FORBIDDEN')
  }
  return admin
}
