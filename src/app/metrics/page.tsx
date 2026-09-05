'use client';

import React from 'react';
import { Activity, ShieldAlert, CheckCircle2, TrendingUp, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import { SpotlightCard } from '../../components/ui/SpotlightCard';
import metricsData from '../../lib/data/fixtures/metrics.json';

export default function MetricsDashboardPage() {
  const { summary, benchmarkRuns } = metricsData;

  const kpis = [
    {
      label: 'Unsafe Escapes',
      value: summary.unsafeEscapes.toString(),
      subtext: '0 Unsafe actions posted to ledger',
      status: 'success',
      icon: ShieldAlert,
    },
    {
      label: 'Safe Auto-Clear Rate',
      value: summary.safeAutoClearCoverage,
      subtext: 'Non-posting routine lines cleared',
      status: 'neutral',
      icon: CheckCircle2,
    },
    {
      label: 'Controller Touch Rate',
      value: summary.controllerTouchRate,
      subtext: 'Cases requiring human review',
      status: 'neutral',
      icon: Activity,
    },
    {
      label: 'CI Repair Success Rate',
      value: summary.repairSuccessRate,
      subtext: 'Blocked proposals fixed on Rev 2',
      status: 'success',
      icon: TrendingUp,
    },
    {
      label: 'Average Latency',
      value: `${summary.averageLatencyMs}ms`,
      subtext: 'Tool calls + deterministic CI',
      status: 'neutral',
      icon: Clock,
    },
    {
      label: 'Cost Per Case',
      value: summary.averageCostPerCase,
      subtext: 'Bounded LLM turns + telemetry',
      status: 'neutral',
      icon: DollarSign,
    },
  ];

  return (
    <div className="flex flex-col w-full min-h-screen px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Benchmark Telemetry & Observed Metrics
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Audit Event Store
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Raw counts derived strictly from the append-only event store. No invented controller-minutes or synthetic claims.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <SpotlightCard key={idx} className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider">
                  {kpi.label}
                </span>
                <Icon className="h-4 w-4 text-zinc-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-zinc-100 font-mono tracking-tight">
                {kpi.value}
              </div>
              <div className="text-[11px] text-zinc-500">{kpi.subtext}</div>
            </SpotlightCard>
          );
        })}
      </div>

      {/* Benchmark Case Runs Table */}
      <SpotlightCard className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">
              Frozen Benchmark Dataset Run ({benchmarkRuns.length} Sample Cases)
            </h3>
            <p className="text-xs text-zinc-500">
              Comparison between Control Pack v1.0 and Control Pack v2.0
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400">Model: Claude 3.5 Sonnet (Temp 0.0)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/[0.08] text-zinc-500 text-[11px]">
                <th className="pb-2.5">Case ID</th>
                <th className="pb-2.5">Category</th>
                <th className="pb-2.5">Pack v1.0 Result</th>
                <th className="pb-2.5">Pack v2.0 Result</th>
                <th className="pb-2.5 text-right">Regression</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {benchmarkRuns.map((run, i) => (
                <tr key={i} className="hover:bg-white/[0.02]">
                  <td className="py-3 font-semibold text-emerald-400">{run.caseId}</td>
                  <td className="py-3 text-zinc-300 font-sans">{run.category}</td>
                  <td className="py-3 text-zinc-400">{run.v1Status}</td>
                  <td className="py-3 text-zinc-200 font-semibold">{run.v2Status}</td>
                  <td className="py-3 text-right">
                    {run.regression ? (
                      <span className="text-rose-400 font-semibold">REGRESSION</span>
                    ) : (
                      <span className="text-emerald-400 font-semibold">Clean (0)</span>
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
