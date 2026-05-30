import { NextRequest, NextResponse } from 'next/server'
import { getAdminSessionFromCookie } from '@/lib/server/auth'
import { broadcastToUsers, getCachedParticipants, ensureChatTablesOnce } from '@/lib/server/adminChatSse'

export async function POST(req: NextRequest) {
  // Use JWT-only session (no DB query) — typing events fire on every keystroke,
  // so we must not hit the database here. The JWT contains sub (id) and name.
  const session = await getAdminSessionFromCookie()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await ensureChatTablesOnce()

  const body = (await req.json()) as { conversationId?: string; isTyping?: boolean }
  const conversationId = String(body.conversationId || '').trim()
  const isTyping = Boolean(body.isTyping)

  if (!conversationId) {
    return NextResponse.json({ error: 'Conversation is required.' }, { status: 400 })
  }

  // Single cached query: fetches participants and doubles as the access check.
  const participantIds = await getCachedParticipants(conversationId)
  if (!participantIds.includes(session.sub)) {
    return NextResponse.json({ error: 'Conversation access denied.' }, { status: 403 })
  }

  broadcastToUsers(
    participantIds.filter((id) => id !== session.sub),
    'typing',
    {
      type: 'typing',
      conversationId,
      userId: session.sub,
      userName: session.name,
      isTyping,
    },
  )

  return NextResponse.json({ ok: true })
}
