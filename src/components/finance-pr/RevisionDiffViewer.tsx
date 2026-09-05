'use client';

import React from 'react';
import { Proposal } from '../../lib/contracts/types';
import { AlertOctagon, CheckCircle2, ArrowRight } from 'lucide-react';

interface RevisionDiffViewerProps {
  rev1: Proposal;
  rev2: Proposal;
  activeRevIndex: number;
  onSelectRev: (index: number) => void;
}

export function RevisionDiffViewer({
  rev1,
  rev2,
  activeRevIndex,
  onSelectRev,
}: RevisionDiffViewerProps) {
  const currentProposal = activeRevIndex === 0 ? rev1 : rev2;

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0c0d12] overflow-hidden">
      {/* Revision selector tab header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#11131a] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-300">Proposal Revision:</span>
          <div className="flex items-center rounded-lg bg-black/40 p-0.5 border border-white/[0.06]">
            <button
              onClick={() => onSelectRev(0)}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                activeRevIndex === 0
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <AlertOctagon className="h-3 w-3 text-rose-400" />
              <span>Rev 1 (Blocked)</span>
            </button>
            <button
              onClick={() => onSelectRev(1)}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                activeRevIndex === 1
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              <span>Rev 2 (Auto-Repaired)</span>
            </button>
          </div>
        </div>

        <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-2">
          <span>Policy: <strong className="text-zinc-200">{currentProposal.policyVersion}</strong></span>
          <span className="text-zinc-600">|</span>
          <span>Trace: <span className="text-emerald-400">{currentProposal.traceId}</span></span>
        </div>
      </div>

      {/* Narrative block */}
      <div className="p-4 border-b border-white/[0.06] bg-black/20">
        <h5 className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 mb-1.5 font-mono">
          Agent Reasoning & Narrative
        </h5>
        <p className="text-xs leading-relaxed text-zinc-200 font-sans">
          {currentProposal.narrative}
        </p>
      </div>

      {/* FX Treatment Diff Comparison */}
      <div className="p-4 border-b border-white/[0.06]">
        <div className="flex items-center justify-between mb-2">
          <h5 className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400 font-mono">
            FX Oracle & Rate Verification
          </h5>
          <span className="text-[11px] font-mono text-zinc-500">EUR/USD Cross-Currency</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Rev 1 FX block */}
          <div
            className={`rounded-lg border p-3 ${
              activeRevIndex === 0
                ? 'border-rose-500/40 bg-rose-950/20'
                : 'border-white/[0.06] bg-black/20 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-rose-400">Rev 1 Rate (Faulty)</span>
              <span className="font-mono text-rose-300 font-semibold">1.0923</span>
            </div>
            <div className="text-[11px] text-zinc-400">Source: <span className="text-zinc-200">Unofficial Spot Web Scraper</span></div>
            <div className="text-[11px] text-rose-400/90 font-mono mt-1">Status: Blocked by Policy §4.2</div>
          </div>

          {/* Rev 2 FX block */}
          <div
            className={`rounded-lg border p-3 ${
              activeRevIndex === 1
                ? 'border-emerald-500/40 bg-emerald-950/20'
                : 'border-white/[0.06] bg-black/20 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-emerald-400">Rev 2 Rate (Repaired)</span>
              <span className="font-mono text-emerald-300 font-semibold">1.0820</span>
            </div>
            <div className="text-[11px] text-zinc-400">Source: <span className="text-zinc-200">ECB Official Reference Fix</span></div>
            <div className="text-[11px] text-emerald-400/90 font-mono mt-1">Status: Conforming & Auditable</div>
          </div>
        </div>
      </div>

      {/* Double-Entry Journal Table Diff */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h5 className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400 font-mono">
            Proposed Sandbox Journal Entry (Double-Entry Impact)
          </h5>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded">
            Balanced: Σ Debit = Σ Credit
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/[0.08] text-zinc-500 text-[11px]">
                <th className="pb-2">GL Account</th>
                <th className="pb-2">Description</th>
                <th className="pb-2">Entity</th>
                <th className="pb-2">Period</th>
                <th className="pb-2 text-right">Debit (USD)</th>
                <th className="pb-2 text-right">Credit (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {currentProposal.journal.map((line, idx) => {
                const isDiffLine = line.account === '12000' || line.account === '71000';
                return (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      isDiffLine
                        ? activeRevIndex === 1
                          ? 'bg-emerald-500/[0.05] hover:bg-emerald-500/[0.08]'
                          : 'bg-rose-500/[0.05] hover:bg-rose-500/[0.08]'
                        : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <td className="py-2.5 font-semibold text-zinc-300">
                      {line.account}
                    </td>
                    <td className="py-2.5 text-zinc-300 font-sans">
                      {line.accountName}
                    </td>
                    <td className="py-2.5 text-zinc-400">{line.entity}</td>
                    <td className="py-2.5 text-zinc-400">{line.period}</td>
                    <td className="py-2.5 text-right font-semibold text-zinc-200">
                      {line.debit > 0 ? `$${line.debit.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className="py-2.5 text-right font-semibold text-zinc-200">
                      {line.credit > 0 ? `$${line.credit.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/[0.1] font-semibold text-zinc-200 text-xs">
                <td colSpan={4} className="pt-3 text-right text-zinc-400 font-sans">
                  Total Impact:
                </td>
                <td className="pt-3 text-right text-emerald-400">
                  $14,200.00
                </td>
                <td className="pt-3 text-right text-emerald-400">
                  $14,200.00
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
