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
import { AppShell } from '../../../components/app/AppShell';
import { SpotlightCard } from '../../../components/ui/SpotlightCard';
import { StatusPill } from '../../../components/ui/StatusPill';
import type { CaseDetail } from '@/lib/store/types';

function friendlyStatus(detail: CaseDetail, isBlocked: boolean): string {
  if (detail.decision?.decision === 'approve') return 'Approved';
  if (detail.decision?.decision === 'reject') return 'Rejected';
  if (isBlocked) return 'Checks failed';
  if (detail.case.state === 'merge_ready') return 'Ready to approve';
  if (detail.case.state === 'escalated') return 'Escalated';
  if (detail.case.state === 'investigating') return 'In progress';
  return 'Open';
}

export default function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [detail, setDetail] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeRevIndex, setActiveRevIndex] = useState(0);

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
      <AppShell>
        <div className="py-16 text-sm text-zinc-500">Loading…</div>
      </AppShell>
    );
  }

  if (!detail) {
    return (
      <AppShell className="space-y-4">
        <p className="text-sm text-rose-600">Case not found.</p>
        <Link href="/queue" className="text-sm text-blue-600 hover:underline">
          Back to inbox
        </Link>
      </AppShell>
    );
  }

  const revisions = detail.revisions;
  const currentRev = revisions[activeRevIndex] ?? revisions[revisions.length - 1];
  const currentProposal = currentRev.proposal;
  const currentReport = currentRev.report;
  const isBlocked = currentReport?.blocked ?? false;
  const amount = detail.case.amount ?? Math.abs(detail.bankLine?.amount ?? 0);
  const currency = detail.case.currency ?? detail.bankLine?.currency ?? 'USD';

  return (
    <AppShell className="space-y-6 pb-24">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/[0.06] pb-5">
        <div className="flex items-start gap-3 min-w-0">
          <Link
            href="/queue"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-black/[0.08] bg-white text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-zinc-400">{detail.case.id}</span>
              <span className="text-zinc-300">·</span>
              <span className="text-sm text-zinc-600">
                {detail.case.counterparty ?? detail.bankLine?.counterparty}
              </span>
              <StatusPill
                status={detail.case.state === 'escalated' ? 'escalate' : 'review'}
                label={friendlyStatus(detail, isBlocked)}
              />
            </div>
            <h1 className="text-xl font-semibold text-zinc-950 tracking-[-0.02em] mt-1">
              {detail.case.title ?? detail.case.summary}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <div className="text-xs text-zinc-400">Amount</div>
            <div className="text-lg font-semibold text-zinc-900 tabular-nums">
              ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
              <span className="text-sm font-normal text-zinc-500">{currency}</span>
            </div>
          </div>
          {!detail.decision && <RunButtons caseId={detail.case.id} onDone={loadDetail} />}
        </div>
      </div>

      <EvidenceUpload onUploaded={loadDetail} />

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
          <SpotlightCard className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-800">Ledger</span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                  detail.ledgerRecord
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-zinc-50 text-zinc-500 border-zinc-200'
                }`}
              >
                {detail.ledgerRecord ? 'Posted' : 'Not posted'}
              </span>
            </div>
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
    </AppShell>
  );
}
