import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/server/auth'
import { sql } from '@/lib/server/db'
import { broadcastToUsers, ensureChatTablesOnce, getCachedParticipants } from '@/lib/server/adminChatSse'

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  await ensureChatTablesOnce()

  const body = (await req.json()) as { conversationId?: string }
  const conversationId = String(body.conversationId || '').trim()
  if (!conversationId) {
    return NextResponse.json({ error: 'Conversation is required.' }, { status: 400 })
  }

  // Single cached query doubles as both access check and broadcast target list.
  const participantIds = await getCachedParticipants(conversationId)
  if (!participantIds.includes(admin.id)) {
    return NextResponse.json({ error: 'Conversation access denied.' }, { status: 403 })
  }

  await sql(
    `insert into admin_chat_message_reads(message_id, user_id)
     select m.id, $2::uuid
       from admin_chat_messages m
      where m.conversation_id = $1::uuid
        and m.sender_id <> $2::uuid
     on conflict (message_id, user_id) do nothing`,
    [conversationId, admin.id],
  )

  const latest = await sql<{ message_id: string | null }>(
    `select m.id::text as message_id
       from admin_chat_messages m
      where m.conversation_id = $1::uuid
      order by m.created_at desc
      limit 1`,
    [conversationId],
  )

  broadcastToUsers(
    participantIds.filter((id) => id !== admin.id),
    'read',
    {
      type: 'read',
      conversationId,
      userId: admin.id,
      messageId: latest[0]?.message_id || null,
      at: new Date().toISOString(),
    },
  )

  return NextResponse.json({ ok: true })
}
