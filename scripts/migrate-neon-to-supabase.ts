/**
 * scripts/migrate-neon-to-supabase.ts
 *
 * One-shot migration: copies ALL data from NeonDB → Supabase.
 *
 * Prerequisites (run ONCE when NeonDB compute is accessible):
 *   $env:NEON_URL    = 'postgresql://neondb_owner:npg_c1HqlndX2mpz@ep-spring-queen-a1ibfpet-pooler.ap-southeast-1.aws.neon.tech/ProgreX?sslmode=require'
 *   $env:DATABASE_URL = <your Supabase direct connection URL>
 *
 * Run:
 *   npx tsx scripts/migrate-neon-to-supabase.ts
 *
 * Safe to re-run: uses ON CONFLICT DO UPDATE so existing rows are overwritten
 * with the NeonDB version (full fidelity).  Tables that have no unique
 * constraint outside the primary key use ON CONFLICT (id) DO UPDATE.
 */

import { Pool } from 'pg'

const NEON_URL =
  process.env.NEON_URL ??
  'postgresql://neondb_owner:npg_c1HqlndX2mpz@ep-spring-queen-a1ibfpet-pooler.ap-southeast-1.aws.neon.tech/ProgreX?sslmode=require'

const SUPABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://postgres:ProgreX5726!@db.ojamndshxsuruzwgdjjb.supabase.co:5432/postgres'

// Migration order respects foreign key dependencies.
// Each entry: [table_name, conflict_column_or_expression]
const TABLES: [string, string][] = [
  ['permissions',                      'key'],
  ['roles',                            'name'],
  ['role_permissions',                 '(role_id, permission_key)'],
  ['admin_users',                      'email'],
  ['team_members',                     'id'],
  ['services',                         'slug'],
  ['projects',                         'slug'],
  ['blogs',                            'slug'],
  ['ready_made_systems',               'slug'],
  ['testimonials',                     'id'],
  ['site_faqs',                        'id'],
  ['calendar_events',                  'id'],
  ['bookings',                         'id'],
  ['contact_submissions',              'id'],
  ['contact_submission_confirmations', 'id'],
  ['clients',                          'id'],
  ['ongoing_projects',                 'id'],
  ['ongoing_project_progress',         'id'],
  ['admin_kanban_tasks',               'id'],
  ['payments',                         'id'],
]

async function tableExists(pool: Pool, name: string): Promise<boolean> {
  const { rows } = await pool.query<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = $1
     ) AS exists`,
    [name]
  )
  return rows[0]?.exists ?? false
}

async function migrateTable(
  src: Pool,
  dst: Pool,
  table: string,
  conflictTarget: string
): Promise<void> {
  if (!(await tableExists(src, table))) {
    console.log(`  ⚠  ${table} — not found in NeonDB, skipping`)
    return
  }
  if (!(await tableExists(dst, table))) {
    console.log(`  ⚠  ${table} — not found in Supabase, skipping (run db:setup first)`)
    return
  }

  const { rows } = await src.query(`SELECT * FROM "${table}"`)
  if (rows.length === 0) {
    console.log(`  ✓  ${table} — empty (0 rows)`)
    return
  }

  const cols = Object.keys(rows[0])
  const colList = cols.map(c => `"${c}"`).join(', ')
  const setClause = cols
    .filter(c => c !== 'id' && c !== 'key')
    .map(c => `"${c}" = EXCLUDED."${c}"`)
    .join(', ')

  let inserted = 0
  for (const row of rows) {
    const values = cols.map(c => row[c])
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ')

    await dst.query(
      `INSERT INTO "${table}" (${colList})
       VALUES (${placeholders})
       ON CONFLICT (${conflictTarget})
       DO UPDATE SET ${setClause}`,
      values
    )
    inserted++
  }
  console.log(`  ✓  ${table} — ${inserted} rows migrated`)
}

async function main() {
  console.log('Connecting to NeonDB…')
  const src = new Pool({
    connectionString: NEON_URL,
    ssl: { rejectUnauthorized: false },
    max: 2,
    connectionTimeoutMillis: 10_000,
  })

  console.log('Connecting to Supabase…')
  const dst = new Pool({
    connectionString: SUPABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 2,
    connectionTimeoutMillis: 10_000,
  })

  // Verify both connections
  await src.query('SELECT 1').catch(e => {
    throw new Error(`NeonDB unreachable: ${e.message}`)
  })
  console.log('✓ NeonDB connected')

  await dst.query('SELECT 1').catch(e => {
    throw new Error(`Supabase unreachable: ${e.message}`)
  })
  console.log('✓ Supabase connected')

  console.log('\nMigrating tables…\n')

  for (const [table, conflict] of TABLES) {
    await migrateTable(src, dst, table, conflict).catch(err => {
      console.error(`  ✗  ${table} — ERROR: ${err.message}`)
    })
  }

  await src.end()
  await dst.end()
  console.log('\n✅  Migration complete.')
}

void main().catch(e => {
  console.error('\n❌  Migration failed:', e.message)
  process.exit(1)
})
