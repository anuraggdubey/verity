'use client';

import React from 'react';
import type { ControlReport, Proposal } from '../../lib/contracts/types';
import { AlertOctagon, CheckCircle2 } from 'lucide-react';

type RevisionEntry = {
  proposal: Proposal;
  report?: ControlReport;
};

interface RevisionDiffViewerProps {
  revisions: RevisionEntry[];
  activeRevIndex: number;
  onSelectRev: (index: number) => void;
}

export function RevisionDiffViewer({
  revisions,
  activeRevIndex,
  onSelectRev,
}: RevisionDiffViewerProps) {
  const current = revisions[activeRevIndex] ?? revisions[revisions.length - 1];
  const currentProposal = current.proposal;
  const hasMultiple = revisions.length > 1;

  const totalDebit = currentProposal.journal.reduce((s, l) => s + l.debit, 0);
  const totalCredit = currentProposal.journal.reduce((s, l) => s + l.credit, 0);
  const balanced = Math.abs(totalDebit - totalCredit) < 0.01;

  return (
    <div className="rounded-xl border border-black/[0.06] bg-white overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.06] bg-zinc-50/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-700">Proposed journal entry</span>
          {hasMultiple ? (
            <div className="flex items-center rounded-lg bg-white p-0.5 border border-black/[0.06]">
              {revisions.map((rev, idx) => {
                const blocked = rev.report?.blocked ?? false;
                const isActive = activeRevIndex === idx;
                return (
                  <button
                    key={rev.proposal.id}
                    onClick={() => onSelectRev(idx)}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      isActive
                        ? blocked
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    {blocked ? (
                      <AlertOctagon className="h-3 w-3" />
                    ) : (
                      <CheckCircle2 className="h-3 w-3" />
                    )}
                    <span>Attempt {rev.proposal.revision}{blocked ? ' — failed checks' : ''}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <span className="text-xs font-mono text-zinc-500">
              Rev {currentProposal.revision}
            </span>
          )}
        </div>

        <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-2">
          <span>
            Policy: <strong className="text-zinc-700">{currentProposal.policyVersion}</strong>
          </span>
          <span className="text-zinc-300">|</span>
          <span>
            Pack: <strong className="text-zinc-700">{currentProposal.controlPackVersion}</strong>
          </span>
          <span className="text-zinc-300">|</span>
          <span>
            Trace: <span className="text-emerald-700">{currentProposal.traceId}</span>
          </span>
        </div>
      </div>

      <div className="p-4 border-b border-black/[0.04]">
        <h5 className="text-[11px] uppercase tracking-wider font-medium text-zinc-400 mb-1.5 font-mono">
          Agent Narrative
        </h5>
        <p className="text-sm leading-relaxed text-zinc-700">{currentProposal.narrative}</p>
      </div>

      {currentProposal.fx && (
        <div className="p-4 border-b border-black/[0.04]">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-[11px] uppercase tracking-wider font-medium text-zinc-400 font-mono">
              FX Rate
            </h5>
          </div>
          <div className="rounded-lg border border-black/[0.06] bg-zinc-50 p-3 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-zinc-500">Rate</span>
              <span className="text-zinc-800 font-medium">{currentProposal.fx.rate}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-zinc-500">Date</span>
              <span className="text-zinc-800">{currentProposal.fx.rateDate}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-zinc-500">Source</span>
              <span className="text-zinc-800">{currentProposal.fx.sourceName ?? currentProposal.fx.sourceId}</span>
            </div>
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h5 className="text-[11px] uppercase tracking-wider font-medium text-zinc-400 font-mono">
            Proposed Journal Entry
          </h5>
          {currentProposal.journal.length > 0 && (
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${
                balanced
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : 'text-rose-700 bg-rose-50 border-rose-200'
              }`}
            >
              {balanced ? 'Balanced' : 'Unbalanced'}
            </span>
          )}
        </div>

        {currentProposal.journal.length === 0 ? (
          <p className="text-xs text-zinc-500 font-mono">Non-posting disposition — no journal lines.</p>
        ) : (
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
                {currentProposal.journal.map((line, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-2.5 font-medium text-zinc-800">{line.account}</td>
                    <td className="py-2.5 text-zinc-700 font-sans">{line.accountName ?? line.memo}</td>
                    <td className="py-2.5 text-zinc-500">{line.entity}</td>
                    <td className="py-2.5 text-zinc-500">{line.period}</td>
                    <td className="py-2.5 text-right font-medium text-zinc-800">
                      {line.debit > 0
                        ? `$${line.debit.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                        : '—'}
                    </td>
                    <td className="py-2.5 text-right font-medium text-zinc-800">
                      {line.credit > 0
                        ? `$${line.credit.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-black/[0.08] font-medium text-zinc-800 text-xs">
                  <td colSpan={4} className="pt-3 text-right text-zinc-500 font-sans">Total:</td>
                  <td className="pt-3 text-right text-emerald-700">
                    ${totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="pt-3 text-right text-emerald-700">
                    ${totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
