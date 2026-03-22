import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sql } from '@/lib/server/db'
import { setAdminCookie, signAdminSession, verifyPassword } from '@/lib/server/auth'
import { assertSameOrigin, getClientIp, hitRateLimit } from '@/lib/server/request-security'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(req: NextRequest) {
  try {
    if (!assertSameOrigin(req)) {
      return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
    }

    const ip = getClientIp(req)
    if (hitRateLimit(`admin-login:${ip}`, 10, 60_000)) {
      return NextResponse.json({ error: 'Too many login attempts. Please try again shortly.' }, { status: 429 })
    }

    const body = await req.json()
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid credentials format.' }, { status: 400 })
    }

    const userRows = await sql<{
      id: string
      email: string
      full_name: string
      password_hash: string
      role_id: string
      is_active: boolean
    }>(
      `select id, email, full_name, password_hash, role_id, is_active
       from admin_users
       where email = $1
       limit 1`,
      [parsed.data.email.toLowerCase()]
    )

    const user = userRows[0]
    if (!user || !user.is_active) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    const isValid = await verifyPassword(parsed.data.password, user.password_hash)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    const token = await signAdminSession({
      sub: user.id,
      email: user.email,
      name: user.full_name,
      roleId: user.role_id,
    })

    await setAdminCookie(token)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Login failed.' }, { status: 500 })
  }
}
