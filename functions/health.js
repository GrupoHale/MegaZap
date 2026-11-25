import { json } from './_lib/inbox.js'

export function onRequestGet() {
  return json({ status: 'ok' })
}
