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
}

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

  await sql('alter table admin_users add column if not exists profile_image_url text')

  const rows = await sql<{ id: string; email: string; full_name: string; role_id: string; is_active: boolean; profile_image_url: string | null }>(
    'select id, email, full_name, role_id, is_active, profile_image_url from admin_users where id = $1 limit 1',
    [session.sub]
  )

  const admin = rows[0]
  if (!admin || !admin.is_active) return null

  return {
    id: admin.id,
    email: admin.email,
    fullName: admin.full_name,
    roleId: admin.role_id,
    profileImageUrl: admin.profile_image_url,
  }
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin()
  if (!admin) {
    throw new Error('UNAUTHORIZED')
  }
  return admin
}
