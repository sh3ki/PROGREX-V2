import { neon } from '@neondatabase/serverless'
import type { QueryResultRow } from 'pg'

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')
  return url
}

// Neon serverless HTTP driver: each query is a standalone HTTPS request
// on port 443. Neon compute auto-scales to zero between requests, so the
// free tier's 191.9 compute-hour/month limit is never an issue.
// Works on Render and any IPv4-only host — no IPv6 needed.
const _neon = neon(getDatabaseUrl())

const NETWORK_ERROR_CODES = ['ENETUNREACH', 'ENOTFOUND', 'ECONNREFUSED', 'ETIMEDOUT', 'ECONNRESET']

export async function sql<T extends QueryResultRow = QueryResultRow>(
  query: string, params: unknown[] = []
): Promise<T[]> {
  // Pass undefined (not []) when there are no params so Neon uses the simple
  // query protocol, which supports multi-statement strings (e.g. schema.sql).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = await (_neon as any)(query, params.length ? params : undefined)
  return rows as T[]
}

/**
 * Like sql() but returns [] instead of throwing on network/connection errors.
 * Use in public read-only queries so pages degrade gracefully when DB is unreachable.
 */
export async function sqlPublic<T extends QueryResultRow = QueryResultRow>(
  query: string, params: unknown[] = []
): Promise<T[]> {
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
