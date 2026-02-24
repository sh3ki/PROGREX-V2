'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface SectionWrapperProps {
  children: ReactNode
  className?: string
  id?: string
}

export default function SectionWrapper({ children, className = '', id }: SectionWrapperProps) {
  return (
    <section id={id} className={`section-padding relative ${className}`}>
      <div className="max-w-screen-xl mx-auto px-6 lg:px-8">
        {children}
      </div>
    </section>
  )
}

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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      className={`mb-12 lg:mb-16 ${center ? 'text-center' : ''}`}
    >
      {badge && (
        <div className={`flex items-center gap-2 mb-5 ${center ? 'justify-center' : ''}`}>
          <div className="w-5 h-px bg-[#7C2AE8]" />
          <span className="sys-label-accent">{badge}</span>
          <div className="w-5 h-px bg-[#7C2AE8]" />
        </div>
      )}
      <h2 className={`text-[clamp(1.7rem,3.2vw,2.8rem)] font-bold text-[#F0EEF8] leading-tight tracking-tight ${center ? 'mx-auto max-w-3xl' : ''}`}>
        {title}
        {highlight && <> <span className="text-[#7C2AE8]">{highlight}</span></>}
      </h2>
      {subtitle && (
        <p className={`mt-4 text-sm text-[#5A5770] leading-relaxed font-light ${center ? 'mx-auto max-w-2xl' : 'max-w-2xl'}`}>
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}
