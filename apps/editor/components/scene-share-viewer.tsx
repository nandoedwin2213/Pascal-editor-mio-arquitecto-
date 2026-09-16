'use client'

import { applySceneGraphToEditor, type SceneGraph, ViewerStage } from '@pascal-app/editor'
import { SceneEnvironment, useViewer, Viewer } from '@pascal-app/viewer'
import { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { Box3, type Mesh, type Object3D, Vector3 } from 'three'
import { BRAND } from '@/lib/brand'

/** Meshes wider than this are backdrop (sky dome, ground) — not part of the building. */
const MAX_BUILDING_EXTENT_M = 500
const MIN_FRAME_EXTENT_M = 6

function buildingBounds(root: Object3D): Box3 | null {
  const bounds = new Box3()
  const size = new Vector3()
  const meshBounds = new Box3()
  root.traverse((object) => {
    const mesh = object as Mesh
    if (!mesh.isMesh || !mesh.visible) return
    meshBounds.setFromObject(mesh)
    if (meshBounds.isEmpty()) return
    meshBounds.getSize(size)
    if (Math.max(size.x, size.y, size.z) > MAX_BUILDING_EXTENT_M) return
    bounds.union(meshBounds)
  })
  return bounds.isEmpty() ? null : bounds
}

function OrbitCamera({ sceneReady }: { sceneReady: boolean }) {
  const controls = useRef<CameraControls>(null)
  const scene = useThree((state) => state.scene)
  const framed = useRef(false)

  useEffect(() => {
    if (!sceneReady || framed.current || !controls.current) return
    const bounds = buildingBounds(scene)
    if (!bounds) return
    framed.current = true
    const size = bounds.getSize(new Vector3())
    const center = bounds.getCenter(new Vector3())
    size.set(
      Math.max(size.x, MIN_FRAME_EXTENT_M),
      Math.max(size.y, MIN_FRAME_EXTENT_M),
      Math.max(size.z, MIN_FRAME_EXTENT_M),
    )
    bounds.setFromCenterAndSize(center, size)
    controls.current.rotateTo(Math.PI / 4, Math.PI / 4, false)
    controls.current.fitToBox(bounds, true, {
      paddingTop: 1,
      paddingBottom: 1,
      paddingLeft: 1,
      paddingRight: 1,
    })
  }, [sceneReady, scene])

  return (
    <CameraControls
      dollySpeed={0.6}
      makeDefault
      maxPolarAngle={Math.PI / 2 - 0.05}
      minDistance={2}
      ref={controls}
      smoothTime={0.25}
    />
  )
}

interface SceneShareViewerProps {
  graph: SceneGraph
  name: string
  updatedAt: string
}

export function SceneShareViewer({ graph, name, updatedAt }: SceneShareViewerProps) {
  const [sceneReady, setSceneReady] = useState(false)

  useEffect(() => {
    applySceneGraphToEditor(graph)
    useViewer.getState().setLevelMode('stacked')
  }, [graph])

  const updated = new Date(updatedAt).toLocaleDateString('es-EC', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="relative h-screen w-screen bg-neutral-100">
      <ViewerStage className="h-full w-full" defaultMode="3d" modes={['3d', '2d', 'split']}>
        <Viewer
          onSceneReadyChange={setSceneReady}
          renderContext="viewer"
          sceneReadyKey={updatedAt}
          selectionManager="custom"
        >
          <SceneEnvironment />
          <OrbitCamera sceneReady={sceneReady} />
        </Viewer>
      </ViewerStage>

      <header className="pointer-events-none absolute top-0 left-0 z-40 flex w-full items-start justify-between gap-4 p-4">
        <div className="pointer-events-auto rounded-xl border border-border/60 bg-background/90 px-4 py-3 shadow-sm backdrop-blur">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
            Proyecto
          </p>
          <h1 className="font-semibold text-base leading-tight">{name}</h1>
          <p className="mt-1 text-muted-foreground text-xs">Actualizado el {updated}</p>
        </div>
        <span className="pointer-events-auto rounded-xl bg-white px-4 py-2 shadow-sm">
          <Image
            alt={BRAND.company}
            className="h-10 w-auto object-contain"
            height={188}
            priority
            src="/brand/berriot-corp.webp"
            width={447}
          />
        </span>
      </header>

      <footer className="pointer-events-none absolute bottom-0 left-0 z-40 flex w-full items-end justify-between gap-4 p-4">
        <p className="pointer-events-auto rounded-lg bg-background/90 px-3 py-1.5 text-muted-foreground text-xs shadow-sm backdrop-blur">
          Arrastra para girar · rueda para acercar · clic derecho para desplazar
        </p>
        <p className="pointer-events-auto rounded-lg bg-background/90 px-3 py-1.5 text-muted-foreground text-xs shadow-sm backdrop-blur">
          Vista de solo lectura · {BRAND.name} by {BRAND.company}
        </p>
      </footer>

      {!sceneReady && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-neutral-100/80">
          <p className="animate-pulse text-muted-foreground text-sm">Cargando proyecto…</p>
        </div>
      )}
    </div>
  )
}
