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
    <section className="relative py-20 bg-[#0A0A0F] border-t border-[#1A1A24] overflow-hidden">
      <div className="absolute inset-0 tech-grid pointer-events-none" />
      <div className="absolute top-0 right-0 w-[35%] h-full bg-[#2D1169]/8 blur-[120px] pointer-events-none" />

      <div className="relative max-w-screen-xl mx-auto px-6 lg:px-8">
        <div className="border border-[#1E1E2E] bg-[#0F0F14] relative">
          {/* Corner marks */}
          <div className="absolute -top-px -left-px w-5 h-5 border-l-2 border-t-2 border-[#7C2AE8]" />
          <div className="absolute -bottom-px -right-px w-5 h-5 border-r-2 border-b-2 border-[#7C2AE8]" />

          <div className="p-8 lg:p-14">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="max-w-3xl"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="w-5 h-px bg-[#7C2AE8]" />
                <span className="sys-label-accent">INITIATE</span>
              </div>
              <h2 className="text-[clamp(1.7rem,3vw,2.6rem)] font-bold text-[#F0EEF8] leading-tight tracking-tight mb-4">
                {title}
              </h2>
              <p className="text-[#5A5770] text-sm leading-relaxed mb-8 max-w-xl font-light">
                {subtitle}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href={primaryBtn.href} className="btn-sys-filled">
                  {primaryBtn.label.toUpperCase()}
                  <ArrowRight size={14} />
                </Link>
                <Link href={secondaryBtn.href} className="btn-sys">
                  {secondaryBtn.label.toUpperCase()}
                  <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
