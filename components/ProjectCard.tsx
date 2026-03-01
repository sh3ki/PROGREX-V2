'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import ProjectCardVisual from './ProjectCardVisual'

interface ProjectCardProps {
  title: string
  category: string
  industry: string
  shortDesc: string
  slug: string
  tags: string[]
  index?: number
}

export default function ProjectCard({
  title, category, industry, shortDesc, slug, tags, index = 0,
}: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group relative rounded-xl overflow-hidden hover-glow-card transition-all duration-300"
      style={{
        background: 'rgba(6,6,22,0.95)',
        border: '1px solid rgba(103,232,249,0.1)',
      }}
    >
      {/* Visual area */}
      <div className="relative h-44 overflow-hidden">
        <ProjectCardVisual category={category} title={title} />

        {/* Category badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="bracket-tag">{category}</span>
        </div>
        <div className="absolute top-3 right-3 z-10">
          <span className="font-mono text-[9px] text-white/40 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded">
            {industry}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-display font-bold text-white text-base mb-2 group-hover:text-nebula-300 transition-colors duration-200">
          {title}
        </h3>
        <p className="text-white/45 text-sm leading-relaxed mb-4 line-clamp-2">
          {shortDesc}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="font-mono text-[10px] px-2 py-0.5 rounded"
              style={{
                background: 'rgba(103,232,249,0.07)',
                border: '1px solid rgba(103,232,249,0.18)',
                color: 'rgba(103,232,249,0.7)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <Link
          href={`/projects/${slug}`}
          className="inline-flex items-center gap-2 text-sm font-mono text-nebula-400/70 hover:text-nebula-300 transition-colors duration-200 group/link"
        >
          View Case Study
          <ArrowRight
            size={14}
            className="translate-x-0 group-hover/link:translate-x-1 transition-transform duration-200"
          />
        </Link>
      </div>

      {/* Bottom glow on hover */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(to right, transparent, rgba(103,232,249,0.5), transparent)' }}
      />
    </motion.div>
  )
}
