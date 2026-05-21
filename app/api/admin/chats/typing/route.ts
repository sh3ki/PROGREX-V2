import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/server/auth'
import { broadcastToUsers, getCachedParticipants, ensureChatTablesOnce } from '@/lib/server/adminChatSse'

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  await ensureChatTablesOnce()

  const body = (await req.json()) as { conversationId?: string; isTyping?: boolean }
  const conversationId = String(body.conversationId || '').trim()
  const isTyping = Boolean(body.isTyping)

  if (!conversationId) {
    return NextResponse.json({ error: 'Conversation is required.' }, { status: 400 })
  }

  // Single cached query: fetches participants and doubles as the access check.
  const participantIds = await getCachedParticipants(conversationId)
  if (!participantIds.includes(admin.id)) {
    return NextResponse.json({ error: 'Conversation access denied.' }, { status: 403 })
  }

  broadcastToUsers(
    participantIds.filter((id) => id !== admin.id),
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
