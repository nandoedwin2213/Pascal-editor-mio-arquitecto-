'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { type FormEvent, useCallback, useState } from 'react'

export function AccessForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setIsSubmitting(true)
      setError(null)
      try {
        const response = await fetch('/api/access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        })
        if (!response.ok) {
          setError('Contraseña incorrecta')
          return
        }
        const next = searchParams.get('next')
        router.replace(next?.startsWith('/') ? next : '/scenes')
        router.refresh()
      } catch {
        setError('No se pudo verificar la contraseña')
      } finally {
        setIsSubmitting(false)
      }
    },
    [password, router, searchParams],
  )

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
      <label className="font-medium text-sm" htmlFor="access-password">
        Contraseña de acceso
      </label>
      <input
        autoComplete="current-password"
        className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
        id="access-password"
        onChange={(event) => setPassword(event.target.value)}
        type="password"
        value={password}
      />
      {error && <span className="text-destructive text-xs">{error}</span>}
      <button
        className="rounded-md bg-foreground px-3 py-2 font-medium text-background text-sm disabled:opacity-50"
        disabled={isSubmitting || password.length === 0}
        type="submit"
      >
        {isSubmitting ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  )
}
