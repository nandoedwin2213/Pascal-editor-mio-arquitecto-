import { type NextRequest, NextResponse } from 'next/server'
import { getSceneOperations } from '@/lib/scene-store-server'
import { sharePath, shareSecret, shareToken } from '@/lib/share'

export const dynamic = 'force-dynamic'

type RouteParams = { params: Promise<{ id: string }> }

/** Issues the public read-only link for a scene. Sits behind the access gate. */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const secret = shareSecret()
  if (!secret) {
    return NextResponse.json({ error: 'sharing_disabled' }, { status: 503 })
  }

  const { id } = await params
  const operations = await getSceneOperations()
  const scene = await operations.loadStoredScene(id)
  if (!scene) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  const token = await shareToken(secret, id)
  const origin = request.headers.get('x-forwarded-host')
    ? `${request.headers.get('x-forwarded-proto') ?? 'https'}://${request.headers.get('x-forwarded-host')}`
    : request.nextUrl.origin
  return NextResponse.json({ url: `${origin}${sharePath(id, token)}` })
}
