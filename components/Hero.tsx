'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface HeroProps {
  badge?: string
  title: string
  highlight?: string
  subtitle: string
  primaryBtn?: { label: string; href: string }
  secondaryBtn?: { label: string; href: string }
  showStats?: boolean
}

const stats = [
  { value: '150+', label: 'Projects Delivered' },
  { value: '80+', label: 'Enterprise Clients' },
  { value: '6+', label: 'Years in Operation' },
  { value: '25+', label: 'Expert Engineers' },
]

// Geometric grid visual element
function GridVisual() {
  return (
    <div className="relative w-full h-full min-h-[340px] lg:min-h-0 flex items-center justify-center overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid-fine opacity-100" />

      {/* Corner marks */}
      <div className="absolute top-4 left-4 w-5 h-5 border-t border-l border-[#1B6FFF]" />
      <div className="absolute top-4 right-4 w-5 h-5 border-t border-r border-[#293040]" />
      <div className="absolute bottom-4 left-4 w-5 h-5 border-b border-l border-[#293040]" />
      <div className="absolute bottom-4 right-4 w-5 h-5 border-b border-r border-[#1B6FFF]/40" />

      {/* Central structural element */}
      <div className="relative w-48 h-48 lg:w-64 lg:h-64">
        {/* Outer ring */}
        <div className="absolute inset-0 border border-[#1F2530]" />
        {/* Inner ring */}
        <div className="absolute inset-8 border border-[#293040]" />
        {/* Core */}
        <div className="absolute inset-16 border border-[#1B6FFF]/50 bg-[#1B6FFF]/5" />

        {/* Accent lines */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-8 bg-gradient-to-b from-[#1B6FFF] to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-8 bg-gradient-to-t from-[#1B6FFF]/30 to-transparent" />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-px w-8 bg-gradient-to-r from-[#1B6FFF] to-transparent" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-px w-8 bg-gradient-to-l from-[#1B6FFF]/30 to-transparent" />

        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-2 h-2 bg-[#1B6FFF]"
          />
        </div>
      </div>

      {/* Data readout cards */}
      <div className="absolute top-6 right-6 bg-[#0D0F12] border border-[#1F2530] px-3 py-2">
        <p className="font-mono text-[9px] text-[#4E5A6E] tracking-widest mb-0.5">SYS STATUS</p>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-emerald-500 animate-pulse" />
          <p className="font-mono text-[10px] text-emerald-400 tracking-wider">OPERATIONAL</p>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 bg-[#0D0F12] border border-[#1F2530] px-3 py-2">
        <p className="font-mono text-[9px] text-[#4E5A6E] tracking-widest mb-0.5">DELIVERY RATE</p>
        <p className="font-mono text-[13px] text-[#EEF0F3] tracking-wider font-medium">98.4%</p>
      </div>

      {/* Horizontal accent line */}
      <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-[#1B6FFF]/20 via-[#1B6FFF]/5 to-transparent pointer-events-none" />
    </div>
  )
}

export default function Hero({
  badge,
  title,
  highlight,
  subtitle,
  primaryBtn = { label: 'Get a Quote', href: '/contact' },
  secondaryBtn,
  showStats = false,
}: HeroProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return (
    <section className="relative min-h-screen flex items-center bg-[#0D0F12] overflow-hidden pt-[60px]">
      {/* Full-bleed background grid */}
      <div className="absolute inset-0 bg-grid opacity-100" />

      {/* Structural vertical lines (architectural columns) */}
      <div className="absolute top-0 bottom-0 left-[20%] w-px bg-[#1F2530]/40 hidden xl:block" />
      <div className="absolute top-0 bottom-0 right-[20%] w-px bg-[#1F2530]/40 hidden xl:block" />

      {/* Blue accent: left border strip */}
      <div className="absolute left-0 top-[60px] bottom-0 w-[3px] bg-gradient-to-b from-[#1B6FFF] via-[#1B6FFF]/40 to-transparent" />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 w-full py-16 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[calc(100vh-60px)]">
          {/* â”€â”€ LEFT: Content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="lg:col-span-7 xl:col-span-6 py-12 lg:py-16">
            {/* Badge / label */}
            {badge && (
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="label mb-6 flex items-center gap-2"
              >
                <span className="w-5 h-px bg-[#1B6FFF]" />
                {badge}
              </motion.p>
            )}

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl sm:text-5xl lg:text-[3.75rem] xl:text-[4.25rem] font-bold text-[#EEF0F3] leading-[1.05] tracking-[-0.04em] mb-6"
            >
              {title}
              {highlight && (
                <span className="block text-[#1B6FFF]">{highlight}</span>
              )}
            </motion.h1>

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-12 h-px bg-[#1B6FFF] mb-6 origin-left"
            />

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="text-base lg:text-lg text-[#8892A4] leading-relaxed max-w-lg mb-10"
            >
              {subtitle}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-wrap gap-3 mb-14"
            >
              <Link href={primaryBtn.href} className="btn-primary text-[14px] px-6 py-3">
                <span>{primaryBtn.label}</span>
                <ArrowRight size={16} />
              </Link>
              {secondaryBtn && (
                <Link href={secondaryBtn.href} className="btn-outline text-[14px] px-6 py-3">
                  {secondaryBtn.label}
                </Link>
              )}
            </motion.div>

            {/* Stats */}
            {showStats && mounted && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.55 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-0 border border-[#1F2530]"
              >
                {stats.map((stat, i) => (
                  <div
                    key={i}
                    className={`px-5 py-4 ${i < 3 ? 'border-r border-[#1F2530]' : ''}`}
                  >
                    <div className="text-xl sm:text-2xl font-bold text-[#EEF0F3] tracking-[-0.03em] mb-0.5">{stat.value}</div>
                    <div className="font-mono text-[9px] text-[#4E5A6E] tracking-widest uppercase">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          {/* â”€â”€ RIGHT: Visual â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 xl:col-span-6 h-full hidden lg:flex items-center justify-center"
          >
            <div className="w-full border border-[#1F2530] bg-[#0D0F12]" style={{ aspectRatio: '1/1', maxWidth: 480 }}>
              <GridVisual />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom separator */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[#1F2530]" />
    </section>
  )
}

