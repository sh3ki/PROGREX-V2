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

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          scrolled
            ? 'bg-[#0D0F12]/96 border-b border-[#1F2530]'
            : 'bg-transparent border-b border-transparent'
        }`}
        style={{ backdropFilter: scrolled ? 'blur(8px)' : 'none' }}
      >
        <div className="max-w-350 mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-[60px]">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="flex items-center gap-0.5">
                <div className="w-4 h-4 bg-[#1B6FFF]" />
                <div className="w-2 h-4 bg-[#1B6FFF]/40" />
              </div>
              <span className="text-[15px] font-bold tracking-[0.08em] text-white uppercase">
                PROGREX
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-4 py-5 text-[13px] font-medium tracking-[0.01em] transition-colors duration-150 group ${
                      isActive ? 'text-[#1B6FFF]' : 'text-[#8892A4] hover:text-white'
                    }`}
                  >
                    {link.label}
                    {/* active/hover line */}
                    <span
                      className={`absolute bottom-0 left-4 right-4 h-px bg-[#1B6FFF] transition-all duration-200 ${
                        isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'
                      }`}
                    />
                  </Link>
                )
              })}
            </nav>

            {/* CTA */}
            <div className="flex items-center gap-3">
              <Link
                href="/contact"
                className="hidden sm:inline-flex btn-primary text-[13px] px-5 py-2.5"
              >
                Get a Quote
              </Link>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden w-9 h-9 flex items-center justify-center border border-[#1F2530] text-[#8892A4] hover:text-white hover:border-[#293040] transition-all"
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {mobileOpen ? (
                    <motion.div key="c" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <X size={18} />
                    </motion.div>
                  ) : (
                    <motion.div key="o" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <Menu size={18} />
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
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[60px] left-0 right-0 z-40 bg-[#0D0F12] border-b border-[#1F2530] lg:hidden"
          >
            <div className="max-w-350 mx-auto px-6 py-4 flex flex-col">
              {navLinks.map((link, i) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      href={link.href}
                      className={`flex items-center py-3.5 text-sm font-medium border-b border-[#1F2530] transition-colors ${
                        isActive
                          ? 'text-[#1B6FFF]'
                          : 'text-[#8892A4] hover:text-white'
                      }`}
                    >
                      {isActive && (
                        <span className="w-1 h-1 bg-[#1B6FFF] mr-3 shrink-0" />
                      )}
                      {link.label}
                    </Link>
                  </motion.div>
                )
              })}
              <div className="pt-4 pb-1">
                <Link href="/contact" className="btn-primary w-full justify-center text-sm">
                  Get a Quote
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

