import { createServer } from 'node:http'
import { existsSync } from 'node:fs'
import { Buffer } from 'node:buffer'
import process from 'node:process'

if (existsSync('.env')) process.loadEnvFile('.env')

const port = Number(process.env.PORT || 3001)
const host = process.env.HOST || '127.0.0.1'
const maxBodySize = 1024 * 1024
const gupshupMode = process.env.GUPSHUP_MODE || 'simulation'
const contacts = new Map()
const conversations = new Map()
const messagesByPhone = new Map()
const processedWebhookIds = new Set()
let messageSequence = 0

if (!['simulation', 'sandbox'].includes(gupshupMode)) {
  throw new Error('GUPSHUP_MODE must be "simulation" or "sandbox".')
}

class RequestError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.statusCode = statusCode
  }
}

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' })
  response.end(JSON.stringify(data))
}

async function readJsonBody(request) {
  const chunks = []
  let size = 0

  for await (const chunk of request) {
    size += chunk.length
    if (size > maxBodySize) throw new RequestError(413, 'O corpo da requisição excede o limite permitido.')
    chunks.push(chunk)
  }

  let payload
  try {
    payload = JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw new RequestError(400, 'O corpo da requisição contém JSON inválido.')
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new RequestError(400, 'O corpo da requisição deve ser um objeto JSON.')
  }

  return payload
}

function requireJsonContentType(request) {
  const contentType = request.headers['content-type']?.split(';')[0].trim().toLowerCase()
  if (contentType !== 'application/json') {
    throw new RequestError(415, 'O conteúdo deve usar application/json.')
  }
}

function normalizePhone(value) {
  const digits = String(value || '').replace(/\D/g, '')
  return digits.length >= 8 && digits.length <= 15 ? digits : null
}

function initialsFor(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

function getLocalDateTime() {
  const now = new Date()
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-')

  return {
    date,
    time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  }
}

function getOrCreateConversation(phone, name, direction) {
  const existing = conversations.get(phone)
  const contactName = String(name || '').trim().slice(0, 100) || `+${phone}`

  if (existing) {
    if (contactName !== `+${phone}`) {
      existing.name = contactName
      existing.initials = initialsFor(contactName)
      contacts.get(phone).name = contactName
      contacts.get(phone).initials = existing.initials
    }

    if (direction === 'customer' && existing.status === 'Resolvido') {
      existing.status = 'Aguardando'
      existing.assignedOperator = null
    }

    return existing
  }

  const contact = {
    id: `gupshup-${phone}`,
    name: contactName,
    phone: `+${phone}`,
    email: '',
    company: 'Pessoa física',
    initials: initialsFor(contactName) || 'WA',
    color: 'blue',
  }
  const conversation = {
    id: `gupshup-${phone}`,
    phone: `+${phone}`,
    name: contact.name,
    initials: contact.initials,
    color: contact.color,
    preview: '',
    time: '',
    unread: 0,
    queue: 'Vendas',
    status: direction === 'customer' ? 'Aguardando' : 'Em atendimento',
    online: true,
    assignedOperator: direction === 'customer' ? null : 'Ana Carolina',
  }

  contacts.set(phone, contact)
  conversations.set(phone, conversation)
  messagesByPhone.set(phone, [])
  return conversation
}

function addMessage(phone, direction, text, providerId = null) {
  const { date, time } = getLocalDateTime()
  const message = {
    id: providerId || `local-${++messageSequence}`,
    from: direction,
    text,
    date,
    time,
  }
  const messages = messagesByPhone.get(phone) || []

  messages.push(message)
  messagesByPhone.set(phone, messages)

  const conversation = conversations.get(phone)
  conversation.preview = text
  conversation.time = time
  conversation.online = true
  if (direction === 'customer') conversation.unread += 1

  return message
}

function extractIncomingMessage(event) {
  const eventType = String(event.type || event.event || '').toLowerCase()
  if (eventType && !['message', 'incoming-message', 'message-received'].includes(eventType)) {
    return null
  }

  const eventPayload = event.payload && typeof event.payload === 'object' ? event.payload : {}
  const eventData = event.data && typeof event.data === 'object' ? event.data : {}
  const payload = Object.keys(eventPayload).length
    ? eventPayload
    : eventData.payload && typeof eventData.payload === 'object'
      ? eventData.payload
      : eventData
  const messagePayload = payload.payload && typeof payload.payload === 'object' ? payload.payload : {}
  const sender = payload.sender && typeof payload.sender === 'object' ? payload.sender : {}
  const rawPhone = payload.source || sender.phone || payload.from || event.source || event.from
  const phone = normalizePhone(rawPhone)
  const rawText = messagePayload.text
    || messagePayload.caption
    || payload.text
    || payload.message?.text
  const messageType = String(payload.type || messagePayload.type || '').toLowerCase()
  const text = typeof rawText === 'string' && rawText.trim()
    ? rawText.trim()
    : messageType && messageType !== 'text'
      ? `[Mensagem de ${messageType} recebida]`
      : ''

  if (!phone || !text) {
    throw new RequestError(400, 'O webhook de mensagem precisa conter o telefone de origem e o conteúdo da mensagem.')
  }

  return {
    phone,
    name: sender.name || payload.name || '',
    text,
    providerId: payload.id || payload.messageId || event.id || null,
  }
}

function getInboxSnapshot() {
  return {
    mode: gupshupMode,
    contacts: Array.from(contacts.values()),
    conversations: Array.from(conversations.values()),
    messagesByPhone: Object.fromEntries(messagesByPhone.entries()),
  }
}

async function sendToGupshup(phone, text) {
  const requiredVariables = ['GUPSHUP_API_KEY', 'GUPSHUP_SOURCE', 'GUPSHUP_APP_NAME']
  const missing = requiredVariables.filter((name) => !process.env[name]?.trim())
  if (missing.length) {
    throw new RequestError(503, `Configure no .env: ${missing.join(', ')}.`)
  }

  const form = new URLSearchParams({
    channel: 'whatsapp',
    source: process.env.GUPSHUP_SOURCE,
    destination: phone,
    message: JSON.stringify({ type: 'text', text }),
    'src.name': process.env.GUPSHUP_APP_NAME,
  })

  let response
  try {
    response = await fetch('https://api.gupshup.io/wa/api/v1/msg', {
      method: 'POST',
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/x-www-form-urlencoded',
        apikey: process.env.GUPSHUP_API_KEY,
      },
      body: form,
    })
  } catch {
    throw new RequestError(502, 'Não foi possível conectar à API da Gupshup.')
  }

  const responseBody = await response.text()
  let result
  try {
    result = JSON.parse(responseBody)
  } catch {
    result = null
  }

  if (!response.ok || String(result?.status || '').toLowerCase() === 'error') {
    throw new RequestError(502, `A Gupshup rejeitou a mensagem (HTTP ${response.status}).`)
  }
}

async function handleWebhook(request, response) {
  requireJsonContentType(request)
  const event = await readJsonBody(request)
  const incoming = extractIncomingMessage(event)

  if (!incoming) {
    sendJson(response, 200, { received: true, ignored: true })
    return
  }

  const deduplicationKey = incoming.providerId ? `${incoming.phone}:${incoming.providerId}` : null
  if (deduplicationKey && processedWebhookIds.has(deduplicationKey)) {
    sendJson(response, 200, { received: true, duplicate: true })
    return
  }

  getOrCreateConversation(incoming.phone, incoming.name, 'customer')
  addMessage(incoming.phone, 'customer', incoming.text, incoming.providerId)
  if (deduplicationKey) processedWebhookIds.add(deduplicationKey)

  sendJson(response, 200, { received: true })
}

async function handleOutgoingMessage(request, response) {
  requireJsonContentType(request)
  const payload = await readJsonBody(request)
  const phone = normalizePhone(payload.phone)
  const text = typeof payload.text === 'string' ? payload.text.trim() : ''
  const name = typeof payload.name === 'string' ? payload.name.trim().slice(0, 100) : ''

  if (!phone || !text || text.length > 4096) {
    throw new RequestError(400, 'Informe telefone válido e mensagem de até 4096 caracteres.')
  }

  if (gupshupMode === 'sandbox') await sendToGupshup(phone, text)

  getOrCreateConversation(phone, name, 'agent')
  const message = addMessage(phone, 'agent', text)
  sendJson(response, 201, { ...getInboxSnapshot(), message, delivery: gupshupMode })
}

async function handleRequest(request, response) {
  const path = new URL(request.url, 'http://localhost').pathname

  if (request.method === 'GET' && path === '/health') {
    sendJson(response, 200, { status: 'ok' })
    return
  }

  if (request.method === 'GET' && path === '/api/inbox') {
    sendJson(response, 200, getInboxSnapshot())
    return
  }

  if (request.method === 'POST' && path === '/api/messages') {
    await handleOutgoingMessage(request, response)
    return
  }

  if (request.method === 'POST' && path === '/webhooks/gupshup') {
    await handleWebhook(request, response)
    return
  }

  sendJson(response, 404, { error: 'Rota não encontrada.' })
}

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT precisa ser uma porta TCP válida.')
}

const server = createServer((request, response) => {
  handleRequest(request, response).catch((error) => {
    if (error instanceof RequestError) {
      sendJson(response, error.statusCode, { error: error.message })
      return
    }

    console.error('Falha ao processar requisição:', error)
    sendJson(response, 500, { error: 'Erro interno no servidor de teste.' })
  })
})

server.listen(port, host, () => {
  console.log(`MegaZap webhook server listening on http://${host}:${port}`)
})
