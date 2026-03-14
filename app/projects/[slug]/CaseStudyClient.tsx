'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence, type TargetAndTransition } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft, Star, CheckCircle, TrendingUp,
  AlignLeft, AlertTriangle, Lightbulb, ChevronLeft, ChevronRight, Quote,
} from 'lucide-react'
import SectionWrapper, { SectionHeader } from '@/components/SectionWrapper'
import ConstellationDecor from '@/components/ConstellationDecor'
import CTASection from '@/components/CTASection'
import { useTranslation } from '@/components/TranslationProvider'
import PhoneMockup from '@/components/PhoneMockup'

interface Project {
  slug: string
  title: string
  systemType?: string
  category: string
  industry: string
  shortDesc: string
  image: string
  images?: string[]
  overview: string
  problem: string
  solution: string
  features: string[]
  technologies: string[]
  results: { metric: string; value: string }[]
  testimonial: { quote: string; author: string; role: string }
}

const CIRCUIT_BG = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44'%3E%3Cline x1='0' y1='22' x2='16' y2='22' stroke='rgba(103,232,249,0.05)' stroke-width='0.7'/%3E%3Cline x1='28' y1='22' x2='44' y2='22' stroke='rgba(103,232,249,0.05)' stroke-width='0.7'/%3E%3Cline x1='22' y1='0' x2='22' y2='16' stroke='rgba(103,232,249,0.05)' stroke-width='0.7'/%3E%3Cline x1='22' y1='28' x2='22' y2='44' stroke='rgba(103,232,249,0.05)' stroke-width='0.7'/%3E%3Ccircle cx='22' cy='22' r='4' fill='none' stroke='rgba(103,232,249,0.09)' stroke-width='0.8'/%3E%3Ccircle cx='22' cy='22' r='1.2' fill='rgba(103,232,249,0.11)'/%3E%3Ccircle cx='0' cy='0' r='1.2' fill='rgba(103,232,249,0.05)'/%3E%3Ccircle cx='44' cy='0' r='1.2' fill='rgba(103,232,249,0.05)'/%3E%3Ccircle cx='0' cy='44' r='1.2' fill='rgba(103,232,249,0.05)'/%3E%3Ccircle cx='44' cy='44' r='1.2' fill='rgba(103,232,249,0.05)'/%3E%3C/svg%3E")`,
  backgroundSize: '44px 44px',
  maskImage: 'radial-gradient(ellipse 110% 80% at 50% 10%, black 20%, transparent 90%)',
  WebkitMaskImage: 'radial-gradient(ellipse 110% 80% at 50% 10%, black 20%, transparent 90%)',
} as React.CSSProperties

const INTERVAL_MS = 3000

// ─── Image Carousel ──────────────────────────────────────────────────────────
function ImageCarousel({ images, isMobile = false }: { images: string[]; isMobile?: boolean }) {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({})
  const [paused, setPaused] = useState(false)

  // Track remaining time so hover-resume continues from where it left off
  const remainingRef = useRef(INTERVAL_MS)
  const startRef = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const goTo = useCallback((idx: number, dir: number) => {
    setDirection(dir)
    setCurrent(idx)
  }, [])

  const next = useCallback(() => goTo((current + 1) % images.length, 1), [current, images.length, goTo])
  const prev = () => goTo((current - 1 + images.length) % images.length, -1)

  const startTimer = useCallback((delay: number) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    startRef.current = Date.now()
    timerRef.current = setTimeout(() => {
      remainingRef.current = INTERVAL_MS
      setCurrent((c) => {
        setDirection(1)
        return (c + 1) % images.length
      })
    }, delay)
  }, [images.length])

  // Auto-advance
  useEffect(() => {
    if (images.length <= 1 || paused) return
    startTimer(remainingRef.current)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [current, paused, images.length, startTimer])

  const handleMouseEnter = () => {
    remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startRef.current))
    if (timerRef.current) clearTimeout(timerRef.current)
    setPaused(true)
  }
  const handleMouseLeave = () => setPaused(false)

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
  }

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-white/8"
      style={{ aspectRatio: isMobile ? '16/9' : '16/9' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={current}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'tween', duration: 0.45, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {isMobile ? (
            images[current] && !imgErrors[current] ? (
              <PhoneMockup src={images[current]} alt={`Screenshot ${current + 1}`} />
            ) : (
              <div className="w-full h-full bg-space-800 flex items-center justify-center"><span className="font-mono text-white/15 text-sm">screenshot {current + 1}</span></div>
            )
          ) : (
            <>
              {images[current] && !imgErrors[current] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={images[current]} alt={`Screenshot ${current + 1}`} className="w-full h-full object-cover" onError={() => setImgErrors((e) => ({ ...e, [current]: true }))} />
              ) : (
                <div className="w-full h-full bg-space-800 flex items-center justify-center"><span className="font-mono text-white/15 text-sm">screenshot {current + 1}</span></div>
              )}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(5,5,16,0.7) 0%, transparent 50%)' }} />
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Prev / Next */}
      {images.length > 1 && (<>
        <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-all" style={{ background: 'rgba(5,5,16,0.6)', border: '1px solid rgba(255,255,255,0.12)' }}><ChevronLeft size={18} /></button>
        <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-all" style={{ background: 'rgba(5,5,16,0.6)', border: '1px solid rgba(255,255,255,0.12)' }}><ChevronRight size={18} /></button>
      </>)}

      {/* Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, i) => (
            <button key={i} onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i) }} className="rounded-full transition-all duration-300" style={{ width: i === current ? '24px' : '8px', height: '8px', background: i === current ? '#a78bfa' : 'rgba(255,255,255,0.25)' }} />
          ))}
        </div>
      )}

      {/* Counter + pause indicator */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 font-mono text-[11px] px-2.5 py-1 rounded-full text-white/50" style={{ background: 'rgba(5,5,16,0.55)', border: '1px solid rgba(255,255,255,0.1)' }}>
        {paused && <span className="w-1.5 h-1.5 rounded-full bg-nebula-400 animate-pulse" />}
        {current + 1} / {images.length}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CaseStudyClient({ project }: { project: Project }) {
  const { t, translations } = useTranslation()
  const images = project.images ?? (project.image ? [project.image] : [])

  // Translated project data with fallback to English prop values
  const tp = (translations.data as unknown as { projects?: Record<string, { title?: string; shortDesc?: string; overview?: string; problem?: string; solution?: string; features?: readonly string[]; results?: readonly (readonly string[])[]; testimonial?: readonly string[] }> })?.projects?.[project.slug]
  const pTitle = tp?.title ?? project.title
  const pShortDesc = tp?.shortDesc ?? project.shortDesc
  const pOverview = tp?.overview ?? project.overview
  const pProblem = tp?.problem ?? project.problem
  const pSolution = tp?.solution ?? project.solution
  const pFeatures = tp?.features ? [...tp.features] : project.features
  const pResults: (readonly string[])[] = tp?.results ? [...tp.results] : project.results.map(r => [r.metric, r.value])
  const pTestimonial: readonly string[] = tp?.testimonial ?? [project.testimonial.quote, project.testimonial.author, project.testimonial.role]

  return (
    <>
      {/* ─── Hero ──────────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-14 overflow-hidden" style={{ background: 'rgba(6,6,22,0)' }}>
        <div className="absolute inset-0 bg-dot-grid opacity-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[700px] h-60 sm:h-80 rounded-full blur-[130px] pointer-events-none" style={{ background: 'rgba(124,58,237,0.14)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <Link href="/projects" className="inline-flex items-center gap-2 font-mono text-xs text-white/35 hover:text-nebula-300 transition-colors mb-4 group">
              <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />{t('caseStudy.backLink')}
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.06 }}>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="font-mono text-[11px] px-3 py-1 rounded font-semibold tracking-wide" style={{ background: 'rgba(167,139,250,0.15)', color: '#c4b5fd', border: '1px solid rgba(167,139,250,0.35)' }}>{project.category}</span>
              <span className="font-mono text-[11px] px-3 py-1 rounded font-semibold tracking-wide" style={{ background: 'rgba(14,165,233,0.10)', color: '#7dd3fc', border: '1px solid rgba(14,165,233,0.25)' }}>{project.industry}</span>
            </div>
            <h1 className="font-display font-extrabold text-white leading-tight" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.02em' }}>{pTitle}</h1>
            {project.systemType && (
              <p className="font-mono text-2xl text-cyan-400/70 mb-6 tracking-wide">{project.systemType}</p>
            )}
            <p className="text-white/50 text-lg leading-relaxed mb-4 max-w-3xl">{pShortDesc}</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {project.technologies.map((tech) => (<span key={tech} className="font-mono text-[11px] px-3 py-1 rounded" style={{ background: 'rgba(103,232,249,0.06)', border: '1px solid rgba(103,232,249,0.15)', color: 'rgba(103,232,249,0.65)' }}>{tech}</span>))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Image Carousel ────────────────────────────────────────── */}
      {images.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 mb-4">
          <div className="max-w-4xl mx-auto">
            <ImageCarousel images={images} isMobile={project.category === 'Mobile'} />
          </div>
        </motion.div>
      )}

      {/* ─── Overview / Problem / Solution ─────────────────────────── */}
      <SectionWrapper className="bg-section-a" decoration={<ConstellationDecor name="orion" side="right" offsetY="10%" />}>
        <SectionHeader badge={t('caseStudy.overviewBadge')} title={t('caseStudy.overviewTitle')} highlight={t('caseStudy.overviewHighlight')} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {[
            { label: t('caseStudy.overviewLabel'), content: pOverview, icon: <AlignLeft size={20} className="text-nebula-400" />, accentColor: 'rgba(167,139,250,0.18)', borderColor: 'rgba(167,139,250,0.25)', textColor: '#c4b5fd', hoverBorder: 'rgba(167,139,250,0.5)', hoverGlow: 'rgba(167,139,250,0.12)' },
            { label: t('caseStudy.challengeLabel'), content: pProblem, icon: <AlertTriangle size={20} className="text-amber-400" />, accentColor: 'rgba(251,191,36,0.12)', borderColor: 'rgba(251,191,36,0.22)', textColor: '#fcd34d', hoverBorder: 'rgba(251,191,36,0.45)', hoverGlow: 'rgba(251,191,36,0.10)' },
            { label: t('caseStudy.solutionLabel'), content: pSolution, icon: <Lightbulb size={20} className="text-aurora-400" />, accentColor: 'rgba(34,211,153,0.12)', borderColor: 'rgba(34,211,153,0.22)', textColor: '#6ee7b7', hoverBorder: 'rgba(34,211,153,0.45)', hoverGlow: 'rgba(34,211,153,0.10)' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="group relative rounded-xl overflow-hidden"
              style={{ background: 'rgba(8,8,28,0.92)', border: `1px solid ${item.borderColor}` }}
              whileHover={{ y: -6, boxShadow: `0 0 32px ${item.hoverGlow}, 0 16px 40px rgba(0,0,0,0.5)`, borderColor: item.hoverBorder } as TargetAndTransition}
            >
              {/* Circuit texture */}
              <div className="absolute inset-0 pointer-events-none rounded-xl opacity-60" style={CIRCUIT_BG} />
              {/* Top scan line */}
              <div className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(to right, transparent, ${item.textColor}, transparent)` }} />
              <div className="relative p-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: item.accentColor, border: `1px solid ${item.borderColor}` }}>{item.icon}</div>
                <div className="font-mono text-[10px] mb-1 uppercase tracking-widest" style={{ color: item.textColor + 'aa' }}>{'// '}{item.label}</div>
                <h3 className="text-base font-bold text-white mb-3 group-hover:text-nebula-300 transition-colors duration-200">{item.label}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{item.content}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ─── Features ──────────────────────────────────────────────── */}
      <SectionWrapper className="bg-section-b" decoration={<ConstellationDecor name="bigdipper" side="left" offsetY="20%" />}>
        <SectionHeader badge={t('caseStudy.featuresBadge')} title={t('caseStudy.featuresTitle')} highlight={t('caseStudy.featuresHighlight')} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-4xl mx-auto">
          {pFeatures.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group relative flex items-center gap-3 rounded-xl px-5 py-4 overflow-hidden"
              style={{ background: 'rgba(12,12,32,0.7)', border: '1px solid rgba(167,139,250,0.14)' }}
              whileHover={{ y: -3, background: 'rgba(16,16,44,0.95)', borderColor: 'rgba(167,139,250,0.4)', boxShadow: '0 0 20px rgba(167,139,250,0.1), 0 8px 24px rgba(0,0,0,0.4)' } as TargetAndTransition}
            >
              <div className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to right, transparent, rgba(167,139,250,0.7), transparent)' }} />
              <CheckCircle size={16} className="text-nebula-400 shrink-0" />
              <span className="text-white/70 text-sm font-medium group-hover:text-white/90 transition-colors duration-200">{feature}</span>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ─── Results Metrics ───────────────────────────────────────── */}
      <SectionWrapper className="bg-section-a" decoration={<ConstellationDecor name="crux" side="right" offsetY="25%" />}>
        <SectionHeader badge={t('caseStudy.resultsBadge')} title={t('caseStudy.resultsTitle')} highlight={t('caseStudy.resultsHighlight')} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {pResults.map((result, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative rounded-xl overflow-hidden cursor-default"
              style={{ background: 'rgba(8,8,28,0.92)', border: '1px solid rgba(103,232,249,0.12)' }}
              whileHover={{
                y: -6,
                background: 'rgba(14,14,40,0.97)',
                boxShadow: '0 0 32px rgba(14,165,233,0.18), 0 0 64px rgba(124,58,237,0.12), 0 16px 40px rgba(0,0,0,0.5)',
                borderColor: 'rgba(14,165,233,0.35)',
              } as TargetAndTransition}
            >
              {/* Circuit texture */}
              <div className="absolute inset-0 pointer-events-none rounded-xl opacity-60" style={CIRCUIT_BG} />
              {/* Hover gradient overlay */}
              <motion.div className="absolute inset-0 rounded-xl pointer-events-none" initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} transition={{ duration: 0.3 }} style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.06) 0%, rgba(124,58,237,0.06) 100%)' }} />
              {/* Top scan line */}
              <div className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to right, transparent, rgba(14,165,233,0.8), rgba(124,58,237,0.8), transparent)' }} />
              <div className="relative p-5 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.22)' }}>
                  <TrendingUp size={18} className="text-nebula-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-gradient-nebula mb-1 leading-tight">{result[1]}</div>
                <div className="text-white/45 text-xs font-mono leading-snug">{result[0]}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ─── Testimonial ───────────────────────────────────────────── */}
      <SectionWrapper className="bg-section-b" decoration={<ConstellationDecor name="gemini" side="left" offsetY="30%" />}>
        {/* Ambient glows */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(124,58,237,0.09) 0%, transparent 100%)' }} />
        <div className="pointer-events-none absolute left-[-10%] top-1/3 w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="pointer-events-none absolute right-[-10%] bottom-1/4 w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <SectionHeader badge={t('caseStudy.testimonialBadge')} title={t('caseStudy.testimonialTitle')} highlight={t('caseStudy.testimonialHighlight')} />
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 260, damping: 22, mass: 0.9 }}
            className="relative rounded-2xl p-8 sm:p-10 overflow-hidden"
            style={{
              background: 'rgba(6,6,22,0.97)',
              border: '1px solid rgba(14,165,233,0.2)',
              boxShadow: '0 0 60px rgba(14,165,233,0.08), 0 0 100px rgba(124,58,237,0.05), 0 24px 60px rgba(0,0,0,0.5)',
            }}
          >
            {/* Corner glows */}
            <div className="pointer-events-none absolute -top-10 -left-10 w-48 h-48 rounded-full" style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)' }} />
            <div className="pointer-events-none absolute -bottom-10 -right-10 w-48 h-48 rounded-full" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 70%)' }} />
            {/* Top accent line */}
            <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl" style={{ background: 'linear-gradient(to right, transparent, #0EA5E9, #7C3AED, transparent)' }} />
            {/* Quote watermark */}
            <div className="absolute top-5 right-7" style={{ opacity: 0.06 }}>
              <Quote size={100} className="text-nebula-400" />
            </div>
            {/* Stars */}
            <div className="flex gap-1 mb-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07, type: 'spring', stiffness: 400, damping: 14 }}>
                  <Star size={16} className="text-yellow-400 fill-yellow-400" />
                </motion.div>
              ))}
            </div>
            {/* Quote text */}
            <p className="text-white/80 text-base sm:text-lg leading-relaxed mb-8 italic relative z-10">
              &ldquo;{pTestimonial[0]}&rdquo;
            </p>
            {/* Author row */}
            <div className="flex items-center gap-4 relative z-10">
             
              <div>
                <div className="font-bold text-white">{pTestimonial[1]}</div>
                <div className="font-mono text-xs text-nebula-400/70 mt-0.5">{pTestimonial[2]}</div>
              </div>
              <div className="ml-auto shrink-0">
                <span className="font-mono text-[10px] px-3 py-1 rounded-full" style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}>
                  {pTestimonial[2].includes(',') ? pTestimonial[2].split(',').slice(1).join(',').trim() : project.category}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </SectionWrapper>

      <CTASection title={t('caseStudy.ctaTitle')} subtitle={t('caseStudy.ctaSubtitle')} primaryBtn={{ label: t('caseStudy.ctaPrimaryBtn'), href: '/contact' }} secondaryBtn={{ label: t('caseStudy.ctaSecondaryBtn'), href: '/projects' }} />
    </>
  )
}