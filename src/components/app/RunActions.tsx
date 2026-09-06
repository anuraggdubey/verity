'use client';

import { useState } from 'react';
import { Play, Radio, RotateCcw } from 'lucide-react';

/**
 * Starting a worker on a case.
 *
 * "Run" replays a recorded transcript. "Run live" calls the configured model.
 * They are deliberately two buttons: a pre-recorded run must never be mistakable
 * for a live one, on screen or on camera. The response says which it was, and
 * the caller can surface that.
 */
export function RunButtons({
  caseId,
  onDone,
  compact = false,
}: {
  caseId: string;
  onDone?: () => void | Promise<void>;
  compact?: boolean;
}) {
  const [busy, setBusy] = useState<'recorded' | 'live' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(live: boolean) {
    setBusy(live ? 'live' : 'recorded');
    setError(null);
    try {
      const response = await fetch(`/api/cases/${caseId}/investigate`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ live, reset: true }),
      });
      const body = await response.json();
      if (!response.ok) {
        setError(body.error ?? 'Run failed');
        return;
      }
      await onDone?.();
    } finally {
      setBusy(null);
    }
  }

  const base = compact
    ? 'flex-1 rounded-md border py-1 text-[10px] font-medium transition-colors disabled:opacity-40'
    : 'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40';

  return (
    <div className="space-y-1">
      <div className={compact ? 'flex gap-1.5' : 'flex flex-wrap items-center gap-2'}>
        <button
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void run(false);
          }}
          disabled={busy !== null}
          title="Replay this case's recorded transcript — no model call"
          className={`${base} border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50`}
        >
          {!compact && <Play className="h-3 w-3" />}
          {busy === 'recorded' ? 'Running…' : compact ? 'Run (recorded)' : 'Run recorded'}
        </button>
        <button
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void run(true);
          }}
          disabled={busy !== null}
          title="Call the configured model for real"
          className={`${base} border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100`}
        >
          {!compact && <Radio className="h-3 w-3" />}
          {busy === 'live' ? 'Running…' : 'Run live'}
        </button>
      </div>
      {error && <p className="text-[10px] leading-snug text-rose-600">{error}</p>}
    </div>
  );
}

/** Resets every case, decision and control pack to the frozen initial state. */
export function ResetDemoButton({ onDone }: { onDone?: () => void | Promise<void> }) {
  const [busy, setBusy] = useState(false);

  return (
    <button
      onClick={async () => {
        setBusy(true);
        try {
          await fetch('/api/reset', { method: 'POST' });
          await onDone?.();
        } finally {
          setBusy(false);
        }
      }}
      disabled={busy}
      title="Reset the demo to the frozen initial state"
      className="flex items-center gap-1.5 rounded-lg border border-black/[0.08] bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:border-black/[0.12] hover:text-zinc-700 disabled:opacity-40"
    >
      <RotateCcw className="h-3.5 w-3.5" />
      {busy ? 'Resetting…' : 'Reset demo'}
    </button>
  );
}
