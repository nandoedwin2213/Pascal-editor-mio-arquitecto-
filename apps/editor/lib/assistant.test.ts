import { afterEach, describe, expect, test } from 'bun:test'
import { SceneBridge } from '../../../packages/mcp/src/bridge/scene-bridge'
import { createSceneOperations } from '../../../packages/mcp/src/operations/scene-operations'
import { AssistantError, type RunAssistantOptions, runAssistant } from './assistant'

const KEY = 'test-key'
const EMPTY_GRAPH = { nodes: {}, rootNodeIds: [] }

// Other test files in this process mock.module('@pascal-app/mcp/operations'),
// so build the real operations from source and inject them.
function run(prompt: string, overrides: Partial<RunAssistantOptions> = {}) {
  return runAssistant({
    apiKey: KEY,
    prompt,
    graph: EMPTY_GRAPH,
    operations: createSceneOperations({ bridge: new SceneBridge() }),
    ...overrides,
  })
}

type Turn = { content: unknown[]; stop_reason: string }

function mockAnthropic(turns: Turn[]) {
  const requests: Array<{ headers: Headers; body: Record<string, unknown> }> = []
  let index = 0
  globalThis.fetch = (async (_url: string | URL | Request, init?: RequestInit) => {
    requests.push({
      headers: new Headers(init?.headers),
      body: JSON.parse(String(init?.body)) as Record<string, unknown>,
    })
    const turn = turns[Math.min(index, turns.length - 1)]
    index += 1
    return new Response(JSON.stringify(turn), { status: 200 })
  }) as typeof fetch
  return requests
}

const realFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = realFetch
})

describe('runAssistant', () => {
  test('sends the API key server-side and exposes scene tools without export/vision ones', async () => {
    const requests = mockAnthropic([
      { content: [{ type: 'text', text: 'Listo.' }], stop_reason: 'end_turn' },
    ])
    const result = await run('hola')

    expect(result.summary).toBe('Listo.')
    expect(result.steps).toEqual([])
    expect(requests).toHaveLength(1)
    expect(requests[0].headers.get('x-api-key')).toBe(KEY)
    const names = (requests[0].body.tools as Array<{ name: string }>).map((tool) => tool.name)
    expect(names).toContain('create_house_from_brief')
    expect(names).toContain('validate_scene')
    expect(names).not.toContain('export_glb')
    expect(names).not.toContain('analyze_floorplan_image')
  })

  test('executes tool calls against the scene and returns the mutated graph', async () => {
    mockAnthropic([
      {
        content: [
          {
            type: 'tool_use',
            id: 'tu_1',
            name: 'create_house_from_brief',
            input: { brief: 'Casa compacta de dos dormitorios', bedroomCount: 2 },
          },
        ],
        stop_reason: 'tool_use',
      },
      { content: [{ type: 'text', text: 'Creé la casa.' }], stop_reason: 'end_turn' },
    ])
    const result = await run('crea una casa')

    expect(result.steps).toEqual([{ tool: 'create_house_from_brief', ok: true }])
    expect(result.summary).toBe('Creé la casa.')
    expect(Object.keys(result.graph.nodes).length).toBeGreaterThan(0)
  })

  test('reports failed tools to the model instead of aborting', async () => {
    const requests = mockAnthropic([
      {
        content: [
          { type: 'tool_use', id: 'tu_1', name: 'delete_node', input: { id: 'no-existe' } },
        ],
        stop_reason: 'tool_use',
      },
      { content: [{ type: 'text', text: 'No existe.' }], stop_reason: 'end_turn' },
    ])
    const result = await run('borra algo')

    expect(result.steps).toEqual([{ tool: 'delete_node', ok: false }])
    const followUp = requests[1].body.messages as Array<{ content: unknown }>
    const toolResult = (followUp.at(-1)?.content as Array<{ is_error?: boolean }>)[0]
    expect(toolResult.is_error).toBe(true)
  })

  test('surfaces provider errors with their status', async () => {
    globalThis.fetch = (async () =>
      new Response('rate limited', { status: 429 })) as unknown as typeof fetch
    const error = await run('hola').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(AssistantError)
    expect((error as AssistantError).status).toBe(429)
  })
})
