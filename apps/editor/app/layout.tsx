import { Agentation } from 'agentation'
import { GeistPixelSquare } from 'geist/font/pixel'
import type { Metadata, Viewport } from 'next'
import { Barlow } from 'next/font/google'
import localFont from 'next/font/local'
import { BRAND } from '@/lib/brand'
import { ClientBootstrap } from './client-bootstrap'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} — ${BRAND.tagline}`,
    template: `%s — ${BRAND.name}`,
  },
  description: BRAND.description,
  applicationName: BRAND.name,
  openGraph: {
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: BRAND.description,
    siteName: BRAND.name,
    locale: 'es_EC',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: BRAND.ink,
}

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
})

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-barlow',
  display: 'swap',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const enableDevDiagnostics =
    process.env.NODE_ENV === 'development' && process.env.PASCAL_DEV_DIAGNOSTICS === '1'

  return (
    <html
      className={`${geistSans.variable} ${geistMono.variable} ${GeistPixelSquare.variable} ${barlow.variable}`}
      lang="es"
    >
      <body className="font-sans">
        <ClientBootstrap enableDevDiagnostics={enableDevDiagnostics}>{children}</ClientBootstrap>
        {enableDevDiagnostics && <Agentation />}
      </body>
    </html>
  )
}
