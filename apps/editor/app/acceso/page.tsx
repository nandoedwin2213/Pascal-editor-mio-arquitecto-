import type { Metadata } from 'next'
import Image from 'next/image'
import { Suspense } from 'react'
import { AccessForm } from '@/components/access-form'
import { BRAND } from '@/lib/brand'

export const metadata: Metadata = {
  title: 'Acceso',
}

export default function AccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 w-fit rounded-xl bg-white px-5 py-4">
            <Image
              alt={BRAND.company}
              className="h-20 w-auto object-contain"
              height={188}
              priority
              src="/brand/berriot-corp.webp"
              width={447}
            />
          </div>
          <h1 className="font-semibold text-2xl tracking-tight">{BRAND.name}</h1>
          <p className="mt-1 text-muted-foreground text-sm">{BRAND.tagline}</p>
          <p className="mt-1 text-muted-foreground text-xs uppercase tracking-widest">
            {BRAND.company}
          </p>
        </div>
        <Suspense>
          <AccessForm />
        </Suspense>
      </div>
    </div>
  )
}
