const STORE_KEY = 'inbox-state'

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

export function errorResponse(error) {
  if (error instanceof RequestError) return json({ error: error.message }, error.status)
  return json({ error: 'Erro interno no servidor de teste.' }, 500)
}

export class RequestError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export async function readPayload(request) {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    throw new RequestError(415, 'O conteúdo deve usar application/json.')
  }
  const text = await request.text()
  if (text.length > 1024 * 1024) throw new RequestError(413, 'O corpo da requisição excede o limite permitido.')
  let payload
  try {
    payload = JSON.parse(text)
  } catch {
    throw new RequestError(400, 'O corpo da requisição contém JSON inválido.')
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new RequestError(400, 'O corpo da requisição deve ser um objeto JSON.')
  }
  return payload
}

export function normalizePhone(value) {
  const digits = String(value || '').replace(/\D/g, '')
  return digits.length >= 8 && digits.length <= 15 ? digits : null
}

export async function getState(env) {
  if (env.MEGAZAP_STATE) {
    const id = env.MEGAZAP_STATE.idFromName('megazap-inbox')
    const stub = env.MEGAZAP_STATE.get(id)
    const response = await stub.fetch('https://inbox/state')
    const state = await response.json()
    if (state) return state

    // Move the existing test inbox from KV the first time the Durable Object is used.
    const previousState = env.MEGAZAP_STORE
      ? await env.MEGAZAP_STORE.get(STORE_KEY, 'json')
      : null
    const initialState = previousState || createEmptyState()
    await stub.fetch('https://inbox/state', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(initialState),
    })
    return initialState
  }

  const state = await env.MEGAZAP_STORE.get(STORE_KEY, 'json')
  return state || createEmptyState()
}

export async function saveState(env, state) {
  if (env.MEGAZAP_STATE) {
    const id = env.MEGAZAP_STATE.idFromName('megazap-inbox')
    const stub = env.MEGAZAP_STATE.get(id)
    const response = await stub.fetch('https://inbox/state', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    })
    if (!response.ok) throw new Error('Não foi possível salvar o estado da caixa de entrada.')
    return
  }

  await env.MEGAZAP_STORE.put(STORE_KEY, JSON.stringify(state))
}

function createEmptyState() {
  return { contacts: [], conversations: [], messagesByPhone: {}, processedWebhookIds: [] }
}

function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('')
}

export function addMessage(state, phone, direction, text, providerId = null) {
  const now = new Date()
  const message = {
    id: providerId || crypto.randomUUID(),
    from: direction,
    text,
    date: now.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }),
    time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }),
  }
  state.messagesByPhone[phone] ||= []
  state.messagesByPhone[phone].push(message)
  const conversation = state.conversations.find((item) => item.phone === `+${phone}`)
  conversation.preview = text
  conversation.time = message.time
  conversation.online = true
  if (direction === 'customer') conversation.unread += 1
  return message
}

export function getOrCreateConversation(state, phone, name, direction) {
  const contactName = String(name || '').trim().slice(0, 100) || `+${phone}`
  let conversation = state.conversations.find((item) => item.phone === `+${phone}`)
  if (conversation) {
    if (contactName !== `+${phone}`) {
      conversation.name = contactName
      conversation.initials = initials(contactName)
      const contact = state.contacts.find((item) => item.phone === `+${phone}`)
      if (contact) Object.assign(contact, { name: contactName, initials: conversation.initials })
    }
    if (direction === 'customer' && conversation.status === 'Resolvido') {
      conversation.status = 'Aguardando'
      conversation.assignedOperator = null
    }
    return conversation
  }

  const contact = {
    id: `gupshup-${phone}`, name: contactName, phone: `+${phone}`, email: '',
    company: 'Pessoa física', initials: initials(contactName) || 'WA', color: 'blue',
  }
  conversation = {
    id: `gupshup-${phone}`, phone: `+${phone}`, name: contactName,
    initials: contact.initials, color: 'blue', preview: '', time: '', unread: 0,
    queue: 'Vendas', status: direction === 'customer' ? 'Aguardando' : 'Em atendimento',
    online: true, assignedOperator: direction === 'customer' ? null : 'Ana Carolina',
  }
  state.contacts.push(contact)
  state.conversations.push(conversation)
  state.messagesByPhone[phone] ||= []
  return conversation
}

export function extractIncomingMessage(event) {
  const eventType = String(event.type || event.event || '').toLowerCase()
  if (eventType && !['message', 'incoming-message', 'message-received'].includes(eventType)) return null
  const eventPayload = event.payload && typeof event.payload === 'object' ? event.payload : {}
  const eventData = event.data && typeof event.data === 'object' ? event.data : {}
  const payload = Object.keys(eventPayload).length
    ? eventPayload
    : eventData.payload && typeof eventData.payload === 'object' ? eventData.payload : eventData
  const messagePayload = payload.payload && typeof payload.payload === 'object' ? payload.payload : {}
  const sender = payload.sender && typeof payload.sender === 'object' ? payload.sender : {}
  const phone = normalizePhone(payload.source || sender.phone || payload.from || event.source || event.from)
  const rawText = messagePayload.text || messagePayload.caption || payload.text || payload.message?.text
  const type = String(payload.type || messagePayload.type || '').toLowerCase()
  const text = typeof rawText === 'string' && rawText.trim()
    ? rawText.trim()
    : type && type !== 'text' ? `[Mensagem de ${type} recebida]` : ''
  if (!phone || !text) {
    throw new RequestError(400, 'O webhook de mensagem precisa conter o telefone de origem e o conteúdo da mensagem.')
  }
  return { phone, name: sender.name || payload.name || '', text, providerId: payload.id || payload.messageId || event.id || null }
}

export async function sendToGupshup(env, phone, text) {
  const required = ['GUPSHUP_API_KEY', 'GUPSHUP_SOURCE', 'GUPSHUP_APP_NAME']
  const missing = required.filter((key) => !env[key]?.trim())
  if (missing.length) throw new RequestError(503, `Configure as variáveis: ${missing.join(', ')}.`)
  const form = new URLSearchParams({
    channel: 'whatsapp', source: env.GUPSHUP_SOURCE, destination: phone,
    message: JSON.stringify({ type: 'text', text, previewUrl: true }), 'src.name': env.GUPSHUP_APP_NAME,
  })
  let response
  try {
    response = await fetch('https://api.gupshup.io/wa/api/v1/msg', {
      method: 'POST',
      headers: { 'Cache-Control': 'no-cache', 'Content-Type': 'application/x-www-form-urlencoded', apikey: env.GUPSHUP_API_KEY },
      body: form,
    })
  } catch {
    throw new RequestError(502, 'Não foi possível conectar à API da Gupshup.')
  }
  let result
  try { result = await response.json() } catch { result = null }
  if (!response.ok || String(result?.status || '').toLowerCase() === 'error') {
    throw new RequestError(502, `A Gupshup rejeitou a mensagem (HTTP ${response.status}).`)
  }
}
