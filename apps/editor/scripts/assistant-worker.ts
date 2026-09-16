// Runs one assistant request in a plain Bun process. The scene bridge depends
// on the client-only core store, so it cannot execute inside a Next route.
// Input: JSON { prompt, graph } on stdin. Output: JSON on stdout.
import { text } from 'node:stream/consumers'
import { AssistantError, assistantApiKey, runAssistant } from '../lib/assistant'

type WorkerOutput =
  | { ok: true; result: Awaited<ReturnType<typeof runAssistant>> }
  | { ok: false; error: 'provider_error'; status: number }
  | { ok: false; error: 'assistant_failed'; message: string }

async function main(): Promise<WorkerOutput> {
  const apiKey = assistantApiKey()
  if (!apiKey) return { ok: false, error: 'assistant_failed', message: 'missing_api_key' }
  const input = JSON.parse(await text(process.stdin)) as {
    prompt: string
    graph: Parameters<typeof runAssistant>[0]['graph']
  }
  try {
    const result = await runAssistant({ apiKey, prompt: input.prompt, graph: input.graph })
    return { ok: true, result }
  } catch (error) {
    if (error instanceof AssistantError) {
      return { ok: false, error: 'provider_error', status: error.status }
    }
    return {
      ok: false,
      error: 'assistant_failed',
      message: error instanceof Error ? error.message : 'unknown',
    }
  }
}

process.stdout.write(JSON.stringify(await main()))
