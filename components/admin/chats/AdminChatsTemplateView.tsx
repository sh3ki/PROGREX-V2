'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Download, Edit2, Info, MailPlus, Paperclip, Phone, Search, Send, Smile, Video, X } from 'lucide-react'
import { ApexBreadcrumbs, ApexModal } from '@/components/admin/apex/ApexDataUi'
import { ApexButton, ApexInput } from '@/components/admin/apex/AdminPrimitives'

type ChatUser = {
  id: string
  fullName: string
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

function formatDateTime(value: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  return `${day}/${month}/${year} ${time}`
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
  const [activeConversationId, setActiveConversationId] = useState('')
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

  const activeConversation = conversations.find((item) => item.id === activeConversationId) || null
  const visibleMessages = messages.filter((item) => item.conversationId === activeConversationId)
  const typingName = typingByConversation[activeConversationId] || ''
  const participants = useMemo(() => {
    if (!activeConversation) return [] as ChatUser[]
    const byId = new Map(users.map((item) => [item.id, item]))
    return activeConversation.participantIds.map((id) => byId.get(id)).filter(Boolean) as ChatUser[]
  }, [activeConversation, users])
  const otherParticipant = useMemo(() => {
    if (!activeConversation || activeConversation.isGroup) return null
    return participants.find((item) => item.id !== currentUser.id) || null
  }, [activeConversation, participants, currentUser.id])

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

  const lastOwnMessage = useMemo(() => {
    for (let i = visibleMessages.length - 1; i >= 0; i -= 1) {
      if (visibleMessages[i].senderId === currentUser.id) return visibleMessages[i]
    }
    return null
  }, [visibleMessages, currentUser.id])

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
          <div className="space-y-1 overflow-y-auto">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => setActiveConversationId(conversation.id)}
                className={[
                  'w-full rounded-xl px-3 py-2 text-left transition-colors',
                  activeConversationId === conversation.id ? 'bg-(--apx-surface-alt)' : 'hover:bg-(--apx-surface-alt)',
                ].join(' ')}
              >
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full" style={{ backgroundColor: 'var(--apx-surface-alt)' }}>
                    {conversation.groupImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={conversation.groupImageUrl} alt={conversation.name} className="h-full w-full object-cover" />
                    ) : (
                      conversation.name.slice(0, 2).toUpperCase()
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold apx-text">{conversation.name}</p>
                      <span className="shrink-0 text-[10px] apx-muted">{formatDateTime(conversation.lastAt)}</span>
                    </div>
                    <p className="truncate text-xs apx-muted">{conversation.lastMessage || 'No messages yet.'}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="flex min-h-0 flex-col">
          {activeConversation ? (
            <>
              <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: 'var(--apx-border)' }}>
                <div className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full" style={{ backgroundColor: 'var(--apx-surface-alt)' }}>
                  {activeConversation.groupImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={activeConversation.groupImageUrl} alt={activeConversation.name} className="h-full w-full object-cover" />
                  ) : (
                    activeConversation.name.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold apx-text">{activeConversation.isGroup ? activeConversation.name : (otherParticipant?.fullName || activeConversation.name)}</p>
                  <p className="text-xs apx-muted">
                    {typingName
                      ? `${typingName} is typing...`
                      : activeConversation.isGroup
                        ? `${participants.length} members`
                        : 'Direct conversation'}
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

              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {visibleMessages.map((message) => {
                  const mine = message.senderId === currentUser.id
                  return (
                    <div key={message.id} className={mine ? 'flex justify-end' : 'flex justify-start'}>
                      <div className="max-w-[75%]">
                        <div
                          className={[
                            'rounded-2xl px-3.5 py-2 text-sm',
                            mine ? 'rounded-ee-md text-white' : 'rounded-es-md apx-text',
                          ].join(' ')}
                          style={mine ? { backgroundColor: 'var(--apx-primary)' } : { backgroundColor: 'var(--apx-surface-alt)' }}
                        >
                          {message.body ? <p>{message.body}</p> : null}
                          {message.attachmentUrl ? (
                            <div className="mt-2 rounded-lg border px-2 py-1.5 text-xs" style={{ borderColor: mine ? 'rgba(255,255,255,0.35)' : 'var(--apx-border)' }}>
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
                        <p className={['mt-1 text-[10px]', mine ? 'text-right' : 'text-left', 'apx-muted'].join(' ')}>
                          {formatDateTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                })}
                {lastOwnMessage ? (
                  <p className="text-right text-[10px] apx-muted">
                    {lastOwnMessage.readBy.length > 1 ? 'Seen' : 'Delivered'}
                  </p>
                ) : null}
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
              <p className="font-semibold apx-text">{activeConversation.name}</p>
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
