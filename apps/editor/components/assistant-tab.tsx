'use client'

import { useScene } from '@pascal-app/core'
import { applySceneGraphToEditor, type SceneGraph } from '@pascal-app/editor'
import { Loader2, Sparkles, Undo2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const EXAMPLES = [
  'Casa de una planta de 90 m² con 3 dormitorios, 2 baños, sala-comedor y cocina',
  'Añade una cubierta a dos aguas sobre la planta actual',
  'Amuebla el dormitorio principal con cama, closet y dos veladores',
  'Crea un local comercial de 8 x 12 m con baño y bodega',
]

const MAX_PROMPT = 2000

type Status =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | { kind: 'disabled' }
  | { kind: 'working' }
  | { kind: 'done'; summary: string; toolCount: number; failed: number }
  | { kind: 'error'; message: string }

type AssistantResponse = {
  graph: SceneGraph
  summary: string
  steps: Array<{ tool: string; ok: boolean }>
}

function currentGraph(): SceneGraph {
  const { nodes, rootNodeIds, collections, materials, installedPlugins } = useScene.getState()
  return { nodes, rootNodeIds, collections, materials, installedPlugins } as SceneGraph
}

function errorMessage(status: number, body: { error?: string } | null): string {
  switch (body?.error) {
    case 'assistant_disabled':
      return 'El asistente no está configurado en este servidor.'
    case 'timeout':
      return 'El asistente tardó demasiado. Prueba con una petición más corta.'
    case 'provider_error':
      return 'El servicio de IA no respondió. Inténtalo de nuevo en un momento.'
    case 'invalid_body':
      return 'La petición no es válida. Escribe entre 3 y 2000 caracteres.'
    default:
      return `No se pudo aplicar la petición (error ${status}).`
  }
}

export function AssistantTab() {
  const [prompt, setPrompt] = useState('')
  const [status, setStatus] = useState<Status>({ kind: 'checking' })
  const [previous, setPrevious] = useState<SceneGraph | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/asistente')
      .then((response) => (response.ok ? response.json() : { enabled: false }))
      .then((body: { enabled?: boolean }) => {
        if (!cancelled) setStatus(body.enabled ? { kind: 'idle' } : { kind: 'disabled' })
      })
      .catch(() => {
        if (!cancelled) setStatus({ kind: 'disabled' })
      })
    return () => {
      cancelled = true
    }
  }, [])

  const busy = status.kind === 'working' || status.kind === 'checking'
  const canSend = !busy && status.kind !== 'disabled' && prompt.trim().length >= 3

  const submit = useCallback(async () => {
    const text = prompt.trim()
    if (!text) return
    const before = currentGraph()
    setStatus({ kind: 'working' })
    try {
      const response = await fetch('/api/asistente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, graph: before }),
      })
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null
        setStatus({ kind: 'error', message: errorMessage(response.status, body) })
        return
      }
      const result = (await response.json()) as AssistantResponse
      setPrevious(before)
      applySceneGraphToEditor(result.graph)
      setStatus({
        kind: 'done',
        summary: result.summary || 'Cambios aplicados a la escena.',
        toolCount: result.steps.length,
        failed: result.steps.filter((step) => !step.ok).length,
      })
      setPrompt('')
    } catch {
      setStatus({ kind: 'error', message: 'Sin conexión con el servidor.' })
    }
  }, [prompt])

  const revert = useCallback(() => {
    if (!previous) return
    applySceneGraphToEditor(previous)
    setPrevious(null)
    setStatus({ kind: 'idle' })
  }, [previous])

  return (
    <div className="flex h-full flex-col gap-3 p-3 text-xs">
      <div>
        <div className="flex items-center gap-1.5 font-semibold text-sm">
          <Sparkles className="size-4" />
          Asistente de diseño
        </div>
        <p className="mt-1 text-muted-foreground leading-snug">
          Describe lo que quieres construir y el asistente lo levanta en la escena actual. Luego
          puedes ajustarlo con las herramientas de siempre.
        </p>
      </div>

      {status.kind === 'disabled' && (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-2 leading-snug">
          El asistente no está activado en este servidor. Falta configurar la clave de IA.
        </div>
      )}

      <textarea
        className="min-h-[96px] w-full resize-y rounded-md border border-border bg-background p-2 text-xs leading-snug outline-none focus:ring-1 focus:ring-ring disabled:opacity-60"
        disabled={busy || status.kind === 'disabled'}
        maxLength={MAX_PROMPT}
        onChange={(event) => setPrompt(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey) && canSend) {
            event.preventDefault()
            void submit()
          }
        }}
        placeholder="Ej.: casa de dos plantas, 3 dormitorios, 120 m², con garaje y terraza"
        value={prompt}
      />

      <div className="flex items-center gap-2">
        <button
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 font-medium text-primary-foreground transition-opacity',
            !canSend && 'opacity-50',
          )}
          disabled={!canSend}
          onClick={() => void submit()}
          type="button"
        >
          {status.kind === 'working' ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Diseñando…
            </>
          ) : (
            'Generar en la escena'
          )}
        </button>
        {previous && (
          <button
            className="flex items-center gap-1 rounded-md border border-border px-2 py-2 text-muted-foreground hover:text-foreground"
            onClick={revert}
            title="Volver a como estaba antes del último cambio del asistente"
            type="button"
          >
            <Undo2 className="size-3.5" />
            Deshacer
          </button>
        )}
      </div>

      {status.kind === 'working' && (
        <p className="text-muted-foreground leading-snug">
          Puede tardar de 30 segundos a varios minutos según el tamaño del encargo.
        </p>
      )}

      {status.kind === 'done' && (
        <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-2 leading-snug">
          <p>{status.summary}</p>
          <p className="mt-1 text-muted-foreground">
            {status.toolCount} operaciones aplicadas
            {status.failed > 0 ? `, ${status.failed} con avisos` : ''}. Se guarda automáticamente.
          </p>
        </div>
      )}

      {status.kind === 'error' && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-2 leading-snug">
          {status.message}
        </div>
      )}

      <div className="mt-1">
        <div className="mb-1 font-medium text-muted-foreground">Ejemplos</div>
        <div className="flex flex-col gap-1">
          {EXAMPLES.map((example) => (
            <button
              className="rounded-md border border-border/60 px-2 py-1.5 text-left text-muted-foreground leading-snug hover:border-border hover:text-foreground"
              disabled={busy || status.kind === 'disabled'}
              key={example}
              onClick={() => setPrompt(example)}
              type="button"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
