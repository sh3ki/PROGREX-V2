import { NextRequest } from 'next/server'

type Bucket = {
  count: number
  windowStart: number
}

const buckets = new Map<string, Bucket>()

function splitHeaderValues(value: string | null): string[] {
  if (!value) return []
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function parseAllowedOriginsFromEnv(): Set<string> {
  const raw = [
    process.env.ALLOWED_ORIGINS,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.APP_URL,
  ]
    .filter(Boolean)
    .join(',')

  const allowed = new Set<string>()
  for (const value of splitHeaderValues(raw)) {
    try {
      allowed.add(new URL(value).origin)
    } catch {
      // Ignore malformed values to avoid breaking requests at runtime.
    }
  }

  return allowed
}

function getExpectedOrigins(req: NextRequest): Set<string> {
  const expected = new Set<string>()

  try {
    expected.add(new URL(req.url).origin)
  } catch {
    // Ignore malformed request URL and rely on headers/env fallbacks.
  }

  const forwardedProtos = splitHeaderValues(req.headers.get('x-forwarded-proto'))
  const forwardedHosts = splitHeaderValues(req.headers.get('x-forwarded-host'))
  const hostHeader = req.headers.get('host')
  const hosts = [...forwardedHosts, ...(hostHeader ? [hostHeader] : [])]

  for (const host of hosts) {
    const safeHost = host.split('/')[0]?.trim()
    if (!safeHost) continue

    const protos = forwardedProtos.length > 0 ? forwardedProtos : ['https', 'http']
    for (const proto of protos) {
      const safeProto = proto.replace(':', '').trim()
      if (!safeProto) continue
      expected.add(`${safeProto}://${safeHost}`)
    }
  }

  for (const origin of parseAllowedOriginsFromEnv()) {
    expected.add(origin)
  }

  return expected
}

function getEffectivePort(url: URL): string {
  if (url.port) return url.port
  return url.protocol === 'https:' ? '443' : '80'
}

function isLoopbackHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
}

export function assertSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin')
  if (!origin) return true

  try {
    const originUrl = new URL(origin)
    const expectedOrigins = getExpectedOrigins(req)

    if (expectedOrigins.has(originUrl.origin)) {
      return true
    }

    const requestUrl = new URL(req.url)

    // Keep strict scheme+port checks, but allow localhost and 127.0.0.1 to interoperate in local dev.
    const sameScheme = originUrl.protocol === requestUrl.protocol
    const samePort = getEffectivePort(originUrl) === getEffectivePort(requestUrl)
    const sameHost = originUrl.hostname === requestUrl.hostname
    const loopbackEquivalent = isLoopbackHost(originUrl.hostname) && isLoopbackHost(requestUrl.hostname)

    return sameScheme && samePort && (sameHost || loopbackEquivalent)
  } catch {
    return false
  }
}

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown'
  }
  return req.headers.get('x-real-ip') || 'unknown'
}

export function hitRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const current = buckets.get(key)

  if (!current || now - current.windowStart >= windowMs) {
    buckets.set(key, { count: 1, windowStart: now })
    return false
  }

  current.count += 1
  buckets.set(key, current)
  return current.count > limit
}
