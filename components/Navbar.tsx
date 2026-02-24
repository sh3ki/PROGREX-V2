'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { label: 'HOME', href: '/' },
  { label: 'ABOUT', href: '/about' },
  { label: 'SERVICES', href: '/services' },
  { label: 'PROJECTS', href: '/projects' },
  { label: 'SYSTEMS', href: '/ready-made-systems' },
  { label: 'BLOG', href: '/blogs' },
  { label: 'CONTACT', href: '/contact' },
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
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${
          scrolled ? 'bg-[#0A0A0F]/97' : 'bg-[#0A0A0F]'
        } border-b border-[#1A1A24]`}
      >
        {/* Top accent line */}
        <div className="h-[1px] bg-[#7C2AE8]" />

        <div className="max-w-screen-xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-[52px]">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="relative w-6 h-6 border border-[#4C1D95] flex items-center justify-center group-hover:border-[#7C2AE8] transition-colors duration-150">
                <div className="w-2.5 h-2.5 bg-[#7C2AE8]" />
                <div className="absolute -top-px -right-px w-1 h-1 bg-[#7C2AE8]" />
              </div>
              <span className="text-[12px] font-bold tracking-[0.25em] text-[#F0EEF8] uppercase font-mono">
                PROGREX
              </span>
              <span className="hidden sm:block text-[8px] font-mono text-[#3A3854] tracking-widest border-l border-[#1A1A24] pl-3 whitespace-nowrap">
                TECH.SYS v2
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center h-[52px]">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== '/' && pathname.startsWith(link.href))
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative flex items-center h-full px-4 text-[10px] font-mono tracking-[0.18em] transition-colors duration-150 border-r border-[#1A1A24] first:border-l ${
                      isActive
                        ? 'text-[#C4B5FD] bg-[#0F0F14]'
                        : 'text-[#3A3854] hover:text-[#9B98B3] hover:bg-[#0C0C12]'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#7C2AE8]"
                        transition={{ duration: 0.18, ease: 'linear' }}
                      />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* CTA + Hamburger */}
            <div className="flex items-center h-[52px]">
              <Link
                href="/contact"
                className="hidden sm:flex items-center gap-2 px-5 h-full text-[10px] font-mono tracking-[0.15em] border-l border-[#1A1A24] text-[#C4B5FD] hover:bg-[#7C2AE8] hover:text-white hover:border-[#7C2AE8] transition-all duration-150"
              >
                GET QUOTE
              </Link>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden flex flex-col items-center justify-center gap-[5px] w-[52px] h-full border-l border-[#1A1A24] text-[#5A5770] hover:text-[#C4B5FD] hover:bg-[#0F0F14] transition-colors"
                aria-label="Toggle menu"
              >
                <motion.span
                  animate={{ rotate: mobileOpen ? 45 : 0, y: mobileOpen ? 7 : 0 }}
                  className="block w-4 h-px bg-current"
                  transition={{ duration: 0.15 }}
                />
                <motion.span
                  animate={{ opacity: mobileOpen ? 0 : 1 }}
                  className="block w-4 h-px bg-current"
                  transition={{ duration: 0.1 }}
                />
                <motion.span
                  animate={{ rotate: mobileOpen ? -45 : 0, y: mobileOpen ? -7 : 0 }}
                  className="block w-4 h-px bg-current"
                  transition={{ duration: 0.15 }}
                />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
            className="fixed top-[53px] left-0 right-0 z-40 bg-[#0A0A0F] border-b border-[#1A1A24] lg:hidden overflow-hidden"
          >
            {navLinks.map((link, i) => {
              const isActive =
                pathname === link.href ||
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
                    className={`flex items-center gap-4 px-6 py-3.5 border-b border-[#0F0F14] text-[10px] font-mono tracking-[0.2em] transition-colors ${
                      isActive
                        ? 'text-[#C4B5FD] bg-[#0F0F14] border-l-2 border-l-[#7C2AE8]'
                        : 'text-[#3A3854] hover:text-[#9B98B3] hover:bg-[#0C0C12]'
                    }`}
                  >
                    <span className="text-[#1E1E2E] font-mono text-[8px] w-5">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {link.label}
                  </Link>
                </motion.div>
              )
            })}
            <Link
              href="/contact"
              className="flex items-center justify-center py-4 text-[10px] font-mono tracking-[0.2em] bg-[#7C2AE8] text-white hover:bg-[#8B39F0] transition-colors"
            >
              INITIATE CONTACT
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

