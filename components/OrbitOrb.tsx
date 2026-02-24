'use client'

import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface DataFragment {
  label: string
  value: string
}

const FRAGMENTS: DataFragment[] = [
  { label: 'SYS', value: 'ONLINE' },
  { label: 'LAT', value: '12ms' },
  { label: 'UPT', value: '99.9%' },
  { label: 'VER', value: 'v4.2.1' },
]

const ORBIT_NODES = [
  { angle: 0, color: '#67E8F9', label: 'API' },
  { angle: 120, color: '#A78BFA', label: 'DB' },
  { angle: 240, color: '#34D399', label: 'UI' },
]

export default function OrbitOrb() {
  return (
    <div className="relative w-[340px] h-[340px] md:w-[420px] md:h-[420px] flex items-center justify-center select-none">
      {/* Central sphere */}
      <motion.div
        className="relative z-10 w-28 h-28 md:w-36 md:h-36 rounded-full"
        style={{
          background: 'radial-gradient(ellipse at 35% 35%, rgba(103,232,249,0.25), rgba(124,58,237,0.15) 60%, rgba(3,3,15,0.6))',
          boxShadow: '0 0 40px rgba(103,232,249,0.2), inset 0 0 30px rgba(103,232,249,0.08)',
          border: '1px solid rgba(103,232,249,0.25)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      >
        {/* Inner glow */}
        <div
          className="absolute inset-3 rounded-full"
          style={{ background: 'radial-gradient(circle at 40% 35%, rgba(103,232,249,0.18), transparent 70%)' }}
        />
        {/* Constellation inside */}
        <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 100 100">
          <circle cx="30" cy="35" r="2" fill="#67E8F9" />
          <circle cx="55" cy="25" r="1.5" fill="#A78BFA" />
          <circle cx="70" cy="50" r="2" fill="#67E8F9" />
          <circle cx="45" cy="65" r="1.5" fill="#67E8F9" />
          <circle cx="25" cy="60" r="1" fill="#A78BFA" />
          <line x1="30" y1="35" x2="55" y2="25" stroke="rgba(103,232,249,0.5)" strokeWidth="0.7" />
          <line x1="55" y1="25" x2="70" y2="50" stroke="rgba(103,232,249,0.5)" strokeWidth="0.7" />
          <line x1="70" y1="50" x2="45" y2="65" stroke="rgba(103,232,249,0.5)" strokeWidth="0.7" />
          <line x1="45" y1="65" x2="25" y2="60" stroke="rgba(103,232,249,0.5)" strokeWidth="0.7" />
          <line x1="25" y1="60" x2="30" y2="35" stroke="rgba(103,232,249,0.3)" strokeWidth="0.7" />
        </svg>
      </motion.div>

      {/* Orbit ring 1 */}
      <motion.div
        className="absolute rounded-full border"
        style={{
          width: '65%', height: '65%',
          borderColor: 'rgba(103,232,249,0.18)',
          transform: 'rotateX(70deg)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      >
        {ORBIT_NODES.slice(0, 1).map((node) => (
          <div
            key={node.label}
            className="absolute w-3 h-3 rounded-full -translate-x-1.5 -translate-y-1.5"
            style={{
              top: '0%', left: '50%',
              background: node.color,
              boxShadow: `0 0 8px ${node.color}`,
            }}
          />
        ))}
      </motion.div>

      {/* Orbit ring 2 */}
      <motion.div
        className="absolute rounded-full border"
        style={{
          width: '82%', height: '82%',
          borderColor: 'rgba(124,58,237,0.15)',
          transform: 'rotateX(70deg) rotateZ(40deg)',
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      >
        <div
          className="absolute w-2.5 h-2.5 rounded-full -translate-x-1.25 -translate-y-1.25"
          style={{
            top: '0%', left: '50%',
            background: '#A78BFA',
            boxShadow: '0 0 8px #A78BFA',
          }}
        />
      </motion.div>

      {/* Orbit ring 3 */}
      <motion.div
        className="absolute rounded-full border"
        style={{
          width: '100%', height: '100%',
          borderColor: 'rgba(52,211,153,0.10)',
          transform: 'rotateX(70deg) rotateZ(-25deg)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
      >
        <div
          className="absolute w-2 h-2 rounded-full -translate-x-1 -translate-y-1"
          style={{
            top: '0%', left: '50%',
            background: '#34D399',
            boxShadow: '0 0 6px #34D399',
          }}
        />
      </motion.div>

      {/* Floating data fragments */}
      {FRAGMENTS.map((frag, i) => {
        const angles = [45, 135, 225, 315]
        const rad = (angles[i] * Math.PI) / 180
        const r = 48
        const x = 50 + Math.cos(rad) * r
        const y = 50 + Math.sin(rad) * r
        return (
          <motion.div
            key={frag.label}
            className="absolute font-mono text-[9px] leading-tight"
            style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 3 + i * 0.7, repeat: Infinity, delay: i * 0.5 }}
          >
            <span className="text-nebula-400/60">{frag.label}</span>
            <span className="text-star-100/80 ml-1">{frag.value}</span>
          </motion.div>
        )
      })}
    </div>
  )
}
