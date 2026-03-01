'use client'

import { motion } from 'framer-motion'
import { CheckCircle, TrendingUp, Clock, Shield, DollarSign, Layers, Code2, Cloud, Eye, Cpu, Plug, Gauge, BadgeCheck, FileCheck, TimerReset, Lock, RefreshCw } from 'lucide-react'

// ── Shared circuit texture style ──────────────────────────────────────────────
const circuitBg: React.CSSProperties = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44'%3E%3Cline x1='0' y1='22' x2='16' y2='22' stroke='rgba(103,232,249,0.07)' stroke-width='0.7'/%3E%3Cline x1='28' y1='22' x2='44' y2='22' stroke='rgba(103,232,249,0.07)' stroke-width='0.7'/%3E%3Cline x1='22' y1='0' x2='22' y2='16' stroke='rgba(103,232,249,0.07)' stroke-width='0.7'/%3E%3Cline x1='22' y1='28' x2='22' y2='44' stroke='rgba(103,232,249,0.07)' stroke-width='0.7'/%3E%3Ccircle cx='22' cy='22' r='4' fill='none' stroke='rgba(103,232,249,0.09)' stroke-width='0.8'/%3E%3Ccircle cx='22' cy='22' r='1.2' fill='rgba(103,232,249,0.11)'/%3E%3Ccircle cx='0' cy='0' r='1.2' fill='rgba(103,232,249,0.05)'/%3E%3Ccircle cx='44' cy='0' r='1.2' fill='rgba(103,232,249,0.05)'/%3E%3Ccircle cx='0' cy='44' r='1.2' fill='rgba(103,232,249,0.05)'/%3E%3Ccircle cx='44' cy='44' r='1.2' fill='rgba(103,232,249,0.05)'/%3E%3C/svg%3E\")",
  backgroundSize: '44px 44px',
}

// ── 1. Outcomes We Deliver ────────────────────────────────────────────────────
const ACCENT = '#0EA5E9'

const OUTCOMES = [
  {
    icon: TrendingUp,
    value: '40%+',
    label: 'Efficiency Gains',
    desc: 'Clients see measurable productivity improvements within the first quarter post-launch, through automation and optimized workflows.',
  },
  {
    icon: Clock,
    value: '2–4×',
    label: 'Faster Delivery',
    desc: 'Agile sprints, CI/CD pipelines, and reusable component libraries cut your time-to-market dramatically compared to traditional approaches.',
  },
  {
    icon: Gauge,
    value: '99.9%',
    label: 'Uptime SLA',
    desc: 'Production systems engineered for reliability — redundant infrastructure, automated failover, and proactive monitoring keep you online.',
  },
  {
    icon: DollarSign,
    value: 'Real',
    label: 'Revenue Impact',
    desc: 'Software built to drive conversion, reduce churn, and generate recurring revenue — not just check feature boxes on a requirements list.',
  },
  {
    icon: Layers,
    value: '10×',
    label: 'Scale-Ready',
    desc: 'Architecture designed from day one to handle 10x growth without costly rewrites, painful migrations, or emergency refactors.',
  },
  {
    icon: Code2,
    value: 'Zero',
    label: 'Legacy Debt',
    desc: 'Clean, documented, and maintainable code with automated test coverage — no shortcuts, no unexplained hacks, no future headaches.',
  },
]

export function OutcomesSection() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {OUTCOMES.map((item, i) => {
        const Icon = item.icon
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.07 }}
            className="group relative rounded-xl overflow-hidden"
            style={{ background: 'rgba(8,8,28,0.92)', border: '1px solid rgba(103,232,249,0.12)' }}
            whileHover={{
              scale: 1.03,
              y: -5,
              boxShadow: `0 0 28px ${ACCENT}22, 0 12px 36px rgba(0,0,0,0.5)`,
              borderColor: `${ACCENT}55`,
              transition: { type: 'spring', stiffness: 260, damping: 22 },
            }}
          >
            {/* Circuit texture */}
            <div className="absolute inset-0 pointer-events-none opacity-60" style={circuitBg} />
            {/* Top scan line */}
            <div
              className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `linear-gradient(to right, transparent, ${ACCENT}cc, transparent)` }}
            />
            <div className="relative p-6">
              {/* Icon + value row */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${ACCENT}18`, border: `1px solid ${ACCENT}35` }}
                >
                  <Icon size={20} style={{ color: ACCENT }} />
                </div>
                <span
                  className="font-display font-black text-2xl text-nebula-300"
                >
                  {item.value}
                </span>
              </div>
              <h3 className="font-bold text-white text-base mb-2 group-hover:text-nebula-200 transition-colors">
                {item.label}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ── 2. Quality & Security Standards ──────────────────────────────────────────
const STANDARDS = [
  { icon: Shield,      label: 'OWASP Top 10',           desc: 'Every application is hardened against the ten most critical web security risks before deployment.' },
  { icon: Lock,        label: 'OAuth 2.0 & JWT Auth',   desc: 'Secure, stateless authentication and authorization flows on every system we build.' },
  { icon: FileCheck,   label: 'GDPR & Privacy Ready',   desc: 'Data collection policies, consent flows, and deletion mechanisms aligned with global privacy standards.' },
  { icon: BadgeCheck,  label: 'SSL/TLS Encryption',     desc: 'All data in transit is encrypted end-to-end with modern TLS protocols and certificate management.' },
  { icon: RefreshCw,   label: 'CI/CD Gated Releases',   desc: 'Automated test pipelines block any deployment that breaks existing functionality or coverage thresholds.' },
  { icon: Eye,         label: 'Code Review Policy',     desc: 'Every code change is peer-reviewed by a senior engineer before merging — no solo cowboy commits.' },
  { icon: TimerReset,  label: 'Automated Test Coverage',desc: 'Unit, integration, and end-to-end tests run on every build, ensuring regressions are caught immediately.' },
  { icon: Cpu,         label: 'Dependency Scanning',    desc: "Continuous vulnerability scanning of all third-party packages keeps your supply chain risk-free." },
]

export function QualitySection() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {STANDARDS.map((item, i) => {
        const Icon = item.icon
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.06 }}
            className="group relative rounded-xl overflow-hidden p-5"
            style={{ background: 'rgba(8,8,28,0.92)', border: '1px solid rgba(103,232,249,0.12)' }}
            whileHover={{
              y: -4,
              boxShadow: '0 0 24px rgba(14,165,233,0.14), 0 8px 28px rgba(0,0,0,0.45)',
              borderColor: 'rgba(14,165,233,0.35)',
              transition: { type: 'spring', stiffness: 280, damping: 22 },
            }}
          >
            <div className="absolute inset-0 pointer-events-none opacity-55" style={circuitBg} />
            <div
              className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: 'linear-gradient(to right, transparent, rgba(14,165,233,0.8), rgba(124,58,237,0.8), transparent)' }}
            />
            <div className="relative">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.22)' }}
              >
                <Icon size={18} className="text-nebula-400" />
              </div>
              <h3 className="text-white font-semibold text-sm mb-1.5 group-hover:text-nebula-200 transition-colors">{item.label}</h3>
              <p className="text-slate-500 text-xs leading-relaxed group-hover:text-slate-400 transition-colors">{item.desc}</p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ── 3. What Makes Our Architecture Different ──────────────────────────────────
const ARCH_ITEMS = [
  {
    icon: Plug,
    title: 'API-First Design',
    subtitle: 'Integration by default',
    desc: 'Every system we build exposes clean, versioned REST or GraphQL APIs from day one — making future integrations, mobile clients, and third-party connections straightforward, not painful.',
    tag: '// ARCH_01',
  },
  {
    icon: Cloud,
    title: 'Cloud-Native by Default',
    subtitle: 'Containerized & auto-scaling',
    desc: 'Applications are containerized with Docker, orchestrated with Kubernetes or managed cloud services, and deployed with infrastructure-as-code — so scaling is a config change, not a crisis.',
    tag: '// ARCH_02',
  },
  {
    icon: Layers,
    title: 'Microservices-Ready',
    subtitle: 'Modular from the ground up',
    desc: "We build with clear domain boundaries so systems can start as a monolith and split into microservices as you scale — without architectural rewrites or disruption to existing services.",
    tag: '// ARCH_03',
  },
  {
    icon: Eye,
    title: 'Observability Built In',
    subtitle: 'Logs, traces & metrics',
    desc: "From day one, every service emits structured logs, distributed traces, and performance metrics — giving your team full visibility into what's happening in production at any time.",
    tag: '// ARCH_04',
  },
]

export function ArchitectureSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {ARCH_ITEMS.map((item, i) => {
        const Icon = item.icon
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: i % 2 === 0 ? -24 : 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: i * 0.1 }}
            className="group relative rounded-xl overflow-hidden"
            style={{ background: 'rgba(8,8,28,0.92)', border: '1px solid rgba(103,232,249,0.12)' }}
            whileHover={{
              y: -4,
              boxShadow: `0 0 28px ${ACCENT}20, 0 12px 36px rgba(0,0,0,0.5)`,
              borderColor: `${ACCENT}45`,
              transition: { type: 'spring', stiffness: 260, damping: 22 },
            }}
          >
            <div className="absolute inset-0 pointer-events-none opacity-60" style={circuitBg} />
            <div
              className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `linear-gradient(to right, transparent, ${ACCENT}cc, transparent)` }}
            />
            <div className="relative p-6 flex gap-5 items-start">
              <div
                className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center mt-0.5"
                style={{ background: `${ACCENT}18`, border: `1px solid ${ACCENT}35` }}
              >
                <Icon size={22} style={{ color: ACCENT }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] tracking-widest text-nebula-500/60">{item.tag}</span>
                </div>
                <h3 className="text-white font-bold text-base mb-0.5 group-hover:text-nebula-200 transition-colors">{item.title}</h3>
                <p className="font-mono text-[11px] mb-2 text-nebula-400/70">{item.subtitle}</p>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ── 4. Service Guarantees  ────────────────────────────────────────────────────
const GUARANTEES = [
  'Fixed-price contracts — no surprise invoices, ever',
  'Source code ownership fully transferred on final payment',
  'Post-launch bug-fix warranty included on all deliverables',
  'Weekly progress reports and transparent communication',
  'NDA signed before every project discussion',
  'Dedicated project manager on all engagements',
  'Free 30-minute consultation — no strings attached',
  'Milestone-based delivery with clear, agreed checkpoints',
  'No scope creep — change requests handled transparently',
  'Real in-house developers — no outsourcing or hand-offs',
  'Direct Slack or Discord access to your engineering team',
  'Long-term partnership mindset — we grow with your business',
]

export function GuaranteesSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* Left — heading */}
      <div>
        <div className="eyebrow-badge mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-nebula-500 animate-pulse" />
          Our Commitment
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-5 leading-tight">
          Promises We Keep — <span className="text-gradient-nebula">Every Single Time</span>
        </h2>
        <p className="text-slate-400 leading-relaxed mb-6">
          We operate on a simple principle: say what you&apos;ll do, then do what you say. These guarantees aren&apos;t marketing copy — they are commitments enforced on every engagement we take on.
        </p>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="font-display font-black text-3xl text-nebula-300">100%</div>
            <div className="font-mono text-[10px] text-white/40 uppercase tracking-widest mt-0.5">IP Transferred</div>
          </div>
          <div className="w-px h-10 bg-nebula-700/30" />
          <div className="text-center">
            <div className="font-display font-black text-3xl text-nebula-300">80+</div>
            <div className="font-mono text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Happy Clients</div>
          </div>
          <div className="w-px h-10 bg-nebula-700/30" />
          <div className="text-center">
            <div className="font-display font-black text-3xl text-nebula-300">6+</div>
            <div className="font-mono text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Years Running</div>
          </div>
        </div>
      </div>

      {/* Right — checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {GUARANTEES.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="flex items-start gap-3 text-sm text-white/60 hover:text-white/80 transition-colors"
          >
            <CheckCircle size={15} className="text-nebula-500 shrink-0 mt-0.5" />
            <span>{item}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ── Approach Cards ────────────────────────────────────────────────────────────
const APPROACH_CARDS = [
  {
    title: 'Goal-Oriented',
    desc: 'We align every technical decision with your business objectives, ensuring every sprint moves the needle on what actually matters.',
    tag: '// APR_01',
  },
  {
    title: 'Agile Delivery',
    desc: 'Weekly sprints with working demos, real feedback loops, and transparent roadmaps — iterating fast without losing sight of quality.',
    tag: '// APR_02',
  },
  {
    title: 'Secure by Design',
    desc: 'Security best practices are baked into every layer from day one — not patched in as an afterthought before launch.',
    tag: '// APR_03',
  },
  {
    title: 'Scalable First',
    desc: 'Architecture decisions made today should never block growth tomorrow. We engineer for 10× from the very first PR.',
    tag: '// APR_04',
  },
]

export function ApproachCards() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {APPROACH_CARDS.map((item, i) => {
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
            className="group relative rounded-xl overflow-hidden"
            style={{ background: 'rgba(8,8,28,0.92)', border: '1px solid rgba(103,232,249,0.12)' }}
            whileHover={{
              y: -4,
              boxShadow: `0 0 24px ${ACCENT}22, 0 10px 30px rgba(0,0,0,0.5)`,
              borderColor: `${ACCENT}50`,
              transition: { type: 'spring', stiffness: 280, damping: 22 },
            }}
          >
            {/* Circuit texture */}
            <div className="absolute inset-0 pointer-events-none opacity-55" style={circuitBg} />
            {/* Top scan line */}
            <div
              className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `linear-gradient(to right, transparent, ${ACCENT}cc, transparent)` }}
            />
            <div className="relative p-5">
              <span className="font-mono text-[9px] tracking-widest block mb-3 text-nebula-500/60">{item.tag}</span>
              <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-nebula-200 transition-colors">{item.title}</h3>
              <p className="text-xs text-white/45 leading-relaxed group-hover:text-white/65 transition-colors">{item.desc}</p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ── Default export (unused) — each section individually imported ──────────────
export default function ServicesDetailSections() { return null }
