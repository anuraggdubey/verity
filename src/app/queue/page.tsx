'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Layers, ShieldCheck, AlertTriangle, ShieldAlert, Cpu, ArrowRight, Search, Filter } from 'lucide-react';
import { SpotlightCard } from '../../components/ui/SpotlightCard';
import { StatusPill } from '../../components/ui/StatusPill';
import queueData from '../../lib/data/fixtures/cases-queue.json';

export default function ExceptionQueuePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const lanes = queueData.lanes;

  return (
    <div className="flex flex-col w-full min-h-screen px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Triage Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-emerald-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Exception Triage Queue
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-400 border border-white/[0.08]">
              8 Active Exceptions
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Deterministic matching clears routine items. Unresolved lines route into Auto, Review, or Escalate lanes.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search counterparty or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 pr-3 text-xs bg-black/40 border border-white/[0.08] rounded-lg text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 w-56"
            />
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-zinc-400 text-xs font-medium">
            <Filter className="h-3.5 w-3.5" />
            <span>All Entities</span>
          </div>
        </div>
      </div>

      {/* 3-Lane Horizontal Swimlane Grid (Attio Style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* 1. AUTO LANE */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between px-2 pb-1 border-b border-emerald-500/30">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-300 font-mono">
                Auto-Cleared
              </h3>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-400 px-1.5 py-0.2 rounded bg-emerald-500/10">
              {lanes.auto.cases.length}
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 px-1">
            Non-posting exact matches & verified timing differences.
          </p>

          <div className="space-y-3">
            {lanes.auto.cases.map((c) => (
              <SpotlightCard key={c.id} className="p-4 space-y-2.5 hover:border-emerald-500/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-zinc-300">{c.id}</span>
                  <StatusPill status="auto" size="sm" />
                </div>
                <div className="text-xs font-medium text-zinc-200 line-clamp-1">{c.title}</div>
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-1 border-t border-white/[0.04]">
                  <span>{c.counterparty}</span>
                  <span className="font-semibold text-zinc-200">
                    ${c.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </div>

        {/* 2. REVIEW LANE (Controller Judgment) */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between px-2 pb-1 border-b border-amber-500/40">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-300 font-mono">
                Controller Review
              </h3>
            </div>
            <span className="text-xs font-mono font-semibold text-amber-400 px-1.5 py-0.2 rounded bg-amber-500/10">
              {lanes.review.cases.length}
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 px-1">
            Agent-proposed journal lines with passed controls awaiting human merge.
          </p>

          <div className="space-y-3">
            {lanes.review.cases.map((c) => {
              const isFlagship = c.id === 'CASE-2049';
              return (
                <Link key={c.id} href={`/cases/${c.id}`}>
                  <SpotlightCard
                    className={`p-4 space-y-2.5 transition-all cursor-pointer group ${
                      isFlagship
                        ? 'border-emerald-500/50 bg-emerald-950/10 shadow-[0_0_16px_rgba(16,185,129,0.15)] hover:border-emerald-400'
                        : 'hover:border-amber-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold text-emerald-400">{c.id}</span>
                        {isFlagship && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                            FLAGSHIP DEMO
                          </span>
                        )}
                      </div>
                      <StatusPill status="review" size="sm" pulse={c.workerActive} />
                    </div>

                    <div className="text-xs font-semibold text-zinc-100 group-hover:text-emerald-300 transition-colors">
                      {c.title}
                    </div>

                    {c.workerActive && (
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-300 bg-cyan-950/30 border border-cyan-500/20 rounded p-1.5">
                        <Cpu className="h-3 w-3 animate-spin" />
                        <span>Worker {c.workerId} generating tool trace...</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-1 border-t border-white/[0.04]">
                      <span>{c.counterparty}</span>
                      <span className="font-semibold text-zinc-200">
                        ${c.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex items-center justify-end text-[10px] font-semibold text-emerald-400 gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Open Finance PR</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </SpotlightCard>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 3. ESCALATE LANE */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between px-2 pb-1 border-b border-rose-500/40">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-300 font-mono">
                Escalations
              </h3>
            </div>
            <span className="text-xs font-mono font-semibold text-rose-400 px-1.5 py-0.2 rounded bg-rose-500/10">
              {lanes.escalate.cases.length}
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 px-1">
            Critical materiality, suspected duplicate wire, or contradictory evidence.
          </p>

          <div className="space-y-3">
            {lanes.escalate.cases.map((c) => (
              <SpotlightCard key={c.id} className="p-4 space-y-2.5 hover:border-rose-500/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-rose-400">{c.id}</span>
                  <StatusPill status="escalate" size="sm" />
                </div>
                <div className="text-xs font-medium text-zinc-200">{c.title}</div>
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-1 border-t border-white/[0.04]">
                  <span>{c.counterparty}</span>
                  <span className="font-semibold text-zinc-200">
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
