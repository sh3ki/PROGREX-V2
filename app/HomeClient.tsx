'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import Hero from '@/components/Hero'
import ServiceCard from '@/components/ServiceCard'
import ProjectCard from '@/components/ProjectCard'
import CTASection from '@/components/CTASection'
import SectionWrapper, { SectionHeader } from '@/components/SectionWrapper'
import { services, projects, systems, testimonials, technologies } from '@/lib/mockData'

export default function HomeClient() {
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  const prevTestimonial = () =>
    setActiveTestimonial((p) => (p - 1 + testimonials.length) % testimonials.length)
  const nextTestimonial = () =>
    setActiveTestimonial((p) => (p + 1) % testimonials.length)

  return (
    <>
      {/* -- HERO -- */}
      <Hero
        badge="?? Next-Gen Technology Solutions"
        title="TECHNOLOGY SOLUTIONS THAT"
        highlight="DRIVES SUCCESS."
        subtitle="BUILD FASTER. SCALE SMARTER. WIN WITH PROGREX. â€â€� We engineer custom software, web apps, mobile platforms, and enterprise systems that transform your business."
        primaryBtn={{ label: 'Get a Quote', href: '/contact' }}
        secondaryBtn={{ label: 'View Projects', href: '/projects' }}
        showStats
      />

      {/* -- SERVICES -- */}
      <SectionWrapper className="bg-[#0A0A0F]">
        <SectionHeader
          badge="What We Build"
          title="Comprehensive Technology"
          highlight="Services"
          subtitle="From custom software to enterprise systems â€â€� we deliver solutions that scale with your ambitions."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-[#1A1A24] border border-[#1A1A24]">
          {services.map((service, i) => (
            <ServiceCard
              key={service.id}
              title={service.title}
              shortDesc={service.shortDesc}
              icon={service.icon}
              slug={service.slug}
              color={service.color}
              index={i}
            />
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Link href="/services" className="btn-sys inline-flex">
            EXPLORE ALL SERVICES <ArrowRight size={14} />
          </Link>
        </motion.div>
      </SectionWrapper>

      {/* -- FEATURED PROJECTS -- */}
      <SectionWrapper className="bg-[#0F0F14]">
        <div className="absolute inset-0 tech-grid opacity-40 pointer-events-none" />
        <SectionHeader
          badge="Our Work"
          title="Featured"
          highlight="Projects"
          subtitle="Real-world solutions with measurable impact. See what we've built for our clients."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-[#1A1A24] border border-[#1A1A24]">
          {projects.slice(0, 3).map((project, i) => (
            <ProjectCard
              key={project.id}
              title={project.title}
              category={project.category}
              industry={project.industry}
              shortDesc={project.shortDesc}
              slug={project.slug}
              tags={project.tags}
              index={i}
            />
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Link href="/projects" className="btn-sys inline-flex">
            VIEW ALL PROJECTS <ArrowRight size={14} />
          </Link>
        </motion.div>
      </SectionWrapper>

      {/* -- READY-MADE SYSTEMS -- */}
      <SectionWrapper className="bg-[#0A0A0F]">
        <SectionHeader
          badge="Ready-Made Systems"
          title="Launch-Ready"
          highlight="Business Systems"
          subtitle="Pre-built, production-ready software systems. Customizable, deployable in days â€â€� not months."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-[#1A1A24] border border-[#1A1A24]">
          {systems.map((sys, i) => (
            <motion.div
              key={sys.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-[#0F0F14] p-6 group hover:bg-[#14141B] hover:border-l-2 hover:border-l-[#7C2AE8] transition-all duration-150 relative"
            >
              <div className="flex items-start justify-between mb-5">
                <span className="font-mono text-[10px] text-[#252538]">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-xl opacity-60">??</span>
              </div>
              <h3 className="text-[15px] font-semibold text-[#D1CEE8] mb-2 group-hover:text-[#C4B5FD] transition-colors">
                {sys.name}
              </h3>
              <p className="text-[#3A3854] text-xs leading-relaxed mb-4 line-clamp-2 font-light">
                {sys.shortDesc}
              </p>
              <ul className="space-y-1.5 mb-5">
                {sys.features.slice(0, 4).map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-[#3A3854]">
                    <div className="w-1 h-1 bg-[#7C2AE8] shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/ready-made-systems" className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-[#4C1D95] group-hover:text-[#7C2AE8] transition-colors">
                LEARN MORE <ArrowRight size={10} />
              </Link>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8"
        >
          <Link href="/ready-made-systems" className="btn-sys-filled inline-flex">
            BROWSE ALL SYSTEMS <ArrowRight size={14} />
          </Link>
        </motion.div>
      </SectionWrapper>

      {/* -- TECHNOLOGIES -- */}
      <SectionWrapper className="bg-[#0F0F14]">
        <div className="absolute inset-0 tech-grid opacity-40 pointer-events-none" />
        <SectionHeader
          badge="Our Stack"
          title="Technologies We"
          highlight="Master"
          subtitle="A world-class technology stack for building scalable, reliable, and high-performance solutions."
        />
        <div className="border border-[#1A1A24] bg-[#0A0A0F]">
          <div className="flex flex-wrap">
            {technologies.map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="border-r border-b border-[#1A1A24] px-5 py-4 group hover:bg-[#14141B] hover:border-[#4C1D95] transition-all duration-150 cursor-default"
              >
                <span className="text-[10px] font-mono text-[#3A3854] group-hover:text-[#C4B5FD] tracking-widest transition-colors uppercase">
                  {tech.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* -- TESTIMONIALS -- */}
      <SectionWrapper className="bg-[#0A0A0F]">
        <SectionHeader
          badge="Client Stories"
          title="What Our Clients"
          highlight="Say"
          subtitle="Don't take our word for it â€â€� hear from the businesses we've transformed."
        />
        <div className="max-w-3xl mx-auto">
          <div className="border border-[#1E1E2E] bg-[#0F0F14] relative">
            {/* Corner marks */}
            <div className="absolute -top-px -left-px w-4 h-4 border-l-2 border-t-2 border-[#7C2AE8]" />
            <div className="absolute -bottom-px -right-px w-4 h-4 border-r-2 border-b-2 border-[#7C2AE8]" />

            <div className="p-8 sm:p-10">
              {/* Status bar */}
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#1A1A24]">
                <div className="flex items-center gap-2">
                  <div className="status-dot-pulse" />
                  <span className="sys-label-accent">CLIENT TRANSMISSION</span>
                </div>
                <span className="sys-label">{activeTestimonial + 1} / {testimonials.length}</span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <p className="text-[#9B98B3] text-base leading-relaxed mb-8 font-light">
                    &ldquo;{testimonials[activeTestimonial].quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 border border-[#4C1D95] flex items-center justify-center text-[#C4B5FD] font-bold text-sm font-mono bg-[#14141B]">
                      {testimonials[activeTestimonial].name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-[#F0EEF8] text-sm font-semibold">{testimonials[activeTestimonial].name}</div>
                      <div className="sys-label mt-0.5">{testimonials[activeTestimonial].role}</div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between border-t border-[#1A1A24] px-8 py-4">
              <div className="flex gap-[3px]">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTestimonial(i)}
                    className={`h-[2px] transition-all duration-200 ${i === activeTestimonial ? 'w-8 bg-[#7C2AE8]' : 'w-3 bg-[#252538] hover:bg-[#4C1D95]'}`}
                  />
                ))}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={prevTestimonial}
                  className="w-8 h-8 border border-[#1E1E2E] flex items-center justify-center text-[#3A3854] hover:text-[#C4B5FD] hover:border-[#4C1D95] transition-all duration-150"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={nextTestimonial}
                  className="w-8 h-8 border border-[#1E1E2E] flex items-center justify-center text-[#3A3854] hover:text-[#C4B5FD] hover:border-[#4C1D95] transition-all duration-150"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* -- CTA -- */}
      <CTASection
        title="Ready to Build Something Powerful?"
        subtitle="Partner with PROGREX and transform your ideas into cutting-edge software solutions that drive real business results."
        primaryBtn={{ label: 'Start Your Project', href: '/contact' }}
        secondaryBtn={{ label: 'View Projects', href: '/projects' }}
      />
    </>
  )
}
