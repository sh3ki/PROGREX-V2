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
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className={`group bg-[#111417] border border-[#1F2530] hover:border-[#1B6FFF]/30 transition-all duration-200 overflow-hidden relative ${featured ? 'lg:col-span-2' : ''}`}
    >
      {/* Category bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#1F2530] bg-[#0D0F12]">
        <span className="font-mono text-[10px] font-medium tracking-[0.14em] text-[#1B6FFF] uppercase">{category}</span>
        <span className="font-mono text-[10px] text-[#4E5A6E] tracking-wider">{readTime}</span>
      </div>

      {/* Content */}
      <div className={`p-5 ${featured ? 'lg:p-7' : ''}`}>
        {/* Meta */}
        <div className="flex items-center gap-3 text-[11px] text-[#4E5A6E] font-mono mb-4">
          <span>{author.name}</span>
          <span className="w-px h-3 bg-[#1F2530]" />
          <span>{date}</span>
        </div>

        <h3 className={`font-semibold text-[#EEF0F3] mb-3 leading-snug tracking-[-0.02em] group-hover:text-white transition-colors ${featured ? 'text-xl lg:text-2xl' : 'text-base'}`}>
          {title}
        </h3>
        <p className="text-[#8892A4] text-sm leading-relaxed mb-5 line-clamp-2">
          {excerpt}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 font-mono text-[10px] text-[#4E5A6E] border border-[#1F2530] tracking-wider"
            >
              {tag}
            </span>
          ))}
        </div>

        <Link
          href={`/blogs/${slug}`}
          className="inline-flex items-center gap-2 text-[13px] font-medium text-[#8892A4] group-hover:text-[#1B6FFF] transition-colors duration-200"
        >
          Read Article <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform duration-200" />
        </Link>
      </div>
    </motion.article>
  )
}
