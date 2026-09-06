'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Search, Filter, Cpu, RefreshCw } from 'lucide-react';
import type { ReconciliationStatus } from '@/lib/contracts/types';
import type { CaseRow } from '@/lib/store';
import { SpotlightCard } from '../../components/ui/SpotlightCard';
import { StatusPill } from '../../components/ui/StatusPill';

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
};

function laneFor(row: CaseRow): 'auto' | 'review' | 'escalate' {
  if (row.case.state === 'escalated' || row.lane === 'escalate') return 'escalate';
  if (row.lane === 'auto' || row.case.state === 'auto_cleared') return 'auto';
  return 'review';
}

function toQueueCase(row: CaseRow, investigating: Set<string>): QueueCase {
  const bank = row.bankLine;
  return {
    id: row.case.id,
    title: row.case.title ?? row.case.summary,
    counterparty: row.case.counterparty ?? bank?.counterparty ?? '—',
    amount: row.case.amount ?? Math.abs(bank?.amount ?? 0),
    lane: laneFor(row),
    state: row.case.state,
    workerActive: investigating.has(row.case.id) || row.case.state === 'investigating',
    workerId: row.case.workerId,
    blocked: row.blocked,
    revisionCount: row.revisionCount,
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
    setCases(rows.map((row) => toQueueCase(row, investigating)));
    setReconciliation(body.reconciliation ?? null);
    setLoading(false);
  }, [investigating]);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  useEffect(() => {
    const source = new EventSource('/api/stream');
    source.addEventListener('trace', (event) => {
      try {
        const entry = JSON.parse(event.data) as { caseId: string; name: string; kind: string };
        setTraceLines((prev) => ({
          ...prev,
          [entry.caseId]: `${entry.kind}: ${entry.name}`,
        }));
        setInvestigating((prev) => new Set(prev).add(entry.caseId));
      } catch {
        // ignore malformed events
      }
    });
    return () => source.close();
  }, []);

  async function investigate(caseId: string) {
    setInvestigating((prev) => new Set(prev).add(caseId));
    const res = await fetch(`/api/cases/${caseId}/investigate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ live: false }),
    });
    setInvestigating((prev) => {
      const next = new Set(prev);
      next.delete(caseId);
      return next;
    });
    if (res.ok) await loadCases();
  }

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return cases.filter(
      (c) =>
        !q ||
        c.id.toLowerCase().includes(q) ||
        c.counterparty.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q),
    );
  }, [cases, searchQuery]);

  const lanes = useMemo(
    () => ({
      auto: filtered.filter((c) => c.lane === 'auto'),
      review: filtered.filter((c) => c.lane === 'review'),
      escalate: filtered.filter((c) => c.lane === 'escalate'),
    }),
    [filtered],
  );

  const activeCount = cases.filter((c) => c.lane !== 'auto' && c.state !== 'approved').length;

  return (
    <div className="app-page max-w-7xl mx-auto space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-black/[0.06] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold text-zinc-950 tracking-[-0.02em]">
              Exception Triage Queue
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">
              {loading ? '…' : `${activeCount} active`}
            </span>
            {reconciliation?.closed && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Reconciliation closed
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-500 mt-1.5 max-w-xl">
            Deterministic matching clears routine items. Unresolved lines route into Auto, Review, or Escalate lanes.
            {reconciliation && (
              <span className="block mt-1 font-mono text-[11px] text-zinc-400">
                {reconciliation.autoClearedCount} auto-cleared · {reconciliation.exceptionCount} exceptions ·{' '}
                {reconciliation.unresolvedCount} unresolved
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadCases()}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/[0.08] bg-white text-zinc-400 hover:text-zinc-700 transition-colors"
            title="Refresh queue"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search counterparty or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 pr-3 text-xs bg-white border border-black/[0.08] rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-300 w-52"
            />
          </div>
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-black/[0.08] bg-white text-zinc-500 text-xs font-medium hover:border-black/[0.12] transition-colors">
            <Filter className="h-3.5 w-3.5" />
            <span>All Entities</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <LaneColumn
          title="Auto-Cleared"
          color="emerald"
          description="Non-posting exact matches & verified timing differences."
          cases={lanes.auto}
          emptyLabel="No auto-cleared cases"
        />

        <LaneColumn
          title="Controller Review"
          color="amber"
          description="Agent-proposed journal lines with passed controls awaiting human merge."
          cases={lanes.review}
          emptyLabel="No cases in review"
          linkable
          onInvestigate={investigate}
          traceLines={traceLines}
        />

        <LaneColumn
          title="Escalations"
          color="rose"
          description="Critical materiality, suspected duplicate wire, or contradictory evidence."
          cases={lanes.escalate}
          emptyLabel="No escalations"
          linkable
        />
      </div>
    </div>
  );
}

function LaneColumn({
  title,
  color,
  description,
  cases,
  emptyLabel,
  linkable,
  onInvestigate,
  traceLines,
}: {
  title: string;
  color: 'emerald' | 'amber' | 'rose';
  description: string;
  cases: QueueCase[];
  emptyLabel: string;
  linkable?: boolean;
  onInvestigate?: (id: string) => void;
  traceLines?: Record<string, string>;
}) {
  const border = color === 'emerald' ? 'border-emerald-200' : color === 'amber' ? 'border-amber-200' : 'border-rose-200';
  const dot = color === 'emerald' ? 'bg-emerald-500' : color === 'amber' ? 'bg-amber-500' : 'bg-rose-500';
  const heading = color === 'emerald' ? 'text-emerald-700' : color === 'amber' ? 'text-amber-700' : 'text-rose-700';
  const count = color === 'emerald' ? 'text-emerald-600' : color === 'amber' ? 'text-amber-600' : 'text-rose-600';

  return (
    <div className="flex flex-col space-y-3">
      <div className={`flex items-center justify-between px-1 pb-2 border-b ${border}`}>
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
          <h3 className={`text-xs font-semibold uppercase tracking-wider font-mono ${heading}`}>
            {title}
          </h3>
        </div>
        <span className={`text-xs font-mono font-medium ${count}`}>{cases.length}</span>
      </div>
      <p className="text-[11px] text-zinc-500 px-1">{description}</p>

      <div className="space-y-2.5">
        {cases.length === 0 && (
          <p className="text-xs text-zinc-400 px-1 font-mono">{emptyLabel}</p>
        )}
        {cases.map((c) => {
          const isFlagship = c.id === 'CASE-001';
          const card = (
            <SpotlightCard
              className={`p-4 space-y-2.5 transition-all ${linkable ? 'cursor-pointer group' : ''} ${
                isFlagship && linkable ? 'border-emerald-200 bg-emerald-50/30' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-mono font-medium ${
                      color === 'rose' ? 'text-rose-700' : color === 'amber' ? 'text-emerald-700' : 'text-zinc-600'
                    }`}
                  >
                    {c.id}
                  </span>
                  {isFlagship && linkable && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200">
                      Demo
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
                className={`text-xs font-medium text-zinc-900 ${
                  linkable ? 'group-hover:text-emerald-700 transition-colors' : ''
                } line-clamp-2`}
              >
                {c.title}
              </div>

              {c.workerActive && (
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-blue-700 bg-blue-50 border border-blue-200 rounded-md p-1.5">
                  <Cpu className="h-3 w-3 animate-spin" />
                  <span>{traceLines?.[c.id] ?? `Worker generating trace…`}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-2 border-t border-black/[0.04]">
                <span>{c.counterparty}</span>
                <span className="font-medium text-zinc-800">
                  ${c.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {linkable && c.revisionCount === 0 && onInvestigate && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onInvestigate(c.id);
                  }}
                  className="w-full mt-1 text-[10px] font-medium text-blue-700 border border-blue-200 bg-blue-50 rounded-md py-1 hover:bg-blue-100 transition-colors"
                >
                  Investigate
                </button>
              )}

              {linkable && c.revisionCount > 0 && (
                <div className="flex items-center justify-end text-[10px] font-medium text-emerald-600 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Open Finance PR</span>
                  <ArrowRight className="h-3 w-3" />
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
