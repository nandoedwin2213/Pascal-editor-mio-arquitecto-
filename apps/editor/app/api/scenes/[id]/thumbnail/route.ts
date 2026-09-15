import { type NextRequest, NextResponse } from 'next/server'
import {
  guardSceneApiRequest,
  sceneApiJson,
  sceneApiPreflight,
  withSceneApiHeaders,
} from '@/lib/scene-api-security'
import { getSceneOperations } from '@/lib/scene-store-server'
import {
  isValidSceneId,
  MAX_THUMBNAIL_BYTES,
  readSceneThumbnail,
  writeSceneThumbnail,
} from '@/lib/scene-thumbnails'

export const dynamic = 'force-dynamic'

type RouteParams = { params: Promise<{ id: string }> }

export function OPTIONS(request: NextRequest) {
  return sceneApiPreflight(request)
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const guard = guardSceneApiRequest(request)
  if (guard) return guard

  const { id } = await params
  if (!isValidSceneId(id)) {
    return sceneApiJson(request, { error: 'invalid_request' }, { status: 400 })
  }

  const bytes = await readSceneThumbnail(id)
  if (!bytes) {
    return sceneApiJson(request, { error: 'not_found' }, { status: 404 })
  }

  return withSceneApiHeaders(
    request,
    new NextResponse(new Uint8Array(bytes), {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'no-cache',
      },
    }),
  )
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const guard = guardSceneApiRequest(request)
  if (guard) return guard

  const { id } = await params
  if (!isValidSceneId(id)) {
    return sceneApiJson(request, { error: 'invalid_request' }, { status: 400 })
  }

  const operations = await getSceneOperations()
  const scene = await operations.loadStoredScene(id)
  if (!scene) {
    return sceneApiJson(request, { error: 'not_found' }, { status: 404 })
  }

  const body = new Uint8Array(await request.arrayBuffer())
  if (body.byteLength > MAX_THUMBNAIL_BYTES) {
    return sceneApiJson(request, { error: 'payload_too_large' }, { status: 413 })
  }
  if (!isWebp(body)) {
    return sceneApiJson(
      request,
      { error: 'invalid_request', details: 'body must be a WebP image' },
      { status: 400 },
    )
  }

  await writeSceneThumbnail(id, body)
  return withSceneApiHeaders(request, new NextResponse(null, { status: 204 }))
}

function isWebp(bytes: Uint8Array): boolean {
  if (bytes.byteLength < 12) return false
  const header = new TextDecoder('ascii').decode(bytes.subarray(0, 12))
  return header.startsWith('RIFF') && header.endsWith('WEBP')
}
