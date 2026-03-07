'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface Star {
  x: number; y: number; size: number; opacity: number
  phase: number; speed: number; color: string
}
interface ShootingStar {
  x: number; y: number; angle: number; length: number
  progress: number; active: boolean; speed: number; lineWidth: number
}

export default function IntroLoader() {
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // ── Starfield canvas — runs after canvas mounts (visible = true) ───────────
  useEffect(() => {
    if (!visible) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0)
    const STAR_COUNT = isMobile ? 150 : 350
    const COLORS = ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#67E8F9', '#67E8F9', '#A78BFA']

    let width = 0, height = 0
    let stars: Star[] = []
    const shootingStars: ShootingStar[] = Array.from({ length: 3 }, () => ({
      x: 0, y: 0, angle: 0, length: 0, progress: 0,
      active: false, speed: 0, lineWidth: 1,
    }))

    let offsetX = 0, offsetY = 0
    let targetOffsetX = 0, targetOffsetY = 0
    let time = 0, lastTime = 0, nextShoot = Math.random() * 4000
    let rafId = 0

    const resize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
      stars = Array.from({ length: STAR_COUNT }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 0.4 + Math.random() * 2.2,
        opacity: 0.15 + Math.random() * 0.75,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 1.2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      }))
    }
    resize()
    window.addEventListener('resize', resize)

    const onMouseMove = (e: MouseEvent) => {
      if (isMobile) return
      const cx = width / 2
      const cy = height / 2
      targetOffsetX = (e.clientX - cx) * 0.07
      targetOffsetY = (e.clientY - cy) * 0.07
    }
    window.addEventListener('mousemove', onMouseMove)

    // Gyroscope parallax for mobile
    const onDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (!isMobile) return
      const gamma = e.gamma !== null ? Math.max(-45, Math.min(45, e.gamma)) : 0
      const beta  = e.beta  !== null ? Math.max(-30, Math.min(30, e.beta - 30)) : 0
      targetOffsetX = (gamma / 45) * 40
      targetOffsetY = (beta  / 30) * 25
    }

    let gyroTouchCleanup: (() => void) | null = null
    if (isMobile && typeof DeviceOrientationEvent !== 'undefined') {
      type DOEWithPerm = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<string> }
      if (typeof (DeviceOrientationEvent as DOEWithPerm).requestPermission === 'function') {
        // iOS 13+ — must be triggered by a user gesture
        const onFirstTouch = () => {
          ;(DeviceOrientationEvent as DOEWithPerm)
            .requestPermission!()
            .then((state) => { if (state === 'granted') window.addEventListener('deviceorientation', onDeviceOrientation) })
            .catch(() => {})
        }
        document.addEventListener('touchstart', onFirstTouch, { once: true })
        gyroTouchCleanup = () => document.removeEventListener('touchstart', onFirstTouch)
      } else {
        // Android & non-iOS — no permission needed
        window.addEventListener('deviceorientation', onDeviceOrientation)
      }
    }

    const triggerShootingStar = () => {
      const slot = shootingStars.find(s => !s.active)
      if (!slot) return
      slot.x = width * (0.1 + Math.random() * 0.9)
      slot.y = height * (Math.random() * 0.60)
      slot.angle = 135 * (Math.PI / 180)
      slot.length = 80 + Math.random() * 520
      slot.progress = 0
      slot.active = true
      slot.lineWidth = 1.2 + Math.random() * 3.3
      slot.speed = 0.0005 + Math.random() * 0.0012
    }

    const loop = (timestamp: number) => {
      const delta = timestamp - lastTime
      lastTime = timestamp
      time += delta * 0.001

      offsetX += (targetOffsetX - offsetX) * 0.08
      offsetY += (targetOffsetY - offsetY) * 0.08

      ctx.clearRect(0, 0, width, height)

      for (const star of stars) {
        const twinkle = Math.sin(time * star.speed + star.phase) * 0.35 + 0.65
        const alpha = Math.max(0, Math.min(1, star.opacity * twinkle))
        const r = parseInt(star.color.slice(1, 3), 16)
        const g = parseInt(star.color.slice(3, 5), 16)
        const b = parseInt(star.color.slice(5, 7), 16)
        ctx.beginPath()
        ctx.arc(
          star.x + offsetX * (star.size / 2),
          star.y + offsetY * (star.size / 2),
          star.size * 0.5, 0, Math.PI * 2
        )
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
        ctx.fill()
      }

      for (const ss of shootingStars) {
        if (!ss.active) continue
        ss.progress += delta * ss.speed
        if (ss.progress >= 1) { ss.active = false; continue }

        const p = ss.progress
        const endX = ss.x + Math.cos(ss.angle) * ss.length * p
        const endY = ss.y + Math.sin(ss.angle) * ss.length * p
        const fadeIn  = p < 0.15 ? p / 0.15 : 1
        const fadeOut = p > 0.75 ? 1 - (p - 0.75) / 0.25 : 1
        const opacity = fadeIn * fadeOut

        const grad = ctx.createLinearGradient(ss.x, ss.y, endX, endY)
        grad.addColorStop(0, `rgba(103,232,249,0)`)
        grad.addColorStop(0.55, `rgba(103,232,249,${opacity * 0.95})`)
        grad.addColorStop(1, `rgba(167,139,250,${opacity * 0.55})`)
        ctx.beginPath(); ctx.moveTo(ss.x, ss.y); ctx.lineTo(endX, endY)
        ctx.strokeStyle = grad; ctx.lineWidth = ss.lineWidth; ctx.stroke()

        const glowGrad = ctx.createLinearGradient(ss.x, ss.y, endX, endY)
        glowGrad.addColorStop(0, `rgba(103,232,249,0)`)
        glowGrad.addColorStop(0.5, `rgba(103,232,249,${opacity * 0.22})`)
        glowGrad.addColorStop(1, `rgba(167,139,250,${opacity * 0.10})`)
        ctx.beginPath(); ctx.moveTo(ss.x, ss.y); ctx.lineTo(endX, endY)
        ctx.strokeStyle = glowGrad; ctx.lineWidth = ss.lineWidth * 4.5; ctx.stroke()

        if (ss.lineWidth > 2) {
          const bloomGrad = ctx.createLinearGradient(ss.x, ss.y, endX, endY)
          bloomGrad.addColorStop(0, `rgba(103,232,249,0)`)
          bloomGrad.addColorStop(0.5, `rgba(103,232,249,${opacity * 0.055})`)
          bloomGrad.addColorStop(1, `rgba(167,139,250,0)`)
          ctx.beginPath(); ctx.moveTo(ss.x, ss.y); ctx.lineTo(endX, endY)
          ctx.strokeStyle = bloomGrad; ctx.lineWidth = ss.lineWidth * 8; ctx.stroke()
        }
      }

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
      gyroTouchCleanup?.()
    }
  }, [visible])

  // ── Progress / exit timer — runs every mount (every home page visit) ────────
  useEffect(() => {
    // Reset + show — deferred to avoid synchronous setState in effect body
    queueMicrotask(() => {
      setProgress(0)
      setPhase('enter')
      setVisible(true)
    })

    // Progress bar: fill over 1800 ms
    const totalMs = 1800
    const interval = 16
    let elapsed = 0
    const timer = setInterval(() => {
      elapsed += interval
      const raw = elapsed / totalMs
      // Ease-out quad
      const eased = 1 - Math.pow(1 - Math.min(raw, 1), 2)
      setProgress(eased * 100)
      if (elapsed >= totalMs) {
        clearInterval(timer)
        setPhase('exit')
        // Unmount after exit animation (~700 ms)
        setTimeout(() => setVisible(false), 750)
      }
    }, interval)

    return () => clearInterval(timer)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center select-none"
          style={{ background: '#03030F' }}
        >
          {/* Galaxy starfield canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          />

          {/* Nebula centre glow — layered over stars for depth */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: 520,
              height: 520,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background:
                'radial-gradient(ellipse, rgba(14,165,233,0.08) 0%, rgba(124,58,237,0.06) 50%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(40px)',
            }}
          />

          {/* Scanning line */}
          {phase !== 'exit' && (
            <motion.div
              className="absolute left-0 right-0 h-px pointer-events-none"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(103,232,249,0.6) 30%, rgba(34,211,238,0.9) 50%, rgba(103,232,249,0.6) 70%, transparent 100%)',
                boxShadow: '0 0 12px rgba(34,211,238,0.5)',
              }}
              initial={{ top: '10%', opacity: 0 }}
              animate={{ top: ['10%', '90%', '10%'], opacity: [0, 0.8, 0.8, 0] }}
              transition={{ duration: 1.8, ease: 'easeInOut', times: [0, 0.45, 0.9, 1] }}
            />
          )}

          {/* Content */}
          <div className="relative flex flex-col items-center gap-6 px-8">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              className="relative"
            >
              {/* Glow ring behind logo */}
              <motion.div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse, rgba(34,211,238,0.18) 0%, transparent 70%)',
                  filter: 'blur(20px)',
                  transform: 'scale(1.6)',
                }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <Image
                src="/Progrex Logo White Transparent.png"
                alt="PROGREX"
                width={260}
                height={104}
                priority
                className="relative w-52 sm:w-64 h-auto object-contain"
              />
            </motion.div>

            {/* Tagline */}
            <motion.p
              className="font-mono text-xs sm:text-sm tracking-[0.28em] uppercase"
              style={{ color: 'rgba(103,232,249,0.55)' }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
            >
              Technology that drives success
            </motion.p>

            {/* Progress bar container */}
            <motion.div
              className="w-64 sm:w-80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.55 }}
            >
              {/* Track */}
              <div
                className="h-px w-full rounded-full overflow-hidden"
                style={{ background: 'rgba(103,232,249,0.12)' }}
              >
                {/* Fill */}
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background:
                      'linear-gradient(90deg, #22D3EE 0%, #67E8F9 50%, #8B5CF6 100%)',
                    boxShadow: '0 0 8px rgba(34,211,238,0.7)',
                    width: `${progress}%`,
                  }}
                />
              </div>

              {/* Percentage label */}
              <div className="flex justify-between mt-2">
                <span
                  className="font-mono text-[10px] tracking-widest"
                  style={{ color: 'rgba(103,232,249,0.35)' }}
                >
                  INITIALIZING
                </span>
                <span
                  className="font-mono text-[10px] tabular-nums"
                  style={{ color: 'rgba(103,232,249,0.45)' }}
                >
                  {Math.round(progress)}%
                </span>
              </div>
            </motion.div>

            {/* Bottom status dots */}
            <motion.div
              className="flex items-center gap-1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="block w-1 h-1 rounded-full"
                  style={{ background: 'rgba(34,211,238,0.6)' }}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.25,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </motion.div>
          </div>

          {/* Corner accents */}
          {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => (
            <motion.div
              key={corner}
              className="absolute w-6 h-6 pointer-events-none"
              style={{
                top: corner.startsWith('t') ? 24 : undefined,
                bottom: corner.startsWith('b') ? 24 : undefined,
                left: corner.endsWith('l') ? 24 : undefined,
                right: corner.endsWith('r') ? 24 : undefined,
                borderTop: corner.startsWith('t') ? '1px solid rgba(34,211,238,0.35)' : undefined,
                borderBottom: corner.startsWith('b') ? '1px solid rgba(34,211,238,0.35)' : undefined,
                borderLeft: corner.endsWith('l') ? '1px solid rgba(34,211,238,0.35)' : undefined,
                borderRight: corner.endsWith('r') ? '1px solid rgba(34,211,238,0.35)' : undefined,
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            />
          ))}

          {/* Bottom strip */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(34,211,238,0.25), rgba(139,92,246,0.2), transparent)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
