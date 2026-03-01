'use client'

import { motion } from 'framer-motion'

interface DataFragment {
  label: string
  value: string
  color?: string
}

const FRAGMENTS: DataFragment[] = [
  { label: 'UPTIME',  value: '99.9%',  color: '#34D399' },
  { label: 'CLIENTS', value: '80+',    color: '#67E8F9' },
  { label: 'BUILDS',  value: '150+',   color: '#A78BFA' },
  { label: 'PING',    value: '12ms',   color: '#67E8F9' },
]


export default function OrbitOrb() {
  return (
    <div className="relative w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] md:w-[380px] md:h-[380px] lg:w-[420px] lg:h-[420px] flex items-center justify-center select-none">
      {/* Central sphere — no constellation inside */}
      <motion.div
        className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-36 lg:h-36 rounded-full"
        style={{
          background: 'radial-gradient(ellipse at 35% 35%, rgba(103,232,249,0.30), rgba(124,58,237,0.18) 55%, rgba(3,3,15,0.65))',
          boxShadow: '0 0 48px rgba(103,232,249,0.25), 0 0 80px rgba(103,232,249,0.08), inset 0 0 30px rgba(103,232,249,0.12)',
          border: '1.5px solid rgba(103,232,249,0.35)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      >
        {/* Inner glow highlight */}
        <div
          className="absolute inset-3 rounded-full"
          style={{ background: 'radial-gradient(circle at 38% 32%, rgba(103,232,249,0.25), transparent 60%)' }}
        />
        {/* Tech pattern — subtle grid lines instead of constellation */}
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100">
          <line x1="50" y1="10" x2="50" y2="90" stroke="rgba(103,232,249,0.6)" strokeWidth="0.5" />
          <line x1="10" y1="50" x2="90" y2="50" stroke="rgba(103,232,249,0.6)" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="25" fill="none" stroke="rgba(103,232,249,0.4)" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="12" fill="none" stroke="rgba(167,139,250,0.4)" strokeWidth="0.5" />
        </svg>
        {/* Center dot */}
        <div
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-2 h-2 rounded-full bg-nebula-300" style={{ boxShadow: '0 0 8px #67E8F9, 0 0 16px rgba(103,232,249,0.5)' }} />
        </div>
      </motion.div>

      {/* Orbit ring 1 */}
      <motion.div
        className="absolute rounded-full border"
        style={{
          width: '65%', height: '65%',
          borderColor: 'rgba(103,232,249,0.22)',
          transform: 'rotateX(70deg)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      >
        <div
          className="absolute w-2.5 h-2.5 md:w-3 md:h-3 rounded-full -translate-x-1/2 -translate-y-1/2"
          style={{
            top: '0%', left: '50%',
            background: '#67E8F9',
            boxShadow: '0 0 10px #67E8F9, 0 0 20px rgba(103,232,249,0.4)',
          }}
        />
      </motion.div>

      {/* Orbit ring 2 */}
      <motion.div
        className="absolute rounded-full border"
        style={{
          width: '82%', height: '82%',
          borderColor: 'rgba(124,58,237,0.18)',
          transform: 'rotateX(70deg) rotateZ(40deg)',
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      >
        <div
          className="absolute w-2 h-2 md:w-2.5 md:h-2.5 rounded-full -translate-x-1/2 -translate-y-1/2"
          style={{
            top: '0%', left: '50%',
            background: '#A78BFA',
            boxShadow: '0 0 8px #A78BFA, 0 0 16px rgba(167,139,250,0.4)',
          }}
        />
      </motion.div>

      {/* Orbit ring 3 */}
      <motion.div
        className="absolute rounded-full border"
        style={{
          width: '100%', height: '100%',
          borderColor: 'rgba(52,211,153,0.13)',
          transform: 'rotateX(70deg) rotateZ(-25deg)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
      >
        <div
          className="absolute w-1.5 h-1.5 md:w-2 md:h-2 rounded-full -translate-x-1/2 -translate-y-1/2"
          style={{
            top: '0%', left: '50%',
            background: '#34D399',
            boxShadow: '0 0 6px #34D399, 0 0 12px rgba(52,211,153,0.4)',
          }}
        />
      </motion.div>

      {/* Floating data fragments — meaningful operational metrics */}
      {FRAGMENTS.map((frag, i) => {
        const angles = [45, 135, 225, 315]
        const rad = (angles[i] * Math.PI) / 180
        const r = 46
        const x = 50 + Math.cos(rad) * r
        const y = 50 + Math.sin(rad) * r
        return (
          <motion.div
            key={frag.label}
            className="absolute font-mono leading-tight text-center"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: 'translate(-50%, -50%)',
              fontSize: 'clamp(7px, 1.5vw, 10px)',
            }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3 + i * 0.7, repeat: Infinity, delay: i * 0.5 }}
          >
            <div style={{ color: frag.color ?? '#67E8F9', opacity: 0.75, letterSpacing: '0.08em' }}>{frag.label}</div>
            <div className="text-white/90 font-semibold">{frag.value}</div>
          </motion.div>
        )
      })}
    </div>
  )
}
