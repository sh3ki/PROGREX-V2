'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from '@/components/TranslationProvider'

interface CTASectionProps {
  title?: string
  subtitle?: string
  primaryBtn?: { label: string; href: string }
  secondaryBtn?: { label: string; href: string }
}

export default function CTASection({
  title,
  subtitle,
  primaryBtn,
  secondaryBtn,
}: CTASectionProps) {
  const { t } = useTranslation()

  const resolvedTitle = title ?? t('cta.defaultTitle')
  const resolvedSubtitle = subtitle ?? t('cta.defaultSubtitle')
  const resolvedPrimary = primaryBtn ?? { label: t('cta.defaultPrimaryBtn'), href: '/contact' }
  const resolvedSecondary = secondaryBtn ?? { label: t('cta.defaultSecondaryBtn'), href: '/projects' }
  return (
    <section className="relative py-28 overflow-hidden">
      {/* Deep space background — semi-transparent so starfield shows through */}
      <div className="absolute inset-0" style={{ background: 'rgba(3,3,15,0.82)' }} />
      <div className="absolute inset-0 bg-dot-grid opacity-25 pointer-events-none" />

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
            {t('common.initiateMission')}
          </div>

          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white mb-5 leading-tight">
            {resolvedTitle.split(' ').map((word, i) => {
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
            {resolvedSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link href={resolvedPrimary.href} className="btn-primary text-base px-8 py-4">
                <span>{resolvedPrimary.label}</span>
                <ArrowRight size={16} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link href={resolvedSecondary.href} className="btn-outline text-base px-8 py-4">
                {resolvedSecondary.label}
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
