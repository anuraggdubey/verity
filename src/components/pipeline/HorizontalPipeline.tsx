'use client';

import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, ArrowRight, ShieldAlert, FileText, Cpu, Lock } from 'lucide-react';

export interface PipelineStep {
  id: string;
  title: string;
  subtitle: string;
  status: 'passed' | 'active' | 'blocked' | 'pending';
  icon: React.ElementType;
  meta: string;
  details: string;
}

interface HorizontalPipelineProps {
  currentStepId?: string;
  className?: string;
}

export function HorizontalPipeline({
  currentStepId = 'controls',
  className = '',
}: HorizontalPipelineProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const steps: PipelineStep[] = [
    {
      id: 'ingest',
      title: '1. Ingestion',
      subtitle: 'Bank CSV',
      status: 'passed',
      icon: FileText,
      meta: '$14,200.00 USD',
      details: 'Ingested raw MT940 wire line BNK-2026-08-9921 from Acme Europe B.V.',
    },
    {
      id: 'match',
      title: '2. Deterministic Match',
      subtitle: 'Rule Engine',
      status: 'passed',
      icon: CheckCircle2,
      meta: 'Unmatched (€180 Diff)',
      details: 'Zero LLM. Exact invoice matching found 1 EUR invoice with FX variance. Emitted as Exception.',
    },
    {
      id: 'agent',
      title: '3. Agent Worker',
      subtitle: 'Tool Execution',
      status: 'passed',
      icon: Cpu,
      meta: '3 Tools Queried',
      details: 'Worker called get_bank_line, search_ledger, and get_approved_fx_rate to draft proposal.',
    },
    {
      id: 'controls',
      title: '4. CI Control Gate',
      subtitle: '3 Control Families',
      status: 'passed',
      icon: ShieldAlert,
      meta: 'Rev 1 ✖ → Rev 2 ✔',
      details: 'Evaluation blocked Rev 1 (VERITY-FX-003: unapproved spot rate). Agent repaired to Rev 2 with official ECB fix.',
    },
    {
      id: 'controller',
      title: '5. Controller Gate',
      subtitle: 'Human Approval',
      status: 'active',
      icon: AlertTriangle,
      meta: 'Merge Ready',
      details: 'Human Controller review required before posting. Evidence lineage verified.',
    },
    {
      id: 'ledger',
      title: '6. Sandbox Ledger',
      subtitle: 'Immutable Close',
      status: 'pending',
      icon: Lock,
      meta: 'Hash-Linked GL',
      details: 'Upon controller approval, writes balanced double-entry journal to sandbox ledger.',
    },
  ];

  return (
    <div className={`w-full overflow-hidden rounded-xl border border-white/[0.08] bg-[#0c0d12]/90 p-4 ${className}`}>
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Reconciliation Lifecycle Pipeline
          </h4>
        </div>
        <span className="text-[11px] font-mono text-zinc-500">
          Flow: Ingest → Rule Gate → CI Repair Loop → Sandbox Merge
        </span>
      </div>

      {/* Horizontal Scroll Track */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCurrent = step.id === currentStepId;

          const statusStyles = {
            passed: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400',
            active: 'border-amber-500/50 bg-amber-950/30 text-amber-300 ring-1 ring-amber-400/30',
            blocked: 'border-rose-500/50 bg-rose-950/30 text-rose-400',
            pending: 'border-white/[0.06] bg-white/[0.02] text-zinc-500',
          };

          return (
            <React.Fragment key={step.id}>
              {/* Step Node Card */}
              <div
                onMouseEnter={() => setActiveTooltip(step.id)}
                onMouseLeave={() => setActiveTooltip(null)}
                className={`relative flex-shrink-0 w-48 rounded-lg border p-3 transition-all cursor-pointer ${
                  statusStyles[step.status]
                } ${isCurrent ? 'shadow-[0_0_15px_rgba(245,158,11,0.15)]' : ''}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5" />
                    <span className="text-xs font-semibold tracking-tight">{step.title}</span>
                  </div>
                  {step.status === 'passed' && (
                    <span className="text-[10px] font-mono font-medium px-1 rounded bg-emerald-500/20 text-emerald-300">
                      PASS
                    </span>
                  )}
                  {step.status === 'active' && (
                    <span className="text-[10px] font-mono font-medium px-1 rounded bg-amber-500/20 text-amber-300 animate-pulse">
                      GATE
                    </span>
                  )}
                  {step.status === 'pending' && (
                    <span className="text-[10px] font-mono text-zinc-600">IDLE</span>
                  )}
                </div>

                <div className="text-[11px] text-zinc-300 font-medium truncate">{step.subtitle}</div>
                <div className="text-[10px] font-mono text-zinc-400 mt-1">{step.meta}</div>

                {/* Tooltip on hover */}
                {activeTooltip === step.id && (
                  <div className="absolute left-0 bottom-full mb-2 w-60 z-50 rounded-lg border border-white/[0.12] bg-[#161822] p-2.5 text-xs text-zinc-200 shadow-xl backdrop-blur-md">
                    <p className="font-semibold text-emerald-400 mb-1">{step.title} Details</p>
                    <p className="text-[11px] leading-relaxed text-zinc-300">{step.details}</p>
                  </div>
                )}
              </div>

              {/* Connecting arrow */}
              {idx < steps.length - 1 && (
                <div className="flex-shrink-0 text-zinc-600 px-1">
                  <ArrowRight className="h-4 w-4 stroke-[1.5]" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
