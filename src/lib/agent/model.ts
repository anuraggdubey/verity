import OpenAI from 'openai';
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from 'openai/resources/chat/completions';

/**
 * The model seam.
 *
 * Provider-neutral request/response types so the worker never imports an SDK.
 * Two providers ship today:
 *   - `openai`  — the installed OpenAI SDK, pointed at any OpenAI-compatible
 *                 base URL (that is also how a router like TensorMux would be
 *                 wired in: set VERITY_MODEL_BASE_URL, change nothing else).
 *   - `fixture` — replays a recorded transcript with no network. Runs are
 *                 labelled `fixture` in the trace, and anything shown from a
 *                 fixture run must be called pre-recorded out loud.
 *
 * Cost is only reported when the per-1k prices are configured. An unconfigured
 * run reports 0.00 rather than a number nobody can defend.
 */

export type ToolSpec = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
};

export type ToolCall = { id: string; name: string; arguments: string };

export type AgentMessage =
  | { role: 'system'; content: string }
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string | null; toolCalls?: ToolCall[] }
  | { role: 'tool'; toolCallId: string; name: string; content: string };

export type ModelResponse = {
  text: string | null;
  toolCalls: ToolCall[];
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
  latencyMs: number;
  finishReason: string | null;
};

export interface ModelProvider {
  readonly id: 'openai' | 'fixture';
  readonly model: string;
  readonly temperature: number;
  complete(request: { messages: AgentMessage[]; tools: ToolSpec[] }): Promise<ModelResponse>;
}

export type ModelConfig = {
  provider: 'openai' | 'fixture';
  model: string;
  temperature: number;
  baseUrl?: string;
  costPer1kIn: number;
  costPer1kOut: number;
};

export function modelConfig(): ModelConfig {
  const provider = (process.env.VERITY_MODEL_PROVIDER ?? 'fixture') as ModelConfig['provider'];
  return {
    provider: provider === 'openai' ? 'openai' : 'fixture',
    model: process.env.VERITY_MODEL ?? 'gpt-4o-mini',
    temperature: Number(process.env.VERITY_MODEL_TEMPERATURE ?? '0'),
    baseUrl: process.env.VERITY_MODEL_BASE_URL || undefined,
    costPer1kIn: Number(process.env.VERITY_COST_PER_1K_IN ?? '0'),
    costPer1kOut: Number(process.env.VERITY_COST_PER_1K_OUT ?? '0'),
  };
}

/* ------------------------------------------------------------------- openai */

function supportsCustomTemperature(model: string): boolean {
  return !/^gpt-5/i.test(model);
}

function toOpenAIMessages(messages: AgentMessage[]): ChatCompletionMessageParam[] {
  return messages.map((message): ChatCompletionMessageParam => {
    switch (message.role) {
      case 'system':
        return { role: 'system', content: message.content };
      case 'user':
        return { role: 'user', content: message.content };
      case 'assistant':
        return {
          role: 'assistant',
          content: message.content,
          ...(message.toolCalls && message.toolCalls.length > 0
            ? {
                tool_calls: message.toolCalls.map((call) => ({
                  id: call.id,
                  type: 'function' as const,
                  function: { name: call.name, arguments: call.arguments },
                })),
              }
            : {}),
        };
      case 'tool':
        return { role: 'tool', tool_call_id: message.toolCallId, content: message.content };
    }
  });
}

class OpenAIProvider implements ModelProvider {
  readonly id = 'openai' as const;
  readonly model: string;
  readonly temperature: number;
  private client: OpenAI;
  private config: ModelConfig;

  constructor(config: ModelConfig) {
    const apiKey = process.env.VERITY_MODEL_API_KEY ?? process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'No model API key. Set VERITY_MODEL_API_KEY (or OPENAI_API_KEY), or run with VERITY_MODEL_PROVIDER=fixture.',
      );
    }
    this.client = new OpenAI({ apiKey, baseURL: config.baseUrl });
    this.model = config.model;
    this.temperature = config.temperature;
    this.config = config;
  }

  async complete(request: { messages: AgentMessage[]; tools: ToolSpec[] }): Promise<ModelResponse> {
    const tools: ChatCompletionTool[] = request.tools.map((tool) => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));

    const startedAt = Date.now();
    const completion = await this.client.chat.completions.create({
      model: this.model,
      // GPT-5 models only accept the default temperature; sending 0 returns 400.
      ...(supportsCustomTemperature(this.model) ? { temperature: this.temperature } : {}),
      messages: toOpenAIMessages(request.messages),
      tools,
      tool_choice: 'auto',
    });
    const latencyMs = Date.now() - startedAt;

    const choice = completion.choices[0];
    const rawToolCalls = choice?.message?.tool_calls ?? [];
    const toolCalls: ToolCall[] = rawToolCalls.flatMap((call) =>
      call.type === 'function'
        ? [{ id: call.id, name: call.function.name, arguments: call.function.arguments }]
        : [],
    );

    const tokensIn = completion.usage?.prompt_tokens ?? 0;
    const tokensOut = completion.usage?.completion_tokens ?? 0;

    return {
      text: choice?.message?.content ?? null,
      toolCalls,
      tokensIn,
      tokensOut,
      costUsd:
        (tokensIn / 1000) * this.config.costPer1kIn + (tokensOut / 1000) * this.config.costPer1kOut,
      latencyMs,
      finishReason: choice?.finish_reason ?? null,
    };
  }
}

/* ------------------------------------------------------------------ fixture */

export type FixtureTurn = { text?: string | null; toolCalls?: Omit<ToolCall, 'id'>[] };

/**
 * Replays a scripted transcript. Used by the offline demo path and by tests, so
 * the repair loop can be exercised without a key. It records zero cost and a
 * synthetic latency, and the run is labelled `fixture` everywhere it surfaces.
 */
class FixtureProvider implements ModelProvider {
  readonly id = 'fixture' as const;
  readonly model: string;
  readonly temperature: number;
  private turns: FixtureTurn[];
  private index = 0;

  constructor(config: ModelConfig, turns: FixtureTurn[]) {
    this.model = `${config.model} (fixture replay)`;
    this.temperature = config.temperature;
    this.turns = turns;
  }

  async complete(): Promise<ModelResponse> {
    const turn = this.turns[this.index];
    this.index += 1;
    if (!turn) {
      return {
        text: 'No further recorded turns.',
        toolCalls: [],
        tokensIn: 0,
        tokensOut: 0,
        costUsd: 0,
        latencyMs: 1,
        finishReason: 'stop',
      };
    }
    return {
      text: turn.text ?? null,
      toolCalls: (turn.toolCalls ?? []).map((call, i) => ({
        id: `fixture-${this.index}-${i}`,
        name: call.name,
        arguments: call.arguments,
      })),
      tokensIn: 0,
      tokensOut: 0,
      costUsd: 0,
      latencyMs: 1,
      finishReason: turn.toolCalls?.length ? 'tool_calls' : 'stop',
    };
  }
}

export function createProvider(options?: {
  config?: ModelConfig;
  fixtureTurns?: FixtureTurn[];
}): ModelProvider {
  const config = options?.config ?? modelConfig();
  if (config.provider === 'openai') return new OpenAIProvider(config);
  return new FixtureProvider(config, options?.fixtureTurns ?? []);
}
