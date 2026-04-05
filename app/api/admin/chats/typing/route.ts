import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/server/auth'
import { sql } from '@/lib/server/db'
import { broadcastToUsers } from '@/lib/server/adminChatSse'

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()

  const body = (await req.json()) as { conversationId?: string; isTyping?: boolean }
  const conversationId = String(body.conversationId || '').trim()
  const isTyping = Boolean(body.isTyping)

  if (!conversationId) {
    return NextResponse.json({ error: 'Conversation is required.' }, { status: 400 })
  }

  const allowed = await sql<{ ok: number }>(
    `select 1 as ok
       from admin_chat_participants
      where conversation_id = $1::uuid and user_id = $2::uuid
      limit 1`,
    [conversationId, admin.id]
  )
  if (!allowed.length) {
    return NextResponse.json({ error: 'Conversation access denied.' }, { status: 403 })
  }

  const participants = await sql<{ user_id: string }>(
    'select user_id::text from admin_chat_participants where conversation_id = $1::uuid',
    [conversationId]
  )

  broadcastToUsers(
    participants.map((item) => item.user_id).filter((id) => id !== admin.id),
    'typing',
    {
      type: 'typing',
      conversationId,
      userId: admin.id,
      userName: admin.fullName,
      isTyping,
    },
  )

  return NextResponse.json({ ok: true })
}
