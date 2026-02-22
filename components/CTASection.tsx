'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Zap } from 'lucide-react'

interface CTASectionProps {
  title?: string
  subtitle?: string
  primaryBtn?: { label: string; href: string }
  secondaryBtn?: { label: string; href: string }
}

export default function CTASection({
  title = 'Ready to Build Something Powerful?',
  subtitle = 'Partner with PROGREX and transform your ideas into cutting-edge software solutions. Let\'s build the future together.',
  primaryBtn = { label: 'Start Your Project', href: '/contact' },
  secondaryBtn = { label: 'View Our Work', href: '/projects' },
}: CTASectionProps) {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#3A0CA3]/30 via-[#560BAD]/20 to-[#4361EE]/20" />
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#560BAD]/20 rounded-full blur-[100px]" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#560BAD] to-[#4361EE] mb-6 shadow-[0_0_30px_rgba(86,11,173,0.5)]">
            <Zap size={28} className="text-white" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
            {title.split(' ').map((word, i) => {
              const highlightWords = ['Powerful?', 'Success.', 'Partner.', 'Today.']
              return (
                <span key={i} className={highlightWords.some(h => word.includes(h.replace('?', '').replace('.', ''))) ? 'text-gradient' : ''}>
                  {word}{' '}
                </span>
              )
            })}
          </h2>

          <p className="text-slate-300 text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
            {subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link href={primaryBtn.href} className="btn-primary text-base px-8 py-3.5">
                <span>{primaryBtn.label}</span>
                <ArrowRight size={16} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link href={secondaryBtn.href} className="btn-outline text-base px-8 py-3.5">
                {secondaryBtn.label}
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
