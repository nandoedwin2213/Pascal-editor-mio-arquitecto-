'use client'

import { useState } from 'react'

/**
 * Thumbnails are captured on save and stored next to the scene database, so
 * they are only available once a scene has been edited with a visible viewport.
 */
export function SceneThumbnail({
  sceneId,
  name,
  fallbackUrl,
}: {
  sceneId: string
  name: string
  fallbackUrl?: string | null
}) {
  const [src, setSrc] = useState(`/api/scenes/${sceneId}/thumbnail`)
  const [failed, setFailed] = useState(false)

  if (failed) {
    return <span className="text-muted-foreground text-xs">Sin miniatura</span>
  }

  return (
    <img
      alt={name}
      className="h-full w-full object-cover"
      onError={() => {
        if (fallbackUrl && src !== fallbackUrl) {
          setSrc(fallbackUrl)
          return
        }
        setFailed(true)
      }}
      src={src}
    />
  )
}
