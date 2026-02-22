'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  alpha: number
  size: number
  vx: number
  vy: number
}

interface Ripple {
  x: number
  y: number
  radius: number
  maxRadius: number
  alpha: number
  speed: number
}

export default function CustomCursor() {
  const cursorRef = useRef<SVGSVGElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return

    const canvas  = canvasRef.current!
    const ctx     = canvas.getContext('2d')!
    let mouseX    = 0, mouseY = 0
    let prevX     = 0, prevY  = 0
    let targetScale = 1, currentScale = 1
    let isHovering  = false
    let rafId: number
    const particles: Particle[] = []
    const ripples:   Ripple[]   = []

    /* â”€â”€ canvas resize â”€â”€ */
    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    /* â”€â”€ cursor visibility â”€â”€ */
    const showCursor = (v: boolean) => {
      if (cursorRef.current) cursorRef.current.style.opacity = v ? '1' : '0'
    }

    /* â”€â”€ hover state â”€â”€ */
    const setHover = (on: boolean) => {
      if (isHovering === on) return
      isHovering  = on
      targetScale = on ? 1.25 : 1
      if (cursorRef.current) {
        cursorRef.current.style.filter = on
          ? 'drop-shadow(0 0 10px rgba(216,180,254,1)) drop-shadow(0 0 24px rgba(168,85,247,0.85))'
          : 'drop-shadow(0 0 6px rgba(168,85,247,0.9)) drop-shadow(0 0 16px rgba(109,40,217,0.6))'
      }
    }

    /* â”€â”€ mouse move: spawn tail particles â”€â”€ */
    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      showCursor(true)

      const t = e.target as HTMLElement
      setHover(!!t.closest('a,button,[role="button"],input,textarea,select,label,[tabindex]'))

      const dx   = mouseX - prevX
      const dy   = mouseY - prevY
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist > 2) {
        const count = Math.min(Math.ceil(dist / 5), 5)
        for (let i = 0; i < count; i++) {
          const t2 = i / count
          particles.push({
            x:     prevX + dx * t2 + (Math.random() - 0.5) * 5,
            y:     prevY + dy * t2 + (Math.random() - 0.5) * 5,
            alpha: 0.55 + Math.random() * 0.35,
            size:  1.5 + Math.random() * 3.5,
            vx:    (Math.random() - 0.5) * 0.8,
            vy:    (Math.random() - 0.5) * 0.8,
          })
        }
      }

      prevX = mouseX
      prevY = mouseY
    }

    /* â”€â”€ click: spawn ripple rings â”€â”€ */
    const onClick = (e: MouseEvent) => {
      const baseR = [28, 50, 72]
      baseR.forEach((maxR, i) => {
        ripples.push({
          x: e.clientX, y: e.clientY,
          radius: 0, maxRadius: maxR,
          alpha: 0.75 - i * 0.18,
          speed: 0.13 - i * 0.025,
        })
      })
    }

    const onLeave = () => showCursor(false)
    const onEnter = () => showCursor(true)

    /* â”€â”€ animation loop â”€â”€ */
    const loop = () => {
      /* smooth scale lerp */
      currentScale += (targetScale - currentScale) * 0.14

      if (cursorRef.current) {
        cursorRef.current.style.transform =
          `translate(${mouseX}px,${mouseY}px) scale(${currentScale})`
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      /* --- particles --- */
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x    += p.vx
        p.y    += p.vy
        p.alpha -= 0.028
        p.size  *= 0.95

        if (p.alpha <= 0 || p.size < 0.2) { particles.splice(i, 1); continue }

        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size)
        g.addColorStop(0,   `rgba(216,180,254,${p.alpha})`)
        g.addColorStop(0.5, `rgba(168, 85,247,${p.alpha * 0.55})`)
        g.addColorStop(1,   `rgba(109, 40,217,0)`)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = g
        ctx.fill()
      }

      /* --- ripples --- */
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i]
        r.radius += (r.maxRadius - r.radius) * r.speed
        r.alpha  -= 0.022
        if (r.alpha <= 0) { ripples.splice(i, 1); continue }

        /* outer ring */
        ctx.beginPath()
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(216,180,254,${r.alpha})`
        ctx.lineWidth   = 1.5
        ctx.stroke()

        /* soft inner fill pulse */
        const fg = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, r.radius)
        fg.addColorStop(0,   `rgba(168,85,247,${r.alpha * 0.18})`)
        fg.addColorStop(0.6, `rgba(109,40,217,${r.alpha * 0.08})`)
        fg.addColorStop(1,   `rgba(109,40,217,0)`)
        ctx.beginPath()
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
        ctx.fillStyle = fg
        ctx.fill()
      }

      rafId = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove',    onMove)
    window.addEventListener('click',        onClick)
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)
    rafId = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove',    onMove)
      window.removeEventListener('click',        onClick)
      window.removeEventListener('resize',       resize)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <>
      {/* â”€â”€ Canvas: particles + ripples â”€â”€ */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[9997]"
        style={{ willChange: 'transform' }}
      />

      {/* â”€â”€ Main cursor: smooth rounded arrow pointer â”€â”€ */}
      <svg
        ref={cursorRef}
        width="32"
        height="36"
        viewBox="0 0 32 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="fixed top-0 left-0 pointer-events-none z-[9999] opacity-0"
        style={{
          willChange: 'transform',
          transformOrigin: '0 0',
          filter: 'drop-shadow(0 0 6px rgba(168,85,247,0.9)) drop-shadow(0 0 16px rgba(109,40,217,0.6))',
          transition: 'filter 0.22s ease, opacity 0.18s ease',
        }}
      >
        <defs>
          {/* Main body gradient â€“ light lavender top-left â†’ deep violet bottom-right */}
          <linearGradient id="ptr-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#E9D5FF" />
            <stop offset="38%"  stopColor="#C084FC" />
            <stop offset="75%"  stopColor="#9333EA" />
            <stop offset="100%" stopColor="#6D28D9" />
          </linearGradient>

          {/* Gloss highlight â€“ top-left edge shimmer */}
          <linearGradient id="ptr-gloss" x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.45)" />
            <stop offset="60%"  stopColor="rgba(255,255,255,0.08)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)"    />
          </linearGradient>

          {/* Soft border gradient */}
          <linearGradient id="ptr-stroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="rgba(233,213,255,0.7)" />
            <stop offset="100%" stopColor="rgba(147,51,234,0.2)"  />
          </linearGradient>

          <filter id="ptr-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.5" />
          </filter>
        </defs>

        {/*
          Classic pointer arrow shape â€” tip at (2,2), smooth rounded feel:
          - Left edge goes straight down
          - Bottom-left notch cut for the "elbow"
          - Right side has the tapered tail with the inner notch
          Matches the smooth rounded arrow in the reference image.
        */}
        <path
          d="
            M2.5 2
            C2.2 2 2 2.2 2 2.5
            L2 27
            C2 27.6 2.7 27.9 3.1 27.5
            L9.2 21.2
            L13.8 31.5
            C14 32 14.6 32.2 15.1 32
            L17.8 30.8
            C18.3 30.6 18.5 30 18.3 29.5
            L13.8 19.5
            L23.5 19.5
            C24.1 19.5 24.4 18.8 24 18.4
            L3.2 2.3
            C3 2.1 2.8 2 2.5 2
            Z
          "
          fill="url(#ptr-fill)"
          stroke="url(#ptr-stroke)"
          strokeWidth="0.7"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Gloss overlay â€” top-left triangular highlight for 3-D depth */}
        <path
          d="
            M2.5 2
            C2.2 2 2 2.2 2 2.5
            L2 20
            L13 10
            L3.2 2.3
            C3 2.1 2.8 2 2.5 2
            Z
          "
          fill="url(#ptr-gloss)"
        />
      </svg>
    </>
  )
}
