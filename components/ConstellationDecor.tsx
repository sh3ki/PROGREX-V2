'use client'

import { useEffect, useRef, useState } from 'react'

// ─────────────────────────────────────────────────────────────
// Real constellation data — positions derived from actual RA/Dec
// Each coordinate is normalised to a pixel canvas.
// ─────────────────────────────────────────────────────────────

interface StarPoint {
  id: string
  x: number
  y: number
  r?: number // apparent brightness → dot radius (default 1.5)
}

interface ConstellationData {
  stars: StarPoint[]
  lines: [string, string][]
  label: string
}

const CONSTELLATIONS: Record<string, ConstellationData> = {

  // ── ORION ──────────────────────────────────────────────────
  orion: {
    label: 'Orion',
    stars: [
      { id: 'betelgeuse', x: 35,  y: 22,  r: 2.8 }, // α — red supergiant
      { id: 'bellatrix',  x: 108, y: 32,  r: 1.8 }, // γ
      { id: 'mintaka',    x: 48,  y: 95,  r: 1.5 }, // δ belt
      { id: 'alnilam',    x: 72,  y: 103, r: 1.8 }, // ε belt
      { id: 'alnitak',    x: 95,  y: 112, r: 1.8 }, // ζ belt
      { id: 'saiph',      x: 65,  y: 172, r: 1.5 }, // κ
      { id: 'rigel',      x: 130, y: 158, r: 2.8 }, // β — blue supergiant
      { id: 'meissa',     x: 68,  y: 0,   r: 1.2 }, // λ — head
      { id: 'hatysa',     x: 82,  y: 138, r: 1.0 }, // ι — sword
    ],
    lines: [
      ['betelgeuse', 'bellatrix'],
      ['betelgeuse', 'mintaka'],
      ['bellatrix',  'alnilam'],
      ['mintaka',    'alnilam'],
      ['alnilam',    'alnitak'],
      ['alnitak',    'rigel'],
      ['alnitak',    'saiph'],
      ['betelgeuse', 'meissa'],
      ['bellatrix',  'meissa'],
      ['hatysa',     'alnilam'],
    ],
  },

  // ── URSA MAJOR (Big Dipper) ────────────────────────────────
  bigdipper: {
    label: 'Ursa Major',
    stars: [
      { id: 'dubhe',    x: 0,   y: 28,  r: 2.2 }, // α — cup top-left
      { id: 'merak',    x: 32,  y: 58,  r: 1.8 }, // β — cup bottom-left
      { id: 'phecda',   x: 70,  y: 58,  r: 1.6 }, // γ — cup bottom-right
      { id: 'megrez',   x: 80,  y: 28,  r: 1.4 }, // δ — cup top-right / handle join
      { id: 'alioth',   x: 108, y: 18,  r: 2.0 }, // ε — handle
      { id: 'mizar',    x: 138, y: 10,  r: 1.8 }, // ζ — handle
      { id: 'alkaid',   x: 168, y: 0,   r: 2.0 }, // η — handle end
    ],
    lines: [
      ['dubhe',  'merak'],
      ['merak',  'phecda'],
      ['phecda', 'megrez'],
      ['megrez', 'dubhe'],
      ['megrez', 'alioth'],
      ['alioth', 'mizar'],
      ['mizar',  'alkaid'],
    ],
  },

  // ── CASSIOPEIA ─────────────────────────────────────────────
  cassiopeia: {
    label: 'Cassiopeia',
    stars: [
      { id: 'caph',    x: 0,   y: 45,  r: 1.8 }, // β
      { id: 'schedar', x: 40,  y: 5,   r: 2.2 }, // α — brightest
      { id: 'gamma',   x: 80,  y: 40,  r: 2.0 }, // γ
      { id: 'ruchbah', x: 118, y: 5,   r: 1.8 }, // δ
      { id: 'segin',   x: 155, y: 45,  r: 1.6 }, // ε
    ],
    lines: [
      ['caph',    'schedar'],
      ['schedar', 'gamma'],
      ['gamma',   'ruchbah'],
      ['ruchbah', 'segin'],
    ],
  },

  // ── SCORPIUS ───────────────────────────────────────────────
  // Visible from the Philippines — one of the finest constellations
  scorpius: {
    label: 'Scorpius',
    stars: [
      { id: 'graffias', x: 22,  y: 0,   r: 1.8 }, // β — head
      { id: 'pi',       x: 0,   y: 18,  r: 1.2 },
      { id: 'delta',    x: 25,  y: 42,  r: 1.5 },
      { id: 'antares',  x: 32,  y: 72,  r: 2.8 }, // α — red heart ★
      { id: 'tau',      x: 44,  y: 95,  r: 1.2 },
      { id: 'epsilon',  x: 56,  y: 118, r: 1.5 },
      { id: 'mu',       x: 68,  y: 138, r: 1.4 },
      { id: 'zeta',     x: 82,  y: 155, r: 1.5 },
      { id: 'eta',      x: 98,  y: 160, r: 1.2 },
      { id: 'theta',    x: 115, y: 150, r: 1.2 },
      { id: 'iota',     x: 122, y: 132, r: 1.5 },
      { id: 'kappa',    x: 120, y: 112, r: 1.2 },
      { id: 'shaula',   x: 110, y: 92,  r: 2.2 }, // λ — tail sting ★
    ],
    lines: [
      ['pi',       'graffias'],
      ['graffias', 'delta'],
      ['delta',    'antares'],
      ['antares',  'tau'],
      ['tau',      'epsilon'],
      ['epsilon',  'mu'],
      ['mu',       'zeta'],
      ['zeta',     'eta'],
      ['eta',      'theta'],
      ['theta',    'iota'],
      ['iota',     'kappa'],
      ['kappa',    'shaula'],
    ],
  },

  // ── LEO ───────────────────────────────────────────────────
  leo: {
    label: 'Leo',
    stars: [
      { id: 'regulus',  x: 60,  y: 128, r: 2.5 }, // α — base of sickle ★
      { id: 'eta',      x: 42,  y: 95,  r: 1.4 },
      { id: 'gamma',    x: 22,  y: 60,  r: 1.8 }, // γ — sickle top
      { id: 'zeta',     x: 18,  y: 28,  r: 1.4 },
      { id: 'mu',       x: 32,  y: 0,   r: 1.2 },
      { id: 'epsilon',  x: 68,  y: 8,   r: 1.4 },
      { id: 'lambda',   x: 82,  y: 42,  r: 1.2 },
      { id: 'theta',    x: 120, y: 60,  r: 1.4 },
      { id: 'denebola', x: 162, y: 78,  r: 2.0 }, // β — tail ★
      { id: 'delta',    x: 142, y: 32,  r: 1.4 },
    ],
    lines: [
      ['regulus',  'eta'],
      ['eta',      'gamma'],
      ['gamma',    'zeta'],
      ['zeta',     'mu'],
      ['mu',       'epsilon'],
      ['epsilon',  'lambda'],
      ['lambda',   'gamma'],
      ['lambda',   'theta'],
      ['theta',    'denebola'],
      ['denebola', 'delta'],
      ['delta',    'theta'],
      ['regulus',  'theta'],
    ],
  },

  // ── CRUX (Southern Cross) ─────────────────────────────────
  // Visible from the Philippines, national symbol of SE Asia
  crux: {
    label: 'Crux',
    stars: [
      { id: 'gacrux',  x: 38,  y: 0,   r: 2.2 }, // γ — top
      { id: 'mimosa',  x: 0,   y: 50,  r: 2.5 }, // β — left ★
      { id: 'acrux',   x: 38,  y: 82,  r: 2.8 }, // α — bottom, brightest ★
      { id: 'delta',   x: 78,  y: 50,  r: 1.8 }, // δ — right
      { id: 'epsilon', x: 55,  y: 38,  r: 1.2 }, // ε — center-right offset
    ],
    lines: [
      ['gacrux',  'acrux'],   // vertical bar
      ['mimosa',  'delta'],   // horizontal bar
      ['epsilon', 'delta'],
    ],
  },

  // ── GEMINI ────────────────────────────────────────────────
  gemini: {
    label: 'Gemini',
    stars: [
      { id: 'castor',    x: 0,   y: 0,   r: 2.0 }, // α — left twin head
      { id: 'pollux',    x: 35,  y: 0,   r: 2.5 }, // β — right twin head ★
      { id: 'wasat',     x: 5,   y: 48,  r: 1.2 }, // δ
      { id: 'mekbuda',   x: 22,  y: 68,  r: 1.2 }, // ζ
      { id: 'propus',    x: 0,   y: 88,  r: 1.4 }, // η
      { id: 'alhena',    x: 40,  y: 50,  r: 1.8 }, // γ
      { id: 'tejat',     x: 32,  y: 88,  r: 1.6 }, // μ
      { id: 'alzirr',    x: 60,  y: 50,  r: 1.2 }, // ξ
      { id: 'kappa',     x: 62,  y: 88,  r: 1.4 },
    ],
    lines: [
      ['castor',   'wasat'],
      ['wasat',    'mekbuda'],
      ['mekbuda',  'propus'],
      ['pollux',   'alhena'],
      ['alhena',   'tejat'],
      ['alhena',   'alzirr'],
      ['alzirr',   'kappa'],
      ['castor',   'pollux'],
      ['mekbuda',  'alhena'],
      ['propus',   'tejat'],
    ],
  },
}

// ─────────────────────────────────────────────────────────────

function getStarById(stars: StarPoint[], id: string) {
  return stars.find((s) => s.id === id)
}

interface ConstellationDecorProps {
  name: keyof typeof CONSTELLATIONS
  side: 'left' | 'right'
  offsetY?: string   // e.g. '20%', '40px' — vertical position within the section
  scale?: number     // default 0.85
  opacity?: number   // default 0.22
}

export default function ConstellationDecor({
  name,
  side,
  offsetY = '15%',
  scale = 0.85,
  opacity = 0.68,
}: ConstellationDecorProps) {
  const data = CONSTELLATIONS[name]
  if (!data) return null

  const [drawnEdges, setDrawnEdges] = useState<boolean[]>([])
  const [drawnStars, setDrawnStars] = useState<boolean[]>([])
  const [pulse, setPulse] = useState(false)
  const cancelRef = useRef(false)

  useEffect(() => {
    cancelRef.current = false
    setDrawnEdges(Array(data.lines.length).fill(false))
    setDrawnStars(Array(data.stars.length).fill(false))
    setPulse(false)

    const animate = async () => {
      await new Promise(r => setTimeout(r, 600))
      for (let i = 0; i < data.lines.length; i++) {
        if (cancelRef.current) return
        await new Promise(r => setTimeout(r, 180))
        setDrawnEdges(prev => { const n = [...prev]; n[i] = true; return n })
      }
      for (let j = 0; j < data.stars.length; j++) {
        if (cancelRef.current) return
        await new Promise(r => setTimeout(r, 60))
        setDrawnStars(prev => { const n = [...prev]; n[j] = true; return n })
      }
      if (!cancelRef.current) setPulse(true)
    }
    animate()
    return () => { cancelRef.current = true }
  }, [name, data.lines.length, data.stars.length])

  // Compute SVG viewBox
  const xs = data.stars.map(s => s.x)
  const ys = data.stars.map(s => s.y)
  const pad = 12
  const minX = Math.min(...xs) - pad
  const minY = Math.min(...ys) - pad
  const maxX = Math.max(...xs) + pad
  const maxY = Math.max(...ys) + pad
  const vw = maxX - minX
  const vh = maxY - minY

  const posStyle: React.CSSProperties = {
    position: 'absolute',
    top: offsetY,
    [side]: '0px',
    transform: `scale(${scale})`,
    transformOrigin: side === 'left' ? 'top left' : 'top right',
    pointerEvents: 'none',
    opacity,
  }

  return (
    // Only visible at xl (≥1280px) where there's genuine margin space
    <div className="hidden xl:block" style={posStyle} aria-hidden="true">
      {/* Label */}
      <div
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '9px',
          letterSpacing: '0.15em',
          color: 'rgba(103,232,249,0.45)',
          textAlign: side === 'left' ? 'left' : 'right',
          marginBottom: 4,
          paddingLeft: side === 'left' ? 4 : 0,
          paddingRight: side === 'right' ? 4 : 0,
          textTransform: 'uppercase',
        }}
      >
        {data.label}
      </div>

      <svg
        width={vw * scale}
        height={vh * scale}
        viewBox={`${minX} ${minY} ${vw} ${vh}`}
        overflow="visible"
      >
        <defs>
          <filter id={`cg-${name}`} x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="5.5" result="blur1" />
            <feGaussianBlur stdDeviation="2.5" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Constellation lines */}
        {data.lines.map(([fromId, toId], li) => {
          const from = getStarById(data.stars, fromId)
          const to   = getStarById(data.stars, toId)
          if (!from || !to) return null
          const dx = to.x - from.x
          const dy = to.y - from.y
          const len = Math.sqrt(dx * dx + dy * dy)
          return (
            <line
              key={li}
              x1={from.x} y1={from.y}
              x2={to.x}   y2={to.y}
              stroke="rgba(103,232,249,0.78)"
              strokeWidth="1.3"
              strokeDasharray={len}
              strokeDashoffset={drawnEdges[li] ? 0 : len}
              style={{ transition: 'stroke-dashoffset 0.7s ease-out' }}
            />
          )
        })}

        {/* Stars */}
        {data.stars.map((star, si) => {
          const r = star.r ?? 1.5
          return (
            <g key={star.id} filter={`url(#cg-${name})`}>
              {/* Core dot */}
              <circle
                cx={star.x} cy={star.y}
                r={drawnStars[si] ? r : 0}
                fill="rgba(143,243,255,0.9)"
                style={{ transition: `r 0.35s ease ${si * 0.05}s` }}
              />
              {/* Pulse ring — only after full draw */}
              {pulse && (
                <circle
                  cx={star.x} cy={star.y}
                  r={r + 2}
                  fill="none"
                  stroke="rgba(103,232,249,0.4)"
                  strokeWidth="0.8"
                  style={{
                    transformOrigin: `${star.x}px ${star.y}px`,
                    animation: `cst-pulse 4s ease-in-out ${si * 0.28}s infinite`,
                  }}
                />
              )}
            </g>
          )
        })}
      </svg>

      <style>{`
        @keyframes cst-pulse {
          0%,100% { opacity: 0.4; transform: scale(1);   }
          50%      { opacity: 0;   transform: scale(3.5); }
        }
      `}</style>
    </div>
  )
}
