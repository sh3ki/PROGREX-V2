'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Projects', href: '/projects' },
  { label: 'Ready-Made Systems', href: '/ready-made-systems' },
  { label: 'Blogs', href: '/blogs' },
  { label: 'Contact Us', href: '/contact' },
]

// Constellation hex logo SVG
function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <polygon
        points="14,2 26,8 26,20 14,26 2,20 2,8"
        fill="none"
        stroke="rgba(103,232,249,0.8)"
        strokeWidth="1.2"
      />
      <polygon
        points="14,7 21,11 21,17 14,21 7,17 7,11"
        fill="rgba(103,232,249,0.12)"
        stroke="rgba(103,232,249,0.5)"
        strokeWidth="0.8"
      />
      <circle cx="14" cy="14" r="2.5" fill="#67E8F9" />
      <line x1="14" y1="2"  x2="14" y2="7"  stroke="rgba(103,232,249,0.5)" strokeWidth="0.8"/>
      <line x1="14" y1="21" x2="14" y2="26" stroke="rgba(103,232,249,0.5)" strokeWidth="0.8"/>
      <line x1="2"  y1="8"  x2="7"  y2="11" stroke="rgba(103,232,249,0.5)" strokeWidth="0.8"/>
      <line x1="21" y1="17" x2="26" y2="20" stroke="rgba(103,232,249,0.5)" strokeWidth="0.8"/>
    </svg>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[rgba(3,3,15,0.88)] backdrop-blur-xl border-b border-[rgba(103,232,249,0.12)] shadow-[0_4px_30px_rgba(0,0,0,0.4)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group" aria-label="PROGREX Home">
              <LogoMark />
              <span className="font-display font-bold text-lg tracking-[0.12em] text-white group-hover:text-nebula-300 transition-colors duration-200">
                PROGREX
              </span>
            </Link>

            {/* Coordinate decoration — desktop only */}
            <div className="hidden xl:flex items-center gap-1 font-mono text-[10px] text-nebula-400/40 tracking-widest absolute left-1/2 -translate-x-1/2">
              <span>SYS</span>
              <span className="text-nebula-400/20">://</span>
              <span>MISSION_CONTROL</span>
              <span className="text-nebula-400/20 ml-2 animate-blink-dot">▮</span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {navLinks.map((link) => {
                const isActive = pathname === link.href ||
                  (link.href !== '/' && pathname.startsWith(link.href))
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 group ${
                      isActive ? 'text-nebula-300' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {link.label}
                    <span
                      className={`absolute bottom-0 left-3 right-3 h-px bg-gradient-to-r from-nebula-400 to-aurora-400 transition-all duration-300 ${
                        isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
                      }`}
                    />
                  </Link>
                )
              })}
            </nav>

            {/* CTA + Hamburger */}
            <div className="flex items-center gap-3">
              <Link
                href="/contact"
                className="hidden sm:inline-flex btn-primary text-sm"
              >
                <span>Get a Quote</span>
              </Link>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-lg border border-nebula-400/20 text-white/60 hover:text-white hover:border-nebula-400/50 transition-all duration-200"
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait">
                  {mobileOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X size={20} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="open"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu size={20} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed top-16 left-0 right-0 z-40 bg-[rgba(3,3,15,0.97)] backdrop-blur-xl border-b border-nebula-400/10 lg:hidden"
          >
            {/* Scanline decoration */}
            <div className="absolute inset-0 bg-scanlines opacity-20 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1 relative">
              {navLinks.map((link, i) => {
                const isActive = pathname === link.href ||
                  (link.href !== '/' && pathname.startsWith(link.href))
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      href={link.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-nebula-400/10 text-nebula-300 border border-nebula-400/25'
                          : 'text-white/60 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-nebula-400 shrink-0" />
                      )}
                      {link.label}
                    </Link>
                  </motion.div>
                )
              })}
              <div className="pt-2 pb-1">
                <Link href="/contact" className="btn-primary w-full justify-center text-sm">
                  <span>Get a Quote</span>
                </Link>
              </div>
              {/* Footer hint */}
              <div className="pt-1 pb-2 font-mono text-[9px] text-white/20 text-center tracking-widest">
                PROGREX // MISSION CONTROL v4
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
