'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, GitBranch, ShieldCheck, Clock, ExternalLink } from 'lucide-react';
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
  const [activeRevIndex, setActiveRevIndex] = useState(1); // Default to repaired Rev 2
  const caseMeta = eurUsdCaseData.case;
  const rev1 = eurUsdCaseData.revisions[0] as unknown as Proposal;
  const rev2 = eurUsdCaseData.revisions[1] as unknown as Proposal;
  const currentProposal = activeRevIndex === 0 ? rev1 : rev2;

  return (
    <div className="flex flex-col w-full min-h-screen px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto space-y-6 pb-24">
      {/* Top Breadcrumb & Metadata Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/queue"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.08] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-emerald-400">
                {caseMeta.id}
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-xs text-zinc-400">{caseMeta.counterparty}</span>
              <StatusPill status="review" label="Merge Ready (Rev 2)" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-0.5">
              {caseMeta.title}
            </h1>
          </div>
        </div>

        {/* Case Meta Stats */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-right">
            <div className="text-zinc-500 text-[10px]">INFLOW AMOUNT</div>
            <div className="font-semibold text-zinc-200 text-sm">
              ${caseMeta.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {caseMeta.currency}
            </div>
          </div>
          <div className="h-8 w-px bg-white/[0.08]" />
          <div className="text-right">
            <div className="text-zinc-500 text-[10px]">BANK LINE ID</div>
            <div className="text-zinc-300">{caseMeta.bankLineId}</div>
          </div>
        </div>
      </div>

      {/* Horizontal Lifecycle Progress Pipeline */}
      <HorizontalPipeline currentStepId="controller" />

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Revision Diff & Narrative (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <RevisionDiffViewer
            rev1={rev1}
            rev2={rev2}
            activeRevIndex={activeRevIndex}
            onSelectRev={setActiveRevIndex}
          />

          <CitationInspector citations={currentProposal.citations} />
        </div>

        {/* Right Column: CI Control Evaluation Matrix & Ledger Sandbox (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <ControlChecklist
            report={currentProposal.controlReport}
            activeRevIndex={activeRevIndex}
          />

          <SpotlightCard className="p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
              <span className="text-xs font-semibold text-zinc-300 font-mono">
                Sandbox Ledger Posting Gate
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                Balanced (No Escapes)
              </span>
            </div>
            <div className="text-xs text-zinc-400 leading-relaxed">
              Once approved by the human controller, journal entries are written directly to Verity’s
              hash-linked sandbox ledger. Rerunning reconciliation guarantees zero discrepancy.
            </div>
            <div className="rounded bg-black/40 p-2 text-[11px] font-mono text-zinc-400 flex items-center justify-between">
              <span>Parent Hash:</span>
              <span className="text-emerald-400">0x39a1c...b092</span>
            </div>
          </SpotlightCard>
        </div>
      </div>

      {/* Floating Controller Command Dock */}
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
