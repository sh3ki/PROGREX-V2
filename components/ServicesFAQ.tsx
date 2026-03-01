'use client'

import { ChevronRight } from 'lucide-react'

const FAQS = [
  {
    q: 'How long does a typical project take?',
    a: 'Timelines depend on scope and complexity. A landing site may take 1–2 weeks, while a full custom platform typically ranges from 6–16 weeks. We share a detailed timeline at the start of every engagement.',
  },
  {
    q: 'Do you work with international clients?',
    a: 'Absolutely. We work with clients across the Philippines, the US, Australia, and the Middle East. All communication is in English and we adapt to your timezone for meetings.',
  },
  {
    q: 'What happens after the project is delivered?',
    a: 'Every project includes a post-launch support window. After that, we offer flexible maintenance retainers, feature sprints, and long-term partnership agreements to keep your system growing.',
  },
  {
    q: 'Can we hire a dedicated developer from PROGREX?',
    a: 'Yes. We offer dedicated developer engagements where a senior engineer is allocated full-time or part-time to your project, embedded in your workflow and under your direction.',
  },
  {
    q: 'Do you sign NDAs before project discussions?',
    a: 'Always. We sign a mutual NDA before any detailed project discussion. Your ideas, data, and business plans are completely safe with us.',
  },
  {
    q: 'How does pricing and billing work?',
    a: 'We offer fixed-price project billing for well-defined scopes, and time-and-materials billing for agile or evolving projects. Payment milestones are agreed upfront and tied to deliverables.',
  },
]

export default function ServicesFAQ() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto">
      {FAQS.map((item, i) => (
        <div
          key={i}
          className="group relative rounded-xl p-6 overflow-hidden"
          style={{
            background: 'rgba(8,8,28,0.92)',
            border: '1px solid rgba(103,232,249,0.12)',
            transition: 'border-color 0.25s, box-shadow 0.25s',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLDivElement
            el.style.borderColor = 'rgba(14,165,233,0.35)'
            el.style.boxShadow = '0 0 24px rgba(14,165,233,0.12), 0 8px 32px rgba(0,0,0,0.4)'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLDivElement
            el.style.borderColor = 'rgba(103,232,249,0.12)'
            el.style.boxShadow = 'none'
          }}
        >
          {/* Circuit texture */}
          <div
            className="absolute inset-0 pointer-events-none opacity-50"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44'%3E%3Cline x1='0' y1='22' x2='16' y2='22' stroke='rgba(103,232,249,0.06)' stroke-width='0.7'/%3E%3Cline x1='28' y1='22' x2='44' y2='22' stroke='rgba(103,232,249,0.06)' stroke-width='0.7'/%3E%3Cline x1='22' y1='0' x2='22' y2='16' stroke='rgba(103,232,249,0.06)' stroke-width='0.7'/%3E%3Cline x1='22' y1='28' x2='22' y2='44' stroke='rgba(103,232,249,0.06)' stroke-width='0.7'/%3E%3Ccircle cx='22' cy='22' r='4' fill='none' stroke='rgba(103,232,249,0.09)' stroke-width='0.8'/%3E%3Ccircle cx='22' cy='22' r='1.2' fill='rgba(103,232,249,0.11)'/%3E%3C/svg%3E\")",
              backgroundSize: '44px 44px',
            }}
          />
          {/* Top scan line */}
          <div
            className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(to right, transparent, rgba(14,165,233,0.7), rgba(124,58,237,0.7), transparent)' }}
          />
          <div className="relative">
            <div className="flex items-start gap-3 mb-3">
              <ChevronRight size={16} className="text-nebula-400 shrink-0 mt-0.5" />
              <h3 className="text-white font-semibold text-base leading-snug group-hover:text-nebula-200 transition-colors">{item.q}</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed pl-5">{item.a}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
