'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Tag } from 'lucide-react'

interface ProjectCardProps {
  title: string
  category: string
  industry: string
  shortDesc: string
  slug: string
  tags: string[]
  index?: number
}

export default function ProjectCard({ title, category, industry, shortDesc, slug, tags, index = 0 }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -6 }}
      className="group glass-card rounded-2xl overflow-hidden hover-glow-card"
    >
      {/* Image Placeholder */}
      <div className="relative h-48 bg-gradient-to-br from-[#3A0CA3]/40 to-[#4361EE]/20 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#560BAD] to-[#4361EE] flex items-center justify-center opacity-60 group-hover:opacity-80 transition-opacity">
            <Tag size={24} className="text-white" />
          </div>
        </div>
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full bg-[#560BAD]/80 backdrop-blur-sm text-[#CFA3EA] text-xs font-semibold">
            {category}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-slate-300 text-xs">
            {industry}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#CFA3EA] transition-colors">
          {title}
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-2">
          {shortDesc}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded text-xs bg-[#3A0CA3]/30 text-[#CFA3EA] border border-[#3A0CA3]/30"
            >
              {tag}
            </span>
          ))}
        </div>

        <Link
          href={`/projects/${slug}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#831DC6] group-hover:text-[#CFA3EA] transition-colors"
        >
          View Case Study <ArrowRight size={14} />
        </Link>
      </div>
    </motion.div>
  )
}
