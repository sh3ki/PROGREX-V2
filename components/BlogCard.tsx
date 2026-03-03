'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Clock } from 'lucide-react'

interface BlogCardProps {
  title: string
  category: string
  author: { name: string; role: string }
  date: string
  readTime: string
  excerpt: string
  slug: string
  tags: string[]
  image?: string
  index?: number
  featured?: boolean
}

const categoryStyle: Record<string, { border: string; tag: string }> = {
  Tech:           { border: 'rgba(14,165,233,0.28)',  tag: 'rgba(14,165,233,0.25)' },
  Business:       { border: 'rgba(167,139,250,0.28)', tag: 'rgba(167,139,250,0.25)' },
  Academic:       { border: 'rgba(34,211,153,0.25)',  tag: 'rgba(34,211,153,0.25)' },
  'Case Studies': { border: 'rgba(251,191,36,0.25)',  tag: 'rgba(251,191,36,0.25)' },
  Default:        { border: 'rgba(103,232,249,0.18)', tag: 'rgba(103,232,249,0.25)' },
}

const categoryTagColor: Record<string, string> = {
  Tech:           '#67e8f9',
  Business:       '#c4b5fd',
  Academic:       '#6ee7b7',
  'Case Studies': '#fcd34d',
  Default:        '#67e8f9',
}

const fallbackGradient: Record<string, string> = {
  Tech:           'linear-gradient(135deg, rgba(14,165,233,0.18), rgba(103,232,249,0.07))',
  Business:       'linear-gradient(135deg, rgba(124,58,237,0.22), rgba(167,139,250,0.08))',
  Academic:       'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(34,211,153,0.07))',
  'Case Studies': 'linear-gradient(135deg, rgba(217,119,6,0.18), rgba(251,191,36,0.07))',
  Default:        'linear-gradient(135deg, rgba(103,232,249,0.12), rgba(167,139,250,0.07))',
}

export default function BlogCard({
  title, category, author, date, readTime, excerpt, slug, tags, image, index = 0, featured = false,
}: BlogCardProps) {
  const style = categoryStyle[category] ?? categoryStyle.Default
  const tagColor = categoryTagColor[category] ?? categoryTagColor.Default
  const readMins = parseInt(readTime) || 5

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className={`h-full ${featured ? 'md:col-span-2' : ''}`}
    >
      <Link
        href={`/blogs/${slug}`}
        className={`group relative flex flex-col rounded-xl overflow-hidden transition-all duration-300 h-full ${featured ? 'md:flex-row' : ''}`}
        style={{
          background: 'rgba(6,6,22,0.97)',
          border: `1px solid ${style.border}`,
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          transition: 'border-color 0.3s, box-shadow 0.3s',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLAnchorElement
          el.style.borderColor = tagColor + '60'
          el.style.boxShadow = `0 0 0 1px ${tagColor}30, 0 8px 40px ${tagColor}22, 0 4px 24px rgba(0,0,0,0.5)`
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLAnchorElement
          el.style.borderColor = style.border
          el.style.boxShadow = '0 4px 24px rgba(0,0,0,0.3)'
        }}
      >
        {/* Image area */}
        <div
          className={`relative overflow-hidden shrink-0 ${featured ? 'md:w-[42%] h-52 md:h-auto' : 'h-44'}`}
          style={{ background: fallbackGradient[category] ?? fallbackGradient.Default }}
        >
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              sizes={featured ? '(max-width:768px) 100vw, 42vw' : '(max-width:768px) 100vw, 33vw'}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-dot-grid opacity-40" />
              <div
                className="absolute inset-0 flex items-center justify-center font-display font-black text-6xl uppercase tracking-tighter select-none"
                style={{ color: 'rgba(255,255,255,0.04)' }}
              >
                {category}
              </div>
            </>
          )}

          {/* Dark gradient on image bottom */}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          {/* Category tag */}
          <div className="absolute top-3 left-3 z-10">
            <span
              className="font-mono text-[10px] px-2.5 py-1 rounded font-semibold tracking-wide"
              style={{ background: style.tag, color: tagColor, border: `1px solid ${style.border}` }}
            >
              {category}
            </span>
          </div>

          {/* Read time */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 font-mono text-[9px] text-white/60 bg-black/60 backdrop-blur-sm px-2 py-1 rounded">
            <Clock size={9} />
            {readMins} min
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-5">
          {/* Meta */}
          <div className="flex items-center gap-2 font-mono text-[10px] text-white/30 mb-3 flex-wrap">
            <span className="truncate" style={{ maxWidth: '150px' }}>{author.name}</span>
            <span className="text-white/15">·</span>
            <span className="shrink-0">{date}</span>
          </div>

          <h3 className={`font-display font-bold text-white group-hover:text-nebula-300 transition-colors duration-200 leading-snug mb-2.5 ${featured ? 'text-xl' : 'text-base'}`}>
            {title}
          </h3>

          <p className="text-white/40 text-sm leading-relaxed mb-4 line-clamp-2 flex-1">
            {excerpt}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="font-mono text-[10px] px-2 py-0.5 rounded"
                style={{
                  background: 'rgba(103,232,249,0.06)',
                  border: '1px solid rgba(103,232,249,0.12)',
                  color: 'rgba(103,232,249,0.6)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono text-nebula-400/70 group-hover:text-nebula-300 transition-colors duration-200 mt-auto">
            Read Article
            <ArrowRight size={12} className="translate-x-0 group-hover:translate-x-1 transition-transform duration-200" />
          </div>
        </div>

        {/* Bottom glow accent on hover */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ background: `linear-gradient(to right, transparent, ${tagColor}60, transparent)` }}
        />
      </Link>
    </motion.div>
  )
}
