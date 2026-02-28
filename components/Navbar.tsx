'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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

            {/* Logo + Status indicator group */}
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/" className="flex items-center group" aria-label="PROGREX Home">
                <Image
                  src="/Progrex Logo White Transparent.png"
                  alt="PROGREX"
                  width={140}
                  height={40}
                  className="h-22 w-auto object-contain group-hover:opacity-80 transition-opacity duration-200"
                  priority
                />
              </Link>
              {/* Status pill — only on very wide screens, inline (no absolute, no overlap) */}
              <div className="hidden 2xl:flex items-center gap-1.5 font-mono text-[9px] text-nebula-400/35 tracking-widest select-none border border-nebula-400/15 rounded-full px-2 py-0.5">
                <span className="w-1 h-1 rounded-full bg-emerald-400/70 animate-pulse" />
                <span>SYS_LIVE</span>
                <span className="text-nebula-400/20 animate-blink-dot">▮</span>
              </div>
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
                      isActive ? 'text-white' : 'text-white/55 hover:text-white'
                    }`}
                  >
                    {link.label}
                    {/* Sliding underline — scaleX from left on hover, always visible when active */}
                    <span
                      className={`absolute bottom-0 left-3 right-3 h-[1.5px] origin-left transition-transform duration-300 ${
                        isActive
                          ? 'scale-x-100'
                          : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                      style={{
                        background: 'linear-gradient(90deg, #0EA5E9 0%, #7C3AED 100%)',
                        boxShadow: isActive ? '0 0 8px rgba(14,165,233,0.7)' : undefined,
                      }}
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
