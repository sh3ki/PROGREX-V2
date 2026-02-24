'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="group bg-[#0F0F14] border border-[#1E1E2E] hover:border-[#4C1D95] transition-all duration-150 relative overflow-hidden"
    >
      {/* Header band */}
      <div className="relative h-28 bg-[#14141B] border-b border-[#1E1E2E] tech-grid overflow-hidden">
        <div className="absolute top-2 left-2 w-4 h-4 border-l border-t border-[#252538]" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-r border-b border-[#252538]" />
        <div className="absolute inset-0 flex items-end p-3 gap-2">
          <span className="px-2 py-0.5 border border-[#4C1D95] text-[#C4B5FD] text-[9px] font-mono tracking-widest">
            {category.toUpperCase()}
          </span>
          <span className="px-2 py-0.5 border border-[#1E1E2E] text-[#3A3854] text-[9px] font-mono">
            {industry.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-[15px] font-semibold text-[#D1CEE8] mb-2 group-hover:text-[#C4B5FD] transition-colors duration-150">
          {title}
        </h3>
        <p className="text-[#3A3854] text-xs leading-relaxed mb-4 line-clamp-2 font-light">
          {shortDesc}
        </p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 text-[9px] font-mono text-[#4C1D95] border border-[#1E1E2E] tracking-widest">
              {tag}
            </span>
          ))}
        </div>
        <Link
          href={`/projects/${slug}`}
          className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-[#4C1D95] group-hover:text-[#7C2AE8] transition-colors duration-150"
        >
          VIEW CASE STUDY
          <ArrowRight size={10} />
        </Link>
      </div>
    </motion.div>
  )
}
