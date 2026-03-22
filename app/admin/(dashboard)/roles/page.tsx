import { revalidatePath } from 'next/cache'
import { ADMIN_PERMISSION_KEYS, ADMIN_PERMISSION_LABELS } from '@/lib/server/permissions'
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
} from '@/components/admin/apex/AdminPrimitives'

async function createRole(formData: FormData) {
  'use server'
  await requirePermission('roles', 'write')
  const name = String(formData.get('name') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  if (!name) return

  const rows = await sql<{ id: string }>(
    `insert into roles(name, description, is_system)
     values ($1, $2, false)
     returning id`,
    [name, description]
  )

  const roleId = rows[0]?.id
  if (roleId) {
    for (const key of ADMIN_PERMISSION_KEYS) {
      await sql(
        `insert into role_permissions(role_id, permission_key, can_read, can_write, can_delete)
         values ($1, $2, true, false, false)
         on conflict (role_id, permission_key) do nothing`,
        [roleId, key]
      )
    }
  }

  revalidatePath('/admin/roles')
}

async function updateRolePermission(formData: FormData) {
  'use server'
  await requirePermission('roles', 'write')
  const roleId = String(formData.get('roleId') ?? '')
  const permissionKey = String(formData.get('permissionKey') ?? '')
  const canRead = formData.get('canRead') === 'on'
  const canWrite = formData.get('canWrite') === 'on'
  const canDelete = formData.get('canDelete') === 'on'

  await sql(
    `insert into role_permissions(role_id, permission_key, can_read, can_write, can_delete)
     values ($1, $2, $3, $4, $5)
     on conflict (role_id, permission_key)
     do update set can_read = excluded.can_read, can_write = excluded.can_write, can_delete = excluded.can_delete, updated_at = now()`,
    [roleId, permissionKey, canRead, canWrite, canDelete]
  )

  revalidatePath('/admin/roles')
}

export default async function AdminRolesPage() {
  await requirePermission('roles', 'read')

  const [roles, perms] = await Promise.all([
    sql<{ id: string; name: string; description: string }>('select id, name, description from roles order by name asc'),
    sql<{ role_id: string; permission_key: string; can_read: boolean; can_write: boolean; can_delete: boolean }>(
      'select role_id, permission_key, can_read, can_write, can_delete from role_permissions'
    ),
  ])

  const permMap = new Map(perms.map((p) => [`${p.role_id}:${p.permission_key}`, p]))

  return (
    <div className="space-y-5">
      <ApexPageHeader title="Roles & Permissions" subtitle="Set module access using read, write, and delete controls." />

      <ApexCard>
        <ApexCardHeader title="Create Role" subtitle="New roles default to read-only access until updated." />
        <ApexCardBody>
          <form action={createRole}>
            <ApexFormGrid className="md:grid-cols-3">
              <ApexInput name="name" placeholder="Role name" required />
              <ApexInput name="description" placeholder="Description" className="md:col-span-2" />
              <ApexButton className="md:col-span-3" type="submit">Create Role</ApexButton>
            </ApexFormGrid>
          </form>
        </ApexCardBody>
      </ApexCard>

      <div className="space-y-4">
        {roles.map((role) => (
          <ApexCard key={role.id}>
            <ApexCardHeader title={role.name} subtitle={role.description || 'No description'} />
            <ApexCardBody className="space-y-3">
              {ADMIN_PERMISSION_KEYS.map((key) => {
                const current = permMap.get(`${role.id}:${key}`)
                return (
                  <form key={key} action={updateRolePermission} className="grid items-center gap-3 rounded-xl border p-3 md:grid-cols-[1fr_auto_auto_auto_auto]" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface-alt)' }}>
                    <input type="hidden" name="roleId" value={role.id} />
                    <input type="hidden" name="permissionKey" value={key} />
                    <div>
                      <p className="text-sm font-medium apx-text">{ADMIN_PERMISSION_LABELS[key]}</p>
                      <p className="text-xs apx-muted">{key}</p>
                    </div>
                    <label className="text-xs apx-muted"><input type="checkbox" name="canRead" defaultChecked={current?.can_read ?? false} /> Read</label>
                    <label className="text-xs apx-muted"><input type="checkbox" name="canWrite" defaultChecked={current?.can_write ?? false} /> Write</label>
                    <label className="text-xs apx-muted"><input type="checkbox" name="canDelete" defaultChecked={current?.can_delete ?? false} /> Delete</label>
                    <ApexButton variant="outline" type="submit">Save</ApexButton>
                  </form>
                )
              })}
            </ApexCardBody>
          </ApexCard>
        ))}
      </div>
    </div>
  )
}
