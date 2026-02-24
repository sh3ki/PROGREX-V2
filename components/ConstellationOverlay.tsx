'use client'

import { useEffect, useRef, useState } from 'react'

interface Node {
  x: number
  y: number
  id: string
}

interface Edge {
  from: string
  to: string
}

interface Constellation {
  nodes: Node[]
  edges: Edge[]
  offsetX: string
  offsetY: string
}

const CONSTELLATIONS: Constellation[] = [
  // Network topology — top-left quadrant
  {
    offsetX: '8%',
    offsetY: '8%',
    nodes: [
      { id: 'a1', x: 0, y: 0 },
      { id: 'a2', x: 60, y: -20 },
      { id: 'a3', x: 110, y: 30 },
      { id: 'a4', x: 40, y: 60 },
      { id: 'a5', x: -30, y: 50 },
    ],
    edges: [
      { from: 'a1', to: 'a2' },
      { from: 'a1', to: 'a4' },
      { from: 'a1', to: 'a5' },
      { from: 'a2', to: 'a3' },
      { from: 'a3', to: 'a4' },
    ],
  },
  // Circuit-board — top-right quadrant
  {
    offsetX: '68%',
    offsetY: '6%',
    nodes: [
      { id: 'b1', x: 0, y: 0 },
      { id: 'b2', x: 50, y: 0 },
      { id: 'b3', x: 50, y: 50 },
      { id: 'b4', x: 0, y: 50 },
      { id: 'b5', x: 25, y: 25 },
      { id: 'b6', x: 80, y: 25 },
    ],
    edges: [
      { from: 'b1', to: 'b2' },
      { from: 'b2', to: 'b3' },
      { from: 'b3', to: 'b4' },
      { from: 'b4', to: 'b1' },
      { from: 'b5', to: 'b2' },
      { from: 'b5', to: 'b4' },
      { from: 'b2', to: 'b6' },
    ],
  },
  // Server diamond — bottom-right
  {
    offsetX: '72%',
    offsetY: '65%',
    nodes: [
      { id: 'c1', x: 30, y: 0 },
      { id: 'c2', x: 60, y: 30 },
      { id: 'c3', x: 30, y: 60 },
      { id: 'c4', x: 0, y: 30 },
      { id: 'c5', x: 30, y: 30 },
    ],
    edges: [
      { from: 'c1', to: 'c2' },
      { from: 'c2', to: 'c3' },
      { from: 'c3', to: 'c4' },
      { from: 'c4', to: 'c1' },
      { from: 'c5', to: 'c1' },
      { from: 'c5', to: 'c2' },
      { from: 'c5', to: 'c3' },
      { from: 'c5', to: 'c4' },
    ],
  },
  // Satellite dish — bottom-left
  {
    offsetX: '5%',
    offsetY: '70%',
    nodes: [
      { id: 'd1', x: 40, y: 0 },
      { id: 'd2', x: 0, y: 40 },
      { id: 'd3', x: 40, y: 40 },
      { id: 'd4', x: 80, y: 40 },
      { id: 'd5', x: 40, y: 80 },
    ],
    edges: [
      { from: 'd1', to: 'd3' },
      { from: 'd2', to: 'd3' },
      { from: 'd3', to: 'd4' },
      { from: 'd3', to: 'd5' },
      { from: 'd1', to: 'd2' },
      { from: 'd1', to: 'd4' },
    ],
  },
]

function getNodeById(nodes: Node[], id: string): Node | undefined {
  return nodes.find((n) => n.id === id)
}

function ConstellationGroup({ constellation, index }: { constellation: Constellation; index: number }) {
  const edgeCount = constellation.edges.length
  const [drawn, setDrawn] = useState<boolean[]>(Array(edgeCount).fill(false))
  const [nodes, setNodes] = useState<boolean[]>(Array(constellation.nodes.length).fill(false))
  const [pulsing, setPulsing] = useState(false)

  useEffect(() => {
    let cancelled = false
    const drawEdges = async () => {
      await new Promise(r => setTimeout(r, 300 + index * 400))
      for (let i = 0; i < edgeCount; i++) {
        if (cancelled) return
        await new Promise(r => setTimeout(r, 220))
        setDrawn(prev => { const n = [...prev]; n[i] = true; return n })
      }
      // Show nodes
      for (let j = 0; j < constellation.nodes.length; j++) {
        if (cancelled) return
        await new Promise(r => setTimeout(r, 80))
        setNodes(prev => { const n = [...prev]; n[j] = true; return n })
      }
      await new Promise(r => setTimeout(r, 400))
      if (!cancelled) setPulsing(true)
    }
    drawEdges()
    return () => { cancelled = true }
  }, [edgeCount, constellation.nodes.length, index])

  const minX = Math.min(...constellation.nodes.map(n => n.x)) - 10
  const minY = Math.min(...constellation.nodes.map(n => n.y)) - 10
  const maxX = Math.max(...constellation.nodes.map(n => n.x)) + 10
  const maxY = Math.max(...constellation.nodes.map(n => n.y)) + 10
  const vw = maxX - minX
  const vh = maxY - minY

  return (
    <div
      className="absolute"
      style={{ left: constellation.offsetX, top: constellation.offsetY }}
    >
      <svg
        width={vw}
        height={vh}
        viewBox={`${minX} ${minY} ${vw} ${vh}`}
        overflow="visible"
        aria-hidden="true"
      >
        <defs>
          <filter id={`glow-${index}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Edges */}
        {constellation.edges.map((edge, ei) => {
          const from = getNodeById(constellation.nodes, edge.from)
          const to = getNodeById(constellation.nodes, edge.to)
          if (!from || !to) return null
          const dx = to.x - from.x
          const dy = to.y - from.y
          const len = Math.sqrt(dx * dx + dy * dy)

          return (
            <line
              key={ei}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="rgba(103,232,249,0.14)"
              strokeWidth="0.8"
              strokeDasharray={len}
              strokeDashoffset={drawn[ei] ? 0 : len}
              style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
            />
          )
        })}

        {/* Nodes */}
        {constellation.nodes.map((node, ni) => (
          <g key={node.id} filter={`url(#glow-${index})`}>
            <circle
              cx={node.x}
              cy={node.y}
              r={nodes[ni] ? 2 : 0}
              fill="rgba(103,232,249,0.7)"
              style={{ transition: 'r 0.3s ease-out' }}
            />
            {pulsing && (
              <circle
                cx={node.x}
                cy={node.y}
                r={2}
                fill="none"
                stroke="rgba(103,232,249,0.4)"
                strokeWidth="1"
                style={{
                  animation: `constellation-pulse 3s ease-in-out ${ni * 0.3}s infinite`,
                }}
              />
            )}
          </g>
        ))}
      </svg>

      <style jsx>{`
        @keyframes constellation-pulse {
          0%, 100% { r: 2; opacity: 0.4; }
          50% { r: 6; opacity: 0; }
        }
      `}</style>
    </div>
  )
}

export default function ConstellationOverlay() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    >
      {CONSTELLATIONS.map((constellation, i) => (
        <ConstellationGroup key={i} constellation={constellation} index={i} />
      ))}
    </div>
  )
}
