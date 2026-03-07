'use client'

/**
 * TranslationProvider — React Context-based translation system.
 *
 * Replaces the old DOM-walking + MyMemory API approach.
 * - English is bundled; other languages are loaded on demand via dynamic import.
 * - Shows IntroLoader overlay while language loads.
 * - Exposes `useTranslation()` hook with `t(key)`, `lang`, `setLang`, and `translations`.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import en, { type TranslationType } from '@/lib/translations/en'
import { langImports } from '@/lib/translations/index'
import IntroLoader from '@/components/IntroLoader'

/* ──────────────────────────── Context ──────────────────────────── */

interface TranslationContextValue {
  /** Dot-notation lookup: t('home.heroBadge') → translated string */
  t: (key: string) => string
  /** Active language code (e.g. 'EN', 'FIL', 'ZH') */
  lang: string
  /** Switch language — triggers dynamic import + IntroLoader */
  setLang: (code: string) => void
  /** Full translation object for direct access */
  translations: TranslationType
}

const TranslationContext = createContext<TranslationContextValue>({
  t: (key) => key,
  lang: 'EN',
  setLang: () => {},
  translations: en,
})

export function useTranslation() {
  return useContext(TranslationContext)
}

/* ───────────────────────── Deep-get helper ─────────────────────── */

function deepGet(obj: unknown, path: string): string | undefined {
  const parts = path.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return typeof current === 'string' ? current : undefined
}

/* ───────────────────────── Provider ───────────────────────────── */

export default function TranslationProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState('EN')
  const [translations, setTranslations] = useState<TranslationType>(en)
  const [showLoader, setShowLoader] = useState(false)
  const switchingRef = useRef(false)

  /* — t() function: lookup key → current language → fallback English — */
  const t = useCallback(
    (key: string): string => {
      // Try current language
      const val = deepGet(translations, key)
      if (val !== undefined) return val
      // Fallback to English
      const fallback = deepGet(en, key)
      if (fallback !== undefined) return fallback
      // Last resort: return key itself
      return key
    },
    [translations],
  )

  /* — Switch language — */
  const setLang = useCallback(
    async (code: string) => {
      if (code === lang && code !== 'EN') return
      if (switchingRef.current) return
      switchingRef.current = true

      if (code === 'EN') {
        setTranslations(en)
        setLangState('EN')
        try { localStorage.setItem('progrex-lang', 'EN') } catch { /* SSR */ }
        switchingRef.current = false
        return
      }

      const importer = langImports[code]
      if (!importer) {
        switchingRef.current = false
        return
      }

      // Show IntroLoader
      setShowLoader(true)

      try {
        // Load language file + enforce minimum display time for IntroLoader
        const [mod] = await Promise.all([
          importer(),
          new Promise((r) => setTimeout(r, 2200)),
        ])
        setTranslations(mod.default)
        setLangState(code)
        try { localStorage.setItem('progrex-lang', code) } catch { /* SSR */ }
      } catch (err) {
        console.error('[PROGREX Translate] Failed to load language:', code, err)
        // Revert to English
        setTranslations(en)
        setLangState('EN')
        try { localStorage.setItem('progrex-lang', 'EN') } catch { /* SSR */ }
        document.dispatchEvent(new CustomEvent('progrex-lang-reset'))
      } finally {
        setShowLoader(false)
        switchingRef.current = false
      }
    },
    [lang],
  )

  /* — Restore persisted language on mount — */
  useEffect(() => {
    try {
      const saved = localStorage.getItem('progrex-lang')
      if (saved && saved !== 'EN') {
        setLang(saved)
      }
    } catch { /* SSR / incognito */ }
  }, [setLang])

  /* — Listen for Navbar's custom event — */
  useEffect(() => {
    const handler = (e: Event) => {
      const code = (e as CustomEvent<string>).detail
      setLang(code)
    }
    document.addEventListener('progrex-lang-change', handler)
    return () => document.removeEventListener('progrex-lang-change', handler)
  }, [setLang])

  return (
    <TranslationContext.Provider value={{ t, lang, setLang, translations }}>
      {showLoader && <IntroLoader />}
      {children}
    </TranslationContext.Provider>
  )
}
