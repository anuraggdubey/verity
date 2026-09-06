'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Check, GitMerge, PlayCircle, Sparkles, X } from 'lucide-react';

/**
 * Control PR actions.
 *
 * Draft is derived from controller rejections — it refuses when fewer than two
 * exist, or when no constrained-rule schema can express the failure. Replay runs
 * the rule over the stored proposals. Merge is refused until replay is clean:
 * every supporting failure caught, every counterexample still allowed.
 */
export function DraftControlPRButton({ reasonCode }: { reasonCode?: string }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={async () => {
          setBusy(true);
          setError(null);
          const response = await fetch('/api/control-prs', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(reasonCode ? { reasonCode } : {}),
          });
          const body = await response.json();
          setBusy(false);
          if (!response.ok) {
            setError(body.error ?? 'Draft failed');
            return;
          }
          startTransition(() => router.refresh());
        }}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-950/40 px-3 py-1.5 text-xs font-medium text-violet-200 transition-colors hover:border-violet-400/50 hover:bg-violet-950/60 disabled:opacity-40"
      >
        <Sparkles className="h-3 w-3" />
        {busy ? 'Drafting…' : 'Draft Control PR'}
      </button>
      {error && <p className="max-w-sm text-right text-[11px] text-rose-300">{error}</p>}
    </div>
  );
}

export function ControlPRActions({
  controlPrId,
  status,
}: {
  controlPrId: string;
  status: 'draft' | 'replayed' | 'merged' | 'rejected';
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [busy, setBusy] = useState<'replay' | 'merge' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function call(action: 'replay' | 'merge') {
    setBusy(action);
    setError(null);
    const response = await fetch(`/api/control-prs/${controlPrId}/${action}`, { method: 'POST' });
    const body = await response.json();
    setBusy(null);
    if (!response.ok) {
      setError(body.error ?? `${action} failed`);
      return;
    }
    startTransition(() => router.refresh());
  }

  if (status === 'merged') {
    return (
      <p className="inline-flex items-center gap-1.5 text-xs text-emerald-300">
        <Check className="h-3.5 w-3.5" />
        Merged. Every proposal from here is evaluated against this rule.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => call('replay')}
          disabled={busy !== null}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:border-white/20 hover:bg-white/[0.08] disabled:opacity-40"
        >
          <PlayCircle className="h-3 w-3" />
          {busy === 'replay' ? 'Replaying…' : 'Run replay'}
        </button>
        <button
          onClick={() => call('merge')}
          disabled={busy !== null || status !== 'replayed'}
          title={status !== 'replayed' ? 'Replay has to run first' : undefined}
          className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-950/40 px-3 py-1.5 text-xs font-medium text-violet-200 transition-colors hover:border-violet-400/50 hover:bg-violet-950/60 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <GitMerge className="h-3 w-3" />
          {busy === 'merge' ? 'Merging…' : 'Merge control pack'}
        </button>
      </div>
      {error && (
        <p className="inline-flex items-start gap-1.5 text-[11px] text-rose-300">
          <X className="mt-0.5 h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
