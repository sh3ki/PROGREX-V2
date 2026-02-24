'use client'

import { motion } from 'framer-motion'
import { CheckCircle, TrendingUp } from 'lucide-react'
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
      <section className="relative min-h-[55vh] flex items-center overflow-hidden bg-[#0A0A0F] pt-20">
        <div className="absolute inset-0 tech-grid opacity-40 pointer-events-none" />
        <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="flex items-center gap-2 mb-5">
              <span className="px-3 py-1 text-[10px] font-mono tracking-widest border border-[#4C1D95] text-[#C4B5FD]">{project.category.toUpperCase()}</span>
              <span className="px-3 py-1 text-[10px] font-mono tracking-widest border border-[#1E1E2E] text-[#9B98B3]">{project.industry.toUpperCase()}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F0EEF8] mb-4 leading-tight max-w-3xl">
              {project.title}
            </h1>
            <p className="text-[#5A5770] text-base leading-relaxed max-w-2xl font-light">{project.shortDesc}</p>
          </motion.div>
        </div>
      </section>

      {/* Screenshot placeholders */}
      <SectionWrapper className="bg-[#0F0F14]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-[#1A1A24] border border-[#1A1A24]">
          {[1, 2, 3].map((n) => (
            <motion.div
              key={n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: n * 0.08 }}
              className="relative h-48 bg-[#0A0A0F] tech-grid flex items-center justify-center"
            >
              <div className="text-center">
                <div className="sys-label mb-1">SCREENSHOT {n}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* Overview + Problem + Solution */}
      <SectionWrapper className="bg-[#0A0A0F]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[1px] bg-[#1A1A24] border border-[#1A1A24]">
          {[
            { label: 'PROJECT OVERVIEW', content: project.overview, badge: '01' },
            { label: 'THE CHALLENGE', content: project.problem, badge: '02' },
            { label: 'OUR SOLUTION', content: project.solution, badge: '03' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="bg-[#0F0F14] p-6 hover:bg-[#14141B] transition-colors group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="sys-label-accent">{item.label}</div>
                <span className="font-mono text-[10px] text-[#252538]">{item.badge}</span>
              </div>
              <p className="text-[#5A5770] text-xs leading-relaxed font-light">{item.content}</p>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* Features + Technologies */}
      <SectionWrapper className="bg-[#0F0F14]">
        <div className="absolute inset-0 tech-grid opacity-30 pointer-events-none" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <SectionHeader badge="What We Built" title="Key" highlight="Features" center={false} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {project.features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-2.5"
                >
                  <CheckCircle size={12} className="text-[#7C2AE8] shrink-0" />
                  <span className="text-xs text-[#9B98B3] font-light">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>
          <div>
            <SectionHeader badge="Stack" title="Technologies" highlight="Used" center={false} />
            <div className="flex flex-wrap gap-1.5">
              {project.technologies.map((tech, i) => (
                <motion.span
                  key={tech}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="px-3 py-1.5 text-[10px] font-mono text-[#C4B5FD] border border-[#1E1E2E] hover:border-[#4C1D95] transition-colors cursor-default"
                >
                  {tech}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* Results */}
      <SectionWrapper className="bg-[#0A0A0F]">
        <SectionHeader badge="Measurable Impact" title="Results &" highlight="Metrics" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-[#1A1A24] border border-[#1A1A24]">
          {project.results.map((result, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-[#0F0F14] p-6 text-center hover:bg-[#14141B] transition-colors group"
            >
              <TrendingUp size={14} className="text-[#7C2AE8] mx-auto mb-3 opacity-60" />
              <div className="data-value text-[#C4B5FD] text-2xl sm:text-3xl mb-1">{result.value}</div>
              <div className="sys-label">{result.metric}</div>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* Testimonial */}
      <SectionWrapper className="bg-[#0F0F14]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto border border-[#1E1E2E] bg-[#0A0A0F] p-8 sm:p-10 relative"
        >
          <div className="absolute -top-px -left-px w-5 h-5 border-l-2 border-t-2 border-[#7C2AE8]" />
          <div className="absolute -bottom-px -right-px w-5 h-5 border-r-2 border-b-2 border-[#7C2AE8]" />
          <div className="flex items-center gap-2 mb-6">
            <div className="status-dot-pulse" />
            <span className="sys-label-accent">CLIENT TRANSMISSION</span>
          </div>
          <p className="text-[#9B98B3] text-base leading-relaxed mb-6 font-light">
            &ldquo;{project.testimonial.quote}&rdquo;
          </p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 border border-[#4C1D95] flex items-center justify-center text-[#C4B5FD] font-bold text-sm font-mono bg-[#14141B]">
              {project.testimonial.author.charAt(0)}
            </div>
            <div>
              <div className="text-[#F0EEF8] text-sm font-semibold">{project.testimonial.author}</div>
              <div className="sys-label mt-0.5">{project.testimonial.role}</div>
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
