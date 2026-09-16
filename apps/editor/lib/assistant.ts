import type { SceneGraph } from '@pascal-app/core'
import type { SceneOperations } from '@pascal-app/mcp/operations'

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_VERSION = '2023-06-01'
const DEFAULT_MODEL = 'claude-sonnet-4-5'
const MAX_STEPS = 24
const MAX_TOKENS = 4096
const MAX_TOOL_RESULT_CHARS = 12_000

/** Tools that need files, exports, or persistence the in-request bridge lacks. */
const EXCLUDED_TOOLS = new Set([
  'export_glb',
  'export_json',
  'analyze_floorplan_image',
  'analyze_room_photo',
])

const SYSTEM_PROMPT = `Eres el asistente de diseño de Quinde, un editor 3D de arquitectura de Berriot Corp (Ecuador).
La escena actual del usuario ya está cargada; modifícala con las herramientas disponibles.
Reglas:
- Trabaja en metros. Si el usuario no da medidas, usa dimensiones habituales de vivienda ecuatoriana (dormitorio 3x3.5 m, baño 2x2.5 m, sala 4x5 m, alturas 2.7 m).
- Para una casa completa usa create_house_from_brief o create_story_shell + create_room + add_door + add_window + create_roof.
- Toda casa nueva debe tener cubierta (create_roof si la plantilla no la creó).
- Toda casa o habitación nueva debe quedar amueblada: después de crearla, llama furnish_room en cada habitación (dormitorios, baños, sala, cocina) salvo que el usuario pida lo contrario. Si furnish_room falla en alguna, usa place_item con search_assets.
- Para cambios puntuales usa herramientas semánticas (create_room, add_door, add_window, furnish_room, place_item, create_wall) antes que apply_patch.
- Consulta el estado con get_scene / list_levels / get_walls cuando necesites ids o posiciones.
- Nunca borres elementos que el usuario no pidió quitar.
- Termina siempre con validate_scene y corrige errores evidentes.
- No llames create_project ni save_scene; el editor guarda solo.
Responde al final en español, en 2-4 frases, con lo que construiste y cualquier limitación. Sin listas largas ni JSON.`

export type AssistantStep = { tool: string; ok: boolean }

export type AssistantResult = {
  graph: SceneGraph
  summary: string
  steps: AssistantStep[]
}

export function assistantApiKey(): string | null {
  const key = process.env.ANTHROPIC_API_KEY
  return key ? key : null
}

type AnthropicTool = { name: string; description?: string; input_schema: unknown }

type ContentBlock =
  | { type: 'text'; text: string }
  | { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> }
  | { type: 'tool_result'; tool_use_id: string; content: string; is_error?: boolean }

type Message = { role: 'user' | 'assistant'; content: string | ContentBlock[] }

type AnthropicResponse = {
  content: ContentBlock[]
  stop_reason: 'end_turn' | 'tool_use' | 'max_tokens' | 'stop_sequence'
}

type McpToolResult = {
  isError?: boolean
  content?: Array<{ type: string; text?: string }>
  structuredContent?: unknown
}

export type RunAssistantOptions = {
  apiKey: string
  prompt: string
  graph: SceneGraph
  signal?: AbortSignal
  /** Scene operations to drive; defaults to a fresh in-memory bridge. */
  operations?: SceneOperations
}

/**
 * Runs one prompt against a private in-memory copy of the scene: the MCP
 * server exposes the scene tools, the model drives them, and the mutated
 * graph is returned for the browser to apply.
 */
export async function runAssistant({
  apiKey,
  prompt,
  graph,
  signal,
  operations,
}: RunAssistantOptions): Promise<AssistantResult> {
  const [
    { SceneBridge },
    { createSceneOperations },
    { createPascalMcpServer },
    { Client },
    { InMemoryTransport },
  ] = await Promise.all([
    import('@pascal-app/mcp/bridge'),
    import('@pascal-app/mcp/operations'),
    import('@pascal-app/mcp/server'),
    import('@modelcontextprotocol/sdk/client/index.js'),
    import('@modelcontextprotocol/sdk/inMemory.js'),
  ])

  const bridge = new SceneBridge()
  const ops = operations ?? createSceneOperations({ bridge })
  ops.loadJSON(graph)
  const server = createPascalMcpServer({ bridge, operations: ops })
  const [serverTransport, clientTransport] = InMemoryTransport.createLinkedPair()
  const client = new Client({ name: 'quinde-asistente', version: '1.0.0' })
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)])

  try {
    const { tools } = await client.listTools()
    const anthropicTools: AnthropicTool[] = tools
      .filter((tool) => !EXCLUDED_TOOLS.has(tool.name))
      .map((tool) => ({
        name: tool.name,
        description: tool.description,
        input_schema: tool.inputSchema,
      }))

    const messages: Message[] = [{ role: 'user', content: prompt }]
    const steps: AssistantStep[] = []
    let summary = ''

    for (let step = 0; step < MAX_STEPS; step++) {
      const response = await callAnthropic(apiKey, anthropicTools, messages, signal)
      messages.push({ role: 'assistant', content: response.content })

      const toolUses = response.content.filter(
        (block): block is Extract<ContentBlock, { type: 'tool_use' }> => block.type === 'tool_use',
      )
      const text = response.content
        .filter((block): block is Extract<ContentBlock, { type: 'text' }> => block.type === 'text')
        .map((block) => block.text)
        .join('\n')
        .trim()
      if (text) summary = text

      if (response.stop_reason !== 'tool_use' || toolUses.length === 0) break

      const results: ContentBlock[] = []
      for (const use of toolUses) {
        const result = (await client.callTool({
          name: use.name,
          arguments: use.input,
        })) as McpToolResult
        const ok = !result.isError
        steps.push({ tool: use.name, ok })
        results.push({
          type: 'tool_result',
          tool_use_id: use.id,
          content: toolResultText(result),
          is_error: ok ? undefined : true,
        })
      }
      messages.push({ role: 'user', content: results })
    }

    return { graph: ops.exportSceneGraph(), summary, steps }
  } finally {
    await Promise.all([client.close(), server.close()])
  }
}

async function callAnthropic(
  apiKey: string,
  tools: AnthropicTool[],
  messages: Message[],
  signal?: AbortSignal,
): Promise<AnthropicResponse> {
  const response = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    signal,
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      ...(process.env.ANTHROPIC_WORKSPACE_ID
        ? { 'anthropic-workspace-id': process.env.ANTHROPIC_WORKSPACE_ID }
        : {}),
    },
    body: JSON.stringify({
      model: process.env.QUINDE_AI_MODEL || DEFAULT_MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      tools,
      messages,
    }),
  })
  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new AssistantError(response.status, detail.slice(0, 500))
  }
  return (await response.json()) as AnthropicResponse
}

function toolResultText(result: McpToolResult): string {
  const text = (result.content ?? [])
    .map((block) => (block.type === 'text' && block.text ? block.text : ''))
    .filter(Boolean)
    .join('\n')
  const full = text || (result.structuredContent ? JSON.stringify(result.structuredContent) : 'ok')
  return full.length > MAX_TOOL_RESULT_CHARS
    ? `${full.slice(0, MAX_TOOL_RESULT_CHARS)}\n…[truncado]`
    : full
}

export class AssistantError extends Error {
  readonly status: number
  constructor(status: number, detail: string) {
    super(`Anthropic ${status}: ${detail}`)
    this.status = status
  }
}
