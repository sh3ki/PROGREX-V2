'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import ProjectCardVisual from './ProjectCardVisual'

interface ProjectCardProps {
  title: string
  category: string
  industry: string
  shortDesc: string
  slug: string
  tags: string[]
  image?: string
  index?: number
}

export default function ProjectCard({
  title, category, industry, shortDesc, slug, tags, image, index = 0,
}: ProjectCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link href={`/projects/${slug}`} className="block group">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.08 }}
        whileHover={{ y: -6, scale: 1.02 }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        className="relative rounded-xl overflow-hidden cursor-pointer"
        style={{
          background: 'rgba(6,6,22,0.95)',
          border: hovered ? '1px solid rgba(103,232,249,0.35)' : '1px solid rgba(103,232,249,0.1)',
          boxShadow: hovered
            ? '0 8px 48px rgba(86,11,173,0.55), 0 0 80px rgba(67,97,238,0.2), 0 0 0 1px rgba(103,232,249,0.08)'
            : '0 4px 24px rgba(0,0,0,0.3)',
          transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
        }}
      >
        {/* Visual area */}
        <div className="relative h-48 overflow-hidden">
          <ProjectCardVisual category={category} title={title} image={image} />

          {/* Category badge */}
          <div className="absolute top-3 left-3 z-10">
            <span
              className="bracket-tag"
              style={{
                background: 'rgba(86,11,173,0.5)',
                border: '1px solid rgba(167,139,250,0.6)',
                color: '#e0c8ff',
                backdropFilter: 'blur(4px)',
              }}
            >
              {category}
            </span>
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
          <p className="text-white/50 text-sm leading-relaxed mb-4">
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

          <div className="inline-flex items-center gap-2 text-sm font-mono text-nebula-400/70 group-hover:text-nebula-300 transition-colors duration-200">
            View Case Study
            <span className="translate-x-0 group-hover:translate-x-1 transition-transform duration-200">&rarr;</span>
          </div>
        </div>

        {/* Bottom glow line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px transition-opacity duration-300"
          style={{
            background: 'linear-gradient(to right, transparent, rgba(103,232,249,0.6), transparent)',
            opacity: hovered ? 1 : 0,
          }}
        />
      </motion.div>
    </Link>
  )
}


