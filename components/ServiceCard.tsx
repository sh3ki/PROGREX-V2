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

export default function ServiceCard({ title, shortDesc, slug, index = 0 }: ServiceCardProps) {
  const num = String(index + 1).padStart(2, '0')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="group relative bg-[#111417] border border-[#1F2530] hover:border-[#1B6FFF]/40 hover:bg-[#131820] transition-all duration-200 p-6 cursor-pointer overflow-hidden"
    >
      {/* Blue left accent on hover */}
      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#1B6FFF] scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-bottom" />

      {/* Number */}
      <p className="font-mono text-[10px] font-medium tracking-[0.14em] text-[#4E5A6E] mb-5">{num}</p>

      {/* Title */}
      <h3 className="text-[17px] font-semibold text-[#EEF0F3] mb-3 leading-tight tracking-[-0.02em] group-hover:text-white transition-colors">
        {title}
      </h3>

      {/* Description */}
      <p className="text-[#8892A4] text-sm leading-relaxed mb-6 line-clamp-3">
        {shortDesc}
      </p>

      {/* Link */}
      <Link
        href={`/services/${slug}`}
        className="inline-flex items-center gap-2 text-[13px] font-medium text-[#8892A4] group-hover:text-[#1B6FFF] transition-colors duration-200"
        onClick={e => e.stopPropagation()}
      >
        Learn More
        <ArrowRight size={13} className="translate-x-0 group-hover:translate-x-1 transition-transform duration-200" />
      </Link>
    </motion.div>
  )
}

