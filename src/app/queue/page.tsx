'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Search, Filter, Cpu, RefreshCw } from 'lucide-react';
import type { ReconciliationStatus } from '@/lib/contracts/types';
import type { CaseRow } from '@/lib/store/types';
import { AppPageHeader } from '../../components/app/AppPageHeader';
import { AppShell } from '../../components/app/AppShell';
import { SpotlightCard } from '../../components/ui/SpotlightCard';
import { StatusPill } from '../../components/ui/StatusPill';
import { ResetDemoButton, RunButtons } from '../../components/app/RunActions';
import { WorkerActivity } from '../../components/app/WorkerActivity';

type QueueCase = {
  id: string;
  title: string;
  counterparty: string;
  amount: number;
  lane: 'auto' | 'review' | 'escalate';
  state: string;
  workerActive: boolean;
  workerId?: string;
  blocked: boolean;
  revisionCount: number;
  decided: boolean;
};

function laneFor(row: CaseRow): 'auto' | 'review' | 'escalate' {
  if (row.case.state === 'escalated' || row.lane === 'escalate') return 'escalate';
  if (row.lane === 'auto' || row.case.state === 'auto_cleared') return 'auto';
  return 'review';
}

function toQueueCase(row: CaseRow): QueueCase {
  const bank = row.bankLine;
  return {
    id: row.case.id,
    title: row.case.title ?? row.case.summary,
    counterparty: row.case.counterparty ?? bank?.counterparty ?? '—',
    amount: row.case.amount ?? Math.abs(bank?.amount ?? 0),
    lane: laneFor(row),
    state: row.case.state,
    workerActive: row.case.state === 'investigating',
    workerId: row.case.workerId,
    blocked: row.blocked,
    revisionCount: row.revisionCount,
    decided: Boolean(row.decision),
  };
}

export default function ExceptionQueuePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cases, setCases] = useState<QueueCase[]>([]);
  const [reconciliation, setReconciliation] = useState<ReconciliationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [investigating, setInvestigating] = useState<Set<string>>(new Set());
  const [traceLines, setTraceLines] = useState<Record<string, string>>({});

  const loadCases = useCallback(async () => {
    const res = await fetch('/api/cases');
    const body = await res.json();
    if (!res.ok) return;
    const rows = (body.cases ?? []) as CaseRow[];
    setCases(rows.map((row) => toQueueCase(row)));
    setReconciliation(body.reconciliation ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadCases();
  }, [loadCases]);

  useEffect(() => {
    const source = new EventSource('/api/stream');
    source.addEventListener('trace', (event) => {
      try {
        const entry = JSON.parse(event.data) as { caseId: string; name: string; kind: string };
        setTraceLines((prev) => ({
          ...prev,
          [entry.caseId]: `Working: ${entry.name}`,
        }));
        setInvestigating((prev) => new Set(prev).add(entry.caseId));
      } catch {
        // ignore malformed events
      }
    });
    return () => source.close();
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return cases
      .filter(
        (c) =>
          !q ||
          c.id.toLowerCase().includes(q) ||
          c.counterparty.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q),
      )
      .map((c) => ({ ...c, workerActive: c.workerActive || investigating.has(c.id) }));
  }, [cases, searchQuery, investigating]);

  const lanes = useMemo(
    () => ({
      auto: filtered.filter((c) => c.lane === 'auto'),
      review: filtered.filter((c) => c.lane === 'review'),
      escalate: filtered.filter((c) => c.lane === 'escalate'),
    }),
    [filtered],
  );

  const activeCount = cases.filter((c) => c.lane !== 'auto' && c.state !== 'approved').length;

  const headerActions = (
    <>
      <ResetDemoButton onDone={loadCases} />
      <button
        onClick={() => loadCases()}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/[0.08] bg-white text-zinc-400 hover:text-zinc-700 transition-colors"
        title="Refresh"
      >
        <RefreshCw className="h-4 w-4" />
      </button>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Search company or case…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9 pl-9 pr-3 text-sm bg-white border border-black/[0.08] rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 w-52"
        />
      </div>
      <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-black/[0.08] bg-white text-zinc-500 text-sm font-medium hover:border-black/[0.12] transition-colors">
        <Filter className="h-4 w-4" />
        <span>All entities</span>
      </button>
    </>
  );

  return (
    <AppShell className="space-y-8">
      <AppPageHeader
        title="Exception inbox"
        badges={[
          { label: loading ? '…' : `${activeCount} open`, tone: 'blue' },
          ...(reconciliation?.closed
            ? [{ label: 'Closed', tone: 'emerald' as const }]
            : []),
        ]}
        actions={headerActions}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <LaneColumn
          title="Auto-cleared"
          color="emerald"
          cases={lanes.auto}
          emptyLabel="None"
          onRunDone={loadCases}
        />

        <LaneColumn
          title="Review"
          color="amber"
          cases={lanes.review}
          emptyLabel="None"
          linkable
          onRunDone={loadCases}
          traceLines={traceLines}
        />

        <LaneColumn
          title="Escalated"
          color="rose"
          cases={lanes.escalate}
          emptyLabel="None"
          linkable
          onRunDone={loadCases}
          traceLines={traceLines}
        />
      </div>

      <WorkerActivity />
    </AppShell>
  );
}

function LaneColumn({
  title,
  color,
  cases,
  emptyLabel,
  linkable,
  onRunDone,
  traceLines,
}: {
  title: string;
  color: 'emerald' | 'amber' | 'rose';
  cases: QueueCase[];
  emptyLabel: string;
  linkable?: boolean;
  onRunDone?: () => void | Promise<void>;
  traceLines?: Record<string, string>;
}) {
  const border = color === 'emerald' ? 'border-emerald-200' : color === 'amber' ? 'border-amber-200' : 'border-rose-200';
  const dot = color === 'emerald' ? 'bg-emerald-500' : color === 'amber' ? 'bg-amber-500' : 'bg-rose-500';
  const heading = color === 'emerald' ? 'text-emerald-800' : color === 'amber' ? 'text-amber-800' : 'text-rose-800';
  const count = color === 'emerald' ? 'text-emerald-700' : color === 'amber' ? 'text-amber-700' : 'text-rose-700';

  return (
    <div className="flex flex-col space-y-3">
      <div className={`flex items-center justify-between px-1 pb-2 border-b ${border}`}>
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${dot}`} />
          <h3 className={`text-sm font-semibold ${heading}`}>{title}</h3>
        </div>
        <span className={`text-sm font-medium ${count}`}>{cases.length}</span>
      </div>

      <div className="space-y-3">
        {cases.length === 0 && <p className="text-sm text-zinc-400 px-1">{emptyLabel}</p>}
        {cases.map((c) => {
          const isFlagship = c.id === 'CASE-001';
          const card = (
            <SpotlightCard
              className={`p-4 space-y-3 transition-all ${linkable ? 'cursor-pointer group' : ''} ${
                isFlagship && linkable ? 'border-blue-200 bg-blue-50/20' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-medium text-zinc-400 truncate">{c.id}</span>
                  {isFlagship && linkable && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 shrink-0">
                      Try demo
                    </span>
                  )}
                </div>
                <StatusPill
                  status={c.lane === 'auto' ? 'auto' : c.lane === 'escalate' ? 'escalate' : 'review'}
                  size="sm"
                  pulse={c.workerActive}
                />
              </div>

              <div
                className={`text-sm font-medium text-zinc-900 leading-snug ${
                  linkable ? 'group-hover:text-blue-700 transition-colors' : ''
                } line-clamp-2`}
              >
                {c.title}
              </div>

              {c.workerActive && (
                <div className="flex items-center gap-2 text-xs text-blue-800 bg-blue-50 border border-blue-100 rounded-lg p-2">
                  <Cpu className="h-3.5 w-3.5 animate-spin shrink-0" />
                  <span>{traceLines?.[c.id] ?? 'AI is researching this case…'}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-zinc-500 pt-2 border-t border-black/[0.04]">
                <span className="truncate pr-2">{c.counterparty}</span>
                <span className="font-semibold text-zinc-900 shrink-0">
                  ${c.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {linkable && !c.decided && (
                <div className="mt-1">
                  <RunButtons caseId={c.id} onDone={onRunDone} compact />
                </div>
              )}

              {linkable && c.revisionCount > 0 && (
                <div className="flex items-center justify-end text-xs font-medium text-blue-600 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Review proposal</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              )}
            </SpotlightCard>
          );

          if (linkable && c.revisionCount > 0) {
            return (
              <Link key={c.id} href={`/cases/${c.id}`}>
                {card}
              </Link>
            );
          }
          return <div key={c.id}>{card}</div>;
        })}
      </div>
    </div>
  );
}
