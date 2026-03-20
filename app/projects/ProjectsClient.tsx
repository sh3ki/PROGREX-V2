'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Hero from '@/components/Hero'
import ProjectCard from '@/components/ProjectCard'
import CTASection from '@/components/CTASection'
import SectionWrapper, { SectionHeader } from '@/components/SectionWrapper'
import { projects } from '@/lib/mockData'
import { useTranslation } from '@/components/TranslationProvider'

export default function ProjectsClient() {
  const { t, translations } = useTranslation()
  const translatedCategories = translations.projects.categories as unknown as string[]
  const allLabel = translatedCategories[0] || 'All'
  const categories = [allLabel, ...Array.from(new Set(projects.map((p) => p.category))) ]
  const [activeFilter, setActiveFilter] = useState(allLabel)

  const filtered = activeFilter === allLabel
    ? projects
    : projects.filter((p) => p.category === activeFilter)

  return (
    <>
      <Hero
        badge={t('projects.heroBadge')}
        title={t('projects.heroTitle')}
        highlight={t('projects.heroHighlight')}
        subtitle={t('projects.heroSubtitle')}
        primaryBtn={{ label: t('projects.heroPrimaryBtn'), href: '/contact' }}
      />

      <SectionWrapper className="bg-[#050510]">
        <SectionHeader
          badge={t('projects.listingBadge')}
          title={t('projects.listingTitle')}
          highlight={t('projects.listingHighlight')}
          subtitle={t('projects.listingSubtitle')}
        />

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {categories.map((cat) => (
            <motion.button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeFilter === cat
                  ? 'bg-linear-to-r from-[#560BAD] to-[#4361EE] text-white shadow-[0_0_15px_rgba(86,11,173,0.4)]'
                  : 'glass border border-[#560BAD]/20 text-slate-300 hover:border-[#560BAD]/60 hover:text-white'
              }`}
            >
              {cat}
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
                  title={
                    (translations.data?.projects as Record<string, { title?: string; shortDesc?: string }>)?.[project.slug]?.title
                    || project.title
                  }
                  systemType={project.systemType}
                  category={project.category}
                  industry={project.industry}
                  shortDesc={
                    (translations.data?.projects as Record<string, { title?: string; shortDesc?: string }>)?.[project.slug]?.shortDesc
                    || project.shortDesc
                  }
                  slug={project.slug}
                  tags={project.tags}
                  image={project.image}
                  index={0}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            {t('projects.emptyState')}
          </div>
        )}
      </SectionWrapper>

      <CTASection
        title={t('projects.ctaTitle')}
        subtitle={t('projects.ctaSubtitle')}
        primaryBtn={{ label: t('projects.ctaPrimaryBtn'), href: '/contact' }}
        secondaryBtn={{ label: t('projects.ctaSecondaryBtn'), href: '/services' }}
      />
    </>
  )
}
