'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Hero from '@/components/Hero'
import SectionWrapper, { SectionHeader } from '@/components/SectionWrapper'
import ConstellationDecor from '@/components/ConstellationDecor'
import CTASection from '@/components/CTASection'
import ServicesTechMarquee from '@/components/ServicesTechMarquee'
import ServiceCarousel from '@/components/ServiceCarousel'
import { OutcomesSection, QualitySection, ArchitectureSection, GuaranteesSection, ApproachCards } from '@/components/ServicesDetailSections'
import { useTranslation } from '@/components/TranslationProvider'

type ServiceItem = {
  id: string
  slug: string
  title: string
  shortDesc: string
  icon: string
  color: string
}

export default function ServicesClient({ servicesData }: { servicesData: ServiceItem[] }) {
  const { t, translations } = useTranslation()

  /* Overlay translated title + shortDesc onto each service for the carousel */
  const svcMap = translations.data.services as unknown as Record<string, { title?: string; shortDesc?: string }>
  const translatedServices = servicesData.map((s) => ({
    ...s,
    title: svcMap[s.slug]?.title ?? s.title,
    shortDesc: svcMap[s.slug]?.shortDesc ?? s.shortDesc,
  }))

  return (
    <>
      <Hero
        badge={t('services.heroBadge')}
        title={t('services.heroTitle')}
        highlight={t('services.heroHighlight')}
        subtitle={t('services.heroSubtitle')}
        primaryBtn={{ label: t('services.heroPrimaryBtn'), href: '/contact' }}
      />

      <SectionWrapper className="bg-section-a" decoration={<ConstellationDecor name="orion" side="right" offsetY="12%" />}>
        <SectionHeader
          badge={t('services.capBadge')}
          title={t('services.capTitle')}
          highlight={t('services.capHighlight')}
          subtitle={t('services.capSubtitle')}
        />
        <ServiceCarousel services={translatedServices} />
      </SectionWrapper>

      {/* Approach section */}
      <SectionWrapper className="bg-section-b" decoration={<ConstellationDecor name="bigdipper" side="left" offsetY="20%" />}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="eyebrow-badge mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-nebula-500 animate-pulse" />
              {t('services.approachBadge')}
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-5 leading-tight">
              {t('services.approachHeading')} <span className="text-gradient-nebula">{t('services.approachHighlight')}</span>
            </h2>
            <p className="text-slate-400 leading-relaxed mb-6">
              {t('services.approachDesc')}
            </p>
            <Link href="/contact" className="btn-primary inline-flex text-sm">
              <span>{t('services.approachBtn')}</span>
              <ArrowRight size={16} />
            </Link>
          </div>
          <ApproachCards />
        </div>
      </SectionWrapper>

      {/* Outcomes We Deliver */}
      <SectionWrapper className="bg-section-a" decoration={<ConstellationDecor name="pleiades" side="right" offsetY="12%" />}>
        <SectionHeader
          badge={t('services.outcomesBadge')}
          title={t('services.outcomesTitle')}
          highlight={t('services.outcomesHighlight')}
          subtitle={t('services.outcomesSubtitle')}
        />
        <OutcomesSection />
      </SectionWrapper>

      {/* Quality & Security Standards */}
      <SectionWrapper className="bg-section-b" decoration={<ConstellationDecor name="cassiopeia" side="left" offsetY="18%" />}>
        <SectionHeader
          badge={t('services.qualityBadge')}
          title={t('services.qualityTitle')}
          highlight={t('services.qualityHighlight')}
          subtitle={t('services.qualitySubtitle')}
        />
        <QualitySection />
      </SectionWrapper>

      {/* What Makes Our Architecture Different */}
      <SectionWrapper className="bg-section-a" decoration={<ConstellationDecor name="orion" side="right" offsetY="20%" />}>
        <SectionHeader
          badge={t('services.archBadge')}
          title={t('services.archTitle')}
          highlight={t('services.archHighlight')}
          subtitle={t('services.archSubtitle')}
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
          badge={t('services.techBadge')}
          title={t('services.techTitle')}
          highlight={t('services.techHighlight')}
          subtitle={t('services.techSubtitle')}
        />
        <ServicesTechMarquee />
      </SectionWrapper>

      <CTASection
        title={t('services.ctaTitle')}
        subtitle={t('services.ctaSubtitle')}
        primaryBtn={{ label: t('services.ctaPrimaryBtn'), href: '/contact' }}
        secondaryBtn={{ label: t('services.ctaSecondaryBtn'), href: '/projects' }}
      />
    </>
  )
}
