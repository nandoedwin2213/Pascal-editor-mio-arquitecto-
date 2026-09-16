import { type NextRequest, NextResponse } from 'next/server'
import { accessPassword } from '@/lib/access'
import { getSceneOperations } from '@/lib/scene-store-server'
import { sharePath, shareSecret, shareToken } from '@/lib/share'

export const dynamic = 'force-dynamic'

type RouteParams = { params: Promise<{ id: string }> }

/**
 * Issues the public read-only link for a scene. Sits behind the access gate,
 * so it refuses to mint links while the gate itself is not configured.
 * Returns a path only; the browser prepends its own origin.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const secret = shareSecret()
  if (!(secret && accessPassword())) {
    return NextResponse.json({ error: 'sharing_disabled' }, { status: 503 })
  }

  const { id } = await params
  const operations = await getSceneOperations()
  const scene = await operations.loadStoredScene(id)
  if (!scene) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  const token = await shareToken(secret, id)
  return NextResponse.json({ path: sharePath(id, token) })
}
