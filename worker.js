import { onRequestGet as getInbox } from './functions/api/inbox.js'
import { onRequestPost as postMessage } from './functions/api/messages.js'
import {
  onRequestGet as getWebhookStatus,
  onRequestPost as receiveWebhook,
} from './functions/webhooks/gupshup.js'
import { json } from './functions/_lib/inbox.js'
import { DurableObject } from 'cloudflare:workers'

const INBOX_STATE_KEY = 'inbox-state'

export class InboxState extends DurableObject {
  async fetch(request) {
    const { pathname } = new URL(request.url)
    if (pathname !== '/state') return new Response('Not found', { status: 404 })

    if (request.method === 'GET') {
      const state = await this.ctx.storage.get(INBOX_STATE_KEY)
      return Response.json(state ?? null)
    }

    if (request.method === 'PUT') {
      const state = await request.json()
      await this.ctx.storage.put(INBOX_STATE_KEY, state)
      return new Response(null, { status: 204 })
    }

    return new Response('Method not allowed', { status: 405 })
  }
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url)
    const context = { request, env }

    if (pathname === '/health' && request.method === 'GET') {
      return json({ status: 'ok' })
    }

    if (pathname === '/webhooks/gupshup') {
      if (request.method === 'GET') return getWebhookStatus(context)
      if (request.method === 'POST') return receiveWebhook(context)
      return json({ error: 'Método não permitido.' }, 405)
    }

    if (pathname === '/api/inbox' && request.method === 'GET') {
      return getInbox(context)
    }

    if (pathname === '/api/messages' && request.method === 'POST') {
      return postMessage(context)
    }

    return env.ASSETS.fetch(request)
  },
}
