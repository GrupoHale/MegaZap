import { existsSync } from 'node:fs'
import process from 'node:process'

if (existsSync('.env')) process.loadEnvFile('.env')

const requiredVariables = [
  'GUPSHUP_API_KEY',
  'GUPSHUP_SOURCE',
  'GUPSHUP_APP_NAME',
  'GUPSHUP_TEST_DESTINATION',
]
const missingVariables = requiredVariables.filter((name) => !process.env[name]?.trim())

if (missingVariables.length > 0) {
  console.error(`Configure estas variáveis no .env: ${missingVariables.join(', ')}`)
  process.exitCode = 1
} else {
  const form = new URLSearchParams({
    channel: 'whatsapp',
    source: process.env.GUPSHUP_SOURCE,
    destination: process.env.GUPSHUP_TEST_DESTINATION,
    message: JSON.stringify({ type: 'text', text: 'Mensagem teste', previewUrl: true }),
    'src.name': process.env.GUPSHUP_APP_NAME,
  })

  try {
    const response = await fetch('https://api.gupshup.io/wa/api/v1/msg', {
      method: 'POST',
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/x-www-form-urlencoded',
        apikey: process.env.GUPSHUP_API_KEY,
      },
      body: form,
    })
    const responseBody = await response.text()

    if (!response.ok) {
      console.error(`Gupshup respondeu com HTTP ${response.status}: ${responseBody}`)
      process.exitCode = 1
    } else {
      console.log(`Gupshup aceitou o envio para processamento (HTTP ${response.status}).`)
      if (responseBody) console.log(responseBody)
    }
  } catch (error) {
    console.error('Não foi possível conectar à API da Gupshup:', error)
    process.exitCode = 1
  }
}
