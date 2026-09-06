'use client';

import React, { useState } from 'react';
import { ShieldCheck, GitMerge, CheckCircle2, Check } from 'lucide-react';
import { SpotlightCard } from '../../components/ui/SpotlightCard';
import controlPrData from '../../lib/data/fixtures/control-prs.json';

export default function ControlGovernancePage() {
  const [merged, setMerged] = useState(false);
  const cpr = controlPrData.controlPrs[0];

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
          </div>
          <p className="text-sm text-zinc-500 mt-1.5 max-w-2xl">
            Human-approved guardrail evolution. Grouped controller rejections produce draft specification amendments tested against historical replay fixtures.
          </p>
        </div>

        <button
          onClick={() => setMerged(true)}
          disabled={merged}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors select-none ${
            merged
              ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
              : 'bg-zinc-950 text-white hover:bg-zinc-800'
          }`}
        >
          <GitMerge className="h-3.5 w-3.5" />
          <span>{merged ? 'Merged into Control Pack v2.0' : 'Merge Control PR'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <SpotlightCard className="p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="font-medium text-emerald-700">{cpr.id}</span>
                <span className="text-zinc-300">·</span>
                <span className="text-zinc-500">Status: {merged ? 'Merged' : cpr.status}</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">Target: Policy Pack v2.0</span>
            </div>

            <div>
              <h3 className="text-base font-semibold text-zinc-900 mb-1">{cpr.failureMode}</h3>
              <div className="text-xs text-zinc-500 leading-relaxed">
                Supporting Failures: <code className="text-rose-600 font-mono bg-rose-50 px-1 rounded">prop-rev-1</code> and <code className="text-rose-600 font-mono bg-rose-50 px-1 rounded">prop-2044-fail</code> (≥ 2 confirmed reviewer rejections required).
              </div>
            </div>

            <div className="rounded-lg border border-black/[0.06] bg-zinc-50 p-4 space-y-2">
              <div className="text-[11px] uppercase font-mono font-medium text-zinc-400">
                Proposed Specification Amendment
              </div>
              <p className="text-sm text-zinc-700 leading-relaxed">
                &ldquo;{cpr.specAmendment}&rdquo;
              </p>
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
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Zero Regressions
              </span>
            </div>

            <p className="text-xs text-zinc-500 leading-relaxed">
              Every rule change must be replayed headlessly across the frozen historical dataset before merge.
              It must catch all positive failure fixtures while preserving negative counterexamples.
            </p>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg border border-black/[0.06] bg-zinc-50 p-2.5">
                <div className="text-base font-semibold text-zinc-900 font-mono">{cpr.replay.totalFixtures}</div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">Fixtures</div>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5">
                <div className="text-base font-semibold text-emerald-700 font-mono">2 / 2</div>
                <div className="text-[10px] text-emerald-600 font-mono mt-0.5">Positives</div>
              </div>
              <div className="rounded-lg border border-black/[0.06] bg-zinc-50 p-2.5">
                <div className="text-base font-semibold text-emerald-700 font-mono">100%</div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">Negatives</div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-black/[0.04]">
              <span className="text-[11px] font-mono uppercase font-medium text-rose-600">
                Positive Fixtures (Must Be Blocked)
              </span>
              <ul className="space-y-1 text-xs font-mono text-zinc-600">
                {cpr.positiveFixtures.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
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
                {cpr.negativeFixtures.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-emerald-600" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </div>
  );
}
