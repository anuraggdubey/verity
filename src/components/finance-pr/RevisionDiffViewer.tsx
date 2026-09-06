'use client';

import React from 'react';
import { Proposal } from '../../lib/contracts/types';

interface RevisionDiffViewerProps {
  rev1: Proposal;
  rev2: Proposal;
  activeRevIndex: number;
  onSelectRev: (index: number) => void;
  /** Control outcome per revision, so the FX blocks report what actually happened. */
  rev1Blocked?: boolean;
  rev2Blocked?: boolean;
}

const usd = (value: number) =>
  `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Compares two stored revisions. Revision 1 is immutable, so this is a diff of
 * two artifacts, not an edit history.
 *
 * Every value on this panel is read from the proposals it is given. Nothing is
 * hardcoded — a figure here that disagreed with the journal below it would be
 * worse than no panel at all.
 */
export function RevisionDiffViewer({
  rev1,
  rev2,
  activeRevIndex,
  onSelectRev,
  rev1Blocked,
  rev2Blocked,
}: RevisionDiffViewerProps) {
  const currentProposal = activeRevIndex === 0 ? rev1 : rev2;

  const debits = currentProposal.journal.reduce((sum, line) => sum + line.debit, 0);
  const credits = currentProposal.journal.reduce((sum, line) => sum + line.credit, 0);
  const balanced = Math.abs(debits - credits) < 0.005;
  const currency = currentProposal.journal[0]?.currency ?? 'USD';

  // A line is part of the diff when the other revision does not carry that
  // account, or carries it at a different amount.
  const other = activeRevIndex === 0 ? rev2 : rev1;
  const isDiffLine = (account: string, debit: number, credit: number) => {
    const counterpart = other.journal.find((line) => line.account === account);
    if (!counterpart) return true;
    return (
      Math.abs(counterpart.debit - debit) > 0.005 || Math.abs(counterpart.credit - credit) > 0.005
    );
  };

  const showFx = Boolean(rev1.fx || rev2.fx);

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0c0d12] overflow-hidden">
      {/* Revision selector tab header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] bg-[#11131a] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-300">Proposal Revision:</span>
          <div className="flex items-center rounded-lg bg-black/40 p-0.5 border border-white/[0.06]">
            <button
              onClick={() => onSelectRev(0)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                activeRevIndex === 0
                  ? 'bg-white/[0.1] text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Rev {rev1.revision}
              {rev1Blocked !== undefined && (
                <span className={rev1Blocked ? ' text-rose-400' : ' text-emerald-400'}>
                  {rev1Blocked ? ' (Blocked)' : ' (Passed)'}
                </span>
              )}
            </button>
            <button
              onClick={() => onSelectRev(1)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                activeRevIndex === 1
                  ? 'bg-white/[0.1] text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Rev {rev2.revision}
              {rev2Blocked !== undefined && (
                <span className={rev2Blocked ? ' text-rose-400' : ' text-emerald-400'}>
                  {rev2Blocked ? ' (Blocked)' : ' (Repaired)'}
                </span>
              )}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] text-zinc-500">
          <span>Policy: {currentProposal.policyVersion}</span>
          <span>Pack: {currentProposal.controlPackVersion}</span>
          <span>Trace: {currentProposal.traceId}</span>
        </div>
      </div>

      {/* Narrative block */}
      <div className="p-4 border-b border-white/[0.06] bg-black/20">
        <h5 className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 mb-1.5 font-mono">
          Agent Reasoning &amp; Narrative
        </h5>
        <p className="text-xs leading-relaxed text-zinc-200 font-sans">
          {currentProposal.narrative}
        </p>
      </div>

      {/* FX treatment diff */}
      {showFx && (
        <div className="p-4 border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400 font-mono">
              FX Rate Provenance
            </h5>
            <span className="text-[11px] font-mono text-zinc-500">
              Cited observation per revision
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FxBlock
              label={`Rev ${rev1.revision}`}
              proposal={rev1}
              blocked={rev1Blocked}
              dimmed={activeRevIndex !== 0}
            />
            <FxBlock
              label={`Rev ${rev2.revision}`}
              proposal={rev2}
              blocked={rev2Blocked}
              dimmed={activeRevIndex !== 1}
            />
          </div>
        </div>
      )}

      {/* Double-entry journal for the selected revision */}
      <div className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h5 className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400 font-mono">
            Proposed Sandbox Journal Entry (Double-Entry Impact)
          </h5>
          {currentProposal.journal.length > 0 && (
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                balanced
                  ? 'text-emerald-400 bg-emerald-950/40 border-emerald-500/20'
                  : 'text-rose-400 bg-rose-950/40 border-rose-500/20'
              }`}
            >
              {balanced ? 'Balanced: Σ Debit = Σ Credit' : 'Out of balance'}
            </span>
          )}
        </div>

        {currentProposal.journal.length === 0 ? (
          <p className="text-xs text-zinc-500">
            Non-posting disposition ({currentProposal.disposition}) — no journal lines, so nothing
            can reach the ledger.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/[0.08] text-zinc-500 text-[11px]">
                  <th className="pb-2">GL Account</th>
                  <th className="pb-2">Description</th>
                  <th className="pb-2">Entity</th>
                  <th className="pb-2">Period</th>
                  <th className="pb-2 text-right">Debit ({currency})</th>
                  <th className="pb-2 text-right">Credit ({currency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {currentProposal.journal.map((line, idx) => {
                  const changed = isDiffLine(line.account, line.debit, line.credit);
                  return (
                    <tr
                      key={`${line.account}-${idx}`}
                      className={`transition-colors ${
                        changed
                          ? activeRevIndex === 1
                            ? 'bg-emerald-500/[0.05] hover:bg-emerald-500/[0.08]'
                            : 'bg-rose-500/[0.05] hover:bg-rose-500/[0.08]'
                          : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <td className="py-2.5 font-semibold text-zinc-300">{line.account}</td>
                      <td className="py-2.5 text-zinc-300 font-sans">
                        {line.accountName ?? line.memo ?? '—'}
                      </td>
                      <td className="py-2.5 text-zinc-400">{line.entity}</td>
                      <td className="py-2.5 text-zinc-400">{line.period}</td>
                      <td className="py-2.5 text-right font-semibold text-zinc-200">
                        {line.debit > 0 ? usd(line.debit) : '—'}
                      </td>
                      <td className="py-2.5 text-right font-semibold text-zinc-200">
                        {line.credit > 0 ? usd(line.credit) : '—'}
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
                  <td className={`pt-3 text-right ${balanced ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {usd(debits)}
                  </td>
                  <td className={`pt-3 text-right ${balanced ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {usd(credits)}
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

function FxBlock({
  label,
  proposal,
  blocked,
  dimmed,
}: {
  label: string;
  proposal: Proposal;
  blocked?: boolean;
  dimmed: boolean;
}) {
  if (!proposal.fx) {
    return (
      <div className={`rounded-lg border border-white/[0.06] bg-black/20 p-3 ${dimmed ? 'opacity-60' : ''}`}>
        <div className="text-xs font-semibold text-zinc-400">{label}</div>
        <div className="mt-1 text-[11px] text-zinc-500">No FX conversion in this revision.</div>
      </div>
    );
  }

  const tone = blocked === undefined ? 'neutral' : blocked ? 'bad' : 'good';
  const border =
    tone === 'bad'
      ? 'border-rose-500/40 bg-rose-950/20'
      : tone === 'good'
        ? 'border-emerald-500/40 bg-emerald-950/20'
        : 'border-white/[0.06] bg-black/20';
  const accent =
    tone === 'bad' ? 'text-rose-400' : tone === 'good' ? 'text-emerald-400' : 'text-zinc-300';

  return (
    <div className={`rounded-lg border p-3 ${border} ${dimmed ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className={`font-semibold ${accent}`}>{label}</span>
        <span className={`font-mono font-semibold ${accent}`}>{proposal.fx.rate}</span>
      </div>
      <div className="text-[11px] text-zinc-400">
        Source: <span className="text-zinc-200">{proposal.fx.sourceName ?? proposal.fx.sourceId}</span>
      </div>
      <div className="text-[11px] text-zinc-400">
        {proposal.fx.rateType} rate dated <span className="text-zinc-200">{proposal.fx.rateDate}</span>
      </div>
      {blocked !== undefined && (
        <div className={`text-[11px] font-mono mt-1 ${blocked ? 'text-rose-400/90' : 'text-emerald-400/90'}`}>
          Status: {blocked ? 'Blocked by the control pack' : 'Passed the control pack'}
        </div>
      )}
    </div>
  );
}
