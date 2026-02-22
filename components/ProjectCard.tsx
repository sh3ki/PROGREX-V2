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
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group bg-[#111417] border border-[#1F2530] hover:border-[#1B6FFF]/30 transition-all duration-200 overflow-hidden relative"
    >
      {/* Abstract image area */}
      <div className="relative h-44 bg-[#0D0F12] border-b border-[#1F2530] overflow-hidden">
        <div className="absolute inset-0 bg-grid-fine opacity-100" />
        {/* Structural accent lines */}
        <div className="absolute top-4 left-4 w-8 h-px bg-[#1B6FFF]/60" />
        <div className="absolute top-4 left-4 w-px h-8 bg-[#1B6FFF]/60" />
        <div className="absolute bottom-4 right-4 w-8 h-px bg-[#293040]" />
        <div className="absolute bottom-4 right-4 w-px h-8 bg-[#293040]" />
        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2 mt-8">
          <span className="px-2 py-0.5 bg-[#1B6FFF] text-white font-mono text-[10px] tracking-wider uppercase">
            {category}
          </span>
          <span className="px-2 py-0.5 bg-[#111417] border border-[#1F2530] text-[#8892A4] font-mono text-[10px] tracking-wider uppercase">
            {industry}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-base font-semibold text-[#EEF0F3] mb-2 leading-snug tracking-[-0.02em] group-hover:text-white transition-colors">
          {title}
        </h3>
        <p className="text-[#8892A4] text-sm leading-relaxed mb-4 line-clamp-2">
          {shortDesc}
        </p>

        {/* Tech tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 font-mono text-[10px] text-[#4E5A6E] border border-[#1F2530] tracking-wider"
            >
              {tag}
            </span>
          ))}
        </div>

        <Link
          href={`/projects/${slug}`}
          className="inline-flex items-center gap-2 text-[13px] font-medium text-[#8892A4] group-hover:text-[#1B6FFF] transition-colors duration-200"
        >
          View Case Study <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform duration-200" />
        </Link>
      </div>
    </motion.div>
  )
}

