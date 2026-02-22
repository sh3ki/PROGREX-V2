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

export default function ServiceCard({ title, shortDesc, icon, slug, color, index = 0 }: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -6 }}
      className="group glass-card rounded-2xl p-6 hover-glow-card cursor-pointer relative overflow-hidden"
    >
      {/* Background gradient on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`} />

      {/* Icon */}
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>

      {/* Content */}
      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#CFA3EA] transition-colors duration-300">
        {title}
      </h3>
      <p className="text-slate-400 text-sm leading-relaxed mb-4">
        {shortDesc}
      </p>

      {/* Link */}
      <Link
        href={`/services/${slug}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-[#831DC6] group-hover:text-[#CFA3EA] transition-colors duration-300"
      >
        Learn More
        <motion.span
          className="inline-block"
          animate={{ x: 0 }}
          whileHover={{ x: 4 }}
        >
          <ArrowRight size={14} />
        </motion.span>
      </Link>

      {/* Glow border animation */}
      <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-[#560BAD]/40 transition-all duration-300 pointer-events-none" />
    </motion.div>
  )
}
