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
        subtitle="Production-ready software systems built for Philippine businesses. Customizable, scalable, and battle-tested. No long development cycles — deploy in days."
        primaryBtn={{ label: 'Get a Demo', href: '/contact' }}
      />

      {/* Systems */}
      {systems.map((sys, si) => (
        <SectionWrapper key={sys.id} className={si % 2 === 0 ? 'bg-[#050510]' : 'bg-[#030308]'} id={sys.slug}>
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-start ${si % 2 === 1 ? 'direction-rtl' : ''}`}>
            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: si % 2 === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className={si % 2 === 1 ? 'lg:order-2' : ''}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-[#560BAD]/30 text-[#CFA3EA] text-xs font-semibold uppercase tracking-widest mb-3">
                <Monitor size={12} />
                Ready-Made System
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 leading-tight">
                {sys.name}
              </h2>
              <p className="text-[#CFA3EA] text-sm font-medium mb-3 italic">{sys.tagline}</p>
              <p className="text-slate-400 leading-relaxed mb-6 text-sm">{sys.shortDesc}</p>

              {/* Features */}
              <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wide">Features Included</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                {sys.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle size={14} className="text-[#831DC6] shrink-0" />
                    {f}
                  </div>
                ))}
              </div>

              {/* FAQs */}
              <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wide">FAQs</h3>
              <div className="space-y-2 mb-6">
                {sys.faqs.map((faq, fi) => {
                  const isOpen = openFaq?.sys === sys.id && openFaq.idx === fi
                  return (
                    <div key={fi} className="glass-card rounded-xl border border-[#560BAD]/20 overflow-hidden">
                      <button
                        onClick={() => toggleFaq(sys.id, fi)}
                        className="w-full flex items-center justify-between p-4 text-left"
                      >
                        <span className="text-sm font-medium text-white">{faq.q}</span>
                        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-[#831DC6] shrink-0 ml-3">
                          <ChevronDown size={16} />
                        </motion.span>
                      </button>
                      <motion.div
                        initial={false}
                        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 text-slate-400 text-xs leading-relaxed border-t border-white/5 pt-2">{faq.a}</div>
                      </motion.div>
                    </div>
                  )
                })}
              </div>

              <a href="/contact" className="btn-primary inline-flex text-sm">
                <span>Get a Demo / Buy Now</span>
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
              {/* Screenshot placeholder */}
              <div className="relative h-52 rounded-2xl bg-gradient-to-br from-[#3A0CA3]/30 to-[#4361EE]/20 border border-[#560BAD]/20 overflow-hidden mb-4">
                <div className="absolute inset-0 bg-grid opacity-30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Monitor size={32} className="text-[#560BAD]/60 mx-auto mb-2" />
                    <div className="text-slate-600 text-xs">{sys.name} — Screenshot Preview</div>
                  </div>
                </div>
              </div>

              <h3 className="text-white font-bold text-sm uppercase tracking-wide mb-3">Pricing Plans</h3>
              {sys.pricing.map((plan, pi) => (
                <motion.div
                  key={pi}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: pi * 0.1 }}
                  className={`glass-card rounded-xl p-5 border transition-all duration-300 ${
                    pi === 1
                      ? 'border-[#560BAD]/60 shadow-[0_0_20px_rgba(86,11,173,0.25)] relative'
                      : 'border-[#560BAD]/15 hover:border-[#560BAD]/40'
                  }`}
                >
                  {pi === 1 && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#560BAD] to-[#4361EE] text-white text-xs font-bold shadow-[0_0_10px_rgba(86,11,173,0.5)]">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className="flex items-baseline justify-between gap-4 mb-3">
                    <div>
                      <div className="text-white font-bold">{plan.plan}</div>
                      <div className="text-slate-500 text-xs">{plan.type === 'one-time' ? 'One-time payment' : 'Monthly subscription'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-extrabold text-gradient">{plan.price}</div>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-slate-400">
                    {'students' in plan && <div>👤 {plan.students}</div>}
                    {'users' in plan && <div>👤 {plan.users}</div>}
                    {'employees' in plan && <div>👤 {plan.employees}</div>}
                    <div>🛟 Support: {plan.support}</div>
                    {sys.hasDemo && <div>🎬 Free demo included</div>}
                  </div>
                </motion.div>
              ))}
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
