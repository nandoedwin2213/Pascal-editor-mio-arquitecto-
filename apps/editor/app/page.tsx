import { Boxes, Building2, Layers3, Ruler, Sparkles, Sun } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { BRAND } from '@/lib/brand'

const FEATURES = [
  {
    icon: Layers3,
    title: 'Niveles, muros y cubiertas',
    text: 'Levanta la obra planta por planta con muros, losas, cubiertas, puertas y ventanas paramétricas.',
  },
  {
    icon: Ruler,
    title: 'Plano 2D y vista 3D a la vez',
    text: 'Dibuja en planta y revisa el volumen al instante; cada cambio se refleja en ambas vistas.',
  },
  {
    icon: Boxes,
    title: 'Catálogo de mobiliario',
    text: 'Amuebla con más de un centenar de piezas: sala, cocina, baño, iluminación y vegetación.',
  },
  {
    icon: Sun,
    title: 'Materiales e iluminación',
    text: 'Aplica acabados reales, ajusta la luz del día y recorre el proyecto en primera persona.',
  },
  {
    icon: Building2,
    title: 'Proyectos guardados',
    text: 'Cada escena se guarda en nuestro servidor con su miniatura, lista para retomarla desde cualquier equipo.',
  },
  {
    icon: Sparkles,
    title: 'Asistentes de IA',
    text: 'Conecta agentes por MCP para que propongan distribuciones o generen variantes del diseño.',
  },
] as const

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-border/60 border-b">
        <div className="container mx-auto flex items-center justify-between gap-4 px-6 py-4">
          <span className="rounded-lg bg-white px-3 py-2">
            <Image
              alt={`${BRAND.company} Constructora`}
              className="h-12 w-auto object-contain"
              height={188}
              priority
              src="/brand/berriot-corp.webp"
              width={447}
            />
          </span>
          <Link
            className="rounded-md border border-border px-3 py-1.5 font-medium text-sm hover:bg-accent/40"
            href="/scenes"
          >
            Entrar al estudio
          </Link>
        </div>
      </header>

      <main>
        <section className="container mx-auto max-w-5xl px-6 py-20 text-center sm:py-28">
          <span className="mx-auto mb-8 inline-block rounded-2xl bg-white px-8 py-5 shadow-sm">
            <Image
              alt={`${BRAND.company} Constructora`}
              className="h-24 w-auto object-contain sm:h-32"
              height={188}
              priority
              src="/brand/berriot-corp.webp"
              width={447}
            />
          </span>
          <div className="mx-auto mb-6 flex w-fit items-center gap-3 rounded-full border border-border/60 px-4 py-1.5 text-muted-foreground text-xs uppercase tracking-widest">
            <Image alt="" className="rounded" height={18} src="/brand/quinde-mark.png" width={18} />
            Una marca de {BRAND.company}
          </div>
          <h1 className="font-bold text-5xl tracking-tight sm:text-7xl">{BRAND.name}</h1>
          <p className="mt-4 font-medium text-muted-foreground text-xl sm:text-2xl">
            Estudio 3D de arquitectura en el navegador
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-muted-foreground">
            Quinde —colibrí en kichwa— es la herramienta de diseño de {BRAND.company}: modela
            viviendas y edificaciones en 3D, amuebla los espacios y comparte el proyecto con tus
            clientes sin instalar nada. Ligera, rápida y hecha en Ecuador.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              className="rounded-md bg-foreground px-5 py-2.5 font-medium text-background text-sm hover:opacity-90"
              href="/scenes"
            >
              Entrar al estudio
            </Link>
            <span className="text-muted-foreground text-xs">Acceso con contraseña</span>
          </div>
        </section>

        <section className="border-border/60 border-t bg-accent/10">
          <div className="container mx-auto max-w-5xl px-6 py-16">
            <h2 className="mb-10 text-center font-semibold text-2xl tracking-tight">
              Qué puedes hacer con {BRAND.name}
            </h2>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <li className="rounded-xl border border-border/60 bg-background p-6" key={title}>
                  <Icon className="mb-4 h-6 w-6 text-muted-foreground" />
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-2 text-muted-foreground text-sm">{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="container mx-auto max-w-5xl px-6 py-16">
          <div className="flex flex-col items-center gap-8 rounded-2xl border border-border/60 p-8 sm:flex-row sm:p-12">
            <span className="shrink-0 rounded-xl bg-white px-6 py-5">
              <Image
                alt={`${BRAND.company} Constructora`}
                className="h-28 w-auto object-contain"
                height={188}
                src="/brand/berriot-corp.webp"
                width={447}
              />
            </span>
            <div>
              <h2 className="font-semibold text-2xl tracking-tight">
                {BRAND.company} Constructora
              </h2>
              <p className="mt-3 text-muted-foreground">
                Construimos y diseñamos en Ecuador. {BRAND.name} es nuestra plataforma digital: la
                usamos para anteproyectos, presentaciones a clientes y coordinación de obra, y la
                ponemos a disposición de nuestros aliados y equipo.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-border/60 border-t">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-8 text-muted-foreground text-xs">
          <span>
            © {new Date().getFullYear()} {BRAND.company} · {BRAND.name}
          </span>
          <nav className="flex gap-4">
            <Link className="hover:text-foreground" href="/terms">
              Términos
            </Link>
            <Link className="hover:text-foreground" href="/privacy">
              Privacidad
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
