import { type NextRequest, NextResponse } from 'next/server'
import { ACCESS_COOKIE, accessPassword, accessToken, safeEqual } from '@/lib/access'

/** Public surface: landing, sign-in, legal pages and health check. */
const PUBLIC_PATHS = ['/acceso', '/api/access', '/api/health', '/terms', '/privacy']

/** Static files under `public/` (icons, catalog, fonts…) — also fetched internally by the image optimizer. */
const STATIC_FILE = /\.[a-z0-9]+$/i

export async function proxy(request: NextRequest) {
  const password = accessPassword()
  if (!password) return NextResponse.next()

  const { pathname } = request.nextUrl
  if (
    pathname === '/' ||
    (!pathname.startsWith('/api/') && STATIC_FILE.test(pathname)) ||
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  ) {
    return NextResponse.next()
  }

  const cookie = request.cookies.get(ACCESS_COOKIE)?.value
  if (cookie && safeEqual(cookie, await accessToken(password))) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const target = request.nextUrl.clone()
  target.pathname = '/acceso'
  target.search = ''
  target.searchParams.set('next', `${pathname}${request.nextUrl.search}`)
  return NextResponse.redirect(target)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|brand/).*)'],
}
