'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, TrendingUp, Clock, Shield, DollarSign, Layers, Code2, Cloud, Eye, Cpu, Plug, Gauge, BadgeCheck, FileCheck, TimerReset, Lock, RefreshCw } from 'lucide-react'
import { useTranslation } from '@/components/TranslationProvider'

// ── Shared circuit texture style ──────────────────────────────────────────────
const circuitBg: React.CSSProperties = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44'%3E%3Cline x1='0' y1='22' x2='16' y2='22' stroke='rgba(103,232,249,0.07)' stroke-width='0.7'/%3E%3Cline x1='28' y1='22' x2='44' y2='22' stroke='rgba(103,232,249,0.07)' stroke-width='0.7'/%3E%3Cline x1='22' y1='0' x2='22' y2='16' stroke='rgba(103,232,249,0.07)' stroke-width='0.7'/%3E%3Cline x1='22' y1='28' x2='22' y2='44' stroke='rgba(103,232,249,0.07)' stroke-width='0.7'/%3E%3Ccircle cx='22' cy='22' r='4' fill='none' stroke='rgba(103,232,249,0.09)' stroke-width='0.8'/%3E%3Ccircle cx='22' cy='22' r='1.2' fill='rgba(103,232,249,0.11)'/%3E%3Ccircle cx='0' cy='0' r='1.2' fill='rgba(103,232,249,0.05)'/%3E%3Ccircle cx='44' cy='0' r='1.2' fill='rgba(103,232,249,0.05)'/%3E%3Ccircle cx='0' cy='44' r='1.2' fill='rgba(103,232,249,0.05)'/%3E%3Ccircle cx='44' cy='44' r='1.2' fill='rgba(103,232,249,0.05)'/%3E%3C/svg%3E\")",
  backgroundSize: '44px 44px',
}

// ── 1. Outcomes We Deliver ────────────────────────────────────────────────────
const ACCENT = '#0EA5E9'

const OUTCOME_ICONS = [TrendingUp, Clock, Gauge, DollarSign, Layers, Code2]

export function OutcomesSection() {
  const { translations } = useTranslation()
  const rawOutcomes = translations.outcomes as unknown as string[][]
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {rawOutcomes.map((item, i) => {
        const Icon = OUTCOME_ICONS[i] ?? Code2
        const [value, label, desc] = item
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.07 }}
            className="group relative rounded-xl overflow-hidden"
            style={{ background: 'rgba(8,8,28,0.92)', border: '1px solid rgba(103,232,249,0.12)' }}
            whileHover={{
              scale: 1.03,
              y: -5,
              boxShadow: `0 0 28px ${ACCENT}22, 0 12px 36px rgba(0,0,0,0.5)`,
              borderColor: `${ACCENT}55`,
              transition: { type: 'spring', stiffness: 260, damping: 22 },
            }}
          >
            {/* Circuit texture */}
            <div className="absolute inset-0 pointer-events-none opacity-60" style={circuitBg} />
            {/* Top scan line */}
            <div
              className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `linear-gradient(to right, transparent, ${ACCENT}cc, transparent)` }}
            />
            <div className="relative p-6">
              {/* Icon + value row */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${ACCENT}18`, border: `1px solid ${ACCENT}35` }}
                >
                  <Icon size={20} style={{ color: ACCENT }} />
                </div>
                <span
                  className="font-display font-black text-2xl text-nebula-300"
                >
                  {value}
                </span>
              </div>
              <h3 className="font-bold text-white text-base mb-2 group-hover:text-nebula-200 transition-colors">
                {label}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ── 2. Quality & Security Standards ──────────────────────────────────────────
const STANDARD_ICONS = [Shield, Lock, FileCheck, BadgeCheck, RefreshCw, Eye, TimerReset, Cpu]

export function QualitySection() {
  const { translations } = useTranslation()
  const rawStandards = translations.qualityStandards as unknown as string[][]
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {rawStandards.map((item, i) => {
        const Icon = STANDARD_ICONS[i] ?? Shield
        const [label, desc] = item
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.06 }}
            className="group relative rounded-xl overflow-hidden p-5"
            style={{ background: 'rgba(8,8,28,0.92)', border: '1px solid rgba(103,232,249,0.12)' }}
            whileHover={{
              y: -4,
              boxShadow: '0 0 24px rgba(14,165,233,0.14), 0 8px 28px rgba(0,0,0,0.45)',
              borderColor: 'rgba(14,165,233,0.35)',
              transition: { type: 'spring', stiffness: 280, damping: 22 },
            }}
          >
            <div className="absolute inset-0 pointer-events-none opacity-55" style={circuitBg} />
            <div
              className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: 'linear-gradient(to right, transparent, rgba(14,165,233,0.8), rgba(124,58,237,0.8), transparent)' }}
            />
            <div className="relative">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.22)' }}
              >
                <Icon size={18} className="text-nebula-400" />
              </div>
              <h3 className="text-white font-semibold text-sm mb-1.5 group-hover:text-nebula-200 transition-colors">{label}</h3>
              <p className="text-slate-500 text-xs leading-relaxed group-hover:text-slate-400 transition-colors">{desc}</p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ── 3. What Makes Our Architecture Different ──────────────────────────────────
const ARCH_ICONS = [Plug, Cloud, Layers, Eye]

export function ArchitectureSection() {
  const { translations } = useTranslation()
  const rawArch = translations.architecture as unknown as string[][]
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {rawArch.map((item, i) => {
        const Icon = ARCH_ICONS[i] ?? Plug
        const [tag, title, subtitle, desc] = item
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: i % 2 === 0 ? -24 : 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: i * 0.1 }}
            className="group relative rounded-xl overflow-hidden"
            style={{ background: 'rgba(8,8,28,0.92)', border: '1px solid rgba(103,232,249,0.12)' }}
            whileHover={{
              y: -4,
              boxShadow: `0 0 28px ${ACCENT}20, 0 12px 36px rgba(0,0,0,0.5)`,
              borderColor: `${ACCENT}45`,
              transition: { type: 'spring', stiffness: 260, damping: 22 },
            }}
          >
            <div className="absolute inset-0 pointer-events-none opacity-60" style={circuitBg} />
            <div
              className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `linear-gradient(to right, transparent, ${ACCENT}cc, transparent)` }}
            />
            <div className="relative p-6 flex gap-5 items-start">
              <div
                className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center mt-0.5"
                style={{ background: `${ACCENT}18`, border: `1px solid ${ACCENT}35` }}
              >
                <Icon size={22} style={{ color: ACCENT }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] tracking-widest text-nebula-500/60">{tag}</span>
                </div>
                <h3 className="text-white font-bold text-base mb-0.5 group-hover:text-nebula-200 transition-colors">{title}</h3>
                <p className="font-mono text-[11px] mb-2 text-nebula-400/70">{subtitle}</p>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ── 4. Service Guarantees  ────────────────────────────────────────────────────
export function GuaranteesSection() {
  const { translations } = useTranslation()
  const g = translations.guarantees as unknown as {
    badge: string; heading: string; headingHighlight: string; body: string;
    stats: string[][]; items: string[];
  }
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* Left — heading */}
      <div>
        <div className="eyebrow-badge mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-nebula-500 animate-pulse" />
          {g.badge}
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-5 leading-tight">
          {g.heading} <span className="text-gradient-nebula">{g.headingHighlight}</span>
        </h2>
        <p className="text-slate-400 leading-relaxed mb-6">
          {g.body}
        </p>
        <div className="flex items-center gap-4">
          {g.stats.map((stat, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div className="w-px h-10 bg-nebula-700/30" />}
              <div className="text-center">
                <div className="font-display font-black text-3xl text-nebula-300">{stat[0]}</div>
                <div className="font-mono text-[10px] text-white/40 uppercase tracking-widest mt-0.5">{stat[1]}</div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Right — checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {g.items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="flex items-start gap-3 text-sm text-white/60 hover:text-white/80 transition-colors"
          >
            <CheckCircle size={15} className="text-nebula-500 shrink-0 mt-0.5" />
            <span>{item}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ── Approach Cards ────────────────────────────────────────────────────────────
export function ApproachCards() {
  const { translations } = useTranslation()
  const rawApproach = translations.approach as unknown as string[][]
  return (
    <div className="grid grid-cols-2 gap-4">
      {rawApproach.map((item, i) => {
        const [tag, title, desc] = item
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
            className="group relative rounded-xl overflow-hidden"
            style={{ background: 'rgba(8,8,28,0.92)', border: '1px solid rgba(103,232,249,0.12)' }}
            whileHover={{
              y: -4,
              boxShadow: `0 0 24px ${ACCENT}22, 0 10px 30px rgba(0,0,0,0.5)`,
              borderColor: `${ACCENT}50`,
              transition: { type: 'spring', stiffness: 280, damping: 22 },
            }}
          >
            {/* Circuit texture */}
            <div className="absolute inset-0 pointer-events-none opacity-55" style={circuitBg} />
            {/* Top scan line */}
            <div
              className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `linear-gradient(to right, transparent, ${ACCENT}cc, transparent)` }}
            />
            <div className="relative p-5">
              <span className="font-mono text-[9px] tracking-widest block mb-3 text-nebula-500/60">{tag}</span>
              <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-nebula-200 transition-colors">{title}</h3>
              <p className="text-xs text-white/45 leading-relaxed group-hover:text-white/65 transition-colors">{desc}</p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ── Default export (unused) — each section individually imported ──────────────
export default function ServicesDetailSections() { return null }
