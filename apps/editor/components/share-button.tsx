'use client'

import { Check, Link2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

type ShareState = 'idle' | 'loading' | 'copied' | 'error'

export function ShareButton({ sceneId }: { sceneId: string }) {
  const [state, setState] = useState<ShareState>('idle')
  const [url, setUrl] = useState<string | null>(null)
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current)
    }
  }, [])

  const share = useCallback(async () => {
    setState('loading')
    try {
      const response = await fetch(`/api/scenes/${encodeURIComponent(sceneId)}/share`)
      if (!response.ok) throw new Error(String(response.status))
      const body = (await response.json()) as { url: string }
      setUrl(body.url)
      await navigator.clipboard.writeText(body.url)
      setState('copied')
    } catch {
      setState('error')
    }
    resetTimer.current = setTimeout(() => setState('idle'), 3000)
  }, [sceneId])

  const label =
    state === 'copied'
      ? 'Enlace copiado'
      : state === 'error'
        ? 'No se pudo compartir'
        : state === 'loading'
          ? 'Generando…'
          : 'Compartir con cliente'

  return (
    <div className="pointer-events-auto flex flex-col items-end gap-1">
      <button
        className="flex items-center gap-1.5 rounded-md border border-border bg-background/90 px-3 py-1.5 font-medium text-xs shadow-sm backdrop-blur hover:bg-accent/40 disabled:opacity-60"
        disabled={state === 'loading'}
        onClick={share}
        title="Copia un enlace de solo lectura para que el cliente vea el proyecto en 3D sin contraseña"
        type="button"
      >
        {state === 'copied' ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
        {label}
      </button>
      {url && state === 'copied' && (
        <a
          className="max-w-xs truncate rounded bg-background/90 px-2 py-0.5 font-mono text-[10px] text-muted-foreground underline"
          href={url}
          rel="noreferrer"
          target="_blank"
        >
          {url}
        </a>
      )}
    </div>
  )
}
