import {
  addMessage, errorResponse, getOrCreateConversation, getState, json,
  normalizePhone, readPayload, RequestError, saveState, sendToGupshup,
} from '../_lib/inbox.js'

export async function onRequestPost({ request, env }) {
  try {
    const payload = await readPayload(request)
    const phone = normalizePhone(payload.phone)
    const text = typeof payload.text === 'string' ? payload.text.trim() : ''
    const name = typeof payload.name === 'string' ? payload.name.trim().slice(0, 100) : ''
    if (!phone || !text || text.length > 4096) throw new RequestError(400, 'Informe telefone válido e mensagem de até 4096 caracteres.')
    const mode = env.GUPSHUP_MODE || 'simulation'
    if (mode === 'sandbox') await sendToGupshup(env, phone, text)
    const state = await getState(env)
    getOrCreateConversation(state, phone, name, 'agent')
    const message = addMessage(state, phone, 'agent', text)
    await saveState(env, state)
    return json({ mode, contacts: state.contacts, conversations: state.conversations, messagesByPhone: state.messagesByPhone, message, delivery: mode }, 201)
  } catch (error) {
    return errorResponse(error)
  }
}
