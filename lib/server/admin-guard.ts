import { redirect } from 'next/navigation'
import { getCurrentAdmin } from './auth'
import { getRolePermissions } from './rbac'

export async function requireAdminPage() {
  const admin = await getCurrentAdmin()
  if (!admin) {
    redirect('/admin/login')
  }

  const permissions = await getRolePermissions(admin.roleId)
  return { admin, permissions }
}
