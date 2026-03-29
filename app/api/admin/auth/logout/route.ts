import { NextRequest, NextResponse } from 'next/server'
import { clearAdminCookie } from '@/lib/server/auth'
import { assertSameOrigin } from '@/lib/server/request-security'

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
  }

  await clearAdminCookie()
  const loginUrl = new URL('/admin/login', req.url)
  return NextResponse.redirect(loginUrl)
}
