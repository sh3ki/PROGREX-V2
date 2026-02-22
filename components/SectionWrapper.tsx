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
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
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
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={`mb-12 lg:mb-16 ${center ? 'text-left lg:text-center' : ''}`}
    >
      {badge && (
        <p className={`label mb-4 ${center ? 'lg:text-center' : ''}`}>
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-px bg-[#1B6FFF]" />
            {badge}
          </span>
        </p>
      )}
      <h2
        className={`text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-[#EEF0F3] leading-[1.1] tracking-[-0.035em] ${
          center ? 'lg:mx-auto lg:max-w-3xl' : ''
        }`}
      >
        {title}{highlight && (
          <span className="text-[#1B6FFF]"> {highlight}</span>
        )}
      </h2>
      {subtitle && (
        <p
          className={`mt-4 text-base text-[#8892A4] leading-relaxed ${
            center ? 'lg:mx-auto lg:max-w-2xl' : 'max-w-2xl'
          }`}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}

