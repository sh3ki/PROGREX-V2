'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, ChevronDown, Monitor, ArrowRight } from 'lucide-react'
import Hero from '@/components/Hero'
import SectionWrapper, { SectionHeader } from '@/components/SectionWrapper'
import CTASection from '@/components/CTASection'
import { systems } from '@/lib/mockData'

export default function ReadyMadeSystemsClient() {
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
        badge="Launch in Days, Not Months"
        title="Ready-Made Business"
        highlight="Systems"
        subtitle="Production-ready software systems built for Philippine businesses. Customizable, scalable, and battle-tested. No long development cycles â€â€� deploy in days."
        primaryBtn={{ label: 'Get a Demo', href: '/contact' }}
      />

      {/* Systems */}
      {systems.map((sys, si) => (
        <SectionWrapper key={sys.id} className={si % 2 === 0 ? 'bg-[#0A0A0F]' : 'bg-[#0F0F14]'} id={sys.slug}>
          {si % 2 !== 0 && <div className="absolute inset-0 tech-grid opacity-30 pointer-events-none" />}
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-start ${si % 2 === 1 ? 'direction-rtl' : ''}`}>
            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: si % 2 === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className={si % 2 === 1 ? 'lg:order-2' : ''}
            >
              <div className="flex items-center gap-2 mb-4">
                <Monitor size={11} className="text-[#7C2AE8]" />
                <span className="sys-label-accent">READY-MADE SYSTEM</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#F0EEF8] mb-2 leading-tight">
                {sys.name}
              </h2>
              <p className="text-[#C4B5FD] text-xs font-mono mb-3">{sys.tagline}</p>
              <p className="text-[#5A5770] leading-relaxed mb-6 text-sm font-light">{sys.shortDesc}</p>

              {/* Features */}
              <div className="sys-label mb-3">FEATURES INCLUDED</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                {sys.features.map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <CheckCircle size={11} className="text-[#7C2AE8] shrink-0" />
                    <span className="text-xs text-[#9B98B3] font-light">{f}</span>
                  </div>
                ))}
              </div>

              {/* FAQs */}
              <div className="sys-label mb-3">FAQS</div>
              <div className="space-y-[1px] bg-[#1A1A24] border border-[#1A1A24] mb-6">
                {sys.faqs.map((faq, fi) => {
                  const isOpen = openFaq?.sys === sys.id && openFaq.idx === fi
                  return (
                    <div key={fi} className="bg-[#0F0F14] overflow-hidden">
                      <button
                        onClick={() => toggleFaq(sys.id, fi)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-[#14141B] transition-colors"
                      >
                        <span className="text-xs font-medium text-[#D1CEE8]">{faq.q}</span>
                        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-[#4C1D95] shrink-0 ml-3">
                          <ChevronDown size={13} />
                        </motion.span>
                      </button>
                      <motion.div
                        initial={false}
                        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 text-[#5A5770] text-[11px] leading-relaxed border-t border-[#1A1A24] pt-2 font-light">{faq.a}</div>
                      </motion.div>
                    </div>
                  )
                })}
              </div>

              <a href="/contact" className="btn-sys-filled inline-flex">
                GET A DEMO / BUY NOW <ArrowRight size={13} />
              </a>
            </motion.div>

            {/* Pricing */}
            <motion.div
              initial={{ opacity: 0, x: si % 2 === 0 ? 40 : -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className={`space-y-3 ${si % 2 === 1 ? 'lg:order-1' : ''}`}
            >
              {/* Screenshot placeholder */}
              <div className="relative h-48 border border-[#1E1E2E] bg-[#0A0A0F] tech-grid flex items-center justify-center mb-4 overflow-hidden">
                <div className="text-center">
                  <Monitor size={24} className="text-[#4C1D95] mx-auto mb-2 opacity-60" />
                  <div className="sys-label">{sys.name.toUpperCase()} â€â€� PREVIEW</div>
                </div>
              </div>

              <div className="sys-label mb-3">PRICING PLANS</div>
              <div className="space-y-[1px] bg-[#1A1A24] border border-[#1A1A24]">
                {sys.pricing.map((plan, pi) => (
                  <motion.div
                    key={pi}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: pi * 0.08 }}
                    className={`p-5 transition-colors relative ${
                      pi === 1
                        ? 'bg-[#14141B] border-l-2 border-l-[#7C2AE8]'
                        : 'bg-[#0F0F14] hover:bg-[#14141B]'
                    }`}
                  >
                    {pi === 1 && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-0.5 text-[9px] font-mono tracking-widest bg-[#7C2AE8] text-white">POPULAR</span>
                      </div>
                    )}
                    <div className="flex items-baseline justify-between gap-4 mb-3">
                      <div>
                        <div className="text-[#D1CEE8] text-sm font-semibold">{plan.plan}</div>
                        <div className="sys-label mt-0.5">{plan.type === 'one-time' ? 'ONE-TIME PAYMENT' : 'MONTHLY SUBSCRIPTION'}</div>
                      </div>
                      <div className="data-value text-[#C4B5FD] text-xl">{plan.price}</div>
                    </div>
                    <div className="space-y-1 font-mono text-[10px] text-[#3A3854]">
                      {'students' in plan && <div>USERS: {(plan as { students: string }).students}</div>}
                      {'users' in plan && <div>USERS: {(plan as { users: string }).users}</div>}
                      {'employees' in plan && <div>EMPLOYEES: {(plan as { employees: string }).employees}</div>}
                      <div>SUPPORT: {plan.support}</div>
                      {sys.hasDemo && <div>FREE DEMO INCLUDED</div>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </SectionWrapper>
      ))}

      <CTASection
        title="Need a Custom System?"
        subtitle="Don't see exactly what you need? We build custom systems from scratch tailored to your specific requirements."
        primaryBtn={{ label: 'Contact Us', href: '/contact' }}
        secondaryBtn={{ label: 'Custom Software', href: '/services/custom-software-development' }}
      />
    </>
  )
}
