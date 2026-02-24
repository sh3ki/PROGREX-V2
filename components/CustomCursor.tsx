'use client'

import { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return

    let mouseX = 0, mouseY = 0
    let ringX = 0, ringY = 0
    let rafId: number

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      setVisible(true)
      const t = e.target as HTMLElement
      setIsHovering(!!t.closest('a,button,[role="button"],input,textarea,select,label,[tabindex]'))
    }

    const onLeave = () => setVisible(false)
    const onDown = () => setIsClicking(true)
    const onUp = () => setIsClicking(false)

    const loop = () => {
      if (dotRef.current) {
        dotRef.current.style.transform = 'translate(' + (mouseX - 4) + 'px, ' + (mouseY - 4) + 'px)'
      }
      ringX += (mouseX - ringX) * 0.12
      ringY += (mouseY - ringY) * 0.12
      if (ringRef.current) {
        ringRef.current.style.transform = 'translate(' + (ringX - 20) + 'px, ' + (ringY - 20) + 'px)'
      }
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)

    window.addEventListener('mousemove', onMove)
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

  return (
    <>
      <style>{`* { cursor: none !important; }`}</style>

      {/* Center reticle dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.2s' }}
      >
        <svg
          width="8" height="8" viewBox="0 0 8 8"
          style={{
            filter: isHovering
              ? 'drop-shadow(0 0 5px rgba(103,232,249,1))'
              : 'drop-shadow(0 0 3px rgba(103,232,249,0.8))',
            transition: 'filter 0.2s',
          }}
        >
          <circle
            cx="4" cy="4"
            r={isClicking ? 1.5 : isHovering ? 3.5 : 2.5}
            fill={isHovering ? '#67E8F9' : 'rgba(103,232,249,0.9)'}
          />
        </svg>
      </div>

      {/* Outer reticle ring with crosshair lines */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[9998]"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.2s' }}
      >
        <svg
          width="40" height="40" viewBox="0 0 40 40"
          style={{
            animation: 'cursor-ring-spin 8s linear infinite',
            filter: isHovering ? 'drop-shadow(0 0 6px rgba(103,232,249,0.5))' : 'none',
            transition: 'filter 0.2s',
          }}
        >
          {/* Dashed orbit ring */}
          <circle
            cx="20" cy="20"
            r={isHovering ? 16 : 18}
            fill="none"
            stroke={isHovering ? 'rgba(103,232,249,0.9)' : 'rgba(103,232,249,0.4)'}
            strokeWidth="0.8"
            strokeDasharray={isHovering ? '4 2' : '3 3'}
          />
          {/* Crosshair ticks */}
          <line x1="20" y1="2"  x2="20" y2="8"  stroke="rgba(103,232,249,0.6)" strokeWidth="0.8"/>
          <line x1="20" y1="32" x2="20" y2="38" stroke="rgba(103,232,249,0.6)" strokeWidth="0.8"/>
          <line x1="2"  y1="20" x2="8"  y2="20" stroke="rgba(103,232,249,0.6)" strokeWidth="0.8"/>
          <line x1="32" y1="20" x2="38" y2="20" stroke="rgba(103,232,249,0.6)" strokeWidth="0.8"/>
          {/* Corner brackets on hover */}
          {isHovering && (
            <>
              <path d="M 8 12 L 8 8 L 12 8"   fill="none" stroke="rgba(103,232,249,0.8)" strokeWidth="1"/>
              <path d="M 28 8 L 32 8 L 32 12"  fill="none" stroke="rgba(103,232,249,0.8)" strokeWidth="1"/>
              <path d="M 8 28 L 8 32 L 12 32"  fill="none" stroke="rgba(103,232,249,0.8)" strokeWidth="1"/>
              <path d="M 28 32 L 32 32 L 32 28" fill="none" stroke="rgba(103,232,249,0.8)" strokeWidth="1"/>
            </>
          )}
        </svg>
      </div>
    </>
  )
}
