import { safeEqual } from './access'

const SHARE_PAYLOAD = 'quinde-share-v1'
const TOKEN_LENGTH = 32

/**
 * Secret used to sign public share links. Kept separate from the access
 * password so rotating the password does not break links already sent to
 * clients; rotating this secret revokes every share link at once.
 */
export function shareSecret(): string | null {
  const secret = process.env.QUINDE_SHARE_SECRET
  return secret ? secret : null
}

export async function shareToken(secret: string, sceneId: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(`${SHARE_PAYLOAD}:${sceneId}`),
  )
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, TOKEN_LENGTH)
}

export async function verifyShareToken(
  secret: string,
  sceneId: string,
  token: string,
): Promise<boolean> {
  return safeEqual(token, await shareToken(secret, sceneId))
}

export function sharePath(sceneId: string, token: string): string {
  return `/compartir/${encodeURIComponent(sceneId)}/${token}`
}
