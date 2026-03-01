'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Code2, Globe, Smartphone, BookOpen, Server, Cpu, Database, Layers, Wifi, BrainCircuit, Zap, Rocket, Palette, Shield } from 'lucide-react'

// Map service slug/title to Lucide icon
function getServiceIcon(slug: string) {
  const map: Record<string, React.ReactNode> = {
    'custom-software-development': <Code2 size={22} className="text-nebula-300" />,
    'web-development': <Globe size={22} className="text-nebula-300" />,
    'mobile-app-development': <Smartphone size={22} className="text-nebula-300" />,
    'it-consulting-infrastructure': <Server size={22} className="text-nebula-300" />,
    'system-integration': <Database size={22} className="text-nebula-300" />,
    'academic-capstone-system-development': <Layers size={22} className="text-nebula-300" />,
    'hardware-integration': <Wifi size={22} className="text-nebula-300" />,
    'ai-machine-learning': <BrainCircuit size={22} className="text-nebula-300" />,
    'business-automation': <Zap size={22} className="text-nebula-300" />,
    'deployment-hosting-services': <Rocket size={22} className="text-nebula-300" />,
    'ui-ux-design': <Palette size={22} className="text-nebula-300" />,
    'cybersecurity-data-protection': <Shield size={22} className="text-nebula-300" />,
    'training-workshops': <BookOpen size={22} className="text-nebula-300" />,
  }
  return map[slug] ?? <Cpu size={22} className="text-nebula-300" />
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
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Link href={`/services/${slug}`} className="group block h-full">
        <motion.div
          className="group relative h-full rounded-xl overflow-hidden cursor-pointer"
          style={{
            background: 'rgba(8,8,28,0.92)',
            border: '1px solid rgba(103,232,249,0.12)',
          }}
          whileHover={{
            scale: 1.04,
            y: -6,
            background: 'rgba(14,14,40,0.97)',
            boxShadow: '0 0 32px rgba(14,165,233,0.18), 0 0 64px rgba(124,58,237,0.12), 0 16px 40px rgba(0,0,0,0.5)',
          }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        >
          {/* Animated border on hover */}
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              background: 'linear-gradient(135deg, rgba(14,165,233,0.06) 0%, rgba(124,58,237,0.06) 100%)',
            }}
          />

          {/* Circuit-board node grid texture */}
          <div
            className="absolute inset-0 pointer-events-none rounded-xl"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44'%3E%3Cline x1='0' y1='22' x2='16' y2='22' stroke='rgba(103,232,249,0.05)' stroke-width='0.7'/%3E%3Cline x1='28' y1='22' x2='44' y2='22' stroke='rgba(103,232,249,0.05)' stroke-width='0.7'/%3E%3Cline x1='22' y1='0' x2='22' y2='16' stroke='rgba(103,232,249,0.05)' stroke-width='0.7'/%3E%3Cline x1='22' y1='28' x2='22' y2='44' stroke='rgba(103,232,249,0.05)' stroke-width='0.7'/%3E%3Ccircle cx='22' cy='22' r='4' fill='none' stroke='rgba(103,232,249,0.09)' stroke-width='0.8'/%3E%3Ccircle cx='22' cy='22' r='1.2' fill='rgba(103,232,249,0.11)'/%3E%3Ccircle cx='0' cy='0' r='1.2' fill='rgba(103,232,249,0.05)'/%3E%3Ccircle cx='44' cy='0' r='1.2' fill='rgba(103,232,249,0.05)'/%3E%3Ccircle cx='0' cy='44' r='1.2' fill='rgba(103,232,249,0.05)'/%3E%3Ccircle cx='44' cy='44' r='1.2' fill='rgba(103,232,249,0.05)'/%3E%3C/svg%3E")`,
              backgroundSize: '44px 44px',
              maskImage: 'radial-gradient(ellipse 110% 80% at 50% 10%, black 20%, transparent 90%)',
              WebkitMaskImage: 'radial-gradient(ellipse 110% 80% at 50% 10%, black 20%, transparent 90%)',
            }}
          />

          {/* Top scan glow on hover */}
          <div
            className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-400"
            style={{ background: 'linear-gradient(to right, transparent, rgba(14,165,233,0.8), rgba(124,58,237,0.8), transparent)' }}
          />

          <div className="relative p-6">
            {/* Number + Icon row */}
            <div className="flex items-start justify-between mb-6">
              <span className="font-mono text-[10px] text-nebula-400/45 tracking-widest group-hover:text-nebula-400/75 transition-colors duration-300">
                // SVC_{String(index + 1).padStart(2, '0')}
              </span>
              <motion.div
                className="w-11 h-11 rounded-lg flex items-center justify-center"
                style={{
                  background: 'rgba(103,232,249,0.08)',
                  border: '1px solid rgba(103,232,249,0.18)',
                }}
                whileHover={{
                  background: 'rgba(14,165,233,0.18)',
                  boxShadow: '0 0 16px rgba(14,165,233,0.35)',
                }}
                transition={{ duration: 0.2 }}
              >
                {getServiceIcon(slug)}
              </motion.div>
            </div>

            {/* Title */}
            <h3 className="font-display font-bold text-white text-xl mb-3 group-hover:text-nebula-200 transition-colors duration-200 leading-snug">
              {title}
            </h3>

            {/* Description */}
            <p className="text-white/45 text-sm leading-relaxed mb-6 group-hover:text-white/65 transition-colors duration-300">
              {shortDesc}
            </p>

            {/* CTA row */}
            <div className="flex items-center gap-1.5 font-mono text-sm text-nebula-400/60 group-hover:text-nebula-300 transition-colors duration-200">
              <span className="text-nebula-400/40 group-hover:text-nebula-400">→</span>
              <span>Learn More</span>
              <ArrowRight
                size={13}
                className="translate-x-0 group-hover:translate-x-2 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Bottom accent line — slides in on hover */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[2px] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500"
            style={{ background: 'linear-gradient(to right, #0EA5E9, #7C3AED)' }}
          />
        </motion.div>
      </Link>
    </motion.div>
  )
}
