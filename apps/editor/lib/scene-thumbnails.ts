import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { resolveDefaultDatabasePath } from '@pascal-app/mcp/storage'

export const MAX_THUMBNAIL_BYTES = 2_000_000

const SCENE_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/

function thumbnailsDir(): string {
  return path.join(path.dirname(resolveDefaultDatabasePath(process.env)), 'thumbnails')
}

function thumbnailPath(sceneId: string): string {
  return path.join(thumbnailsDir(), `${sceneId}.webp`)
}

export function isValidSceneId(sceneId: string): boolean {
  return SCENE_ID_PATTERN.test(sceneId)
}

export async function writeSceneThumbnail(sceneId: string, bytes: Uint8Array): Promise<void> {
  await mkdir(thumbnailsDir(), { recursive: true })
  await writeFile(thumbnailPath(sceneId), bytes)
}

export async function readSceneThumbnail(sceneId: string): Promise<Buffer | null> {
  try {
    return await readFile(thumbnailPath(sceneId))
  } catch {
    return null
  }
}

export async function deleteSceneThumbnail(sceneId: string): Promise<void> {
  if (!isValidSceneId(sceneId)) return
  await rm(thumbnailPath(sceneId), { force: true })
}
