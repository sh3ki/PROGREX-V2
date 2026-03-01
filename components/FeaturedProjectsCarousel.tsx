'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'

const PROJECTS = [
  {
    id: 1,
    slug: 'nexus-erp',
    title: 'Nexus ERP Platform',
    category: 'Enterprise',
    industry: 'Manufacturing',
    tags: ['React', 'Node.js', 'PostgreSQL'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=80',
    shortDesc:
      'End-to-end enterprise resource planning system built for a 500-employee manufacturing company. Integrates procurement, HR, inventory, and real-time analytics into a single unified platform.',
  },
  {
    id: 2,
    slug: 'edutrack-lms',
    title: 'EduTrack LMS',
    category: 'Web',
    industry: 'Education',
    tags: ['Next.js', 'Prisma', 'PostgreSQL'],
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=80',
    shortDesc:
      'Full-featured learning management system serving a network of 12 schools across the Philippines. Supports live classes, grading, attendance tracking, and student progress dashboards.',
  },
  {
    id: 3,
    slug: 'swiftcart-ecommerce',
    title: 'SwiftCart E-Commerce',
    category: 'E-commerce',
    industry: 'Retail',
    tags: ['Next.js', 'MongoDB', 'Stripe'],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=80',
    shortDesc:
      'High-conversion multi-vendor e-commerce platform with real-time inventory management, advanced analytics, and integrated Stripe payments. Handles 10,000+ daily active users at peak.',
  },
  {
    id: 4,
    slug: 'pulsecrm',
    title: 'PulseCRM',
    category: 'CRM',
    industry: 'Sales & Marketing',
    tags: ['React', 'FastAPI', 'Redis'],
    image: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=900&q=80',
    shortDesc:
      'Customer relationship management system with AI-powered lead scoring, pipeline visualization, and automated follow-up workflows. Reduced sales cycle time by 38% for the client.',
  },
  {
    id: 5,
    slug: 'healthbridge',
    title: 'HealthBridge Portal',
    category: 'Healthcare',
    industry: 'Medical',
    tags: ['React Native', 'Django', 'PostgreSQL'],
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&q=80',
    shortDesc:
      'Patient management portal connecting clinics, doctors, and patients with telemedicine, appointment scheduling, and digital prescription capabilities. Deployed across 8 medical centers.',
  },
]

function getCardStyle(offset: number) {
  const abs = Math.abs(offset)
  if (abs > 2) return null
  if (abs === 0) {
    return {
      x: '0%',
      scale: 1,
      rotateY: 0,
      z: 0,
      opacity: 1,
      zIndex: 10,
    }
  }
  if (abs === 1) {
    const sign = offset > 0 ? 1 : -1
    return {
      x: `${sign * 62}%`,
      scale: 0.76,
      rotateY: -sign * 42,
      z: -120,
      opacity: 0.55,
      zIndex: 5,
    }
  }
  // abs === 2
  const sign = offset > 0 ? 1 : -1
  return {
    x: `${sign * 105}%`,
    scale: 0.58,
    rotateY: -sign * 55,
    z: -220,
    opacity: 0.2,
    zIndex: 1,
  }
}

export default function FeaturedProjectsCarousel() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)
  const [dragging, setDragging] = useState(false)

  const total = PROJECTS.length

  const go = useCallback(
    (delta: number) => {
      setDirection(delta)
      setCurrent((c) => (c + delta + total) % total)
    },
    [total]
  )

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    setDragging(false)
    if (info.offset.x < -60) go(1)
    else if (info.offset.x > 60) go(-1)
  }

  return (
    <div className="relative w-full select-none">
      <style>{`
        .carousel-card {
          transition: box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .carousel-card:hover {
          box-shadow: 0 0 0 1px rgba(14,165,233,0.3), 0 0 35px rgba(14,165,233,0.28), 0 8px 40px rgba(0,0,0,0.55);
          border-color: rgba(14,165,233,0.45) !important;
        }
        .carousel-card-center:hover {
          box-shadow: 0 0 0 1px rgba(14,165,233,0.6), 0 0 60px rgba(14,165,233,0.55), 0 0 120px rgba(124,58,237,0.35), 0 24px 70px rgba(0,0,0,0.7);
          border-color: rgba(14,165,233,0.75) !important;
        }
      `}</style>
      {/* Constrained 3-D stage */}
      <div className="relative max-w-7xl mx-auto">
      {/* Edge-fade overlays — replaces overflow-hidden so box-shadow glows can escape */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-20" style={{ background: 'linear-gradient(to right, var(--bg, #03030f), transparent)' }} />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-20" style={{ background: 'linear-gradient(to left, var(--bg, #03030f), transparent)' }} />
      <div
        className="relative w-full h-[580px] sm:h-[620px]"
        style={{ perspective: '1100px' }}
      >
        {PROJECTS.map((project, i) => {
          const offset = ((i - current + total) % total + Math.floor(total / 2)) % total - Math.floor(total / 2)
          const style = getCardStyle(offset)
          if (!style) return null

          const isCenter = offset === 0

          return (
            <motion.div
              key={project.id}
              className="absolute top-0 left-0 right-0 mx-auto w-full max-w-xl"
              animate={{
                x: style.x,
                scale: style.scale,
                rotateY: style.rotateY,
                z: style.z,
                opacity: style.opacity,
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 32,
                mass: 0.8,
              }}
              style={{ zIndex: style.zIndex, transformStyle: 'preserve-3d', cursor: isCenter ? 'grab' : 'pointer' }}
              drag={isCenter ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.12}
              onDragStart={() => setDragging(true)}
              onDragEnd={handleDragEnd}
              whileDrag={{ cursor: 'grabbing' }}
              onClick={() => { if (!isCenter && !dragging) go(offset > 0 ? 1 : -1) }}
            >
              {/* Card — entire card is a link */}
              <div
                className={`relative rounded-2xl carousel-card${isCenter ? ' carousel-card-center' : ''}`}
                style={{
                  background: 'rgba(6,6,22,0.97)',
                  border: isCenter
                    ? '1px solid rgba(14,165,233,0.35)'
                    : '1px solid rgba(103,232,249,0.10)',
                  boxShadow: isCenter
                    ? '0 0 60px rgba(14,165,233,0.15), 0 0 100px rgba(124,58,237,0.08), 0 24px 60px rgba(0,0,0,0.6)'
                    : '0 8px 32px rgba(0,0,0,0.4)',
                }}
              >
              {(() => {
                const inner = (
                  <>
                    {/* Image — 16:9 */}
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover object-top"
                        sizes="(max-width: 768px) 100vw, 672px"
                        draggable={false}
                      />
                      {/* overlay */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            'linear-gradient(to bottom, rgba(6,6,22,0.1) 0%, rgba(6,6,22,0.65) 100%)',
                        }}
                      />

                      {/* Top-edge gradient line */}
                      <div
                        className="absolute inset-x-0 top-0 h-[2px]"
                        style={{
                          background: isCenter
                            ? 'linear-gradient(to right, transparent, #0EA5E9, #7C3AED, transparent)'
                            : 'transparent',
                        }}
                      />

                      {/* Badges */}
                      <div className="absolute top-4 left-4 z-10 flex gap-2">
                        <span
                          className="font-mono text-[10px] px-2.5 py-1 rounded-full backdrop-blur-sm"
                          style={{
                            background: 'rgba(14,165,233,0.25)',
                            border: '1px solid rgba(14,165,233,0.5)',
                            color: '#93E6FB',
                          }}
                        >
                          {project.category}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4 z-10">
                        <span className="font-mono text-[9px] text-white/40 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded">
                          {project.industry}
                        </span>
                      </div>

                      {/* Index indicator */}
                      <div className="absolute bottom-4 right-4 z-10">
                        <span className="font-mono text-[10px] text-nebula-400/50">
                          {String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 sm:p-6">
                      <h3
                        className="font-display font-bold text-xl sm:text-2xl mb-3"
                        style={{
                          color: isCenter ? '#fff' : 'rgba(255,255,255,0.75)',
                        }}
                      >
                        {project.title}
                      </h3>
                      <p className="text-white/50 text-sm leading-relaxed mb-5">
                        {project.shortDesc}
                      </p>

                      <div className="flex items-center justify-between gap-4">
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5">
                          {project.tags.map((tag) => (
                            <span
                              key={tag}
                              className="font-mono text-xs px-2 py-0.5 rounded"
                              style={{
                                background: 'rgba(103,232,249,0.07)',
                                border: '1px solid rgba(103,232,249,0.18)',
                                color: 'rgba(103,232,249,0.7)',
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {isCenter && (
                          <span className="shrink-0 inline-flex items-center gap-1.5 font-mono text-sm text-nebula-400">
                            View Case Study
                            <ArrowRight size={13} />
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                )
                return isCenter ? (
                  <Link
                    href={`/projects/${project.slug}`}
                    draggable={false}
                    onClick={(e) => dragging && e.preventDefault()}
                    className="block rounded-2xl overflow-hidden"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div className="rounded-2xl overflow-hidden">{inner}</div>
                )
              })()}
              </div>
            </motion.div>
          )
        })}
      </div>      </div> {/* end stage */}
      {/* Arrow buttons */}
      <div className="flex items-center justify-center gap-6 mt-6">
        <motion.button
          onClick={() => go(-1)}
          className="flex items-center justify-center w-10 h-10 rounded-full border transition-colors duration-200"
          style={{
            background: 'rgba(103,232,249,0.06)',
            border: '1px solid rgba(103,232,249,0.2)',
            color: 'rgba(103,232,249,0.7)',
          }}
          whileHover={{ scale: 1.1, background: 'rgba(14,165,233,0.18)', borderColor: 'rgba(14,165,233,0.6)' }}
          whileTap={{ scale: 0.93 }}
          aria-label="Previous project"
        >
          <ChevronLeft size={18} />
        </motion.button>

        {/* Dot indicators */}
        <div className="flex gap-2">
          {PROJECTS.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i) }}
              className="transition-all duration-300 rounded-full"
              style={{
                width: i === current ? 24 : 6,
                height: 6,
                background:
                  i === current
                    ? 'linear-gradient(to right, #0EA5E9, #7C3AED)'
                    : 'rgba(103,232,249,0.25)',
              }}
              aria-label={`Go to project ${i + 1}`}
            />
          ))}
        </div>

        <motion.button
          onClick={() => go(1)}
          className="flex items-center justify-center w-10 h-10 rounded-full"
          style={{
            background: 'rgba(103,232,249,0.06)',
            border: '1px solid rgba(103,232,249,0.2)',
            color: 'rgba(103,232,249,0.7)',
          }}
          whileHover={{ scale: 1.1, background: 'rgba(14,165,233,0.18)', borderColor: 'rgba(14,165,233,0.6)' }}
          whileTap={{ scale: 0.93 }}
          aria-label="Next project"
        >
          <ChevronRight size={18} />
        </motion.button>
      </div>

      {/* Drag hint */}
      <p className="text-center font-mono text-[10px] text-white/20 mt-3 tracking-widest">
        ← DRAG OR SWIPE TO EXPLORE →
      </p>
    </div>
  )
}
