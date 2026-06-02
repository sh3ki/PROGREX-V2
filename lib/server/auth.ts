import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { sql } from './db'

const COOKIE_NAME = 'progrex_admin_session'

type AdminSession = {
  sub: string
  email: string
  roleId: string
  name: string
  avatarUrl?: string | null
}

// ─── In-process admin active-status cache ────────────────────────────────────
// Prevents a DB round-trip on every request for the same admin.
// TTL: 60 s — stale-by-at-most-60-seconds is acceptable for is_active checks.
const _adminCache = new Map<string, { isActive: boolean; expiry: number }>()
const ADMIN_CACHE_TTL = 60_000

function getSecret() {
  const secret = process.env.ADMIN_JWT_SECRET
  if (!secret) throw new Error('ADMIN_JWT_SECRET is not set')
  return new TextEncoder().encode(secret)
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export async function signAdminSession(payload: AdminSession): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())
}

export async function verifyAdminSession(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as unknown as AdminSession
  } catch {
    return null
  }
}

export async function setAdminCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function clearAdminCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function getAdminSessionFromCookie() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyAdminSession(token)
}

export async function getCurrentAdmin() {
  const session = await getAdminSessionFromCookie()
  if (!session) return null

  // Fast path: check in-process cache to avoid a DB round-trip on every request.
  const cached = _adminCache.get(session.sub)
  if (cached && Date.now() < cached.expiry) {
    if (!cached.isActive) return null
    return {
      id: session.sub,
      email: session.email,
      fullName: session.name,
      roleId: session.roleId,
      profileImageUrl: session.avatarUrl ?? null,
    }
  }

  // Cache miss — query DB only for is_active (cheapest possible query).
  const rows = await sql<{ is_active: boolean }>(
    'select is_active from admin_users where id = $1 limit 1',
    [session.sub]
  )
  const isActive = rows[0]?.is_active ?? false
  _adminCache.set(session.sub, { isActive, expiry: Date.now() + ADMIN_CACHE_TTL })

  if (!isActive) return null
  return {
    id: session.sub,
    email: session.email,
    fullName: session.name,
    roleId: session.roleId,
    profileImageUrl: session.avatarUrl ?? null,
  }
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin()
  if (!admin) {
    throw new Error('UNAUTHORIZED')
  }
  return admin
}
