import { createHash, randomBytes, randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/server/auth'
import { sql } from '@/lib/server/db'
import { broadcastToUsers } from '@/lib/server/adminChatSse'

async function ensureChatTables() {
  await sql(`
    create table if not exists admin_chat_conversations (
      id uuid primary key default gen_random_uuid(),
      name text not null,
      is_group boolean not null default false,
      created_by uuid not null references admin_users(id) on delete cascade,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `)

  await sql(`
    create table if not exists admin_chat_participants (
      conversation_id uuid not null references admin_chat_conversations(id) on delete cascade,
      user_id uuid not null references admin_users(id) on delete cascade,
      joined_at timestamptz not null default now(),
      primary key (conversation_id, user_id)
    )
  `)

  await sql(`
    create table if not exists admin_chat_messages (
      id uuid primary key default gen_random_uuid(),
      conversation_id uuid not null references admin_chat_conversations(id) on delete cascade,
      sender_id uuid not null references admin_users(id) on delete cascade,
      body text not null,
      attachment_url text,
      attachment_name text,
      attachment_kind text,
      created_at timestamptz not null default now()
    )
  `)

  await sql('alter table admin_chat_messages add column if not exists attachment_url text')
  await sql('alter table admin_chat_messages add column if not exists attachment_name text')
  await sql('alter table admin_chat_messages add column if not exists attachment_kind text')

  await sql(`
    create table if not exists admin_chat_message_reads (
      message_id uuid not null references admin_chat_messages(id) on delete cascade,
      user_id uuid not null references admin_users(id) on delete cascade,
      read_at timestamptz not null default now(),
      primary key (message_id, user_id)
    )
  `)
}

async function uploadAttachmentToCloudinary(file: File, opts: { folder: string; filename: string; kind: 'image' | 'raw' }) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!cloudName || !apiKey || !apiSecret) throw new Error('Cloudinary is not configured.')

  const timestamp = Math.floor(Date.now() / 1000)
  const signatureBase = `folder=${opts.folder}&public_id=${opts.filename}&timestamp=${timestamp}${apiSecret}`
  const signature = createHash('sha1').update(signatureBase).digest('hex')

  const body = new FormData()
  body.append('file', file)
  body.append('api_key', apiKey)
  body.append('timestamp', String(timestamp))
  body.append('folder', opts.folder)
  body.append('public_id', opts.filename)
  body.append('signature', signature)

  const endpoint = opts.kind === 'image' ? 'image/upload' : 'raw/upload'
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${endpoint}`, { method: 'POST', body })
  const payload = (await response.json()) as { secure_url?: string; error?: { message?: string } }
  if (!response.ok || !payload.secure_url) {
    throw new Error(payload.error?.message || 'Attachment upload failed.')
  }

  return payload.secure_url
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  await ensureChatTables()

  const formData = await req.formData()
  const conversationId = String(formData.get('conversationId') ?? '').trim()
  const message = String(formData.get('message') ?? '').trim()
  const attachment = formData.get('attachment')

  if (!conversationId || (!message && !(attachment instanceof File && attachment.size > 0))) {
    return NextResponse.json({ error: 'Conversation and message or attachment are required.' }, { status: 400 })
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

  let attachmentUrl: string | null = null
  let attachmentName: string | null = null
  let attachmentKind: string | null = null

  if (attachment instanceof File && attachment.size > 0) {
    const isImage = attachment.type.startsWith('image/')
    const safeBase = attachment.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 70) || 'chat-file'
    const filename = `${safeBase}-${randomBytes(3).toString('hex')}`
    attachmentUrl = await uploadAttachmentToCloudinary(attachment, {
      folder: 'ProgreX Chat Attachments',
      filename,
      kind: isImage ? 'image' : 'raw',
    })
    attachmentName = attachment.name
    attachmentKind = isImage ? 'image' : 'file'
  }

  const messageId = randomUUID()
  await sql(
    `insert into admin_chat_messages(id, conversation_id, sender_id, body, attachment_url, attachment_name, attachment_kind)
     values ($1::uuid, $2::uuid, $3::uuid, $4, $5, $6, $7)`,
    [messageId, conversationId, admin.id, message || '', attachmentUrl, attachmentName, attachmentKind]
  )

  await sql(
    `insert into admin_chat_message_reads(message_id, user_id)
     values ($1::uuid, $2::uuid)
     on conflict (message_id, user_id) do nothing`,
    [messageId, admin.id]
  )

  await sql('update admin_chat_conversations set updated_at = now() where id = $1::uuid', [conversationId])

  const participants = await sql<{ user_id: string }>(
    'select user_id::text from admin_chat_participants where conversation_id = $1::uuid',
    [conversationId]
  )

  const event = {
    type: 'message',
    conversationId,
    message: {
      id: messageId,
      conversationId,
      senderId: admin.id,
      senderName: admin.fullName,
      body: message,
      attachmentUrl,
      attachmentName,
      attachmentKind,
      readBy: [admin.id],
      createdAt: new Date().toISOString(),
    },
  }

  broadcastToUsers(
    participants.map((item) => item.user_id),
    'message',
    event,
  )

  return NextResponse.json({ ok: true, message: event.message })
}
