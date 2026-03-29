import { Pool } from 'pg'

declare global {
  // eslint-disable-next-line no-var
  var __progrexPool: Pool | undefined
}

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }
  return url
}

export const db = global.__progrexPool ?? new Pool({
  connectionString: getDatabaseUrl(),
  ssl: { rejectUnauthorized: false },
})

if (process.env.NODE_ENV !== 'production') {
  global.__progrexPool = db
}

export async function sql<T = unknown>(query: string, params: unknown[] = []): Promise<T[]> {
  const result = await db.query(query, params)
  return result.rows as T[]
}
