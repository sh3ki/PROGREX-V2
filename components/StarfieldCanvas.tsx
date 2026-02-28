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
  lineWidth: number
  speed: number
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

    // Generate stars — slightly larger dots
    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 0.7 + Math.random() * 2.6,
      opacity: 0.2 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
    }))

    // Shooting star pool — up to 3 concurrent
    const MAX_CONCURRENT = 3
    const shootingStars: ShootingStar[] = Array.from({ length: MAX_CONCURRENT }, () => ({
      x: 0, y: 0, angle: 0, length: 0, progress: 0, active: false, lineWidth: 2.5, speed: 0.0009,
    }))

    let nextShoot = Math.random() * 4000
    let lastTime = 0

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }
    resize()
    window.addEventListener('resize', resize)

    // Mouse parallax — increased factor for more noticeable movement
    const onMouseMove = (e: MouseEvent) => {
      if (isMobile) return
      const cx = width / 2
      const cy = height / 2
      targetOffsetX = (e.clientX - cx) * 0.07
      targetOffsetY = (e.clientY - cy) * 0.07
    }
    window.addEventListener('mousemove', onMouseMove)

    // Gyroscope parallax for mobile devices
    const onDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (!isMobile) return
      const gamma = e.gamma !== null ? Math.max(-45, Math.min(45, e.gamma)) : 0 // left-right tilt
      const beta  = e.beta  !== null ? Math.max(-30, Math.min(30, e.beta  - 30)) : 0 // front-back tilt, offset for natural phone angle
      targetOffsetX = (gamma / 45) * 40
      targetOffsetY = (beta  / 30) * 25
    }
    if (isMobile && typeof DeviceOrientationEvent !== 'undefined') {
      window.addEventListener('deviceorientation', onDeviceOrientation)
    }

    const triggerShootingStar = () => {
      // Find an inactive slot
      const slot = shootingStars.find(s => !s.active)
      if (!slot) return
      // Randomized start position — anywhere across top 60% of screen, full width
      slot.x = width * (0.1 + Math.random() * 0.9)
      slot.y = height * (Math.random() * 0.60)
      // Fixed 135° = exactly 45° downward to bottom-left in canvas coords
      // cos(135°) = -0.707 (left), sin(135°) = 0.707 (down)
      slot.angle = 135 * (Math.PI / 180)
      // Vary length greatly: short wisps to long streaks
      slot.length = 80 + Math.random() * 520
      slot.progress = 0
      slot.active = true
      // Vary thickness: thin wisp (1.2) to fat streak (4.5)
      slot.lineWidth = 1.2 + Math.random() * 3.3
      // Vary speed: slow drifters to fast bolts
      slot.speed = 0.0005 + Math.random() * 0.0012
    }

    const loop = (timestamp: number) => {
      const delta = timestamp - lastTime
      lastTime = timestamp
      time += delta * 0.001

      // Smooth parallax lerp — slightly faster for more noticeable movement
      offsetX += (targetOffsetX - offsetX) * 0.08
      offsetY += (targetOffsetY - offsetY) * 0.08

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

      // Draw all active shooting stars
      for (const ss of shootingStars) {
        if (!ss.active) continue
        ss.progress += delta * ss.speed

        if (ss.progress >= 1) {
          ss.active = false
          continue
        }

        const p = ss.progress
        const startX = ss.x
        const startY = ss.y
        const endX = startX + Math.cos(ss.angle) * ss.length * p
        const endY = startY + Math.sin(ss.angle) * ss.length * p

        const fadeIn  = p < 0.15 ? p / 0.15 : 1
        const fadeOut = p > 0.75 ? 1 - (p - 0.75) / 0.25 : 1
        const opacity = fadeIn * fadeOut

        // Core streak
        const grad = ctx.createLinearGradient(startX, startY, endX, endY)
        grad.addColorStop(0, `rgba(103,232,249,0)`)
        grad.addColorStop(0.55, `rgba(103,232,249,${opacity * 0.95})`)
        grad.addColorStop(1, `rgba(167,139,250,${opacity * 0.55})`)
        ctx.beginPath()
        ctx.moveTo(startX, startY)
        ctx.lineTo(endX, endY)
        ctx.strokeStyle = grad
        ctx.lineWidth = ss.lineWidth
        ctx.stroke()

        // Glow halo — scales with lineWidth
        const glowGrad = ctx.createLinearGradient(startX, startY, endX, endY)
        glowGrad.addColorStop(0, `rgba(103,232,249,0)`)
        glowGrad.addColorStop(0.5, `rgba(103,232,249,${opacity * 0.22})`)
        glowGrad.addColorStop(1, `rgba(167,139,250,${opacity * 0.10})`)
        ctx.beginPath()
        ctx.moveTo(startX, startY)
        ctx.lineTo(endX, endY)
        ctx.strokeStyle = glowGrad
        ctx.lineWidth = ss.lineWidth * 4.5
        ctx.stroke()

        // Wide soft bloom — only for thicker stars
        if (ss.lineWidth > 2) {
          const bloomGrad = ctx.createLinearGradient(startX, startY, endX, endY)
          bloomGrad.addColorStop(0, `rgba(103,232,249,0)`)
          bloomGrad.addColorStop(0.5, `rgba(103,232,249,${opacity * 0.055})`)
          bloomGrad.addColorStop(1, `rgba(167,139,250,0)`)
          ctx.beginPath()
          ctx.moveTo(startX, startY)
          ctx.lineTo(endX, endY)
          ctx.strokeStyle = bloomGrad
          ctx.lineWidth = ss.lineWidth * 8
          ctx.stroke()
        }
      }

      // Schedule next shooting star — 0 to 7 seconds, fires regardless of active stars
      nextShoot -= delta
      if (nextShoot <= 0) {
        triggerShootingStar()
        nextShoot = Math.random() * 7000
      }

      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      if (isMobile && typeof DeviceOrientationEvent !== 'undefined') {
        window.removeEventListener('deviceorientation', onDeviceOrientation)
      }
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
