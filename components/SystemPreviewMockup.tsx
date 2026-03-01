'use client'

import { motion } from 'framer-motion'

export default function SystemPreviewMockup() {
  return (
    <div
      className="relative w-full max-w-sm mx-auto rounded-lg overflow-hidden"
      style={{
        background: 'rgba(5,5,25,0.9)',
        border: '1px solid rgba(103,232,249,0.18)',
        boxShadow: '0 0 40px rgba(103,232,249,0.08)',
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b"
        style={{ borderColor: 'rgba(103,232,249,0.12)', background: 'rgba(10,10,30,0.8)' }}
      >
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/60"/>
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"/>
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/60"/>
        <span className="ml-2 font-mono text-[10px] text-nebula-400/60 tracking-wider">SYSTEM_DASHBOARD.tsx</span>
      </div>

      {/* Fake sidebar + content */}
      <div className="flex h-48">
        {/* Sidebar */}
        <div className="w-16 border-r flex flex-col gap-2 p-2"
          style={{ borderColor: 'rgba(103,232,249,0.08)', background: 'rgba(5,5,20,0.7)' }}>
          {['■', '◆', '▲', '●', '▶'].map((icon, i) => (
            <div
              key={i}
              className="w-8 h-6 flex items-center justify-center rounded text-[10px]"
              style={{
                background: i === 0 ? 'rgba(103,232,249,0.15)' : 'transparent',
                color: i === 0 ? '#67E8F9' : 'rgba(255,255,255,0.2)',
              }}
            >
              {icon}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-3 flex flex-col gap-2">
          {/* Stat cards row */}
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { label: 'UPTIME', val: '99.9%', color: '#67E8F9' },
              { label: 'USERS', val: '12.4K', color: '#A78BFA' },
              { label: 'PERF', val: 'A+', color: '#34D399' },
            ].map(stat => (
              <div
                key={stat.label}
                className="rounded p-1.5"
                style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${stat.color}22` }}
              >
                <div className="font-mono text-[8px] opacity-50 tracking-wider">{stat.label}</div>
                <div className="font-display font-bold text-[11px]" style={{ color: stat.color }}>{stat.val}</div>
              </div>
            ))}
          </div>

          {/* Chart area */}
          <div
            className="flex-1 rounded relative overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(103,232,249,0.08)' }}
          >
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(103,232,249,0.4)"/>
                  <stop offset="100%" stopColor="rgba(103,232,249,0)"/>
                </linearGradient>
              </defs>
              <path
                d="M0,45 L20,38 L40,42 L60,28 L80,32 L100,18 L120,22 L140,12 L160,16 L180,8 L200,5 L200,60 L0,60 Z"
                fill="url(#chart-grad)"
                opacity="0.6"
              />
              <path
                d="M0,45 L20,38 L40,42 L60,28 L80,32 L100,18 L120,22 L140,12 L160,16 L180,8 L200,5"
                fill="none"
                stroke="rgba(103,232,249,0.7)"
                strokeWidth="1.2"
              />
              {/* Highlight dot */}
              <motion.circle
                cx="140" cy="12" r="2.5"
                fill="#67E8F9"
                animate={{ r: [2.5, 4, 2.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </svg>

            {/* Scan line */}
            <motion.div
              className="absolute inset-y-0 w-px"
              style={{ background: 'linear-gradient(to bottom, transparent, rgba(103,232,249,0.5), transparent)' }}
              animate={{ left: ['0%', '100%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatType: 'loop' }}
            />
          </div>

          {/* Footer status */}
          <div className="flex items-center gap-2">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-green-400"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="font-mono text-[9px] text-white/30">SYS NOMINAL — ALL MODULES ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  )
}
