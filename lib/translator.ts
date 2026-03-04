/**
 * PROGREX Site-wide Translation Engine
 * Uses MyMemory API (free, 1000 req/day)
 * All translations are cached in localStorage indefinitely — 0 re-fetches for seen text
 */

// MyMemory language codes keyed by our internal navbar codes
const LANG_MAP: Record<string, string> = {
  FIL: 'tl',
  ZH:  'zh-CN',
  ES:  'es',
  AR:  'ar',
  HI:  'hi',
  FR:  'fr',
  BN:  'bn',
  RU:  'ru',
  PT:  'pt-BR',
  ID:  'id',
  DE:  'de',
  JA:  'ja',
  KO:  'ko',
  VI:  'vi',
  TR:  'tr',
  IT:  'it',
  TH:  'th',
  NL:  'nl',
  PL:  'pl',
}

/**
 * Single source of truth for supported language codes.
 * EN is always included (it’s the default — no translation needed).
 * All other codes must have a corresponding entry in LANG_MAP above.
 * The Navbar dropdown is filtered against this set automatically.
 */
export const SUPPORTED_LANG_CODES: ReadonlySet<string> = new Set(['EN', ...Object.keys(LANG_MAP)])

// Separator between texts in a batched request
// Uses unusual Unicode chars that translation APIs don't translate
const SEP = ' ⟦⟧ '
const MAX_BATCH_CHARS = 450

// Milliseconds to wait between API batches (MyMemory free tier: ~1 req/sec)
const THROTTLE_MS = 1200

const CACHE_PREFIX = 'pxt:'

// Tags whose text content should never be translated
const SKIP_TAGS = new Set([
  'script', 'style', 'code', 'pre', 'noscript', 'svg',
  'math', 'textarea', 'input', 'select',
])

// Pure numbers, symbols, URLs, single chars — skip these
const SKIP_RE      = /^[\d\s\W]{0,3}$|^https?:\/\//
// ALL-CAPS labels like "SYS_LIVE", "PY", "EN" — skip (tech abbreviations, language codes)
const SKIP_CAPS_RE = /^[A-Z]{2,4}$|^[A-Z][A-Z_\d]{1,9}$/
// Flag emoji pairs (regional indicator symbols U+1F1E0–U+1F1FF) — skip
const SKIP_FLAG_RE = new RegExp('^[\u{1F1E0}-\u{1F1FF}]{2}$', 'u')

function shouldSkip(text: string): boolean {
  return SKIP_RE.test(text) || SKIP_CAPS_RE.test(text) || SKIP_FLAG_RE.test(text)
}

/** Simple 32-bit hash for cache keys (avoids storing raw text as key) */
function hash32(s: string): string {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  }
  return (h >>> 0).toString(36)
}

/** Cache key: pxt:{langCode}:{textHash} */
export function cacheKey(lang: string, text: string): string {
  return `${CACHE_PREFIX}${lang}:${hash32(text)}`
}

/** Walk DOM and collect all translatable text nodes */
export function collectTextNodes(root: Element = document.body): Text[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const nodes: Text[] = []
  let n: Node | null

  while ((n = walker.nextNode())) {
    const node = n as Text
    const parent = node.parentElement
    if (!parent) continue

    const tag = parent.tagName.toLowerCase()
    if (SKIP_TAGS.has(tag)) continue

    // Respect data-notranslate on self or any ancestor
    if (parent.closest('[data-notranslate]')) continue

    const text = node.textContent?.trim() ?? ''
    if (text.length < 2) continue
    if (shouldSkip(text)) continue

    nodes.push(node)
  }

  return nodes
}

/** Batch-translate an array of English texts → translated texts via MyMemory */
async function fetchBatchTranslations(
  texts: string[],
  apiLang: string,
): Promise<Map<string, string>> {
  const result = new Map<string, string>()
  if (texts.length === 0) return result

  // Group into batches by character budget
  const batches: string[][] = []
  let cur: string[] = []
  let curLen = 0

  for (const text of texts) {
    // Truncate single texts that exceed the budget
    const t = text.length > MAX_BATCH_CHARS ? text.slice(0, MAX_BATCH_CHARS) : text
    const addLen = t.length + SEP.length

    if (curLen + addLen > MAX_BATCH_CHARS && cur.length > 0) {
      batches.push(cur)
      cur = []
      curLen = 0
    }
    cur.push(t)
    curLen += addLen
  }
  if (cur.length > 0) batches.push(cur)

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    const query = batch.join(SEP)

    const url =
      `https://api.mymemory.translated.net/get` +
      `?q=${encodeURIComponent(query)}&langpair=en|${apiLang}`

    const res = await fetch(url)

    // Rate limited — throw immediately so TranslationProvider reverts to English
    if (res.status === 429) {
      throw new Error('429 Too Many Requests — translation rate limit hit')
    }

    try {
      const data = await res.json()

      if (data.responseStatus === 200) {
        const raw: string = data.responseData.translatedText ?? ''
        const parts = raw.split(SEP)

        if (parts.length === batch.length) {
          batch.forEach((orig, j) => {
            const translated = parts[j]?.trim()
            if (translated && translated !== orig) {
              result.set(orig, translated)
            }
          })
        } else {
          // Separator was mangled — skip this batch silently
          batch.forEach(orig => result.set(orig, orig))
        }
      } else {
        // Other API-level error — skip batch silently
        batch.forEach(orig => result.set(orig, orig))
      }
    } catch {
      // JSON parse error — skip batch silently
      batch.forEach(orig => result.set(orig, orig))
    }

    // Throttle between batches — respect MyMemory free tier rate limit
    if (i < batches.length - 1) {
      await new Promise(r => setTimeout(r, THROTTLE_MS))
    }
  }

  return result
}

// ───────────────────────────────────────────────────────────────────
// PUBLIC API — two-phase approach to avoid React reconciliation stomping
// ───────────────────────────────────────────────────────────────────

/**
 * PHASE 1 (async): Fetch all uncached translations for the current page
 * and store them in localStorage. Run this while the overlay is VISIBLE
 * so the user sees a spinner. Returns stats for console monitoring.
 */
export async function fetchAndCache(langCode: string): Promise<{
  apiCalls: number
  fromCache: number
  total: number
}> {
  if (langCode === 'EN') return { apiCalls: 0, fromCache: 0, total: 0 }

  const apiLang = LANG_MAP[langCode]
  if (!apiLang) return { apiCalls: 0, fromCache: 0, total: 0 }

  // Snapshot text to translate from the CURRENT DOM
  const nodes = collectTextNodes()
  // Save English originals so we can revert later
  for (const node of nodes) {
    const parent = node.parentElement!
    if (!parent.dataset.orig) {
      parent.dataset.orig = node.textContent?.trim() ?? ''
    }
  }

  const uniqueTexts = [
    ...new Set(nodes.map(n => n.textContent?.trim() ?? '').filter(t => t.length >= 2)),
  ]

  const uncached: string[] = []
  let fromCache = 0

  for (const text of uniqueTexts) {
    if (localStorage.getItem(cacheKey(langCode, text)) !== null) {
      fromCache++
    } else {
      uncached.push(text)
    }
  }

  let apiCalls = 0
  if (uncached.length > 0) {
    let batchCount = 1
    let len = 0
    for (const t of uncached) {
      len += t.length + SEP.length
      if (len > MAX_BATCH_CHARS) { batchCount++; len = t.length + SEP.length }
    }
    apiCalls = batchCount

    const translations = await fetchBatchTranslations(uncached, apiLang)
    for (const [orig, translated] of translations) {
      localStorage.setItem(cacheKey(langCode, orig), translated)
    }
  }

  return { apiCalls, fromCache, total: uniqueTexts.length }
}

/**
 * PHASE 2 (sync): Re-collect FRESH text nodes from the live DOM and apply
 * translations from localStorage. Call this AFTER React has settled
 * (after the overlay is hidden and React has re-rendered).
 *
 * This avoids the bug where React's reconciliation detaches the nodes
 * we translated in Phase 1.
 */
export function applyFromCache(langCode: string): number {
  const nodes = collectTextNodes()

  // Revert to English — restore stored originals
  if (langCode === 'EN') {
    for (const node of nodes) {
      const parent = node.parentElement!
      const orig = parent.dataset.orig
      if (orig) {
        const full = node.textContent ?? ''
        const leading = full.match(/^\s*/)?.[0] ?? ''
        const trailing = full.match(/\s*$/)?.[0] ?? ''
        node.textContent = leading + orig + trailing
      }
    }
    return nodes.length
  }

  let applied = 0
  for (const node of nodes) {
    const text = node.textContent?.trim() ?? ''
    if (!text) continue

    const translated = localStorage.getItem(cacheKey(langCode, text))
    if (translated && translated !== text) {
      const full = node.textContent ?? ''
      const leading = full.match(/^\s*/)?.[0] ?? ''
      const trailing = full.match(/\s*$/)?.[0] ?? ''
      node.textContent = leading + translated + trailing
      applied++
    }
  }
  return applied
}

/** Clear all cached translations (for debugging) */
export function clearTranslationCache(): void {
  const toRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(CACHE_PREFIX)) toRemove.push(key)
  }
  toRemove.forEach(k => localStorage.removeItem(k))
}
