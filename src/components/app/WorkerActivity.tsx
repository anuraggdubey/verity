'use client';

import { useEffect, useRef, useState } from 'react';
import { Activity, Cpu, ShieldAlert, ShieldCheck, Wrench } from 'lucide-react';

type TraceEntry = {
  seq: number;
  traceId: string;
  caseId: string;
  at: string;
  kind: 'model' | 'tool' | 'control' | 'note';
  name: string;
  ok: boolean;
  ms?: number;
  tokensIn?: number;
  tokensOut?: number;
  costUsd?: number;
  detail?: string;
};

/**
 * Live worker activity from GET /api/stream.
 *
 * Every line is an event the runtime emitted — a model call, a tool call, a
 * control evaluation, a block, a repair. Nothing is simulated on the client: a
 * quiet panel means an idle worker.
 */
export function WorkerActivity({
  caseId,
  limit = 40,
  className = '',
}: {
  caseId?: string;
  limit?: number;
  className?: string;
}) {
  const [entries, setEntries] = useState<TraceEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // Seed from what the runtime already recorded, so a re-render (or arriving
  // after a run finished) still shows the trace instead of an empty panel.
  useEffect(() => {
    if (!caseId) return;
    let cancelled = false;
    fetch(`/api/cases/${caseId}/trace`)
      .then((response) => response.json())
      .then((body) => {
        if (cancelled) return;
        const stored = (body.entries ?? []) as TraceEntry[];
        setEntries((current) => (current.length > 0 ? current : stored.slice(-limit)));
      })
      .catch(() => {
        // The live stream is the primary source; a failed seed is not fatal.
      });
    return () => {
      cancelled = true;
    };
  }, [caseId, limit]);

  useEffect(() => {
    const url = caseId ? `/api/stream?caseId=${encodeURIComponent(caseId)}` : '/api/stream';
    const source = new EventSource(url);

    source.onopen = () => setConnected(true);
    source.onerror = () => setConnected(false);
    source.addEventListener('open', () => setConnected(true));
    source.addEventListener('trace', (event) => {
      try {
        const entry = JSON.parse((event as MessageEvent).data) as TraceEntry;
        setEntries((current) => [...current, entry].slice(-limit));
      } catch {
        // A malformed frame is not worth breaking the panel over.
      }
    });

    return () => source.close();
  }, [caseId, limit]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [entries]);

  function icon(entry: TraceEntry) {
    if (entry.kind === 'model') return <Cpu className="h-3.5 w-3.5 text-blue-600" />;
    if (entry.kind === 'tool') return <Wrench className="h-3.5 w-3.5 text-zinc-400" />;
    if (entry.kind === 'control') {
      return entry.ok ? (
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
      ) : (
        <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
      );
    }
    return <Activity className="h-3.5 w-3.5 text-zinc-400" />;
  }

  return (
    <div
      className={`rounded-xl border border-black/[0.06] bg-white overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-black/[0.06] bg-zinc-50/80 px-4 py-2.5">
        <span className="relative flex h-1.5 w-1.5">
          {connected && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
          )}
          <span
            className={`relative inline-flex h-1.5 w-1.5 rounded-full ${connected ? 'bg-blue-500' : 'bg-zinc-300'}`}
          />
        </span>
        <h5 className="text-xs font-medium text-zinc-700">Worker activity</h5>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-zinc-400">
          {connected ? 'streaming' : 'disconnected'}
        </span>
      </div>

      <div ref={listRef} className="max-h-72 overflow-y-auto p-2">
        {entries.length === 0 ? (
          <p className="px-2 py-6 text-center text-[11px] text-zinc-400">
            Idle. Run a case to see tool calls, control results and repairs as they happen.
          </p>
        ) : (
          <ul className="space-y-0.5">
            {entries.map((entry) => (
              <li
                key={`${entry.traceId}-${entry.seq}`}
                className="flex items-start gap-2 rounded-md px-2 py-1.5 hover:bg-zinc-50"
              >
                {icon(entry)}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-[11px] text-zinc-700">
                    {entry.name}
                    {entry.ms !== undefined && <span className="text-zinc-400"> · {entry.ms}ms</span>}
                    {entry.tokensIn ? (
                      <span className="text-zinc-400">
                        {' '}
                        · {entry.tokensIn + (entry.tokensOut ?? 0)} tok
                      </span>
                    ) : null}
                  </p>
                  {entry.detail && (
                    <p className="truncate text-[11px] text-zinc-400">{entry.detail}</p>
                  )}
                </div>
                <span className="shrink-0 font-mono text-[10px] text-zinc-300">
                  {entry.at.slice(11, 19)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
