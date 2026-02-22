'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Linkedin, Github, ArrowRight } from 'lucide-react'
import Hero from '@/components/Hero'
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

export default function AboutClient() {
  return (
    <>
      {/* -- HERO ------------------------------------------------------------ */}
      <Hero
        badge="Who We Are"
        title="We Build Technology That"
        highlight="Changes Businesses."
        subtitle="PROGREX is a full-service technology solutions company helping businesses grow, scale, and lead through exceptional software."
        primaryBtn={{ label: 'Work With Us', href: '/contact' }}
      />

      {/* -- COMPANY STORY --------------------------------------------------- */}
      <section className="bg-[#0D0F12] border-t border-[#1F2530]">
        <div className="max-w-350 mx-auto px-6 lg:px-10 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            {/* Text col */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-7"
            >
              <span className="label text-[#1B6FFF] mb-3 block">OUR STORY</span>
              <h2 className="text-4xl lg:text-5xl font-bold text-[#EEF0F3] tracking-[-0.035em] leading-[1.1] mb-8">
                From a Small Dev Shop<br />to a Technology Powerhouse
              </h2>
              <div className="space-y-4 text-[#8892A4] leading-relaxed text-[15px]">
                <p>
                  PROGREX was founded in 2018 by a team of passionate engineers tired of seeing businesses fail due to poor technology choices. We started with a simple mission: build software that actually works � on time, within budget, and built to last.
                </p>
                <p>
                  What began as a 3-person freelance team has grown into a 25+ member technology company serving clients across the Philippines, Southeast Asia, and beyond. We&apos;ve delivered over 150 projects spanning healthcare, education, retail, manufacturing, and government.
                </p>
                <p>
                  Today, PROGREX is recognized as one of the most reliable technology partners in the region � not just for the quality of our code, but for the depth of our client relationships.
                </p>
              </div>
            </motion.div>

            {/* Stats col */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-5 grid grid-cols-2 gap-px bg-[#1F2530]"
            >
              {stats.map((stat, i) => (
                <div key={i} className="bg-[#111417] p-8 flex flex-col justify-between">
                  <span className="font-mono text-[10px] text-[#4E5A6E] tracking-[0.14em] uppercase mb-4 block">
                    {stat.label}
                  </span>
                  <div className="text-4xl font-bold text-[#EEF0F3] tracking-[-0.04em]">{stat.value}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* -- MISSION & VISION ------------------------------------------------ */}
      <section className="bg-[#111417] border-t border-[#1F2530]">
        <div className="max-w-350 mx-auto px-6 lg:px-10 py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#1F2530]">
            {[
              {
                label: 'OUR MISSION',
                title: 'Technology that creates real business impact.',
                desc: 'We exist to help businesses leverage technology as a competitive advantage � not a cost center. Every system we build is designed to solve real problems, generate real value, and scale with your ambitions.',
              },
              {
                label: 'OUR VISION',
                title: "To be Southeast Asia's most trusted technology partner.",
                desc: 'We envision a future where every business � regardless of size � has access to world-class technology solutions. PROGREX will lead that transformation by combining deep technical expertise with genuine partnership.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="bg-[#111417] p-10 group relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-0.75 bg-[#1B6FFF] scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top" />
                <span className="label text-[#1B6FFF] mb-5 block">{item.label}</span>
                <h3 className="text-2xl font-semibold text-[#EEF0F3] mb-4 leading-snug tracking-[-0.02em]">{item.title}</h3>
                <p className="text-[#8892A4] leading-relaxed text-[15px]">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* -- CORE VALUES ----------------------------------------------------- */}
      <section className="bg-[#0D0F12] border-t border-[#1F2530]">
        <div className="max-w-350 mx-auto px-6 lg:px-10 py-24">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
            <div>
              <span className="label text-[#1B6FFF] mb-3 block">WHAT WE STAND FOR</span>
              <h2 className="text-4xl lg:text-5xl font-bold text-[#EEF0F3] tracking-[-0.035em] leading-[1.1]">
                Our Core Values
              </h2>
            </div>
            <p className="text-[#8892A4] text-base max-w-sm lg:text-right leading-relaxed">
              These aren&apos;t wall posters. They are the principles that guide every decision, every sprint, every client interaction.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#1F2530]">
            {coreValues.map((val, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-[#0D0F12] p-8 group hover:bg-[#111417] transition-colors"
              >
                <span className="font-mono text-[11px] text-[#4E5A6E] tracking-[0.12em] mb-5 block">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="text-base font-semibold text-[#EEF0F3] mb-3 group-hover:text-white transition-colors">
                  {val.title}
                </h3>
                <p className="text-[#8892A4] text-sm leading-relaxed">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* -- TEAM ------------------------------------------------------------ */}
      <section className="bg-[#111417] border-t border-[#1F2530]" id="team">
        <div className="max-w-350 mx-auto px-6 lg:px-10 py-24">
          <div className="mb-16">
            <span className="label text-[#1B6FFF] mb-3 block">THE PEOPLE BEHIND PROGREX</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-[#EEF0F3] tracking-[-0.035em] leading-[1.1]">
              Meet Our Team
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#1F2530]">
            {team.map((member, i) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-[#111417] p-8 group hover:bg-[#161A1F] transition-colors"
              >
                <div className="w-12 h-12 bg-[#1B6FFF] flex items-center justify-center text-white font-bold text-lg mb-5">
                  {member.name.charAt(0)}
                </div>
                <h3 className="text-base font-semibold text-[#EEF0F3] mb-1">{member.name}</h3>
                <div className="font-mono text-[11px] text-[#1B6FFF] tracking-widest uppercase mb-4">{member.role}</div>
                <p className="text-[#8892A4] text-sm leading-relaxed mb-5">{member.bio}</p>
                <div className="flex gap-2 pt-4 border-t border-[#1F2530]">
                  <a
                    href={member.linkedin}
                    className="w-7 h-7 border border-[#1F2530] flex items-center justify-center text-[#4E5A6E] hover:text-[#1B6FFF] hover:border-[#1B6FFF]/40 transition-all"
                    aria-label="LinkedIn"
                  >
                    <Linkedin size={12} />
                  </a>
                  <a
                    href={member.github}
                    className="w-7 h-7 border border-[#1F2530] flex items-center justify-center text-[#4E5A6E] hover:text-[#1B6FFF] hover:border-[#1B6FFF]/40 transition-all"
                    aria-label="GitHub"
                  >
                    <Github size={12} />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* -- WHY CHOOSE US --------------------------------------------------- */}
      <section className="bg-[#0D0F12] border-t border-[#1F2530]">
        <div className="max-w-350 mx-auto px-6 lg:px-10 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-5">
              <span className="label text-[#1B6FFF] mb-3 block">WHY PROGREX</span>
              <h2 className="text-4xl lg:text-5xl font-bold text-[#EEF0F3] tracking-[-0.035em] leading-[1.1] mb-6">
                Why 80+ Businesses Choose Us
              </h2>
              <p className="text-[#8892A4] text-[15px] leading-relaxed mb-8">
                We don&apos;t just write code. We build solutions that generate real business outcomes.
              </p>
              <Link href="/contact" className="btn-primary inline-flex text-sm px-6 py-3">
                <span>Start a Project</span> <ArrowRight size={15} />
              </Link>
            </div>

            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#1F2530]">
                {['Production-quality code, zero shortcuts', 'Transparent pricing and timelines', 'Direct access to senior developers', 'Post-launch support included', 'Scalable architecture from day one', 'NDA-protected, all IP transferred to you', 'Agile process with weekly demos', 'Modern tech stack, no legacy code'].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                    className="bg-[#0D0F12] px-6 py-5 flex items-start gap-4 group hover:bg-[#111417] transition-colors"
                  >
                    <span className="font-mono text-[10px] text-[#1B6FFF] tracking-widest pt-0.5 shrink-0">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[#8892A4] text-sm leading-relaxed group-hover:text-[#EEF0F3] transition-colors">
                      {item}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -- PROCESS --------------------------------------------------------- */}
      <section className="bg-[#111417] border-t border-[#1F2530]">
        <div className="max-w-350 mx-auto px-6 lg:px-10 py-24">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
            <div>
              <span className="label text-[#1B6FFF] mb-3 block">HOW WE WORK</span>
              <h2 className="text-4xl lg:text-5xl font-bold text-[#EEF0F3] tracking-[-0.035em] leading-[1.1]">
                Our Proven Process
              </h2>
            </div>
            <p className="text-[#8892A4] text-base max-w-sm lg:text-right leading-relaxed">
              A structured, transparent process that delivers great results � every time.
            </p>
          </div>

          <div className="border-t border-[#1F2530]">
            {processSteps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="grid grid-cols-12 gap-8 py-8 border-b border-[#1F2530] group hover:bg-[#161A1F] transition-colors px-4 -mx-4"
              >
                <div className="col-span-2 sm:col-span-1">
                  <span className="font-mono text-[11px] text-[#1B6FFF] tracking-[0.12em]">{step.step}</span>
                </div>
                <div className="col-span-10 sm:col-span-3">
                  <h3 className="text-base font-semibold text-[#EEF0F3] group-hover:text-white transition-colors">
                    {step.title}
                  </h3>
                </div>
                <div className="col-span-12 sm:col-span-8 sm:col-start-5">
                  <p className="text-[#8892A4] text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* -- CTA ------------------------------------------------------------- */}
      <CTASection
        title="Ready to Work With Us?"
        subtitle="Let's discuss your project and see how PROGREX can help you achieve your technology goals."
        primaryBtn={{ label: 'Get a Free Consultation', href: '/contact' }}
        secondaryBtn={{ label: 'See Our Projects', href: '/projects' }}
      />
    </>
  )
}


