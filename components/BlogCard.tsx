'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface BlogCardProps {
  title: string
  category: string
  author: { name: string; role: string }
  date: string
  readTime: string
  excerpt: string
  slug: string
  tags: string[]
  index?: number
  featured?: boolean
}

export default function BlogCard({
  title,
  category,
  author,
  date,
  readTime,
  excerpt,
  slug,
  tags,
  index = 0,
  featured = false,
}: BlogCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className={`group bg-[#0F0F14] border border-[#1E1E2E] hover:border-[#4C1D95] hover:bg-[#14141B] transition-all duration-150 relative ${featured ? 'md:col-span-2' : ''}`}
    >
      {/* Left accent */}
      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#7C2AE8] opacity-0 group-hover:opacity-100 transition-opacity duration-150" />

      {/* Header */}
      <div className={`relative bg-[#14141B] border-b border-[#1E1E2E] tech-grid overflow-hidden ${featured ? 'h-40' : 'h-28'}`}>
        <div className="absolute top-2 left-2 w-4 h-4 border-l border-t border-[#252538]" />
        <div className="absolute inset-0 flex items-end p-3">
          <span className="px-2 py-0.5 border border-[#4C1D95] text-[#C4B5FD] text-[9px] font-mono tracking-widest">
            {category.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="p-5">
        {/* Meta */}
        <div className="flex items-center gap-3 mb-3">
          <span className="sys-label">{author.name}</span>
          <span className="text-[#1E1E2E] text-xs">/</span>
          <span className="sys-label">{date}</span>
          <span className="text-[#1E1E2E] text-xs">/</span>
          <span className="sys-label">{readTime}</span>
        </div>

        <h3 className={`font-semibold text-[#D1CEE8] mb-2 group-hover:text-[#C4B5FD] transition-colors leading-snug ${featured ? 'text-lg' : 'text-[15px]'}`}>
          {title}
        </h3>
        <p className="text-[#3A3854] text-xs leading-relaxed mb-4 line-clamp-2 font-light">
          {excerpt}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.slice(0, 2).map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 text-[9px] font-mono text-[#4C1D95] border border-[#1E1E2E] tracking-widest">
              {tag}
            </span>
          ))}
        </div>

        <Link
          href={`/blogs/${slug}`}
          className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-[#4C1D95] group-hover:text-[#7C2AE8] transition-colors duration-150"
        >
          READ ARTICLE
          <ArrowRight size={10} />
        </Link>
      </div>
    </motion.article>
  )
}
