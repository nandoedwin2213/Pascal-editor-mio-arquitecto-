import { type NextRequest, NextResponse } from 'next/server'
import { ACCESS_COOKIE, accessPassword, accessToken, safeEqual } from '@/lib/access'

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

export async function POST(request: NextRequest) {
  const password = accessPassword()
  if (!password) {
    return NextResponse.json({ error: 'access_disabled' }, { status: 404 })
  }

  const body = (await request.json().catch(() => null)) as { password?: unknown } | null
  const supplied = typeof body?.password === 'string' ? body.password : ''

  if (!safeEqual(supplied, password)) {
    return NextResponse.json({ error: 'invalid_password' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set({
    name: ACCESS_COOKIE,
    value: await accessToken(password),
    httpOnly: true,
    sameSite: 'lax',
    secure: request.nextUrl.protocol === 'https:',
    path: '/',
    maxAge: COOKIE_MAX_AGE_SECONDS,
  })
  return response
}

export function DELETE(request: NextRequest) {
  const response = NextResponse.json({ ok: true })
  response.cookies.set({
    name: ACCESS_COOKIE,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: request.nextUrl.protocol === 'https:',
    path: '/',
    maxAge: 0,
  })
  return response
}
