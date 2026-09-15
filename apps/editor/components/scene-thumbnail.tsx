'use client'

import { useState } from 'react'

/**
 * Thumbnails are captured on save and stored next to the scene database, so
 * they are only available once a scene has been edited with a visible viewport.
 */
export function SceneThumbnail({ sceneId, name }: { sceneId: string; name: string }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return <span className="text-muted-foreground text-xs">Sin miniatura</span>
  }

  return (
    <img
      alt={name}
      className="h-full w-full object-cover"
      onError={() => setFailed(true)}
      src={`/api/scenes/${sceneId}/thumbnail`}
    />
  )
}
