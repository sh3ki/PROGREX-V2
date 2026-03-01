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

// Category to gradient blob color map
const categoryColors: Record<string, { from: string; to: string }> = {
  Technology:   { from: 'rgba(103,232,249,0.15)', to: 'rgba(14,165,233,0.08)' },
  Business:     { from: 'rgba(167,139,250,0.15)', to: 'rgba(124,58,237,0.08)' },
  Design:       { from: 'rgba(34,211,153,0.12)', to: 'rgba(52,211,153,0.06)' },
  Engineering:  { from: 'rgba(251,191,36,0.12)', to: 'rgba(245,158,11,0.06)' },
  Default:      { from: 'rgba(103,232,249,0.1)',  to: 'rgba(167,139,250,0.06)' },
}

export default function BlogCard({
  title, category, author, date, readTime, excerpt, slug, tags, index = 0, featured = false,
}: BlogCardProps) {
  const colors = categoryColors[category] ?? categoryColors.Default
  const readMins = parseInt(readTime) || 5

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className={`group relative rounded-xl overflow-hidden hover-glow-card transition-all duration-300 ${featured ? 'md:col-span-2' : ''}`}
      style={{
        background: 'rgba(6,6,22,0.95)',
        border: '1px solid rgba(103,232,249,0.1)',
      }}
    >
      {/* Gradient blob visual area — no image */}
      <div
        className={`relative overflow-hidden ${featured ? 'h-52' : 'h-36'}`}
        style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.to})` }}
      >
        {/* Dot grid overlay */}
        <div className="absolute inset-0 bg-dot-grid opacity-40" />

        {/* Category text ghost */}
        <div
          className="absolute inset-0 flex items-center justify-center font-display font-black text-6xl uppercase tracking-tighter select-none"
          style={{ color: 'rgba(255,255,255,0.04)', letterSpacing: '-0.04em' }}
        >
          {category}
        </div>

        {/* Category bracket tag */}
        <div className="absolute top-3 left-3">
          <span className="bracket-tag">{category}</span>
        </div>

        {/* Read time */}
        <div className="absolute top-3 right-3 font-mono text-[9px] text-white/35 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded">
          // ~{readMins} MIN READ
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Meta row */}
        <div className="flex items-center gap-3 font-mono text-[10px] text-white/30 mb-3">
          <span>{author.name}</span>
          <span className="text-white/15">·</span>
          <span>{date}</span>
        </div>

        <h3
          className={`font-display font-bold text-white mb-2.5 group-hover:text-nebula-300 transition-colors duration-200 leading-snug ${
            featured ? 'text-xl' : 'text-base'
          }`}
        >
          {title}
        </h3>
        <p className="text-white/40 text-sm leading-relaxed mb-4 line-clamp-2">
          {excerpt}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="font-mono text-[10px] px-2 py-0.5 rounded"
              style={{
                background: 'rgba(103,232,249,0.07)',
                border: '1px solid rgba(103,232,249,0.15)',
                color: 'rgba(103,232,249,0.65)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <Link
          href={`/blogs/${slug}`}
          className="inline-flex items-center gap-2 text-sm font-mono text-nebula-400/70 hover:text-nebula-300 transition-colors duration-200 group/link"
        >
          Read Article
          <ArrowRight
            size={13}
            className="translate-x-0 group-hover/link:translate-x-1 transition-transform"
          />
        </Link>
      </div>

      {/* Bottom accent */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(to right, transparent, rgba(103,232,249,0.4), transparent)' }}
      />
    </motion.article>
  )
}
