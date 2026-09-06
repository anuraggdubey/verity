import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from 'openai/resources/chat/completions';

/**
 * The model seam.
 *
 * Provider-neutral request/response types so the worker never imports an SDK.
 * Three providers ship today:
 *   - `anthropic` — the official Anthropic SDK. Default model claude-opus-5,
 *                 where adaptive thinking is on by default and sampling
 *                 parameters are rejected, so none are sent.
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
  | {
      role: 'assistant';
      content: string | null;
      toolCalls?: ToolCall[];
      /**
       * The provider's original content blocks. Anthropic models return thinking
       * blocks that must be echoed back unchanged on the next turn, so the
       * neutral message carries them opaquely rather than losing them.
       */
      raw?: unknown;
    }
  | { role: 'tool'; toolCallId: string; name: string; content: string };

export type ModelResponse = {
  text: string | null;
  toolCalls: ToolCall[];
  /** Provider-native content blocks, replayed verbatim on the next turn. */
  raw?: unknown;
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
  latencyMs: number;
  finishReason: string | null;
};

export interface ModelProvider {
  readonly id: 'anthropic' | 'openai' | 'groq' | 'fixture';
  readonly model: string;
  readonly temperature: number;
  complete(request: { messages: AgentMessage[]; tools: ToolSpec[] }): Promise<ModelResponse>;
}

export type ModelConfig = {
  provider: 'anthropic' | 'openai' | 'groq' | 'fixture';
  model: string;
  temperature: number;
  baseUrl?: string;
  costPer1kIn: number;
  costPer1kOut: number;
};

const DEFAULT_MODELS: Record<ModelConfig['provider'], string> = {
  anthropic: 'claude-opus-5',
  openai: 'gpt-4o-mini',
  groq: 'llama-3.3-70b-versatile',
  fixture: 'recorded-transcript',
};

export function modelConfig(): ModelConfig {
  const requested = (process.env.VERITY_MODEL_PROVIDER ?? 'fixture') as ModelConfig['provider'];
  const provider: ModelConfig['provider'] =
    requested === 'anthropic' || requested === 'openai' || requested === 'groq' ? requested : 'fixture';
  return {
    provider,
    model: process.env.VERITY_MODEL ?? DEFAULT_MODELS[provider],
    temperature: Number(process.env.VERITY_MODEL_TEMPERATURE ?? '0'),
    baseUrl: process.env.VERITY_MODEL_BASE_URL || (provider === 'groq' ? 'https://api.groq.com/openai/v1' : undefined),
    costPer1kIn: Number(process.env.VERITY_COST_PER_1K_IN ?? '0'),
    costPer1kOut: Number(process.env.VERITY_COST_PER_1K_OUT ?? '0'),
  };
}


/**
 * Resolve the provider for a live run: whatever VERITY_MODEL_PROVIDER names.
 * Live must not hardcode a vendor — the model seam exists precisely so the
 * provider is configuration.
 */
export function liveProvider(config: ModelConfig): ModelConfig {
  if (config.provider === 'fixture') {
    throw new Error(
      'A live run needs VERITY_MODEL_PROVIDER set to anthropic, openai, or groq (see .env.example).',
    );
  }
  return config;
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

/* --------------------------------------------------------------------- groq */

/**
 * Groq Provider (ultra-fast inference for Llama, Mixtral, DeepSeek).
 * Operates over OpenAI-compatible endpoints with high throughput.
 */
class GroqProvider implements ModelProvider {
  readonly id = 'groq' as const;
  readonly model: string;
  readonly temperature: number;
  private client: OpenAI;
  private config: ModelConfig;

  constructor(config: ModelConfig) {
    const apiKey =
      process.env.GROQ_API_KEY ??
      process.env.VERITY_MODEL_API_KEY ??
      process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'No Groq API key found. Set GROQ_API_KEY or VERITY_MODEL_API_KEY in .env, or run with VERITY_MODEL_PROVIDER=fixture.',
      );
    }
    this.client = new OpenAI({
      apiKey,
      baseURL: config.baseUrl ?? 'https://api.groq.com/openai/v1',
    });
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
      temperature: this.temperature,
      messages: toOpenAIMessages(request.messages),
      tools: tools.length > 0 ? tools : undefined,
      tool_choice: tools.length > 0 ? 'auto' : undefined,
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

/* ---------------------------------------------------------------- anthropic */

/**
 * Native Anthropic provider.
 *
 * Three model-specific rules are honoured here rather than discovered at
 * runtime, per the Claude API reference:
 *   - claude-opus-5 runs adaptive thinking by default. Thinking blocks come
 *     back in the response and must be echoed unchanged on the next turn, so
 *     the assistant message carries the raw blocks and they are replayed.
 *   - Sampling parameters (temperature, top_p, top_k) are rejected with a 400
 *     on this model family, so none are sent — VERITY_MODEL_TEMPERATURE is
 *     recorded in the fingerprint but not transmitted.
 *   - The system prompt is a top-level parameter, not a message.
 */
class AnthropicProvider implements ModelProvider {
  readonly id = 'anthropic' as const;
  readonly model: string;
  readonly temperature: number;
  private client: Anthropic;
  private config: ModelConfig;

  constructor(config: ModelConfig) {
    const apiKey =
      process.env.VERITY_MODEL_API_KEY ?? process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        'No model API key. Set ANTHROPIC_API_KEY (or VERITY_MODEL_API_KEY), or run with VERITY_MODEL_PROVIDER=fixture.',
      );
    }
    this.client = new Anthropic({ apiKey, baseURL: config.baseUrl });
    this.model = config.model;
    this.temperature = config.temperature;
    this.config = config;
  }

  async complete(request: { messages: AgentMessage[]; tools: ToolSpec[] }): Promise<ModelResponse> {
    const system = request.messages
      .filter((message): message is Extract<AgentMessage, { role: 'system' }> => message.role === 'system')
      .map((message) => message.content)
      .join('\n\n');

    const messages: Anthropic.MessageParam[] = [];
    for (const message of request.messages) {
      switch (message.role) {
        case 'system':
          break;
        case 'user':
          messages.push({ role: 'user', content: message.content });
          break;
        case 'assistant': {
          // Replay the original blocks when we have them: thinking blocks must
          // go back unchanged, and dropping them invalidates the turn.
          if (Array.isArray(message.raw) && message.raw.length > 0) {
            messages.push({ role: 'assistant', content: message.raw as Anthropic.ContentBlockParam[] });
            break;
          }
          const blocks: Anthropic.ContentBlockParam[] = [];
          if (message.content) blocks.push({ type: 'text', text: message.content });
          for (const call of message.toolCalls ?? []) {
            blocks.push({
              type: 'tool_use',
              id: call.id,
              name: call.name,
              input: safeParse(call.arguments),
            });
          }
          if (blocks.length > 0) messages.push({ role: 'assistant', content: blocks });
          break;
        }
        case 'tool': {
          const block: Anthropic.ToolResultBlockParam = {
            type: 'tool_result',
            tool_use_id: message.toolCallId,
            content: message.content,
          };
          // Consecutive tool results belong in one user message, or the model
          // learns to stop issuing parallel calls.
          const previous = messages[messages.length - 1];
          if (previous?.role === 'user' && Array.isArray(previous.content)) {
            (previous.content as Anthropic.ContentBlockParam[]).push(block);
          } else {
            messages.push({ role: 'user', content: [block] });
          }
          break;
        }
      }
    }

    const tools: Anthropic.Tool[] = request.tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.parameters as Anthropic.Tool.InputSchema,
    }));

    const startedAt = Date.now();
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 16000,
      system,
      messages,
      tools,
    });
    const latencyMs = Date.now() - startedAt;

    const toolCalls: ToolCall[] = response.content
      .filter((block): block is Anthropic.ToolUseBlock => block.type === 'tool_use')
      .map((block) => ({
        id: block.id,
        name: block.name,
        arguments: JSON.stringify(block.input ?? {}),
      }));

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim();

    const tokensIn = response.usage.input_tokens ?? 0;
    const tokensOut = response.usage.output_tokens ?? 0;

    return {
      text: text.length > 0 ? text : null,
      toolCalls,
      raw: response.content,
      tokensIn,
      tokensOut,
      costUsd:
        (tokensIn / 1000) * this.config.costPer1kIn + (tokensOut / 1000) * this.config.costPer1kOut,
      latencyMs,
      finishReason: response.stop_reason,
    };
  }
}

function safeParse(input: string): Record<string, unknown> {
  try {
    return JSON.parse(input || '{}') as Record<string, unknown>;
  } catch {
    return {};
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
  if (config.provider === 'anthropic') return new AnthropicProvider(config);
  if (config.provider === 'openai') return new OpenAIProvider(config);
  if (config.provider === 'groq') return new GroqProvider(config);
  return new FixtureProvider(config, options?.fixtureTurns ?? []);
}
