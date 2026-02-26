'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Star, Quote, ChevronLeft, ChevronRight, Monitor } from 'lucide-react'
import TechConstellation from '@/components/TechConstellation'
import Hero from '@/components/Hero'
import ConstellationDecor from '@/components/ConstellationDecor'
import ServiceCard from '@/components/ServiceCard'
import ProjectCard from '@/components/ProjectCard'
import CTASection from '@/components/CTASection'
import SectionWrapper, { SectionHeader } from '@/components/SectionWrapper'
import { StaggerContainer, StaggerItem } from '@/components/AnimatedContainer'
import { services, projects, systems, testimonials, technologies } from '@/lib/mockData'

export default function HomeClient() {
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  const prevTestimonial = () => setActiveTestimonial((p) => (p - 1 + testimonials.length) % testimonials.length)
  const nextTestimonial = () => setActiveTestimonial((p) => (p + 1) % testimonials.length)

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <Hero
        badge="Next-Gen Technology Solutions"
        title="TECHNOLOGY SOLUTIONS THAT"
        highlight="DRIVES SUCCESS."
        subtitle="BUILD FASTER. SCALE SMARTER. WIN WITH PROGREX. — We engineer custom software, web apps, mobile platforms, and enterprise systems that transform your business."
        primaryBtn={{ label: 'Get a Quote', href: '/contact' }}
        secondaryBtn={{ label: 'View Projects', href: '/projects' }}
        showStats
      />

      {/* ── SERVICES PREVIEW ─────────────────────────────────────────────── */}
      <SectionWrapper className="bg-section-a" decoration={<ConstellationDecor name="orion" side="right" offsetY="10%" />}>
        <SectionHeader
          badge="What We Build"
          title="Comprehensive Technology"
          highlight="Services"
          subtitle="From custom software to enterprise systems — we deliver solutions that scale with your ambitions."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-10"
        >
          <Link href="/services" className="btn-outline inline-flex">
            Explore All Services <ArrowRight size={16} />
          </Link>
        </motion.div>
      </SectionWrapper>

      {/* ── FEATURED PROJECTS ────────────────────────────────────────────── */}
      <SectionWrapper className="bg-section-b" decoration={<ConstellationDecor name="bigdipper" side="left" offsetY="15%" />}>
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
        <SectionHeader
          badge="Our Work"
          title="Featured"
          highlight="Projects"
          subtitle="Real-world solutions with measurable impact. See what we've built for our clients."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-10"
        >
          <Link href="/projects" className="btn-outline inline-flex">
            View All Projects <ArrowRight size={16} />
          </Link>
        </motion.div>
      </SectionWrapper>

      {/* ── READY-MADE SYSTEMS ───────────────────────────────────────────── */}
      <SectionWrapper className="bg-section-a" decoration={<ConstellationDecor name="cassiopeia" side="right" offsetY="20%" />}>
        <SectionHeader
          badge="Ready-Made Systems"
          title="Launch-Ready"
          highlight="Business Systems"
          subtitle="Pre-built, production-ready software systems. Customizable, deployable in days — not months."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {systems.map((sys, i) => (
            <motion.div
              key={sys.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6 hover-glow-card group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nebula-700 to-aurora-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Monitor size={18} className="text-nebula-300" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-nebula-300 transition-colors">{sys.name}</h3>
              <p className="text-slate-400 text-sm mb-4 line-clamp-2">{sys.shortDesc}</p>
              <ul className="space-y-1.5 mb-5">
                {sys.features.slice(0, 4).map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-nebula-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/ready-made-systems" className="btn-outline text-xs px-4 py-2 inline-flex">
                Learn More <ArrowRight size={12} />
              </Link>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link href="/ready-made-systems" className="btn-primary inline-flex text-sm px-6 py-3">
            <span>Browse All Systems</span> <ArrowRight size={16} />
          </Link>
        </motion.div>
      </SectionWrapper>

      {/* ── TECHNOLOGIES ─────────────────────────────────────────────────── */}
      <SectionWrapper className="bg-section-b" decoration={<ConstellationDecor name="leo" side="left" offsetY="25%" />}>
        <SectionHeader
          badge="Our Stack"
          title="Technologies We"
          highlight="Master"
          subtitle="A world-class technology stack for building scalable, reliable, and high-performance solutions."
        />
        <StaggerContainer className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {technologies.map((tech) => (
            <StaggerItem key={tech.name}>
              <motion.div
                whileHover={{ scale: 1.1, y: -4 }}
                className="glass-card rounded-xl p-3 text-center hover:border-nebula-600/50 hover:shadow-nebula-sm transition-all duration-300 cursor-default"
              >
                <div className="w-7 h-7 rounded-md bg-nebula-400/10 border border-nebula-400/30 flex items-center justify-center mx-auto mb-1.5">
                  <span className="font-mono text-[9px] font-bold text-nebula-400">{tech.name.substring(0, 2).toUpperCase()}</span>
                </div>
                <div className="text-[10px] text-white/50 font-mono">{tech.name}</div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </SectionWrapper>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <SectionWrapper className="bg-section-a" decoration={<ConstellationDecor name="crux" side="right" offsetY="30%" />}>
        <SectionHeader
          badge="Client Stories"
          title="What Our Clients"
          highlight="Say"
          subtitle="Don't take our word for it — hear from the businesses we've transformed."
        />
        <div className="max-w-3xl mx-auto">
          <motion.div
            key={activeTestimonial}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
            className="glass-card rounded-2xl p-8 sm:p-10 relative"
          >
            <Quote className="text-nebula-600/40 absolute top-6 right-8" size={40} />
            {/* Stars */}
            <div className="flex gap-1 mb-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <p className="text-slate-200 text-lg leading-relaxed mb-6 italic">
              &ldquo;{testimonials[activeTestimonial].quote}&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-nebula-700 to-aurora-600 flex items-center justify-center text-white font-bold text-sm">
                {testimonials[activeTestimonial].name.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-white text-sm">{testimonials[activeTestimonial].name}</div>
                <div className="text-nebula-300/70 text-xs font-mono">{testimonials[activeTestimonial].role}</div>
              </div>
            </div>
          </motion.div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={prevTestimonial}
              className="w-10 h-10 rounded-full glass border border-nebula-600/30 flex items-center justify-center text-white/50 hover:text-nebula-300 hover:border-nebula-500/60 transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === activeTestimonial ? 'w-8 bg-nebula-500' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                />
              ))}
            </div>
            <button
              onClick={nextTestimonial}
              className="w-10 h-10 rounded-full glass border border-nebula-600/30 flex items-center justify-center text-white/50 hover:text-nebula-300 hover:border-nebula-500/60 transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </SectionWrapper>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <CTASection
        title="Ready to Build Something Powerful?"
        subtitle="Partner with PROGREX and transform your ideas into cutting-edge software solutions that drive real business results."
        primaryBtn={{ label: 'Start Your Project', href: '/contact' }}
        secondaryBtn={{ label: 'View Projects', href: '/projects' }}
      />
    </>
  )
}
