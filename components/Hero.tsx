'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Play } from 'lucide-react'

interface Particle {
  left: number
  top: number
  duration: number
  delay: number
}

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
  { value: '150+', label: 'Projects' },
  { value: '80+', label: 'Clients' },
  { value: '6+', label: 'Years' },
  { value: '25+', label: 'Experts' },
]

export default function Hero({
  badge,
  title,
  highlight,
  subtitle,
  primaryBtn = { label: 'Get a Quote', href: '/contact' },
  secondaryBtn,
  showStats = false,
}: HeroProps) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 3 + Math.random() * 4,
        delay: Math.random() * 5,
      }))
    )
  }, [])
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050510]">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1f] via-[#050510] to-[#0a0518]" />
      <div className="absolute inset-0 bg-grid opacity-30" />
      {/* Radial glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#3A0CA3]/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#4361EE]/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#560BAD]/10 rounded-full blur-[80px]" />

      {/* Floating particles — client-only to avoid hydration mismatch */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-[#560BAD]/60"
          style={{ left: `${p.left}%`, top: `${p.top}%` }}
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
        />
      ))}

      {/* Floating geometric shapes */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        className="absolute top-24 right-16 w-16 h-16 border border-[#560BAD]/30 rounded-lg opacity-40 hidden lg:block"
      />
      <motion.div
        animate={{ y: [0, 20, 0], rotate: [360, 180, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-32 left-16 w-10 h-10 border border-[#4361EE]/30 rounded-full opacity-30 hidden lg:block"
      />
      <motion.div
        animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 right-1/4 w-8 h-8 bg-gradient-to-br from-[#560BAD]/20 to-[#4361EE]/20 rounded hidden lg:block"
      />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        {badge && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-[#560BAD]/30 text-[#CFA3EA] text-xs font-semibold uppercase tracking-widest mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-[#831DC6] animate-pulse" />
            {badge}
          </motion.div>
        )}

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6"
        >
          {title}
          {highlight && (
            <>
              {' '}
              <span className="text-gradient neon-text">{highlight}</span>
            </>
          )}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="text-base sm:text-lg lg:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto mb-10"
        >
          {subtitle}
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Link href={primaryBtn.href} className="btn-primary text-base px-8 py-4">
              <span>{primaryBtn.label}</span>
              <ArrowRight size={18} />
            </Link>
          </motion.div>
          {secondaryBtn && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link href={secondaryBtn.href} className="btn-outline text-base px-8 py-4 flex items-center gap-2">
                <Play size={16} className="fill-current" />
                {secondaryBtn.label}
              </Link>
            </motion.div>
          )}
        </motion.div>

        {/* Stats */}
        {showStats && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, i) => (
              <div key={i} className="glass-card rounded-xl p-4 text-center border border-[#560BAD]/20">
                <div className="text-2xl sm:text-3xl font-extrabold text-gradient mb-1">{stat.value}</div>
                <div className="text-slate-400 text-xs sm:text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050510] to-transparent" />
    </section>
  )
}
