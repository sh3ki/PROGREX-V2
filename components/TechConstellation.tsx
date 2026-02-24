'use client'

import { useRef, useEffect, useState } from 'react'

interface TechNode {
  id: string
  label: string
  x: number
  y: number
  connections: string[]
  color: string
}

const TECH_NODES: TechNode[] = [
  { id: 'next', label: 'Next.js', x: 50, y: 50, connections: ['react', 'ts', 'node'], color: '#67E8F9' },
  { id: 'react', label: 'React', x: 22, y: 35, connections: ['ts', 'tailwind'], color: '#67E8F9' },
  { id: 'ts', label: 'TypeScript', x: 38, y: 72, connections: ['prisma', 'node'], color: '#A78BFA' },
  { id: 'tailwind', label: 'Tailwind', x: 12, y: 60, connections: ['react'], color: '#34D399' },
  { id: 'node', label: 'Node.js', x: 70, y: 68, connections: ['prisma', 'mongo'], color: '#67E8F9' },
  { id: 'prisma', label: 'Prisma', x: 58, y: 84, connections: ['mongo'], color: '#A78BFA' },
  { id: 'mongo', label: 'MongoDB', x: 80, y: 50, connections: [], color: '#34D399' },
  { id: 'vercel', label: 'Vercel', x: 75, y: 22, connections: ['next'], color: '#67E8F9' },
  { id: 'figma', label: 'Figma', x: 25, y: 15, connections: ['react'], color: '#A78BFA' },
]

export default function TechConstellation() {
  const [hovered, setHovered] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 300)
    return () => clearTimeout(timer)
  }, [])

  const getNode = (id: string) => TECH_NODES.find(n => n.id === id)

  const isHighlighted = (node: TechNode) => {
    if (!hovered) return false
    return node.id === hovered || node.connections.includes(hovered) ||
      TECH_NODES.find(n => n.id === hovered)?.connections.includes(node.id)
  }

  return (
    <div className="relative w-full h-64 md:h-80 select-none" aria-hidden="true">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        {/* Lines */}
        {TECH_NODES.flatMap(node =>
          node.connections.map(connId => {
            const target = getNode(connId)
            if (!target) return null
            const active = hovered && (node.id === hovered || connId === hovered)
            return (
              <line
                key={`${node.id}-${connId}`}
                x1={node.x} y1={node.y}
                x2={target.x} y2={target.y}
                stroke={active ? 'rgba(103,232,249,0.45)' : 'rgba(103,232,249,0.1)'}
                strokeWidth={active ? 0.4 : 0.2}
                style={{ transition: 'stroke 0.3s, stroke-width 0.3s' }}
              />
            )
          })
        )}

        {/* Nodes */}
        {TECH_NODES.map(node => {
          const highlighted = isHighlighted(node)
          const isActive = node.id === hovered
          return (
            <g
              key={node.id}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHovered(node.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Glow ring */}
              {(isActive || highlighted) && (
                <circle
                  cx={node.x} cy={node.y} r={isActive ? 4 : 3}
                  fill="none"
                  stroke={node.color}
                  strokeWidth="0.4"
                  opacity="0.5"
                  style={{ animation: 'pulse 2s ease-in-out infinite' }}
                />
              )}
              {/* Node dot */}
              <circle
                cx={node.x} cy={node.y}
                r={isActive ? 2.5 : highlighted ? 2 : 1.5}
                fill={isActive ? node.color : `${node.color}88`}
                stroke={node.color}
                strokeWidth="0.3"
                style={{ transition: 'r 0.2s, fill 0.2s' }}
              />
            </g>
          )
        })}
      </svg>

      {/* Labels (HTML overlay for better readability) */}
      {TECH_NODES.map(node => {
        const highlighted = node.id === hovered || isHighlighted(node)
        return (
          <div
            key={node.id}
            className="absolute font-mono text-[9px] md:text-[10px] pointer-events-none transition-all duration-200"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              transform: 'translate(-50%, -180%)',
              color: highlighted ? node.color : 'rgba(255,255,255,0.35)',
              fontWeight: highlighted ? 600 : 400,
              letterSpacing: '0.08em',
              textShadow: highlighted ? `0 0 8px ${node.color}` : 'none',
            }}
          >
            {node.label}
          </div>
        )
      })}
    </div>
  )
}
