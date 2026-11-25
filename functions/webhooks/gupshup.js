import {
  addMessage, errorResponse, extractIncomingMessage, getOrCreateConversation,
  getState, json, readPayload, saveState,
} from '../_lib/inbox.js'

export function onRequestGet() {
  return json({ status: 'ok', endpoint: 'gupshup-webhook' })
}

export async function onRequestPost({ request, env }) {
  try {
    const event = await readPayload(request)
    const incoming = extractIncomingMessage(event)
    if (!incoming) return json({ received: true, ignored: true })
    const state = await getState(env)
    const key = incoming.providerId ? `${incoming.phone}:${incoming.providerId}` : null
    if (key && state.processedWebhookIds.includes(key)) return json({ received: true, duplicate: true })
    getOrCreateConversation(state, incoming.phone, incoming.name, 'customer')
    addMessage(state, incoming.phone, 'customer', incoming.text, incoming.providerId)
    if (key) state.processedWebhookIds.push(key)
    await saveState(env, state)
    return json({ received: true })
  } catch (error) {
    return errorResponse(error)
  }
}
