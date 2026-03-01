'use client'

import type { JSX } from 'react'

interface ProjectCardVisualProps {
  category: string
  title: string
  image?: string
}

const patterns: Record<string, JSX.Element> = {
  Enterprise: (
    <svg viewBox="0 0 200 120" className="w-full h-full opacity-60">
      <defs>
        <pattern id="hex-ent" x="0" y="0" width="28" height="24" patternUnits="userSpaceOnUse">
          <polygon points="14,2 26,9 26,21 14,28 2,21 2,9" fill="none" stroke="rgba(103,232,249,0.25)" strokeWidth="0.8"/>
        </pattern>
      </defs>
      <rect width="200" height="120" fill="url(#hex-ent)"/>
      <circle cx="100" cy="60" r="20" fill="none" stroke="rgba(103,232,249,0.5)" strokeWidth="1"/>
      <circle cx="100" cy="60" r="10" fill="rgba(103,232,249,0.15)" stroke="rgba(103,232,249,0.4)" strokeWidth="0.8"/>
      <line x1="100" y1="40" x2="100" y2="10" stroke="rgba(103,232,249,0.3)" strokeWidth="0.8"/>
      <line x1="100" y1="80" x2="100" y2="110" stroke="rgba(103,232,249,0.3)" strokeWidth="0.8"/>
      <line x1="80" y1="60" x2="30" y2="60" stroke="rgba(103,232,249,0.3)" strokeWidth="0.8"/>
      <line x1="120" y1="60" x2="170" y2="60" stroke="rgba(103,232,249,0.3)" strokeWidth="0.8"/>
    </svg>
  ),
  Web: (
    <svg viewBox="0 0 200 120" className="w-full h-full opacity-60">
      <defs>
        <linearGradient id="flow-web" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="rgba(103,232,249,0)" />
          <stop offset="50%" stopColor="rgba(103,232,249,0.5)" />
          <stop offset="100%" stopColor="rgba(167,139,250,0)" />
        </linearGradient>
      </defs>
      {[20, 40, 60, 80, 100].map((y, i) => (
        <path key={i} d={`M 0 ${y} Q 50 ${y - 12} 100 ${y} Q 150 ${y + 12} 200 ${y}`}
          fill="none" stroke="rgba(103,232,249,0.18)" strokeWidth="0.8"/>
      ))}
      <rect x="70" y="30" width="60" height="60" rx="3" fill="none" stroke="rgba(103,232,249,0.45)" strokeWidth="1"/>
      <rect x="78" y="38" width="44" height="8" rx="2" fill="rgba(103,232,249,0.2)"/>
      <rect x="78" y="52" width="28" height="4" rx="1" fill="rgba(167,139,250,0.3)"/>
      <rect x="78" y="60" width="36" height="4" rx="1" fill="rgba(167,139,250,0.2)"/>
    </svg>
  ),
  Academic: (
    <svg viewBox="0 0 200 120" className="w-full h-full opacity-60">
      <line x1="20" y1="60" x2="60" y2="60" stroke="rgba(103,232,249,0.3)" strokeWidth="1"/>
      <line x1="60" y1="60" x2="60" y2="30" stroke="rgba(103,232,249,0.3)" strokeWidth="1"/>
      <line x1="60" y1="30" x2="140" y2="30" stroke="rgba(103,232,249,0.3)" strokeWidth="1"/>
      <line x1="140" y1="30" x2="140" y2="60" stroke="rgba(103,232,249,0.3)" strokeWidth="1"/>
      <line x1="140" y1="60" x2="180" y2="60" stroke="rgba(103,232,249,0.3)" strokeWidth="1"/>
      <line x1="100" y1="30" x2="100" y2="10" stroke="rgba(103,232,249,0.2)" strokeWidth="1"/>
      <line x1="60" y1="60" x2="60" y2="90" stroke="rgba(103,232,249,0.2)" strokeWidth="1"/>
      <line x1="140" y1="60" x2="140" y2="90" stroke="rgba(103,232,249,0.2)" strokeWidth="1"/>
      {[60, 100, 140].map((x, i) => (
        <rect key={i} x={x - 6} y="54" width="12" height="12" rx="2"
          fill="rgba(3,3,15,0.8)" stroke="rgba(103,232,249,0.5)" strokeWidth="1"/>
      ))}
      <circle cx="100" cy="10" r="3" fill="rgba(167,139,250,0.6)"/>
      <circle cx="60" cy="90" r="3" fill="rgba(103,232,249,0.6)"/>
      <circle cx="140" cy="90" r="3" fill="rgba(103,232,249,0.6)"/>
    </svg>
  ),
  SaaS: (
    <svg viewBox="0 0 200 120" className="w-full h-full opacity-60">
      {Array.from({ length: 6 }).map((_, row) =>
        Array.from({ length: 10 }).map((_, col) => {
          const x = 15 + col * 18
          const y = 15 + row * 18
          const dist = Math.sqrt((x - 100) ** 2 + (y - 60) ** 2)
          const r = Math.max(0.5, 4 - dist / 30)
          return (
            <circle key={`${row}-${col}`} cx={x} cy={y} r={r}
              fill={`rgba(103,232,249,${Math.max(0.05, 0.4 - dist / 200)})`}/>
          )
        })
      )}
      <circle cx="100" cy="60" r="18" fill="none" stroke="rgba(167,139,250,0.5)" strokeWidth="1" strokeDasharray="4 3"/>
    </svg>
  ),
  Mobile: (
    <svg viewBox="0 0 200 120" className="w-full h-full opacity-60">
      <rect x="80" y="10" width="40" height="100" rx="6" fill="none" stroke="rgba(103,232,249,0.4)" strokeWidth="1"/>
      <rect x="86" y="20" width="28" height="50" rx="2" fill="rgba(103,232,249,0.06)"/>
      <rect x="90" y="24" width="20" height="3" rx="1" fill="rgba(103,232,249,0.3)"/>
      <rect x="90" y="30" width="14" height="2" rx="1" fill="rgba(167,139,250,0.3)"/>
      <rect x="90" y="35" width="18" height="2" rx="1" fill="rgba(167,139,250,0.2)"/>
      <circle cx="100" cy="100" r="3" fill="none" stroke="rgba(103,232,249,0.5)" strokeWidth="1"/>
      {[28, 22, 16].map((r, i) => (
        <path key={i} d={`M ${100 - r} ${80 - r * 0.6} Q 100 ${80 - r * 0.8} ${100 + r} ${80 - r * 0.6}`}
          fill="none" stroke={`rgba(103,232,249,${0.15 + i * 0.1})`} strokeWidth="1"/>
      ))}
    </svg>
  ),
  Hardware: (
    <svg viewBox="0 0 200 120" className="w-full h-full opacity-60">
      {/* Circuit board grid */}
      {[20, 50, 80].map((y, ri) =>
        [30, 70, 110, 150].map((x, ci) => (
          <rect key={`${ri}-${ci}`} x={x - 6} y={y - 6} width="12" height="12" rx="2"
            fill="rgba(3,3,15,0.8)" stroke="rgba(251,191,36,0.45)" strokeWidth="1"/>
        ))
      )}
      {/* horizontal traces */}
      {[20, 50, 80].map((y, i) => (
        <line key={`h${i}`} x1="36" y1={y} x2="156" y2={y} stroke="rgba(251,191,36,0.25)" strokeWidth="0.8"/>
      ))}
      {/* vertical traces */}
      {[30, 70, 110, 150].map((x, i) => (
        <line key={`v${i}`} x1={x} y1="14" x2={x} y2="86" stroke="rgba(251,191,36,0.18)" strokeWidth="0.8"/>
      ))}
      {/* IC chip center */}
      <rect x="76" y="44" width="48" height="30" rx="3" fill="rgba(3,3,15,0.9)" stroke="rgba(251,191,36,0.6)" strokeWidth="1"/>
      {[50,58,66].map((y, i) => <line key={`lp${i}`} x1="76" y1={y} x2="64" y2={y} stroke="rgba(251,191,36,0.4)" strokeWidth="0.8"/>)}
      {[50,58,66].map((y, i) => <line key={`rp${i}`} x1="124" y1={y} x2="136" y2={y} stroke="rgba(251,191,36,0.4)" strokeWidth="0.8"/>)}
      <text x="100" y="63" textAnchor="middle" fontSize="7" fill="rgba(251,191,36,0.7)" fontFamily="monospace">MCU</text>
      {/* bottom vias */}
      {[40,80,120,160].map((x, i) => (
        <circle key={`via${i}`} cx={x} cy="106" r="3" fill="none" stroke="rgba(103,232,249,0.4)" strokeWidth="1"/>
      ))}
    </svg>
  ),
  'E-commerce': (
    <svg viewBox="0 0 200 120" className="w-full h-full opacity-60">
      {[20, 40, 60, 80, 100].map((y, i) => (
        <path key={i} d={`M 0 ${y} Q 50 ${y - 12} 100 ${y} Q 150 ${y + 12} 200 ${y}`}
          fill="none" stroke="rgba(103,232,249,0.18)" strokeWidth="0.8"/>
      ))}
      <rect x="70" y="30" width="60" height="60" rx="3" fill="none" stroke="rgba(103,232,249,0.45)" strokeWidth="1"/>
      <rect x="78" y="38" width="44" height="8" rx="2" fill="rgba(103,232,249,0.2)"/>
      <rect x="78" y="52" width="28" height="4" rx="1" fill="rgba(167,139,250,0.3)"/>
      <rect x="78" y="60" width="36" height="4" rx="1" fill="rgba(167,139,250,0.2)"/>
    </svg>
  ),
}

export default function ProjectCardVisual({ category, title, image }: ProjectCardVisualProps) {
  const key = Object.keys(patterns).find(k => category?.toLowerCase().includes(k.toLowerCase())) ?? 'Web'

  return (
    <div
      className="w-full h-full relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, rgba(5,5,25,0.9), rgba(10,10,40,0.7))' }}
    >
      {image ? (
        /* Real photo */
        <img
          src={image}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:opacity-90 scale-105 group-hover:scale-110 transition-all duration-500"
        />
      ) : (
        /* SVG pattern fallback */
        <div className="absolute inset-0">
          {patterns[key] ?? patterns['Web']}
        </div>
      )}

      {/* Bottom fade */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(3,3,15,0.92) 0%, rgba(3,3,15,0.3) 50%, transparent 100%)' }}
      />

      {/* Category tag bottom-left */}
      <div className="absolute bottom-3 left-3 font-mono text-[9px] text-nebula-400/70 uppercase tracking-widest">
        [{category ?? 'PROJECT'}]
      </div>
    </div>
  )
}


