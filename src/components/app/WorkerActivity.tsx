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
 * Live worker activity from GET /api/stream (server-sent events).
 *
 * Every line here is an event the runtime actually emitted — a model call, a
 * tool call, a control evaluation, a block, a repair. Nothing is simulated on
 * the client; if the stream is quiet, the worker is idle.
 */
export function WorkerActivity({
  caseId,
  limit = 14,
  className = '',
}: {
  caseId?: string;
  limit?: number;
  className?: string;
}) {
  const [entries, setEntries] = useState<TraceEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const url = caseId ? `/api/stream?caseId=${encodeURIComponent(caseId)}` : '/api/stream';
    const source = new EventSource(url);

    source.addEventListener('open', () => setConnected(true));
    source.onopen = () => setConnected(true);
    source.onerror = () => setConnected(false);
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

  const icon = (entry: TraceEntry) => {
    if (entry.kind === 'model') return <Cpu className="h-3.5 w-3.5 text-cyan-400" />;
    if (entry.kind === 'tool') return <Wrench className="h-3.5 w-3.5 text-zinc-400" />;
    if (entry.kind === 'control') {
      return entry.ok ? (
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
      ) : (
        <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
      );
    }
    return <Activity className="h-3.5 w-3.5 text-zinc-500" />;
  };

  return (
    <div className={`rounded-xl border border-white/[0.08] bg-[#0c0d12] ${className}`}>
      <div className="flex items-center gap-2 border-b border-white/[0.08] bg-[#11131a] px-4 py-2.5">
        <span className="relative flex h-1.5 w-1.5">
          {connected && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
          )}
          <span
            className={`relative inline-flex h-1.5 w-1.5 rounded-full ${connected ? 'bg-cyan-400' : 'bg-zinc-600'}`}
          />
        </span>
        <h2 className="text-xs font-semibold text-zinc-200">Worker activity</h2>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
          {connected ? 'streaming' : 'disconnected'}
        </span>
      </div>

      <div ref={listRef} className="max-h-64 overflow-y-auto p-2">
        {entries.length === 0 ? (
          <p className="px-2 py-6 text-center text-[12px] text-zinc-600">
            Idle. Run a case to see tool calls, control results and repairs as they happen.
          </p>
        ) : (
          <ul className="space-y-0.5">
            {entries.map((entry) => (
              <li
                key={`${entry.traceId}-${entry.seq}`}
                className="flex items-start gap-2 rounded-md px-2 py-1.5 hover:bg-white/[0.03]"
              >
                {icon(entry)}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-[11px] text-zinc-300">
                    {entry.name}
                    {entry.ms !== undefined && (
                      <span className="text-zinc-600"> · {entry.ms}ms</span>
                    )}
                    {entry.tokensIn ? (
                      <span className="text-zinc-600">
                        {' '}
                        · {entry.tokensIn + (entry.tokensOut ?? 0)} tok
                      </span>
                    ) : null}
                  </p>
                  {entry.detail && (
                    <p className="truncate text-[11px] text-zinc-500">{entry.detail}</p>
                  )}
                </div>
                <span className="shrink-0 font-mono text-[10px] text-zinc-600">
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
