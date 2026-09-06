'use client';

import React from 'react';
import { Proposal } from '../../lib/contracts/types';
import { AlertOctagon, CheckCircle2 } from 'lucide-react';

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
    <div className="rounded-xl border border-black/[0.06] bg-white overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.06] bg-zinc-50/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-600">Revision</span>
          <div className="flex items-center rounded-lg bg-white p-0.5 border border-black/[0.06]">
            <button
              onClick={() => onSelectRev(0)}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeRevIndex === 0
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <AlertOctagon className="h-3 w-3" />
              <span>Rev 1 (Blocked)</span>
            </button>
            <button
              onClick={() => onSelectRev(1)}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeRevIndex === 1
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <CheckCircle2 className="h-3 w-3" />
              <span>Rev 2 (Repaired)</span>
            </button>
          </div>
        </div>

        <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-2">
          <span>Policy: <strong className="text-zinc-700">{currentProposal.policyVersion}</strong></span>
          <span className="text-zinc-300">|</span>
          <span>Trace: <span className="text-emerald-700">{currentProposal.traceId}</span></span>
        </div>
      </div>

      <div className="p-4 border-b border-black/[0.04]">
        <h5 className="text-[11px] uppercase tracking-wider font-medium text-zinc-400 mb-1.5 font-mono">
          Agent Narrative
        </h5>
        <p className="text-sm leading-relaxed text-zinc-700">
          {currentProposal.narrative}
        </p>
      </div>

      <div className="p-4 border-b border-black/[0.04]">
        <div className="flex items-center justify-between mb-3">
          <h5 className="text-[11px] uppercase tracking-wider font-medium text-zinc-400 font-mono">
            FX Rate Verification
          </h5>
          <span className="text-[11px] font-mono text-zinc-400">EUR/USD</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div
            className={`rounded-lg border p-3 ${
              activeRevIndex === 0
                ? 'border-rose-200 bg-rose-50'
                : 'border-black/[0.06] bg-zinc-50 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-rose-700">Rev 1 Rate</span>
              <span className="font-mono text-rose-600 font-medium">1.0923</span>
            </div>
            <div className="text-[11px] text-zinc-500">Source: <span className="text-zinc-700">Unofficial Spot Web Scraper</span></div>
            <div className="text-[11px] text-rose-600 font-mono mt-1">Blocked by Policy §4.2</div>
          </div>

          <div
            className={`rounded-lg border p-3 ${
              activeRevIndex === 1
                ? 'border-emerald-200 bg-emerald-50'
                : 'border-black/[0.06] bg-zinc-50 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-emerald-700">Rev 2 Rate</span>
              <span className="font-mono text-emerald-600 font-medium">1.0820</span>
            </div>
            <div className="text-[11px] text-zinc-500">Source: <span className="text-zinc-700">ECB Official Reference Fix</span></div>
            <div className="text-[11px] text-emerald-600 font-mono mt-1">Conforming & Auditable</div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h5 className="text-[11px] uppercase tracking-wider font-medium text-zinc-400 font-mono">
            Proposed Journal Entry
          </h5>
          <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            Balanced
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-black/[0.06] text-zinc-400 text-[11px]">
                <th className="pb-2 font-medium">GL Account</th>
                <th className="pb-2 font-medium">Description</th>
                <th className="pb-2 font-medium">Entity</th>
                <th className="pb-2 font-medium">Period</th>
                <th className="pb-2 text-right font-medium">Debit</th>
                <th className="pb-2 text-right font-medium">Credit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {currentProposal.journal.map((line, idx) => {
                const isDiffLine = line.account === '12000' || line.account === '71000';
                return (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      isDiffLine
                        ? activeRevIndex === 1
                          ? 'bg-emerald-50/60'
                          : 'bg-rose-50/60'
                        : 'hover:bg-zinc-50'
                    }`}
                  >
                    <td className="py-2.5 font-medium text-zinc-800">{line.account}</td>
                    <td className="py-2.5 text-zinc-700 font-sans">{line.accountName}</td>
                    <td className="py-2.5 text-zinc-500">{line.entity}</td>
                    <td className="py-2.5 text-zinc-500">{line.period}</td>
                    <td className="py-2.5 text-right font-medium text-zinc-800">
                      {line.debit > 0 ? `$${line.debit.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className="py-2.5 text-right font-medium text-zinc-800">
                      {line.credit > 0 ? `$${line.credit.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-black/[0.08] font-medium text-zinc-800 text-xs">
                <td colSpan={4} className="pt-3 text-right text-zinc-500 font-sans">
                  Total:
                </td>
                <td className="pt-3 text-right text-emerald-700">$14,200.00</td>
                <td className="pt-3 text-right text-emerald-700">$14,200.00</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
