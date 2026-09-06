'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ShieldAlert,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { SpotlightCard } from '../../components/ui/SpotlightCard';
import type { DashboardPayload } from '@/lib/metrics/dashboard';

export default function MetricsDashboardPage() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/metrics')
      .then((res) => res.json())
      .then((body) => setData(body))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="app-page max-w-7xl mx-auto py-12 text-sm text-zinc-500 font-mono">
        Loading metrics…
      </div>
    );
  }

  const { summary, benchmarkRuns, heldOut, controlPRReplay, benchmarkIsSynthetic, packVersion } = data;

  const kpis = [
    {
      label: 'Unsafe Escapes',
      value: summary.unsafeEscapes.toString(),
      subtext: 'Escalation-worthy cases not routed to escalate',
      icon: ShieldAlert,
    },
    {
      label: 'Safe Auto-Clear Rate',
      value: summary.safeAutoClearCoverage,
      subtext: 'Permitted auto-clears that cleared correctly',
      icon: CheckCircle2,
    },
    {
      label: 'Controller Touch Rate',
      value: summary.controllerTouchRate,
      subtext: 'Cases with a controller decision',
      icon: Activity,
    },
    {
      label: 'CI Repair Success Rate',
      value: summary.repairSuccessRate,
      subtext: 'Blocked proposals fixed on next revision',
      icon: TrendingUp,
    },
    {
      label: 'False Positives',
      value: summary.falsePositives.toString(),
      subtext: 'Counterexamples blocked after control PR merge',
      icon: AlertTriangle,
    },
    {
      label: 'Median Latency',
      value: `${summary.averageLatencyMs}ms`,
      subtext: 'Model calls from event store',
      icon: Clock,
    },
    {
      label: 'Cost Per Case',
      value: summary.averageCostPerCase,
      subtext: `${data.metrics.operational.modelCalls} model calls total`,
      icon: DollarSign,
    },
  ];

  return (
    <div className="app-page max-w-7xl mx-auto space-y-8">
      <div className="border-b border-black/[0.06] pb-6">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-xl font-semibold text-zinc-950 tracking-[-0.02em]">
            Benchmark Telemetry
          </h1>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Audit Store
          </span>
          {benchmarkIsSynthetic && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              Synthetic benchmark — not practitioner-reviewed
            </span>
          )}
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">
            Pack {packVersion}
          </span>
        </div>
        <p className="text-sm text-zinc-500 mt-1.5 max-w-2xl">
          Raw counts derived strictly from the append-only event store. No invented controller-minutes
          or synthetic claims.
        </p>
      </div>

      {controlPRReplay?.regression && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <strong>Auto-clear regression detected.</strong> Control pack v2 reduced auto-clear coverage
            from {controlPRReplay.autoClearBefore} to {controlPRReplay.autoClearAfter} cases.
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <SpotlightCard key={idx} className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider">
                  {kpi.label}
                </span>
                <Icon className="h-4 w-4 text-zinc-300" />
              </div>
              <div className="text-2xl sm:text-3xl font-semibold text-zinc-900 font-mono tracking-tight">
                {kpi.value}
              </div>
              <div className="text-[11px] text-zinc-500">{kpi.subtext}</div>
            </SpotlightCard>
          );
        })}
      </div>

      {heldOut && (
        <SpotlightCard className="p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.06] pb-3">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">
                Held-Out Case: {heldOut.caseId}
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">{heldOut.summary}</p>
            </div>
            <Link
              href={`/cases/${heldOut.caseId}`}
              className="text-xs font-medium text-emerald-700 hover:underline"
            >
              Open case →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="rounded-lg border border-black/[0.06] bg-zinc-50 p-4">
              <div className="text-[11px] font-mono uppercase text-zinc-400 mb-2">Under Pack v1</div>
              <p className="text-zinc-700 leading-relaxed">{heldOut.underV1}</p>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <div className="text-[11px] font-mono uppercase text-emerald-600 mb-2">Under Pack v2</div>
              <p className="text-zinc-700 leading-relaxed">{heldOut.underV2}</p>
            </div>
          </div>
          {heldOut.note && (
            <p className="text-[11px] font-mono text-zinc-400">{heldOut.note}</p>
          )}
        </SpotlightCard>
      )}

      <SpotlightCard className="p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.06] pb-3">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">
              Control Engine Expectations ({benchmarkRuns.length} proposals)
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">Pack v1.0 vs v2.0 — from frozen replay fixtures</p>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            {summary.benchmarkRunCount} total cases in queue
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-black/[0.06] text-zinc-400 text-[11px]">
                <th className="pb-2.5 font-medium">Case ID</th>
                <th className="pb-2.5 font-medium">Proposal</th>
                <th className="pb-2.5 font-medium">Expectation</th>
                <th className="pb-2.5 font-medium">Pack v1</th>
                <th className="pb-2.5 font-medium">Pack v2</th>
                <th className="pb-2.5 text-right font-medium">Regression</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {benchmarkRuns.map((run) => (
                <tr key={run.proposalId} className="hover:bg-zinc-50 transition-colors">
                  <td className="py-3 font-medium text-emerald-700">
                    <Link href={`/cases/${run.caseId}`} className="hover:underline">
                      {run.caseId}
                    </Link>
                  </td>
                  <td className="py-3 text-zinc-500">{run.proposalId}</td>
                  <td className="py-3 text-zinc-600 font-sans max-w-xs truncate">{run.category}</td>
                  <td className="py-3 text-zinc-400">{run.v1Status}</td>
                  <td className="py-3 text-zinc-800 font-medium">{run.v2Status}</td>
                  <td className="py-3 text-right">
                    {run.regression ? (
                      <span className="text-rose-600 font-medium">REGRESSION</span>
                    ) : (
                      <span className="text-emerald-600 font-medium">Clean</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SpotlightCard>
    </div>
  );
}
