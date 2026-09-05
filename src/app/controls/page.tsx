'use client';

import React, { useState } from 'react';
import { ShieldCheck, GitMerge, CheckCircle2, FileText, Check, AlertCircle } from 'lucide-react';
import { SpotlightCard } from '../../components/ui/SpotlightCard';
import controlPrData from '../../lib/data/fixtures/control-prs.json';

export default function ControlGovernancePage() {
  const [merged, setMerged] = useState(false);
  const cpr = controlPrData.controlPrs[0];

  return (
    <div className="flex flex-col w-full min-h-screen px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Control PR Governance & Replay Engine
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
              Layer 2: Governing the Controls
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Human-approved guardrail evolution. Grouped controller rejections produce draft specification amendments tested against historical replay fixtures.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMerged(true)}
            disabled={merged}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all select-none ${
              merged
                ? 'bg-zinc-800 text-zinc-400 border border-zinc-700 cursor-not-allowed'
                : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            <GitMerge className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>{merged ? 'Merged into Control Pack v2.0' : 'Merge Control PR into Pack v2.0'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Control PR Specification (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <SpotlightCard className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold text-emerald-400">{cpr.id}</span>
                <span className="text-zinc-600">•</span>
                <span className="text-xs font-mono text-zinc-400">Status: {merged ? 'Merged' : cpr.status}</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">Target: Policy Pack v2.0</span>
            </div>

            <div>
              <h3 className="text-base font-semibold text-zinc-100 mb-1">{cpr.failureMode}</h3>
              <div className="text-xs text-zinc-400 leading-relaxed font-sans">
                Supporting Failures: <code className="text-rose-300 font-mono">prop-rev-1</code> and <code className="text-rose-300 font-mono">prop-2044-fail</code> (≥ 2 confirmed reviewer rejections required).
              </div>
            </div>

            {/* Spec Amendment */}
            <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4 space-y-2">
              <div className="text-[11px] uppercase font-mono font-semibold text-zinc-400">
                Proposed Plain-Language Specification Amendment:
              </div>
              <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                &ldquo;{cpr.specAmendment}&rdquo;
              </p>
            </div>

            {/* Constrained Rule Schema */}
            <div className="space-y-2">
              <div className="text-[11px] uppercase font-mono font-semibold text-zinc-400">
                Constrained Rule Schema (Never Unchecked AI Code):
              </div>
              <div className="rounded-lg bg-black/50 border border-white/[0.06] p-3 font-mono text-xs text-emerald-300 leading-relaxed overflow-x-auto">
                {JSON.stringify(cpr.rule, null, 2)}
              </div>
            </div>
          </SpotlightCard>
        </div>

        {/* Right Column: Historical Replay Report (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <SpotlightCard className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 font-mono">
                  Historical Replay Verification
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                Zero Regressions
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Every rule change must be replayed headlessly across the frozen historical dataset before merge.
              It must catch all positive failure fixtures while preserving negative counterexamples.
            </p>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg border border-white/[0.08] bg-black/30 p-2.5">
                <div className="text-base font-bold text-zinc-100 font-mono">{cpr.replay.totalFixtures}</div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">Fixtures Replayed</div>
              </div>
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-2.5">
                <div className="text-base font-bold text-emerald-400 font-mono">2 / 2</div>
                <div className="text-[10px] text-emerald-400/80 font-mono mt-0.5">Positives Caught</div>
              </div>
              <div className="rounded-lg border border-white/[0.08] bg-black/30 p-2.5">
                <div className="text-base font-bold text-emerald-400 font-mono">100%</div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">Negatives Passed</div>
              </div>
            </div>

            {/* Positive fixtures */}
            <div className="space-y-2 pt-2 border-t border-white/[0.06]">
              <span className="text-[11px] font-mono uppercase font-semibold text-rose-400">
                Positive Fixtures (Must Be Blocked Under v2):
              </span>
              <ul className="space-y-1 text-xs font-mono text-zinc-300">
                {cpr.positiveFixtures.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Negative fixtures */}
            <div className="space-y-2 pt-2 border-t border-white/[0.06]">
              <span className="text-[11px] font-mono uppercase font-semibold text-emerald-400">
                Negative Counterexamples (Must Still Pass Under v2):
              </span>
              <ul className="space-y-1 text-xs font-mono text-zinc-300">
                {cpr.negativeFixtures.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-emerald-400" />
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
