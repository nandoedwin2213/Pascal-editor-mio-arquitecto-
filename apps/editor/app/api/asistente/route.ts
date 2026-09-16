import { spawn } from 'node:child_process'
import path from 'node:path'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { assistantApiKey } from '@/lib/assistant'
import { apiGraphSchema } from '@/lib/graph-schema'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const REQUEST_TIMEOUT_MS = 240_000
const WORKER = path.join(process.cwd(), 'scripts', 'assistant-worker.ts')

const bodySchema = z.object({
  prompt: z.string().trim().min(3).max(2000),
  graph: apiGraphSchema,
})

type WorkerOutput =
  | { ok: true; result: unknown }
  | { ok: false; error: 'provider_error'; status: number }
  | { ok: false; error: 'assistant_failed'; message: string }

/**
 * The scene bridge needs the client-only core store, which Next stubs out on
 * the server, so the run happens in a Bun child process that inherits the
 * provider key from the environment. Nothing secret crosses stdin/stdout.
 */
function runWorker(input: unknown, timeoutMs: number): Promise<WorkerOutput> {
  return new Promise((resolve, reject) => {
    const child = spawn('bun', [WORKER], { stdio: ['pipe', 'pipe', 'pipe'] })
    const out: Buffer[] = []
    const err: Buffer[] = []
    let timedOut = false
    const timer = setTimeout(() => {
      timedOut = true
      child.kill()
    }, timeoutMs)

    child.stdout.on('data', (chunk: Buffer) => out.push(chunk))
    child.stderr.on('data', (chunk: Buffer) => err.push(chunk))
    child.on('error', (error) => {
      clearTimeout(timer)
      reject(error)
    })
    child.on('close', (code) => {
      clearTimeout(timer)
      if (timedOut) {
        reject(new Error('timeout'))
        return
      }
      const stdout = Buffer.concat(out).toString('utf8')
      try {
        resolve(JSON.parse(stdout) as WorkerOutput)
      } catch {
        const stderr = Buffer.concat(err).toString('utf8').trim().split('\n').at(-1) ?? ''
        reject(new Error(`worker exited with code ${code}: ${stderr}`))
      }
    })
    child.stdin.end(JSON.stringify(input))
  })
}

export async function GET() {
  return NextResponse.json({ enabled: assistantApiKey() !== null })
}

export async function POST(request: NextRequest) {
  if (!assistantApiKey()) {
    return NextResponse.json({ error: 'assistant_disabled' }, { status: 503 })
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  try {
    const output = await runWorker(parsed.data, REQUEST_TIMEOUT_MS)
    if (output.ok) return NextResponse.json(output.result)
    if (output.error === 'provider_error') {
      const status = output.status === 401 || output.status === 403 ? 502 : output.status
      return NextResponse.json({ error: 'provider_error', status }, { status: 502 })
    }
    return NextResponse.json(
      { error: 'assistant_failed', message: output.message },
      { status: 500 },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown'
    if (message === 'timeout') {
      return NextResponse.json({ error: 'timeout' }, { status: 504 })
    }
    return NextResponse.json({ error: 'assistant_failed', message }, { status: 500 })
  }
}
