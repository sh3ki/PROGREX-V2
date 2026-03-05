'use client'

/**
 * TranslationProvider — two-phase approach to avoid React DOM stomping.
 *
 * Phase 1 (overlay VISIBLE): fetchAndCache() — hits the API, stores all
 *   translations in localStorage while the user sees the spinner.
 *
 * Phase 2 (overlay HIDDEN): after React re-renders (settles), applyFromCache()
 *   re-collects FRESH DOM nodes and paints translations from localStorage.
 *   This avoids the bug where React's reconciliation detaches nodes we
 *   already translated.
 */

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { fetchAndCache, applyFromCache } from '@/lib/translator'

/** Wait for two animation frames — enough for React to finish re-rendering */
function afterReactSettles(): Promise<void> {
  return new Promise(resolve =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  )
}

export default function TranslationProvider() {
  const pathname   = usePathname()
  const langRef    = useRef<string>('EN')
  const [translating, setTranslating] = useState(false)

  /** Reset to English — clears storage, hides spinner, signals Navbar */
  function revertToEnglish(reason: string) {
    console.warn(`[PROGREX Translate] Fallback to EN — ${reason}`)
    langRef.current = 'EN'
    try { localStorage.setItem('progrex-lang', 'EN') } catch { /* ignore */ }
    setTranslating(false)
    document.dispatchEvent(new CustomEvent('progrex-lang-reset'))
  }

  // ── Initial mount: restore persisted language & listen for changes ──
  useEffect(() => {
    const saved = localStorage.getItem('progrex-lang') ?? 'EN'

    if (saved !== 'EN') {
      langRef.current = saved
      setTimeout(async () => {
        try {
          setTranslating(true)
          const stats = await fetchAndCache(saved)
          setTranslating(false)
          // Let React settle after hiding overlay, THEN paint translations
          await afterReactSettles()
          const applied = applyFromCache(saved)
          console.info(
            `[PROGREX Translate] Initial | Lang: ${saved}` +
            ` | API calls: ${stats.apiCalls} | Cache hits: ${stats.fromCache}` +
            ` | Applied: ${applied}`
          )
        } catch (err) {
          revertToEnglish(String(err))
        }
      }, 0)
    }

    const handler = (e: Event) => {
      const lang = (e as CustomEvent<string>).detail
      langRef.current = lang

      const run = async () => {
        try {
          setTranslating(true)
          // Phase 1: fetch while spinner is visible
          const stats = await fetchAndCache(lang)
          // Phase 2: hide spinner, let React re-render, then apply to fresh nodes
          setTranslating(false)
          await afterReactSettles()
          const applied = applyFromCache(lang)
          console.info(
            `[PROGREX Translate] Switched → ${lang}` +
            ` | API calls: ${stats.apiCalls} | Cache hits: ${stats.fromCache}` +
            ` | Applied: ${applied}`
          )
        } catch (err) {
          revertToEnglish(String(err))
        }
      }
      run()
    }

    document.addEventListener('progrex-lang-change', handler)
    return () => document.removeEventListener('progrex-lang-change', handler)
  }, [])

  // ── Re-apply on every page navigation ──
  useEffect(() => {
    const lang = langRef.current
    if (lang === 'EN') return

    const t = setTimeout(async () => {
      try {
        // Page just navigated — fetch any new text, then apply
        const stats = await fetchAndCache(lang)
        await afterReactSettles()
        const applied = applyFromCache(lang)
        console.info(
          `[PROGREX Translate] Nav → ${pathname} | Lang: ${lang}` +
          ` | API calls: ${stats.apiCalls} | Applied: ${applied}`
        )
      } catch (err) {
        revertToEnglish(String(err))
      }
    }, 200)

    return () => clearTimeout(t)
  }, [pathname])

  // ── Overlay + spinner while fetching translations ──
  if (!translating) return null

  return (
    <div
      aria-label="Loading..."
      style={{
        position:       'fixed',
        inset:          0,
        zIndex:         99999,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            '16px',
        background:     'rgba(3,3,15,0.72)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
    >
      {/* Progress bar at top */}
      <div style={{
        position:       'absolute',
        top:            0,
        left:           0,
        right:          0,
        height:         '2px',
        background:     'linear-gradient(90deg, #0EA5E9, #7C3AED, #0EA5E9)',
        backgroundSize: '200% 100%',
        animation:      'pxt-slide 1.2s linear infinite',
      }} />

      {/* Spinner ring */}
      <div style={{
        width:        52,
        height:       52,
        borderRadius: '50%',
        border:       '3px solid rgba(103,232,249,0.15)',
        borderTop:    '3px solid #0EA5E9',
        borderRight:  '3px solid #7C3AED',
        animation:    'pxt-spin 0.8s linear infinite',
      }} />

      {/* Label */}
      <div style={{
        fontFamily:    'JetBrains Mono, monospace',
        fontSize:      '11px',
        letterSpacing: '0.15em',
        color:         'rgba(103,232,249,0.7)',
        textTransform: 'uppercase',
      }}>
        Loading...
      </div>
    </div>
  )
}
