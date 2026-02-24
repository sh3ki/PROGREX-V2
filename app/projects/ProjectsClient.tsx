'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Hero from '@/components/Hero'
import ProjectCard from '@/components/ProjectCard'
import CTASection from '@/components/CTASection'
import SectionWrapper, { SectionHeader } from '@/components/SectionWrapper'
import { projects, projectCategories } from '@/lib/mockData'

export default function ProjectsClient() {
  const [activeFilter, setActiveFilter] = useState('All')

  const filtered = activeFilter === 'All'
    ? projects
    : projects.filter((p) => p.category === activeFilter)

  return (
    <>
      <Hero
        badge="Our Portfolio"
        title="Projects That"
        highlight="Drive Impact"
        subtitle="150+ delivered solutions. Each one built with purpose, precision, and a commitment to measurable results."
        primaryBtn={{ label: 'Start Your Project', href: '/contact' }}
      />

      <SectionWrapper className="bg-[#050510]">
        <SectionHeader
          badge="Case Studies"
          title="Our"
          highlight="Work"
          subtitle="Filter by category to explore our expertise across industries and technology types."
        />

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {projectCategories.map((cat) => (
            <motion.button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className={`font-mono text-xs px-3 py-1.5 border transition-all duration-200 ${
                activeFilter === cat
                  ? 'border-nebula-400/60 text-nebula-300 bg-nebula-400/10'
                  : 'border-white/10 text-white/40 hover:border-nebula-600/40 hover:text-white/70'
              }`}
            >
              [{cat}]
            </motion.button>
          ))}
        </div>

        {/* Project grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((project, i) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
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
          <div className="text-center py-20 text-slate-500">
            No projects found in this category yet.
          </div>
        )}
      </SectionWrapper>

      <CTASection
        title="Have a Project in Mind?"
        subtitle="Let's turn your idea into a powerful, production-ready system that delivers real results."
        primaryBtn={{ label: 'Get a Quote', href: '/contact' }}
        secondaryBtn={{ label: 'Our Services', href: '/services' }}
      />
    </>
  )
}
