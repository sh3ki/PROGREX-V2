import { Pool, type QueryResultRow } from 'pg'

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }
  return url
}

const _pool = new Pool({
  connectionString: getDatabaseUrl(),
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
})

const NETWORK_ERROR_CODES = ['ENETUNREACH', 'ENOTFOUND', 'ECONNREFUSED', 'ETIMEDOUT', 'ECONNRESET']

export async function sql<T extends QueryResultRow = QueryResultRow>(query: string, params: unknown[] = []): Promise<T[]> {
  const { rows } = await _pool.query<T>(query, params)
  return rows
}

/**
 * Like sql() but returns [] instead of throwing on network/connection errors.
 * Use in public read-only queries so pages degrade gracefully when DB is unreachable.
 */
export async function sqlPublic<T extends QueryResultRow = QueryResultRow>(query: string, params: unknown[] = []): Promise<T[]> {
  try {
    return await sql<T>(query, params)
  } catch (e: unknown) {
    const code = (e as NodeJS.ErrnoException)?.code
    if (code && NETWORK_ERROR_CODES.includes(code)) {
      console.error('[DB] Network error on public query, returning empty result:', (e as Error).message)
      return []
    }
    throw e
  }
}
