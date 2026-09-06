'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Play, RotateCcw, Radio } from 'lucide-react';

/**
 * Starts a worker on one case.
 *
 * "Run" replays a recorded transcript; "Run live" calls the configured model.
 * The two are separate buttons on purpose — a pre-recorded run must never be
 * mistakable for a live one, on screen or on camera.
 */
export function InvestigateButton({
  caseId,
  size = 'md',
}: {
  caseId: string;
  size?: 'sm' | 'md';
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [busy, setBusy] = useState<'recorded' | 'live' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(live: boolean) {
    setBusy(live ? 'live' : 'recorded');
    setError(null);
    const response = await fetch(`/api/cases/${caseId}/investigate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ live, reset: true }),
    });
    const body = await response.json();
    setBusy(null);
    if (!response.ok) {
      setError(body.error ?? 'Run failed');
      return;
    }
    startTransition(() => router.refresh());
  }

  const padding = size === 'sm' ? 'px-2 py-1 text-[11px]' : 'px-3 py-1.5 text-xs';

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => run(false)}
          disabled={busy !== null}
          title="Replay the recorded transcript for this case"
          className={`inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.04] font-medium text-zinc-200 transition-colors hover:border-white/20 hover:bg-white/[0.08] disabled:opacity-40 ${padding}`}
        >
          <Play className="h-3 w-3" />
          {busy === 'recorded' ? 'Running…' : 'Run (recorded)'}
        </button>
        <button
          onClick={() => run(true)}
          disabled={busy !== null}
          title="Call the configured model for real"
          className={`inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/40 font-medium text-cyan-300 transition-colors hover:border-cyan-400/50 hover:bg-cyan-950/60 disabled:opacity-40 ${padding}`}
        >
          <Radio className="h-3 w-3" />
          {busy === 'live' ? 'Running…' : 'Run live'}
        </button>
      </div>
      {error && <p className="max-w-xs text-right text-[11px] text-rose-300">{error}</p>}
    </div>
  );
}

export function ResetButton() {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  return (
    <button
      onClick={async () => {
        setBusy(true);
        await fetch('/api/reset', { method: 'POST' });
        setBusy(false);
        startTransition(() => router.refresh());
      }}
      disabled={busy}
      title="Reset every case, decision and control pack to the frozen initial state"
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/[0.08] disabled:opacity-40"
    >
      <RotateCcw className="h-3 w-3" />
      {busy ? 'Resetting…' : 'Reset demo'}
    </button>
  );
}
