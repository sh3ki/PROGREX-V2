'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ArrowRight } from 'lucide-react'
import Hero from '@/components/Hero'
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
        subtitle="Production-ready software systems built for Philippine businesses. Customizable, scalable, and battle-tested. No long development cycles â€” deploy in days."
        primaryBtn={{ label: 'Get a Demo', href: '/contact' }}
      />

      {systems.map((sys, si) => (
        <section
          key={sys.id}
          id={sys.slug}
          className={`${si % 2 === 0 ? 'bg-[#0D0F12]' : 'bg-[#111417]'} border-y border-[#1F2530]`}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 lg:py-28">
            <div className="grid lg:grid-cols-12 gap-0">

              {/* Info â€” 7 cols */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55 }}
                className="lg:col-span-7 lg:pr-16 border-b lg:border-b-0 lg:border-r border-[#1F2530] pb-12 lg:pb-0"
              >
                <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#1B6FFF] mb-4">
                  Ready-Made System â€” {String(si + 1).padStart(2, '0')}
                </p>
                <h2 className="text-3xl lg:text-4xl font-bold tracking-[-0.03em] text-[#EEF0F3] mb-2 leading-tight">
                  {sys.name}
                </h2>
                <p className="text-[#1B6FFF] text-sm font-medium mb-4">{sys.tagline}</p>
                <p className="text-[#8892A4] text-base leading-relaxed mb-10">{sys.shortDesc}</p>

                {/* Features */}
                <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#4E5A6E] mb-4">
                  Features Included
                </p>
                <div className="divide-y divide-[#1F2530] mb-10">
                  {sys.features.map((f, fi) => (
                    <div key={f} className="grid grid-cols-12 items-center py-3">
                      <span className="col-span-1 font-mono text-[11px] text-[#1B6FFF]">
                        {String(fi + 1).padStart(2, '0')}
                      </span>
                      <span className="col-span-11 text-[#EEF0F3] text-sm">{f}</span>
                    </div>
                  ))}
                </div>

                {/* FAQs */}
                <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#4E5A6E] mb-4">
                  Frequently Asked
                </p>
                <div className="divide-y divide-[#1F2530] mb-10">
                  {sys.faqs.map((faq, fi) => {
                    const isOpen = openFaq?.sys === sys.id && openFaq.idx === fi
                    return (
                      <div key={fi}>
                        <button
                          onClick={() => toggleFaq(sys.id, fi)}
                          className="w-full grid grid-cols-12 items-center py-4 text-left group"
                        >
                          <span className="col-span-11 text-sm text-[#EEF0F3] group-hover:text-white transition-colors">
                            {faq.q}
                          </span>
                          <span className="col-span-1 flex justify-end">
                            <motion.span
                              animate={{ rotate: isOpen ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                              className={isOpen ? 'text-[#1B6FFF]' : 'text-[#4E5A6E]'}
                            >
                              <ChevronDown size={15} />
                            </motion.span>
                          </span>
                        </button>
                        <motion.div
                          initial={false}
                          animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <p className="pb-4 text-[#8892A4] text-sm leading-relaxed">{faq.a}</p>
                        </motion.div>
                      </div>
                    )
                  })}
                </div>

                <a
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#1B6FFF] text-white text-sm font-medium tracking-[0.02em] hover:bg-[#1558CC] transition-colors"
                >
                  Get a Demo / Buy Now
                  <ArrowRight size={14} />
                </a>
              </motion.div>

              {/* Pricing â€” 5 cols */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="lg:col-span-5 lg:pl-12 pt-12 lg:pt-0"
              >
                {/* Screenshot placeholder */}
                <div className="relative h-44 bg-[#0D0F12] border border-[#1F2530] mb-8 overflow-hidden">
                  <div className="absolute inset-0 bg-grid-fine opacity-20" />
                  {/* corner marks */}
                  <span className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#1B6FFF]/40" />
                  <span className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#1B6FFF]/40" />
                  <span className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#1B6FFF]/40" />
                  <span className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#1B6FFF]/40" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-mono text-[11px] text-[#4E5A6E] tracking-widest uppercase">
                      {sys.name} â€” Preview
                    </span>
                  </div>
                </div>

                <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#4E5A6E] mb-4">
                  Pricing Plans
                </p>

                <div className="grid gap-px bg-[#1F2530]">
                  {sys.pricing.map((plan, pi) => (
                    <div
                      key={pi}
                      className={`relative bg-[#0D0F12] p-5 ${pi === 1 ? 'border-l-2 border-l-[#1B6FFF]' : ''}`}
                    >
                      {pi === 1 && (
                        <span className="absolute top-4 right-4 font-mono text-[9px] tracking-[0.12em] uppercase bg-[#1B6FFF] text-white px-2 py-0.5">
                          Most Popular
                        </span>
                      )}
                      <div className="flex items-baseline justify-between mb-3">
                        <div>
                          <p className="text-[#EEF0F3] font-semibold text-sm">{plan.plan}</p>
                          <p className="font-mono text-[10px] text-[#4E5A6E] tracking-[0.06em]">
                            {plan.type === 'one-time' ? 'One-time payment' : 'Monthly subscription'}
                          </p>
                        </div>
                        <span className="font-mono text-xl font-bold text-[#EEF0F3]">{plan.price}</span>
                      </div>
                      <div className="space-y-1">
                        {'students' in plan && (
                          <p className="font-mono text-[11px] text-[#8892A4]">Students: {(plan as { students: string }).students}</p>
                        )}
                        {'users' in plan && (
                          <p className="font-mono text-[11px] text-[#8892A4]">Users: {(plan as { users: string }).users}</p>
                        )}
                        {'employees' in plan && (
                          <p className="font-mono text-[11px] text-[#8892A4]">Employees: {(plan as { employees: string }).employees}</p>
                        )}
                        <p className="font-mono text-[11px] text-[#8892A4]">Support: {plan.support}</p>
                        {sys.hasDemo && (
                          <p className="font-mono text-[11px] text-[#1B6FFF]">Free demo included</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

            </div>
          </div>
        </section>
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
