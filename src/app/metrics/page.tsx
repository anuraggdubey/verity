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
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AppPageHeader } from '../../components/app/AppPageHeader';
import { AppShell } from '../../components/app/AppShell';
import { SpotlightCard } from '../../components/ui/SpotlightCard';
import type { DashboardPayload } from '@/lib/metrics/types';

type KpiCard = {
  label: string;
  value: string;
  meaning: string;
  icon: React.ElementType;
  tone?: 'good' | 'warn' | 'neutral';
};

export default function MetricsDashboardPage() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTechnical, setShowTechnical] = useState(false);

  useEffect(() => {
    fetch('/api/metrics')
      .then((res) => res.json())
      .then((body) => setData(body))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <AppShell>
        <div className="py-16 text-sm text-zinc-500">Loading your dashboard…</div>
      </AppShell>
    );
  }

  const { summary, benchmarkRuns, heldOut, controlPRReplay, benchmarkIsSynthetic, packVersion } = data;

  const safetyKpis: KpiCard[] = [
    {
      label: 'Missed urgent cases',
      value: summary.unsafeEscapes.toString(),
      meaning: 'Missed escalations.',
      icon: ShieldAlert,
      tone: summary.unsafeEscapes > 0 ? 'warn' : 'good',
    },
    {
      label: 'Good proposals blocked',
      value: summary.falsePositives.toString(),
      meaning: 'False blocks on good proposals.',
      icon: AlertTriangle,
      tone: summary.falsePositives > 0 ? 'warn' : 'good',
    },
  ];

  const efficiencyKpis: KpiCard[] = [
    {
      label: 'Handled without you',
      value: summary.safeAutoClearCoverage,
      meaning: 'Auto-cleared without review.',
      icon: CheckCircle2,
      tone: 'good',
    },
    {
      label: 'Needed your review',
      value: summary.controllerTouchRate,
      meaning: 'Required controller decision.',
      icon: Activity,
      tone: 'neutral',
    },
    {
      label: 'Fixed after feedback',
      value: summary.repairSuccessRate,
      meaning: 'Repaired after failed checks.',
      icon: TrendingUp,
      tone: 'good',
    },
  ];

  const opsKpis: KpiCard[] = [
    {
      label: 'Typical response time',
      value: `${summary.averageLatencyMs}ms`,
      meaning: 'Average AI step time.',
      icon: Clock,
      tone: 'neutral',
    },
    {
      label: 'Cost per case',
      value: summary.averageCostPerCase,
      meaning: `${data.metrics.operational.modelCalls} model calls.`,
      icon: DollarSign,
      tone: 'neutral',
    },
  ];

  return (
    <AppShell className="space-y-8">
      <AppPageHeader
        title="Metrics"
        badges={[
          { label: `Rules ${packVersion}`, tone: 'neutral' },
          ...(benchmarkIsSynthetic
            ? [{ label: 'Demo', tone: 'amber' as const }]
            : []),
        ]}
      />

      {controlPRReplay?.regression && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
          <p>
            Rule update reduced auto-clear ({controlPRReplay.autoClearBefore} →{' '}
            {controlPRReplay.autoClearAfter}). Review before merging.
          </p>
        </div>
      )}

      <section className="space-y-4">
        <h2 className="section-label">Safety</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {safetyKpis.map((kpi) => (
            <KpiCard key={kpi.label} {...kpi} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="section-label">Efficiency</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {efficiencyKpis.map((kpi) => (
            <KpiCard key={kpi.label} {...kpi} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="section-label">Operations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {opsKpis.map((kpi) => (
            <KpiCard key={kpi.label} {...kpi} />
          ))}
        </div>
      </section>

      {heldOut && (
        <SpotlightCard className="p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.06] pb-3">
            <div>
              <h3 className="text-base font-semibold text-zinc-900">Spot-check case</h3>
              <p className="text-sm text-zinc-500 mt-1">{heldOut.summary}</p>
            </div>
            <Link
              href={`/cases/${heldOut.caseId}`}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Open {heldOut.caseId} →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="rounded-lg border border-black/[0.06] bg-zinc-50 p-4">
              <div className="text-xs font-medium text-zinc-500 mb-2">With older rules</div>
              <p className="text-zinc-700 leading-relaxed">{heldOut.underV1}</p>
            </div>
            <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4">
              <div className="text-xs font-medium text-blue-700 mb-2">With current rules</div>
              <p className="text-zinc-700 leading-relaxed">{heldOut.underV2}</p>
            </div>
          </div>
          {heldOut.note && <p className="text-xs text-zinc-500">{heldOut.note}</p>}
        </SpotlightCard>
      )}

      <section className="space-y-3">
        <button
          type="button"
          onClick={() => setShowTechnical((v) => !v)}
          className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          {showTechnical ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {showTechnical ? 'Hide technical details' : 'Show technical details'}
          <span className="text-zinc-400 font-normal">({benchmarkRuns.length} test scenarios)</span>
        </button>

        {showTechnical && (
          <SpotlightCard className="p-6 space-y-4">
            <p className="text-sm text-zinc-500">
              Each row is a historical proposal re-tested against old vs new control rules.{' '}
              {summary.benchmarkRunCount} cases in the current queue.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-black/[0.06] text-zinc-500 text-xs">
                    <th className="pb-2.5 font-medium">Case</th>
                    <th className="pb-2.5 font-medium">What we tested</th>
                    <th className="pb-2.5 font-medium">Old rules</th>
                    <th className="pb-2.5 font-medium">New rules</th>
                    <th className="pb-2.5 text-right font-medium">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  {benchmarkRuns.map((run) => (
                    <tr key={run.proposalId} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="py-3 font-medium text-blue-600">
                        <Link href={`/cases/${run.caseId}`} className="hover:underline">
                          {run.caseId}
                        </Link>
                      </td>
                      <td className="py-3 text-zinc-600 max-w-xs">{run.category}</td>
                      <td className="py-3 text-zinc-500">{run.v1Status}</td>
                      <td className="py-3 text-zinc-800">{run.v2Status}</td>
                      <td className="py-3 text-right">
                        {run.regression ? (
                          <span className="text-rose-600 font-medium">Regression</span>
                        ) : (
                          <span className="text-emerald-600 font-medium">OK</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SpotlightCard>
        )}
      </section>
    </AppShell>
  );
}

function KpiCard({ label, value, meaning, icon: Icon, tone = 'neutral' }: KpiCard) {
  const valueColor =
    tone === 'good' ? 'text-emerald-700' : tone === 'warn' ? 'text-amber-700' : 'text-zinc-900';

  return (
    <SpotlightCard className="p-5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-zinc-600">{label}</span>
        <Icon className="h-4 w-4 text-zinc-300 shrink-0" />
      </div>
      <div className={`text-3xl font-semibold tracking-tight ${valueColor}`}>{value}</div>
      <p className="text-sm text-zinc-500 leading-relaxed">{meaning}</p>
    </SpotlightCard>
  );
}
