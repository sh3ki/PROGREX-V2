'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import {
  ChevronDown, ArrowRight, CheckCircle,
  Search, Map, Code2, Rocket, TrendingUp,
  Layers, ShieldCheck, RefreshCw, Headphones,
  Gauge, Globe, Smartphone, Lock,
  WifiOff, BellRing, BarChart2,
  Plug, Activity, Clock, BookOpen, GraduationCap,
  Cloud, Shield, Users, Cpu, Brain,
  Zap, Database, PieChart, GitMerge, Bell,
  Palette, MousePointer, FileSearch, Eye,
} from 'lucide-react'
import type { LucideProps } from 'lucide-react'
import SectionWrapper, { SectionHeader } from '@/components/SectionWrapper'
import ConstellationDecor from '@/components/ConstellationDecor'
import CTASection from '@/components/CTASection'

type IconComponent = React.FC<LucideProps>

const ICON_MAP: Record<string, IconComponent> = {
  Layers, ShieldCheck, RefreshCw, Headphones,
  Gauge, Globe, Smartphone, Lock,
  WifiOff, BellRing, BarChart2,
  Plug, Activity, Clock, BookOpen, GraduationCap,
  Map, Cloud, Shield, Users, Cpu, Brain,
  Zap, Database, TrendingUp, PieChart, GitMerge, Bell,
  Rocket, Palette, MousePointer, Code2, FileSearch, Eye,
  Search, CheckCircle,
}

// Generic icon per step position (works for all services whose steps follow Discovery→Plan→Build→Test→Deploy→Support)
const STEP_ICONS: IconComponent[] = [Search, Map, Code2, CheckCircle, Rocket, TrendingUp]

interface Service {
  title: string
  shortDesc: string
  description: string
  icon: string
  color: string
  process: { step: number; title: string; desc: string }[]
  technologies: string[]
  deliverables: string[]
  idealFor: { title: string; desc: string }[]
  highlights: { icon: string; label: string; desc: string }[]
  faqs: { q: string; a: string }[]
}

export default function ServiceDetailClient({ service }: { service: Service }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <>
      {/* Service Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-section-a pt-2">
        <div className="absolute inset-0 bg-dot-grid opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-br from-aurora-700/10 to-nebula-700/5" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-nebula-700/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-aurora-700/5 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="eyebrow-badge mb-4 justify-center">
              PROGREX Services
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
              {service.title}
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
              {service.description}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
              <Link href="/contact" className="btn-primary inline-flex text-base">
                <span>Request Proposal</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-base text-nebula-300 transition-all duration-200 hover:text-white"
                style={{ border: '1px solid rgba(103,232,249,0.2)', background: 'rgba(14,165,233,0.06)' }}
              >
                View Projects
              </Link>
            </div>

            {/* Trust stats */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="flex flex-wrap justify-center gap-3"
            >
              {[
                { value: '52+', label: 'Projects Delivered' },
                { value: 'NDA', label: 'Always Protected' },
                { value: '100%', label: 'IP Ownership' },
                { value: '30-Day', label: 'Bug-Fix Warranty' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-2.5 px-4 py-2 rounded-full"
                  style={{
                    background: 'rgba(14,165,233,0.08)',
                    border: '1px solid rgba(14,165,233,0.18)',
                  }}
                >
                  <span className="font-mono font-bold text-sm text-nebula-300">{stat.value}</span>
                  <span className="text-slate-400 text-xs">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>



        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[rgba(5,5,16,0.8)] to-transparent" />
      </section>

      {/* Process — zigzag timeline */}
      <SectionWrapper className="bg-section-a" decoration={<ConstellationDecor name="gemini" side="right" offsetY="15%" />}>
        <SectionHeader
          badge="How We Work"
          title="Our Proven"
          highlight="Process"
          subtitle="A structured, transparent process that delivers great results — every time."
        />

        <div className="relative max-w-4xl mx-auto">
          {/* Central vertical line */}
          <div
            className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-px -translate-x-1/2 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, transparent, rgba(14,165,233,0.5) 10%, rgba(124,58,237,0.5) 90%, transparent)' }}
          />

          <div className="space-y-10 sm:space-y-0">
            {service.process.map((step, i) => {
              const Icon = STEP_ICONS[i % STEP_ICONS.length]
              const isEven = i % 2 === 0
              const stepLabel = String(step.step).padStart(2, '0')

              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: i * 0.1 }}
                  className={`relative flex items-center gap-0 sm:gap-6 ${isEven ? 'sm:flex-row' : 'sm:flex-row-reverse'} flex-row sm:mb-10`}
                >
                  {/* Card */}
                  <div className={`w-full sm:w-[calc(50%-2.5rem)] pl-14 sm:pl-0 ${isEven ? 'sm:pr-6 sm:text-right' : 'sm:pl-6 sm:text-left'}`}>
                    <motion.div
                      className="relative rounded-xl overflow-hidden group"
                      style={{ background: 'rgba(8,8,28,0.92)', border: '1px solid rgba(103,232,249,0.12)' }}
                      whileHover={{
                        y: -4,
                        boxShadow: '0 0 28px rgba(14,165,233,0.14), 0 0 56px rgba(124,58,237,0.08), 0 12px 36px rgba(0,0,0,0.5)',
                        borderColor: 'rgba(14,165,233,0.35)',
                      }}
                      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                    >
                      {/* Circuit texture */}
                      <div
                        className="absolute inset-0 pointer-events-none opacity-60"
                        style={{
                          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44'%3E%3Cline x1='0' y1='22' x2='16' y2='22' stroke='rgba(103,232,249,0.07)' stroke-width='0.7'/%3E%3Cline x1='28' y1='22' x2='44' y2='22' stroke='rgba(103,232,249,0.07)' stroke-width='0.7'/%3E%3Cline x1='22' y1='0' x2='22' y2='16' stroke='rgba(103,232,249,0.07)' stroke-width='0.7'/%3E%3Cline x1='22' y1='28' x2='22' y2='44' stroke='rgba(103,232,249,0.07)' stroke-width='0.7'/%3E%3Ccircle cx='22' cy='22' r='4' fill='none' stroke='rgba(103,232,249,0.09)' stroke-width='0.8'/%3E%3Ccircle cx='22' cy='22' r='1.2' fill='rgba(103,232,249,0.11)'/%3E%3Ccircle cx='0' cy='0' r='1.2' fill='rgba(103,232,249,0.05)'/%3E%3Ccircle cx='44' cy='0' r='1.2' fill='rgba(103,232,249,0.05)'/%3E%3Ccircle cx='0' cy='44' r='1.2' fill='rgba(103,232,249,0.05)'/%3E%3Ccircle cx='44' cy='44' r='1.2' fill='rgba(103,232,249,0.05)'/%3E%3C/svg%3E\")",
                          backgroundSize: '44px 44px',
                          maskImage: 'radial-gradient(ellipse 120% 100% at 50% 0%, black 30%, transparent 100%)',
                          WebkitMaskImage: 'radial-gradient(ellipse 120% 100% at 50% 0%, black 30%, transparent 100%)',
                        } as React.CSSProperties}
                      />
                      {/* Top scan line on hover */}
                      <div
                        className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ background: 'linear-gradient(to right, transparent, rgba(14,165,233,0.8), rgba(124,58,237,0.8), transparent)' }}
                      />
                      <div className={`p-5 flex gap-4 items-start ${isEven ? 'sm:flex-row-reverse sm:text-right' : 'flex-row'}`}>
                        {/* Icon box */}
                        <div
                          className="shrink-0 w-11 h-11 rounded-lg flex items-center justify-center"
                          style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.22)' }}
                        >
                          <Icon size={20} className="text-nebula-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-[10px] text-nebula-500 tracking-widest mb-0.5">{'// STEP_'}{stepLabel}</div>
                          <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-nebula-300 transition-colors duration-200">{step.title}</h3>
                          <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                      {/* Connector arrow */}
                      <div
                        className={`hidden sm:block absolute top-1/2 -translate-y-1/2 w-3 h-px ${isEven ? '-right-3' : '-left-3'}`}
                        style={{ background: 'rgba(103,232,249,0.3)' }}
                      />
                    </motion.div>
                  </div>

                  {/* Node */}
                  <div className="absolute left-6 sm:left-1/2 sm:-translate-x-1/2 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: i * 0.1 + 0.15, type: 'spring', stiffness: 300 }}
                      className="relative flex items-center justify-center w-10 h-10 rounded-full"
                      style={{
                        background: 'linear-gradient(135deg, rgba(14,165,233,0.25), rgba(124,58,237,0.25))',
                        border: '2px solid rgba(14,165,233,0.6)',
                        boxShadow: '0 0 18px rgba(14,165,233,0.35), 0 0 40px rgba(14,165,233,0.1)',
                      }}
                    >
                      <span className="font-mono text-[11px] font-bold text-nebula-300">{stepLabel}</span>
                      <span
                        className="absolute inset-0 rounded-full animate-ping"
                        style={{ background: 'rgba(14,165,233,0.12)', animationDuration: '2.5s' }}
                      />
                    </motion.div>
                  </div>

                  {/* Empty spacer — desktop only */}
                  <div className="hidden sm:block sm:w-[calc(50%-2.5rem)]" />
                </motion.div>
              )
            })}
          </div>
        </div>
      </SectionWrapper>

      {/* Key Deliverables */}
      <SectionWrapper className="bg-section-b" decoration={<ConstellationDecor name="crux" side="left" offsetY="20%" />}>
        <SectionHeader
          badge="What You Get"
          title="Key"
          highlight="Deliverables"
          subtitle="Every engagement ends with tangible, documented assets you own completely."
        />
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {service.deliverables.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className="group relative rounded-xl overflow-hidden cursor-default"
              style={{ background: 'rgba(8,8,28,0.92)', border: '1px solid rgba(103,232,249,0.12)' }}
              whileHover={{
                y: -4,
                background: 'rgba(14,14,40,0.97)',
                boxShadow: '0 0 28px rgba(14,165,233,0.14), 0 0 56px rgba(124,58,237,0.08), 0 12px 36px rgba(0,0,0,0.5)',
                borderColor: 'rgba(14,165,233,0.35)',
              }}
            >
              {/* Circuit texture */}
              <div
                className="absolute inset-0 pointer-events-none rounded-xl opacity-60"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44'%3E%3Cline x1='0' y1='22' x2='16' y2='22' stroke='rgba(103,232,249,0.05)' stroke-width='0.7'/%3E%3Cline x1='28' y1='22' x2='44' y2='22' stroke='rgba(103,232,249,0.05)' stroke-width='0.7'/%3E%3Cline x1='22' y1='0' x2='22' y2='16' stroke='rgba(103,232,249,0.05)' stroke-width='0.7'/%3E%3Cline x1='22' y1='28' x2='22' y2='44' stroke='rgba(103,232,249,0.05)' stroke-width='0.7'/%3E%3Ccircle cx='22' cy='22' r='4' fill='none' stroke='rgba(103,232,249,0.09)' stroke-width='0.8'/%3E%3Ccircle cx='22' cy='22' r='1.2' fill='rgba(103,232,249,0.11)'/%3E%3Ccircle cx='0' cy='0' r='1.2' fill='rgba(103,232,249,0.05)'/%3E%3Ccircle cx='44' cy='0' r='1.2' fill='rgba(103,232,249,0.05)'/%3E%3Ccircle cx='0' cy='44' r='1.2' fill='rgba(103,232,249,0.05)'/%3E%3Ccircle cx='44' cy='44' r='1.2' fill='rgba(103,232,249,0.05)'/%3E%3C/svg%3E")`,
                  backgroundSize: '44px 44px',
                  maskImage: 'radial-gradient(ellipse 110% 80% at 50% 10%, black 20%, transparent 90%)',
                  WebkitMaskImage: 'radial-gradient(ellipse 110% 80% at 50% 10%, black 20%, transparent 90%)',
                } as React.CSSProperties}
              />
              {/* Top scan line */}
              <div
                className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(to right, transparent, rgba(14,165,233,0.8), rgba(124,58,237,0.8), transparent)' }}
              />
              <div className="relative flex items-start gap-3 p-4">
                <div
                  className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5"
                  style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.22)' }}
                >
                  <CheckCircle size={14} className="text-nebula-400" />
                </div>
                <span className="text-slate-300 text-sm leading-relaxed pt-0.5">{item}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* Best Suited For */}
      <SectionWrapper className="bg-section-a" decoration={<ConstellationDecor name="leo" side="right" offsetY="20%" />}>
        <SectionHeader
          badge="Ideal For"
          title="Who This"
          highlight="Service Fits"
          subtitle="This service is tailored for teams and businesses with these specific needs."
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {service.idealFor.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative rounded-xl overflow-hidden cursor-default"
              style={{ background: 'rgba(8,8,28,0.92)', border: '1px solid rgba(103,232,249,0.12)' }}
              whileHover={{
                y: -6,
                background: 'rgba(14,14,40,0.97)',
                boxShadow: '0 0 32px rgba(14,165,233,0.18), 0 0 64px rgba(124,58,237,0.12), 0 16px 40px rgba(0,0,0,0.5)',
                borderColor: 'rgba(14,165,233,0.35)',
              }}
            >
              {/* Circuit texture */}
              <div
                className="absolute inset-0 pointer-events-none rounded-xl opacity-60"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44'%3E%3Cline x1='0' y1='22' x2='16' y2='22' stroke='rgba(103,232,249,0.05)' stroke-width='0.7'/%3E%3Cline x1='28' y1='22' x2='44' y2='22' stroke='rgba(103,232,249,0.05)' stroke-width='0.7'/%3E%3Cline x1='22' y1='0' x2='22' y2='16' stroke='rgba(103,232,249,0.05)' stroke-width='0.7'/%3E%3Cline x1='22' y1='28' x2='22' y2='44' stroke='rgba(103,232,249,0.05)' stroke-width='0.7'/%3E%3Ccircle cx='22' cy='22' r='4' fill='none' stroke='rgba(103,232,249,0.09)' stroke-width='0.8'/%3E%3Ccircle cx='22' cy='22' r='1.2' fill='rgba(103,232,249,0.11)'/%3E%3Ccircle cx='0' cy='0' r='1.2' fill='rgba(103,232,249,0.05)'/%3E%3Ccircle cx='44' cy='0' r='1.2' fill='rgba(103,232,249,0.05)'/%3E%3Ccircle cx='0' cy='44' r='1.2' fill='rgba(103,232,249,0.05)'/%3E%3Ccircle cx='44' cy='44' r='1.2' fill='rgba(103,232,249,0.05)'/%3E%3C/svg%3E")`,
                  backgroundSize: '44px 44px',
                  maskImage: 'radial-gradient(ellipse 110% 80% at 50% 10%, black 20%, transparent 90%)',
                  WebkitMaskImage: 'radial-gradient(ellipse 110% 80% at 50% 10%, black 20%, transparent 90%)',
                } as React.CSSProperties}
              />
              {/* Hover gradient overlay */}
              <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.06) 0%, rgba(124,58,237,0.06) 100%)' }}
              />
              {/* Top scan line */}
              <div
                className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(to right, transparent, rgba(14,165,233,0.8), rgba(124,58,237,0.8), transparent)' }}
              />
              <div className="relative p-6">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.22)' }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' }} />
                </div>
                <h3 className="text-white font-bold text-base mb-2 group-hover:text-nebula-300 transition-colors duration-200">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* Service Highlights */}
      <SectionWrapper className="bg-section-b" decoration={<ConstellationDecor name="scorpius" side="left" offsetY="15%" />}>
        <SectionHeader
          badge="Why Choose This"
          title="Service"
          highlight="Highlights"
          subtitle="The defining strengths that set our delivery apart for this specific discipline."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {service.highlights.map((item, i) => {
            const Icon = ICON_MAP[item.icon] ?? CheckCircle
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group relative rounded-xl overflow-hidden cursor-default"
                style={{ background: 'rgba(8,8,28,0.92)', border: '1px solid rgba(103,232,249,0.12)' }}
                whileHover={{
                  y: -6,
                  background: 'rgba(14,14,40,0.97)',
                  boxShadow: '0 0 32px rgba(14,165,233,0.18), 0 0 64px rgba(124,58,237,0.12), 0 16px 40px rgba(0,0,0,0.5)',
                  borderColor: 'rgba(14,165,233,0.35)',
                }}
              >
                {/* Circuit texture */}
                <div
                  className="absolute inset-0 pointer-events-none rounded-xl opacity-60"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44'%3E%3Cline x1='0' y1='22' x2='16' y2='22' stroke='rgba(103,232,249,0.05)' stroke-width='0.7'/%3E%3Cline x1='28' y1='22' x2='44' y2='22' stroke='rgba(103,232,249,0.05)' stroke-width='0.7'/%3E%3Cline x1='22' y1='0' x2='22' y2='16' stroke='rgba(103,232,249,0.05)' stroke-width='0.7'/%3E%3Cline x1='22' y1='28' x2='22' y2='44' stroke='rgba(103,232,249,0.05)' stroke-width='0.7'/%3E%3Ccircle cx='22' cy='22' r='4' fill='none' stroke='rgba(103,232,249,0.09)' stroke-width='0.8'/%3E%3Ccircle cx='22' cy='22' r='1.2' fill='rgba(103,232,249,0.11)'/%3E%3Ccircle cx='0' cy='0' r='1.2' fill='rgba(103,232,249,0.05)'/%3E%3Ccircle cx='44' cy='0' r='1.2' fill='rgba(103,232,249,0.05)'/%3E%3Ccircle cx='0' cy='44' r='1.2' fill='rgba(103,232,249,0.05)'/%3E%3Ccircle cx='44' cy='44' r='1.2' fill='rgba(103,232,249,0.05)'/%3E%3C/svg%3E")`,
                    backgroundSize: '44px 44px',
                    maskImage: 'radial-gradient(ellipse 110% 80% at 50% 10%, black 20%, transparent 90%)',
                    WebkitMaskImage: 'radial-gradient(ellipse 110% 80% at 50% 10%, black 20%, transparent 90%)',
                  } as React.CSSProperties}
                />
                {/* Hover gradient overlay */}
                <motion.div
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.06) 0%, rgba(124,58,237,0.06) 100%)' }}
                />
                {/* Top scan line */}
                <div
                  className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(to right, transparent, rgba(14,165,233,0.8), rgba(124,58,237,0.8), transparent)' }}
                />
                <div className="relative p-5 flex gap-4 items-start">
                  <div
                    className="shrink-0 w-11 h-11 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.22)' }}
                  >
                    <Icon size={20} className="text-nebula-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm mb-1.5 group-hover:text-nebula-300 transition-colors duration-200">{item.label}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </SectionWrapper>

      {/* FAQs */}
      <SectionWrapper className="bg-section-a" decoration={<ConstellationDecor name="scorpius" side="right" offsetY="10%" />}>
        <SectionHeader
          badge="Common Questions"
          title="Frequently Asked"
          highlight="Questions"
        />
        <div className="max-w-3xl mx-auto space-y-3">
          {service.faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="glass-card rounded-xl border border-nebula-700/20 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-semibold text-white text-sm sm:text-base">{faq.q}</span>
                <motion.span
                  animate={{ rotate: openFaq === i ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0 ml-4 text-nebula-500"
                >
                  <ChevronDown size={18} />
                </motion.span>
              </button>
              <motion.div
                initial={false}
                animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-3">
                  {faq.a}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      <CTASection
        title="Ready to Get Started?"
        subtitle={`Let's discuss your ${service.title.toLowerCase()} project and craft a solution that exceeds your expectations.`}
        primaryBtn={{ label: 'Request Proposal', href: '/contact' }}
        secondaryBtn={{ label: 'View Projects', href: '/projects' }}
      />
    </>
  )
}
