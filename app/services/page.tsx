import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Hero from '@/components/Hero'
import SectionWrapper, { SectionHeader } from '@/components/SectionWrapper'
import ConstellationDecor from '@/components/ConstellationDecor'
import CTASection from '@/components/CTASection'
import ServicesTechMarquee from '@/components/ServicesTechMarquee'
import ServiceCarousel from '@/components/ServiceCarousel'
import { OutcomesSection, QualitySection, ArchitectureSection, GuaranteesSection, ApproachCards } from '@/components/ServicesDetailSections'
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
          title="Core Service"
          highlight="Areas"
          subtitle="Specialized expertise across the full technology stack — designed to deliver measurable results."
        />
        <ServiceCarousel services={services} />
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
          <ApproachCards />
        </div>
      </SectionWrapper>

      {/* Outcomes We Deliver */}
      <SectionWrapper className="bg-section-a" decoration={<ConstellationDecor name="pleiades" side="right" offsetY="12%" />}>
        <SectionHeader
          badge="Outcomes We Deliver"
          title="Real Results, Not Just"
          highlight="Features"
          subtitle="Every engagement is measured by the tangible impact it creates — for your business, your users, and your bottom line."
        />
        <OutcomesSection />
      </SectionWrapper>

      {/* Quality & Security Standards */}
      <SectionWrapper className="bg-section-b" decoration={<ConstellationDecor name="cassiopeia" side="left" offsetY="18%" />}>
        <SectionHeader
          badge="Quality & Security"
          title="Standards We Build"
          highlight="To"
          subtitle="Security and quality are not afterthoughts — they are baked into our development process from the very first line of code."
        />
        <QualitySection />
      </SectionWrapper>

      {/* What Makes Our Architecture Different */}
      <SectionWrapper className="bg-section-a" decoration={<ConstellationDecor name="orion" side="right" offsetY="20%" />}>
        <SectionHeader
          badge="Architecture"
          title="What Makes Our Architecture"
          highlight="Different"
          subtitle="Decisions made at architecture level determine how well your system survives growth, integrations, and change. Here is how we think."
        />
        <ArchitectureSection />
      </SectionWrapper>

      {/* Service Guarantees */}
      <SectionWrapper className="bg-section-b" decoration={<ConstellationDecor name="bigdipper" side="left" offsetY="25%" />}>
        <GuaranteesSection />
      </SectionWrapper>

      {/* Technologies & Tools */}
      <SectionWrapper className="bg-section-a" decoration={<ConstellationDecor name="leo" side="right" offsetY="15%" />}>
        <SectionHeader
          badge="Our Stack"
          title="Technologies &"
          highlight="Tools"
          subtitle="A comprehensive, battle-tested stack spanning every layer of the modern software landscape."
        />
        <ServicesTechMarquee />
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
