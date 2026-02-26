'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface CTASectionProps {
  title?: string
  subtitle?: string
  primaryBtn?: { label: string; href: string }
  secondaryBtn?: { label: string; href: string }
}

export default function CTASection({
  title = 'Ready to Build Something Powerful?',
  subtitle = "Partner with PROGREX and transform your ideas into cutting-edge software solutions. Let's build the future together.",
  primaryBtn = { label: 'Start Your Project', href: '/contact' },
  secondaryBtn = { label: 'View Our Work', href: '/projects' },
}: CTASectionProps) {
  const rings = [80, 160, 240, 320]

  return (
    <section className="relative py-28 overflow-hidden">
      {/* Deep space background — semi-transparent so starfield shows through */}
      <div className="absolute inset-0" style={{ background: 'rgba(3,3,15,0.82)' }} />
      <div className="absolute inset-0 bg-dot-grid opacity-25 pointer-events-none" />

      {/* Concentric circles decoration */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {rings.map((r, i) => (
          <motion.div
            key={r}
            className="absolute rounded-full border"
            style={{
              width: r * 2,
              height: r * 2,
              borderColor: `rgba(103,232,249,${0.06 - i * 0.012})`,
            }}
            animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
            transition={{
              duration: 30 + i * 10,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
        {/* Center dot */}
        <motion.div
          className="absolute w-3 h-3 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(103,232,249,0.6), rgba(103,232,249,0.1))' }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </div>

      {/* Nebula blobs */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(103,232,249,0.06), transparent)' }}
      />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {/* Eyebrow */}
          <div className="eyebrow-badge mx-auto mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-nebula-400 animate-pulse inline-block mr-2" />
            INITIATE MISSION
          </div>

          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white mb-5 leading-tight">
            {title.split(' ').map((word, i) => {
              const isHighlight = ['Powerful?', 'Future', 'Success', 'Today', 'Partner'].some(
                (h) => word.includes(h)
              )
              return (
                <span key={i} className={isHighlight ? 'text-gradient-nebula' : ''}>
                  {word}{' '}
                </span>
              )
            })}
          </h2>

          <p className="text-white/50 text-base sm:text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            {subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link href={primaryBtn.href} className="btn-primary text-base px-8 py-4">
                <span>{primaryBtn.label}</span>
                <ArrowRight size={16} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link href={secondaryBtn.href} className="btn-outline text-base px-8 py-4">
                {secondaryBtn.label}
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
