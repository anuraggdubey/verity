'use client';

import React, { useEffect, useState } from 'react';
import { GitMerge, CheckCircle2, Check, AlertTriangle } from 'lucide-react';
import { SpotlightCard } from '../../components/ui/SpotlightCard';
import { ControlPRActions } from '../../components/ControlPRActions';
import type { ControlPR } from '@/lib/contracts/types';

export default function ControlGovernancePage() {
  const [controlPRs, setControlPRs] = useState<ControlPR[]>([]);
  const [loading, setLoading] = useState(true);

  const load = React.useCallback(() => {
    fetch('/api/control-prs')
      .then((res) => res.json())
      .then((body) => {
        setControlPRs(body.controlPRs ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const cpr = controlPRs.find((pr) => pr.id === 'CPR-001') ?? controlPRs[0];

  if (loading) {
    return (
      <div className="app-page max-w-7xl mx-auto py-12 text-sm text-zinc-500 font-mono">
        Loading control PRs…
      </div>
    );
  }

  if (!cpr) {
    return (
      <div className="app-page max-w-7xl mx-auto py-12 text-sm text-zinc-500">
        No control PRs drafted yet. Reject at least two proposals with the same reason code to draft one.
      </div>
    );
  }

  const replay = cpr.replay;
  const positivesCaught = replay?.positives.filter((p) => p.caught).length ?? 0;
  const negativesOk = replay?.negatives.filter((n) => n.stillAllowed).length ?? 0;
  const hasRegression = replay ? replay.autoClearAfter < replay.autoClearBefore : false;

  return (
    <div className="app-page max-w-7xl mx-auto space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-black/[0.06] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold text-zinc-950 tracking-[-0.02em]">
              Control PR Governance
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
              Layer 2
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">
              {cpr.status}
            </span>
          </div>
          <p className="text-sm text-zinc-500 mt-1.5 max-w-2xl">
            Human-approved guardrail evolution. Grouped controller rejections produce draft specification
            amendments tested against historical replay fixtures.
          </p>
        </div>

        <ControlPRActions controlPrId={cpr.id} status={cpr.status} onComplete={load} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <SpotlightCard className="p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="font-medium text-emerald-700">{cpr.id}</span>
                <span className="text-zinc-300">·</span>
                <span className="text-zinc-500">Status: {cpr.status}</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">
                Target: Policy Pack {replay?.packVersion ?? 'v2'}
              </span>
            </div>

            <div>
              <h3 className="text-base font-semibold text-zinc-900 mb-1">{cpr.failureMode}</h3>
              <div className="text-xs text-zinc-500 leading-relaxed">
                Supporting failures:{' '}
                {cpr.supportingProposalIds.map((pid) => (
                  <code key={pid} className="text-rose-600 font-mono bg-rose-50 px-1 rounded mr-1">
                    {pid}
                  </code>
                ))}
                (≥ 2 confirmed reviewer rejections required).
              </div>
            </div>

            <div className="rounded-lg border border-black/[0.06] bg-zinc-50 p-4 space-y-2">
              <div className="text-[11px] uppercase font-mono font-medium text-zinc-400">
                Proposed Specification Amendment
              </div>
              <p className="text-sm text-zinc-700 leading-relaxed">&ldquo;{cpr.specAmendment}&rdquo;</p>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] uppercase font-mono font-medium text-zinc-400">
                Constrained Rule Schema
              </div>
              <div className="rounded-lg bg-zinc-950 border border-zinc-800 p-3 font-mono text-xs text-emerald-400 leading-relaxed overflow-x-auto">
                {JSON.stringify(cpr.rule, null, 2)}
              </div>
            </div>
          </SpotlightCard>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <SpotlightCard className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-700 font-mono">
                  Historical Replay
                </h3>
              </div>
              {replay ? (
                hasRegression ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Auto-clear regression
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Clean replay
                  </span>
                )
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Not replayed
                </span>
              )}
            </div>

            <p className="text-xs text-zinc-500 leading-relaxed">
              Every rule change must be replayed headlessly across the frozen historical dataset before merge.
              It must catch all positive failure fixtures while preserving negative counterexamples.
            </p>

            {replay && (
              <div className="rounded-lg border border-black/[0.06] bg-zinc-50 p-3 text-xs font-mono text-zinc-600">
                Auto-clear: {replay.autoClearBefore} → {replay.autoClearAfter}
                {hasRegression && (
                  <span className="block mt-1 text-rose-600">
                    v2 reduces auto-clear coverage — regression flagged on metrics screen.
                  </span>
                )}
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg border border-black/[0.06] bg-zinc-50 p-2.5">
                <div className="text-base font-semibold text-zinc-900 font-mono">
                  {(cpr.positiveFixtures.length + cpr.negativeFixtures.length) || '—'}
                </div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">Fixtures</div>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5">
                <div className="text-base font-semibold text-emerald-700 font-mono">
                  {replay ? `${positivesCaught} / ${cpr.positiveFixtures.length}` : '—'}
                </div>
                <div className="text-[10px] text-emerald-600 font-mono mt-0.5">Positives</div>
              </div>
              <div className="rounded-lg border border-black/[0.06] bg-zinc-50 p-2.5">
                <div className="text-base font-semibold text-emerald-700 font-mono">
                  {replay ? `${negativesOk} / ${cpr.negativeFixtures.length}` : '—'}
                </div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">Negatives</div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-black/[0.04]">
              <span className="text-[11px] font-mono uppercase font-medium text-rose-600">
                Positive Fixtures (Must Be Blocked)
              </span>
              <ul className="space-y-1 text-xs font-mono text-zinc-600">
                {cpr.positiveFixtures.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-emerald-600" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 pt-2 border-t border-black/[0.04]">
              <span className="text-[11px] font-mono uppercase font-medium text-emerald-600">
                Negative Counterexamples (Must Still Pass)
              </span>
              <ul className="space-y-1 text-xs font-mono text-zinc-600">
                {cpr.negativeFixtures.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-emerald-600" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {cpr.status === 'merged' && (
              <div className="flex items-center gap-2 text-xs text-emerald-700 border border-emerald-200 bg-emerald-50 rounded-lg p-3">
                <GitMerge className="h-4 w-4" />
                Merged into control pack {replay?.packVersion ?? 'v2'}.
              </div>
            )}
          </SpotlightCard>
        </div>
      </div>
    </div>
  );
}
