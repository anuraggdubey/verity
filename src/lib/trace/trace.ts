import { appendEvent } from '@/lib/demo/store';
import { sendRunTrace, type RunTraceMeta } from '@/lib/trace/neatlogs';

/**
 * Trace instrumentation for the worker: every model call, tool call, control
 * evaluation, block and retry, with tokens, cost and latency.
 *
 * Verity's own store is the source of truth for metrics. A trace sink (Neatlogs)
 * is an independent observability layer and never gates anything.
 */

export type TraceEntryKind = 'model' | 'tool' | 'control' | 'note';

export type TraceEntry = {
  seq: number;
  traceId: string;
  caseId: string;
  at: string;
  kind: TraceEntryKind;
  name: string;
  ok: boolean;
  ms?: number;
  tokensIn?: number;
  tokensOut?: number;
  costUsd?: number;
  detail?: string;
};

type TraceStore = Map<string, TraceEntry[]>;
type Subscriber = (entry: TraceEntry) => void;

const globalRef = globalThis as unknown as {
  __verityTraces?: TraceStore;
  __verityTraceSubscribers?: Set<Subscriber>;
};

function traces(): TraceStore {
  if (!globalRef.__verityTraces) globalRef.__verityTraces = new Map();
  return globalRef.__verityTraces;
}

function subscribers(): Set<Subscriber> {
  if (!globalRef.__verityTraceSubscribers) globalRef.__verityTraceSubscribers = new Set();
  return globalRef.__verityTraceSubscribers;
}

/** Live worker activity. Used by the SSE stream so the queue can show a run as it happens. */
export function subscribeToTraces(subscriber: Subscriber): () => void {
  subscribers().add(subscriber);
  return () => {
    subscribers().delete(subscriber);
  };
}

export class Trace {
  readonly id: string;
  readonly caseId: string;
  readonly provider: string;
  readonly model: string;
  private seq = 0;

  constructor(caseId: string, provider: string, model: string, id?: string) {
    this.caseId = caseId;
    this.provider = provider;
    this.model = model;
    this.id = id ?? `trace-${caseId.toLowerCase()}-${Date.now().toString(36)}`;
    traces().set(this.id, []);
  }

  private push(entry: Omit<TraceEntry, 'seq' | 'traceId' | 'caseId' | 'at'>): TraceEntry {
    this.seq += 1;
    const full: TraceEntry = {
      seq: this.seq,
      traceId: this.id,
      caseId: this.caseId,
      at: new Date().toISOString(),
      ...entry,
    };
    const list = traces().get(this.id) ?? [];
    list.push(full);
    traces().set(this.id, list);
    for (const subscriber of subscribers()) {
      try {
        subscriber(full);
      } catch {
        // A broken listener must never affect a run.
      }
    }
    return full;
  }

  modelCall(input: {
    tokensIn: number;
    tokensOut: number;
    costUsd: number;
    latencyMs: number;
    finishReason: string | null;
    toolCalls: string[];
  }) {
    this.push({
      kind: 'model',
      name: `${this.provider}:${this.model}`,
      ok: true,
      ms: input.latencyMs,
      tokensIn: input.tokensIn,
      tokensOut: input.tokensOut,
      costUsd: input.costUsd,
      detail:
        input.toolCalls.length > 0
          ? `tool calls: ${input.toolCalls.join(', ')}`
          : `finish: ${input.finishReason ?? 'unknown'}`,
    });
    appendEvent({
      type: 'model_call',
      at: new Date().toISOString(),
      traceId: this.id,
      caseId: this.caseId,
      tokensIn: input.tokensIn,
      tokensOut: input.tokensOut,
      costUsd: input.costUsd,
      latencyMs: input.latencyMs,
    });
  }

  toolCall(name: string, ok: boolean, ms: number, detail?: string) {
    this.push({ kind: 'tool', name, ok, ms, detail });
    appendEvent({ type: 'tool_call', at: new Date().toISOString(), traceId: this.id, tool: name, ok });
  }

  control(proposalId: string, blocked: boolean, codes: string[]) {
    this.push({
      kind: 'control',
      name: `controls:${proposalId}`,
      ok: !blocked,
      detail: blocked ? `blocked by ${codes.join(', ')}` : 'passed',
    });
  }

  note(name: string, detail: string, ok = true) {
    this.push({ kind: 'note', name, ok, detail });
  }

  entries(): TraceEntry[] {
    return traces().get(this.id) ?? [];
  }

  /**
   * Ships the finished run to the observability layer as one nested trace.
   * Called once, at the end of a run; a sink failure cannot affect the result.
   */
  finish(meta: Omit<RunTraceMeta, 'caseId' | 'provider' | 'model'>): void {
    sendRunTrace(this.entries(), {
      caseId: this.caseId,
      provider: this.provider,
      model: this.model,
      ...meta,
    });
  }
}

export function getTrace(traceId: string): TraceEntry[] {
  return traces().get(traceId) ?? [];
}

export function getTracesForCase(caseId: string): TraceEntry[] {
  return [...traces().values()]
    .flat()
    .filter((entry) => entry.caseId === caseId)
    .sort((a, b) => a.at.localeCompare(b.at) || a.seq - b.seq);
}

export function clearTraces(): void {
  traces().clear();
}
