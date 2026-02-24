'use client'

import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  size: number
  opacity: number
  phase: number
  speed: number
  color: string
}

interface ShootingStar {
  x: number
  y: number
  angle: number
  length: number
  progress: number
  active: boolean
}

export default function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const isMobile = window.matchMedia('(max-width: 768px)').matches
    const STAR_COUNT = isMobile ? 150 : 350

    let width = window.innerWidth
    let height = window.innerHeight
    let offsetX = 0
    let offsetY = 0
    let targetOffsetX = 0
    let targetOffsetY = 0
    let rafId: number
    let time = 0

    const colors = ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF',
                    '#67E8F9', '#67E8F9', '#A78BFA']

    // Generate stars
    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 0.5 + Math.random() * 2,
      opacity: 0.2 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
    }))

    // Shooting star state
    const shootingStar: ShootingStar = {
      x: 0, y: 0, angle: 0, length: 0, progress: 0, active: false,
    }

    let nextShoot = 6000 + Math.random() * 6000
    let lastTime = 0

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }
    resize()
    window.addEventListener('resize', resize)

    // Mouse parallax
    const onMouseMove = (e: MouseEvent) => {
      if (isMobile) return
      const cx = width / 2
      const cy = height / 2
      targetOffsetX = (e.clientX - cx) * 0.02
      targetOffsetY = (e.clientY - cy) * 0.02
    }
    window.addEventListener('mousemove', onMouseMove)

    const triggerShootingStar = () => {
      shootingStar.x = width * (0.5 + Math.random() * 0.5)
      shootingStar.y = height * Math.random() * 0.4
      shootingStar.angle = (210 + Math.random() * 30) * (Math.PI / 180)
      shootingStar.length = 120 + Math.random() * 150
      shootingStar.progress = 0
      shootingStar.active = true
    }

    const loop = (timestamp: number) => {
      const delta = timestamp - lastTime
      lastTime = timestamp
      time += delta * 0.001

      // Smooth parallax lerp
      offsetX += (targetOffsetX - offsetX) * 0.05
      offsetY += (targetOffsetY - offsetY) * 0.05

      ctx.clearRect(0, 0, width, height)

      // Draw stars
      for (const star of stars) {
        const twinkle = Math.sin(time * star.speed + star.phase) * 0.35 + 0.65
        const alpha = Math.max(0, Math.min(1, star.opacity * twinkle))

        ctx.beginPath()
        ctx.arc(
          star.x + offsetX * (star.size / 2),
          star.y + offsetY * (star.size / 2),
          star.size * 0.5,
          0, Math.PI * 2
        )
        ctx.fillStyle = star.color.replace(')', `,${alpha})`).replace('rgb', 'rgba').replace('#', '')

        // Re-parse hex color for alpha
        const r = parseInt(star.color.slice(1, 3), 16)
        const g = parseInt(star.color.slice(3, 5), 16)
        const b = parseInt(star.color.slice(5, 7), 16)
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
        ctx.fill()
      }

      // Shooting star
      if (shootingStar.active) {
        shootingStar.progress += delta * 0.0012

        if (shootingStar.progress >= 1) {
          shootingStar.active = false
          nextShoot = 6000 + Math.random() * 6000
        } else {
          const p = shootingStar.progress
          const startX = shootingStar.x
          const startY = shootingStar.y
          const endX = startX + Math.cos(shootingStar.angle) * shootingStar.length * p
          const endY = startY + Math.sin(shootingStar.angle) * shootingStar.length * p

          const fadeIn = p < 0.15 ? p / 0.15 : 1
          const fadeOut = p > 0.8 ? 1 - (p - 0.8) / 0.2 : 1
          const opacity = fadeIn * fadeOut

          const grad = ctx.createLinearGradient(startX, startY, endX, endY)
          grad.addColorStop(0, `rgba(103,232,249,0)`)
          grad.addColorStop(0.6, `rgba(103,232,249,${opacity * 0.9})`)
          grad.addColorStop(1, `rgba(167,139,250,${opacity * 0.5})`)

          ctx.beginPath()
          ctx.moveTo(startX, startY)
          ctx.lineTo(endX, endY)
          ctx.strokeStyle = grad
          ctx.lineWidth = 1.5
          ctx.stroke()

          // Glow
          const glowGrad = ctx.createLinearGradient(startX, startY, endX, endY)
          glowGrad.addColorStop(0, `rgba(103,232,249,0)`)
          glowGrad.addColorStop(0.6, `rgba(103,232,249,${opacity * 0.15})`)
          glowGrad.addColorStop(1, `rgba(167,139,250,0)`)
          ctx.beginPath()
          ctx.moveTo(startX, startY)
          ctx.lineTo(endX, endY)
          ctx.strokeStyle = glowGrad
          ctx.lineWidth = 5
          ctx.stroke()
        }
      }

      nextShoot -= delta
      if (nextShoot <= 0 && !shootingStar.active) {
        triggerShootingStar()
      }

      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  )
}
