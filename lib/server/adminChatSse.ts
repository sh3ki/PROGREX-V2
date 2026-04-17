type SseClient = {
  userId: string
  send: (event: string, data: unknown) => void
  close: () => void
}

const MAX_CONNECTIONS = 60

const g = globalThis as typeof globalThis & {
  __adminChatClients?: Map<string, SseClient>
}

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
  const clients = getClients()
  clients.delete(userId)
}

export function broadcastToUsers(userIds: string[], event: string, data: unknown) {
  const clients = getClients()
  for (const userId of userIds) {
    const client = clients.get(userId)
    if (!client) continue
    client.send(event, data)
  }
}
