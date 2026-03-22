'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from '@/components/TranslationProvider'
import PhoneMockup from '@/components/PhoneMockup'

const PROJECTS = [
  {
    id: 1,
    slug: 'pup-aaccup',
    title: 'PUP Accreditation System',
    systemType: 'Accreditation Document and Records System',
    category: 'Academic',
    industry: 'Education',
    tags: ['Laravel', 'React', 'MySQL'],
    image: 'https://res.cloudinary.com/dlu2bqrda/image/upload/v1773226929/1_j8r7dc.png',
    shortDesc:
      'Accreditation document and records platform for schools, with centralized compliance files, workflow routing, and audit-ready reports.',
  },
  {
    id: 2,
    slug: 'protech-detect-to-protect',
    title: 'Protech: Detect to Protect',
    systemType: 'Face Recognition School Monitoring System',
    category: 'AI/ML',
    industry: 'Education Security',
    tags: ['Python', 'Django', 'PostgreSQL'],
    image: 'https://res.cloudinary.com/dlu2bqrda/image/upload/v1773997018/1_hawmsx.png',
    shortDesc:
      'AI-enabled campus monitoring platform with facial recognition, attendance logs, and incident alerts for safer school operations.',
  },
  {
    id: 3,
    slug: 'habitforge-app',
    title: 'HabitForge',
    systemType: 'Habit Tracking and Routine App',
    category: 'Mobile',
    industry: 'Productivity',
    tags: ['Flutter', 'Supabase', 'Dart'],
    image: 'https://res.cloudinary.com/dlu2bqrda/image/upload/v1773982046/2_oinafj.png',
    shortDesc:
      'Habit and routine tracker built for long-term behavior change with streak analytics and smart reminder logic.',
  },
  {
    id: 4,
    slug: 'fredos-grilling-pos',
    title: 'Fredo\'s Grilling',
    systemType: 'POS, Sales and Inventory Management System',
    category: 'Enterprise',
    industry: 'Food and Beverage',
    tags: ['Laravel', 'React', 'MySQL'],
    image: 'https://res.cloudinary.com/dlu2bqrda/image/upload/v1772851619/1_avvvyf.png',
    shortDesc:
      'Restaurant operations system combining POS, inventory tracking, and sales analytics for fast-moving food service teams.',
  },
  {
    id: 5,
    slug: 'tbs-container',
    title: 'TBS Container',
    systemType: 'Shipping Container Management System',
    category: 'Enterprise',
    industry: 'Logistics',
    tags: ['Laravel', 'React', 'MySQL'],
    image: 'https://res.cloudinary.com/dlu2bqrda/image/upload/v1772851669/2_xiyuoh.png',
    shortDesc:
      'Container tracking and dispatch system for logistics operators, with status dashboards and movement audit history.',
  },
  {
    id: 6,
    slug: 'nikes-catering-web',
    title: 'Nike\'s Catering Services Web',
    systemType: 'Catering Ordering and Booking Web System',
    category: 'AI/ML',
    industry: 'Food Services',
    tags: ['Python', 'Django', 'PostgreSQL'],
    image: 'https://res.cloudinary.com/dlu2bqrda/image/upload/v1772907648/1_cyu7ne.png',
    shortDesc:
      'Booking and order management system for catering operations with client workflows, schedule handling, and service dashboards.',
  },
  {
    id: 7,
    slug: 'pocketpulse-app',
    title: 'PocketPulse',
    systemType: 'Personal Finance and Budgeting App',
    category: 'Mobile',
    industry: 'Fintech',
    tags: ['Kotlin', 'Compose', 'Firebase'],
    image: 'https://res.cloudinary.com/dlu2bqrda/image/upload/v1773982120/2_liyxyi.png',
    shortDesc:
      'Native Android budgeting app that tracks spending, account balances, and monthly financial health with offline-first reliability.',
  },
  {
    id: 8,
    slug: 'premio-motor-loan',
    title: 'Premio',
    systemType: 'Motor Loan and Appointment Management System',
    category: 'E-commerce',
    industry: 'Automotive Retail',
    tags: ['Laravel', 'Vue', 'MySQL'],
    image: 'https://res.cloudinary.com/dlu2bqrda/image/upload/v1772851637/1_fmdit1.png',
    shortDesc:
      'Motor loan application and appointment platform that improves dealership processing speed and applicant visibility.',
  },
  {
    id: 9,
    slug: 'streamrock-realty',
    title: 'Streamrock Realty',
    systemType: 'Real Estate Listings and Management Platform',
    category: 'Web',
    industry: 'Real Estate',
    tags: ['React', 'Node.js', 'MongoDB'],
    image: 'https://res.cloudinary.com/dlu2bqrda/image/upload/v1773226961/1_yrwjhf.png',
    shortDesc:
      'Modern MERN platform for property listings, search filters, and inquiry workflows across multiple property categories.',
  },
  {
    id: 10,
    slug: 'tradeloop-app',
    title: 'TradeLoop',
    systemType: 'Peer-to-Peer Marketplace App',
    category: 'Mobile',
    industry: 'E-Commerce Marketplace',
    tags: ['Flutter', 'Supabase', 'Dart'],
    image: 'https://res.cloudinary.com/dlu2bqrda/image/upload/v1773982159/2_bimfaa.png',
    shortDesc:
      'Local marketplace app for buying, selling, and trading second-hand items with structured offers and in-app deal chat.',
  },
  {
    id: 11,
    slug: 'rmdc-dental-clinic',
    title: 'RMDC',
    systemType: 'Dental Clinic Management System',
    category: 'Enterprise',
    industry: 'Healthcare',
    tags: ['Laravel', 'MySQL', 'Tailwind CSS'],
    image: 'https://res.cloudinary.com/dlu2bqrda/image/upload/v1773220346/1_mqpgr3.png',
    shortDesc:
      'Comprehensive dental clinic platform for appointments, patient records, inventory, payments, and real-time notifications.',
  },
  {
    id: 12,
    slug: 'savora-app',
    title: 'Savora',
    systemType: 'Recipe and Meal Planning App',
    category: 'Mobile',
    industry: 'Food and Lifestyle',
    tags: ['Flutter', 'Appwrite', 'Dart'],
    image: 'https://res.cloudinary.com/dlu2bqrda/image/upload/v1773982131/2_j5wfva.png',
    shortDesc:
      'Recipe discovery and meal planning app that turns saved dishes into structured weekly plans and shopping flows.',
  },
  {
    id: 13,
    slug: 'aniki-figures',
    title: 'Aniki Figures',
    systemType: 'Premium Anime Figure E-Commerce Platform',
    category: 'Web',
    industry: 'Retail and Collectibles',
    tags: ['Next.js', 'Express', 'MongoDB'],
    image: 'https://res.cloudinary.com/dlu2bqrda/image/upload/v1773219902/1_njmh8v.png',
    shortDesc:
      'Specialized anime collectibles storefront with advanced discovery, pre-orders, and account-based checkout workflows.',
  },
]

type FeaturedProject = {
  id: string | number
  slug: string
  title: string
  systemType: string
  category: string | string[]
  industry: string
  tags: string[]
  image: string
  shortDesc: string
}

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

export default function FeaturedProjectsCarousel({ projectsData }: { projectsData?: FeaturedProject[] }) {
  const { t, translations } = useTranslation()
  const [current, setCurrent] = useState(0)
  const [dragging, setDragging] = useState(false)

  const tp = translations.data.featuredProjects as Record<string, { title: string; shortDesc: string }>
  const projects = projectsData && projectsData.length > 0 ? projectsData : PROJECTS
  const total = projects.length

  const go = useCallback(
    (delta: number) => {
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
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-20"  />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-20"  />
      <div
        className="relative w-full h-145 sm:h-155"
        style={{ perspective: '1100px' }}
      >
        {projects.map((project, i) => {
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
                    <div className="relative aspect-video overflow-hidden">
                      {Array.isArray(project.category) ? project.category.includes('Mobile') : project.category === 'Mobile' ? (
                        <PhoneMockup src={project.image} alt={tp[project.slug]?.title ?? project.title} />
                      ) : (
                        <>
                          <Image
                            src={project.image}
                            alt={tp[project.slug]?.title ?? project.title}
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
                        </>
                      )}

                      {/* Top-edge gradient line */}
                      <div
                        className="absolute inset-x-0 top-0 h-0.5"
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
                          {Array.isArray(project.category) ? project.category.join(', ') : project.category}
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
                        className="font-display font-bold text-xl sm:text-2xl mb-0.5"
                        style={{
                          color: isCenter ? '#fff' : 'rgba(255,255,255,0.75)',
                        }}
                      >
                        {tp[project.slug]?.title ?? project.title}
                      </h3>
                      {project.systemType && (
                        <p className="font-mono text-base text-cyan-400/60 mb-3 tracking-wide">{project.systemType}</p>
                      )}
                      <p className="text-white/50 text-sm leading-relaxed mb-5">
                        {tp[project.slug]?.shortDesc ?? project.shortDesc}
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
                            {t('common.viewCaseStudy')}
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
              onClick={() => setCurrent(i)}
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
        {t('common.dragHint')}
      </p>
    </div>
  )
}
