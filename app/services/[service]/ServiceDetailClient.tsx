'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ArrowRight } from 'lucide-react'
import SectionWrapper, { SectionHeader } from '@/components/SectionWrapper'
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
      {/* Service Hero */}
      <section className="relative min-h-[55vh] flex items-center overflow-hidden bg-[#0A0A0F] pt-20">
        <div className="absolute inset-0 tech-grid opacity-40 pointer-events-none" />
        <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="w-12 h-12 border border-[#4C1D95] flex items-center justify-center text-2xl mb-6 bg-[#14141B]">
              {service.icon}
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-[2px] bg-[#7C2AE8]" />
              <span className="sys-label-accent">PROGREX SERVICES</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F0EEF8] mb-4 leading-tight max-w-3xl">
              {service.title}
            </h1>
            <p className="text-[#5A5770] text-base leading-relaxed max-w-2xl mb-8 font-light">
              {service.description}
            </p>
            <Link href="/contact" className="btn-sys-filled inline-flex">
              REQUEST PROPOSAL <ArrowRight size={13} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Process */}
      <SectionWrapper className="bg-[#0F0F14]">
        <div className="absolute inset-0 tech-grid opacity-30 pointer-events-none" />
        <SectionHeader
          badge="How We Deliver"
          title="Our"
          highlight="Process"
          subtitle="A structured, transparent process designed to deliver exceptional results with zero surprises."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-[#1A1A24] border border-[#1A1A24]">
          {service.process.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-[#0F0F14] p-6 hover:bg-[#14141B] transition-colors group"
            >
              <div className="w-8 h-8 border border-[#4C1D95] flex items-center justify-center text-[#C4B5FD] font-bold text-xs font-mono mb-4 group-hover:border-[#7C2AE8] transition-colors">
                {String(step.step).padStart(2, '0')}
              </div>
              <h3 className="text-sm font-semibold text-[#D1CEE8] mb-2 group-hover:text-[#C4B5FD] transition-colors">{step.title}</h3>
              <p className="text-[#3A3854] text-xs leading-relaxed font-light">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* Technologies */}
      <SectionWrapper className="bg-[#0A0A0F]">
        <SectionHeader
          badge="Tech Stack"
          title="Technologies"
          highlight="We Use"
          subtitle="We use the best tools for each job â€â€� modern, scalable, and battle-tested."
        />
        <div className="border border-[#1A1A24] bg-[#0F0F14]">
          <div className="flex flex-wrap">
            {service.technologies.map((tech, i) => (
              <motion.div
                key={tech}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="border-r border-b border-[#1A1A24] px-5 py-4 hover:bg-[#14141B] hover:border-[#4C1D95] transition-all duration-150 cursor-default group"
              >
                <span className="text-[10px] font-mono text-[#3A3854] group-hover:text-[#C4B5FD] tracking-widest transition-colors uppercase">
                  {tech}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* FAQs */}
      <SectionWrapper className="bg-[#0F0F14]">
        <SectionHeader
          badge="Common Questions"
          title="Frequently Asked"
          highlight="Questions"
        />
        <div className="max-w-3xl mx-auto space-y-[1px] bg-[#1A1A24] border border-[#1A1A24]">
          {service.faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-[#0F0F14] overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-[#14141B] transition-colors"
              >
                <span className="font-medium text-[#D1CEE8] text-sm">{faq.q}</span>
                <motion.span
                  animate={{ rotate: openFaq === i ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0 ml-4 text-[#4C1D95]"
                >
                  <ChevronDown size={15} />
                </motion.span>
              </button>
              <motion.div
                initial={false}
                animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 text-[#5A5770] text-xs leading-relaxed border-t border-[#1A1A24] pt-3 font-light">
                  {faq.a}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      <CTASection
        title="Ready to Get Started?"
        subtitle={`Let's discuss your ${service.title.toLowerCase()} project and craft a solution that exceeds your expectations.`}
        primaryBtn={{ label: 'Request Proposal', href: '/contact' }}
        secondaryBtn={{ label: 'View Projects', href: '/projects' }}
      />
    </>
  )
}
