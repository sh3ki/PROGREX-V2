'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Star, CheckCircle, TrendingUp, AlignLeft, AlertTriangle, Lightbulb } from 'lucide-react'
import SectionWrapper, { SectionHeader } from '@/components/SectionWrapper'
import ConstellationDecor from '@/components/ConstellationDecor'
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
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-section-a pt-20">
        <div className="absolute inset-0 bg-dot-grid opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-br from-aurora-700/10 to-nebula-700/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-nebula-700/10 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="font-mono text-xs px-3 py-1 border border-nebula-500/40 text-nebula-300 bg-nebula-400/10">[{project.category}]</span>
              <span className="font-mono text-xs px-3 py-1 border border-white/10 text-white/40">[{project.industry}]</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
              {project.title}
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto">{project.shortDesc}</p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[rgba(5,5,16,0.7)] to-transparent" />
      </section>

      {/* Image placeholder carousel */}
      <SectionWrapper className="bg-section-a" decoration={<ConstellationDecor name="orion" side="left" offsetY="15%" />}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <motion.div
              key={n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: n * 0.1 }}
              className="relative h-48 bg-space-800 rounded-xl overflow-hidden border border-nebula-700/20"
            >
              <div className="absolute inset-0 bg-dot-grid opacity-20" />
              <div className="absolute inset-0 flex items-center justify-center text-white/20 text-sm font-mono">
                // screenshot_{n}
              </div>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* Overview + Problem + Solution */}
      <SectionWrapper className="bg-section-b" decoration={<ConstellationDecor name="scorpius" side="right" offsetY="10%" />}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[
            { label: 'Project Overview', content: project.overview, icon: <AlignLeft size={22} className="text-nebula-400" /> },
            { label: 'The Challenge', content: project.problem, icon: <AlertTriangle size={22} className="text-pulsar-400" /> },
            { label: 'Our Solution', content: project.solution, icon: <Lightbulb size={22} className="text-aurora-400" /> },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="glass-card rounded-2xl p-6 border border-nebula-700/20"
            >
              <div className="mb-3">{item.icon}</div>
              <h3 className="text-base font-bold text-white mb-3">{item.label}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.content}</p>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* Features */}
      <SectionWrapper className="bg-section-a" decoration={<ConstellationDecor name="bigdipper" side="left" offsetY="20%" />}>
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
                  className="flex items-center gap-3 text-sm text-white/60"
                >
                  <CheckCircle size={15} className="text-nebula-500 shrink-0" />
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
                  className="font-mono text-xs px-3 py-1.5 border border-nebula-700/20 text-nebula-300/70 bg-nebula-400/5"
                >
                  {tech}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* Results */}
      <SectionWrapper className="bg-section-b" decoration={<ConstellationDecor name="crux" side="right" offsetY="25%" />}>
        <SectionHeader badge="Measurable Impact" title="Results &" highlight="Metrics" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {project.results.map((result, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6 text-center border border-nebula-700/20 hover:border-nebula-500/50 hover:shadow-nebula-sm transition-all"
            >
              <TrendingUp size={20} className="text-nebula-500 mx-auto mb-3" />
              <div className="text-2xl sm:text-3xl font-extrabold text-gradient-nebula mb-2">{result.value}</div>
              <div className="text-white/45 text-xs sm:text-sm">{result.metric}</div>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* Testimonial */}
      <SectionWrapper className="bg-section-a" decoration={<ConstellationDecor name="gemini" side="left" offsetY="30%" />}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto glass-card rounded-2xl p-8 sm:p-10 text-center border border-nebula-700/20"
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-nebula-700 to-aurora-600 flex items-center justify-center text-white font-bold text-sm">
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
