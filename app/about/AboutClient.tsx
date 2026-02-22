'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Linkedin, Github, CheckCircle, ArrowRight } from 'lucide-react'
import Hero from '@/components/Hero'
import SectionWrapper, { SectionHeader } from '@/components/SectionWrapper'
import CTASection from '@/components/CTASection'
import { team, coreValues, stats } from '@/lib/mockData'

const processSteps = [
  { step: '01', title: 'Discovery', desc: 'We listen first. Understand your goals, challenges, users, and success metrics before writing a single line of code.' },
  { step: '02', title: 'Strategy', desc: 'We craft a technical roadmap and project plan with clear milestones, resource allocation, and risk mitigation.' },
  { step: '03', title: 'Design', desc: 'Human-centered UX design, high-fidelity prototypes, and design system creation before development begins.' },
  { step: '04', title: 'Build', desc: 'Agile sprints with weekly demos. Clean, documented, tested code delivered iteratively.' },
  { step: '05', title: 'Launch', desc: 'Production deployment with CI/CD pipelines, monitoring, and performance optimization.' },
  { step: '06', title: 'Grow', desc: 'Ongoing support, feature additions, and scaling as your business grows.' },
]

const whyUs = [
  'Production-quality code, zero shortcuts',
  'Transparent pricing and timelines',
  'Direct access to senior developers',
  'Post-launch support included',
  'Scalable architecture from day one',
  'NDA-protected, all IP transferred to you',
  'Agile process with weekly demos',
  'Modern tech stack, no legacy code',
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
      <SectionWrapper className="bg-[#050510]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-[#560BAD]/30 text-[#CFA3EA] text-xs font-semibold uppercase tracking-widest mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#831DC6] animate-pulse" />
              Our Story
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-5 leading-tight">
              From a Small Dev Shop <span className="text-gradient">to a Technology Powerhouse</span>
            </h2>
            <div className="space-y-4 text-slate-400 leading-relaxed">
              <p>
                PROGREX was founded in 2018 by a team of passionate engineers tired of seeing businesses fail due to poor technology choices. We started with a simple mission: build software that actually works — on time, within budget, and built to last.
              </p>
              <p>
                What began as a 3-person freelance team has grown into a 25+ member technology company serving clients across the Philippines, Southeast Asia, and beyond. We've delivered over 150 projects spanning healthcare, education, retail, manufacturing, and government.
              </p>
              <p>
                Today, PROGREX is recognized as one of the most reliable technology partners in the region — not just for the quality of our code, but for the depth of our client relationships.
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
              <div key={i} className="glass-card rounded-2xl p-6 text-center border border-[#560BAD]/20 hover:border-[#560BAD]/50 transition-colors">
                <div className="text-4xl font-extrabold text-gradient mb-2">{stat.value}</div>
                <div className="text-slate-400 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </SectionWrapper>

      {/* Mission & Vision */}
      <SectionWrapper className="bg-[#030308]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              icon: '🎯',
              label: 'Our Mission',
              title: 'Technology that creates real business impact.',
              desc: 'We exist to help businesses leverage technology as a competitive advantage — not a cost center. Every system we build is designed to solve real problems, generate real value, and scale with your ambitions.',
            },
            {
              icon: '🔭',
              label: 'Our Vision',
              title: 'To be Southeast Asia\'s most trusted technology partner.',
              desc: 'We envision a future where every business — regardless of size — has access to world-class technology solutions. PROGREX will lead that transformation by combining deep technical expertise with genuine partnership.',
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="glass-card rounded-2xl p-8 border border-[#560BAD]/20 hover:border-[#560BAD]/50 hover:shadow-[0_0_30px_rgba(86,11,173,0.2)] transition-all duration-300"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <div className="text-xs font-semibold text-[#CFA3EA] uppercase tracking-wider mb-2">{item.label}</div>
              <h3 className="text-xl font-bold text-white mb-3 leading-snug">{item.title}</h3>
              <p className="text-slate-400 leading-relaxed text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* Core Values */}
      <SectionWrapper className="bg-[#050510]">
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
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6 hover-glow-card group"
            >
              <div className="text-3xl mb-4">{val.icon}</div>
              <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#CFA3EA] transition-colors">{val.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{val.desc}</p>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* Team */}
      <SectionWrapper className="bg-[#030308]" id="team">
        <SectionHeader
          badge="The People Behind PROGREX"
          title="Meet Our"
          highlight="Team"
          subtitle="Talented engineers, designers, and strategists united by a passion for building exceptional technology."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="glass-card rounded-2xl p-6 text-center hover-glow-card group"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#560BAD] to-[#4361EE] flex items-center justify-center text-2xl font-black text-white mx-auto mb-4 shadow-[0_0_20px_rgba(86,11,173,0.4)] group-hover:shadow-[0_0_30px_rgba(131,29,198,0.6)] transition-all">
                {member.name.charAt(0)}
              </div>
              <h3 className="text-base font-bold text-white mb-0.5 group-hover:text-[#CFA3EA] transition-colors">{member.name}</h3>
              <div className="text-xs font-medium text-[#831DC6] mb-3">{member.role}</div>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">{member.bio}</p>
              <div className="flex justify-center gap-3">
                <a href={member.linkedin} className="w-8 h-8 rounded-lg glass border border-[#560BAD]/20 flex items-center justify-center text-slate-400 hover:text-[#CFA3EA] hover:border-[#831DC6]/50 transition-all">
                  <Linkedin size={14} />
                </a>
                <a href={member.github} className="w-8 h-8 rounded-lg glass border border-[#560BAD]/20 flex items-center justify-center text-slate-400 hover:text-[#CFA3EA] hover:border-[#831DC6]/50 transition-all">
                  <Github size={14} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* Why Choose Us */}
      <SectionWrapper className="bg-[#050510]">
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
                className="flex items-center gap-3 text-sm text-slate-300"
              >
                <CheckCircle size={16} className="text-[#831DC6] shrink-0" />
                {item}
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* Process Timeline */}
      <SectionWrapper className="bg-[#030308]">
        <SectionHeader
          badge="How We Work"
          title="Our Proven"
          highlight="Process"
          subtitle="A structured, transparent process that delivers great results — every time."
        />
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#560BAD] to-[#4361EE] opacity-30 hidden sm:block" />

          <div className="space-y-8">
            {processSteps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`flex items-start gap-6 sm:gap-0 ${i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}
              >
                <div className={`sm:w-1/2 ${i % 2 === 0 ? 'sm:pr-12 sm:text-right' : 'sm:pl-12 sm:text-left'}`}>
                  <div className="glass-card rounded-xl p-5 hover:border-[#560BAD]/40 transition-colors">
                    <div className="text-xs font-bold text-[#CFA3EA] uppercase tracking-wider mb-1">Step {step.step}</div>
                    <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
                {/* Center dot */}
                <div className="hidden sm:flex sm:w-0 items-center justify-center relative">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#560BAD] to-[#4361EE] shadow-[0_0_10px_rgba(86,11,173,0.6)] z-10" />
                </div>
                <div className="hidden sm:block sm:w-1/2" />
              </motion.div>
            ))}
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
