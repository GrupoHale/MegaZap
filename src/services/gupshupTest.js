async function requestJson(path, options) {
  let response
  try {
    response = await fetch(path, options)
  } catch {
    throw new Error('Servidor de teste indisponível. Inicie-o com npm run api.')
  }

  let result
  try {
    result = await response.json()
  } catch {
    throw new Error('O servidor de teste retornou uma resposta inválida.')
  }

  if (!response.ok) {
    throw new Error(result.error || `A requisição falhou (HTTP ${response.status}).`)
  }

  return result
}

export function fetchTestInbox() {
  return requestJson('/api/inbox')
}

export function sendTestMessage({ phone, name, text }) {
  return requestJson('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, name, text }),
  })
}
