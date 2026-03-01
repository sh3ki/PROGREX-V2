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
  // ── Top-left: wide network hub
  {
    offsetX: '4%',
    offsetY: '6%',
    nodes: [
      { id: 'a1', x: 0,   y: 0   },
      { id: 'a2', x: 65,  y: -22 },
      { id: 'a3', x: 118, y: 28  },
      { id: 'a4', x: 48,  y: 65  },
      { id: 'a5', x: -32, y: 52  },
      { id: 'a6', x: 28,  y: 105 },
    ],
    edges: [
      { from: 'a1', to: 'a2' },
      { from: 'a1', to: 'a4' },
      { from: 'a1', to: 'a5' },
      { from: 'a2', to: 'a3' },
      { from: 'a3', to: 'a4' },
      { from: 'a4', to: 'a6' },
      { from: 'a5', to: 'a6' },
    ],
  },
  // ── Top-center-left: triangle cluster
  {
    offsetX: '30%',
    offsetY: '4%',
    nodes: [
      { id: 'g1', x: 0,  y: 40 },
      { id: 'g2', x: 45, y: 0  },
      { id: 'g3', x: 90, y: 40 },
      { id: 'g4', x: 45, y: 80 },
    ],
    edges: [
      { from: 'g1', to: 'g2' },
      { from: 'g2', to: 'g3' },
      { from: 'g3', to: 'g4' },
      { from: 'g4', to: 'g1' },
      { from: 'g2', to: 'g4' },
    ],
  },
  // ── Top-right: circuit board square
  {
    offsetX: '66%',
    offsetY: '5%',
    nodes: [
      { id: 'b1', x: 0,   y: 0   },
      { id: 'b2', x: 55,  y: 0   },
      { id: 'b3', x: 55,  y: 55  },
      { id: 'b4', x: 0,   y: 55  },
      { id: 'b5', x: 27,  y: 27  },
      { id: 'b6', x: 88,  y: 27  },
      { id: 'b7', x: 27,  y: -30 },
    ],
    edges: [
      { from: 'b1', to: 'b2' },
      { from: 'b2', to: 'b3' },
      { from: 'b3', to: 'b4' },
      { from: 'b4', to: 'b1' },
      { from: 'b5', to: 'b2' },
      { from: 'b5', to: 'b4' },
      { from: 'b2', to: 'b6' },
      { from: 'b1', to: 'b7' },
      { from: 'b2', to: 'b7' },
    ],
  },
  // ── Far right edge: vertical chain
  {
    offsetX: '88%',
    offsetY: '20%',
    nodes: [
      { id: 'h1', x: 0,  y: 0   },
      { id: 'h2', x: 30, y: 35  },
      { id: 'h3', x: 0,  y: 70  },
      { id: 'h4', x: 35, y: 100 },
      { id: 'h5', x: 5,  y: 135 },
    ],
    edges: [
      { from: 'h1', to: 'h2' },
      { from: 'h2', to: 'h3' },
      { from: 'h3', to: 'h4' },
      { from: 'h4', to: 'h5' },
      { from: 'h1', to: 'h3' },
    ],
  },
  // ── Middle-left: arrow / chevron
  {
    offsetX: '2%',
    offsetY: '38%',
    nodes: [
      { id: 'e1', x: 0,  y: 30  },
      { id: 'e2', x: 40, y: 0   },
      { id: 'e3', x: 80, y: 30  },
      { id: 'e4', x: 40, y: 60  },
      { id: 'e5', x: 40, y: 110 },
    ],
    edges: [
      { from: 'e1', to: 'e2' },
      { from: 'e2', to: 'e3' },
      { from: 'e3', to: 'e4' },
      { from: 'e4', to: 'e1' },
      { from: 'e4', to: 'e5' },
    ],
  },
  // ── Center: cross/compass pattern
  {
    offsetX: '45%',
    offsetY: '30%',
    nodes: [
      { id: 'f1', x: 40, y: 0   },
      { id: 'f2', x: 80, y: 40  },
      { id: 'f3', x: 40, y: 80  },
      { id: 'f4', x: 0,  y: 40  },
      { id: 'f5', x: 40, y: 40  },
    ],
    edges: [
      { from: 'f1', to: 'f5' },
      { from: 'f2', to: 'f5' },
      { from: 'f3', to: 'f5' },
      { from: 'f4', to: 'f5' },
      { from: 'f1', to: 'f2' },
      { from: 'f3', to: 'f4' },
    ],
  },
  // ── Server diamond — right-center
  {
    offsetX: '72%',
    offsetY: '42%',
    nodes: [
      { id: 'c1', x: 35,  y: 0   },
      { id: 'c2', x: 70,  y: 35  },
      { id: 'c3', x: 35,  y: 70  },
      { id: 'c4', x: 0,   y: 35  },
      { id: 'c5', x: 35,  y: 35  },
      { id: 'c6', x: 105, y: 0   },
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
      { from: 'c2', to: 'c6' },
    ],
  },
  // ── Far right bottom: L-shape / bracket
  {
    offsetX: '82%',
    offsetY: '60%',
    nodes: [
      { id: 'j1', x: 0,   y: 0   },
      { id: 'j2', x: 0,   y: 60  },
      { id: 'j3', x: 0,   y: 120 },
      { id: 'j4', x: 50,  y: 120 },
      { id: 'j5', x: 50,  y: 60  },
    ],
    edges: [
      { from: 'j1', to: 'j2' },
      { from: 'j2', to: 'j3' },
      { from: 'j3', to: 'j4' },
      { from: 'j4', to: 'j5' },
      { from: 'j2', to: 'j5' },
    ],
  },
  // ── Bottom-right: satellite dish spread
  {
    offsetX: '58%',
    offsetY: '72%',
    nodes: [
      { id: 'c7', x: 40,  y: 0   },
      { id: 'c8', x: 0,   y: 50  },
      { id: 'c9', x: 40,  y: 50  },
      { id: 'c10',x: 80,  y: 50  },
      { id: 'c11',x: 20,  y: 100 },
      { id: 'c12',x: 60,  y: 100 },
    ],
    edges: [
      { from: 'c7',  to: 'c9'  },
      { from: 'c8',  to: 'c9'  },
      { from: 'c9',  to: 'c10' },
      { from: 'c8',  to: 'c11' },
      { from: 'c9',  to: 'c11' },
      { from: 'c9',  to: 'c12' },
      { from: 'c10', to: 'c12' },
      { from: 'c7',  to: 'c8'  },
      { from: 'c7',  to: 'c10' },
    ],
  },
  // ── Bottom-left: satellite dish
  {
    offsetX: '4%',
    offsetY: '66%',
    nodes: [
      { id: 'd1', x: 45,  y: 0   },
      { id: 'd2', x: 0,   y: 45  },
      { id: 'd3', x: 45,  y: 45  },
      { id: 'd4', x: 90,  y: 45  },
      { id: 'd5', x: 45,  y: 90  },
      { id: 'd6', x: 90,  y: 90  },
    ],
    edges: [
      { from: 'd1', to: 'd3' },
      { from: 'd2', to: 'd3' },
      { from: 'd3', to: 'd4' },
      { from: 'd3', to: 'd5' },
      { from: 'd1', to: 'd2' },
      { from: 'd1', to: 'd4' },
      { from: 'd4', to: 'd6' },
      { from: 'd5', to: 'd6' },
    ],
  },
  // ── Bottom-center: hexagonal web
  {
    offsetX: '30%',
    offsetY: '78%',
    nodes: [
      { id: 'k1', x: 40,  y: 0   },
      { id: 'k2', x: 80,  y: 20  },
      { id: 'k3', x: 80,  y: 60  },
      { id: 'k4', x: 40,  y: 80  },
      { id: 'k5', x: 0,   y: 60  },
      { id: 'k6', x: 0,   y: 20  },
      { id: 'k7', x: 40,  y: 40  },
    ],
    edges: [
      { from: 'k1', to: 'k2' },
      { from: 'k2', to: 'k3' },
      { from: 'k3', to: 'k4' },
      { from: 'k4', to: 'k5' },
      { from: 'k5', to: 'k6' },
      { from: 'k6', to: 'k1' },
      { from: 'k7', to: 'k1' },
      { from: 'k7', to: 'k3' },
      { from: 'k7', to: 'k5' },
    ],
  },
  // ── Mid-right: zigzag chain
  {
    offsetX: '55%',
    offsetY: '12%',
    nodes: [
      { id: 'm1', x: 0,  y: 0   },
      { id: 'm2', x: 35, y: 30  },
      { id: 'm3', x: 0,  y: 60  },
      { id: 'm4', x: 35, y: 90  },
      { id: 'm5', x: 0,  y: 120 },
    ],
    edges: [
      { from: 'm1', to: 'm2' },
      { from: 'm2', to: 'm3' },
      { from: 'm3', to: 'm4' },
      { from: 'm4', to: 'm5' },
    ],
  },
  // ── Upper-left secondary: small pentagon
  {
    offsetX: '18%',
    offsetY: '14%',
    nodes: [
      { id: 'p1', x: 30, y: 0  },
      { id: 'p2', x: 60, y: 22 },
      { id: 'p3', x: 48, y: 60 },
      { id: 'p4', x: 12, y: 60 },
      { id: 'p5', x: 0,  y: 22 },
    ],
    edges: [
      { from: 'p1', to: 'p2' },
      { from: 'p2', to: 'p3' },
      { from: 'p3', to: 'p4' },
      { from: 'p4', to: 'p5' },
      { from: 'p5', to: 'p1' },
      { from: 'p1', to: 'p3' },
      { from: 'p2', to: 'p4' },
    ],
  },
  // ── Top center: double-star pair
  {
    offsetX: '42%',
    offsetY: '10%',
    nodes: [
      { id: 'ds1', x: 0,  y: 0  },
      { id: 'ds2', x: 40, y: 18 },
      { id: 'ds3', x: 80, y: 0  },
      { id: 'ds4', x: 40, y: 48 },
    ],
    edges: [
      { from: 'ds1', to: 'ds2' },
      { from: 'ds2', to: 'ds3' },
      { from: 'ds2', to: 'ds4' },
      { from: 'ds1', to: 'ds4' },
      { from: 'ds3', to: 'ds4' },
    ],
  },
  // ── Center-left mid: arrowhead
  {
    offsetX: '20%',
    offsetY: '52%',
    nodes: [
      { id: 'ar1', x: 0,  y: 30 },
      { id: 'ar2', x: 45, y: 0  },
      { id: 'ar3', x: 90, y: 30 },
      { id: 'ar4', x: 45, y: 60 },
      { id: 'ar5', x: 45, y: 30 },
    ],
    edges: [
      { from: 'ar1', to: 'ar2' },
      { from: 'ar2', to: 'ar3' },
      { from: 'ar3', to: 'ar4' },
      { from: 'ar4', to: 'ar1' },
      { from: 'ar5', to: 'ar1' },
      { from: 'ar5', to: 'ar2' },
      { from: 'ar5', to: 'ar3' },
    ],
  },
  // ── Center mid: small diamond + tail
  {
    offsetX: '48%',
    offsetY: '58%',
    nodes: [
      { id: 'sm1', x: 25, y: 0  },
      { id: 'sm2', x: 50, y: 25 },
      { id: 'sm3', x: 25, y: 50 },
      { id: 'sm4', x: 0,  y: 25 },
      { id: 'sm5', x: 25, y: 80 },
    ],
    edges: [
      { from: 'sm1', to: 'sm2' },
      { from: 'sm2', to: 'sm3' },
      { from: 'sm3', to: 'sm4' },
      { from: 'sm4', to: 'sm1' },
      { from: 'sm3', to: 'sm5' },
    ],
  },
  // ── Center-right upper: staircase
  {
    offsetX: '62%',
    offsetY: '18%',
    nodes: [
      { id: 'st1', x: 0,  y: 0  },
      { id: 'st2', x: 35, y: 0  },
      { id: 'st3', x: 35, y: 35 },
      { id: 'st4', x: 70, y: 35 },
      { id: 'st5', x: 70, y: 70 },
    ],
    edges: [
      { from: 'st1', to: 'st2' },
      { from: 'st2', to: 'st3' },
      { from: 'st3', to: 'st4' },
      { from: 'st4', to: 'st5' },
      { from: 'st1', to: 'st3' },
      { from: 'st3', to: 'st5' },
    ],
  },
  // ── Left edge mid-lower: Y-branch
  {
    offsetX: '1%',
    offsetY: '58%',
    nodes: [
      { id: 'yb1', x: 30, y: 0  },
      { id: 'yb2', x: 0,  y: 45 },
      { id: 'yb3', x: 60, y: 45 },
      { id: 'yb4', x: 30, y: 45 },
      { id: 'yb5', x: 30, y: 90 },
    ],
    edges: [
      { from: 'yb1', to: 'yb2' },
      { from: 'yb1', to: 'yb3' },
      { from: 'yb1', to: 'yb4' },
      { from: 'yb4', to: 'yb5' },
    ],
  },
  // ── Bottom-right lower: diagonal fan
  {
    offsetX: '74%',
    offsetY: '80%',
    nodes: [
      { id: 'df1', x: 0,  y: 60 },
      { id: 'df2', x: 30, y: 30 },
      { id: 'df3', x: 60, y: 0  },
      { id: 'df4', x: 60, y: 60 },
      { id: 'df5', x: 30, y: 90 },
    ],
    edges: [
      { from: 'df1', to: 'df2' },
      { from: 'df2', to: 'df3' },
      { from: 'df3', to: 'df4' },
      { from: 'df4', to: 'df5' },
      { from: 'df5', to: 'df1' },
      { from: 'df2', to: 'df4' },
    ],
  },
  // ── Bottom-center lower: V-shape cluster
  {
    offsetX: '40%',
    offsetY: '88%',
    nodes: [
      { id: 'vc1', x: 0,  y: 0  },
      { id: 'vc2', x: 30, y: 40 },
      { id: 'vc3', x: 60, y: 0  },
      { id: 'vc4', x: 30, y: 70 },
    ],
    edges: [
      { from: 'vc1', to: 'vc2' },
      { from: 'vc2', to: 'vc3' },
      { from: 'vc2', to: 'vc4' },
      { from: 'vc1', to: 'vc3' },
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
          <filter id={`glow-${index}`} x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="5" result="blur1" />
            <feGaussianBlur stdDeviation="2" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
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
              stroke="rgba(103,232,249,0.82)"
              strokeWidth="1.8"
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
              r={nodes[ni] ? 3.8 : 0}
              fill="rgba(163,248,255,1)"
              style={{ transition: 'r 0.3s ease-out' }}
            />
            {pulsing && (
              <circle
                cx={node.x}
                cy={node.y}
                r={3.8}
                fill="none"
                stroke="rgba(103,232,249,0.82)"
                strokeWidth="1.5"
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
          0%, 100% { r: 2.5; opacity: 0.55; }
          50% { r: 8; opacity: 0; }
        }
      `}</style>
    </div>
  )
}

export default function ConstellationOverlay() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 3 }}
      aria-hidden="true"
    >
      {CONSTELLATIONS.map((constellation, i) => (
        <ConstellationGroup key={i} constellation={constellation} index={i} />
      ))}
    </div>
  )
}
