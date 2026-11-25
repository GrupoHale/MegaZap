import { onRequestGet as getInbox } from './functions/api/inbox.js'
import { onRequestPost as postMessage } from './functions/api/messages.js'
import {
  onRequestGet as getWebhookStatus,
  onRequestPost as receiveWebhook,
} from './functions/webhooks/gupshup.js'
import { json } from './functions/_lib/inbox.js'

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
