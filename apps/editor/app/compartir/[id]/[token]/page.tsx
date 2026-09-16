import type { SceneGraph } from '@pascal-app/editor'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SceneShareViewer } from '@/components/scene-share-viewer'
import { getSceneOperations } from '@/lib/scene-store-server'
import { shareSecret, verifyShareToken } from '@/lib/share'

export const dynamic = 'force-dynamic'

type PageParams = { params: Promise<{ id: string; token: string }> }

async function loadSharedScene({ params }: PageParams) {
  const secret = shareSecret()
  if (!secret) notFound()

  const { id, token } = await params
  if (!(await verifyShareToken(secret, id, token))) notFound()

  const operations = await getSceneOperations()
  const scene = await operations.loadStoredScene(id)
  if (!scene) notFound()
  return scene
}

export async function generateMetadata(props: PageParams): Promise<Metadata> {
  const scene = await loadSharedScene(props)
  return { title: scene.name, robots: { index: false, follow: false } }
}

export default async function SharedScenePage(props: PageParams) {
  const scene = await loadSharedScene(props)
  return (
    <SceneShareViewer
      graph={scene.graph as SceneGraph}
      name={scene.name}
      updatedAt={scene.updatedAt}
    />
  )
}
