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
  { value: '80+', label: 'Active Clients' },
  { value: '6+', label: 'Years Operational' },
  { value: '25+', label: 'Eng. Experts' },
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
  const [time, setTime] = useState('--:--:--')

  useEffect(() => {
    const update = () => {
      const n = new Date()
      setTime(
        `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}:${String(n.getSeconds()).padStart(2, '0')}`
      )
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-[#0A0A0F] pt-[53px]">
      {/* Tech grid */}
      <div className="absolute inset-0 tech-grid pointer-events-none" />
      {/* Ambient purple light — top right */}
      <div className="absolute top-0 right-0 w-[50%] h-[55%] bg-[#2D1169]/15 blur-[140px] pointer-events-none" />

      {/* Status bar */}
      <div className="relative border-b border-[#1A1A24] bg-[#0A0A0F]">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-8 flex items-center justify-between h-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="status-dot-pulse" />
              <span className="sys-label">SYS ONLINE</span>
            </div>
            <span className="hidden sm:block sys-label">PROGREX TECH SYSTEMS</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="sys-label font-mono">{time} UTC+8</span>
            <span className="hidden md:block sys-label-accent">READY</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-screen-xl mx-auto px-6 lg:px-8 w-full flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-center w-full py-20 lg:py-0 min-h-[calc(100vh-53px-32px)]">

          {/* Left — 7 cols */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="lg:col-span-7 lg:pr-16 lg:border-r border-[#1A1A24] py-12 lg:py-20"
          >
            {/* Badge */}
            {badge && (
              <div className="flex items-center gap-3 mb-8">
                <div className="status-dot-pulse" />
                <span className="sys-label-accent">{badge.replace(/^🚀\s*/, '')}</span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-[clamp(2rem,4.8vw,4.2rem)] font-bold text-[#F0EEF8] leading-[0.94] tracking-tight mb-4">
              {title}
              {highlight && (
                <span className="block text-[#7C2AE8] mt-2">{highlight}</span>
              )}
            </h1>

            {/* Accent rule */}
            <div className="tech-rule w-40 my-7" />

            {/* Subtitle */}
            <p className="text-[#5A5770] text-base leading-relaxed max-w-[500px] mb-10 font-light">
              {subtitle}
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3">
              <Link href={primaryBtn.href} className="btn-sys-filled">
                {primaryBtn.label.toUpperCase()}
                <ArrowRight size={14} />
              </Link>
              {secondaryBtn && (
                <Link href={secondaryBtn.href} className="btn-sys">
                  {secondaryBtn.label.toUpperCase()}
                  <ArrowRight size={14} />
                </Link>
              )}
            </div>
          </motion.div>

          {/* Right — 5 cols */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.18, ease: 'easeOut' }}
            className="lg:col-span-5 lg:pl-16 py-12 lg:py-20"
          >
            {/* Stats grid */}
            {showStats && (
              <div className="grid grid-cols-2 gap-[1px] bg-[#1A1A24] border border-[#1A1A24] mb-[1px]">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="bg-[#0F0F14] px-6 py-5 group hover:bg-[#14141B] transition-colors duration-150"
                  >
                    <div className="sys-label mb-2 group-hover:text-[#7C2AE8] transition-colors">
                      {stat.label}
                    </div>
                    <div className="data-value">{stat.value}</div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Operational status panel */}
            <div className="bg-[#0F0F14] border border-[#1A1A24] p-5">
              <div className="flex items-center justify-between mb-5">
                <span className="sys-label">OPERATIONAL STATUS</span>
                <span className="sys-label-accent">NOMINAL</span>
              </div>
              {[
                { label: 'DEV PIPELINE', pct: 98 },
                { label: 'DEPLOY SYS', pct: 100 },
                { label: 'SUPPORT OPS', pct: 95 },
                { label: 'CLIENT SYNC', pct: 92 },
              ].map((row, i) => (
                <div key={row.label} className="flex items-center gap-4 py-2.5 border-b border-[#1A1A24] last:border-0">
                  <span className="sys-label w-28 shrink-0">{row.label}</span>
                  <div className="flex-1 h-px bg-[#1A1A24] relative overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${row.pct}%` }}
                      transition={{ duration: 1.2, delay: 0.6 + i * 0.15, ease: 'easeOut' }}
                      className="absolute top-0 left-0 h-full bg-[#7C2AE8]"
                    />
                  </div>
                  <span className="font-mono text-[9px] text-[#7C2AE8] shrink-0">{row.pct}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom border */}
      <div className="relative border-t border-[#1A1A24]">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-8 flex items-center h-8">
          <span className="sys-label">
            SCROLL TO EXPLORE — BUILD FASTER. SCALE SMARTER.
          </span>
        </div>
      </div>
    </section>
  )
}

