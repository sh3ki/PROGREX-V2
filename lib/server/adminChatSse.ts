import { sql } from './db'

type SseClient = {
  userId: string
  send: (event: string, data: unknown) => void
  close: () => void
}

const MAX_CONNECTIONS = 60

// ─── Global singletons (survive across requests on Render's persistent server) ─
const g = globalThis as typeof globalThis & {
  __adminChatClients?: Map<string, SseClient>
  __chatTablesReady?: Promise<void>
  __participantsCache?: Map<string, { ids: string[]; expiry: number }>
}

// ─── SSE client registry ───────────────────────────────────────────────────────
function getClients() {
  if (!g.__adminChatClients) g.__adminChatClients = new Map<string, SseClient>()
  return g.__adminChatClients
}

export function canAcceptSseClient() {
  return getClients().size < MAX_CONNECTIONS
}

export function registerSseClient(client: SseClient) {
  const clients = getClients()
  const previous = clients.get(client.userId)
  if (previous) previous.close()
  clients.set(client.userId, client)
}

export function removeSseClient(userId: string) {
  getClients().delete(userId)
}

export function broadcastToUsers(userIds: string[], event: string, data: unknown) {
  const clients = getClients()
  for (const userId of userIds) {
    clients.get(userId)?.send(event, data)
  }
}

// ─── Once-per-process table initialisation ────────────────────────────────────
// DDL runs exactly once after each server (re)start. All subsequent calls are
// free — they just await the same already-resolved Promise.
export function ensureChatTablesOnce(): Promise<void> {
  if (!g.__chatTablesReady) {
    g.__chatTablesReady = _runChatTableDDL()
  }
  return g.__chatTablesReady
}

async function _runChatTableDDL() {
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
  await sql(`
    create table if not exists admin_chat_message_reads (
      message_id uuid not null references admin_chat_messages(id) on delete cascade,
      user_id uuid not null references admin_users(id) on delete cascade,
      read_at timestamptz not null default now(),
      primary key (message_id, user_id)
    )
  `)
  // Safe no-op migrations for columns added after initial deploy
  await sql('alter table admin_chat_conversations add column if not exists group_image_url text')
  await sql('alter table admin_chat_messages add column if not exists attachment_url text')
  await sql('alter table admin_chat_messages add column if not exists attachment_name text')
  await sql('alter table admin_chat_messages add column if not exists attachment_kind text')
}

// ─── Participants cache ────────────────────────────────────────────────────────
// Avoids repeated DB queries for the same conversation on every typing event.
// TTL of 5 minutes — participants rarely change mid-session.
const PARTICIPANTS_TTL = 5 * 60 * 1000

function getParticipantsCache() {
  if (!g.__participantsCache) g.__participantsCache = new Map()
  return g.__participantsCache
}

export function invalidateParticipantsCache(conversationId: string) {
  getParticipantsCache().delete(conversationId)
}

export async function getCachedParticipants(conversationId: string): Promise<string[]> {
  const cache = getParticipantsCache()
  const entry = cache.get(conversationId)
  if (entry && Date.now() < entry.expiry) return entry.ids

  const rows = await sql<{ user_id: string }>(
    'select user_id::text from admin_chat_participants where conversation_id = $1::uuid',
    [conversationId]
  )
  const ids = rows.map((r) => r.user_id)
  cache.set(conversationId, { ids, expiry: Date.now() + PARTICIPANTS_TTL })
  return ids
}
