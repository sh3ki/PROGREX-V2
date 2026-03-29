import { NextRequest } from 'next/server'

type Bucket = {
  count: number
  windowStart: number
}

const buckets = new Map<string, Bucket>()

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
