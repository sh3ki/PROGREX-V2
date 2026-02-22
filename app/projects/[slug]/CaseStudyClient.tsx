'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Star, CheckCircle, TrendingUp } from 'lucide-react'
import SectionWrapper, { SectionHeader } from '@/components/SectionWrapper'
import CTASection from '@/components/CTASection'

interface Project {
  title: string
  category: string
  industry: string
  shortDesc: string
  overview: string
  problem: string
  solution: string
  features: string[]
  technologies: string[]
  results: { metric: string; value: string }[]
  testimonial: { quote: string; author: string; role: string }
}

export default function CaseStudyClient({ project }: { project: Project }) {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-[#050510] pt-20">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#3A0CA3]/20 to-[#4361EE]/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#560BAD]/15 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-[#560BAD]/80 text-[#CFA3EA] text-xs font-semibold">{project.category}</span>
              <span className="px-3 py-1 rounded-full bg-black/60 text-slate-300 text-xs">{project.industry}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
              {project.title}
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto">{project.shortDesc}</p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#050510] to-transparent" />
      </section>

      {/* Image placeholder carousel */}
      <SectionWrapper className="bg-[#050510]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <motion.div
              key={n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: n * 0.1 }}
              className="relative h-48 bg-gradient-to-br from-[#3A0CA3]/30 to-[#4361EE]/20 rounded-xl overflow-hidden border border-[#560BAD]/20"
            >
              <div className="absolute inset-0 bg-dots opacity-20" />
              <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-sm">
                Screenshot {n}
              </div>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* Overview + Problem + Solution */}
      <SectionWrapper className="bg-[#030308]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[
            { label: 'Project Overview', content: project.overview, icon: '📋' },
            { label: 'The Challenge', content: project.problem, icon: '⚠️' },
            { label: 'Our Solution', content: project.solution, icon: '💡' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="glass-card rounded-2xl p-6 border border-[#560BAD]/20"
            >
              <div className="text-2xl mb-3">{item.icon}</div>
              <h3 className="text-base font-bold text-white mb-3">{item.label}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.content}</p>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* Features */}
      <SectionWrapper className="bg-[#050510]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <SectionHeader badge="What We Built" title="Key" highlight="Features" center={false} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {project.features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3 text-sm text-slate-300"
                >
                  <CheckCircle size={15} className="text-[#831DC6] shrink-0" />
                  {feature}
                </motion.div>
              ))}
            </div>
          </div>
          <div>
            <SectionHeader badge="Stack" title="Technologies" highlight="Used" center={false} />
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech, i) => (
                <motion.span
                  key={tech}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="px-3 py-1.5 rounded-lg glass-card text-xs font-semibold text-[#CFA3EA] border border-[#560BAD]/20"
                >
                  {tech}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* Results */}
      <SectionWrapper className="bg-[#030308]">
        <SectionHeader badge="Measurable Impact" title="Results &" highlight="Metrics" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {project.results.map((result, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6 text-center border border-[#560BAD]/20 hover:border-[#560BAD]/50 hover:shadow-[0_0_20px_rgba(86,11,173,0.2)] transition-all"
            >
              <TrendingUp size={20} className="text-[#831DC6] mx-auto mb-3" />
              <div className="text-2xl sm:text-3xl font-extrabold text-gradient mb-2">{result.value}</div>
              <div className="text-slate-400 text-xs sm:text-sm">{result.metric}</div>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* Testimonial */}
      <SectionWrapper className="bg-[#050510]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto glass-card rounded-2xl p-8 sm:p-10 text-center border border-[#560BAD]/20"
        >
          <div className="flex justify-center gap-1 mb-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          <p className="text-slate-200 text-lg leading-relaxed italic mb-6">
            &ldquo;{project.testimonial.quote}&rdquo;
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#560BAD] to-[#4361EE] flex items-center justify-center text-white font-bold text-sm">
              {project.testimonial.author.charAt(0)}
            </div>
            <div className="text-left">
              <div className="font-semibold text-white text-sm">{project.testimonial.author}</div>
              <div className="text-slate-400 text-xs">{project.testimonial.role}</div>
            </div>
          </div>
        </motion.div>
      </SectionWrapper>

      <CTASection
        title="Ready to Build Your Success Story?"
        subtitle="Let PROGREX engineer a solution that transforms your business the same way we transformed theirs."
        primaryBtn={{ label: 'Start Your Project', href: '/contact' }}
        secondaryBtn={{ label: 'More Projects', href: '/projects' }}
      />
    </>
  )
}
