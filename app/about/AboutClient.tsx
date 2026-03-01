'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Target, Telescope, Zap, Shield, Award, Users, Lightbulb, Eye, Search, Map, Palette, Code2, Rocket, TrendingUp } from 'lucide-react'
import Hero from '@/components/Hero'
import ConstellationDecor from '@/components/ConstellationDecor'
import SectionWrapper, { SectionHeader } from '@/components/SectionWrapper'
import CTASection from '@/components/CTASection'
import TeamCarousel from '@/components/TeamCarousel'
import { coreValues, stats } from '@/lib/mockData'

// Icons mapped to each core value (same order as mockData coreValues)
const VALUE_ICONS = [Zap, Shield, Award, Users, Lightbulb, Eye]

const processSteps = [
  { step: '01', icon: Search,     title: 'Discovery',  desc: 'We listen first. Understand your goals, challenges, users, and success metrics before writing a single line of code.' },
  { step: '02', icon: Map,        title: 'Strategy',   desc: 'We craft a technical roadmap and project plan with clear milestones, resource allocation, and risk mitigation.' },
  { step: '03', icon: Palette,    title: 'Design',     desc: 'Human-centered UX design, high-fidelity prototypes, and design system creation before development begins.' },
  { step: '04', icon: Code2,      title: 'Build',      desc: 'Agile sprints with weekly demos. Clean, documented, tested code delivered iteratively.' },
  { step: '05', icon: Rocket,     title: 'Launch',     desc: 'Production deployment with CI/CD pipelines, monitoring, and performance optimization.' },
  { step: '06', icon: TrendingUp, title: 'Grow',       desc: 'Ongoing support, feature additions, and scaling as your business grows.' },
]

const whyUs = [
  'Transparent pricing and timelines',
  'Direct access to senior developers',
  'Post-launch support included',
  'Scalable architecture from day one',
  'Agile process with weekly demos',
  'Modern tech stack, no legacy code',
  'Production-quality code, zero shortcuts',
  'NDA-protected, all IP transferred to you',
  'Flexible engagement models tailored to your needs',
  'Long-term partnership mindset — we grow with you',
  'Business-first approach focused on ROI, not just features',
  'Dedicated project manager for seamless communication',
  'Performance-optimized systems built for speed and reliability',
  'Secure development practices with data protection standards'
]

export default function AboutClient() {
  return (
    <>
      {/* Hero */}
      <Hero
        badge="Who We Are"
        title="We Build Technology That"
        highlight="Changes Businesses."
        subtitle="PROGREX is a full-service technology solutions company helping businesses grow, scale, and lead through exceptional software."
        primaryBtn={{ label: 'Work With Us', href: '/contact' }}
      />

      {/* Company Story */}
      <SectionWrapper className="bg-section-a" decoration={<ConstellationDecor name="gemini" side="left" offsetY="15%" />}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="eyebrow-badge mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-nebula-500 animate-pulse" />
              Our Story
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-5 leading-tight">
              From Two Builders <span className="text-gradient-nebula">to a Growing Tech Team</span>
            </h2>
            <div className="space-y-4 text-slate-400 leading-relaxed">
              <p>
                PROGREX was founded in 2025 by two developers with a shared obsession: building software that genuinely solves problems. What started as a two-person operation — fueled by late nights, strong coffee, and an unwillingness to ship mediocre work — quickly earned a reputation for quality and reliability.
              </p>
              <p>
                As word spread and projects grew in scope, so did the team. We carefully brought in engineers, designers, and specialists who shared the same standards. Today, PROGREX operates as a team of 8 and growing — small enough to move fast, experienced enough to build right.
              </p>
              <p>
                We&apos;re still early in our story, but every project we take on is treated with the same intensity and care as that very first one.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="grid grid-cols-2 gap-4"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                className="group relative rounded-lg p-5 sm:p-6 text-center overflow-hidden cursor-default"
                style={{
                  background: 'rgba(103,232,249,0.04)',
                  border: '1px solid rgba(103,232,249,0.12)',
                }}
                whileHover={{
                  scale: 1.06,
                  y: -4,
                  background: 'rgba(103,232,249,0.10)',
                  boxShadow: '0 0 24px rgba(103,232,249,0.18), 0 8px 24px rgba(0,0,0,0.3)',
                }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              >
                <span className="absolute top-0 left-0 w-3.5 h-3.5 border-t border-l border-nebula-400/50 group-hover:border-nebula-400 transition-colors pointer-events-none" style={{ borderRadius: '3px 0 0 0' }} />
                <span className="absolute top-0 right-0 w-3.5 h-3.5 border-t border-r border-nebula-400/50 group-hover:border-nebula-400 transition-colors pointer-events-none" style={{ borderRadius: '0 3px 0 0' }} />
                <span className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b border-l border-nebula-400/50 group-hover:border-nebula-400 transition-colors pointer-events-none" style={{ borderRadius: '0 0 0 3px' }} />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b border-r border-nebula-400/50 group-hover:border-nebula-400 transition-colors pointer-events-none" style={{ borderRadius: '0 0 3px 0' }} />
                <div className="font-display font-black text-3xl sm:text-4xl text-nebula-300 group-hover:text-nebula-200 transition-colors mb-1">
                  {stat.value}
                </div>
                <div className="font-mono text-[10px] text-white/40 group-hover:text-white/70 transition-colors uppercase tracking-widest">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionWrapper>

      {/* Mission & Vision */}
      <SectionWrapper className="bg-section-b" decoration={<ConstellationDecor name="cassiopeia" side="right" offsetY="20%" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              icon: <Target size={22} />,
              label: 'Our Mission',
              title: 'Build real software that solves real problems.',
              desc: 'We help individuals, startups, and small businesses get their ideas off the ground with clean, functional, and well-built software — no fluff, no over-engineering, just work that delivers.',
              accent: { from: '#0EA5E9', to: '#06B6D4' },
              glow: 'rgba(14,165,233,0.08)',
              border: 'rgba(14,165,233,0.25)',
              borderHover: 'rgba(14,165,233,0.5)',
              iconBg: 'rgba(14,165,233,0.12)',
              iconBorder: 'rgba(14,165,233,0.3)',
              iconColor: '#67E8F9',
              labelColor: '#67E8F9',
            },
            {
              icon: <Telescope size={22} />,
              label: 'Our Vision',
              title: 'Grow into a team people can genuinely rely on.',
              desc: 'We want to be the go-to development partner for clients who need honest communication, fair pricing, and software that actually holds up — starting local, building a track record one project at a time.',
              accent: { from: '#7C3AED', to: '#A78BFA' },
              glow: 'rgba(124,58,237,0.08)',
              border: 'rgba(124,58,237,0.25)',
              borderHover: 'rgba(124,58,237,0.5)',
              iconBg: 'rgba(124,58,237,0.12)',
              iconBorder: 'rgba(124,58,237,0.3)',
              iconColor: '#A78BFA',
              labelColor: '#A78BFA',
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="relative rounded-2xl p-8 overflow-hidden group transition-all duration-300"
              style={{
                background: 'rgba(4,4,20,0.7)',
                border: `1px solid ${item.border}`,
                boxShadow: `0 0 40px ${item.glow}`,
              }}
              whileHover={{ boxShadow: `0 0 60px ${item.glow}, 0 8px 40px rgba(0,0,0,0.4)` }}
            >
              {/* Top accent bar */}
              <div
                className="absolute top-0 left-0 right-0 h-0.5"
                style={{ background: `linear-gradient(to right, transparent, ${item.accent.from}, ${item.accent.to}, transparent)` }}
              />

              {/* Background glow blob */}
              <div
                className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none opacity-30"
                style={{ background: `radial-gradient(circle, ${item.glow.replace('0.08', '0.3')}, transparent 70%)` }}
              />

              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 relative z-10"
                style={{
                  background: item.iconBg,
                  border: `1px solid ${item.iconBorder}`,
                  color: item.iconColor,
                  boxShadow: `0 0 16px ${item.glow}`,
                }}
              >
                {item.icon}
              </div>

              {/* Label */}
              <div
                className="font-mono text-[10px] uppercase tracking-[0.2em] font-semibold mb-3 relative z-10"
                style={{ color: item.labelColor }}
              >
                {item.label}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-4 leading-snug relative z-10">
                {item.title}
              </h3>

              {/* Divider */}
              <div
                className="w-12 h-px mb-4 relative z-10"
                style={{ background: `linear-gradient(to right, ${item.accent.from}, transparent)` }}
              />

              {/* Description */}
              <p className="text-slate-400 leading-relaxed text-sm relative z-10">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* Core Values */}
      <SectionWrapper className="bg-section-a" decoration={<ConstellationDecor name="orion" side="left" offsetY="10%" />}>
        <SectionHeader
          badge="What We Stand For"
          title="Our Core"
          highlight="Values"
          subtitle="These aren't wall posters. They are the principles that guide every decision, every sprint, every client interaction."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {coreValues.map((val, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 260, damping: 22, delay: i * 0.08 }}
              className="group relative rounded-xl overflow-hidden cursor-default"
              style={{ background: 'rgba(8,8,28,0.92)', border: '1px solid rgba(103,232,249,0.12)' }}
              whileHover={{
                scale: 1.03,
                y: -5,
                background: 'rgba(14,14,40,0.97)',
                boxShadow: '0 0 32px rgba(14,165,233,0.15), 0 0 64px rgba(124,58,237,0.10), 0 16px 40px rgba(0,0,0,0.5)',
              }}
            >
              {/* Hover gradient overlay */}
              <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.05) 0%, rgba(124,58,237,0.05) 100%)' }}
              />
              {/* Circuit texture */}
              <div
                className="absolute inset-0 pointer-events-none rounded-xl opacity-60"
                style={{
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44'%3E%3Cline x1='0' y1='22' x2='16' y2='22' stroke='rgba(103,232,249,0.07)' stroke-width='0.7'/%3E%3Cline x1='28' y1='22' x2='44' y2='22' stroke='rgba(103,232,249,0.07)' stroke-width='0.7'/%3E%3Cline x1='22' y1='0' x2='22' y2='16' stroke='rgba(103,232,249,0.07)' stroke-width='0.7'/%3E%3Cline x1='22' y1='28' x2='22' y2='44' stroke='rgba(103,232,249,0.07)' stroke-width='0.7'/%3E%3Ccircle cx='22' cy='22' r='4' fill='none' stroke='rgba(103,232,249,0.09)' stroke-width='0.8'/%3E%3Ccircle cx='22' cy='22' r='1.2' fill='rgba(103,232,249,0.11)'/%3E%3C/svg%3E\")",
                  backgroundSize: '44px 44px',
                  maskImage: 'radial-gradient(ellipse 110% 80% at 50% 10%, black 20%, transparent 90%)',
                  WebkitMaskImage: 'radial-gradient(ellipse 110% 80% at 50% 10%, black 20%, transparent 90%)',
                } as React.CSSProperties}
              />
              {/* Top scan line */}
              <div
                className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(to right, transparent, rgba(14,165,233,0.8), rgba(124,58,237,0.8), transparent)' }}
              />
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-5">
                  <span className="font-mono text-[10px] text-nebula-400/45 tracking-widest group-hover:text-nebula-400/75 transition-colors duration-300">
                    {'// VAL_'}{String(i + 1).padStart(2, '0')}
                  </span>
                  {(() => {
                    const Icon = VALUE_ICONS[i]
                    return (
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(103,232,249,0.08)', border: '1px solid rgba(103,232,249,0.18)' }}
                      >
                        <Icon size={18} className="text-nebula-400" />
                      </div>
                    )
                  })()}
                </div>
                <h3 className="text-base font-bold text-white mb-2 group-hover:text-nebula-300 transition-colors duration-200">{val.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{val.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* Team */}
      <SectionWrapper className="bg-section-b" id="team" decoration={<ConstellationDecor name="scorpius" side="right" offsetY="12%" />}>
        <SectionHeader
          badge="The People Behind PROGREX"
          title="Meet Our"
          highlight="Team"
          subtitle="Talented engineers, designers, and strategists united by a passion for building exceptional technology."
        />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <TeamCarousel />
        </motion.div>
      </SectionWrapper>

      {/* Why Choose Us */}
      <SectionWrapper className="bg-section-a" decoration={<ConstellationDecor name="bigdipper" side="left" offsetY="25%" />}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <SectionHeader
            badge="Why PROGREX"
            title="Why 80+ Businesses Choose"
            highlight="Us"
            subtitle="We don't just write code. We build solutions that generate real business outcomes."
            center={false}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {whyUs.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="flex items-center gap-3 text-sm text-white/60"
              >
                <CheckCircle size={16} className="text-nebula-500 shrink-0" />
                {item}
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* Process Timeline */}
      <SectionWrapper className="bg-section-b" decoration={<ConstellationDecor name="leo" side="right" offsetY="18%" />}>
        <SectionHeader
          badge="How We Work"
          title="Our Proven"
          highlight="Process"
          subtitle="A structured, transparent process that delivers great results — every time."
        />

        <div className="relative max-w-4xl mx-auto">
          {/* Central vertical line */}
          <div
            className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-px -translate-x-1/2 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, transparent, rgba(14,165,233,0.5) 10%, rgba(124,58,237,0.5) 90%, transparent)' }}
          />

          <div className="space-y-10 sm:space-y-0">
            {processSteps.map((step, i) => {
              const Icon = step.icon
              const isEven = i % 2 === 0

              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: i * 0.1 }}
                  className={`relative flex items-center gap-0 sm:gap-6 ${isEven ? 'sm:flex-row' : 'sm:flex-row-reverse'} flex-row sm:mb-10`}
                >
                  {/* Card — half width desktop, full mobile */}
                  <div className={`w-full sm:w-[calc(50%-2.5rem)] pl-14 sm:pl-0 ${isEven ? 'sm:pr-6 sm:text-right' : 'sm:pl-6 sm:text-left'}`}>
                    <motion.div
                      className="relative rounded-xl overflow-hidden group"
                      style={{ background: 'rgba(8,8,28,0.92)', border: '1px solid rgba(103,232,249,0.12)' }}
                      whileHover={{
                        y: -4,
                        boxShadow: '0 0 28px rgba(14,165,233,0.14), 0 0 56px rgba(124,58,237,0.08), 0 12px 36px rgba(0,0,0,0.5)',
                        borderColor: 'rgba(14,165,233,0.35)',
                      }}
                      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                    >
                      {/* Circuit texture */}
                      <div
                        className="absolute inset-0 pointer-events-none opacity-60"
                        style={{
                          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44'%3E%3Cline x1='0' y1='22' x2='16' y2='22' stroke='rgba(103,232,249,0.07)' stroke-width='0.7'/%3E%3Cline x1='28' y1='22' x2='44' y2='22' stroke='rgba(103,232,249,0.07)' stroke-width='0.7'/%3E%3Cline x1='22' y1='0' x2='22' y2='16' stroke='rgba(103,232,249,0.07)' stroke-width='0.7'/%3E%3Cline x1='22' y1='28' x2='22' y2='44' stroke='rgba(103,232,249,0.07)' stroke-width='0.7'/%3E%3Ccircle cx='22' cy='22' r='4' fill='none' stroke='rgba(103,232,249,0.09)' stroke-width='0.8'/%3E%3Ccircle cx='22' cy='22' r='1.2' fill='rgba(103,232,249,0.11)'/%3E%3Ccircle cx='0' cy='0' r='1.2' fill='rgba(103,232,249,0.05)'/%3E%3Ccircle cx='44' cy='0' r='1.2' fill='rgba(103,232,249,0.05)'/%3E%3Ccircle cx='0' cy='44' r='1.2' fill='rgba(103,232,249,0.05)'/%3E%3Ccircle cx='44' cy='44' r='1.2' fill='rgba(103,232,249,0.05)'/%3E%3C/svg%3E\")",
                          backgroundSize: '44px 44px',
                          maskImage: 'radial-gradient(ellipse 120% 100% at 50% 0%, black 30%, transparent 100%)',
                          WebkitMaskImage: 'radial-gradient(ellipse 120% 100% at 50% 0%, black 30%, transparent 100%)',
                        } as React.CSSProperties}
                      />
                      {/* Top scan line on hover */}
                      <div
                        className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ background: 'linear-gradient(to right, transparent, rgba(14,165,233,0.8), rgba(124,58,237,0.8), transparent)' }}
                      />
                      <div className={`p-5 flex gap-4 items-start ${isEven ? 'sm:flex-row-reverse sm:text-right' : 'flex-row'}`}>
                        {/* Icon box */}
                        <div
                          className="shrink-0 w-11 h-11 rounded-lg flex items-center justify-center"
                          style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.22)' }}
                        >
                          <Icon size={20} className="text-nebula-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-[10px] text-nebula-500 tracking-widest mb-0.5">{'// STEP_'}{step.step}</div>
                          <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-nebula-300 transition-colors duration-200">{step.title}</h3>
                          <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                      {/* Connector arrow pointing inward */}
                      <div
                        className={`hidden sm:block absolute top-1/2 -translate-y-1/2 w-3 h-px ${isEven ? '-right-3' : '-left-3'}`}
                        style={{ background: 'rgba(103,232,249,0.3)' }}
                      />
                    </motion.div>
                  </div>

                  {/* Node — desktop center, mobile left gutter */}
                  <div className="absolute left-6 sm:left-1/2 sm:-translate-x-1/2 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: i * 0.1 + 0.15, type: 'spring', stiffness: 300 }}
                      className="relative flex items-center justify-center w-10 h-10 rounded-full"
                      style={{
                        background: 'linear-gradient(135deg, rgba(14,165,233,0.25), rgba(124,58,237,0.25))',
                        border: '2px solid rgba(14,165,233,0.6)',
                        boxShadow: '0 0 18px rgba(14,165,233,0.35), 0 0 40px rgba(14,165,233,0.1)',
                      }}
                    >
                      <span className="font-mono text-[11px] font-bold text-nebula-300">{step.step}</span>
                      {/* Pulse ring */}
                      <span
                        className="absolute inset-0 rounded-full animate-ping"
                        style={{ background: 'rgba(14,165,233,0.12)', animationDuration: '2.5s' }}
                      />
                    </motion.div>
                  </div>

                  {/* Empty spacer for the other half — desktop only */}
                  <div className="hidden sm:block sm:w-[calc(50%-2.5rem)]" />
                </motion.div>
              )
            })}
          </div>
        </div>
      </SectionWrapper>

      {/* CTA */}
      <CTASection
        title="Ready to Work With Us?"
        subtitle="Let's discuss your project and see how PROGREX can help you achieve your technology goals."
        primaryBtn={{ label: 'Get a Free Consultation', href: '/contact' }}
        secondaryBtn={{ label: 'See Our Projects', href: '/projects' }}
      />
    </>
  )
}
