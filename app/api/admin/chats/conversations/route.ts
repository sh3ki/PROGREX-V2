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
      group_image_url text,
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

  await sql('alter table admin_chat_conversations add column if not exists group_image_url text')
}

async function uploadImageToCloudinary(file: File, opts: { folder: string; filename: string }) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary is not configured.')
  }

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

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body })
  const payload = (await response.json()) as { secure_url?: string; error?: { message?: string } }
  if (!response.ok || !payload.secure_url) {
    throw new Error(payload.error?.message || 'Image upload failed.')
  }
  return payload.secure_url
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  await ensureChatTables()

  const formData = await req.formData()
  const rawParticipantIds = String(formData.get('participantIds') ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  const participantIds = Array.from(new Set([admin.id, ...rawParticipantIds.map((item) => item.trim()).filter(Boolean)]))

  if (participantIds.length < 2) {
    return NextResponse.json({ error: 'Select at least one other user.' }, { status: 400 })
  }

  const conversationId = randomUUID()
  const isGroup = participantIds.length > 2

  let resolvedName = String(formData.get('name') ?? '').trim()
  if (!resolvedName) {
    if (isGroup) {
      resolvedName = 'Group Chat'
    } else {
      const otherId = participantIds.find((item) => item !== admin.id) || admin.id
      const other = await sql<{ full_name: string }>('select full_name from admin_users where id = $1::uuid limit 1', [otherId])
      resolvedName = other[0]?.full_name || 'Direct Message'
    }
  }

  const groupImage = formData.get('groupImage')
  let groupImageUrl: string | null = null
  if (groupImage instanceof File && groupImage.size > 0) {
    if (!groupImage.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Group image must be an image file.' }, { status: 400 })
    }
    const filename = `${resolvedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60) || 'group'}-${randomBytes(3).toString('hex')}`
    groupImageUrl = await uploadImageToCloudinary(groupImage, { folder: 'ProgreX Chat Group Images', filename })
  }

  await sql(
    `insert into admin_chat_conversations(id, name, is_group, group_image_url, created_by)
     values ($1::uuid, $2, $3, $4, $5::uuid)`,
    [conversationId, resolvedName, isGroup, groupImageUrl, admin.id]
  )

  for (const userId of participantIds) {
    await sql(
      `insert into admin_chat_participants(conversation_id, user_id)
       values ($1::uuid, $2::uuid)
       on conflict (conversation_id, user_id) do nothing`,
      [conversationId, userId]
    )
  }

  return NextResponse.json({ ok: true, conversation: { id: conversationId, name: resolvedName, isGroup, groupImageUrl, participantIds } })
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin()
  await ensureChatTables()

  const body = (await req.json()) as { conversationId?: string; name?: string }
  const conversationId = (body.conversationId || '').trim()
  const name = (body.name || '').trim()

  if (!conversationId || !name) {
    return NextResponse.json({ error: 'Conversation and name are required.' }, { status: 400 })
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

  await sql('update admin_chat_conversations set name = $2, updated_at = now() where id = $1::uuid', [conversationId, name])
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin()
  await ensureChatTables()

  const conversationId = req.nextUrl.searchParams.get('conversationId')?.trim() || ''
  if (!conversationId) {
    return NextResponse.json({ error: 'Conversation is required.' }, { status: 400 })
  }

  const members = await sql<{ user_id: string }>(
    `select user_id::text
       from admin_chat_participants
      where conversation_id = $1::uuid`,
    [conversationId]
  )

  await sql(
    `delete from admin_chat_participants
      where conversation_id = $1::uuid
        and user_id = $2::uuid`,
    [conversationId, admin.id]
  )

  const remaining = await sql<{ total: string }>(
    'select count(*)::text as total from admin_chat_participants where conversation_id = $1::uuid',
    [conversationId]
  )

  if (Number(remaining[0]?.total ?? '0') === 0) {
    await sql('delete from admin_chat_conversations where id = $1::uuid', [conversationId])
  } else {
    await sql('update admin_chat_conversations set updated_at = now() where id = $1::uuid', [conversationId])
  }

  broadcastToUsers(
    members.map((item) => item.user_id).filter((id) => id !== admin.id),
    'conversation',
    { type: 'participant-left', conversationId, userId: admin.id },
  )

  return NextResponse.json({ ok: true })
}
