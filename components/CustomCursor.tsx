'use client'

import { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(hover: none)').matches) return

    let mx = 0, my = 0
    let rx = 0, ry = 0
    let rafId: number

    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      setVisible(true)
      const t = e.target as HTMLElement
      setIsHovering(!!t.closest('a,button,[role="button"],input,textarea,select,label,[tabindex]'))
    }
    const onLeave = () => setVisible(false)
    const onDown  = () => setIsClicking(true)
    const onUp    = () => setIsClicking(false)

    const loop = () => {
      // dot snaps instantly to mouse (hotspot = center)
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mx - 8}px, ${my - 8}px)`
      }
      // ring lerps behind (lag = 8%)
      rx += (mx - rx) * 0.08
      ry += (my - ry) * 0.08
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${rx - 24}px, ${ry - 24}px)`
      }
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseleave', onLeave)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  const cyan   = '#0EA5E9'
  const cyanHi = '#67E8F9'
  const purp   = 'rgba(124,58,237,0.7)'

  return (
    <>
      <style>{`
        * { cursor: none !important; }
        @keyframes reticle-spin { to { transform: rotate(360deg); } }
        @keyframes reticle-spin-rev { to { transform: rotate(-360deg); } }
        .reticle-spin     { animation: reticle-spin     9s linear infinite; transform-origin: 24px 24px; }
        .reticle-spin-rev { animation: reticle-spin-rev 6s linear infinite; transform-origin: 24px 24px; }
      `}</style>

      {/* ── INNER DOT / CROSSHAIR — instant, centered on mouse ── */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none select-none"
        style={{ zIndex: 2147483647, opacity: visible ? 1 : 0, transition: 'opacity 0.15s', willChange: 'transform' }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
          style={{
            transition: 'transform 0.1s cubic-bezier(0.22,1,0.36,1)',
            transform: isClicking ? 'scale(0.6)' : isHovering ? 'scale(1.3)' : 'scale(1)',
            filter: isHovering
              ? `drop-shadow(0 0 4px ${cyanHi}) drop-shadow(0 0 10px ${cyan})`
              : `drop-shadow(0 0 2px ${cyan})`,
          }}
        >
          {/* Center dot */}
          <circle cx="8" cy="8" r={isClicking ? 1.5 : isHovering ? 3 : 1.8}
            fill={isHovering ? cyanHi : cyan}
          />
          {/* Four crosshair ticks */}
          <line x1="8" y1="1"  x2="8" y2="5"  stroke={isHovering ? cyanHi : cyan} strokeWidth="1" strokeLinecap="round"/>
          <line x1="8" y1="11" x2="8" y2="15" stroke={isHovering ? cyanHi : cyan} strokeWidth="1" strokeLinecap="round"/>
          <line x1="1" y1="8"  x2="5" y2="8"  stroke={isHovering ? cyanHi : cyan} strokeWidth="1" strokeLinecap="round"/>
          <line x1="11" y1="8" x2="15" y2="8" stroke={isHovering ? cyanHi : cyan} strokeWidth="1" strokeLinecap="round"/>
        </svg>
      </div>

      {/* ── OUTER RETICLE RING — lags behind ── */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none select-none"
        style={{ zIndex: 2147483646, opacity: visible ? 1 : 0, transition: 'opacity 0.2s', willChange: 'transform' }}
      >
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none"
          style={{
            transition: 'transform 0.15s cubic-bezier(0.22,1,0.36,1)',
            transform: isClicking ? 'scale(0.75)' : isHovering ? 'scale(1.18)' : 'scale(1)',
            filter: isHovering
              ? `drop-shadow(0 0 6px ${cyan}) drop-shadow(0 0 16px ${purp})`
              : isClicking
              ? `drop-shadow(0 0 8px ${cyanHi})`
              : `drop-shadow(0 0 2px rgba(14,165,233,0.4))`,
          }}
        >
          {/* Outer dashed arc ring — slow spin */}
          <g className="reticle-spin">
            <circle cx="24" cy="24"
              r={isHovering ? 19 : 21}
              fill="none"
              stroke={isHovering ? cyan : 'rgba(14,165,233,0.35)'}
              strokeWidth="0.75"
              strokeDasharray={isHovering ? '5 3' : '3 5'}
              style={{ transition: 'all 0.25s' }}
            />
          </g>

          {/* Inner counter-rotating ring — 4 arc segments with gaps */}
          <g className="reticle-spin-rev">
            {/* Top arc */}
            <path d="M 14 24 A 10 10 0 0 1 24 14"
              fill="none" stroke={isHovering ? cyanHi : cyan}
              strokeWidth={isHovering ? 1.5 : 1} strokeLinecap="round"
              style={{ transition: 'all 0.2s' }}
            />
            {/* Right arc */}
            <path d="M 24 14 A 10 10 0 0 1 34 24"
              fill="none" stroke={isHovering ? cyanHi : cyan}
              strokeWidth={isHovering ? 1.5 : 1} strokeLinecap="round"
              style={{ transition: 'all 0.2s' }}
            />
            {/* Bottom arc */}
            <path d="M 34 24 A 10 10 0 0 1 24 34"
              fill="none" stroke={isHovering ? cyanHi : cyan}
              strokeWidth={isHovering ? 1.5 : 1} strokeLinecap="round"
              style={{ transition: 'all 0.2s' }}
            />
            {/* Left arc */}
            <path d="M 24 34 A 10 10 0 0 1 14 24"
              fill="none" stroke={isHovering ? cyanHi : cyan}
              strokeWidth={isHovering ? 1.5 : 1} strokeLinecap="round"
              style={{ transition: 'all 0.2s' }}
            />
          </g>

          {/* Corner bracket accents — only on hover */}
          {isHovering && (
            <>
              <path d="M 7 11 L 7 7 L 11 7"   fill="none" stroke={cyanHi} strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M 37 7  L 41 7 L 41 11" fill="none" stroke={cyanHi} strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M 7 37  L 7 41 L 11 41" fill="none" stroke={cyanHi} strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M 37 41 L 41 41 L 41 37" fill="none" stroke={cyanHi} strokeWidth="1.2" strokeLinecap="round"/>
            </>
          )}

          {/* Purple diagonal accent dots on hover */}
          {isHovering && (
            <>
              <circle cx="10" cy="10" r="1" fill={purp}/>
              <circle cx="38" cy="10" r="1" fill={purp}/>
              <circle cx="10" cy="38" r="1" fill={purp}/>
              <circle cx="38" cy="38" r="1" fill={purp}/>
            </>
          )}
        </svg>
      </div>
    </>
  )
}
