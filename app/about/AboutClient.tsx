'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Linkedin, Github, CheckCircle } from 'lucide-react'
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
      <SectionWrapper className="bg-[#0A0A0F]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-4 h-[2px] bg-[#7C2AE8]" />
              <span className="sys-label-accent">OUR STORY</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#F0EEF8] mb-5 leading-tight">
              From a Small Dev Shop{' '}
              <span className="text-[#C4B5FD]">to a Technology Powerhouse</span>
            </h2>
            <div className="space-y-4 text-[#5A5770] text-sm leading-relaxed font-light">
              <p>
                PROGREX was founded in 2018 by a team of passionate engineers tired of seeing businesses fail due to poor technology choices. We started with a simple mission: build software that actually works â€â€� on time, within budget, and built to last.
              </p>
              <p>
                What began as a 3-person freelance team has grown into a 25+ member technology company serving clients across the Philippines, Southeast Asia, and beyond. We&apos;ve delivered over 150 projects spanning healthcare, education, retail, manufacturing, and government.
              </p>
              <p>
                Today, PROGREX is recognized as one of the most reliable technology partners in the region â€â€� not just for the quality of our code, but for the depth of our client relationships.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="grid grid-cols-2 gap-[1px] bg-[#1A1A24] border border-[#1A1A24]"
          >
            {stats.map((stat, i) => (
              <div key={i} className="bg-[#0F0F14] p-6 text-center hover:bg-[#14141B] transition-colors">
                <div className="data-value text-[#C4B5FD] mb-1">{stat.value}</div>
                <div className="sys-label mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </SectionWrapper>

      {/* Mission & Vision */}
      <SectionWrapper className="bg-[#0F0F14]">
        <div className="absolute inset-0 tech-grid opacity-40 pointer-events-none" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-[#1A1A24] border border-[#1A1A24]">
          {[
            {
              icon: '??',
              label: 'OUR MISSION',
              title: 'Technology that creates real business impact.',
              desc: 'We exist to help businesses leverage technology as a competitive advantage â€â€� not a cost center. Every system we build is designed to solve real problems, generate real value, and scale with your ambitions.',
            },
            {
              icon: '??',
              label: 'OUR VISION',
              title: "To be Southeast Asia's most trusted technology partner.",
              desc: 'We envision a future where every business â€â€� regardless of size â€â€� has access to world-class technology solutions. PROGREX will lead that transformation by combining deep technical expertise with genuine partnership.',
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="bg-[#0F0F14] p-8 hover:bg-[#14141B] transition-colors group"
            >
              <span className="text-2xl block mb-4 opacity-70">{item.icon}</span>
              <div className="sys-label-accent mb-3">{item.label}</div>
              <h3 className="text-lg font-bold text-[#D1CEE8] mb-3 leading-snug group-hover:text-[#C4B5FD] transition-colors">{item.title}</h3>
              <p className="text-[#3A3854] text-sm leading-relaxed font-light">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* Core Values */}
      <SectionWrapper className="bg-[#0A0A0F]">
        <SectionHeader
          badge="What We Stand For"
          title="Our Core"
          highlight="Values"
          subtitle="These aren't wall posters. They are the principles that guide every decision, every sprint, every client interaction."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-[#1A1A24] border border-[#1A1A24]">
          {coreValues.map((val, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-[#0F0F14] p-6 hover:bg-[#14141B] hover:border-l-2 hover:border-l-[#7C2AE8] transition-all duration-150 group"
            >
              <span className="text-2xl block mb-3 opacity-60">{val.icon}</span>
              <h3 className="text-sm font-semibold text-[#D1CEE8] mb-2 group-hover:text-[#C4B5FD] transition-colors">{val.title}</h3>
              <p className="text-[#3A3854] text-xs leading-relaxed font-light">{val.desc}</p>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* Team */}
      <SectionWrapper className="bg-[#0F0F14]" id="team">
        <SectionHeader
          badge="The People Behind PROGREX"
          title="Meet Our"
          highlight="Team"
          subtitle="Talented engineers, designers, and strategists united by a passion for building exceptional technology."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-[#1A1A24] border border-[#1A1A24]">
          {team.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-[#0F0F14] p-6 hover:bg-[#14141B] transition-colors group text-center"
            >
              <div className="w-12 h-12 border border-[#4C1D95] flex items-center justify-center text-lg font-bold text-[#C4B5FD] mx-auto mb-4 bg-[#14141B] font-mono group-hover:border-[#7C2AE8] transition-colors">
                {member.name.charAt(0)}
              </div>
              <h3 className="text-sm font-semibold text-[#D1CEE8] mb-0.5 group-hover:text-[#C4B5FD] transition-colors">{member.name}</h3>
              <div className="sys-label-accent mb-3 text-center">{member.role}</div>
              <p className="text-[#3A3854] text-xs leading-relaxed mb-4 font-light">{member.bio}</p>
              <div className="flex justify-center gap-2">
                <a href={member.linkedin} className="w-7 h-7 border border-[#1E1E2E] flex items-center justify-center text-[#3A3854] hover:text-[#C4B5FD] hover:border-[#4C1D95] transition-all">
                  <Linkedin size={12} />
                </a>
                <a href={member.github} className="w-7 h-7 border border-[#1E1E2E] flex items-center justify-center text-[#3A3854] hover:text-[#C4B5FD] hover:border-[#4C1D95] transition-all">
                  <Github size={12} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* Why Choose Us */}
      <SectionWrapper className="bg-[#0A0A0F]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <SectionHeader
            badge="Why PROGREX"
            title="Why 80+ Businesses Choose"
            highlight="Us"
            subtitle="We don't just write code. We build solutions that generate real business outcomes."
            center={false}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
            {whyUs.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="flex items-center gap-2.5"
              >
                <CheckCircle size={13} className="text-[#7C2AE8] shrink-0" />
                <span className="text-xs text-[#9B98B3] font-light">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* Process Timeline */}
      <SectionWrapper className="bg-[#0F0F14]">
        <div className="absolute inset-0 tech-grid opacity-30 pointer-events-none" />
        <SectionHeader
          badge="How We Work"
          title="Our Proven"
          highlight="Process"
          subtitle="A structured, transparent process that delivers great results â€â€� every time."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-[#1A1A24] border border-[#1A1A24]">
          {processSteps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-[#0F0F14] p-6 hover:bg-[#14141B] transition-colors group"
            >
              <div className="font-mono text-[10px] text-[#7C2AE8] mb-3 tracking-widest">STEP {step.step}</div>
              <h3 className="text-sm font-semibold text-[#D1CEE8] mb-2 group-hover:text-[#C4B5FD] transition-colors">{step.title}</h3>
              <p className="text-[#3A3854] text-xs leading-relaxed font-light">{step.desc}</p>
            </motion.div>
          ))}
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
