'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
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
      <section className="relative bg-[#0D0F12] border-b border-[#1F2530] pt-32 pb-20">
        <div className="absolute inset-0 bg-grid-fine opacity-[0.04]" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-6">
              <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#1B6FFF] border border-[#1B6FFF]/30 px-2 py-1">
                {project.category}
              </span>
              <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#4E5A6E] border border-[#1F2530] px-2 py-1">
                {project.industry}
              </span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold tracking-[-0.04em] text-[#EEF0F3] mb-6 max-w-3xl leading-tight">
              {project.title}
            </h1>
            <p className="text-[#8892A4] text-lg leading-relaxed max-w-2xl">{project.shortDesc}</p>
          </motion.div>
        </div>
      </section>

      {/* Screenshot placeholders */}
      <section className="bg-[#111417] border-b border-[#1F2530]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
          <div className="grid grid-cols-3 gap-px bg-[#1F2530]">
            {[1, 2, 3].map((n) => (
              <motion.div
                key={n}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: n * 0.08 }}
                className="relative h-52 bg-[#0D0F12]"
              >
                <div className="absolute inset-0 bg-grid-fine opacity-[0.06]" />
                <span className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#1B6FFF]/30" />
                <span className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#1B6FFF]/30" />
                <span className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#1B6FFF]/30" />
                <span className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#1B6FFF]/30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-mono text-[10px] tracking-widest uppercase text-[#4E5A6E]">
                    Screenshot {n}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Overview / Problem / Solution */}
      <section className="bg-[#0D0F12] border-b border-[#1F2530]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
          <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#1B6FFF] mb-8">Project Brief</p>
          <div className="divide-y divide-[#1F2530]">
            {[
              { label: 'Overview', content: project.overview },
              { label: 'The Challenge', content: project.problem },
              { label: 'Our Solution', content: project.solution },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="grid grid-cols-12 gap-0 py-8"
              >
                <div className="col-span-3">
                  <span className="font-mono text-[11px] tracking-widest uppercase text-[#4E5A6E]">{item.label}</span>
                </div>
                <div className="col-span-9">
                  <p className="text-[#8892A4] leading-relaxed">{item.content}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features + Technologies */}
      <section className="bg-[#111417] border-b border-[#1F2530]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
          <div className="grid lg:grid-cols-12 gap-px bg-[#1F2530]">
            {/* Features */}
            <div className="lg:col-span-7 bg-[#111417] pr-0 lg:pr-12 p-8">
              <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#1B6FFF] mb-6">What We Built</p>
              <h2 className="text-2xl font-bold tracking-[-0.02em] text-[#EEF0F3] mb-8">Key Features</h2>
              <div className="divide-y divide-[#1F2530]">
                {project.features.map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 py-3"
                  >
                    <span className="w-4 h-px bg-[#1B6FFF] shrink-0" />
                    <span className="text-[#EEF0F3] text-sm">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            {/* Technologies */}
            <div className="lg:col-span-5 bg-[#111417] p-8">
              <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#1B6FFF] mb-6">Stack</p>
              <h2 className="text-2xl font-bold tracking-[-0.02em] text-[#EEF0F3] mb-8">Technologies Used</h2>
              <div className="grid grid-cols-2 gap-px bg-[#1F2530]">
                {project.technologies.map((tech, i) => (
                  <motion.div
                    key={tech}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-[#0D0F12] px-4 py-3"
                  >
                    <span className="font-mono text-[12px] text-[#EEF0F3] tracking-[0.04em]">{tech}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="bg-[#0D0F12] border-b border-[#1F2530]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
          <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#1B6FFF] mb-2">Measurable Impact</p>
          <h2 className="text-3xl font-bold tracking-[-0.03em] text-[#EEF0F3] mb-10">Results &amp; Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#1F2530]">
            {project.results.map((result, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-[#0D0F12] p-8"
              >
                <p className="font-mono text-3xl font-bold text-[#1B6FFF] mb-2">{result.value}</p>
                <p className="font-mono text-[11px] tracking-[0.08em] uppercase text-[#4E5A6E]">{result.metric}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="bg-[#111417] border-b border-[#1F2530]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl border-l-2 border-[#1B6FFF] pl-10 py-2"
          >
            <div className="flex gap-1 mb-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} className="text-[#1B6FFF] fill-[#1B6FFF]" />
              ))}
            </div>
            <p className="text-[#EEF0F3] text-xl leading-relaxed mb-8 font-light">
              &ldquo;{project.testimonial.quote}&rdquo;
            </p>
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 bg-[#1B6FFF] flex items-center justify-center shrink-0">
                <span className="font-mono text-white text-sm font-bold">
                  {project.testimonial.author.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-[#EEF0F3] text-sm font-semibold">{project.testimonial.author}</p>
                <p className="font-mono text-[11px] tracking-[0.06em] text-[#4E5A6E]">{project.testimonial.role}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <CTASection
        title="Ready to Build Your Success Story?"
        subtitle="Let PROGREX engineer a solution that transforms your business the same way we transformed theirs."
        primaryBtn={{ label: 'Start Your Project', href: '/contact' }}
        secondaryBtn={{ label: 'More Projects', href: '/projects' }}
      />
    </>
  )
}
