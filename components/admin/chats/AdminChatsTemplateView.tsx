'use client'

import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { CheckCheck, Download, Edit2, Info, MailPlus, Paperclip, Phone, Search, Send, Smile, Video, X } from 'lucide-react'
import { ApexBreadcrumbs, ApexModal } from '@/components/admin/apex/ApexDataUi'
import { ApexButton, ApexInput } from '@/components/admin/apex/AdminPrimitives'

type ChatUser = {
  id: string
  fullName: string
  email?: string | null
  profileImageUrl: string | null
}

type ChatConversation = {
  id: string
  name: string
  isGroup: boolean
  groupImageUrl?: string | null
  participantIds: string[]
  lastMessage: string
  lastAt: string | null
}

type ChatMessage = {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  body: string
  attachmentUrl?: string | null
  attachmentName?: string | null
  attachmentKind?: string | null
  readBy: string[]
  createdAt: string
}

const EMOJIS = ['😀', '😂', '❤️', '👍', '🔥', '🎉', '🙏', '💡', '✅', '👀']

function toValidDate(value: string | null | undefined) {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function formatMessageTime(value: string | null | undefined) {
  const date = toValidDate(value)
  if (!date) return '-'
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function formatConversationTime(value: string | null | undefined) {
  const date = toValidDate(value)
  if (!date) return '-'

  const now = new Date()
  const sameDay =
    now.getFullYear() === date.getFullYear() &&
    now.getMonth() === date.getMonth() &&
    now.getDate() === date.getDate()

  if (sameDay) {
    return formatMessageTime(value)
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatDayDivider(value: string | null | undefined) {
  const date = toValidDate(value)
  if (!date) return ''
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function getInitials(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0]?.toUpperCase() || '')
    .join('') || 'NA'
}

export default function AdminChatsTemplateView({
  currentUser,
  users,
  initialConversations,
  initialMessages,
}: {
  currentUser: ChatUser
  users: ChatUser[]
  initialConversations: ChatConversation[]
  initialMessages: ChatMessage[]
}) {
  const [conversations, setConversations] = useState(initialConversations)
  const [messages, setMessages] = useState(initialMessages)
  const [activeConversationId, setActiveConversationId] = useState(initialConversations[0]?.id || '')
  const [conversationSearch, setConversationSearch] = useState('')
  const [draft, setDraft] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [addSearch, setAddSearch] = useState('')
  const [addSearchDebounced, setAddSearchDebounced] = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [conversationName, setConversationName] = useState('')
  const [renameOpen, setRenameOpen] = useState(false)
  const [renameValue, setRenameValue] = useState('')
  const [infoOpen, setInfoOpen] = useState(false)
  const [typingByConversation, setTypingByConversation] = useState<Record<string, string>>({})
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [messageAttachmentFile, setMessageAttachmentFile] = useState<File | null>(null)
  const [groupImageFile, setGroupImageFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const usersById = useMemo(() => new Map(users.map((item) => [item.id, item])), [users])

  const conversationsWithMeta = useMemo(() => {
    return conversations.map((conversation) => {
      const members = conversation.participantIds
        .map((participantId) => usersById.get(participantId))
        .filter(Boolean) as ChatUser[]
      const other = conversation.isGroup ? null : members.find((member) => member.id !== currentUser.id) || null
      const title = conversation.isGroup ? conversation.name : (other?.fullName || conversation.name)

      return {
        conversation,
        members,
        other,
        title,
        subtitle: conversation.isGroup ? `${members.length} members` : (other?.email || 'Direct conversation'),
        avatarUrl: conversation.isGroup ? (conversation.groupImageUrl || null) : (other?.profileImageUrl || null),
      }
    })
  }, [conversations, usersById, currentUser.id])

  const activeConversationMeta = useMemo(
    () => conversationsWithMeta.find((item) => item.conversation.id === activeConversationId) || null,
    [conversationsWithMeta, activeConversationId],
  )
  const activeConversation = activeConversationMeta?.conversation || null
  const participants = activeConversationMeta?.members || []
  const visibleMessages = messages.filter((item) => item.conversationId === activeConversationId)
  const typingName = typingByConversation[activeConversationId] || ''

  const unreadByConversation = useMemo(() => {
    const next = new Map<string, number>()
    for (const message of messages) {
      if (message.senderId === currentUser.id) continue
      if (message.readBy.includes(currentUser.id)) continue
      next.set(message.conversationId, (next.get(message.conversationId) || 0) + 1)
    }
    return next
  }, [messages, currentUser.id])

  const filteredConversations = useMemo(() => {
    const keyword = conversationSearch.trim().toLowerCase()
    if (!keyword) return conversationsWithMeta

    return conversationsWithMeta.filter((item) => {
      const title = item.title.toLowerCase()
      const preview = (item.conversation.lastMessage || '').toLowerCase()
      return title.includes(keyword) || preview.includes(keyword)
    })
  }, [conversationSearch, conversationsWithMeta])

  useEffect(() => {
    const source = new EventSource('/api/admin/chats/stream')
    source.addEventListener('message', (event) => {
      try {
        const payload = JSON.parse(event.data) as { type?: string; conversationId?: string; message?: ChatMessage }
        if (payload.type !== 'message' || !payload.message || !payload.conversationId) return

        setMessages((prev) => [...prev, payload.message as ChatMessage])
        setConversations((prev) => {
          const next = prev.map((conversation) =>
            conversation.id === payload.conversationId
              ? {
                  ...conversation,
                  lastMessage: payload.message?.body || conversation.lastMessage,
                  lastAt: payload.message?.createdAt || conversation.lastAt,
                }
              : conversation,
          )
          return next.sort((a, b) => new Date(b.lastAt || 0).getTime() - new Date(a.lastAt || 0).getTime())
        })
      } catch {
        // ignore malformed event
      }
    })

    source.addEventListener('typing', (event) => {
      try {
        const payload = JSON.parse(event.data) as { conversationId?: string; userName?: string; isTyping?: boolean }
        if (!payload.conversationId) return
        setTypingByConversation((prev) => ({
          ...prev,
          [payload.conversationId as string]: payload.isTyping ? (payload.userName || 'Someone') : '',
        }))
      } catch {
        // ignore malformed event
      }
    })

    source.addEventListener('read', (event) => {
      try {
        const payload = JSON.parse(event.data) as { conversationId?: string; userId?: string; messageId?: string | null }
        if (!payload.conversationId || !payload.userId || !payload.messageId) return
        setMessages((prev) =>
          prev.map((message) => {
            if (message.id !== payload.messageId) return message
            if (message.readBy.includes(payload.userId || '')) return message
            return { ...message, readBy: [...message.readBy, payload.userId || ''] }
          }),
        )
      } catch {
        // ignore malformed event
      }
    })

    source.addEventListener('conversation', (event) => {
      try {
        const payload = JSON.parse(event.data) as { type?: string; conversationId?: string; userId?: string }
        if (payload.type !== 'participant-left' || !payload.conversationId || !payload.userId) return
        setConversations((prev) =>
          prev.map((conversation) =>
            conversation.id === payload.conversationId
              ? { ...conversation, participantIds: conversation.participantIds.filter((id) => id !== payload.userId) }
              : conversation,
          ),
        )
      } catch {
        // ignore malformed event
      }
    })

    return () => source.close()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setAddSearchDebounced(addSearch.trim().toLowerCase()), 250)
    return () => clearTimeout(timer)
  }, [addSearch])

  useEffect(() => {
    if (!activeConversationId) return
    void fetch('/api/admin/chats/read', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ conversationId: activeConversationId }),
    })
  }, [activeConversationId, visibleMessages.length])

  const selectableUsers = useMemo(() => {
    const keyword = addSearchDebounced
    return users.filter((user) => user.id !== currentUser.id && user.fullName.toLowerCase().includes(keyword))
  }, [users, currentUser.id, addSearchDebounced])

  async function sendMessage() {
    const message = draft.trim()
    if (!activeConversationId) return

    const body = new FormData()
    body.set('conversationId', activeConversationId)
    body.set('message', message)
    if (messageAttachmentFile) body.set('attachment', messageAttachmentFile)

    const response = await fetch('/api/admin/chats/send', {
      method: 'POST',
      body,
    })

    if (!response.ok) return
    setDraft('')
    setMessageAttachmentFile(null)
    setEmojiOpen(false)
    void sendTyping(false)
  }

  async function sendTyping(isTyping: boolean) {
    if (!activeConversationId) return
    await fetch('/api/admin/chats/typing', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ conversationId: activeConversationId, isTyping }),
    })
  }

  async function createConversation() {
    if (!selectedUserIds.length) return

    const body = new FormData()
    body.set('name', conversationName.trim())
    body.set('participantIds', selectedUserIds.join(','))
    if (groupImageFile && selectedUserIds.length > 1) body.set('groupImage', groupImageFile)

    const response = await fetch('/api/admin/chats/conversations', {
      method: 'POST',
      body,
    })

    const data = (await response.json()) as {
      conversation?: { id: string; name: string; isGroup: boolean; groupImageUrl?: string | null; participantIds: string[] }
      ok?: boolean
    }
    if (!response.ok || !data.conversation) return

    const createdConversation: ChatConversation = {
      id: data.conversation.id,
      name: data.conversation.name,
      isGroup: data.conversation.isGroup,
      groupImageUrl: data.conversation.groupImageUrl || null,
      participantIds: data.conversation.participantIds,
      lastMessage: '',
      lastAt: null,
    }

    setConversations((prev) => [createdConversation, ...prev])
    setActiveConversationId(createdConversation.id)
    setAddOpen(false)
    setSelectedUserIds([])
    setConversationName('')
    setAddSearch('')
    setGroupImageFile(null)
  }

  async function renameConversation() {
    const nextName = renameValue.trim()
    if (!activeConversationId || !nextName) return

    const response = await fetch('/api/admin/chats/conversations', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        conversationId: activeConversationId,
        name: nextName,
      }),
    })

    if (!response.ok) return

    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === activeConversationId
          ? { ...conversation, name: nextName }
          : conversation,
      ),
    )
    setRenameOpen(false)
    setRenameValue('')
  }

  async function leaveConversation() {
    if (!activeConversationId) return
    const response = await fetch(`/api/admin/chats/conversations?conversationId=${encodeURIComponent(activeConversationId)}`, { method: 'DELETE' })
    if (!response.ok) return
    setConversations((prev) => {
      const next = prev.filter((item) => item.id !== activeConversationId)
      setActiveConversationId(next[0]?.id || '')
      return next
    })
    setInfoOpen(false)
  }

  return (
    <div className="space-y-4">
      <ApexBreadcrumbs items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Chat' }]} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[42px] leading-none font-bold tracking-tight apx-text">Chat</h1>
          <p className="mt-1 text-sm apx-muted">Messages and conversations.</p>
        </div>
        <ApexButton type="button" onClick={() => setAddOpen(true)}>
          <MailPlus className="h-4 w-4" />
          Add Chat
        </ApexButton>
      </div>

      <div className="grid min-h-[74vh] grid-cols-1 overflow-hidden rounded-2xl border md:grid-cols-[320px_1fr]" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
        <aside className="border-b p-3 md:border-r md:border-b-0" style={{ borderColor: 'var(--apx-border)' }}>
          <div className="mb-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 apx-muted" />
              <ApexInput
                className="pl-9"
                value={conversationSearch}
                onChange={(event) => setConversationSearch(event.target.value)}
                placeholder="Search conversations..."
              />
            </div>
          </div>

          <div className="space-y-1 overflow-y-auto">
            {filteredConversations.map((item) => {
              const conversation = item.conversation
              const unread = unreadByConversation.get(conversation.id) || 0
              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => setActiveConversationId(conversation.id)}
                  className={[
                    'w-full rounded-xl px-3 py-2.5 text-left transition-colors',
                    activeConversationId === conversation.id ? 'bg-(--apx-surface-alt)' : 'hover:bg-(--apx-surface-alt)',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-xs font-semibold apx-text" style={{ backgroundColor: 'var(--apx-surface-alt)' }}>
                      {item.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.avatarUrl} alt={item.title} className="h-full w-full object-cover" />
                      ) : (
                        getInitials(item.title)
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold apx-text">{item.title}</p>
                        <span className="shrink-0 text-[10px] apx-muted">{formatConversationTime(conversation.lastAt)}</span>
                      </div>
                      <div className="mt-0.5 flex items-center justify-between gap-2">
                        <p className="truncate text-xs apx-muted">{conversation.lastMessage || 'No messages yet.'}</p>
                        {unread > 0 ? (
                          <span
                            className="inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-white"
                            style={{ backgroundColor: 'var(--apx-primary)' }}
                          >
                            {unread > 99 ? '99+' : unread}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
            {filteredConversations.length === 0 ? (
              <p className="px-2 py-6 text-center text-xs apx-muted">No conversations found.</p>
            ) : null}
          </div>
        </aside>

        <section className="flex min-h-0 flex-col">
          {activeConversation ? (
            <>
              <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: 'var(--apx-border)' }}>
                <div className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full text-xs font-semibold apx-text" style={{ backgroundColor: 'var(--apx-surface-alt)' }}>
                  {activeConversationMeta?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={activeConversationMeta.avatarUrl} alt={activeConversationMeta.title} className="h-full w-full object-cover" />
                  ) : (
                    getInitials(activeConversationMeta?.title || activeConversation.name)
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold apx-text">{activeConversationMeta?.title || activeConversation.name}</p>
                  <p className="text-xs apx-muted">
                    {typingName
                      ? `${typingName} is typing...`
                      : (activeConversationMeta?.subtitle || (activeConversation.isGroup ? `${participants.length} members` : 'Direct conversation'))}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="apx-icon-action"
                    aria-label="Rename conversation"
                    onClick={() => {
                      setRenameValue(activeConversation.name)
                      setRenameOpen(true)
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button type="button" className="apx-icon-action" aria-label="Voice call"><Phone className="h-4 w-4" /></button>
                  <button type="button" className="apx-icon-action" aria-label="Video call"><Video className="h-4 w-4" /></button>
                  <button type="button" className="apx-icon-action" aria-label="Conversation info" onClick={() => setInfoOpen(true)}><Info className="h-4 w-4" /></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="space-y-3">
                  {visibleMessages.map((message, index) => {
                    const mine = message.senderId === currentUser.id
                    const prev = visibleMessages[index - 1]
                    const prevDate = toValidDate(prev?.createdAt)
                    const currentDate = toValidDate(message.createdAt)
                    const showDivider =
                      !prevDate ||
                      !currentDate ||
                      prevDate.getFullYear() !== currentDate.getFullYear() ||
                      prevDate.getMonth() !== currentDate.getMonth() ||
                      prevDate.getDate() !== currentDate.getDate()
                    const seen = mine && message.readBy.some((id) => id !== currentUser.id)

                    return (
                      <Fragment key={message.id}>
                        {showDivider ? (
                          <div className="my-1 flex items-center gap-3">
                            <div className="h-px flex-1" style={{ backgroundColor: 'var(--apx-border)' }} />
                            <span className="shrink-0 text-[10px] font-medium uppercase tracking-wider apx-muted">
                              {formatDayDivider(message.createdAt)}
                            </span>
                            <div className="h-px flex-1" style={{ backgroundColor: 'var(--apx-border)' }} />
                          </div>
                        ) : null}

                        <div className={mine ? 'flex justify-end' : 'flex justify-start'}>
                          <div className="max-w-[75%]">
                            <div
                              className={[
                                'rounded-2xl px-3.5 py-2 text-sm',
                                mine ? 'rounded-ee-md text-white' : 'rounded-es-md apx-text',
                              ].join(' ')}
                              style={mine ? { backgroundColor: 'var(--apx-primary)' } : { backgroundColor: 'var(--apx-surface-alt)' }}
                            >
                              {message.body ? <p className="whitespace-pre-wrap wrap-break-word">{message.body}</p> : null}
                              {message.attachmentUrl ? (
                                <div className="mt-2 rounded-lg border px-2 py-1.5 text-xs" style={{ borderColor: mine ? 'rgba(255,255,255,0.35)' : 'var(--apx-border)' }}>
                                  {message.attachmentKind === 'image' ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={message.attachmentUrl}
                                      alt={message.attachmentName || 'Image attachment'}
                                      className="mb-2 max-h-52 w-full rounded-md object-cover"
                                    />
                                  ) : null}
                                  <p className={mine ? 'text-white/90' : 'apx-text'}>{message.attachmentName || 'Attachment'}</p>
                                  <button
                                    type="button"
                                    className="mt-1 inline-flex items-center gap-1 underline"
                                    onClick={() => window.open(message.attachmentUrl || '', '_blank', 'noopener,noreferrer')}
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                    Download
                                  </button>
                                </div>
                              ) : null}
                            </div>
                            <div className={['mt-1 flex items-center gap-1 px-1 text-[10px]', mine ? 'justify-end' : 'justify-start', 'apx-muted'].join(' ')}>
                              <span>{formatMessageTime(message.createdAt)}</span>
                              {mine ? <CheckCheck className="h-3 w-3" style={seen ? { color: 'var(--apx-primary)' } : { opacity: 0.6 }} /> : null}
                            </div>
                          </div>
                        </div>
                      </Fragment>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-end gap-2 border-t px-4 py-3" style={{ borderColor: 'var(--apx-border)' }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(event) => setMessageAttachmentFile(event.target.files?.[0] || null)}
                />
                <button type="button" className="apx-icon-action" aria-label="Attach file" onClick={() => fileInputRef.current?.click()}><Paperclip className="h-4 w-4" /></button>
                <ApexInput
                  value={draft}
                  onChange={(event) => {
                    setDraft(event.target.value)
                    void sendTyping(Boolean(event.target.value.trim()))
                  }}
                  placeholder="Type a message..."
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      void sendMessage()
                    }
                  }}
                />
                <div className="relative">
                  <button type="button" className="apx-icon-action" aria-label="Emoji" onClick={() => setEmojiOpen((prev) => !prev)}><Smile className="h-4 w-4" /></button>
                  {emojiOpen ? (
                    <div className="absolute bottom-10 right-0 z-20 flex flex-wrap gap-1 rounded-xl border p-2" style={{ borderColor: 'var(--apx-border)', backgroundColor: 'var(--apx-surface)' }}>
                      {EMOJIS.map((emoji) => (
                        <button key={emoji} type="button" className="rounded-md px-1.5 py-1 text-base hover:bg-(--apx-surface-alt)" onClick={() => setDraft((prev) => `${prev}${emoji}`)}>
                          {emoji}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition-all hover:brightness-110"
                  style={{ backgroundColor: 'var(--apx-primary)' }}
                  aria-label="Send message"
                  onClick={() => void sendMessage()}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              {messageAttachmentFile ? (
                <div className="border-t px-4 py-2 text-xs" style={{ borderColor: 'var(--apx-border)' }}>
                  <div className="inline-flex items-center gap-2 rounded-full border px-2 py-1" style={{ borderColor: 'var(--apx-border)' }}>
                    {messageAttachmentFile.name}
                    <button type="button" className="apx-icon-action" aria-label="Remove attachment" onClick={() => setMessageAttachmentFile(null)}>
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-sm apx-muted">Select a conversation to start messaging.</div>
          )}
        </section>
      </div>

      <ApexModal open={addOpen} onClose={() => setAddOpen(false)} title="Add Chat" subtitle="Create private or group conversation." size="md">
        <div className="space-y-3">
          <label className="block text-xs font-medium apx-muted">Conversation Name (optional)</label>
          <ApexInput value={conversationName} onChange={(event) => setConversationName(event.target.value)} placeholder="Optional custom name" />

          {selectedUserIds.length > 1 ? (
            <>
              <label className="block text-xs font-medium apx-muted">Group Image (optional)</label>
              <ApexInput type="file" accept="image/*" onChange={(event) => setGroupImageFile(event.target.files?.[0] || null)} />
            </>
          ) : null}

          <label className="block text-xs font-medium apx-muted">Search User</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 apx-muted" />
            <ApexInput className="pl-9" value={addSearch} onChange={(event) => setAddSearch(event.target.value)} placeholder="Search users..." />
          </div>

          <div className="max-h-56 space-y-1 overflow-y-auto rounded-xl border p-2" style={{ borderColor: 'var(--apx-border)' }}>
            {selectableUsers.map((user) => (
              <label key={user.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-(--apx-surface-alt)">
                <input
                  type="checkbox"
                  checked={selectedUserIds.includes(user.id)}
                  onChange={() => {
                    setSelectedUserIds((prev) => (prev.includes(user.id) ? prev.filter((id) => id !== user.id) : [...prev, user.id]))
                  }}
                />
                <span className="text-sm apx-text">{user.fullName}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <ApexButton type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</ApexButton>
            <ApexButton type="button" onClick={() => void createConversation()} disabled={!selectedUserIds.length}>Create Chat</ApexButton>
          </div>
        </div>
      </ApexModal>

      <ApexModal open={renameOpen} onClose={() => setRenameOpen(false)} title="Rename Chat" subtitle="Update conversation title." size="sm">
        <div className="space-y-3">
          <label className="block text-xs font-medium apx-muted">Conversation Name</label>
          <ApexInput
            value={renameValue}
            onChange={(event) => setRenameValue(event.target.value)}
            placeholder="Enter conversation name"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                void renameConversation()
              }
            }}
          />
          <div className="flex justify-end gap-2 pt-2">
            <ApexButton type="button" variant="outline" onClick={() => setRenameOpen(false)}>Cancel</ApexButton>
            <ApexButton type="button" onClick={() => void renameConversation()} disabled={!renameValue.trim()}>Save</ApexButton>
          </div>
        </div>
      </ApexModal>

      <ApexModal open={infoOpen} onClose={() => setInfoOpen(false)} title="Conversation Info" subtitle="Members and actions" size="sm">
        {activeConversation ? (
          <div className="space-y-3">
            <div className="rounded-xl border p-3" style={{ borderColor: 'var(--apx-border)' }}>
              <p className="font-semibold apx-text">{activeConversationMeta?.title || activeConversation.name}</p>
              <p className="text-xs apx-muted">{activeConversation.isGroup ? 'Group chat' : 'Direct chat'}</p>
            </div>
            <div>
              <p className="mb-1 text-xs apx-muted">Participants</p>
              <div className="flex flex-wrap gap-2">
                {participants.map((participant) => (
                  <span key={participant.id} className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs" style={{ borderColor: 'var(--apx-border)' }}>
                    {participant.fullName}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <ApexButton type="button" variant="outline" onClick={() => setInfoOpen(false)}>Close</ApexButton>
              <ApexButton type="button" variant="danger" onClick={() => void leaveConversation()}>Leave Chat</ApexButton>
            </div>
          </div>
        ) : null}
      </ApexModal>
    </div>
  )
}
