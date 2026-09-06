'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Layers, ArrowRight, Search, Filter, Cpu } from 'lucide-react';
import { SpotlightCard } from '../../components/ui/SpotlightCard';
import { StatusPill } from '../../components/ui/StatusPill';
import queueData from '../../lib/data/fixtures/cases-queue.json';

export default function ExceptionQueuePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const lanes = queueData.lanes;

  return (
    <div className="app-page max-w-7xl mx-auto space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-black/[0.06] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold text-zinc-950 tracking-[-0.02em]">
              Exception Triage Queue
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">
              8 active
            </span>
          </div>
          <p className="text-sm text-zinc-500 mt-1.5 max-w-xl">
            Deterministic matching clears routine items. Unresolved lines route into Auto, Review, or Escalate lanes.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
        {/* AUTO LANE */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between px-1 pb-2 border-b border-emerald-200">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-700 font-mono">
                Auto-Cleared
              </h3>
            </div>
            <span className="text-xs font-mono font-medium text-emerald-600">
              {lanes.auto.cases.length}
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 px-1">
            Non-posting exact matches & verified timing differences.
          </p>

          <div className="space-y-2.5">
            {lanes.auto.cases.map((c) => (
              <SpotlightCard key={c.id} className="p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-zinc-600">{c.id}</span>
                  <StatusPill status="auto" size="sm" />
                </div>
                <div className="text-xs font-medium text-zinc-900 line-clamp-1">{c.title}</div>
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-2 border-t border-black/[0.04]">
                  <span>{c.counterparty}</span>
                  <span className="font-medium text-zinc-800">
                    ${c.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </div>

        {/* REVIEW LANE */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between px-1 pb-2 border-b border-amber-200">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-700 font-mono">
                Controller Review
              </h3>
            </div>
            <span className="text-xs font-mono font-medium text-amber-600">
              {lanes.review.cases.length}
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 px-1">
            Agent-proposed journal lines with passed controls awaiting human merge.
          </p>

          <div className="space-y-2.5">
            {lanes.review.cases.map((c) => {
              const isFlagship = c.id === 'CASE-2049';
              return (
                <Link key={c.id} href={`/cases/${c.id}`}>
                  <SpotlightCard
                    className={`p-4 space-y-2.5 transition-all cursor-pointer group ${
                      isFlagship ? 'border-emerald-200 bg-emerald-50/30' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-medium text-emerald-700">{c.id}</span>
                        {isFlagship && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200">
                            Demo
                          </span>
                        )}
                      </div>
                      <StatusPill status="review" size="sm" pulse={c.workerActive} />
                    </div>

                    <div className="text-xs font-medium text-zinc-900 group-hover:text-emerald-700 transition-colors">
                      {c.title}
                    </div>

                    {c.workerActive && (
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-blue-700 bg-blue-50 border border-blue-200 rounded-md p-1.5">
                        <Cpu className="h-3 w-3 animate-spin" />
                        <span>Worker {c.workerId} generating trace...</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-2 border-t border-black/[0.04]">
                      <span>{c.counterparty}</span>
                      <span className="font-medium text-zinc-800">
                        ${c.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex items-center justify-end text-[10px] font-medium text-emerald-600 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Open Finance PR</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </SpotlightCard>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ESCALATE LANE */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between px-1 pb-2 border-b border-rose-200">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-700 font-mono">
                Escalations
              </h3>
            </div>
            <span className="text-xs font-mono font-medium text-rose-600">
              {lanes.escalate.cases.length}
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 px-1">
            Critical materiality, suspected duplicate wire, or contradictory evidence.
          </p>

          <div className="space-y-2.5">
            {lanes.escalate.cases.map((c) => (
              <SpotlightCard key={c.id} className="p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-rose-700">{c.id}</span>
                  <StatusPill status="escalate" size="sm" />
                </div>
                <div className="text-xs font-medium text-zinc-900">{c.title}</div>
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-2 border-t border-black/[0.04]">
                  <span>{c.counterparty}</span>
                  <span className="font-medium text-zinc-800">
                    ${c.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
