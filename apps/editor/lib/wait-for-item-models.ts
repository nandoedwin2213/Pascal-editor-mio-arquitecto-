import { sceneRegistry, useScene } from '@pascal-app/core'

const POLL_MS = 150

/**
 * Item models stream in after their nodes register, and until they land the
 * renderer draws a striped placeholder box. `ItemRenderer` flags each mesh with
 * `itemModelSettled` once its GLB loaded, failed terminally, or was never
 * expected.
 */
export async function waitForItemModels(timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    if (itemModelsSettled()) return
    await new Promise((resolve) => setTimeout(resolve, POLL_MS))
  }
}

function itemModelsSettled(): boolean {
  const nodes = useScene.getState().nodes

  for (const [id, node] of Object.entries(nodes)) {
    if (node.type !== 'item') continue
    const mesh = sceneRegistry.nodes.get(id)
    if (!mesh) return false
    if (!(mesh.userData as { itemModelSettled?: boolean }).itemModelSettled) return false
  }

  return true
}
