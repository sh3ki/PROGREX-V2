import fs from 'node:fs/promises'
import path from 'node:path'
import { Pool } from 'pg'
import { hashSync } from 'bcryptjs'
import { ADMIN_PERMISSION_KEYS, ADMIN_PERMISSION_LABELS } from '../lib/server/permissions'

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required`)
  return value
}

async function main() {
  const databaseUrl = requiredEnv('DATABASE_URL')

  const superAdminEmail = 'shekaigarcia@gmail.com'
  const superAdminName = 'Jedidia Shekainah Garcia'
  const superAdminPassword = 'Pr0grX@2025!'

  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } })
  const client = await pool.connect()

  try {
    await client.query('begin')

    const schemaPath = path.join(process.cwd(), 'lib', 'server', 'schema.sql')
    const schemaSql = await fs.readFile(schemaPath, 'utf8')
    await client.query(schemaSql)

    await client.query(`
      truncate table
        contact_submissions,
        bookings,
        calendar_events,
        site_faqs,
        testimonials,
        ready_made_systems,
        blogs,
        team_members,
        projects,
        services,
        admin_users,
        role_permissions,
        roles,
        permissions
      restart identity cascade
    `)

    for (const key of ADMIN_PERMISSION_KEYS) {
      await client.query(
        `insert into permissions(key, label)
         values ($1, $2)
         on conflict (key) do update set label = excluded.label`,
        [key, ADMIN_PERMISSION_LABELS[key]]
      )
    }

    const superAdminRoleResult = await client.query<{ id: string }>(
      `insert into roles(name, description, is_system)
       values ('Super Admin', 'Full platform control with user management', true)
       returning id`
    )
    const superAdminRoleId = superAdminRoleResult.rows[0].id

    const adminRoleResult = await client.query<{ id: string }>(
      `insert into roles(name, description, is_system)
       values ('Admin', 'Full platform control except user management', true)
       returning id`
    )
    const adminRoleId = adminRoleResult.rows[0].id

    for (const permissionKey of ADMIN_PERMISSION_KEYS) {
      await client.query(
        `insert into role_permissions(role_id, permission_key, can_read, can_write, can_delete)
         values ($1, $2, true, true, true)`,
        [superAdminRoleId, permissionKey]
      )

      const isUsersPermission = permissionKey === 'users'
      await client.query(
        `insert into role_permissions(role_id, permission_key, can_read, can_write, can_delete)
         values ($1, $2, $3, $3, $3)`,
        [adminRoleId, permissionKey, !isUsersPermission]
      )
    }

    const passwordHash = hashSync(superAdminPassword, 12)
    await client.query(
      `insert into admin_users(email, full_name, password_hash, role_id, is_active)
       values ($1, $2, $3, $4, true)`,
      [superAdminEmail, superAdminName, passwordHash, superAdminRoleId]
    )

    await client.query('commit')

    console.log('Database reset and RBAC seed complete')
    console.log(`Super Admin email: ${superAdminEmail}`)
    console.log(`Super Admin password: ${superAdminPassword}`)
  } catch (error) {
    await client.query('rollback')
    console.error(error)
    process.exitCode = 1
  } finally {
    client.release()
    await pool.end()
  }
}

void main()
