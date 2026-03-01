'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Star, Quote, ChevronLeft, ChevronRight, Monitor, Check, Send, CheckCircle, Bot } from 'lucide-react'
import Image from 'next/image'
import TechConstellation from '@/components/TechConstellation'
import Hero from '@/components/Hero'
import ConstellationDecor from '@/components/ConstellationDecor'
import ServiceCard from '@/components/ServiceCard'
import FeaturedProjectsCarousel from '@/components/FeaturedProjectsCarousel'
import TechMarqueeSection from '@/components/TechMarqueeSection'
import SectionWrapper, { SectionHeader } from '@/components/SectionWrapper'
import { services, systems, testimonials, faqs } from '@/lib/mockData'

function CtaSelect({ value, onChange, options, placeholder }: {
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/4 border text-sm transition-all text-left"
        style={{ borderColor: open ? 'rgba(14,165,233,0.5)' : 'rgba(103,232,249,0.15)' }}
      >
        <span className={value ? 'text-white/90' : 'text-slate-500'}>{value || placeholder}</span>
        <svg style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="rgba(103,232,249,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -6, scaleY: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              transformOrigin: 'top',
              background: 'rgba(6,6,22,0.99)',
              border: '1px solid rgba(14,165,233,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(14,165,233,0.06)',
            }}
            className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden py-1"
          >
            {options.map((opt) => (
              <li key={opt}>
                <button
                  type="button"
                  onClick={() => { onChange(opt); setOpen(false) }}
                  className="w-full text-left px-4 py-2 text-sm transition-colors"
                  style={{
                    color: value === opt ? '#67E8F9' : 'rgba(255,255,255,0.7)',
                    background: value === opt ? 'rgba(14,165,233,0.1)' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (value !== opt) {
                      e.currentTarget.style.background = 'rgba(14,165,233,0.07)'
                      e.currentTarget.style.color = '#fff'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = value === opt ? 'rgba(14,165,233,0.1)' : 'transparent'
                    e.currentTarget.style.color = value === opt ? '#67E8F9' : 'rgba(255,255,255,0.7)'
                  }}
                >
                  {opt}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function HomeClient() {
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [direction, setDirection] = useState(1)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const [ctaForm, setCtaForm] = useState({ name: '', email: '', phone: '', company: '', service: '', budget: '', message: '' })
  const [ctaErrors, setCtaErrors] = useState<{ name?: string; email?: string; message?: string }>({})
  const [ctaLoading, setCtaLoading] = useState(false)
  const [ctaSubmitted, setCtaSubmitted] = useState(false)

  const ctaServices = [
    'Custom Software Development', 'Web Development', 'Mobile App Development',
    'System Integration', 'Academic / Capstone System', 'IT Consulting',
    'Ready-Made System', 'Other',
  ]

  const handleCtaSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: typeof ctaErrors = {}
    if (!ctaForm.name.trim()) errs.name = 'Name is required'
    if (!ctaForm.email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ctaForm.email)) errs.email = 'Invalid email'
    if (!ctaForm.message.trim()) errs.message = 'Message is required'
    setCtaErrors(errs)
    if (Object.keys(errs).length > 0) return
    setCtaLoading(true)
    await new Promise((res) => setTimeout(res, 1500))
    setCtaLoading(false)
    setCtaSubmitted(true)
  }
  const DURATION = 7 // seconds auto-advance

  const goTo = (i: number) => {
    setDirection(i > activeTestimonial ? 1 : -1)
    setActiveTestimonial(i)
  }
  const prevTestimonial = () => {
    const i = (activeTestimonial - 1 + testimonials.length) % testimonials.length
    setDirection(-1)
    setActiveTestimonial(i)
  }
  const nextTestimonial = () => {
    const i = (activeTestimonial + 1) % testimonials.length
    setDirection(1)
    setActiveTestimonial(i)
  }

  useEffect(() => {
    const id = setInterval(() => {
      setDirection(1)
      setActiveTestimonial((p) => (p + 1) % testimonials.length)
    }, DURATION * 1000)
    return () => clearInterval(id)
  }, [DURATION])

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <Hero
        badge="Next-Gen Technology Solutions"
        title="TECHNOLOGY SOLUTIONS"
        highlight="THAT DRIVES SUCCESS."
        highlightNewLine
        subtitleLabel="BUILD FASTER. SCALE SMARTER. WIN WITH PROGREX."
        subtitle="We engineer custom software, web apps, mobile platforms, and enterprise systems that transform your business."
        primaryBtn={{ label: 'Get a Quote', href: '/contact' }}
        secondaryBtn={{ label: 'View Projects', href: '/projects' }}
        showStats
      />

      {/* ── SERVICES PREVIEW ─────────────────────────────────────────────── */}
      <SectionWrapper className="bg-section-a" decoration={<ConstellationDecor name="orion" side="right" offsetY="10%" />}>
        {/* Ambient top glow */}
        <div className="absolute inset-x-0 top-0 h-64 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(14,165,233,0.07) 0%, transparent 100%)' }} />

        <SectionHeader
          badge="What We Build"
          title="Comprehensive Technology"
          highlight="Services"
          subtitle="From custom software to enterprise systems — we deliver efficient solutions that scale with your ambitions."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.slice(0, 6).map((service, i) => (
            <ServiceCard
              key={service.id}
              title={service.title}
              shortDesc={service.shortDesc.split('. ')[0] + '.'}
              icon={service.icon}
              slug={service.slug}
              color={service.color}
              index={i}
            />
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <div className="flex justify-center gap-2 mb-6">
            {[...Array(3)].map((_, i) => (
              <span key={i} className="w-1 h-1 rounded-full bg-nebula-400/30" />
            ))}
          </div>
          <Link href="/services" className="btn-outline inline-flex">
            Explore All Services <ArrowRight size={16} />
          </Link>
        </motion.div>
      </SectionWrapper>

      {/* ── FEATURED PROJECTS ────────────────────────────────────────────── */}
      <SectionWrapper className="bg-section-b" decoration={<ConstellationDecor name="bigdipper" side="left" offsetY="15%" />}>
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
        {/* Ambient glow */}
        <div className="absolute inset-x-0 top-0 h-72 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(124,58,237,0.07) 0%, transparent 100%)' }} />

        <SectionHeader
          badge="Our Work"
          title="Featured"
          highlight="Projects"
          subtitle="Real-world solutions with measurable impact that drive efficiency, growth, and lasting value. See what we’ve successfully built and delivered for our clients."
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <FeaturedProjectsCarousel />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-10"
        >
          <Link href="/projects" className="btn-outline inline-flex">
            View All Projects <ArrowRight size={16} />
          </Link>
        </motion.div>
      </SectionWrapper>

      {/* ── READY-MADE SYSTEMS ───────────────────────────────────────────── */}
      <SectionWrapper className="bg-section-a" decoration={<ConstellationDecor name="cassiopeia" side="right" offsetY="20%" />}>
        {/* Ambient glow */}
        <div className="absolute inset-x-0 top-0 h-64 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(14,165,233,0.06) 0%, transparent 100%)' }} />
        <SectionHeader
          badge="Ready-Made Systems"
          title="Ready-Made"
          highlight="Business Systems"
          subtitle="Pre-built, production-ready software systems. Fully customizable to fit your needs and budget - deploy in days, not months."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {systems.map((sys, i) => (
            <motion.div
              key={sys.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link
                href={`/ready-made-systems#${sys.slug}`}
                className="block rounded-2xl overflow-hidden group"
                style={{
                  background: 'rgba(6,6,22,0.97)',
                  border: '1px solid rgba(103,232,249,0.12)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  transition: 'border-color 0.25s, box-shadow 0.25s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(14,165,233,0.5)'
                  ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 0 1px rgba(14,165,233,0.25), 0 0 40px rgba(14,165,233,0.22), 0 0 80px rgba(124,58,237,0.12), 0 16px 48px rgba(0,0,0,0.55)'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(103,232,249,0.12)'
                  ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)'
                }}
              >
                {/* 16:9 image */}
                <div className="relative aspect-[16/9] overflow-hidden">
                  {sys.image ? (
                    <>
                      <Image
                        src={sys.image}
                        alt={sys.name}
                        fill
                        className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(3,3,15,0.08) 0%, rgba(3,3,15,0.60) 100%)' }} />
                      <div className="absolute inset-x-0 top-0 h-[2px]" style={{ background: 'linear-gradient(to right, transparent, #0EA5E9, #7C3AED, transparent)' }} />
                      {/* Category badge — top left */}
                      <div className="absolute top-3 left-3 z-10">
                        <span className="font-mono text-[10px] px-2.5 py-1 rounded-full backdrop-blur-sm"
                          style={{ background: 'rgba(14,165,233,0.25)', border: '1px solid rgba(14,165,233,0.5)', color: '#93E6FB' }}
                        >
                          {sys.category}
                        </span>
                      </div>
                      {/* Industry badge — top right */}
                      <div className="absolute top-3 right-3 z-10">
                        <span className="font-mono text-[9px] text-white/40 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded">
                          {sys.industry}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <span className="font-mono text-[10px] px-2.5 py-1 rounded-full backdrop-blur-sm"
                          style={{ background: 'rgba(14,165,233,0.22)', border: '1px solid rgba(14,165,233,0.45)', color: '#93E6FB' }}
                        >
                          {sys.name.split('—')[0].trim()}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-space-800 flex items-center justify-center">
                      <Monitor size={28} className="text-nebula-600/50" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-nebula-300 transition-colors line-clamp-1">{sys.name}</h3>
                  <p className="text-slate-400 text-base mb-4 line-clamp-2">{sys.shortDesc}</p>
                  <ul className="space-y-1.5 mb-5">
                    {sys.features.slice(0, 4).map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-slate-400">
                        <Check size={13} className="text-nebula-400 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <span className="inline-flex items-center gap-1.5 font-mono text-sm text-nebula-400 group-hover:text-nebula-200 transition-colors">
                    Learn More <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link href="/ready-made-systems" className="btn-primary inline-flex text-sm px-6 py-3">
            <span>Browse All Systems</span> <ArrowRight size={16} />
          </Link>
        </motion.div>
      </SectionWrapper>

      {/* ── TECHNOLOGIES ─────────────────────────────────────────────────── */}
      <SectionWrapper className="bg-section-b" decoration={<ConstellationDecor name="leo" side="left" offsetY="25%" />}>
        <SectionHeader
          badge="Our Stack"
          title="Technologies We"
          highlight="Master"
          subtitle="From programming languages to cloud platforms — the full stack we use to build scalable, high-performance solutions across web, mobile, and beyond."
        />
        <TechMarqueeSection />
      </SectionWrapper>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <SectionWrapper className="bg-section-a" decoration={<ConstellationDecor name="crux" side="right" offsetY="30%" />}>
        {/* Ambient glows */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(124,58,237,0.09) 0%, transparent 100%)' }} />
        <div className="pointer-events-none absolute left-[-10%] top-1/3 w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="pointer-events-none absolute right-[-10%] bottom-1/4 w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)', filter: 'blur(40px)' }} />

        <SectionHeader
          badge="Client Stories"
          title="What Our Clients"
          highlight="Say"
          subtitle="Don't take our word for it — hear from the businesses we've transformed."
        />

        <div className="max-w-3xl mx-auto">
          {/* Card */}
          <div className="relative overflow-hidden rounded-2xl" style={{ minHeight: 320 }}>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={activeTestimonial}
                custom={direction}
                variants={{
                  enter: (d: number) => ({ x: d * 80, opacity: 0, filter: 'blur(6px)' }),
                  center: { x: 0, opacity: 1, filter: 'blur(0px)' },
                  exit: (d: number) => ({ x: d * -80, opacity: 0, filter: 'blur(6px)' }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
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
                {/* Decorative quote */}
                <div className="absolute top-5 right-7" style={{ opacity: 0.06 }}>
                  <Quote size={100} className="text-nebula-400" />
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: testimonials[activeTestimonial].rating }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.07, type: 'spring', stiffness: 400, damping: 14 }}
                    >
                      <Star size={16} className="text-yellow-400 fill-yellow-400" />
                    </motion.div>
                  ))}
                </div>

                {/* Quote text */}
                <p className="text-white/80 text-base sm:text-lg leading-relaxed mb-8 italic relative z-10">
                  &ldquo;{testimonials[activeTestimonial].quote}&rdquo;
                </p>

                {/* Author row */}
                <div className="flex items-center gap-4 relative z-10">
                  <div>
                    <div className="font-bold text-white">{testimonials[activeTestimonial].name}</div>
                    <div className="font-mono text-xs text-nebula-400/70 mt-0.5">{testimonials[activeTestimonial].role}</div>
                  </div>
                  <div className="ml-auto shrink-0">
                    <span
                      className="font-mono text-[10px] px-3 py-1 rounded-full"
                      style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}
                    >
                      {testimonials[activeTestimonial].company}
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <motion.button
              onClick={prevTestimonial}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(103,232,249,0.06)', border: '1px solid rgba(103,232,249,0.2)', color: 'rgba(103,232,249,0.7)' }}
              whileHover={{ scale: 1.1, background: 'rgba(14,165,233,0.18)' }}
              whileTap={{ scale: 0.9 }}
              aria-label="Previous"
            >
              <ChevronLeft size={18} />
            </motion.button>

            <div className="flex gap-1.5 flex-wrap justify-center">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === activeTestimonial ? 24 : 6,
                    height: 6,
                    background: i === activeTestimonial
                      ? 'linear-gradient(to right, #0EA5E9, #7C3AED)'
                      : 'rgba(103,232,249,0.25)',
                  }}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>

            <motion.button
              onClick={nextTestimonial}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(103,232,249,0.06)', border: '1px solid rgba(103,232,249,0.2)', color: 'rgba(103,232,249,0.7)' }}
              whileHover={{ scale: 1.1, background: 'rgba(14,165,233,0.18)' }}
              whileTap={{ scale: 0.9 }}
              aria-label="Next"
            >
              <ChevronRight size={18} />
            </motion.button>
          </div>

          {/* Counter */}
          <p className="text-center font-mono text-[11px] text-white/25 mt-3 tracking-widest">
            {String(activeTestimonial + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
          </p>
        </div>
      </SectionWrapper>

      {/* ── FAQS ─────────────────────────────────────────────────────────── */}
      <SectionWrapper className="bg-section-b" decoration={<ConstellationDecor name="leo" side="left" offsetY="20%" />}>
        {/* Ambient glow */}
        <div className="absolute inset-x-0 top-0 h-64 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(124,58,237,0.08) 0%, transparent 100%)' }} />
        <SectionHeader
          badge="Got Questions?"
          title="Frequently Asked"
          highlight="Questions"
          subtitle="Everything you need to know before starting your project with PROGREX."
        />
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openFaq === faq.id
            return (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="rounded-xl overflow-hidden"
                style={{
                  background: 'rgba(6,6,22,0.97)',
                  border: isOpen ? '1px solid rgba(14,165,233,0.35)' : '1px solid rgba(103,232,249,0.1)',
                  boxShadow: isOpen ? '0 0 0 1px rgba(14,165,233,0.12), 0 0 30px rgba(14,165,233,0.1)' : 'none',
                  transition: 'border-color 0.25s, box-shadow 0.25s',
                }}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left group"
                >
                  <span className="font-semibold text-white text-sm sm:text-base group-hover:text-nebula-300 transition-colors">
                    {faq.question}
                  </span>
                  <span
                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300"
                    style={{
                      background: isOpen ? 'rgba(14,165,233,0.18)' : 'rgba(103,232,249,0.07)',
                      border: isOpen ? '1px solid rgba(14,165,233,0.4)' : '1px solid rgba(103,232,249,0.18)',
                      color: isOpen ? '#67E8F9' : 'rgba(103,232,249,0.5)',
                      transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                    }}
                  >
                    <ArrowRight size={13} />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="px-6 pb-5">
                        <div className="h-px mb-4" style={{ background: 'linear-gradient(to right, rgba(14,165,233,0.2), rgba(124,58,237,0.15), transparent)' }} />
                        <p className="text-slate-400 text-sm leading-relaxed">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-10"
        >
          <p className="text-slate-500 text-sm mb-4">Still have questions?</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/contact" className="btn-outline inline-flex">
              Contact Us <ArrowRight size={16} />
            </Link>
            <button
              onClick={() => document.dispatchEvent(new CustomEvent('open-chatbot'))}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-nebula-300 transition-all duration-200 hover:text-white"
              style={{ background: 'rgba(103,232,249,0.07)', border: '1px solid rgba(103,232,249,0.22)' }}
            >
              <Bot size={15} />
              Chat with our AI
            </button>
          </div>
        </motion.div>
      </SectionWrapper>

      {/* ── FINAL CTA + CONTACT FORM ─────────────────────────────────── */}
      <section className="relative py-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0" style={{ background: 'rgba(3,3,15,0.82)' }} />
        <div className="absolute inset-0 bg-dot-grid opacity-25 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-10"
          >
            <div className="eyebrow-badge mx-auto mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-nebula-400 animate-pulse inline-block mr-2" />
              INITIATE MISSION
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white mb-5 leading-tight">
              Ready to Build Something{' '}
              <span className="text-gradient-nebula">Powerful?</span>
            </h2>
            <p className="text-white/50 text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-10">
              Partner with PROGREX and transform your ideas into cutting-edge software solutions that drive real business results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link href="/contact" className="btn-primary text-base px-8 py-4">
                  <span>Start Your Project</span>
                  <ArrowRight size={16} />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link href="/projects" className="btn-outline text-base px-8 py-4">
                  View Projects
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-10">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(103,232,249,0.2))' }} />
            <span className="font-mono text-[11px] text-white/30 tracking-widest px-2">OR SEND A MESSAGE</span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(103,232,249,0.2))' }} />
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <AnimatePresence mode="wait">
              {ctaSubmitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.93 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.93 }}
                  transition={{ duration: 0.4, type: 'spring' }}
                  className="rounded-2xl p-12 text-center"
                  style={{ background: 'rgba(6,6,22,0.97)', border: '1px solid rgba(14,165,233,0.25)', boxShadow: '0 0 40px rgba(14,165,233,0.08)' }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.15 }}
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                    style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' }}
                  >
                    <CheckCircle size={26} className="text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    Thanks, <strong className="text-white">{ctaForm.name}</strong>! We&apos;ll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => { setCtaSubmitted(false); setCtaForm({ name: '', email: '', phone: '', company: '', service: '', budget: '', message: '' }) }}
                    className="btn-outline text-sm px-6 py-2.5 inline-flex"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleCtaSubmit}
                  className="rounded-2xl p-6 sm:p-8 space-y-5"
                  style={{ background: 'rgba(6,6,22,0.97)', border: '1px solid rgba(103,232,249,0.1)', boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name <span className="text-nebula-400">*</span></label>
                      <input
                        type="text"
                        value={ctaForm.name}
                        onChange={(e) => { setCtaForm((p) => ({ ...p, name: e.target.value })); setCtaErrors((p) => ({ ...p, name: undefined })) }}
                        placeholder="Your name"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/4 border text-white/90 text-sm placeholder-slate-500 focus:outline-none transition-all"
                        style={{ borderColor: ctaErrors.name ? 'rgba(239,68,68,0.6)' : 'rgba(103,232,249,0.15)', boxShadow: 'none' }}
                        onFocus={(e) => { if (!ctaErrors.name) e.currentTarget.style.borderColor = 'rgba(14,165,233,0.5)' }}
                        onBlur={(e) => { if (!ctaErrors.name) e.currentTarget.style.borderColor = 'rgba(103,232,249,0.15)' }}
                      />
                      {ctaErrors.name && <p className="text-red-400 text-xs mt-1">{ctaErrors.name}</p>}
                    </div>
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address <span className="text-nebula-400">*</span></label>
                      <input
                        type="email"
                        value={ctaForm.email}
                        onChange={(e) => { setCtaForm((p) => ({ ...p, email: e.target.value })); setCtaErrors((p) => ({ ...p, email: undefined })) }}
                        placeholder="you@company.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/4 border text-white/90 text-sm placeholder-slate-500 focus:outline-none transition-all"
                        style={{ borderColor: ctaErrors.email ? 'rgba(239,68,68,0.6)' : 'rgba(103,232,249,0.15)' }}
                        onFocus={(e) => { if (!ctaErrors.email) e.currentTarget.style.borderColor = 'rgba(14,165,233,0.5)' }}
                        onBlur={(e) => { if (!ctaErrors.email) e.currentTarget.style.borderColor = 'rgba(103,232,249,0.15)' }}
                      />
                      {ctaErrors.email && <p className="text-red-400 text-xs mt-1">{ctaErrors.email}</p>}
                    </div>
                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone Number</label>
                      <input
                        type="tel"
                        value={ctaForm.phone}
                        onChange={(e) => setCtaForm((p) => ({ ...p, phone: e.target.value }))}
                        placeholder="+63 912 345 6789"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/4 border text-white/90 text-sm placeholder-slate-500 focus:outline-none transition-all"
                        style={{ borderColor: 'rgba(103,232,249,0.15)' }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(14,165,233,0.5)' }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(103,232,249,0.15)' }}
                      />
                    </div>
                    {/* Company */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Company / Organization</label>
                      <input
                        type="text"
                        value={ctaForm.company}
                        onChange={(e) => setCtaForm((p) => ({ ...p, company: e.target.value }))}
                        placeholder="Your company name"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/4 border text-white/90 text-sm placeholder-slate-500 focus:outline-none transition-all"
                        style={{ borderColor: 'rgba(103,232,249,0.15)' }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(14,165,233,0.5)' }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(103,232,249,0.15)' }}
                      />
                    </div>
                  </div>

                  {/* Service */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Service Needed</label>
                    <CtaSelect
                      value={ctaForm.service}
                      onChange={(v) => setCtaForm((p) => ({ ...p, service: v }))}
                      options={ctaServices}
                      placeholder="Select a service..."
                    />
                  </div>

                  {/* Budget Range */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Budget Range</label>
                    <CtaSelect
                      value={ctaForm.budget}
                      onChange={(v) => setCtaForm((p) => ({ ...p, budget: v }))}
                      options={['Below ₱10,000', '₱10,000 – ₱50,000', '₱50,000 – ₱150,000', '₱150,000 – ₱500,000', '₱500,000+', "Let's Discuss"]}
                      placeholder="Select budget range..."
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Message <span className="text-nebula-400">*</span></label>
                    <textarea
                      value={ctaForm.message}
                      onChange={(e) => { setCtaForm((p) => ({ ...p, message: e.target.value })); setCtaErrors((p) => ({ ...p, message: undefined })) }}
                      rows={4}
                      placeholder="Tell us about your project..."
                      className="w-full px-4 py-2.5 rounded-xl bg-transparent border text-slate-200 text-sm placeholder-slate-500 focus:outline-none transition-all resize-none"
                      style={{ borderColor: ctaErrors.message ? 'rgba(239,68,68,0.6)' : 'rgba(103,232,249,0.15)' }}
                      onFocus={(e) => { if (!ctaErrors.message) e.currentTarget.style.borderColor = 'rgba(14,165,233,0.5)' }}
                      onBlur={(e) => { if (!ctaErrors.message) e.currentTarget.style.borderColor = 'rgba(103,232,249,0.15)' }}
                    />
                    {ctaErrors.message && <p className="text-red-400 text-xs mt-1">{ctaErrors.message}</p>}
                  </div>

                  <motion.button
                    type="submit"
                    disabled={ctaLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary w-full justify-center py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{ctaLoading ? 'Sending...' : 'Send Message'}</span>
                    {ctaLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      <Send size={16} />
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
    </>
  )
}
