'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Star } from 'lucide-react'
import Hero from '@/components/Hero'
import ServiceCard from '@/components/ServiceCard'
import ProjectCard from '@/components/ProjectCard'
import CTASection from '@/components/CTASection'
import { services, projects, systems, testimonials, technologies } from '@/lib/mockData'

export default function HomeClient() {
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  const prevTestimonial = () => setActiveTestimonial((p) => (p - 1 + testimonials.length) % testimonials.length)
  const nextTestimonial = () => setActiveTestimonial((p) => (p + 1) % testimonials.length)

  return (
    <>
      {/* -- HERO ----------------------------------------------------------- */}
      <Hero
        badge="Next-Gen Technology Solutions"
        title="TECHNOLOGY SOLUTIONS THAT"
        highlight="DRIVES SUCCESS."
        subtitle="BUILD FASTER. SCALE SMARTER. WIN WITH PROGREX. — We engineer custom software, web apps, mobile platforms, and enterprise systems that transform your business."
        primaryBtn={{ label: 'Get a Quote', href: '/contact' }}
        secondaryBtn={{ label: 'View Projects', href: '/projects' }}
        showStats
      />

      {/* -- SERVICES ------------------------------------------------------- */}
      <section className="bg-[#0D0F12] border-t border-[#1F2530]">
        <div className="max-w-350 mx-auto px-6 lg:px-10 py-24">
          {/* Header row */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
            <div>
              <span className="label text-[#1B6FFF] mb-3 block">WHAT WE BUILD</span>
              <h2 className="text-4xl lg:text-5xl font-bold text-[#EEF0F3] tracking-[-0.035em] leading-[1.1]">
                Comprehensive Technology<br />Services
              </h2>
            </div>
            <p className="text-[#8892A4] text-base max-w-sm lg:text-right leading-relaxed">
              From custom software to enterprise systems — we deliver solutions that scale with your ambitions.
            </p>
          </div>

          {/* Services grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#1F2530]">
            {services.map((service, i) => (
              <div key={service.id} className="bg-[#0D0F12]">
                <ServiceCard
                  title={service.title}
                  shortDesc={service.shortDesc}
                  icon={service.icon}
                  slug={service.slug}
                  color={service.color}
                  index={i}
                />
              </div>
            ))}
          </div>

          <div className="mt-10 pt-10 border-t border-[#1F2530]">
            <Link href="/services" className="btn-outline inline-flex text-sm px-6 py-3">
              Explore All Services <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* -- FEATURED PROJECTS ---------------------------------------------- */}
      <section className="bg-[#111417] border-t border-[#1F2530]">
        <div className="max-w-350 mx-auto px-6 lg:px-10 py-24">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
            <div>
              <span className="label text-[#1B6FFF] mb-3 block">OUR WORK</span>
              <h2 className="text-4xl lg:text-5xl font-bold text-[#EEF0F3] tracking-[-0.035em] leading-[1.1]">
                Featured Projects
              </h2>
            </div>
            <p className="text-[#8892A4] text-base max-w-sm lg:text-right leading-relaxed">
              Real-world solutions with measurable impact. See what we&apos;ve built for our clients.
            </p>
          </div>

          {/* Projects */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.slice(0, 3).map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <ProjectCard
                  title={project.title}
                  category={project.category}
                  industry={project.industry}
                  shortDesc={project.shortDesc}
                  slug={project.slug}
                  tags={project.tags}
                  index={i}
                />
              </motion.div>
            ))}
          </div>

          <div className="mt-10 pt-10 border-t border-[#1F2530]">
            <Link href="/projects" className="btn-outline inline-flex text-sm px-6 py-3">
              View All Projects <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* -- READY-MADE SYSTEMS --------------------------------------------- */}
      <section className="bg-[#0D0F12] border-t border-[#1F2530]">
        <div className="max-w-350 mx-auto px-6 lg:px-10 py-24">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
            <div>
              <span className="label text-[#1B6FFF] mb-3 block">READY-MADE SYSTEMS</span>
              <h2 className="text-4xl lg:text-5xl font-bold text-[#EEF0F3] tracking-[-0.035em] leading-[1.1]">
                Launch-Ready<br />Business Systems
              </h2>
            </div>
            <p className="text-[#8892A4] text-base max-w-sm lg:text-right leading-relaxed">
              Pre-built, production-ready software systems. Customizable, deployable in days — not months.
            </p>
          </div>

          {/* Systems grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {systems.map((sys, i) => (
              <motion.div
                key={sys.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group bg-[#111417] border border-[#1F2530] hover:border-[#1B6FFF]/40 transition-colors duration-300 relative"
              >
                {/* Top accent bar */}
                <div className="h-0.5 w-0 group-hover:w-full bg-[#1B6FFF] transition-all duration-500" />

                <div className="p-6">
                  {/* Index */}
                  <span className="font-mono text-[11px] text-[#4E5A6E] tracking-[0.12em] mb-4 block">
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <h3 className="text-lg font-semibold text-[#EEF0F3] mb-2 group-hover:text-white transition-colors">
                    {sys.name}
                  </h3>
                  <p className="text-[#8892A4] text-sm mb-5 line-clamp-2 leading-relaxed">{sys.shortDesc}</p>

                  {/* Features */}
                  <ul className="space-y-2 mb-6">
                    {sys.features.slice(0, 4).map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-xs text-[#8892A4]">
                        <span className="w-3 h-px bg-[#1B6FFF]" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/ready-made-systems"
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-[#1B6FFF] tracking-[0.08em] uppercase hover:gap-2.5 transition-all"
                  >
                    Learn More <ArrowUpRight size={12} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 pt-10 border-t border-[#1F2530]">
            <Link href="/ready-made-systems" className="btn-primary inline-flex text-sm px-6 py-3">
              <span>Browse All Systems</span> <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* -- TECHNOLOGIES --------------------------------------------------- */}
      <section className="bg-[#111417] border-t border-[#1F2530]">
        <div className="max-w-350 mx-auto px-6 lg:px-10 py-24">
          {/* Header */}
          <div className="mb-16">
            <span className="label text-[#1B6FFF] mb-3 block">OUR STACK</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-[#EEF0F3] tracking-[-0.035em] leading-[1.1]">
              Technologies We Master
            </h2>
          </div>

          {/* Tech grid — monospace compact */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-px bg-[#1F2530]">
            {technologies.map((tech) => (
              <motion.div
                key={tech.name}
                whileHover={{ backgroundColor: 'rgba(27,111,255,0.06)' }}
                className="bg-[#111417] p-4 flex items-center justify-center cursor-default transition-colors"
              >
                <span className="font-mono text-[10px] text-[#8892A4] tracking-[0.06em] text-center leading-tight hover:text-[#EEF0F3] transition-colors">
                  {tech.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* -- TESTIMONIALS --------------------------------------------------- */}
      <section className="bg-[#0D0F12] border-t border-[#1F2530]">
        <div className="max-w-350 mx-auto px-6 lg:px-10 py-24">
          <div className="grid lg:grid-cols-12 gap-16 items-start">
            {/* Left col — header + controls */}
            <div className="lg:col-span-4">
              <span className="label text-[#1B6FFF] mb-3 block">CLIENT STORIES</span>
              <h2 className="text-4xl lg:text-5xl font-bold text-[#EEF0F3] tracking-[-0.035em] leading-[1.1] mb-10">
                What Our Clients Say
              </h2>

              {/* Navigation */}
              <div className="flex items-center gap-3 mb-8">
                <button
                  onClick={prevTestimonial}
                  className="w-10 h-10 border border-[#1F2530] flex items-center justify-center text-[#8892A4] hover:border-[#1B6FFF] hover:text-[#1B6FFF] transition-colors"
                  aria-label="Previous"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="font-mono text-[11px] text-[#4E5A6E] tracking-widest">
                  {String(activeTestimonial + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
                </span>
                <button
                  onClick={nextTestimonial}
                  className="w-10 h-10 border border-[#1F2530] flex items-center justify-center text-[#8892A4] hover:border-[#1B6FFF] hover:text-[#1B6FFF] transition-colors"
                  aria-label="Next"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Indicators */}
              <div className="flex flex-col gap-1.5">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTestimonial(i)}
                    className={`h-px transition-all duration-300 ${
                      i === activeTestimonial ? 'bg-[#1B6FFF] w-12' : 'bg-[#1F2530] w-5 hover:bg-[#293040]'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Right col — testimonial content */}
            <div className="lg:col-span-8">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-[#111417] border border-[#1F2530] p-8 sm:p-10 relative"
              >
                {/* Blue left border accent */}
                <div className="absolute left-0 top-8 bottom-8 w-0.75 bg-[#1B6FFF]" />

                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} className="text-[#1B6FFF] fill-[#1B6FFF]" />
                  ))}
                </div>

                <blockquote className="text-xl sm:text-2xl text-[#EEF0F3] font-medium leading-normal mb-8 tracking-[-0.01em]">
                  &ldquo;{testimonials[activeTestimonial].quote}&rdquo;
                </blockquote>

                <div className="flex items-center gap-4 pt-6 border-t border-[#1F2530]">
                  {/* Avatar initial */}
                  <div className="w-10 h-10 bg-[#1B6FFF] flex items-center justify-center text-white font-bold text-sm font-mono shrink-0">
                    {testimonials[activeTestimonial].name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-[#EEF0F3] font-semibold text-sm">{testimonials[activeTestimonial].name}</div>
                    <div className="font-mono text-[11px] text-[#4E5A6E] tracking-[0.08em] uppercase mt-0.5">
                      {testimonials[activeTestimonial].role}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* -- FINAL CTA ------------------------------------------------------ */}
      <CTASection
        title="Ready to Build Something Powerful?"
        subtitle="Partner with PROGREX and transform your ideas into cutting-edge software solutions that drive real business results."
        primaryBtn={{ label: 'Start Your Project', href: '/contact' }}
        secondaryBtn={{ label: 'View Projects', href: '/projects' }}
      />
    </>
  )
}
