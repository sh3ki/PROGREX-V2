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
  subtitle: string
  primaryBtn?: { label: string; href: string }
  secondaryBtn?: { label: string; href: string }
  showStats?: boolean
}

const stats = [
  { value: 150, suffix: '+', label: 'Projects' },
  { value: 80,  suffix: '+', label: 'Clients' },
  { value: 6,   suffix: '+', label: 'Years' },
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* LEFT — Text */}
          <div className="order-2 lg:order-1">
            {/* Eyebrow badge */}
            {badge && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="eyebrow-badge mb-6"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-nebula-400 animate-pulse inline-block mr-2" />
                {badge}
              </motion.div>
            )}

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display font-black text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-white leading-[1.04] tracking-tight mb-6"
            >
              {title}
              {highlight && (
                <>
                  {' '}
                  <span className="text-gradient-nebula">{highlight}</span>
                </>
              )}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-base sm:text-lg text-white/55 leading-relaxed max-w-xl mb-10"
            >
              {subtitle}
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4"
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

            {/* Stats */}
            {showStats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4"
              >
                {stats.map((stat, i) => (
                  <div
                    key={i}
                    className="panel-corner relative rounded-lg p-4 text-center"
                    style={{
                      background: 'rgba(103,232,249,0.04)',
                      border: '1px solid rgba(103,232,249,0.12)',
                    }}
                  >
                    <div className="font-display font-black text-2xl sm:text-3xl text-nebula-300 mb-1">
                      <CountUp target={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          {/* RIGHT — Orbit Orb */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
            className="order-1 lg:order-2 flex justify-center"
          >
            <OrbitOrb />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
