import { Pool, type QueryResultRow } from 'pg'

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }
  return url
}

// Single pool shared across requests in the same Node.js process.
// Uses Supabase direct connection (port 5432) — works on any cloud host with
// IPv6 support (Render, Fly, etc.).
// max:5 keeps us well under Supabase free-tier's 60-connection ceiling even
// with 10 concurrent admins.  Visitors hit cached/static responses so they
// never open a DB connection at all.
const _pool = new Pool({
  connectionString: getDatabaseUrl(),
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
})

export async function sql<T extends QueryResultRow = QueryResultRow>(query: string, params: unknown[] = []): Promise<T[]> {
  const { rows } = await _pool.query<T>(query, params)
  return rows
}
