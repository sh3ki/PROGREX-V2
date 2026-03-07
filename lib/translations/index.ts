// ═══════════════════════════════════════════════════════════════════════════
// PROGREX Translation Registry
// ═══════════════════════════════════════════════════════════════════════════
import en, { type TranslationType } from './en'

/** All supported language codes. Used by Navbar to filter available languages. */
export const SUPPORTED_LANG_CODES: ReadonlySet<string> = new Set([
  'EN', 'FIL', 'ZH', 'ES', 'AR', 'HI', 'FR', 'BN', 'RU', 'PT',
  'ID', 'DE', 'JA', 'KO', 'VI', 'TR', 'IT', 'TH', 'NL', 'PL',
])

/** Dynamic import map — only the selected language is loaded at runtime. */
export const langImports: Record<string, () => Promise<{ default: TranslationType }>> = {
  FIL: () => import('./fil') as Promise<{ default: TranslationType }>,
  ZH:  () => import('./zh')  as Promise<{ default: TranslationType }>,
  ES:  () => import('./es')  as Promise<{ default: TranslationType }>,
  AR:  () => import('./ar')  as Promise<{ default: TranslationType }>,
  HI:  () => import('./hi')  as Promise<{ default: TranslationType }>,
  FR:  () => import('./fr')  as Promise<{ default: TranslationType }>,
  BN:  () => import('./bn')  as Promise<{ default: TranslationType }>,
  RU:  () => import('./ru')  as Promise<{ default: TranslationType }>,
  PT:  () => import('./pt')  as Promise<{ default: TranslationType }>,
  ID:  () => import('./id')  as Promise<{ default: TranslationType }>,
  DE:  () => import('./de')  as Promise<{ default: TranslationType }>,
  JA:  () => import('./ja')  as Promise<{ default: TranslationType }>,
  KO:  () => import('./ko')  as Promise<{ default: TranslationType }>,
  VI:  () => import('./vi')  as Promise<{ default: TranslationType }>,
  TR:  () => import('./tr')  as Promise<{ default: TranslationType }>,
  IT:  () => import('./it')  as Promise<{ default: TranslationType }>,
  TH:  () => import('./th')  as Promise<{ default: TranslationType }>,
  NL:  () => import('./nl')  as Promise<{ default: TranslationType }>,
  PL:  () => import('./pl')  as Promise<{ default: TranslationType }>,
}

export { en }
export type { TranslationType }
