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
      title: '1. Bank feed',
      subtitle: 'Payment received',
      status: 'passed',
      icon: FileText,
      meta: 'Imported',
      details: 'The bank line was imported from your statement.',
    },
    {
      id: 'match',
      title: '2. Auto-match',
      subtitle: 'Find invoices',
      status: 'passed',
      icon: CheckCircle2,
      meta: 'Exception found',
      details: 'Automatic matching flagged this as needing a human — amounts or dates did not line up exactly.',
    },
    {
      id: 'agent',
      title: '3. AI research',
      subtitle: 'Gather evidence',
      status: 'passed',
      icon: Cpu,
      meta: 'Proposal drafted',
      details: 'The AI looked up bank lines, ledger entries, and FX rates to suggest how to book this payment.',
    },
    {
      id: 'controls',
      title: '4. Policy checks',
      subtitle: 'Automated rules',
      status: 'passed',
      icon: ShieldAlert,
      meta: 'Checks run',
      details: 'Built-in rules verified evidence, accounts, and FX policy. Failed checks trigger a revised proposal.',
    },
    {
      id: 'controller',
      title: '5. Your review',
      subtitle: 'Approve or reject',
      status: 'active',
      icon: AlertTriangle,
      meta: 'Waiting on you',
      details: 'You confirm the proposal is correct before anything posts.',
    },
    {
      id: 'ledger',
      title: '6. Post entries',
      subtitle: 'Sandbox ledger',
      status: 'pending',
      icon: Lock,
      meta: 'After approval',
      details: 'Approved entries are written to a test ledger for reconciliation.',
    },
  ];

  return (
    <div className={`w-full overflow-hidden rounded-xl border border-black/[0.06] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${className}`}>
      <div className="flex items-center justify-between pb-3 border-b border-black/[0.04] mb-4">
        <h4 className="text-sm font-medium text-zinc-800">Where this case is in the process</h4>
        <span className="text-xs text-zinc-400">Bank → match → propose → check → you → post</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {steps.map((step, idx) => {
          const Icon = step.icon;

          const statusStyles = {
            passed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
            active: 'border-amber-200 bg-amber-50 text-amber-700 ring-1 ring-amber-200',
            blocked: 'border-rose-200 bg-rose-50 text-rose-700',
            pending: 'border-black/[0.06] bg-zinc-50 text-zinc-400',
          };

          return (
            <React.Fragment key={step.id}>
              <div
                onMouseEnter={() => setActiveTooltip(step.id)}
                onMouseLeave={() => setActiveTooltip(null)}
                className={`relative flex-shrink-0 w-44 rounded-lg border p-3 transition-colors cursor-default ${
                  statusStyles[step.status]
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5" />
                    <span className="text-[11px] font-medium tracking-tight">{step.title}</span>
                  </div>
                  {step.status === 'passed' && (
                    <span className="text-[9px] font-mono font-medium px-1 rounded bg-emerald-100 text-emerald-700">
                      PASS
                    </span>
                  )}
                  {step.status === 'active' && (
                    <span className="text-[9px] font-mono font-medium px-1 rounded bg-amber-100 text-amber-700">
                      GATE
                    </span>
                  )}
                </div>

                <div className="text-[11px] font-medium truncate opacity-80">{step.subtitle}</div>
                <div className="text-[10px] font-mono opacity-60 mt-0.5">{step.meta}</div>

                {activeTooltip === step.id && (
                  <div className="absolute left-0 bottom-full mb-2 w-56 z-50 rounded-lg border border-black/[0.08] bg-white p-2.5 text-xs text-zinc-600 shadow-lg">
                    <p className="font-medium text-zinc-900 mb-1">{step.title}</p>
                    <p className="text-[11px] leading-relaxed">{step.details}</p>
                  </div>
                )}
              </div>

              {idx < steps.length - 1 && (
                <div className="flex-shrink-0 text-zinc-300 px-0.5">
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
