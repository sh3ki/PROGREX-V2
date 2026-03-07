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
  FIL: () => import('./fil') as unknown as Promise<{ default: TranslationType }>,
  ZH:  () => import('./zh')  as unknown as Promise<{ default: TranslationType }>,
  ES:  () => import('./es')  as unknown as Promise<{ default: TranslationType }>,
  AR:  () => import('./ar')  as unknown as Promise<{ default: TranslationType }>,
  HI:  () => import('./hi')  as unknown as Promise<{ default: TranslationType }>,
  FR:  () => import('./fr')  as unknown as Promise<{ default: TranslationType }>,
  BN:  () => import('./bn')  as unknown as Promise<{ default: TranslationType }>,
  RU:  () => import('./ru')  as unknown as Promise<{ default: TranslationType }>,
  PT:  () => import('./pt')  as unknown as Promise<{ default: TranslationType }>,
  ID:  () => import('./id')  as unknown as Promise<{ default: TranslationType }>,
  DE:  () => import('./de')  as unknown as Promise<{ default: TranslationType }>,
  JA:  () => import('./ja')  as unknown as Promise<{ default: TranslationType }>,
  KO:  () => import('./ko')  as unknown as Promise<{ default: TranslationType }>,
  VI:  () => import('./vi')  as unknown as Promise<{ default: TranslationType }>,
  TR:  () => import('./tr')  as unknown as Promise<{ default: TranslationType }>,
  IT:  () => import('./it')  as unknown as Promise<{ default: TranslationType }>,
  TH:  () => import('./th')  as unknown as Promise<{ default: TranslationType }>,
  NL:  () => import('./nl')  as unknown as Promise<{ default: TranslationType }>,
  PL:  () => import('./pl')  as unknown as Promise<{ default: TranslationType }>,
}

export { en }
export type { TranslationType }
