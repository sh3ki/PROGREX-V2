'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface SectionWrapperProps {
  children: ReactNode
  className?: string
  id?: string
  withDivider?: boolean
  decoration?: ReactNode  // constellation or other absolute-positioned decor
}

export default function SectionWrapper({ children, className = '', id, withDivider = false, decoration }: SectionWrapperProps) {
  return (
    <section id={id} className={`section-padding relative ${className}`}>
      {withDivider && <div className="section-divider mb-16" />}
      {/* Constellation / decorative element — rendered outside the content max-w so it lives in the margin gutter */}
      {decoration}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────
// SectionHeader — eyebrow badge + gradient title
// ─────────────────────────────────────────────

interface SectionHeaderProps {
  badge?: string
  title: string
  highlight?: string
  subtitle?: string
  center?: boolean
}

export function SectionHeader({ badge, title, highlight, subtitle, center = true }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`mb-12 lg:mb-16 ${center ? 'text-center' : ''}`}
    >
      {/* Eyebrow badge */}
      {badge && (
        <div className={`eyebrow-badge mb-5 ${center ? 'mx-auto' : ''}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-nebula-400 animate-pulse inline-block mr-2" />
          {badge}
        </div>
      )}

      {/* Title */}
      <h2
        className={`font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white leading-tight ${
          center ? 'mx-auto max-w-3xl' : ''
        }`}
      >
        {title}
        {highlight && (
          <>
            {' '}
            <span className="text-gradient-nebula">{highlight}</span>
          </>
        )}
      </h2>

      {/* Subtitle */}
      {subtitle && (
        <p
          className={`mt-4 text-base sm:text-lg text-white/50 leading-relaxed ${
            center ? 'mx-auto max-w-2xl' : 'max-w-2xl'
          }`}
        >
          {subtitle}
        </p>
      )}

      {/* Under-title gradient line */}
      {badge && (
        <div
          className={`mt-6 h-px max-w-xs ${center ? 'mx-auto' : ''}`}
          style={{ background: 'linear-gradient(to right, transparent, rgba(103,232,249,0.4), transparent)' }}
        />
      )}
    </motion.div>
  )
}
