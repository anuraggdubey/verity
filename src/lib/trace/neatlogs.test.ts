import { describe, expect, it } from 'vitest';

import { buildRunSpans, neatlogsConfig } from '@/lib/trace/neatlogs';
import type { TraceEntry } from '@/lib/trace/trace';

const entry = (over: Partial<TraceEntry>): TraceEntry => ({
  seq: 1,
  traceId: 'trace-case-001',
  caseId: 'CASE-001',
  at: '2026-08-31T09:06:01Z',
  kind: 'note',
  name: 'note',
  ok: true,
  ...over,
});

describe('neatlogs export', () => {
  it('stays disabled until a key is configured', () => {
    const previous = { key: process.env.NEATLOGS_API_KEY, fallback: process.env.VERITY_TRACE_API_KEY };
    delete process.env.NEATLOGS_API_KEY;
    delete process.env.VERITY_TRACE_API_KEY;
    expect(neatlogsConfig()).toBeNull();

    process.env.NEATLOGS_API_KEY = 'nlw_test';
    const config = neatlogsConfig();
    expect(config?.endpoint).toBe('https://ingest.neatlogs.com/v1/trace');
    expect(config?.project).toBe('verity');

    if (previous.key) process.env.NEATLOGS_API_KEY = previous.key;
    else delete process.env.NEATLOGS_API_KEY;
    if (previous.fallback) process.env.VERITY_TRACE_API_KEY = previous.fallback;
  });

  it('maps a model call to an LLM span with token counts', () => {
    const [span] = buildRunSpans([
      entry({ kind: 'model', name: 'openai:gpt-4o-mini', ms: 7400, tokensIn: 4820, tokensOut: 640, costUsd: 0.041 }),
    ]);
    expect(span.kind).toBe('LLM');
    expect(span.model).toBe('gpt-4o-mini');
    expect(span.tokens).toEqual({ prompt: 4820, completion: 640, total: 5460 });
    expect(span.duration_ms).toBe(7400);
    expect(span.status).toBe('OK');
  });

  it('marks a blocked control as an error span carrying the codes', () => {
    const [span] = buildRunSpans([
      entry({ kind: 'control', name: 'controls:PROP-001-r1', ok: false, detail: 'blocked by VERITY-FX-003' }),
    ]);
    expect(span.status).toBe('ERROR');
    expect(span.error).toContain('VERITY-FX-003');
    expect(span.metadata?.verity_control).toBe(true);
  });

  it('maps a failed tool call to an error span', () => {
    const [span] = buildRunSpans([
      entry({ kind: 'tool', name: 'get_supporting_document', ok: false, ms: 2, detail: '{"id":"missing"}' }),
    ]);
    expect(span.kind).toBe('TOOL');
    expect(span.status).toBe('ERROR');
  });
});
