export const ACCESS_COOKIE = 'quinde_access'

const TOKEN_PAYLOAD = 'quinde-access-v1'

export function accessPassword(): string | null {
  const password = process.env.QUINDE_ACCESS_PASSWORD
  return password ? password : null
}

/**
 * Deterministic token derived from the shared password, so a rotated password
 * invalidates every issued cookie without any server-side session store.
 */
export async function accessToken(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(TOKEN_PAYLOAD))

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}
