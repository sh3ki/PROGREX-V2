'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Clock, User } from 'lucide-react'

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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className={`group glass-card rounded-2xl overflow-hidden hover-glow-card ${featured ? 'md:col-span-2' : ''}`}
    >
      {/* Image */}
      <div className={`relative bg-gradient-to-br from-[#3A0CA3]/30 to-[#560BAD]/20 overflow-hidden ${featured ? 'h-64' : 'h-44'}`}>
        <div className="absolute inset-0 bg-dots opacity-30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-5xl font-black text-gradient opacity-20 select-none">{category}</div>
        </div>
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full bg-[#560BAD]/80 text-[#CFA3EA] text-xs font-semibold backdrop-blur-sm">
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
          <span className="flex items-center gap-1">
            <User size={11} />
            {author.name}
          </span>
          <span>{date}</span>
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {readTime}
          </span>
        </div>

        <h3 className={`font-bold text-white mb-2 group-hover:text-[#CFA3EA] transition-colors leading-snug ${featured ? 'text-xl' : 'text-base'}`}>
          {title}
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-2">
          {excerpt}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.slice(0, 2).map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded text-xs bg-[#3A0CA3]/20 text-[#CFA3EA] border border-[#3A0CA3]/20">
              {tag}
            </span>
          ))}
        </div>

        <Link
          href={`/blogs/${slug}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#831DC6] group-hover:text-[#CFA3EA] transition-colors"
        >
          Read Article <ArrowRight size={14} />
        </Link>
      </div>
    </motion.article>
  )
}
