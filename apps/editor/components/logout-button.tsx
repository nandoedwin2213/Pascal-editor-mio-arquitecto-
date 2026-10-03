'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function logout() {
    setPending(true)
    await fetch('/api/access', { method: 'DELETE' }).catch(() => null)
    router.push('/')
    router.refresh()
  }

  return (
    <button
      className={cn(
        'flex items-center gap-1.5 rounded-md border border-border bg-background/90 px-3 py-1.5 font-medium text-xs shadow-sm backdrop-blur hover:bg-accent/40 disabled:opacity-60',
        className,
      )}
      disabled={pending}
      onClick={logout}
      title="Cierra la sesión del estudio; volverá a pedir la contraseña"
      type="button"
    >
      <LogOut className="h-3.5 w-3.5" />
      Salir
    </button>
  )
}
