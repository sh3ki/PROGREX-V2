import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Hero from '@/components/Hero'
import SectionWrapper, { SectionHeader } from '@/components/SectionWrapper'
import ServiceCard from '@/components/ServiceCard'
import CTASection from '@/components/CTASection'
import { services } from '@/lib/mockData'

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Explore PROGREX\'s comprehensive technology services — custom software development, web & mobile apps, system integration, academic systems, and IT consulting.',
}

export default function ServicesPage() {
  return (
    <>
      <Hero
        badge="What We Do"
        title="Technology Services Built"
        highlight="For Growth"
        subtitle="From concept to deployment, PROGREX delivers end-to-end technology solutions tailored to your unique business needs."
        primaryBtn={{ label: 'Get a Quote', href: '/contact' }}
      />

      <SectionWrapper className="bg-[#0A0A0F]">
        <SectionHeader
          badge="Our Capabilities"
          title="Six Core Service"
          highlight="Areas"
          subtitle="Specialized expertise across the full technology stack — designed to deliver measurable results."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-[#1A1A24] border border-[#1A1A24]">
          {services.map((service, i) => (
            <ServiceCard
              key={service.id}
              title={service.title}
              shortDesc={service.shortDesc}
              icon={service.icon}
              slug={service.slug}
              color={service.color}
              index={i}
            />
          ))}
        </div>
      </SectionWrapper>

      {/* Approach section */}
      <SectionWrapper className="bg-[#0F0F14]">
        <div className="absolute inset-0 tech-grid opacity-30 pointer-events-none" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-3 h-[2px] bg-[#7C2AE8]" />
              <span className="sys-label-accent">OUR APPROACH</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#F0EEF8] mb-5 leading-tight">
              We Don&apos;t Just Write Code — <span className="text-[#C4B5FD]">We Solve Problems</span>
            </h2>
            <p className="text-[#5A5770] leading-relaxed mb-6 text-sm font-light">
              Every engagement starts with understanding your business goals, not your technical requirements. We then map the right technology to the right problem, ensuring maximum ROI and minimal technical debt.
            </p>
            <Link href="/contact" className="btn-sys-filled inline-flex">
              DISCUSS YOUR PROJECT <ArrowRight size={13} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-[1px] bg-[#1A1A24] border border-[#1A1A24]">
            {[
              { icon: '🎯', title: 'Goal-Oriented', desc: 'We align every technical decision with your business objectives.' },
              { icon: '⚡', title: 'Agile Delivery', desc: 'Weekly sprints with demos, feedback, and iteration.' },
              { icon: '🔒', title: 'Secure by Design', desc: 'Security best practices baked into every layer.' },
              { icon: '📈', title: 'Scalable First', desc: 'Built to handle your growth — today and tomorrow.' },
            ].map((item, i) => (
              <div key={i} className="bg-[#0F0F14] p-5 hover:bg-[#14141B] transition-colors group">
                <div className="text-xl mb-2 opacity-60">{item.icon}</div>
                <div className="text-xs font-semibold text-[#D1CEE8] mb-1 group-hover:text-[#C4B5FD] transition-colors">{item.title}</div>
                <div className="text-[10px] text-[#3A3854] leading-relaxed font-light">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      <CTASection
        title="Not Sure Which Service You Need?"
        subtitle="Book a free 30-minute consultation with our team. We'll analyze your needs and recommend the right approach."
        primaryBtn={{ label: 'Book Free Consultation', href: '/contact' }}
        secondaryBtn={{ label: 'View Case Studies', href: '/projects' }}
      />
    </>
  )
}
