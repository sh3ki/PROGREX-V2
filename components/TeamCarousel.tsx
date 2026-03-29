'use client'

import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Globe, Mail } from 'lucide-react'

type TeamMember = {
  id: string | number
  name: string
  role: string
  bio: string
  avatar: string
  email: string
  portfolio?: string
}

function getCardStyle(offset: number) {
  const abs = Math.abs(offset)
  if (abs > 2) return null
  if (abs === 0) return { x: '0%', scale: 1, rotateY: 0, z: 0, opacity: 1, zIndex: 10 }
  if (abs === 1) {
    const sign = offset > 0 ? 1 : -1
    return { x: `${sign * 60}%`, scale: 0.78, rotateY: -sign * 40, z: -120, opacity: 0.5, zIndex: 5 }
  }
  const sign = offset > 0 ? 1 : -1
  return { x: `${sign * 100}%`, scale: 0.6, rotateY: -sign * 54, z: -220, opacity: 0.18, zIndex: 1 }
}

export default function TeamCarousel({ teamData }: { teamData: TeamMember[] }) {
  const [current, setCurrent] = useState(0)
  const [dragging, setDragging] = useState(false)

  const total = teamData.length
  const maxBodyChars = teamData.reduce((max, member) => {
    const combined = `${member.name} ${member.role} ${member.bio} ${member.email ?? ''} ${member.portfolio ?? ''}`
    return Math.max(max, combined.length)
  }, 0)
  const cardBodyMinHeight = `${Math.max(330, Math.ceil(maxBodyChars / 2.9))}px`

  const go = useCallback(
    (delta: number) => {
      if (total === 0) return
      setCurrent((c) => (c + delta + total) % total)
    },
    [total]
  )

  if (total === 0) {
    return <div className="text-center text-sm text-slate-500">No team members available.</div>
  }

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    setDragging(false)
    if (info.offset.x < -60) go(1)
    else if (info.offset.x > 60) go(-1)
  }

  return (
    <div className="relative w-full select-none">
      <style>{`
        .team-card {
          transition: box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .team-card:hover {
          box-shadow: 0 0 0 1px rgba(14,165,233,0.3), 0 0 32px rgba(14,165,233,0.25), 0 8px 40px rgba(0,0,0,0.55);
          border-color: rgba(14,165,233,0.4) !important;
        }
        .team-card-center:hover {
          box-shadow: 0 0 0 1px rgba(14,165,233,0.6), 0 0 55px rgba(14,165,233,0.5), 0 0 110px rgba(124,58,237,0.3), 0 20px 60px rgba(0,0,0,0.65);
          border-color: rgba(14,165,233,0.75) !important;
        }
      `}</style>

      <div className="relative max-w-7xl mx-auto">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-20" />

        <div className="relative w-full h-175 sm:h-187.5" style={{ perspective: '1100px' }}>
          {teamData.map((member, i) => {
            const offset =
              ((i - current + total) % total + Math.floor(total / 2)) % total -
              Math.floor(total / 2)
            const style = getCardStyle(offset)
            if (!style) return null

            const isCenter = offset === 0

            return (
              <motion.div
                key={member.id}
                className="absolute top-0 left-0 right-0 mx-auto w-full max-w-105"
                animate={{ x: style.x, scale: style.scale, rotateY: style.rotateY, z: style.z, opacity: style.opacity }}
                transition={{ type: 'spring', stiffness: 300, damping: 32, mass: 0.8 }}
                style={{ zIndex: style.zIndex, transformStyle: 'preserve-3d', cursor: isCenter ? 'grab' : 'default' }}
                drag={isCenter ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.12}
                onDragStart={() => setDragging(true)}
                onDragEnd={handleDragEnd}
                whileDrag={{ cursor: 'grabbing' }}
                onClick={() => {
                  if (!isCenter && !dragging) go(offset > 0 ? 1 : -1)
                }}
              >
                <div
                  className={`relative rounded-2xl overflow-hidden team-card${isCenter ? ' team-card-center' : ''}`}
                  style={{
                    background: 'rgba(6,6,22,0.97)',
                    border: isCenter ? '1px solid rgba(14,165,233,0.35)' : '1px solid rgba(103,232,249,0.10)',
                    boxShadow: isCenter
                      ? '0 0 55px rgba(14,165,233,0.13), 0 0 90px rgba(124,58,237,0.07), 0 20px 55px rgba(0,0,0,0.58)'
                      : '0 8px 32px rgba(0,0,0,0.4)',
                  }}
                >
                  {isCenter ? (
                    <div className="absolute inset-x-0 top-0 h-px z-10" style={{ background: 'linear-gradient(to right, transparent, #0EA5E9, #7C3AED, transparent)' }} />
                  ) : null}

                  <div className="relative aspect-square overflow-hidden">
                    <Image src={member.avatar} alt={member.name} fill className="object-cover object-top transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 420px" draggable={false} />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(6,6,22,0.05) 0%, rgba(6,6,22,0.7) 100%)' }} />
                    <div className="absolute top-4 left-4 z-10">
                      <span className="font-mono text-[10px] px-2.5 py-1 rounded-full backdrop-blur-sm" style={{ background: 'rgba(14,165,233,0.52)', border: '1px solid rgba(14,165,233,0.5)', color: '#93E6FB' }}>
                        {member.role}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4 z-10">
                      <span className="font-mono text-[10px] text-white/35 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded">
                        {String(i + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col p-5 sm:p-6" style={{ minHeight: cardBodyMinHeight }}>
                    <h3 className="font-display font-bold text-xl sm:text-2xl mb-1 leading-tight text-center" style={{ color: isCenter ? '#fff' : 'rgba(255,255,255,0.75)' }}>
                      {member.name}
                    </h3>
                    <div className="font-mono text-sm text-nebula-400 tracking-widest mb-3 uppercase text-center">{member.role}</div>
                    <p className="text-white/45 text-sm leading-relaxed mb-5 text-justify">{member.bio}</p>

                    <div className="mt-auto pt-4" style={{ borderTop: '1px solid rgba(103,232,249,0.08)' }}>
                      <div className="flex flex-wrap items-start gap-2">
                      {member.portfolio ? (
                        <a
                          href={member.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/65 transition-all duration-200 hover:text-nebula-300"
                          style={{ border: '1px solid rgba(103,232,249,0.15)' }}
                        >
                          <Globe size={14} />
                          <span>View portfolio -&gt;</span>
                        </a>
                      ) : null}

                      <a
                        href={`mailto:${member.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex flex-1 min-w-0 items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/65 transition-all duration-200 hover:text-nebula-300 cursor-pointer"
                        style={{ border: '1px solid rgba(103,232,249,0.15)' }}
                      >
                        <Mail size={14} />
                        <span className="truncate">{member.email || 'No email provided'}</span>
                      </a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 mt-6 sm:mt-10">
        <motion.button
          onClick={() => go(-1)}
          className="flex items-center justify-center w-10 h-10 rounded-full"
          style={{ background: 'rgba(103,232,249,0.06)', border: '1px solid rgba(103,232,249,0.2)', color: 'rgba(103,232,249,0.7)' }}
          whileHover={{ scale: 1.1, background: 'rgba(14,165,233,0.18)', borderColor: 'rgba(14,165,233,0.6)' }}
          whileTap={{ scale: 0.93 }}
          aria-label="Previous member"
        >
          <ChevronLeft size={18} />
        </motion.button>

        <div className="flex gap-2">
          {teamData.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="transition-all duration-300 rounded-full"
              style={{
                width: i === current ? 24 : 6,
                height: 6,
                background: i === current ? 'linear-gradient(to right, #0EA5E9, #7C3AED)' : 'rgba(103,232,249,0.25)',
              }}
              aria-label={`Go to member ${i + 1}`}
            />
          ))}
        </div>

        <motion.button
          onClick={() => go(1)}
          className="flex items-center justify-center w-10 h-10 rounded-full"
          style={{ background: 'rgba(103,232,249,0.06)', border: '1px solid rgba(103,232,249,0.2)', color: 'rgba(103,232,249,0.7)' }}
          whileHover={{ scale: 1.1, background: 'rgba(14,165,233,0.18)', borderColor: 'rgba(14,165,233,0.6)' }}
          whileTap={{ scale: 0.93 }}
          aria-label="Next member"
        >
          <ChevronRight size={18} />
        </motion.button>
      </div>

      <p className="text-center font-mono text-[10px] text-white/20 mt-3 tracking-widest">← DRAG OR SWIPE TO MEET THE TEAM →</p>
    </div>
  )
}
