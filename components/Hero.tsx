'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, ChevronRight } from 'lucide-react'
import OrbitOrb from './OrbitOrb'

interface HeroProps {
  badge?: string
  title: string
  highlight?: string
  highlightNewLine?: boolean
  subtitleLabel?: string
  subtitle: string
  primaryBtn?: { label: string; href: string }
  secondaryBtn?: { label: string; href: string }
  showStats?: boolean
}

const stats = [
  { value: 52, suffix: '+', label: 'Projects' },
  { value: 38,  suffix: '+', label: 'Clients' },
  { value: 4,   suffix: '+', label: 'Years' },
  { value: 25,  suffix: '+', label: 'Experts' },
]

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const duration = 1200
    const start = performance.now()
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
      else setCount(target)
    }
    requestAnimationFrame(step)
  }, [inView, target])

  return <span ref={ref}>{count}{suffix}</span>
}

export default function Hero({
  badge,
  title,
  highlight,
  highlightNewLine = false,
  subtitleLabel,
  subtitle,
  primaryBtn = { label: 'Get a Quote', href: '/contact' },
  secondaryBtn,
  showStats = false,
}: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Nebula blobs */}
      <div
        className="nebula-blob nebula-cyan absolute pointer-events-none"
        style={{ width: 600, height: 600, top: '-10%', right: '-5%', opacity: 0.08 }}
      />
      <div
        className="nebula-blob nebula-violet absolute pointer-events-none"
        style={{ width: 500, height: 500, bottom: '-15%', left: '-10%', opacity: 0.07 }}
      />

      {/* Dot grid */}
      <div className="absolute inset-0 bg-dot-grid opacity-30 pointer-events-none" />

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[rgba(3,3,15,0.7)] to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 sm:pt-28 sm:pb-16 w-full">
        {/* Main 2-column grid */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">

          {/* LEFT — Text + Buttons */}
          <div className="order-2 lg:order-1 lg:pt-8">
            {/* Eyebrow badge */}
            {badge && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="eyebrow-badge mb-5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-nebula-400 animate-pulse inline-block mr-2" />
                {badge}
              </motion.div>
            )}

            {/* Title — lg:whitespace-nowrap keeps each line on one row on desktop */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display font-black text-5xl sm:text-6xl lg:text-5xl xl:text-6xl 2xl:text-7xl text-white leading-[1.04] tracking-tight mb-5"
            >
              {title}
              {highlight && (
                <>
                  {highlightNewLine ? <br /> : ' '}
                  <span className="text-gradient-nebula">{highlight}</span>
                </>
              )}
            </motion.h1>

            {/* Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="max-w-xl mb-8"
            >
              {subtitleLabel && (
                <p className="text-sm sm:text-base font-semibold text-white/90 tracking-wide mb-1">
                  {subtitleLabel}
                </p>
              )}
              <p className="text-sm sm:text-base text-white/50 leading-relaxed">
                {subtitle}
              </p>
            </motion.div>

            {/* Buttons — side by side like original */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-row gap-4 flex-wrap"
            >
              <Link href={primaryBtn.href} className="btn-primary text-base px-8 py-4">
                <span>{primaryBtn.label}</span>
                <ArrowRight size={18} />
              </Link>
              {secondaryBtn && (
                <Link
                  href={secondaryBtn.href}
                  className="btn-outline text-base px-8 py-4 flex items-center gap-2"
                >
                  <ChevronRight size={16} />
                  {secondaryBtn.label}
                </Link>
              )}
            </motion.div>
          </div>

          {/* RIGHT — Orbit Orb on top, Stats below it */}
          <div className="order-1 lg:order-2 flex flex-col items-center gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
              className="w-full flex justify-center"
            >
              <OrbitOrb />
            </motion.div>

            {/* Stats — 2×2 grid, below the orb, right-side only */}
            {showStats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="w-full grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3"
              >
                {stats.map((stat, i) => (
                  <motion.div
                    key={i}
                    className="group relative rounded-lg p-3 sm:p-4 text-center overflow-hidden cursor-default"
                    style={{
                      background: 'rgba(103,232,249,0.04)',
                      border: '1px solid rgba(103,232,249,0.12)',
                    }}
                    whileHover={{
                      scale: 1.06,
                      y: -4,
                      background: 'rgba(103,232,249,0.10)',
                      boxShadow: '0 0 24px rgba(103,232,249,0.18), 0 8px 24px rgba(0,0,0,0.3)',
                    }}
                    transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                  >
                    {/* All 4 corner decorations */}
                    <span className="absolute top-0 left-0 w-3.5 h-3.5 border-t border-l border-nebula-400/50 group-hover:border-nebula-400 transition-colors pointer-events-none" style={{ borderRadius: '3px 0 0 0' }} />
                    <span className="absolute top-0 right-0 w-3.5 h-3.5 border-t border-r border-nebula-400/50 group-hover:border-nebula-400 transition-colors pointer-events-none" style={{ borderRadius: '0 3px 0 0' }} />
                    <span className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b border-l border-nebula-400/50 group-hover:border-nebula-400 transition-colors pointer-events-none" style={{ borderRadius: '0 0 0 3px' }} />
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b border-r border-nebula-400/50 group-hover:border-nebula-400 transition-colors pointer-events-none" style={{ borderRadius: '0 0 3px 0' }} />
                    <div className="font-display font-black text-2xl sm:text-3xl text-nebula-300 group-hover:text-nebula-200 transition-colors mb-1">
                      <CountUp target={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="font-mono text-[10px] text-white/40 group-hover:text-white/70 transition-colors uppercase tracking-widest">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
