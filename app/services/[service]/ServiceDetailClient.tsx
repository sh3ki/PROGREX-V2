'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ArrowRight } from 'lucide-react'
import CTASection from '@/components/CTASection'

interface Service {
  title: string
  shortDesc: string
  description: string
  icon: string
  color: string
  process: { step: number; title: string; desc: string }[]
  technologies: string[]
  faqs: { q: string; a: string }[]
}

export default function ServiceDetailClient({ service }: { service: Service }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <>
      {/* â”€â”€ HERO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="bg-[#0D0F12] pt-32 pb-20 border-b border-[#1F2530] relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-fine opacity-40 pointer-events-none" />

        <div className="max-w-350 mx-auto px-6 lg:px-10 relative">
          <div className="grid lg:grid-cols-12 gap-12 items-end">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-8"
            >
              <span className="label text-[#1B6FFF] mb-4 block">PROGREX SERVICES</span>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#EEF0F3] tracking-[-0.04em] leading-[1.05] mb-6">
                {service.title}
              </h1>
              <p className="text-[#8892A4] text-lg leading-relaxed max-w-2xl mb-8">
                {service.description}
              </p>
              <Link href="/contact" className="btn-primary inline-flex text-sm px-8 py-4">
                <span>Request Proposal</span>
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* â”€â”€ PROCESS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="bg-[#0D0F12] border-b border-[#1F2530]">
        <div className="max-w-350 mx-auto px-6 lg:px-10 py-24">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
            <div>
              <span className="label text-[#1B6FFF] mb-3 block">HOW WE DELIVER</span>
              <h2 className="text-4xl lg:text-5xl font-bold text-[#EEF0F3] tracking-[-0.035em] leading-[1.1]">
                Our Process
              </h2>
            </div>
            <p className="text-[#8892A4] text-base max-w-sm lg:text-right leading-relaxed">
              A structured, transparent process designed to deliver exceptional results with zero surprises.
            </p>
          </div>

          {/* Process list rows */}
          <div className="border-t border-[#1F2530]">
            {service.process.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="grid grid-cols-12 gap-8 py-8 border-b border-[#1F2530] group hover:bg-[#111417] transition-colors px-4 -mx-4"
              >
                <div className="col-span-2 sm:col-span-1">
                  <span className="font-mono text-[11px] text-[#1B6FFF] tracking-[0.12em]">
                    {String(step.step).padStart(2, '0')}
                  </span>
                </div>
                <div className="col-span-10 sm:col-span-3">
                  <h3 className="text-base font-semibold text-[#EEF0F3] group-hover:text-white transition-colors">
                    {step.title}
                  </h3>
                </div>
                <div className="col-span-12 sm:col-span-8 sm:col-start-5">
                  <p className="text-[#8892A4] text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€ TECHNOLOGIES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="bg-[#111417] border-b border-[#1F2530]">
        <div className="max-w-350 mx-auto px-6 lg:px-10 py-24">
          <div className="mb-16">
            <span className="label text-[#1B6FFF] mb-3 block">TECH STACK</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-[#EEF0F3] tracking-[-0.035em] leading-[1.1]">
              Technologies We Use
            </h2>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-px bg-[#1F2530]">
            {service.technologies.map((tech, i) => (
              <motion.div
                key={tech}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                whileHover={{ backgroundColor: 'rgba(27,111,255,0.06)' }}
                className="bg-[#111417] p-5 flex items-center justify-center transition-colors cursor-default"
              >
                <span className="font-mono text-[11px] text-[#8892A4] tracking-[0.06em] text-center hover:text-[#EEF0F3] transition-colors">
                  {tech}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€ FAQ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="bg-[#0D0F12] border-b border-[#1F2530]">
        <div className="max-w-350 mx-auto px-6 lg:px-10 py-24">
          <div className="grid lg:grid-cols-12 gap-16">
            {/* Left header */}
            <div className="lg:col-span-4">
              <span className="label text-[#1B6FFF] mb-3 block">COMMON QUESTIONS</span>
              <h2 className="text-4xl font-bold text-[#EEF0F3] tracking-[-0.035em] leading-[1.1]">
                Frequently Asked Questions
              </h2>
            </div>

            {/* Right FAQs */}
            <div className="lg:col-span-8 border-t border-[#1F2530]">
              {service.faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="border-b border-[#1F2530]"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between py-6 text-left group"
                  >
                    <span className="font-medium text-[#EEF0F3] text-sm sm:text-base pr-6 group-hover:text-white transition-colors">
                      {faq.q}
                    </span>
                    <motion.span
                      animate={{ rotate: openFaq === i ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className={`shrink-0 transition-colors ${openFaq === i ? 'text-[#1B6FFF]' : 'text-[#4E5A6E]'}`}
                    >
                      <ChevronDown size={16} />
                    </motion.span>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="pb-6 text-[#8892A4] text-sm leading-relaxed">
                      {faq.a}
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* â”€â”€ CTA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <CTASection
        title="Ready to Get Started?"
        subtitle={`Let's discuss your ${service.title.toLowerCase()} project and craft a solution that exceeds your expectations.`}
        primaryBtn={{ label: 'Request Proposal', href: '/contact' }}
        secondaryBtn={{ label: 'View Projects', href: '/projects' }}
      />
    </>
  )
}
