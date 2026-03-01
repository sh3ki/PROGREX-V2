'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowRight, ChevronLeft, ChevronRight,
  Code2, Globe, Smartphone, BookOpen, Server, Cpu,
  Database, Layers, Wifi, BrainCircuit, Zap, Rocket, Palette, Shield,
} from 'lucide-react'

// ── Icon map ─────────────────────────────────────────────────────────────────
function getServiceIcon(slug: string, size = 26) {
  const cls = 'text-nebula-300'
  const map: Record<string, React.ReactNode> = {
    'custom-software-development':       <Code2 size={size} className={cls} />,
    'web-development':                   <Globe size={size} className={cls} />,
    'mobile-app-development':            <Smartphone size={size} className={cls} />,
    'it-consulting-infrastructure':      <Server size={size} className={cls} />,
    'system-integration':                <Database size={size} className={cls} />,
    'academic-capstone-system-development': <Layers size={size} className={cls} />,
    'hardware-integration':              <Wifi size={size} className={cls} />,
    'ai-machine-learning':               <BrainCircuit size={size} className={cls} />,
    'business-automation':               <Zap size={size} className={cls} />,
    'deployment-hosting-services':       <Rocket size={size} className={cls} />,
    'ui-ux-design':                      <Palette size={size} className={cls} />,
    'cybersecurity-data-protection':     <Shield size={size} className={cls} />,
    'training-workshops':                <BookOpen size={size} className={cls} />,
  }
  return map[slug] ?? <Cpu size={size} className={cls} />
}

// ── Circuit texture ────────────────────────────────────────────────────────────
const circuitBg: React.CSSProperties = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44'%3E%3Cline x1='0' y1='22' x2='16' y2='22' stroke='rgba(103,232,249,0.06)' stroke-width='0.7'/%3E%3Cline x1='28' y1='22' x2='44' y2='22' stroke='rgba(103,232,249,0.06)' stroke-width='0.7'/%3E%3Cline x1='22' y1='0' x2='22' y2='16' stroke='rgba(103,232,249,0.06)' stroke-width='0.7'/%3E%3Cline x1='22' y1='28' x2='22' y2='44' stroke='rgba(103,232,249,0.06)' stroke-width='0.7'/%3E%3Ccircle cx='22' cy='22' r='4' fill='none' stroke='rgba(103,232,249,0.09)' stroke-width='0.8'/%3E%3Ccircle cx='22' cy='22' r='1.2' fill='rgba(103,232,249,0.11)'/%3E%3Ccircle cx='0' cy='0' r='1.2' fill='rgba(103,232,249,0.05)'/%3E%3Ccircle cx='44' cy='0' r='1.2' fill='rgba(103,232,249,0.05)'/%3E%3Ccircle cx='0' cy='44' r='1.2' fill='rgba(103,232,249,0.05)'/%3E%3Ccircle cx='44' cy='44' r='1.2' fill='rgba(103,232,249,0.05)'/%3E%3C/svg%3E\")",
  backgroundSize: '44px 44px',
}

// ── Per-card transform based on distance from center ─────────────────────────
function getCardTransform(offset: number) {
  const abs = Math.abs(offset)
  const sign = Math.sign(offset)

  if (abs === 0) {
    return { scale: 1, x: 0, zIndex: 20, opacity: 1, rotateY: 0, blur: 0 }
  }
  if (abs === 1) {
    return { scale: 0.78, x: sign * 310, zIndex: 10, opacity: 0.62, rotateY: sign * -14, blur: 1 }
  }
  if (abs === 2) {
    return { scale: 0.60, x: sign * 530, zIndex: 5, opacity: 0.28, rotateY: sign * -22, blur: 3 }
  }
  // Hidden
  return { scale: 0.48, x: sign * 680, zIndex: 1, opacity: 0, rotateY: sign * -28, blur: 6 }
}

interface ServiceItem {
  id: string
  slug: string
  title: string
  shortDesc: string
  icon: string
  color: string
}

interface ServiceCarouselProps {
  services: ServiceItem[]
}

// ── Inner card content ────────────────────────────────────────────────────────
function CardInner({ svc, index, isCenter }: { svc: ServiceItem; index: number; isCenter: boolean }) {
  return (
    <>
      {/* Index + icon row */}
      <div className="flex items-start justify-between mb-6">
        <span className="font-mono text-[10px] text-nebula-400/50 tracking-widest">
          {'// SVC_' + String(index + 1).padStart(2, '0')}
        </span>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: isCenter ? 'rgba(14,165,233,0.16)' : 'rgba(103,232,249,0.07)',
            border: isCenter ? '1px solid rgba(14,165,233,0.4)' : '1px solid rgba(103,232,249,0.15)',
            boxShadow: isCenter ? '0 0 20px rgba(14,165,233,0.25)' : 'none',
          }}
        >
          {getServiceIcon(svc.slug, isCenter ? 26 : 22)}
        </div>
      </div>
      {/* Title */}
      <h3
        className="font-display font-bold leading-snug mb-3"
        style={{ fontSize: isCenter ? '1.35rem' : '1.05rem', color: isCenter ? '#fff' : 'rgba(255,255,255,0.7)' }}
      >
        {svc.title}
      </h3>
      {/* Description */}
      <p className="text-sm leading-relaxed mb-auto" style={{ color: isCenter ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.3)' }}>
        {svc.shortDesc}
      </p>
      {/* CTA hint on center */}
      {isCenter && (
        <div className="mt-6 inline-flex items-center gap-2 font-mono text-sm text-nebula-400 group-hover:text-nebula-200 transition-colors">
          View Details
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </div>
      )}
    </>
  )
}

export default function ServiceCarousel({ services }: ServiceCarouselProps) {
  const [active, setActive] = useState(0)
  const [dragging, setDragging] = useState(false)
  const total = services.length

  const go = useCallback(
    (delta: number) => {
      setActive((prev) => (prev + delta + total) % total)
    },
    [total],
  )

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setDragging(false)
      const threshold = 60
      if (info.offset.x < -threshold) go(1)
      else if (info.offset.x > threshold) go(-1)
    },
    [go],
  )

  // Visible range: active ±3
  const visibleIndices = Array.from({ length: total }, (_, i) => {
    const offset = ((i - active + total) % total + total) % total
    const normalized = offset > total / 2 ? offset - total : offset
    return { i, offset: normalized }
  }).filter(({ offset }) => Math.abs(offset) <= 2)

  const centerService = services[active]

  return (
    <div className="relative select-none">
      {/* ── Carousel stage ───────────────────────────────────────────────── */}
      <div
        className="relative mx-auto overflow-hidden"
        style={{ height: 420, maxWidth: 1100, perspective: '1200px' }}
      >
        {/* Edge fade masks */}
        <div className="absolute inset-y-0 left-0 w-28 z-30 pointer-events-none"
          style={{ background: 'linear-gradient(to right, rgba(6,6,22,1) 0%, transparent 100%)' }} />
        <div className="absolute inset-y-0 right-0 w-28 z-30 pointer-events-none"
          style={{ background: 'linear-gradient(to left, rgba(6,6,22,1) 0%, transparent 100%)' }} />

        {/* Cards */}
        {visibleIndices.map(({ i, offset }) => {
          const svc = services[i]
          const t = getCardTransform(offset)
          const isCenter = offset === 0

          return (
            <motion.div
              key={svc.id}
              className="absolute top-1/2 left-1/2"
              style={{ width: 340, marginLeft: -170, marginTop: -210, cursor: isCenter ? 'grab' : 'pointer' }}
              animate={{
                x: t.x,
                scale: t.scale,
                opacity: t.opacity,
                rotateY: t.rotateY,
                filter: `blur(${t.blur}px)`,
                zIndex: t.zIndex,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              drag={isCenter ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.12}
              onDragStart={() => setDragging(true)}
              onDragEnd={handleDragEnd}
              whileDrag={{ cursor: 'grabbing' }}
              onClick={() => { if (!isCenter && !dragging) go(offset > 0 ? 1 : -1) }}
            >
              <div
                className="relative rounded-2xl overflow-hidden h-105 flex flex-col"
                style={{
                  background: isCenter ? 'rgba(10,10,36,0.98)' : 'rgba(8,8,28,0.88)',
                  border: isCenter
                    ? '1px solid rgba(14,165,233,0.45)'
                    : '1px solid rgba(103,232,249,0.1)',
                  boxShadow: isCenter
                    ? '0 0 60px rgba(14,165,233,0.18), 0 0 120px rgba(124,58,237,0.1), 0 24px 60px rgba(0,0,0,0.7)'
                    : '0 8px 24px rgba(0,0,0,0.4)',
                }}
              >
                {/* Circuit texture */}
                <div className="absolute inset-0 pointer-events-none" style={circuitBg} />

                {/* Top scan line — always visible on center */}
                <div
                  className="absolute inset-x-0 top-0 h-px"
                  style={{
                    background: 'linear-gradient(to right, transparent, rgba(14,165,233,0.9), rgba(124,58,237,0.7), transparent)',
                    opacity: isCenter ? 1 : 0,
                  }}
                />

                {/* Ambient glow behind icon */}
                {isCenter && (
                  <div
                    className="absolute top-6 right-6 w-24 h-24 rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.18) 0%, transparent 70%)' }}
                  />
                )}

                {isCenter ? (
                  <Link
                    href={`/services/${svc.slug}`}
                    draggable={false}
                    onClick={(e) => dragging && e.preventDefault()}
                    className="group relative flex flex-col h-full p-7 no-underline"
                  >
                    <CardInner svc={svc} index={i} isCenter />
                  </Link>
                ) : (
                  <div className="relative flex flex-col h-full p-7">
                    <CardInner svc={svc} index={i} isCenter={false} />
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ── Nav arrows ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-6 mt-8">
        <motion.button
          onClick={() => go(-1)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.93 }}
          className="w-11 h-11 rounded-full flex items-center justify-center border transition-all duration-200"
          style={{
            background: 'rgba(14,165,233,0.08)',
            borderColor: 'rgba(14,165,233,0.3)',
            color: 'rgba(103,232,249,0.8)',
          }}
          aria-label="Previous service"
        >
          <ChevronLeft size={20} />
        </motion.button>

        {/* Dot indicators */}
        <div className="flex gap-2 items-center">
          {services.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => { setActive(i) }}
              animate={{
                width: i === active ? 24 : 6,
                background: i === active ? '#0EA5E9' : 'rgba(103,232,249,0.25)',
              }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="h-1.5 rounded-full"
              aria-label={`Go to service ${i + 1}`}
            />
          ))}
        </div>

        <motion.button
          onClick={() => go(1)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.93 }}
          className="w-11 h-11 rounded-full flex items-center justify-center border transition-all duration-200"
          style={{
            background: 'rgba(14,165,233,0.08)',
            borderColor: 'rgba(14,165,233,0.3)',
            color: 'rgba(103,232,249,0.8)',
          }}
          aria-label="Next service"
        >
          <ChevronRight size={20} />
        </motion.button>
      </div>

      {/* ── Active service info beneath (mobile-friendly) ─────────────── */}
      <div className="text-center mt-4">
        <AnimatePresence mode="wait">
          <motion.p
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="font-mono text-[11px] text-nebula-400/50 tracking-widest uppercase"
          >
            {active + 1} / {total} — {centerService.title}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}
