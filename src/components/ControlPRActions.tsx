'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

export function ControlPRActions({
  controlPrId,
  status,
  onComplete,
}: {
  controlPrId: string;
  status: 'draft' | 'replayed' | 'merged' | 'rejected';
  onComplete?: () => void;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function call(action: 'replay' | 'merge') {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/control-prs/${controlPrId}/${action}`, { method: 'POST' });
    const body = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(body.error ?? `${action} failed`);
      return;
    }
    onComplete?.();
    startTransition(() => router.refresh());
  }

  if (status === 'merged') {
    return (
      <p className="text-sm text-emerald-300">
        Merged. The control pack is versioned and every later proposal is evaluated against it.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          disabled={busy}
          onClick={() => call('replay')}
          className="rounded-md border border-line px-3 py-1.5 text-sm hover:border-zinc-600 disabled:opacity-40"
        >
          Run replay
        </button>
        <button
          disabled={busy || status !== 'replayed'}
          onClick={() => call('merge')}
          className="rounded-md bg-violet-500/90 px-3 py-1.5 text-sm font-medium text-violet-950 hover:bg-violet-400 disabled:opacity-40 disabled:cursor-not-allowed"
          title={status !== 'replayed' ? 'Replay must run before merge' : undefined}
        >
          Merge control pack
        </button>
      </div>
      {error && <p className="text-sm text-rose-300">{error}</p>}
    </div>
  );
}
