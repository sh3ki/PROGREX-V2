'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Hero from '@/components/Hero'
import ProjectCard from '@/components/ProjectCard'
import CTASection from '@/components/CTASection'
import { projects, projectCategories } from '@/lib/mockData'

export default function ProjectsClient() {
  const [activeFilter, setActiveFilter] = useState('All')

  const filtered = activeFilter === 'All'
    ? projects
    : projects.filter((p) => p.category === activeFilter)

  return (
    <>
      {/* â”€â”€ HERO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Hero
        badge="Our Portfolio"
        title="Projects That"
        highlight="Drive Impact"
        subtitle="150+ delivered solutions. Each one built with purpose, precision, and a commitment to measurable results."
        primaryBtn={{ label: 'Start Your Project', href: '/contact' }}
      />

      {/* â”€â”€ PROJECTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="bg-[#0D0F12] border-t border-[#1F2530]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-24">

          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
            <div>
              <span className="label text-[#1B6FFF] mb-3 block">CASE STUDIES</span>
              <h2 className="text-4xl lg:text-5xl font-bold text-[#EEF0F3] tracking-[-0.035em] leading-[1.1]">
                Our Work
              </h2>
            </div>
            <p className="text-[#8892A4] text-base max-w-sm lg:text-right leading-relaxed">
              Filter by category to explore our expertise across industries and technology types.
            </p>
          </div>

          {/* Filter row */}
          <div className="flex flex-wrap gap-2 mb-12 pb-6 border-b border-[#1F2530]">
            {projectCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-4 py-2 text-xs font-mono tracking-[0.08em] uppercase transition-all duration-200 ${
                  activeFilter === cat
                    ? 'bg-[#1B6FFF] text-white'
                    : 'border border-[#1F2530] text-[#8892A4] hover:border-[#1B6FFF]/40 hover:text-[#EEF0F3]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filtered.map((project, i) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <ProjectCard
                    title={project.title}
                    category={project.category}
                    industry={project.industry}
                    shortDesc={project.shortDesc}
                    slug={project.slug}
                    tags={project.tags}
                    index={0}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filtered.length === 0 && (
            <div className="text-center py-20 font-mono text-[11px] text-[#4E5A6E] tracking-[0.14em] uppercase">
              No projects found in this category yet.
            </div>
          )}
        </div>
      </section>

      {/* â”€â”€ CTA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <CTASection
        title="Have a Project in Mind?"
        subtitle="Let's turn your idea into a powerful, production-ready system that delivers real results."
        primaryBtn={{ label: 'Get a Quote', href: '/contact' }}
        secondaryBtn={{ label: 'Our Services', href: '/services' }}
      />
    </>
  )
}
