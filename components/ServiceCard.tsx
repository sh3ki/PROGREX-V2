'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface ServiceCardProps {
  title: string
  shortDesc: string
  icon: string
  slug: string
  color: string
  index?: number
}

export default function ServiceCard({ title, shortDesc, icon, slug, index = 0 }: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="group bg-[#0F0F14] border border-[#1E1E2E] hover:border-[#4C1D95] hover:bg-[#14141B] transition-all duration-150 relative"
    >
      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#7C2AE8] opacity-0 group-hover:opacity-100 transition-opacity duration-150" />

      <div className="p-6">
        <div className="flex items-start justify-between mb-5">
          <span className="font-mono text-[10px] text-[#252538]">{String(index + 1).padStart(2, '0')}</span>
          <span className="text-xl opacity-70">{icon}</span>
        </div>

        <h3 className="text-[15px] font-semibold text-[#D1CEE8] mb-2 group-hover:text-[#C4B5FD] transition-colors duration-150 leading-snug">
          {title}
        </h3>
        <p className="text-[#3A3854] text-xs leading-relaxed mb-5 font-light">
          {shortDesc}
        </p>

        <Link
          href={`/services/${slug}`}
          className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-[#4C1D95] group-hover:text-[#7C2AE8] transition-colors duration-150"
        >
          EXPLORE
          <ArrowRight size={10} />
        </Link>
      </div>
    </motion.div>
  )
}
