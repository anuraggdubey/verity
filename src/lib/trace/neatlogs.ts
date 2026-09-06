import type { TraceEntry } from '@/lib/trace/trace';

/**
 * Neatlogs — the independent observability layer.
 *
 * Wired to Neatlogs' documented HTTP trace ingest:
 *   POST https://ingest.neatlogs.com/v1/trace
 *   Authorization: Bearer <write key>
 *   { name, project, kind, input, output, model, tokens, status, duration_ms,
 *     children[], attributes, metadata, logs[] }
 *
 * One Verity worker run becomes one Neatlogs trace: the case is the workflow,
 * and each model call, tool call and control evaluation is a child span. The
 * whole run is posted once, when it finishes, so a trace is never half-written.
 *
 * Verity remains the enforcement layer. Neatlogs is read-only observability:
 * every send is fire-and-forget and swallows its own errors, because a sink
 * outage must never change a control result.
 *
 * Enable it with:
 *   NEATLOGS_API_KEY=nlw_...        (ingest-only write key)
 *   NEATLOGS_PROJECT=verity         (optional, defaults to "verity")
 *   NEATLOGS_ENDPOINT=...           (optional, defaults to the URL above)
 *   NEATLOGS_DRY_RUN=true           (print the payload instead of sending it)
 */

const DEFAULT_ENDPOINT = 'https://ingest.neatlogs.com/v1/trace';

/** Warn once per process about a failing sink, not once per run. */
let rejectionWarned = false;

export type NeatlogsConfig = {
  apiKey: string;
  endpoint: string;
  project: string;
};

export function neatlogsConfig(): NeatlogsConfig | null {
  const apiKey = process.env.NEATLOGS_API_KEY ?? process.env.VERITY_TRACE_API_KEY;
  if (!apiKey) return null;
  return {
    apiKey,
    endpoint: process.env.NEATLOGS_ENDPOINT ?? process.env.VERITY_TRACE_INGEST_URL ?? DEFAULT_ENDPOINT,
    project: process.env.NEATLOGS_PROJECT ?? 'verity',
  };
}

export function neatlogsEnabled(): boolean {
  return neatlogsConfig() !== null;
}

type Span = {
  name: string;
  kind?: string;
  model?: string;
  input?: unknown;
  output?: unknown;
  tokens?: { prompt: number; completion: number; total: number };
  status?: 'OK' | 'ERROR';
  error?: string;
  duration_ms?: number;
  metadata?: Record<string, unknown>;
};

function toSpan(entry: TraceEntry): Span {
  const status: 'OK' | 'ERROR' = entry.ok ? 'OK' : 'ERROR';

  if (entry.kind === 'model') {
    return {
      name: entry.name,
      kind: 'LLM',
      model: entry.name.replace(/^[^:]*:/, ''),
      output: entry.detail,
      tokens:
        entry.tokensIn !== undefined
          ? {
              prompt: entry.tokensIn,
              completion: entry.tokensOut ?? 0,
              total: entry.tokensIn + (entry.tokensOut ?? 0),
            }
          : undefined,
      status,
      duration_ms: entry.ms,
      metadata: { cost_usd: entry.costUsd },
    };
  }

  if (entry.kind === 'tool') {
    return {
      name: entry.name,
      kind: 'TOOL',
      input: entry.detail,
      status,
      duration_ms: entry.ms,
    };
  }

  if (entry.kind === 'control') {
    // The control result is the whole point of the run, so it is a first-class
    // span with the blocking codes in the output, not a log line.
    return {
      name: entry.name,
      kind: 'TOOL',
      output: entry.detail,
      status,
      error: entry.ok ? undefined : entry.detail,
      metadata: { verity_control: true },
    };
  }

  return { name: entry.name, kind: 'SPAN', output: entry.detail, status };
}

export type RunTraceMeta = {
  caseId: string;
  provider: string;
  model: string;
  /** True when the run replayed a recorded transcript instead of calling a model. */
  preRecorded: boolean;
  policyVersion?: string;
  controlPackVersion?: string;
  corePromptHash?: string;
  outcome?: string;
};

/** Posts one finished run. Never throws, never blocks the caller. */
export function sendRunTrace(entries: TraceEntry[], meta: RunTraceMeta): void {
  const config = neatlogsConfig();
  if (!config || entries.length === 0) return;

  const totalTokens = entries.reduce(
    (sum, entry) => sum + (entry.tokensIn ?? 0) + (entry.tokensOut ?? 0),
    0,
  );
  const totalCost = entries.reduce((sum, entry) => sum + (entry.costUsd ?? 0), 0);
  const blocked = entries.filter((entry) => entry.kind === 'control' && !entry.ok);

  const payload = {
    name: `reconciliation ${meta.caseId}`,
    project: config.project,
    kind: 'AGENT',
    // The run itself succeeded even when a control blocked a revision: a block
    // is a correct outcome, not a system error.
    status: 'OK',
    duration_ms: entries.reduce((sum, entry) => sum + (entry.ms ?? 0), 0),
    children: entries.map(toSpan),
    attributes: {
      'neatlogs.workflow': 'bank_reconciliation',
      'neatlogs.session_id': entries[0]?.traceId,
    },
    metadata: {
      case_id: meta.caseId,
      provider: meta.provider,
      model: meta.model,
      // Recorded runs are labelled here too, so an observability dashboard can
      // never make a replay look like live agent behaviour.
      pre_recorded: meta.preRecorded,
      policy_version: meta.policyVersion,
      control_pack_version: meta.controlPackVersion,
      core_prompt_hash: meta.corePromptHash,
      outcome: meta.outcome,
      controls_blocked: blocked.length,
      total_tokens: totalTokens,
      total_cost_usd: Number(totalCost.toFixed(6)),
      benchmark_is_synthetic: true,
    },
    logs: entries
      .filter((entry) => entry.kind === 'note')
      .map((entry) => ({
        level: entry.ok ? 'info' : 'warn',
        message: `${entry.name}: ${entry.detail ?? ''}`,
        timestamp: entry.at,
      })),
  };

  // Dry run prints the exact body instead of posting it, so the payload can be
  // reviewed against Neatlogs' schema before anyone has a key.
  if (process.env.NEATLOGS_DRY_RUN === 'true') {
    console.log('[neatlogs dry-run]', JSON.stringify(payload, null, 2));
    return;
  }

  void fetch(config.endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(payload),
  })
    .then((response) => {
      // Still fire-and-forget — nothing here can change a control result — but
      // a rejected trace is now audible. Silent drops would mean an empty
      // dashboard that nobody notices until someone goes looking for evidence.
      if (!response.ok && !rejectionWarned) {
        rejectionWarned = true;
        console.warn(
          `[verity] Neatlogs rejected a trace: HTTP ${response.status}. Traces are not being recorded. Check NEATLOGS_API_KEY and NEATLOGS_ENDPOINT, then run npm run neatlogs:check.`,
        );
      }
    })
    .catch((error: unknown) => {
      if (!rejectionWarned) {
        rejectionWarned = true;
        console.warn(
          `[verity] Neatlogs trace failed to send: ${error instanceof Error ? error.message : 'unknown error'}. Enforcement is unaffected.`,
        );
      }
    });
}

/** Exposed for tests: the child spans we would send for a run. */
export function buildRunSpans(entries: TraceEntry[]): Span[] {
  return entries.map(toSpan);
}
