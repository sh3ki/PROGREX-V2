import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/server/auth'
import { sql } from '@/lib/server/db'
import { broadcastToUsers } from '@/lib/server/adminChatSse'

async function ensureReadsTable() {
  await sql(`
    create table if not exists admin_chat_message_reads (
      message_id uuid not null references admin_chat_messages(id) on delete cascade,
      user_id uuid not null references admin_users(id) on delete cascade,
      read_at timestamptz not null default now(),
      primary key (message_id, user_id)
    )
  `)
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  await ensureReadsTable()

  const body = (await req.json()) as { conversationId?: string }
  const conversationId = String(body.conversationId || '').trim()
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

  const participants = await sql<{ user_id: string }>(
    'select user_id::text from admin_chat_participants where conversation_id = $1::uuid',
    [conversationId]
  )

  broadcastToUsers(
    participants.map((item) => item.user_id).filter((id) => id !== admin.id),
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
