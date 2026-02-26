import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Target, Zap, Lock, TrendingUp } from 'lucide-react'
import Hero from '@/components/Hero'
import SectionWrapper, { SectionHeader } from '@/components/SectionWrapper'
import ConstellationDecor from '@/components/ConstellationDecor'
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

      <SectionWrapper className="bg-section-a" decoration={<ConstellationDecor name="orion" side="right" offsetY="12%" />}>
        <SectionHeader
          badge="Our Capabilities"
          title="Six Core Service"
          highlight="Areas"
          subtitle="Specialized expertise across the full technology stack — designed to deliver measurable results."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
      <SectionWrapper className="bg-section-b" decoration={<ConstellationDecor name="bigdipper" side="left" offsetY="20%" />}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="eyebrow-badge mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-nebula-500 animate-pulse" />
              Our Approach
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-5 leading-tight">
              We Don&apos;t Just Write Code — <span className="text-gradient-nebula">We Solve Problems</span>
            </h2>
            <p className="text-slate-400 leading-relaxed mb-6">
              Every engagement starts with understanding your business goals, not your technical requirements. We then map the right technology to the right problem, ensuring maximum ROI and minimal technical debt.
            </p>
            <Link href="/contact" className="btn-primary inline-flex text-sm">
              <span>Discuss Your Project</span>
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: <Target size={20} className="text-nebula-400" />, title: 'Goal-Oriented', desc: 'We align every technical decision with your business objectives.' },
              { icon: <Zap size={20} className="text-aurora-400" />, title: 'Agile Delivery', desc: 'Weekly sprints with demos, feedback, and iteration.' },
              { icon: <Lock size={20} className="text-pulsar-400" />, title: 'Secure by Design', desc: 'Security best practices baked into every layer.' },
              { icon: <TrendingUp size={20} className="text-nebula-300" />, title: 'Scalable First', desc: 'Built to handle your growth — today and tomorrow.' },
            ].map((item, i) => (
              <div key={i} className="glass-card rounded-xl p-4 border border-nebula-700/15 hover:border-nebula-600/40 transition-colors">
                <div className="mb-2">{item.icon}</div>
                <div className="text-sm font-bold text-white mb-1">{item.title}</div>
                <div className="text-xs text-white/50 leading-relaxed">{item.desc}</div>
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
