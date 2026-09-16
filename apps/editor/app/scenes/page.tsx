import type { Metadata } from 'next'
import { headers } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { CreateSceneButton } from '@/components/save-button'
import type { SceneMeta } from '@/components/scene-loader'
import { SceneThumbnail } from '@/components/scene-thumbnail'
import { BRAND } from '@/lib/brand'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Escenas',
}

async function resolveBaseUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = h.get('x-forwarded-proto') ?? 'http'
  if (!host) {
    return 'http://localhost:3000'
  }
  return `${proto}://${host}`
}

async function fetchScenes(): Promise<SceneMeta[]> {
  const base = await resolveBaseUrl()
  const cookie = (await headers()).get('cookie')
  const response = await fetch(`${base}/api/scenes?limit=50`, {
    cache: 'no-store',
    headers: cookie ? { cookie } : undefined,
  })
  if (!response.ok) {
    return []
  }
  const payload = (await response.json()) as { scenes?: SceneMeta[] } | SceneMeta[]
  if (Array.isArray(payload)) {
    return payload
  }
  return payload.scenes ?? []
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

export default async function ScenesPage() {
  const scenes = await fetchScenes()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-border border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between gap-4 px-6 py-4">
          <nav className="flex items-center gap-4 text-sm">
            <Link className="flex items-center gap-2 transition-opacity hover:opacity-80" href="/">
              <Image
                alt=""
                className="rounded-md"
                height={24}
                src="/brand/quinde-mark.png"
                width={24}
              />
              <span className="font-semibold tracking-tight">{BRAND.name}</span>
              <span className="hidden text-muted-foreground text-xs sm:inline">
                por {BRAND.company}
              </span>
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium text-foreground">Escenas</span>
          </nav>
          <CreateSceneButton label="Crear escena" />
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-6 py-12">
        <h1 className="mb-2 font-bold text-3xl">Tus escenas</h1>
        <p className="mb-8 text-muted-foreground text-sm">
          {scenes.length === 0
            ? 'Todavía no hay escenas. Crea una para empezar.'
            : `${scenes.length} escena${scenes.length === 1 ? '' : 's'}.`}
        </p>

        {scenes.length === 0 ? (
          <div className="rounded-xl border border-border/60 border-dashed bg-background p-12 text-center">
            <p className="text-muted-foreground text-sm">Aún no has guardado ninguna escena.</p>
            <div className="mt-4 flex justify-center">
              <CreateSceneButton label="Crear escena" />
            </div>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {scenes.map((scene) => (
              <li key={scene.id}>
                <Link
                  className="group block rounded-xl border border-border/60 bg-background p-4 transition-colors hover:border-border hover:bg-accent/30"
                  href={`/scene/${scene.id}`}
                >
                  <div className="flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-accent/30">
                    <SceneThumbnail
                      fallbackUrl={scene.thumbnailUrl}
                      name={scene.name}
                      sceneId={scene.id}
                    />
                  </div>
                  <div className="mt-3">
                    <h2 className="truncate font-semibold text-sm group-hover:text-foreground">
                      {scene.name}
                    </h2>
                    <div className="mt-1 flex items-center justify-between text-muted-foreground text-xs">
                      <span>{scene.nodeCount} elementos</span>
                      <time dateTime={scene.updatedAt}>{formatDate(scene.updatedAt)}</time>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>

      <footer className="border-border/60 border-t">
        <div className="container mx-auto flex items-center justify-center gap-3 px-6 py-8">
          <span className="rounded-md bg-white px-3 py-2">
            <Image
              alt={BRAND.company}
              className="h-8 w-auto object-contain"
              height={188}
              src="/brand/berriot-corp.webp"
              width={447}
            />
          </span>
          <span className="text-muted-foreground text-xs uppercase tracking-widest">
            {BRAND.company} Constructora
          </span>
        </div>
      </footer>
    </div>
  )
}
