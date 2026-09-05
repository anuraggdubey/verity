'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import type { ControllerDecision, RejectReasonCode } from '@/lib/contracts/types';
import { cn } from '@/lib/ui';

const REASON_CODES: { code: RejectReasonCode; label: string }[] = [
  { code: 'UNSUPPORTED_FX_SOURCE', label: 'FX source not approved' },
  { code: 'WRONG_RATE_DATE', label: 'Wrong FX rate date' },
  { code: 'MISSING_EVIDENCE', label: 'Missing evidence' },
  { code: 'WRONG_ACCOUNT', label: 'Wrong account' },
  { code: 'WRONG_ENTITY', label: 'Wrong entity' },
  { code: 'DUPLICATE_POSTING', label: 'Duplicate posting' },
  { code: 'CLOSED_PERIOD', label: 'Closed period' },
  { code: 'INSUFFICIENT_NARRATIVE', label: 'Insufficient narrative' },
  { code: 'OTHER', label: 'Other' },
];

/**
 * Controller merge gate. Reject requires a reason code — that code is what
 * Builder B's failure grouping reads, so it is a required field, not a nicety.
 */
export function DecisionPanel({
  proposalId,
  blocked,
  decision,
}: {
  proposalId: string;
  blocked: boolean;
  decision?: ControllerDecision;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [mode, setMode] = useState<'idle' | 'rejecting'>('idle');
  const [reasonCode, setReasonCode] = useState<RejectReasonCode>('WRONG_RATE_DATE');
  const [rationale, setRationale] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (decision) {
    return (
      <div className="rounded-md border border-line p-3 text-sm">
        <p>
          <span
            className={cn(
              'font-semibold',
              decision.decision === 'approve' ? 'text-emerald-300' : 'text-rose-300',
            )}
          >
            {decision.decision === 'approve' ? 'Approved' : 'Rejected'}
          </span>{' '}
          by {decision.decidedBy} at {decision.decidedAt.replace('T', ' ').slice(0, 19)}
        </p>
        {decision.reasonCode && (
          <p className="mt-1 text-zinc-400">
            Reason code: <span className="font-mono text-[12px]">{decision.reasonCode}</span>
          </p>
        )}
        {decision.rationale && <p className="mt-1 text-zinc-400">{decision.rationale}</p>}
      </div>
    );
  }

  async function send(kind: 'approve' | 'reject') {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/proposals/${proposalId}/decision`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        decision: kind,
        reasonCode: kind === 'reject' ? reasonCode : undefined,
        rationale: rationale || undefined,
      }),
    });
    const body = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(body.error ?? 'Decision failed');
      return;
    }
    setMode('idle');
    setRationale('');
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-3">
      {blocked && (
        <p className="rounded-md border border-rose-500/40 bg-rose-500/5 px-3 py-2 text-sm text-rose-300">
          Controls are blocking this revision. It cannot be approved until the agent repairs it.
        </p>
      )}

      {mode === 'idle' ? (
        <div className="flex flex-wrap gap-2">
          <button
            disabled={blocked || busy}
            onClick={() => send('approve')}
            className="rounded-md bg-emerald-500/90 px-3 py-1.5 text-sm font-medium text-emerald-950 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Approve and post to sandbox ledger
          </button>
          <button
            disabled={busy}
            onClick={() => setMode('rejecting')}
            className="rounded-md border border-line px-3 py-1.5 text-sm hover:border-zinc-600 disabled:opacity-40"
          >
            Request changes
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <label className="block text-[11px] uppercase tracking-wide text-zinc-500">
            Reason code (required)
          </label>
          <select
            value={reasonCode}
            onChange={(e) => setReasonCode(e.target.value as RejectReasonCode)}
            className="w-full rounded-md border border-line bg-zinc-900 px-3 py-2 text-sm"
          >
            {REASON_CODES.map((r) => (
              <option key={r.code} value={r.code}>
                {r.label}
              </option>
            ))}
          </select>
          <label className="block text-[11px] uppercase tracking-wide text-zinc-500">
            Rationale
          </label>
          <textarea
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            rows={3}
            placeholder="What the preparer must change, in your words."
            className="w-full rounded-md border border-line bg-zinc-900 px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button
              disabled={busy}
              onClick={() => send('reject')}
              className="rounded-md bg-rose-500/90 px-3 py-1.5 text-sm font-medium text-rose-950 hover:bg-rose-400 disabled:opacity-40"
            >
              Submit rejection
            </button>
            <button
              onClick={() => setMode('idle')}
              className="rounded-md border border-line px-3 py-1.5 text-sm hover:border-zinc-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-rose-300">{error}</p>}
    </div>
  );
}
