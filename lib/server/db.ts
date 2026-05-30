import { neon } from '@neondatabase/serverless'

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }
  return url
}

// Uses HTTP fetch per query — no persistent TCP connection.
// Neon compute can auto-suspend between requests, preventing quota exhaustion.
const _sql = neon(getDatabaseUrl())

export async function sql<T = unknown>(query: string, params: unknown[] = []): Promise<T[]> {
  const rows = await _sql.query(query, params)
  return rows as T[]
}
