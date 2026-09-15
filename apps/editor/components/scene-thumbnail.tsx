'use client'

import { useCallback, useState } from 'react'

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
  const [usingFallback, setUsingFallback] = useState(false)
  const [failed, setFailed] = useState(false)
  const src = usingFallback && fallbackUrl ? fallbackUrl : `/api/scenes/${sceneId}/thumbnail`

  const handleError = useCallback(() => {
    if (fallbackUrl && !usingFallback) {
      setUsingFallback(true)
      return
    }
    setFailed(true)
  }, [fallbackUrl, usingFallback])

  // A request that failed before hydration never fires `onError`, so the
  // broken image would stay on screen. `complete` with no intrinsic width is
  // that already-failed state.
  const checkSettledImage = useCallback(
    (image: HTMLImageElement | null) => {
      if (image?.complete && image.naturalWidth === 0) handleError()
    },
    [handleError],
  )

  if (failed) {
    return <span className="text-muted-foreground text-xs">Sin miniatura</span>
  }

  return (
    <img
      alt={name}
      className="h-full w-full object-cover"
      onError={handleError}
      ref={checkSettledImage}
      src={src}
    />
  )
}
