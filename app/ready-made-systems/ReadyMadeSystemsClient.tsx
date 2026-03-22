'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, ChevronDown, Monitor, ArrowRight, Users, LifeBuoy, PlayCircle } from 'lucide-react'
import Image from 'next/image'
import Hero from '@/components/Hero'
import ConstellationDecor from '@/components/ConstellationDecor'
import SectionWrapper from '@/components/SectionWrapper'
import CTASection from '@/components/CTASection'
import { useTranslation } from '@/components/TranslationProvider'

type ReadySystem = {
  id: string
  slug: string
  category: string
  industry: string
  name: string
  tagline: string
  shortDesc: string
  image: string
  hasDemo: boolean
  features: string[]
  faqs: Array<{ q: string; a: string }>
  pricing: Array<{ plan: string; price: string; type: string; support: string; students?: string; users?: string; employees?: string }>
}

export default function ReadyMadeSystemsClient({ systemsData }: { systemsData: ReadySystem[] }) {
  const { t, translations } = useTranslation()
  const [openFaq, setOpenFaq] = useState<{ sys: string; idx: number } | null>(null)

  const toggleFaq = (sysId: string, idx: number) => {
    if (openFaq?.sys === sysId && openFaq.idx === idx) {
      setOpenFaq(null)
    } else {
      setOpenFaq({ sys: sysId, idx })
    }
  }

  return (
    <>
      <Hero
        badge={t('readyMade.heroBadge')}
        title={t('readyMade.heroTitle')}
        highlight={t('readyMade.heroHighlight')}
        subtitle={t('readyMade.heroSubtitle')}
        primaryBtn={{ label: t('readyMade.heroPrimaryBtn'), href: '/contact' }}
      />

      {/* Systems */}
      {systemsData.map((sys, si) => {
        const tSys = translations.data.systems[sys.slug as keyof typeof translations.data.systems]
        const tFeatures = tSys?.features as unknown as string[] | undefined
        const tFaqs = tSys?.faqs as unknown as string[][] | undefined
        const tPricing = tSys?.pricing as unknown as string[][] | undefined
        const sysName = (tSys?.name ?? sys.name) as string
        const sysTagline = (tSys?.tagline ?? sys.tagline) as string
        const sysShortDesc = (tSys?.shortDesc ?? sys.shortDesc) as string

        return (
        <SectionWrapper key={sys.id} className={si % 2 === 0 ? 'bg-section-a' : 'bg-section-b'} id={sys.slug} decoration={<ConstellationDecor name={(['orion','bigdipper','cassiopeia','scorpius','leo','crux','gemini'] as const)[si % 7]} side={si % 2 === 0 ? 'left' : 'right'} offsetY="20%" />}>
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-start ${si % 2 === 1 ? 'direction-rtl' : ''}`}>
            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: si % 2 === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className={si % 2 === 1 ? 'lg:order-2' : ''}
            >
              <div className="eyebrow-badge mb-3">
                <Monitor size={12} />
                {t('readyMade.systemBadge')}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 leading-tight">
                {sysName}
              </h2>
              <p className="text-nebula-300/80 text-sm font-mono mb-3 italic">{sysTagline}</p>
              <p className="text-slate-400 leading-relaxed mb-6 text-sm">{sysShortDesc}</p>

              {/* Features */}
              <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wide">{t('readyMade.featuresHeading')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                {sys.features.map((f, fIdx) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-white/70">
                    <CheckCircle size={14} className="text-nebula-500 shrink-0" />
                    {(tFeatures?.[fIdx] ?? f) as string}
                  </div>
                ))}
              </div>

              {/* FAQs */}
              <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wide">{t('readyMade.faqsHeading')}</h3>
              <div className="space-y-2 mb-6">
                {sys.faqs.map((faq, fi) => {
                  const isOpen = openFaq?.sys === sys.id && openFaq.idx === fi
                  return (
                    <div key={fi} className="glass-card rounded-xl border border-nebula-700/20 overflow-hidden">
                      <button
                        onClick={() => toggleFaq(sys.id, fi)}
                        className="w-full flex items-center justify-between p-4 text-left"
                      >
                        <span className="text-sm font-medium text-white">{(tFaqs?.[fi]?.[0] ?? faq.q) as string}</span>
                        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-nebula-500 shrink-0 ml-3">
                          <ChevronDown size={16} />
                        </motion.span>
                      </button>
                      <motion.div
                        initial={false}
                        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 text-slate-400 text-xs leading-relaxed border-t border-white/5 pt-2">{(tFaqs?.[fi]?.[1] ?? faq.a) as string}</div>
                      </motion.div>
                    </div>
                  )
                })}
              </div>

              <a href="/contact" className="btn-primary inline-flex text-sm">
                <span>{t('readyMade.getDemo')}</span>
                <ArrowRight size={15} />
              </a>
            </motion.div>

            {/* Pricing */}
            <motion.div
              initial={{ opacity: 0, x: si % 2 === 0 ? 40 : -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className={`space-y-4 ${si % 2 === 1 ? 'lg:order-1' : ''}`}
            >
              {/* Screenshot — 16:9 */}
              <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 border border-nebula-700/20"
                style={{ boxShadow: '0 0 40px rgba(14,165,233,0.08), 0 16px 48px rgba(0,0,0,0.5)' }}
              >
                {sys.image ? (
                  <>
                    <Image
                      src={sys.image}
                      alt={sys.name}
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    {/* dark overlay for readability */}
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(3,3,15,0.08) 0%, rgba(3,3,15,0.55) 100%)' }} />
                    {/* top accent line */}
                    <div className="absolute inset-x-0 top-0 h-0.5" style={{ background: 'linear-gradient(to right, transparent, #0EA5E9, #7C3AED, transparent)' }} />
                    {/* label badge */}
                    <div className="absolute bottom-3 left-3">
                      <span className="font-mono text-[10px] px-2.5 py-1 rounded-full backdrop-blur-sm"
                        style={{ background: 'rgba(14,165,233,0.22)', border: '1px solid rgba(14,165,233,0.45)', color: '#93E6FB' }}
                      >
                        {sysName.split('—')[0].trim()}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-dot-grid opacity-20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Monitor size={32} className="text-nebula-600/60 mx-auto mb-2" />
                        <div className="text-white/30 text-xs font-mono">{sysName} / preview</div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <h3 className="text-white font-bold text-sm uppercase tracking-wide mb-3">{t('readyMade.pricingHeading')}</h3>
              {sys.pricing.map((plan, pi) => {
                const tp = tPricing?.[pi] as unknown as string[] | undefined
                const planName = (tp?.[0] ?? plan.plan) as string
                const planPrice = (tp?.[1] ?? plan.price) as string
                const planFreq = (tp?.[2] ?? plan.type) as string
                const planLimit = (tp?.[3] ?? ('students' in plan ? plan.students : 'users' in plan ? plan.users : (plan as Record<string, unknown>).employees)) as string
                const planSupport = (tp?.[4] ?? plan.support) as string

                return (
                <motion.div
                  key={pi}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: pi * 0.1 }}
                  className={`glass-card rounded-xl p-5 border transition-all duration-300 ${
                    pi === 1
                      ? 'border-nebula-500/60 shadow-nebula relative'
                      : 'border-nebula-700/15 hover:border-nebula-600/40'
                  }`}
                >
                  {pi === 1 && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-1 rounded-full bg-linear-to-r from-nebula-700 to-aurora-600 text-white text-xs font-bold shadow-nebula-sm">
                        {t('readyMade.mostPopular')}
                      </span>
                    </div>
                  )}
                  <div className="flex items-baseline justify-between gap-4 mb-3">
                    <div>
                      <div className="text-white font-bold">{planName}</div>
                      <div className="text-slate-500 text-xs">{planFreq === 'one-time' ? t('readyMade.oneTime') : t('readyMade.monthly')}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-extrabold text-gradient-nebula">{planPrice}</div>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-white/50 font-mono">
                    {planLimit && <div className="flex items-center gap-1.5"><Users size={11} className="text-nebula-500" /> {planLimit}</div>}
                    <div className="flex items-center gap-1.5"><LifeBuoy size={11} className="text-nebula-500" /> {t('readyMade.supportPrefix')}{planSupport}</div>
                    {sys.hasDemo && <div className="flex items-center gap-1.5"><PlayCircle size={11} className="text-nebula-400" /> {t('readyMade.freeDemo')}</div>}
                  </div>
                </motion.div>
                )
              })}
            </motion.div>
          </div>
        </SectionWrapper>
        )
      })}

      <CTASection
        title={t('readyMade.ctaTitle')}
        subtitle={t('readyMade.ctaSubtitle')}
        primaryBtn={{ label: t('readyMade.ctaPrimaryBtn'), href: '/contact' }}
        secondaryBtn={{ label: t('readyMade.ctaSecondaryBtn'), href: '/services/custom-software-development' }}
      />
    </>
  )
}
