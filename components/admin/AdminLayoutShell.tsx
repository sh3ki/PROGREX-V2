'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Calendar,
  CalendarCheck,
  FolderKanban,
  UserSquare2,
  Newspaper,
  Boxes,
  Building2,
  FolderOpen,
  Inbox,
  Bell,
  Menu,
  X,
  Moon,
  Sun,
  Palette,
  Check,
  Search,
  ChevronRight,
  ChevronLeft,
  LogOut,
  Settings,
  Rows3,
  Rows2,
  Rows4,
} from 'lucide-react'
import { ApexConfirmationModal } from '@/components/admin/apex/ApexDataUi'

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
}

type NavSection = {
  title: string
  items: NavItem[]
}

type ColorPreset = 'blue' | 'emerald' | 'violet' | 'rose' | 'orange' | 'cyan' | 'indigo' | 'teal' | 'amber' | 'fuchsia'
type Density = 'compact' | 'comfortable' | 'spacious'

const COLOR_PRESETS: { key: ColorPreset; value: string }[] = [
  { key: 'blue', value: '#2563eb' },
  { key: 'emerald', value: '#059669' },
  { key: 'violet', value: '#7c3aed' },
  { key: 'rose', value: '#e11d48' },
  { key: 'orange', value: '#d8510b' },
  { key: 'cyan', value: '#0891b2' },
  { key: 'indigo', value: '#4f46e5' },
  { key: 'teal', value: '#0f766e' },
  { key: 'amber', value: '#d97706' },
  { key: 'fuchsia', value: '#c026d3' },
]

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Core',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/calendar', label: 'Calendar', icon: Calendar },
      { href: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
      { href: '/admin/clients', label: 'Clients', icon: Building2 },
      { href: '/admin/ongoing-projects', label: 'Ongoing Projects', icon: FolderOpen },
      { href: '/admin/contact-submissions', label: 'Contact Submissions', icon: Inbox },
    ],
  },
  {
    title: 'Content',
    items: [
      { href: '/admin/projects', label: 'Projects', icon: FolderKanban },
      { href: '/admin/teams', label: 'Teams', icon: UserSquare2 },
      { href: '/admin/blogs', label: 'Blogs', icon: Newspaper },
      { href: '/admin/systems', label: 'Ready-Made Systems', icon: Boxes },
    ],
  },
  {
    title: 'System',
    items: [
      { href: '/admin/users', label: 'Users', icon: Users },
      { href: '/admin/roles', label: 'Roles & Permissions', icon: ShieldCheck },
    ],
  },
]

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace('#', '')
  const r = parseInt(normalized.slice(0, 2), 16)
  const g = parseInt(normalized.slice(2, 4), 16)
  const b = parseInt(normalized.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function getPageTitle(pathname: string) {
  for (const section of NAV_SECTIONS) {
    const found = section.items.find((item) => item.href === pathname)
    if (found) return found.label
  }
  if (pathname.startsWith('/admin')) return 'Admin'
  return 'Control Panel'
}

export default function AdminLayoutShell({
  children,
  adminName,
  adminEmail,
  adminAvatar,
  initialIsDark,
  initialColorPreset,
  initialDensity,
}: {
  children: React.ReactNode
  adminName: string
  adminEmail: string
  adminAvatar?: string | null
  initialIsDark: boolean
  initialColorPreset: ColorPreset
  initialDensity: Density
}) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [isDark, setIsDark] = useState(initialIsDark)
  const [customizerOpen, setCustomizerOpen] = useState(false)
  const [colorPreset, setColorPreset] = useState<ColorPreset>(initialColorPreset)
  const [density, setDensity] = useState<Density>(initialDensity)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(NAV_SECTIONS.map((section) => [section.title, true]))
  )
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [commandQuery, setCommandQuery] = useState('')
  const commandRef = useRef<HTMLDivElement | null>(null)
  const profileRef = useRef<HTMLDivElement | null>(null)
  const logoutFormRef = useRef<HTMLFormElement | null>(null)

  const title = useMemo(() => getPageTitle(pathname), [pathname])
  const activePreset = COLOR_PRESETS.find((preset) => preset.key === colorPreset) ?? COLOR_PRESETS[0]
  const primarySoft = useMemo(() => hexToRgba(activePreset.value, isDark ? 0.22 : 0.16), [activePreset.value, isDark])

  const commandItems = useMemo(() => NAV_SECTIONS.flatMap((section) => section.items), [])
  const filteredCommandItems = useMemo(() => {
    const keyword = commandQuery.trim().toLowerCase()
    if (!keyword) return commandItems
    return commandItems.filter((item) => item.label.toLowerCase().includes(keyword) || item.href.toLowerCase().includes(keyword))
  }, [commandItems, commandQuery])

  const initials = useMemo(
    () =>
      adminName
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
    [adminName],
  )

  useEffect(() => {
    function onDocMouseDown(event: MouseEvent) {
      const target = event.target as Node
      if (commandRef.current && !commandRef.current.contains(target)) setCommandOpen(false)
      if (profileRef.current && !profileRef.current.contains(target)) setProfileMenuOpen(false)
    }

    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('apx-theme-mode', isDark ? 'dark' : 'light')
      localStorage.setItem('apx-color-preset', colorPreset)
      localStorage.setItem('apx-density', density)

      document.cookie = `apx-theme-mode=${isDark ? 'dark' : 'light'}; path=/; max-age=31536000; samesite=lax`
      document.cookie = `apx-color-preset=${colorPreset}; path=/; max-age=31536000; samesite=lax`
      document.cookie = `apx-density=${density}; path=/; max-age=31536000; samesite=lax`

      document.documentElement.style.setProperty('--global-theme-mode', isDark ? 'dark' : 'light')
      document.documentElement.style.setProperty('--global-accent', activePreset.value)
    } catch {
      // ignore
    }
  }, [isDark, colorPreset, density, activePreset.value])

  const sidebarWidth = collapsed ? 'lg:w-[84px]' : 'lg:w-[260px]'
  const contentOffset = collapsed ? 'lg:ms-[84px]' : 'lg:ms-[260px]'
  const contentPaddingClass = density === 'compact' ? 'p-3 sm:p-4' : density === 'spacious' ? 'p-6 sm:p-8' : 'p-4 sm:p-6'

  function resetToDefaults() {
    setIsDark(true)
    setColorPreset('blue')
    setDensity('comfortable')
  }

  const renderNavSection = (section: NavSection) => (
    <div key={section.title}>
      <button
        type="button"
        onClick={() => setOpenSections((prev) => ({ ...prev, [section.title]: !prev[section.title] }))}
        className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest transition-colors hover:text-slate-100"
        style={{ color: 'var(--apx-sidebar-text)' }}
      >
        <span className={collapsed ? 'sr-only' : 'flex-1 text-start'}>{section.title}</span>
        {!collapsed && <ChevronRight className={['size-3 transition-transform duration-200', openSections[section.title] ? 'rotate-90' : 'rotate-0'].join(' ')} />}
      </button>

      <div className={['mt-1 space-y-0.5', !openSections[section.title] && !collapsed ? 'hidden' : ''].join(' ')}>
        {section.items.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href

          return (
            <Link
              key={`${section.title}-${item.label}`}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : undefined}
              className={[
                'apx-sidebar-link group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:text-slate-100',
                collapsed ? 'justify-center px-2' : '',
              ].join(' ')}
              style={
                active
                  ? { backgroundColor: 'color-mix(in oklab, var(--apx-primary) 24%, transparent)', color: 'var(--apx-primary)' }
                  : { color: 'var(--apx-sidebar-text)' }
              }
            >
              <Icon className="h-4.5 w-4.5 shrink-0 transition-colors" style={active ? { color: 'var(--apx-primary)' } : { color: '#7f90a5' }} />
              {!collapsed && <span className="flex-1">{item.label}</span>}
              {collapsed ? (
                <span
                  className="pointer-events-none absolute left-full top-1/2 z-50 ms-3 -translate-y-1/2 rounded-md border px-2 py-1 text-xs whitespace-nowrap opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                  style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)', color: 'var(--apx-text)' }}
                >
                  {item.label}
                </span>
              ) : null}
            </Link>
          )
        })}
      </div>
    </div>
  )

  return (
    <div
      className={['admin-theme min-h-screen apx-bg apx-text', isDark ? 'admin-theme-dark' : ''].join(' ')}
      style={{
        ['--apx-primary' as string]: activePreset.value,
        ['--apx-primary-soft' as string]: primarySoft,
      }}
    >
      <div className="flex min-h-screen">
        <aside
          className={[
            'fixed left-0 top-0 z-40 hidden h-screen flex-col transition-all duration-300 ease-in-out lg:flex',
            sidebarWidth,
          ].join(' ')}
          style={{
            backgroundColor: 'color-mix(in oklab, var(--apx-sidebar) 84%, transparent)',
            color: 'var(--apx-sidebar-text)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div className={['flex border-b px-4 py-3', collapsed ? 'h-16 justify-center' : 'flex-col gap-1'].join(' ')} style={{ borderColor: 'var(--apx-sidebar-border)' }}>
            <div className={['relative shrink-0 overflow-hidden items-start', collapsed ? 'h-12 w-12 rounded-lg' : 'h-10 w-2/3 rounded-md'].join(' ')}>
              <Image
                src={collapsed ? '/ProgreX Icon Logo Transparent.png' : '/Progrex Logo White Transparent.png'}
                alt="Progrex"
                fill
                sizes={collapsed ? '32px' : '150px'}
                className="object-cover"
              />
            </div>
            {!collapsed && (
              <div className="flex w-full flex-col">
                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">Admin Portal</span>
              </div>
            )}
          </div>

          <nav role="navigation" aria-label="Main navigation" className="flex-1 space-y-3 overflow-y-auto overflow-x-visible px-3 py-4">
            {NAV_SECTIONS.map(renderNavSection)}

            {!collapsed && <div className="my-2 border-t" style={{ borderColor: 'var(--apx-sidebar-border)' }} />}
          </nav>

          <div
            className="mt-auto border-t px-3 py-2 text-center text-[10px] font-medium tracking-wide"
            style={{ borderColor: 'var(--apx-sidebar-border)', color: 'var(--apx-sidebar-text)' }}
          >
            {collapsed ? <span title="© 2026 PROGREX — ALL RIGHTS RESERVED">© 2026</span> : '© 2026 PROGREX — ALL RIGHTS RESERVED'}
          </div>

          <button
            aria-label="Collapse sidebar"
            onClick={() => setCollapsed((v) => !v)}
            className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border text-slate-400 shadow-sm transition-all hover:text-slate-200"
            style={{ borderColor: 'var(--apx-sidebar-border)', backgroundColor: 'var(--apx-sidebar)' }}
          >
            <ChevronLeft className={['h-3.5 w-3.5 transition-transform duration-300', collapsed ? 'rotate-180' : 'rotate-0'].join(' ')} />
          </button>
        </aside>

        <aside
          className={[
            'fixed left-0 top-0 z-50 flex h-screen w-65 flex-col transition-transform duration-300 ease-in-out lg:hidden',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
          ].join(' ')}
          style={{ backgroundColor: 'color-mix(in oklab, var(--apx-sidebar) 90%, transparent)', backdropFilter: 'blur(8px)' }}
        >
          <div className="flex border-b px-4 py-3" style={{ borderColor: 'var(--apx-sidebar-border)' }}>
            <div className="relative h-9 w-37.5 shrink-0 overflow-hidden rounded-md">
              <Image src="/Progrex Logo White Transparent.png" alt="Progrex" fill sizes="150px" className="object-contain" />
            </div>
            <div className="flex w-full flex-col justify-end ps-2">
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">Admin Portal</span>
            </div>
          </div>

          <nav role="navigation" aria-label="Main navigation" className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
            {NAV_SECTIONS.map(renderNavSection)}
          </nav>

          <div
            className="mt-auto border-t px-3 py-2 text-center text-[10px] font-medium tracking-wide"
            style={{ borderColor: 'var(--apx-sidebar-border)', color: 'var(--apx-sidebar-text)' }}
          >
            © 2026 PROGREX — ALL RIGHTS RESERVED
          </div>

          <button
            aria-label="Close sidebar"
            onClick={() => setMobileOpen(false)}
            className="absolute right-3 top-4 flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-[#0b1618] hover:text-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </aside>

        {mobileOpen && <button aria-label="Close menu backdrop" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-black/50 lg:hidden" />}

        <div className={['flex flex-1 flex-col transition-all duration-300', contentOffset].join(' ')}>
          <div className="sticky top-0 z-30">
            <header className="flex h-16 items-center justify-between border-b px-4 backdrop-blur-xl sm:px-6" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'color-mix(in oklab, var(--apx-surface) 88%, transparent)' }}>
              <div className="flex items-center gap-3">
                <button
                  aria-label="Open menu"
                  onClick={() => setMobileOpen(true)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-slate-100 hover:text-slate-800 lg:hidden"
                  style={{ color: 'var(--apx-muted)' }}
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div ref={commandRef} className="relative hidden sm:block">
                  <div className="relative h-9 w-72 rounded-lg border" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface-alt)' }}>
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--apx-muted)' }} />
                    <input
                      value={commandQuery}
                      onFocus={() => setCommandOpen(true)}
                      onChange={(event) => {
                        setCommandQuery(event.target.value)
                        setCommandOpen(true)
                      }}
                      placeholder="Search commands or pages..."
                      className="h-full w-full rounded-lg bg-transparent ps-9 pe-4 text-sm outline-none"
                      style={{ color: 'var(--apx-text)' }}
                    />
                  </div>

                  {commandOpen ? (
                    <div className="absolute mt-2 max-h-80 w-96 overflow-auto rounded-xl border p-2 shadow-2xl" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
                      {filteredCommandItems.length === 0 ? (
                        <p className="px-2 py-3 text-sm apx-muted">No matching pages</p>
                      ) : (
                        filteredCommandItems.map((item) => {
                          const Icon = item.icon
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => {
                                setCommandOpen(false)
                                setCommandQuery('')
                              }}
                              className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-black/5"
                              style={{ color: 'var(--apx-text)' }}
                            >
                              <Icon className="h-4 w-4" />
                              {item.label}
                            </Link>
                          )
                        })
                      )}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  aria-label="Toggle theme"
                  onClick={() => setIsDark((v) => !v)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                  style={{ color: 'var(--apx-muted)' }}
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                <button
                  aria-label="Customize theme"
                  onClick={() => setCustomizerOpen((v) => !v)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                  style={{ color: 'var(--apx-muted)' }}
                >
                  <Palette className="h-4 w-4" />
                </button>
                <button aria-label="Notifications" className="relative flex h-8 w-8 items-center justify-center rounded-lg transition-colors" style={{ color: 'var(--apx-muted)' }}>
                  <Bell className="h-4 w-4" />
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
                </button>

                <div ref={profileRef} className="relative">
                  <button
                    aria-label="User menu"
                    onClick={() => setProfileMenuOpen((prev) => !prev)}
                    className="ms-1 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border text-xs font-semibold transition-colors"
                    style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-primary-soft)', color: 'var(--apx-primary)' }}
                  >
                    {adminAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={adminAvatar} alt={adminName} className="h-full w-full object-cover" />
                    ) : (
                      initials
                    )}
                  </button>

                  {profileMenuOpen ? (
                    <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border shadow-xl" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
                      <div className="border-b px-4 py-3" style={{ borderColor: 'var(--apx-border)' }}>
                        <p className="text-sm font-semibold apx-text">{adminName}</p>
                        <p className="text-xs apx-muted">{adminEmail}</p>
                      </div>

                      <div className="p-2">
                        <button className="apx-list-hover flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm apx-text">
                          <Settings className="h-4 w-4" />
                          Settings
                        </button>
                        <button className="apx-list-hover flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm apx-text">
                          <Bell className="h-4 w-4" />
                          Notifications
                        </button>
                        <button
                          onClick={() => {
                            setProfileMenuOpen(false)
                            setConfirmLogoutOpen(true)
                          }}
                          className="apx-list-hover flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm"
                          style={{ color: isDark ? '#fda4af' : '#be123c' }}
                        >
                          <LogOut className="h-4 w-4" />
                          Log out
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </header>
          </div>

          <main id="main-content" className={['flex-1', contentPaddingClass].join(' ')}>
            {children}
          </main>
        </div>
      </div>

      {customizerOpen && (
        <div className="fixed right-4 top-20 z-50 w-80 rounded-2xl border p-4 shadow-2xl" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'color-mix(in oklab, var(--apx-surface) 93%, transparent)', backdropFilter: 'blur(8px)' }}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-2xl font-semibold apx-text">Customize</h3>
            <button onClick={() => setCustomizerOpen(false)} className="rounded p-1 apx-muted hover:apx-text" aria-label="Close customizer">
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="mb-4 text-sm apx-muted">Personalize your dashboard experience.</p>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-base font-semibold apx-text">Theme</p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setIsDark(false)} className="inline-flex h-14 items-center justify-center gap-2 rounded-xl border text-sm font-medium" style={isDark ? { borderColor: 'var(--apx-border)', color: 'var(--apx-muted)' } : { borderColor: 'var(--apx-primary)', color: 'var(--apx-primary)' }}><Sun className="h-4 w-4" />Light</button>
                <button onClick={() => setIsDark(true)} className="inline-flex h-14 items-center justify-center gap-2 rounded-xl border text-sm font-medium" style={isDark ? { borderColor: 'var(--apx-primary)', color: 'var(--apx-primary)' } : { borderColor: 'var(--apx-border)', color: 'var(--apx-muted)' }}><Moon className="h-4 w-4" />Dark</button>
              </div>
            </div>

            <div>
              <p className="mb-2 text-base font-semibold apx-text">Color</p>
              <div className="grid grid-cols-5 gap-2">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.key}
                    onClick={() => setColorPreset(preset.key)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border"
                    style={{ borderColor: colorPreset === preset.key ? 'var(--apx-text)' : 'var(--apx-border)', backgroundColor: preset.value }}
                    aria-label={`Use ${preset.key} preset`}
                  >
                    {colorPreset === preset.key ? <Check className="h-3.5 w-3.5 text-white" /> : null}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-base font-semibold apx-text">Density</p>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setDensity('compact')} className="inline-flex h-14 flex-col items-center justify-center gap-1 rounded-xl border text-xs font-medium" style={density === 'compact' ? { borderColor: 'var(--apx-primary)', color: 'var(--apx-primary)' } : { borderColor: 'var(--apx-border)', color: 'var(--apx-muted)' }}><Rows2 className="h-4 w-4" />Compact</button>
                <button onClick={() => setDensity('comfortable')} className="inline-flex h-14 flex-col items-center justify-center gap-1 rounded-xl border text-xs font-medium" style={density === 'comfortable' ? { borderColor: 'var(--apx-primary)', color: 'var(--apx-primary)' } : { borderColor: 'var(--apx-border)', color: 'var(--apx-muted)' }}><Rows3 className="h-4 w-4" />Comfort</button>
                <button onClick={() => setDensity('spacious')} className="inline-flex h-14 flex-col items-center justify-center gap-1 rounded-xl border text-xs font-medium" style={density === 'spacious' ? { borderColor: 'var(--apx-primary)', color: 'var(--apx-primary)' } : { borderColor: 'var(--apx-border)', color: 'var(--apx-muted)' }}><Rows4 className="h-4 w-4" />Spacious</button>
              </div>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={resetToDefaults}
                className="apx-btn-outline w-full justify-center"
                style={{ backgroundColor: 'var(--apx-surface)' }}
              >
                Reset to Default
              </button>
            </div>
          </div>
        </div>
      )}

      <form ref={logoutFormRef} action="/api/admin/auth/logout" method="post" className="hidden" />

      <ApexConfirmationModal
        open={confirmLogoutOpen}
        title="Log Out"
        description="Are you sure you want to log out?"
        confirmLabel="Log Out"
        tone="danger"
        onClose={() => setConfirmLogoutOpen(false)}
        onConfirm={() => {
          logoutFormRef.current?.requestSubmit()
        }}
      />

      <span className="sr-only">{title}</span>
    </div>
  )
}
