import { NextRequest, NextResponse } from 'next/server'

const DEFAULT_ADMIN_HOSTS = ['admin.progrex.cloud', 'www.admin.progrex.cloud', 'admin.localhost:3000']

function getAdminHosts() {
  const configured = process.env.ADMIN_DOMAIN?.trim()
  if (!configured) return DEFAULT_ADMIN_HOSTS
  return Array.from(new Set([configured, `www.${configured}`, ...DEFAULT_ADMIN_HOSTS]))
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const host = req.headers.get('host') ?? ''

  const isAdminHost = getAdminHosts().includes(host)

  if (isAdminHost) {
    if (!pathname.startsWith('/admin') && !pathname.startsWith('/api') && !pathname.startsWith('/_next') && pathname !== '/favicon.ico') {
      const url = req.nextUrl.clone()
      url.pathname = `/admin${pathname === '/' ? '' : pathname}`
      return NextResponse.rewrite(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)'],
}
