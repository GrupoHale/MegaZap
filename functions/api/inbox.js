import { errorResponse, getState, json } from '../_lib/inbox.js'

export async function onRequestGet({ env }) {
  try {
    const state = await getState(env)
    return json({
      mode: env.GUPSHUP_MODE || 'simulation',
      contacts: state.contacts,
      conversations: state.conversations,
      messagesByPhone: state.messagesByPhone,
    })
  } catch (error) {
    return errorResponse(error)
  }
}
