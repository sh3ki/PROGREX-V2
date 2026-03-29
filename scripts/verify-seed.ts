import { Pool } from 'pg'

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required`)
  return value
}

async function main() {
  const pool = new Pool({
    connectionString: requiredEnv('DATABASE_URL'),
    ssl: { rejectUnauthorized: false },
  })

  const client = await pool.connect()
  try {
    const summary = await client.query<{
      services_count: string
      projects_count: string
      testimonials_count: string
      blogs_count: string
    }>(
      `select
         (select count(*) from services) as services_count,
         (select count(*) from projects) as projects_count,
         (select count(*) from testimonials) as testimonials_count,
         (select count(*) from blogs) as blogs_count`
    )

    const roles = await client.query<{ name: string }>('select name from roles order by name')
    const usersPermission = await client.query<{ name: string; can_read: boolean; can_write: boolean; can_delete: boolean }>(
      `select r.name, rp.can_read, rp.can_write, rp.can_delete
       from roles r
       join role_permissions rp on rp.role_id = r.id
       where rp.permission_key = $1
       order by r.name`,
      ['users']
    )
    const users = await client.query<{ email: string; full_name: string; is_active: boolean }>(
      'select email, full_name, is_active from admin_users order by email'
    )

    console.log('SUMMARY', summary.rows[0])
    console.log('ROLES', roles.rows)
    console.log('USERS_PERMISSION', usersPermission.rows)
    console.log('ADMIN_USERS', users.rows)
  } finally {
    client.release()
    await pool.end()
  }
}

void main()
