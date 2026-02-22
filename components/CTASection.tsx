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
  return (
    <section className="relative bg-[#111417] border-y border-[#1F2530] overflow-hidden">
      {/* Architectural grid overlay */}
      <div className="absolute inset-0 bg-grid opacity-100 pointer-events-none" />
      {/* Blue accent column */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#1B6FFF]" />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7"
          >
            <p className="label mb-5">
              <span className="inline-flex items-center gap-2">
                <span className="w-3 h-px bg-[#1B6FFF]" />
                Next Step
              </span>
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#EEF0F3] leading-[1.07] tracking-[-0.04em] mb-5">
              {title}
            </h2>
            <p className="text-[#8892A4] text-lg leading-relaxed max-w-xl">
              {subtitle}
            </p>
          </motion.div>

          {/* Right: CTAs */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-start"
          >
            <Link href={primaryBtn.href} className="btn-primary inline-flex text-sm px-7 py-3.5">
              <span>{primaryBtn.label}</span>
              <ArrowRight size={16} />
            </Link>
            <Link href={secondaryBtn.href} className="btn-outline inline-flex text-sm px-7 py-3.5">
              {secondaryBtn.label}
            </Link>

            {/* Status line */}
            <div className="flex items-center gap-2.5 mt-4">
              <span className="w-2 h-2 bg-emerald-500 animate-pulse" />
              <span className="text-[#8892A4] text-xs font-mono tracking-wider">AVAILABLE FOR NEW PROJECTS</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}


