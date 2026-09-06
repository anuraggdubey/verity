'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { ArrowRight, FileCheck2, Hash } from 'lucide-react';

import { CitationInspector } from '@/components/finance-pr/CitationInspector';
import { ControlChecklist } from '@/components/finance-pr/ControlChecklist';
import { ControllerDock } from '@/components/finance-pr/ControllerDock';
import { RevisionDiffViewer } from '@/components/finance-pr/RevisionDiffViewer';
import { StatusPill } from '@/components/ui/StatusPill';
import type {
  ControlReport,
  ControllerDecision,
  LedgerRecord,
  Proposal,
  RejectReasonCode,
  RouteDecision,
} from '@/lib/contracts/types';

export type WorkspaceRevision = {
  proposal: Proposal;
  report?: ControlReport;
  route?: RouteDecision;
};

/**
 * The Finance PR working surface.
 *
 * Revision 1 is immutable; a repair appends revision 2. The selector below
 * switches between stored artifacts — it is not an edit history.
 *
 * Every action here calls the real API: approve posts to the hash-linked
 * sandbox ledger and reruns the reconciliation; request-changes records an
 * enumerated reason code, which is exactly what the failure grouper reads when
 * it drafts a Control PR.
 */
export function CaseWorkspace({
  caseId,
  revisions,
  decision,
  ledgerRecord,
}: {
  caseId: string;
  revisions: WorkspaceRevision[];
  decision?: ControllerDecision;
  ledgerRecord?: LedgerRecord;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [activeRevIndex, setActiveRevIndex] = useState(revisions.length - 1);
  const [error, setError] = useState<string | null>(null);

  const active = revisions[activeRevIndex] ?? revisions[revisions.length - 1];
  const latest = revisions[revisions.length - 1];

  async function onDecision(kind: 'approve' | 'reject' | 'escalate', reasonCode?: string) {
    setError(null);

    if (kind === 'escalate') {
      const response = await fetch(`/api/cases/${caseId}/escalate`, { method: 'POST' });
      const body = await response.json();
      if (!response.ok) {
        setError(body.error ?? 'Escalation failed');
        return;
      }
      startTransition(() => router.refresh());
      return;
    }

    const response = await fetch(`/api/proposals/${latest.proposal.id}/decision`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        decision: kind,
        reasonCode: kind === 'reject' ? ((reasonCode as RejectReasonCode) ?? 'OTHER') : undefined,
      }),
    });
    const body = await response.json();
    if (!response.ok) {
      setError(body.error ?? 'Decision failed');
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-5">
      {revisions.length > 1 ? (
        <RevisionDiffViewer
          rev1={revisions[0].proposal}
          rev2={revisions[revisions.length - 1].proposal}
          activeRevIndex={activeRevIndex}
          onSelectRev={setActiveRevIndex}
          rev1Blocked={revisions[0].report?.blocked}
          rev2Blocked={revisions[revisions.length - 1].report?.blocked}
        />
      ) : (
        <div className="rounded-xl border border-white/[0.08] bg-[#0c0d12] px-4 py-3">
          <p className="text-xs text-zinc-400">
            One revision. A second only exists when the control pack blocks the first and the
            worker repairs it.
          </p>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-white/[0.08] bg-[#0c0d12]">
          <header className="flex items-center gap-2 border-b border-white/[0.08] bg-[#11131a] px-4 py-2.5">
            <h2 className="text-xs font-semibold text-zinc-200">Accounting impact</h2>
            <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
              revision {active.proposal.revision}
            </span>
          </header>
          <div className="p-4">
            <JournalTable proposal={active.proposal} />
          </div>
        </section>

        <section className="rounded-xl border border-white/[0.08] bg-[#0c0d12]">
          <header className="flex items-center gap-2 border-b border-white/[0.08] bg-[#11131a] px-4 py-2.5">
            <h2 className="text-xs font-semibold text-zinc-200">Narrative and routing</h2>
            {active.report && (
              <span className="ml-auto">
                <StatusPill
                  status={active.report.blocked ? 'blocked' : 'pass'}
                  label={active.report.blocked ? 'Controls blocked' : 'Controls passed'}
                  size="sm"
                />
              </span>
            )}
          </header>
          <div className="space-y-3 p-4">
            <p className="text-[13px] leading-relaxed text-zinc-300">{active.proposal.narrative}</p>
            <dl className="grid grid-cols-2 gap-3 border-t border-white/[0.06] pt-3 text-[11px]">
              <Field label="Disposition" value={active.proposal.disposition} />
              <Field label="Policy" value={active.proposal.policyVersion} />
              <Field label="Control pack" value={active.proposal.controlPackVersion} />
              <Field label="Trace" value={active.proposal.traceId} />
              {active.proposal.fx && (
                <div className="col-span-2">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
                    FX treatment
                  </dt>
                  <dd className="mono-num mt-1 text-[12px] text-zinc-300">
                    {active.proposal.fx.rate} {active.proposal.fx.rateType} @{' '}
                    {active.proposal.fx.rateDate} · {active.proposal.fx.sourceId}
                  </dd>
                </div>
              )}
            </dl>
            {active.route && (
              <p className="flex items-start gap-2 border-t border-white/[0.06] pt-3 text-[11px] text-zinc-400">
                <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-zinc-600" />
                <span>
                  Routed <span className="text-zinc-200">{active.route.lane}</span> — {active.route.reason}
                </span>
              </p>
            )}
          </div>
        </section>
      </div>

      <ControlChecklist report={active.report} activeRevIndex={activeRevIndex} />

      <CitationInspector citations={active.proposal.citations} />

      {ledgerRecord && (
        <section className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-4">
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-4 w-4 text-emerald-400" />
            <h2 className="text-xs font-semibold text-emerald-200">
              Posted to the sandbox ledger
            </h2>
            <span className="ml-auto font-mono text-[10px] text-emerald-400/70">
              {ledgerRecord.id}
            </span>
          </div>
          <dl className="mt-3 grid gap-3 sm:grid-cols-3">
            <Field label="Posted at" value={ledgerRecord.postedAt.replace('T', ' ').slice(0, 19)} />
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
                Hash
              </dt>
              <dd className="mono-num mt-1 flex items-center gap-1 text-[12px] text-emerald-300">
                <Hash className="h-3 w-3" />
                {ledgerRecord.hash}
              </dd>
            </div>
            <Field label="Previous" value={ledgerRecord.prevHash} />
          </dl>
        </section>
      )}

      {error && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-950/20 px-3 py-2 text-xs text-rose-300">
          {error}
        </p>
      )}

      {decision ? (
        <section className="rounded-xl border border-white/[0.08] bg-[#0c0d12] p-4">
          <h2 className="text-xs font-semibold text-zinc-200">Controller decision</h2>
          <p className="mt-2 text-[13px] text-zinc-300">
            <span className={decision.decision === 'approve' ? 'text-emerald-300' : 'text-rose-300'}>
              {decision.decision === 'approve' ? 'Approved' : 'Changes requested'}
            </span>{' '}
            by {decision.decidedBy} · {decision.decidedAt.replace('T', ' ').slice(0, 19)}
          </p>
          {decision.reasonCode && (
            <p className="mt-1 font-mono text-[11px] text-zinc-400">
              Reason code {decision.reasonCode} — read by the failure grouper
            </p>
          )}
          {decision.rationale && (
            <p className="mt-2 text-[12px] text-zinc-400">{decision.rationale}</p>
          )}
        </section>
      ) : (
        <ControllerDock
          proposalId={latest.proposal.id}
          isBlocked={latest.report?.blocked ?? false}
          onDecision={onDecision}
        />
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">{label}</dt>
      <dd className="mt-1 truncate text-[12px] text-zinc-300">{value}</dd>
    </div>
  );
}

function JournalTable({ proposal }: { proposal: Proposal }) {
  if (proposal.journal.length === 0) {
    return (
      <p className="text-[12px] text-zinc-500">
        Non-posting disposition — no journal lines proposed, so nothing can reach the ledger.
      </p>
    );
  }

  const debits = proposal.journal.reduce((sum, line) => sum + line.debit, 0);
  const credits = proposal.journal.reduce((sum, line) => sum + line.credit, 0);
  const balanced = Math.abs(debits - credits) < 0.005;
  const format = (value: number, currency: string) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);

  return (
    <table className="w-full text-[12px]">
      <thead>
        <tr className="text-left font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
          <th className="pb-2 font-medium">Account</th>
          <th className="pb-2 font-medium">Period</th>
          <th className="pb-2 text-right font-medium">Debit</th>
          <th className="pb-2 text-right font-medium">Credit</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/[0.06]">
        {proposal.journal.map((line, index) => (
          <tr key={`${line.account}-${index}`}>
            <td className="py-2">
              <span className="mono-num text-zinc-200">{line.account}</span>
              {line.memo && <div className="text-[11px] text-zinc-500">{line.memo}</div>}
            </td>
            <td className="py-2 text-zinc-500">{line.period}</td>
            <td className="mono-num py-2 text-right text-zinc-200">
              {line.debit ? format(line.debit, line.currency) : '—'}
            </td>
            <td className="mono-num py-2 text-right text-zinc-200">
              {line.credit ? format(line.credit, line.currency) : '—'}
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="border-t border-white/[0.1]">
          <td colSpan={2} className="pt-2 font-mono text-[10px] uppercase tracking-[0.12em]">
            <span className={balanced ? 'text-emerald-400' : 'text-rose-400'}>
              {balanced ? 'Balanced' : 'Out of balance'}
            </span>
          </td>
          <td className="mono-num pt-2 text-right font-semibold text-zinc-100">
            {format(debits, proposal.journal[0].currency)}
          </td>
          <td className="mono-num pt-2 text-right font-semibold text-zinc-100">
            {format(credits, proposal.journal[0].currency)}
          </td>
        </tr>
      </tfoot>
    </table>
  );
}
