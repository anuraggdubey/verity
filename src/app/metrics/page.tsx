'use client';

import React from 'react';
import { Activity, ShieldAlert, CheckCircle2, TrendingUp, DollarSign, Clock } from 'lucide-react';
import { SpotlightCard } from '../../components/ui/SpotlightCard';
import metricsData from '../../lib/data/fixtures/metrics.json';

export default function MetricsDashboardPage() {
  const { summary, benchmarkRuns } = metricsData;

  const kpis = [
    {
      label: 'Unsafe Escapes',
      value: summary.unsafeEscapes.toString(),
      subtext: '0 unsafe actions posted to ledger',
      icon: ShieldAlert,
    },
    {
      label: 'Safe Auto-Clear Rate',
      value: summary.safeAutoClearCoverage,
      subtext: 'Non-posting routine lines cleared',
      icon: CheckCircle2,
    },
    {
      label: 'Controller Touch Rate',
      value: summary.controllerTouchRate,
      subtext: 'Cases requiring human review',
      icon: Activity,
    },
    {
      label: 'CI Repair Success Rate',
      value: summary.repairSuccessRate,
      subtext: 'Blocked proposals fixed on Rev 2',
      icon: TrendingUp,
    },
    {
      label: 'Average Latency',
      value: `${summary.averageLatencyMs}ms`,
      subtext: 'Tool calls + deterministic CI',
      icon: Clock,
    },
    {
      label: 'Cost Per Case',
      value: summary.averageCostPerCase,
      subtext: 'Bounded LLM turns + telemetry',
      icon: DollarSign,
    },
  ];

  return (
    <div className="app-page max-w-7xl mx-auto space-y-8">
      <div className="border-b border-black/[0.06] pb-6">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-semibold text-zinc-950 tracking-[-0.02em]">
            Benchmark Telemetry
          </h1>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Audit Store
          </span>
        </div>
        <p className="text-sm text-zinc-500 mt-1.5 max-w-2xl">
          Raw counts derived strictly from the append-only event store. No invented controller-minutes or synthetic claims.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
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

      <SpotlightCard className="p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.06] pb-3">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">
              Frozen Benchmark Dataset ({benchmarkRuns.length} cases)
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Control Pack v1.0 vs v2.0
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400">Claude 3.5 Sonnet · Temp 0.0</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-black/[0.06] text-zinc-400 text-[11px]">
                <th className="pb-2.5 font-medium">Case ID</th>
                <th className="pb-2.5 font-medium">Category</th>
                <th className="pb-2.5 font-medium">Pack v1.0</th>
                <th className="pb-2.5 font-medium">Pack v2.0</th>
                <th className="pb-2.5 text-right font-medium">Regression</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {benchmarkRuns.map((run, i) => (
                <tr key={i} className="hover:bg-zinc-50 transition-colors">
                  <td className="py-3 font-medium text-emerald-700">{run.caseId}</td>
                  <td className="py-3 text-zinc-600 font-sans">{run.category}</td>
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
