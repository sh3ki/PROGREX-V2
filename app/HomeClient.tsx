'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Star, Quote, ChevronLeft, ChevronRight, Monitor, Check, Bot } from 'lucide-react'
import Image from 'next/image'
import Hero from '@/components/Hero'
import ConstellationDecor from '@/components/ConstellationDecor'
import ServiceCard from '@/components/ServiceCard'
import FeaturedProjectsCarousel from '@/components/FeaturedProjectsCarousel'
import TechMarqueeSection from '@/components/TechMarqueeSection'
import SectionWrapper, { SectionHeader } from '@/components/SectionWrapper'
import IntroLoader from '@/components/IntroLoader'
import ContactFormCard from '@/components/contact/ContactFormCard'
import { useTranslation } from '@/components/TranslationProvider'

type HomeClientProps = {
  servicesData: Array<{ id: string; title: string; shortDesc: string; icon: string; slug: string; color: string }>
  systemsData: Array<{ id: string; slug: string; category: string; industry: string; name: string; shortDesc: string; image: string; features: string[] }>
  testimonialsData: Array<{ rating: number; quote: string; name: string; role: string; company: string }>
  faqsData: Array<{ id: string; question: string; answer: string }>
  featuredProjectsData: Array<{ id: string; slug: string; title: string; systemType: string; category: string[]; industry: string; tags: string[]; image: string; shortDesc: string }>
}

export default function HomeClient({ servicesData, systemsData, testimonialsData, faqsData, featuredProjectsData }: HomeClientProps) {
  const { t, translations } = useTranslation()
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [direction, setDirection] = useState(1)
  const [openFaq, setOpenFaq] = useState<string | null>(null)
  const testimonialsCount = testimonialsData.length
  const hasTestimonials = testimonialsCount > 0
  const currentTestimonial = hasTestimonials
    ? testimonialsData[Math.min(activeTestimonial, testimonialsCount - 1)]
    : null

  const DURATION = 7 // seconds auto-advance

  const goTo = (i: number) => {
    if (!hasTestimonials) return
    setDirection(i > activeTestimonial ? 1 : -1)
    setActiveTestimonial(i)
  }
  const prevTestimonial = () => {
    if (!hasTestimonials) return
    const i = (activeTestimonial - 1 + testimonialsCount) % testimonialsCount
    setDirection(-1)
    setActiveTestimonial(i)
  }
  const nextTestimonial = () => {
    if (!hasTestimonials) return
    const i = (activeTestimonial + 1) % testimonialsCount
    setDirection(1)
    setActiveTestimonial(i)
  }

  useEffect(() => {
    if (testimonialsCount === 0) return

    const id = setInterval(() => {
      setDirection(1)
      setActiveTestimonial((p) => (p + 1) % testimonialsCount)
    }, DURATION * 1000)
    return () => clearInterval(id)
  }, [DURATION, testimonialsCount])

  return (
    <>
      <IntroLoader />
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <Hero
        badge={t('home.heroBadge')}
        title={t('home.heroTitle')}
        highlight={t('home.heroHighlight')}
        highlightNewLine
        subtitleLabel={t('home.heroSubtitleLabel')}
        subtitle={t('home.heroSubtitle')}
        primaryBtn={{ label: t('home.heroPrimaryBtn'), href: '/contact' }}
        secondaryBtn={{ label: t('home.heroSecondaryBtn'), href: '/projects' }}
        showStats
      />

      {/* ── FEATURED PROJECTS ────────────────────────────────────────────── */}
      <SectionWrapper className="bg-section-b" decoration={<ConstellationDecor name="bigdipper" side="left" offsetY="15%" />}>
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
        {/* Ambient glow */}
        <div className="absolute inset-x-0 top-0 h-72 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(124,58,237,0.07) 0%, transparent 100%)' }} />

        <SectionHeader
          badge={t('home.projectsBadge')}
          title={t('home.projectsTitle')}
          highlight={t('home.projectsHighlight')}
          subtitle={t('home.projectsSubtitle')}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <FeaturedProjectsCarousel projectsData={featuredProjectsData} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-10"
        >
          <Link href="/projects" className="btn-outline inline-flex">
            {t('home.projectsViewAll')} <ArrowRight size={16} />
          </Link>
        </motion.div>
      </SectionWrapper>

      {/* ── SERVICES PREVIEW ─────────────────────────────────────────────── */}
      <SectionWrapper className="bg-section-a" decoration={<ConstellationDecor name="orion" side="right" offsetY="10%" />}>
        {/* Ambient top glow */}
        <div className="absolute inset-x-0 top-0 h-64 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(14,165,233,0.07) 0%, transparent 100%)' }} />

        <SectionHeader
          badge={t('home.servicesBadge')}
          title={t('home.servicesTitle')}
          highlight={t('home.servicesHighlight')}
          subtitle={t('home.servicesSubtitle')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {servicesData.slice(0, 6).map((service, i) => (
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
            {t('home.servicesExplore')} <ArrowRight size={16} />
          </Link>
        </motion.div>
      </SectionWrapper>



      {/* ── TECHNOLOGIES ─────────────────────────────────────────────────── */}
      <SectionWrapper className="bg-section-b" decoration={<ConstellationDecor name="leo" side="left" offsetY="25%" />}>
        <SectionHeader
          badge={t('home.techBadge')}
          title={t('home.techTitle')}
          highlight={t('home.techHighlight')}
          subtitle={t('home.techSubtitle')}
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
          badge={t('home.testimonialsBadge')}
          title={t('home.testimonialsTitle')}
          highlight={t('home.testimonialsHighlight')}
          subtitle={t('home.testimonialsSubtitle')}
        />

        <div className="max-w-3xl mx-auto">
          {/* Card */}
          <div className="relative overflow-hidden rounded-2xl min-h-70 sm:min-h-80">
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
                  {Array.from({ length: currentTestimonial?.rating ?? 0 }).map((_, i) => (
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
                  &ldquo;{translations.data.testimonials[activeTestimonial]?.quote ?? currentTestimonial?.quote ?? ''}&rdquo;
                </p>

                {/* Author row */}
                <div className="flex items-center gap-4 relative z-10">
                  <div>
                    <div className="font-bold text-white">{translations.data.testimonials[activeTestimonial]?.name ?? currentTestimonial?.name ?? ''}</div>
                    <div className="font-mono text-xs text-nebula-400/70 mt-0.5">{translations.data.testimonials[activeTestimonial]?.role ?? currentTestimonial?.role ?? ''}</div>
                  </div>
                  <div className="ml-auto shrink-0">
                    <span
                      className="font-mono text-[10px] px-3 py-1 rounded-full"
                      style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}
                    >
                      {translations.data.testimonials[activeTestimonial]?.company ?? currentTestimonial?.company ?? ''}
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
              {testimonialsData.map((_, i) => (
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
            {String(activeTestimonial + 1).padStart(2, '0')} / {String(testimonialsData.length).padStart(2, '0')}
          </p>
        </div>
      </SectionWrapper>

      {/* ── FAQS ─────────────────────────────────────────────────────────── */}
      <SectionWrapper className="bg-section-b" decoration={<ConstellationDecor name="leo" side="left" offsetY="20%" />}>
        {/* Ambient glow */}
        <div className="absolute inset-x-0 top-0 h-64 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(124,58,237,0.08) 0%, transparent 100%)' }} />
        <SectionHeader
          badge={t('home.faqsBadge')}
          title={t('home.faqsTitle')}
          highlight={t('home.faqsHighlight')}
          subtitle={t('home.faqsSubtitle')}
        />
        <div className="max-w-3xl mx-auto space-y-3">
            {faqsData.map((faq, i) => {
            const isOpen = openFaq === faq.id
            const tFaq = translations.data.generalFaqs[i] as unknown as string[] | undefined
            const question = tFaq?.[0] ?? faq.question
            const answer = tFaq?.[1] ?? faq.answer
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
                    {question}
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
                        <p className="text-slate-400 text-sm leading-relaxed">{answer}</p>
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
          <p className="text-slate-500 text-sm mb-4">{t('home.faqsStillHave')}</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/contact" className="btn-outline inline-flex">
              {t('home.faqsContactUs')} <ArrowRight size={16} />
            </Link>
            <button
              onClick={() => document.dispatchEvent(new CustomEvent('open-chatbot'))}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-nebula-300 transition-all duration-200 hover:text-white"
              style={{ background: 'rgba(103,232,249,0.07)', border: '1px solid rgba(103,232,249,0.22)' }}
            >
              <Bot size={15} />
              {t('home.faqsChatAI')}
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
              {t('home.ctaHeading')}{' '}
              <span className="text-gradient-nebula">{t('home.ctaHighlight')}</span>
            </h2>
            <p className="text-white/50 text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-10">
              {t('home.ctaSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link href="/contact" className="btn-primary text-base px-8 py-4">
                  <span>{t('home.ctaPrimaryBtn')}</span>
                  <ArrowRight size={16} />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link href="/projects" className="btn-outline text-base px-8 py-4">
                  {t('home.ctaSecondaryBtn')}
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-10">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(103,232,249,0.2))' }} />
            <span className="font-mono text-[11px] text-white/30 tracking-widest px-2">{t('home.ctaDivider')}</span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(103,232,249,0.2))' }} />
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="rounded-2xl p-4 sm:p-6"
            style={{ background: 'rgba(6,6,22,0.97)', border: '1px solid rgba(103,232,249,0.12)', boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}
          >
            <ContactFormCard />
          </motion.div>
        </div>
      </section>
    </>
  )
}
