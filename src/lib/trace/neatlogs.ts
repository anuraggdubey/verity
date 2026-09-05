import type { TraceEntry } from '@/lib/trace/trace';

/**
 * Trace sink — the independent observability layer.
 *
 * STATUS: not wired to Neatlogs yet, deliberately. I have not confirmed their
 * ingest endpoint or payload shape, and inventing one would produce a sink that
 * silently drops every span. So this posts our own span JSON to whatever URL is
 * configured, and stays disabled until someone sets both variables:
 *
 *   VERITY_TRACE_INGEST_URL   full ingest URL, from Neatlogs' own docs
 *   VERITY_TRACE_API_KEY      bearer token
 *
 * Whoever wires Neatlogs: confirm the URL and payload against their docs, adjust
 * `toPayload`, and delete this note. Verity remains the enforcement layer either
 * way — a sink failure must never affect a control result, which is why every
 * send is fire-and-forget and swallows its errors.
 */

export interface TraceSink {
  readonly name: string;
  emit(entry: TraceEntry): void;
}

let warned = false;

function toPayload(entry: TraceEntry) {
  return {
    trace_id: entry.traceId,
    span_id: `${entry.traceId}-${entry.seq}`,
    name: entry.name,
    kind: entry.kind,
    timestamp: entry.at,
    duration_ms: entry.ms,
    status: entry.ok ? 'ok' : 'error',
    attributes: {
      case_id: entry.caseId,
      tokens_in: entry.tokensIn,
      tokens_out: entry.tokensOut,
      cost_usd: entry.costUsd,
      detail: entry.detail,
    },
  };
}

class HttpTraceSink implements TraceSink {
  readonly name = 'http';
  constructor(
    private url: string,
    private apiKey: string,
  ) {}

  emit(entry: TraceEntry): void {
    void fetch(this.url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(toPayload(entry)),
    }).catch(() => {
      // Observability must never affect enforcement.
    });
  }
}

export function getTraceSink(): TraceSink | null {
  const url = process.env.VERITY_TRACE_INGEST_URL;
  const apiKey = process.env.VERITY_TRACE_API_KEY;
  if (!url || !apiKey) {
    if (!warned && process.env.NODE_ENV !== 'test') {
      warned = true;
      console.info('[verity] trace sink disabled — VERITY_TRACE_INGEST_URL / VERITY_TRACE_API_KEY not set. Traces stay in-process.');
    }
    return null;
  }
  return new HttpTraceSink(url, apiKey);
}
