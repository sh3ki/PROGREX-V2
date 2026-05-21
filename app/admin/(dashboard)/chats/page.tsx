import { requirePermission } from '@/lib/server/admin-permission'
import { sql } from '@/lib/server/db'
import { ensureChatTablesOnce } from '@/lib/server/adminChatSse'
import AdminChatsTemplateView from '@/components/admin/chats/AdminChatsTemplateView'

export default async function AdminChatsPage() {
  const admin = await requirePermission('dashboard', 'read')
  await ensureChatTablesOnce()

  const [users, conversations, messages] = await Promise.all([
    sql<{ id: string; full_name: string; email: string | null; profile_image_url: string | null }>(
      `select id, full_name, email, profile_image_url
         from admin_users
        where is_active = true
        order by full_name asc`
    ),
    sql<{ id: string; name: string; is_group: boolean; group_image_url: string | null; participant_ids: string[]; last_message: string | null; last_at: string | null }>(
      `select c.id::text,
              c.name,
              c.is_group,
              c.group_image_url,
              array(
                select p.user_id::text
                  from admin_chat_participants p
                 where p.conversation_id = c.id
                 order by p.joined_at asc
              ) as participant_ids,
              (
                select m.body
                  from admin_chat_messages m
                 where m.conversation_id = c.id
                 order by m.created_at desc
                 limit 1
              ) as last_message,
              (
                select m.created_at::text
                  from admin_chat_messages m
                 where m.conversation_id = c.id
                 order by m.created_at desc
                 limit 1
              ) as last_at
         from admin_chat_conversations c
         where exists (
           select 1 from admin_chat_participants p where p.conversation_id = c.id and p.user_id = $1::uuid
         )
         order by c.updated_at desc`,
      [admin.id]
    ),
    sql<{ id: string; conversation_id: string; sender_id: string; sender_name: string; body: string; attachment_url: string | null; attachment_name: string | null; attachment_kind: string | null; created_at: string; read_by: string[] }>(
      `select m.id::text,
              m.conversation_id::text,
              m.sender_id::text,
              au.full_name as sender_name,
              m.body,
              m.attachment_url,
              m.attachment_name,
              m.attachment_kind,
              coalesce(array(
                select r.user_id::text
                  from admin_chat_message_reads r
                 where r.message_id = m.id
                 order by r.read_at asc
              ), array[]::text[]) as read_by,
              m.created_at::text
         from admin_chat_messages m
         join admin_users au on au.id = m.sender_id
        where exists (
          select 1
            from admin_chat_participants p
           where p.conversation_id = m.conversation_id
             and p.user_id = $1::uuid
        )
        order by m.created_at asc`,
      [admin.id]
    ),
  ])

  return (
    <AdminChatsTemplateView
      currentUser={{ id: admin.id, fullName: admin.fullName, profileImageUrl: admin.profileImageUrl || null }}
      users={users.map((user) => ({ id: user.id, fullName: user.full_name, email: user.email || null, profileImageUrl: user.profile_image_url }))}
      initialConversations={conversations.map((conversation) => ({
        id: conversation.id,
        name: conversation.name,
        isGroup: conversation.is_group,
        groupImageUrl: conversation.group_image_url,
        participantIds: conversation.participant_ids || [],
        lastMessage: conversation.last_message || '',
        lastAt: conversation.last_at,
      }))}
      initialMessages={messages.map((message) => ({
        id: message.id,
        conversationId: message.conversation_id,
        senderId: message.sender_id,
        senderName: message.sender_name,
        body: message.body,
        attachmentUrl: message.attachment_url,
        attachmentName: message.attachment_name,
        attachmentKind: message.attachment_kind,
        readBy: message.read_by || [],
        createdAt: message.created_at,
      }))}
    />
  )
}
