'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { HorizontalPipeline } from '../../../components/pipeline/HorizontalPipeline';
import { RevisionDiffViewer } from '../../../components/finance-pr/RevisionDiffViewer';
import { ControlChecklist } from '../../../components/finance-pr/ControlChecklist';
import { CitationInspector } from '../../../components/finance-pr/CitationInspector';
import { ControllerDock } from '../../../components/finance-pr/ControllerDock';
import { RunButtons } from '../../../components/app/RunActions';
import { WorkerActivity } from '../../../components/app/WorkerActivity';
import { EvidenceUpload } from '../../../components/finance-pr/EvidenceUpload';
import { SpotlightCard } from '../../../components/ui/SpotlightCard';
import { StatusPill } from '../../../components/ui/StatusPill';
import type { CaseDetail } from '@/lib/store/types';
import type { Proposal } from '@/lib/contracts/types';

export default function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [detail, setDetail] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeRevIndex, setActiveRevIndex] = useState(0);

  // `loading` stays true only until the first response. A refetch after a run
  // or a decision must not blank the page, or it unmounts the trace panel
  // mid-stream and the run disappears from view.
  const loadDetail = React.useCallback(() => {
    fetch(`/api/cases/${id}`)
      .then((res) => res.json())
      .then((body) => {
        if (body.ok) {
          const { ok: _ok, ...rest } = body;
          setDetail(rest as CaseDetail);
          const lastIdx = Math.max(0, (rest.revisions?.length ?? 1) - 1);
          setActiveRevIndex(lastIdx);
        } else {
          setDetail(null);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  if (loading) {
    return (
      <div className="app-page max-w-7xl mx-auto py-12 text-sm text-zinc-500 font-mono">
        Loading Finance PR…
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="app-page max-w-7xl mx-auto py-12 space-y-4">
        <p className="text-sm text-rose-600 font-mono">Unknown case {id}</p>
        <Link href="/queue" className="text-sm text-emerald-700 hover:underline">
          Back to queue
        </Link>
      </div>
    );
  }

  const revisions = detail.revisions;
  const rev1 = revisions[0]?.proposal as Proposal;
  const rev2 = revisions[1]?.proposal as Proposal | undefined;
  const currentRev = revisions[activeRevIndex] ?? revisions[revisions.length - 1];
  const currentProposal = currentRev.proposal;
  const currentReport = currentRev.report;
  const isBlocked = currentReport?.blocked ?? false;
  const amount = detail.case.amount ?? Math.abs(detail.bankLine?.amount ?? 0);
  const currency = detail.case.currency ?? detail.bankLine?.currency ?? 'USD';

  const statusLabel =
    detail.decision?.decision === 'approve'
      ? 'Approved'
      : detail.decision?.decision === 'reject'
        ? 'Rejected'
        : isBlocked
          ? 'Controls Failed'
          : detail.case.state === 'merge_ready'
            ? 'Merge Ready'
            : detail.case.state;

  return (
    <div className="app-page max-w-7xl mx-auto space-y-6 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/[0.06] pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/queue"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/[0.08] bg-white text-zinc-400 hover:text-zinc-700 hover:border-black/[0.12] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-medium text-emerald-700">{detail.case.id}</span>
              <span className="text-zinc-300">·</span>
              <span className="text-xs text-zinc-500">
                {detail.case.counterparty ?? detail.bankLine?.counterparty}
              </span>
              <StatusPill
                status={detail.case.state === 'escalated' ? 'escalate' : 'review'}
                label={statusLabel}
              />
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 border border-zinc-200">
                Pack {detail.packVersion}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-semibold text-zinc-950 tracking-[-0.02em] mt-0.5">
              {detail.case.title ?? detail.case.summary}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-right">
            <div className="text-zinc-400 text-[10px] uppercase tracking-wider">Amount</div>
            <div className="font-medium text-zinc-900 text-sm">
              ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {currency}
            </div>
          </div>
          <div className="h-8 w-px bg-black/[0.06]" />
          <div className="text-right">
            <div className="text-zinc-400 text-[10px] uppercase tracking-wider">Bank Line</div>
            <div className="text-zinc-600">{detail.case.bankLineId}</div>
          </div>
          {!detail.decision && (
            <>
              <div className="h-8 w-px bg-black/[0.06]" />
              <RunButtons caseId={detail.case.id} onDone={loadDetail} />
            </>
          )}
        </div>
      </div>

      <HorizontalPipeline currentStepId={detail.decision ? 'ledger' : 'controller'} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <RevisionDiffViewer
            revisions={revisions.map((r) => ({
              proposal: r.proposal,
              report: r.report,
            }))}
            activeRevIndex={activeRevIndex}
            onSelectRev={setActiveRevIndex}
          />
          <CitationInspector citations={currentProposal.citations} />
        </div>

        <div className="lg:col-span-5 space-y-6">
          <ControlChecklist report={currentReport} activeRevIndex={activeRevIndex} />

          <WorkerActivity caseId={detail.case.id} />

          {/* Attach receipts and invoices; they become evidence the agent must cite. */}
          <EvidenceUpload onUploaded={loadDetail} />

          <SpotlightCard className="p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-2">
              <span className="text-xs font-medium text-zinc-700 font-mono">Sandbox Ledger Gate</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  detail.ledgerRecord
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-zinc-50 text-zinc-500 border-zinc-200'
                }`}
              >
                {detail.ledgerRecord ? 'Posted' : 'Pending approval'}
              </span>
            </div>
            <div className="text-xs text-zinc-500 leading-relaxed">
              Once approved by the controller, journal entries are written to Verity&apos;s hash-linked
              sandbox ledger. Rerunning reconciliation guarantees zero discrepancy.
            </div>
            {detail.ledgerRecord && (
              <div className="rounded-md bg-zinc-50 border border-black/[0.06] p-2 text-[11px] font-mono text-zinc-500 flex items-center justify-between">
                <span>Parent Hash</span>
                <span className="text-emerald-700">{detail.ledgerRecord.prevHash.slice(0, 12)}…</span>
              </div>
            )}
          </SpotlightCard>
        </div>
      </div>

      {currentProposal && !detail.decision && (
        <ControllerDock
          caseId={detail.case.id}
          proposalId={currentProposal.id}
          isBlocked={isBlocked}
          decision={detail.decision}
          onComplete={loadDetail}
        />
      )}

      {detail.decision && (
        <ControllerDock
          caseId={detail.case.id}
          proposalId={detail.decision.proposalId}
          isBlocked={false}
          decision={detail.decision}
          onComplete={loadDetail}
        />
      )}
    </div>
  );
}
