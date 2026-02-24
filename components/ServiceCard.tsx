'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Code2, Globe, Smartphone, GitMerge, BookOpen, Server, Cpu } from 'lucide-react'

// Map service slug/title to Lucide icon
function getServiceIcon(slug: string) {
  const map: Record<string, React.ReactNode> = {
    'custom-software-development': <Code2 size={20} className="text-nebula-300" />,
    'web-development': <Globe size={20} className="text-nebula-300" />,
    'mobile-app-development': <Smartphone size={20} className="text-nebula-300" />,
    'it-consulting-infrastructure': <Server size={20} className="text-nebula-300" />,
    'ui-ux-design': <GitMerge size={20} className="text-nebula-300" />,
    'training-workshops': <BookOpen size={20} className="text-nebula-300" />,
  }
  return map[slug] ?? <Cpu size={20} className="text-nebula-300" />
}

interface ServiceCardProps {
  title: string
  shortDesc: string
  icon: string
  slug: string
  color: string
  index?: number
}

export default function ServiceCard({ title, shortDesc, slug, index = 0 }: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group relative rounded-xl overflow-hidden hover-glow-card transition-all duration-300"
      style={{
        background: 'rgba(8,8,28,0.9)',
        border: '1px solid rgba(103,232,249,0.1)',
      }}
    >
      {/* Panel corner brackets */}
      <div className="panel-corner absolute inset-0 pointer-events-none rounded-xl" />

      {/* Scan line sweep on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"
        style={{ background: 'linear-gradient(to bottom, rgba(103,232,249,0.04) 0%, transparent 50%)' }}
      />

      <div className="p-6">
        {/* Number + Icon row */}
        <div className="flex items-start justify-between mb-5">
          <span className="font-mono text-[11px] text-nebula-400/40 tracking-widest">
            // SVC_{String(index + 1).padStart(2, '0')}
          </span>
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{
              background: 'rgba(103,232,249,0.08)',
              border: '1px solid rgba(103,232,249,0.15)',
            }}
          >
            {getServiceIcon(slug)}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-display font-bold text-white text-base mb-2.5 group-hover:text-nebula-300 transition-colors duration-200">
          {title}
        </h3>

        {/* Description */}
        <p className="text-white/45 text-sm leading-relaxed mb-5">
          {shortDesc}
        </p>

        {/* CTA link */}
        <Link
          href={`/services/${slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-mono text-nebula-400/70 hover:text-nebula-300 transition-colors duration-200 group/link"
        >
          <span className="text-nebula-400/40 mr-1">→</span>
          Learn More
          <ArrowRight
            size={13}
            className="translate-x-0 group-hover/link:translate-x-1 transition-transform duration-200"
          />
        </Link>
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(to right, transparent, rgba(103,232,249,0.5), transparent)' }}
      />
    </motion.div>
  )
}
