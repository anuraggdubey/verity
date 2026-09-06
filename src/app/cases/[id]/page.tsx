'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { HorizontalPipeline } from '../../../components/pipeline/HorizontalPipeline';
import { RevisionDiffViewer } from '../../../components/finance-pr/RevisionDiffViewer';
import { ControlChecklist } from '../../../components/finance-pr/ControlChecklist';
import { CitationInspector } from '../../../components/finance-pr/CitationInspector';
import { ControllerDock } from '../../../components/finance-pr/ControllerDock';
import { SpotlightCard } from '../../../components/ui/SpotlightCard';
import { StatusPill } from '../../../components/ui/StatusPill';
import eurUsdCaseData from '../../../lib/data/fixtures/eur-usd-case.json';
import { Proposal } from '../../../lib/contracts/types';

export default function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [activeRevIndex, setActiveRevIndex] = useState(1);
  const caseMeta = eurUsdCaseData.case;
  const rev1 = eurUsdCaseData.revisions[0] as unknown as Proposal;
  const rev2 = eurUsdCaseData.revisions[1] as unknown as Proposal;
  const currentProposal = activeRevIndex === 0 ? rev1 : rev2;

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
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-medium text-emerald-700">
                {caseMeta.id}
              </span>
              <span className="text-zinc-300">·</span>
              <span className="text-xs text-zinc-500">{caseMeta.counterparty}</span>
              <StatusPill status="review" label="Merge Ready (Rev 2)" />
            </div>
            <h1 className="text-lg sm:text-xl font-semibold text-zinc-950 tracking-[-0.02em] mt-0.5">
              {caseMeta.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-right">
            <div className="text-zinc-400 text-[10px] uppercase tracking-wider">Amount</div>
            <div className="font-medium text-zinc-900 text-sm">
              ${caseMeta.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {caseMeta.currency}
            </div>
          </div>
          <div className="h-8 w-px bg-black/[0.06]" />
          <div className="text-right">
            <div className="text-zinc-400 text-[10px] uppercase tracking-wider">Bank Line</div>
            <div className="text-zinc-600">{caseMeta.bankLineId}</div>
          </div>
        </div>
      </div>

      <HorizontalPipeline currentStepId="controller" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <RevisionDiffViewer
            rev1={rev1}
            rev2={rev2}
            activeRevIndex={activeRevIndex}
            onSelectRev={setActiveRevIndex}
          />
          <CitationInspector citations={currentProposal.citations} />
        </div>

        <div className="lg:col-span-5 space-y-6">
          <ControlChecklist
            report={currentProposal.controlReport}
            activeRevIndex={activeRevIndex}
          />

          <SpotlightCard className="p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-2">
              <span className="text-xs font-medium text-zinc-700 font-mono">
                Sandbox Ledger Gate
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Balanced
              </span>
            </div>
            <div className="text-xs text-zinc-500 leading-relaxed">
              Once approved by the controller, journal entries are written to Verity&apos;s
              hash-linked sandbox ledger. Rerunning reconciliation guarantees zero discrepancy.
            </div>
            <div className="rounded-md bg-zinc-50 border border-black/[0.06] p-2 text-[11px] font-mono text-zinc-500 flex items-center justify-between">
              <span>Parent Hash</span>
              <span className="text-emerald-700">0x39a1c...b092</span>
            </div>
          </SpotlightCard>
        </div>
      </div>

      <ControllerDock
        proposalId={currentProposal.id}
        isBlocked={currentProposal.controlReport?.blocked || false}
        onDecision={(dec, reason) => {
          console.log('Controller decision:', dec, reason);
        }}
      />
    </div>
  );
}
