import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/server/auth'
import { canAcceptSseClient, registerSseClient, removeSseClient } from '@/lib/server/adminChatSse'

export async function GET(req: NextRequest) {
  const admin = await requireAdmin()

  if (!canAcceptSseClient()) {
    return NextResponse.json({ error: 'SSE capacity reached. Use polling fallback.' }, { status: 503 })
  }

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder()
      let closed = false

      const send = (event: string, data: unknown) => {
        if (closed) return
        const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
        controller.enqueue(encoder.encode(payload))
      }

      const close = () => {
        if (closed) return
        closed = true
        removeSseClient(admin.id)
        try {
          controller.close()
        } catch {
          // no-op
        }
      }

      registerSseClient({ userId: admin.id, send, close })
      send('ready', { ok: true })

      const heartbeat = setInterval(() => {
        send('ping', { at: Date.now() })
      }, 25000)

      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
