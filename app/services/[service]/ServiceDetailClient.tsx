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
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-[#050510] pt-20">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#3A0CA3]/20 to-[#4361EE]/10" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#560BAD]/15 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="absolute inset-0 pointer-events-none" />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} text-3xl mb-6 shadow-[0_0_30px_rgba(86,11,173,0.5)]`}>
              {service.icon}
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-[#560BAD]/30 text-[#CFA3EA] text-xs font-semibold uppercase tracking-widest mb-4 block">
              PROGREX Services
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
              {service.title}
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
              {service.description}
            </p>
            <Link href="/contact" className="btn-primary inline-flex text-base">
              <span>Request Proposal</span>
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#050510] to-transparent" />
      </section>

      {/* Process */}
      <SectionWrapper className="bg-[#050510]">
        <SectionHeader
          badge="How We Deliver"
          title="Our"
          highlight="Process"
          subtitle="A structured, transparent process designed to deliver exceptional results with zero surprises."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {service.process.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6 border border-[#560BAD]/15 hover:border-[#560BAD]/40 hover:shadow-[0_0_20px_rgba(86,11,173,0.15)] transition-all duration-300"
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${service.color} text-white font-black text-sm mb-4`}>
                {step.step}
              </div>
              <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* Technologies */}
      <SectionWrapper className="bg-[#030308]">
        <SectionHeader
          badge="Tech Stack"
          title="Technologies"
          highlight="We Use"
          subtitle="We use the best tools for each job — modern, scalable, and battle-tested."
        />
        <div className="flex flex-wrap gap-3 justify-center">
          {service.technologies.map((tech, i) => (
            <motion.div
              key={tech}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              whileHover={{ scale: 1.08, y: -3 }}
              className="px-4 py-2.5 rounded-xl glass-card text-sm font-semibold text-[#CFA3EA] border border-[#560BAD]/20 hover:border-[#560BAD]/60 hover:shadow-[0_0_15px_rgba(86,11,173,0.3)] transition-all cursor-default"
            >
              {tech}
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* FAQs */}
      <SectionWrapper className="bg-[#050510]">
        <SectionHeader
          badge="Common Questions"
          title="Frequently Asked"
          highlight="Questions"
        />
        <div className="max-w-3xl mx-auto space-y-3">
          {service.faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="glass-card rounded-xl border border-[#560BAD]/20 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-semibold text-white text-sm sm:text-base">{faq.q}</span>
                <motion.span
                  animate={{ rotate: openFaq === i ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0 ml-4 text-[#831DC6]"
                >
                  <ChevronDown size={18} />
                </motion.span>
              </button>
              <motion.div
                initial={false}
                animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-3">
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
