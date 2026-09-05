'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Search,
  ShieldAlert,
  RefreshCw,
  Lock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Check,
  Cpu,
  ShieldCheck,
  CheckCheck,
  Sparkles,
  GitBranch,
  Layers,
  ArrowUp,
  Copy,
  Terminal,
  Sliders,
  Database,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';

interface TabItem {
  id: string;
  label: string;
  attioLabel: string;
}

const TABS: TabItem[] = [
  { id: 'stage-ingest', label: '01. Ingest & match', attioLabel: 'Build pipeline' },
  { id: 'stage-workflows', label: '02. Control workflows', attioLabel: 'Convert leads' },
  { id: 'stage-ci', label: '03. The CI moment', attioLabel: 'Run sales motions' },
  { id: 'stage-repair', label: '04. Closed-loop repair', attioLabel: 'Forecast revenue' },
  { id: 'stage-merge', label: '05. Controller sign-off', attioLabel: 'Retain and expand' },
];

export function PinnedScrollytelling() {
  const [activeTab, setActiveTab] = useState<string>('stage-ingest');
  const [isManualScroll, setIsManualScroll] = useState<boolean>(false);
  const [promptInput, setPromptInput] = useState<string>('Show me unposted FX variances > $1,000');
  const [promptSubmitted, setPromptSubmitted] = useState<boolean>(false);

  // Scroll-spy: robust trigger line algorithm
  useEffect(() => {
    const handleScroll = () => {
      if (isManualScroll) return;

      const triggerY = 240;
      let matchingTab = TABS[0].id;
      for (const tab of TABS) {
        const el = document.getElementById(tab.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= triggerY) {
            matchingTab = tab.id;
          }
        }
      }
      setActiveTab(matchingTab);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isManualScroll]);

  const scrollToTab = (id: string) => {
    setIsManualScroll(true);
    setActiveTab(id);
    const el = document.getElementById(id);
    if (el) {
      const navbarHeight = 90;
      const y = el.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
      window.scrollTo({
        top: y,
        behavior: 'smooth',
      });
    }
    setTimeout(() => {
      setIsManualScroll(false);
    }, 850);
  };

  return (
    <section className="relative z-10 w-full bg-[#fbfbfd]">
      {/* ========================================================================= */}
      {/* 1. EXACT CLIENT LOGO MATRIX (Image 1: 5 Columns x 2 Rows Hairline Grid)    */}
      {/* ========================================================================= */}
      <div className="w-full border-t border-b border-black/[0.08] bg-white">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 text-xs sm:text-sm font-medium tracking-tight text-zinc-800">
          {/* Row 1, Col 1: granola */}
          <div className="relative flex items-center justify-center h-20 sm:h-24 border-r border-b border-black/[0.08] p-4 hover:bg-zinc-50/50 transition-colors">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7a5 5 0 1 0 5 5" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              </svg>
              <span className="font-bold text-sm tracking-tight text-zinc-950">granola</span>
            </div>
            <span className="absolute top-2.5 right-2.5 text-[10px] text-zinc-400 font-mono">↗</span>
          </div>

          {/* Row 1, Col 2: turbopuffer */}
          <div className="relative flex items-center justify-center h-20 sm:h-24 border-r border-b border-black/[0.08] p-4 hover:bg-zinc-50/50 transition-colors">
            <span className="font-mono text-xs font-semibold tracking-tight text-zinc-900">turbopuffer</span>
          </div>

          {/* Row 1, Col 3: parallel */}
          <div className="relative flex items-center justify-center h-20 sm:h-24 border-r border-b border-black/[0.08] p-4 hover:bg-zinc-50/50 transition-colors">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-black" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                <line x1="4" y1="8" x2="20" y2="8" stroke="currentColor" strokeWidth="2" />
                <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" />
                <line x1="4" y1="16" x2="20" y2="16" stroke="currentColor" strokeWidth="2" />
              </svg>
              <span className="font-bold text-sm tracking-tight text-zinc-950">parallel</span>
            </div>
          </div>

          {/* Row 1, Col 4: Modal */}
          <div className="relative flex items-center justify-center h-20 sm:h-24 border-r border-b border-black/[0.08] p-4 hover:bg-zinc-50/50 transition-colors">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" />
                <path d="M12 12L3 7" />
                <path d="M12 12v10" />
                <path d="M12 12l9-5" />
              </svg>
              <span className="font-semibold text-sm tracking-tight text-zinc-950">Modal</span>
            </div>
            <span className="absolute top-2.5 right-2.5 text-[10px] text-zinc-400 font-mono">↗</span>
          </div>

          {/* Row 1, Col 5: Wispr Flow */}
          <div className="relative flex items-center justify-center h-20 sm:h-24 border-b border-black/[0.08] p-4 hover:bg-zinc-50/50 transition-colors">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 h-3.5">
                <span className="w-0.5 h-2.5 bg-black rounded-full" />
                <span className="w-0.5 h-4 bg-black rounded-full" />
                <span className="w-0.5 h-2 bg-black rounded-full" />
              </div>
              <span className="font-semibold text-sm tracking-tight text-zinc-950">Wispr Flow</span>
            </div>
          </div>

          {/* Row 2, Col 1: Railway */}
          <div className="relative flex items-center justify-center h-20 sm:h-24 border-r border-black/[0.08] p-4 hover:bg-zinc-50/50 transition-colors">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-black flex items-center justify-center text-white">
                <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="4" y1="8" x2="20" y2="8" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="16" x2="20" y2="16" />
                </svg>
              </div>
              <span className="font-semibold text-sm tracking-tight text-zinc-950">Railway</span>
            </div>
            <span className="absolute top-2.5 right-2.5 text-[10px] text-zinc-400 font-mono">↗</span>
          </div>

          {/* Row 2, Col 2: Listen */}
          <div className="relative flex items-center justify-center h-20 sm:h-24 border-r border-black/[0.08] p-4 hover:bg-zinc-50/50 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-base font-serif leading-none font-bold text-black">❝</span>
              <span className="font-semibold text-sm tracking-tight text-zinc-950">Listen</span>
            </div>
          </div>

          {/* Row 2, Col 3: taskrabbit */}
          <div className="relative flex items-center justify-center h-20 sm:h-24 border-r border-black/[0.08] p-4 hover:bg-zinc-50/50 transition-colors">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="14" r="5" />
                <path d="M12 11c2-3 4-5 6-3s-1 5-4 6" />
                <path d="M14 14c2-2 4-4 5-2s-1 4-3 5" />
              </svg>
              <span className="font-semibold text-sm tracking-tight text-zinc-950">taskrabbit</span>
            </div>
            <span className="absolute top-2.5 right-2.5 text-[10px] text-zinc-400 font-mono">↗</span>
          </div>

          {/* Row 2, Col 4: AIUC */}
          <div className="relative flex items-center justify-center h-20 sm:h-24 border-r border-black/[0.08] p-4 hover:bg-zinc-50/50 transition-colors">
            <span className="font-serif font-bold text-sm tracking-widest text-zinc-950">AIUC</span>
          </div>

          {/* Row 2, Col 5: WORDSMITH */}
          <div className="relative flex items-center justify-center h-20 sm:h-24 p-4 hover:bg-zinc-50/50 transition-colors">
            <span className="font-mono font-bold text-xs tracking-[0.2em] text-zinc-900">WORDSMITH</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PLATFORM SECTION HEADER (Image 1: Two-Tone High-Impact Headline)       */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-16 pb-12">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#ebf3ff] text-[#2563eb] border border-blue-200/50 mb-4">
          <span>Platform</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-[42px] font-semibold tracking-[-0.03em] text-zinc-950 leading-[1.12] max-w-4xl">
          The intelligent system that never sleeps.{' '}
          <span className="text-[#64748b] font-normal">
            Catches discrepancies at 2am. Blocks unverified entries before they slip. Hands controllers verified answers.
          </span>
        </h2>
      </div>

      {/* ========================================================================= */}
      {/* 3. STICKY SCROLL-SPY NAVIGATION (Image 1 & 2: 2-Column Framed Grid)        */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto border-t border-black/[0.08] grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        {/* Left Rail: Sticky Scroll-Spy Navigation (Tabs 1 to 5) */}
        <div className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-black/[0.08] p-6 lg:p-8 bg-[#fbfbfd]">
          <div className="lg:sticky lg:top-28 space-y-6">
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-medium">
              Reconciliation Lifecycle
            </div>

            {/* Tab list with blue active indicator bar on left (Exact Attio styling) */}
            <nav className="space-y-1 relative" aria-label="Lifecycle stages">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => scrollToTab(tab.id)}
                    className={`relative w-full text-left py-2.5 px-3 rounded-md text-[13px] transition-colors flex items-center justify-between ${
                      isActive
                        ? 'text-zinc-950 font-medium bg-black/[0.03]'
                        : 'text-zinc-400 font-normal hover:text-zinc-700 hover:bg-black/[0.015]'
                    }`}
                  >
                    {/* Left vertical blue accent bar on active tab */}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-blue-600 rounded-r-full" />
                    )}
                    <span className="pl-1.5">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Right Column: 5 Sequential Pinned Content Sections */}
        <div className="lg:col-span-9 divide-y divide-black/[0.08] bg-white">
          {/* ========================================================================= */}
          {/* STAGE 1: INGEST & MATCH (Exact Attio Image 1 Replication for Finance)     */}
          {/* ========================================================================= */}
          <section id="stage-ingest" className="p-6 sm:p-8 lg:p-10 space-y-8 scroll-mt-28">
            {/* Two-tone headline */}
            <div className="space-y-1.5 max-w-2xl">
              <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-950 leading-snug">
                Your team, amplified.{' '}
                <span className="text-[#64748b] font-normal">
                  Agents reconcile bank feeds and ERP invoices the moment payments arrive, building an audit-proof trail before books close.
                </span>
              </h3>
            </div>

            {/* Main Showcase Card: Soft Background Box with Table + Floating Popover (Image 1) */}
            <div className="relative rounded-2xl border border-black/[0.08] bg-[#f0f3f8] p-4 sm:p-8 overflow-hidden shadow-xs min-h-[520px]">
              {/* White Spreadsheet Table Card */}
              <div className="rounded-xl border border-black/[0.08] bg-white shadow-sm overflow-hidden text-xs max-w-2xl">
                {/* Table Top Controls Bar */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-black/[0.06] bg-[#fafbfc]">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm bg-blue-600 flex items-center justify-center text-white text-[8px]">✓</span>
                    <span className="font-semibold text-zinc-900 text-xs">Bank feeds to reconcile</span>
                    <span className="text-[10px] text-zinc-400">ⓘ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-medium border border-emerald-200">
                      All Cleared: 98.4%
                    </span>
                    <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 text-[10px] font-medium">
                      View settings ▾
                    </span>
                  </div>
                </div>

                {/* Table Header Columns */}
                <div className="grid grid-cols-12 px-4 py-2 border-b border-black/[0.06] text-[11px] font-medium text-zinc-400 bg-zinc-50/50">
                  <div className="col-span-5 flex items-center gap-2">
                    <input type="checkbox" readOnly className="rounded border-zinc-300" />
                    <span>Transaction</span>
                  </div>
                  <div className="col-span-2">Match Score</div>
                  <div className="col-span-3">Owner / Agent</div>
                  <div className="col-span-2 text-right">Invoice Status</div>
                </div>

                {/* Table Rows (Matching Attio Image 1 table with finance data) */}
                <div className="divide-y divide-black/[0.04]">
                  <div className="grid grid-cols-12 px-4 py-2.5 items-center hover:bg-zinc-50 transition-colors">
                    <div className="col-span-5 flex items-center gap-2 font-medium text-zinc-900">
                      <input type="checkbox" readOnly className="rounded border-zinc-300" />
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Stripe Merchant Settlement</span>
                    </div>
                    <div className="col-span-2">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold">100</span>
                    </div>
                    <div className="col-span-3 text-zinc-600 flex items-center gap-1.5">
                      <span className="h-4 w-4 rounded-full bg-zinc-800 text-white text-[8px] flex items-center justify-center">A</span>
                      <span>Auto-Cleared</span>
                    </div>
                    <div className="col-span-2 text-right text-zinc-500 text-[11px]">Matched in 12ms</div>
                  </div>

                  <div className="grid grid-cols-12 px-4 py-2.5 items-center hover:bg-zinc-50 transition-colors">
                    <div className="col-span-5 flex items-center gap-2 font-medium text-zinc-900">
                      <input type="checkbox" readOnly className="rounded border-zinc-300" />
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>AWS Cloud Infrastructure</span>
                    </div>
                    <div className="col-span-2">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold">99</span>
                    </div>
                    <div className="col-span-3 text-zinc-600 flex items-center gap-1.5">
                      <span className="h-4 w-4 rounded-full bg-blue-800 text-white text-[8px] flex items-center justify-center">W</span>
                      <span>Vendor PO #481</span>
                    </div>
                    <div className="col-span-2 text-right text-zinc-500 text-[11px]">Exact Hash Match</div>
                  </div>

                  <div className="grid grid-cols-12 px-4 py-2.5 items-center hover:bg-zinc-50 transition-colors">
                    <div className="col-span-5 flex items-center gap-2 font-medium text-zinc-900">
                      <input type="checkbox" readOnly className="rounded border-zinc-300" />
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Google Workspace Monthly</span>
                    </div>
                    <div className="col-span-2">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold">98</span>
                    </div>
                    <div className="col-span-3 text-zinc-600 flex items-center gap-1.5">
                      <span className="h-4 w-4 rounded-full bg-zinc-800 text-white text-[8px] flex items-center justify-center">A</span>
                      <span>Direct Debit Line</span>
                    </div>
                    <div className="col-span-2 text-right text-zinc-500 text-[11px]">Cleared 2h ago</div>
                  </div>

                  {/* Highlighted Variance Line (Selected Row) */}
                  <div className="grid grid-cols-12 px-4 py-2.5 items-center bg-blue-50/60 border-l-2 border-blue-600">
                    <div className="col-span-5 flex items-center gap-2 font-semibold text-blue-950">
                      <input type="checkbox" checked readOnly className="rounded text-blue-600 focus:ring-0" />
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      <span>Acme Europe B.V. Wire</span>
                    </div>
                    <div className="col-span-2">
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">€180 FX</span>
                    </div>
                    <div className="col-span-3 text-zinc-700 flex items-center gap-1.5 font-medium">
                      <span className="h-4 w-4 rounded-full bg-blue-600 text-white text-[8px] flex items-center justify-center">α</span>
                      <span>Agent Alpha-03</span>
                    </div>
                    <div className="col-span-2 text-right text-blue-700 font-semibold text-[11px]">Drafting PR</div>
                  </div>

                  <div className="grid grid-cols-12 px-4 py-2.5 items-center hover:bg-zinc-50 transition-colors">
                    <div className="col-span-5 flex items-center gap-2 font-medium text-zinc-900">
                      <input type="checkbox" readOnly className="rounded border-zinc-300" />
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Ramp Card Batch #204</span>
                    </div>
                    <div className="col-span-2">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold">97</span>
                    </div>
                    <div className="col-span-3 text-zinc-600 flex items-center gap-1.5">
                      <span className="h-4 w-4 rounded-full bg-zinc-800 text-white text-[8px] flex items-center justify-center">A</span>
                      <span>Auto-Cleared</span>
                    </div>
                    <div className="col-span-2 text-right text-zinc-500 text-[11px]">Receipt Linked</div>
                  </div>

                  <div className="grid grid-cols-12 px-4 py-2.5 items-center hover:bg-zinc-50 transition-colors">
                    <div className="col-span-5 flex items-center gap-2 font-medium text-zinc-900">
                      <input type="checkbox" readOnly className="rounded border-zinc-300" />
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Modal Cloud Compute</span>
                    </div>
                    <div className="col-span-2">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold">96</span>
                    </div>
                    <div className="col-span-3 text-zinc-600 flex items-center gap-1.5">
                      <span className="h-4 w-4 rounded-full bg-zinc-800 text-white text-[8px] flex items-center justify-center">A</span>
                      <span>Auto-Cleared</span>
                    </div>
                    <div className="col-span-2 text-right text-zinc-500 text-[11px]">SWIFT MT940 Match</div>
                  </div>

                  <div className="grid grid-cols-12 px-4 py-2.5 items-center hover:bg-zinc-50 transition-colors">
                    <div className="col-span-5 flex items-center gap-2 font-medium text-zinc-900">
                      <input type="checkbox" readOnly className="rounded border-zinc-300" />
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Linear Software License</span>
                    </div>
                    <div className="col-span-2">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold">92</span>
                    </div>
                    <div className="col-span-3 text-zinc-600 flex items-center gap-1.5">
                      <span className="h-4 w-4 rounded-full bg-zinc-800 text-white text-[8px] flex items-center justify-center">A</span>
                      <span>Auto-Cleared</span>
                    </div>
                    <div className="col-span-2 text-right text-zinc-500 text-[11px]">SaaS Amortized</div>
                  </div>
                </div>
              </div>

              {/* Exact Floating Popover Modal Card (Image 1 "Send email" Equivalent for Finance PR) */}
              <div className="mt-4 sm:mt-0 sm:absolute sm:right-6 sm:top-10 w-full sm:w-[350px] rounded-xl border border-black/[0.12] bg-white p-4 shadow-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-black/[0.06] pb-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Settlement Draft</span>
                    <h4 className="text-xs font-bold text-zinc-950">Draft Finance PR #2049</h4>
                  </div>
                  <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                    Priority: High
                  </span>
                </div>

                <div className="text-[11px] text-zinc-500 leading-snug">
                  The proposal links wire #BNK-9921, invoice #INV-8821, and official ECB reference fix 1.0820.
                </div>

                <div className="p-2.5 rounded-lg bg-zinc-50 border border-black/[0.04] text-[11px] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">To:</span>
                    <span className="font-semibold text-zinc-900 flex items-center gap-1">
                      <span className="h-3 w-3 rounded-full bg-blue-600 text-white text-[7px] flex items-center justify-center">C</span>
                      Lead Controller
                    </span>
                    <span className="text-[9px] text-zinc-400">CC/BCC</span>
                  </div>
                  <div className="border-t border-black/[0.04] pt-1 text-zinc-800">
                    <span className="font-semibold">Subject:</span> Settlement Proposal for Acme Europe B.V. Wire
                  </div>
                </div>

                <div className="text-[11px] text-zinc-600 bg-white p-2 rounded-lg border border-black/[0.06] font-mono leading-relaxed space-y-1">
                  <p className="font-sans text-zinc-800 font-medium">
                    Settles €13,000.00 EUR against $14,200.00 USD.
                  </p>
                  <p className="text-[10px] text-zinc-500 font-sans">
                    Queries official ECB fix 1.0820, books $134.00 Realized FX Gain, and balances double-entry lines before human sign-off.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href="/cases/CASE-2049"
                    className="flex-1 text-center py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    Submit to CI Check
                  </Link>
                  <button type="button" className="py-2 px-3 rounded-lg border border-black/[0.08] hover:bg-zinc-50 text-zinc-600 text-xs font-medium transition-colors">
                    Discard
                  </button>
                  <button type="button" className="text-zinc-400 hover:text-zinc-700 text-xs px-1">
                    Draft
                  </button>
                </div>
              </div>
            </div>

            {/* Lower 2-Column Split: Subcards with Hairline Divider (Exact Attio Image 1 Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 border-t border-black/[0.08] pt-8 gap-8">
              {/* Left Subcard: Interactive Prompt Bar + Items Ready for Review */}
              <div className="space-y-4 md:pr-6 md:border-r border-black/[0.08]">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-zinc-900">Free controllers to focus.</h4>
                  <p className="text-xs text-[#64748b] leading-relaxed">
                    Agents handle the repetitive matching and variance math. Controllers focus their time where decisions require fiduciary judgement.
                  </p>
                </div>

                {/* Minimal Interactive Prompt Bar (Image 1) */}
                <div className="pt-1">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setPromptSubmitted(true);
                      setTimeout(() => setPromptSubmitted(false), 3000);
                    }}
                    className="flex items-center justify-between p-2 rounded-xl border border-black/[0.1] bg-white shadow-2xs focus-within:border-blue-500"
                  >
                    <input
                      type="text"
                      suppressHydrationWarning
                      value={promptInput}
                      onChange={(e) => setPromptInput(e.target.value)}
                      className="w-full bg-transparent text-xs text-zinc-800 focus:outline-none px-2"
                      placeholder="Ask something about the ledger..."
                    />
                    <button
                      type="submit"
                      suppressHydrationWarning
                      className="h-6 w-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-xs transition-colors"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                  </form>
                  {promptSubmitted && (
                    <div className="text-[11px] text-emerald-600 font-medium mt-1.5 px-2 flex items-center gap-1">
                      <Check className="h-3 w-3" /> Found 1 unposted variance: Case #2049 (€13,000 / $14,200)
                    </div>
                  )}
                </div>

                {/* Accounts / Invoices Ready for Review Card (Image 1 bottom card) */}
                <div className="rounded-xl border border-black/[0.08] bg-white p-3.5 shadow-2xs space-y-2 text-xs">
                  <div className="text-[11px] font-mono text-zinc-400 font-medium">6 items ready for reconciliation</div>
                  <div className="space-y-1 text-zinc-700">
                    <div className="flex items-center justify-between py-1 border-b border-black/[0.03]">
                      <span className="font-medium text-zinc-900">Acme Europe B.V.</span>
                      <span className="text-[11px] text-amber-600 font-mono">€180 FX Discrepancy</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-black/[0.03]">
                      <span className="font-medium text-zinc-900">Linear Software</span>
                      <span className="text-[11px] text-zinc-500">SaaS Pre-paid Amortization</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-black/[0.03]">
                      <span className="font-medium text-zinc-900">Notion EMEA</span>
                      <span className="text-[11px] text-zinc-500">VAT Cross-Border Treatment</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="font-medium text-zinc-900">OpenAI API</span>
                      <span className="text-[11px] text-emerald-600">Monthly Usage Match</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Subcard: Attio Circular Concentric Radar Graphic (Image 1) */}
              <div className="space-y-4 md:pl-2">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-zinc-900">Agents investigate. You close.</h4>
                  <p className="text-xs text-[#64748b] leading-relaxed">
                    Every lead exception is enriched and verified with hash-backed receipts before it touches a human inbox.
                  </p>
                </div>

                {/* Circular Concentric Radar Graphic (Exact Replica from Image 1) */}
                <div className="relative h-56 w-full flex items-center justify-center overflow-hidden rounded-xl bg-zinc-50/50 border border-black/[0.04]">
                  {/* Concentric rings */}
                  <div className="absolute h-48 w-48 rounded-full border border-black/[0.05]" />
                  <div className="absolute h-36 w-36 rounded-full border border-black/[0.07]" />
                  <div className="absolute h-24 w-24 rounded-full border border-blue-500/20 bg-blue-500/5 animate-pulse" />

                  {/* Center Node: Verity Logo / Shield */}
                  <div className="relative z-10 h-12 w-12 rounded-full bg-white border border-black/[0.1] shadow-md flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6 text-zinc-900" />
                  </div>

                  {/* Floating Minimal Badges (Exact Positioning from Image 1) */}
                  <span className="absolute top-4 right-8 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#fef9c3] text-[#854d0e] border border-amber-200 shadow-2xs">
                    Variance: $134
                  </span>
                  <span className="absolute top-8 left-6 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#dcfce7] text-[#166534] border border-emerald-200 shadow-2xs">
                    ECB Fix: 1.0820
                  </span>
                  <span className="absolute bottom-6 left-8 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#dbeafe] text-[#1e40af] border border-blue-200 shadow-2xs">
                    MT940 Hash Verified
                  </span>
                  <span className="absolute bottom-5 right-6 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#f3e8ff] text-[#6b21a8] border border-purple-200 shadow-2xs">
                    Zero Variance
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* STAGE 2: CONTROL WORKFLOWS (Exact Attio Image 2 Replication for Finance)   */}
          {/* ========================================================================= */}
          <section id="stage-workflows" className="p-6 sm:p-8 lg:p-10 space-y-8 scroll-mt-28">
            {/* Top Workflow Node Graph (Exact Replica of Image 2 top visual node graph) */}
            <div className="rounded-2xl border border-black/[0.08] bg-[#f8fafc] p-6 sm:p-8 relative overflow-hidden shadow-xs">
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-6 flex items-center gap-1.5">
                <GitBranch className="h-3.5 w-3.5 text-blue-600" />
                <span>Autonomous Finance Workflow Graph</span>
              </div>

              {/* Interactive Visual Node Diagram */}
              <div className="space-y-6">
                {/* Row 1: Trigger -> Worker */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Node 1: Trigger */}
                  <div className="w-full sm:w-64 rounded-xl border border-blue-200 bg-white p-3 shadow-2xs relative space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-medium">Trigger</span>
                      <span className="text-emerald-600 font-medium">✓ Triggered</span>
                    </div>
                    <div className="text-xs font-semibold text-zinc-900">Record Created</div>
                    <div className="text-[11px] text-zinc-500">Bank wire received (MT940 feed)</div>
                  </div>

                  {/* Connector Arrow */}
                  <div className="hidden sm:block text-zinc-300 font-mono text-sm">────────▶</div>

                  {/* Node 2: Web / Ledger Agent */}
                  <div className="w-full sm:w-64 rounded-xl border border-pink-200 bg-white p-3 shadow-2xs relative space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-pink-50 text-pink-700 font-medium border border-pink-200">Worker Agent</span>
                      <span className="text-emerald-600 font-medium">✓ Completed</span>
                    </div>
                    <div className="text-xs font-semibold text-zinc-900">Locate Invoice #INV-8821</div>
                    <div className="text-[11px] text-zinc-500">Query GL open balances</div>
                  </div>
                </div>

                {/* Row 2: Custom Agent -> Decision Gate -> Branches */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  {/* Node 3: Custom Agent */}
                  <div className="w-full sm:w-60 rounded-xl border border-emerald-200 bg-white p-3 shadow-2xs relative space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">Oracle Agent</span>
                      <span className="text-emerald-600 font-medium">✓ Completed</span>
                    </div>
                    <div className="text-xs font-semibold text-zinc-900">Query ECB Daily Fix</div>
                    <div className="text-[11px] text-zinc-500">Extract official rate: 1.0820</div>
                  </div>

                  <div className="hidden sm:block text-zinc-300 font-mono text-sm">──▶</div>

                  {/* Node 4: Decision Gate (If) */}
                  <div className="w-full sm:w-56 rounded-xl border border-purple-200 bg-white p-3 shadow-2xs relative space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-medium border border-purple-200">If</span>
                      <span className="text-emerald-600 font-medium">✓ Evaluated</span>
                    </div>
                    <div className="text-xs font-semibold text-zinc-900">Check Tolerance</div>
                    <div className="text-[10px] text-zinc-500 font-mono">Variance &lt; $500 Threshold</div>
                  </div>

                  <div className="hidden sm:block text-zinc-300 font-mono text-sm">──▶</div>

                  {/* Node 5: Enroll in Sequence / PR Action */}
                  <div className="w-full sm:w-60 rounded-xl border border-amber-200 bg-white p-3 shadow-2xs relative space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-medium border border-amber-200">CI Sequence</span>
                      <span className="text-blue-600 font-medium">In Queue</span>
                    </div>
                    <div className="text-xs font-semibold text-zinc-900">Draft Balanced PR</div>
                    <div className="text-[11px] text-zinc-500">Route to Controller Review</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Two-Tone Headline (Image 2) */}
            <div className="space-y-1.5 max-w-2xl">
              <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-950 leading-snug">
                Run every motion, your way.{' '}
                <span className="text-[#64748b] font-normal">
                  CI pipeline built for how finance operates, while agents investigate exceptions and prepare audit proofs.
                </span>
              </h3>
            </div>

            {/* 4-Column Kanban Exception Board (Exact Replica of Image 2 Kanban Board) */}
            <div className="rounded-2xl border border-black/[0.08] bg-[#fbfbfd] p-4 sm:p-6 overflow-x-auto shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-[720px]">
                {/* Column 1: Discovery / Auto-Cleared */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1 text-xs font-semibold text-zinc-800">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      <span>Auto-Cleared</span>
                      <span className="text-[10px] font-mono text-zinc-400 px-1 rounded bg-zinc-200/60">2</span>
                    </div>
                    <button type="button" className="text-zinc-400 hover:text-zinc-600">+</button>
                  </div>

                  {/* Card 1 */}
                  <div className="rounded-xl border border-black/[0.08] bg-white p-3 space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-zinc-900">Stripe Merchant Settlement</span>
                    </div>
                    <div className="text-[10px] text-zinc-400">📅 Sep 5, 2026</div>
                    <div className="text-xs font-bold font-mono text-zinc-900">USD $18,940.20</div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-black/[0.04]">
                      <span className="text-emerald-600 font-medium">✓ Exact Hash</span>
                      <span>12ms</span>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="rounded-xl border border-black/[0.08] bg-white p-3 space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-zinc-900">AWS Cloud EMEA</span>
                    </div>
                    <div className="text-[10px] text-zinc-400">📅 Sep 4, 2026</div>
                    <div className="text-xs font-bold font-mono text-zinc-900">USD $4,210.50</div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-black/[0.04]">
                      <span className="text-emerald-600 font-medium">✓ Vendor PO #4812</span>
                      <span>Auto</span>
                    </div>
                  </div>
                </div>

                {/* Column 2: Demo / Review Lane */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1 text-xs font-semibold text-zinc-800">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      <span>Review Lane</span>
                      <span className="text-[10px] font-mono text-zinc-400 px-1 rounded bg-zinc-200/60">1</span>
                    </div>
                    <button type="button" className="text-zinc-400 hover:text-zinc-600">+</button>
                  </div>

                  {/* Card 1 */}
                  <div className="rounded-xl border border-blue-300 bg-white p-3 space-y-2 shadow-2xs ring-2 ring-blue-500/10">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-zinc-900">Acme Europe B.V.</span>
                    </div>
                    <div className="text-[10px] text-zinc-400">📅 Sep 5, 2026</div>
                    <div className="text-xs font-bold font-mono text-zinc-900">USD $14,200.00</div>
                    <div className="flex items-center gap-1 text-[10px] text-zinc-600">
                      <span className="h-3 w-3 rounded-full bg-blue-600 text-white text-[7px] flex items-center justify-center">α</span>
                      <span>Agent Alpha-03 Assigned</span>
                    </div>
                    <div className="text-[10px] text-amber-700 font-medium bg-amber-50 px-1.5 py-0.5 rounded">
                      €180 FX variance • Recheck ECB fix
                    </div>
                  </div>
                </div>

                {/* Column 3: Proposal / In Repair */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1 text-xs font-semibold text-zinc-800">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-purple-500" />
                      <span>In CI Repair</span>
                      <span className="text-[10px] font-mono text-zinc-400 px-1 rounded bg-zinc-200/60">2</span>
                    </div>
                    <button type="button" className="text-zinc-400 hover:text-zinc-600">+</button>
                  </div>

                  {/* Card 1 */}
                  <div className="rounded-xl border border-black/[0.08] bg-white p-3 space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-zinc-900">JPMorgan Treasury</span>
                    </div>
                    <div className="text-[10px] text-zinc-400">📅 Sep 3, 2026</div>
                    <div className="text-xs font-bold font-mono text-zinc-900">USD $54,000.00</div>
                    <div className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-medium">
                      Lineage verification active
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="rounded-xl border border-black/[0.08] bg-white p-3 space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-zinc-900">Driftwave Software</span>
                    </div>
                    <div className="text-[10px] text-zinc-400">📅 Sep 2, 2026</div>
                    <div className="text-xs font-bold font-mono text-zinc-900">USD $31,200.00</div>
                    <div className="text-[10px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded font-medium">
                      Self-healing §4.2 rule retry
                    </div>
                  </div>
                </div>

                {/* Column 4: Signed Off / Closed */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1 text-xs font-semibold text-zinc-800">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span>Signed Off</span>
                      <span className="text-[10px] font-mono text-zinc-400 px-1 rounded bg-zinc-200/60">2</span>
                    </div>
                    <button type="button" className="text-zinc-400 hover:text-zinc-600">+</button>
                  </div>

                  {/* Card 1 */}
                  <div className="rounded-xl border border-black/[0.08] bg-white p-3 space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-zinc-900">Northpeak Global</span>
                    </div>
                    <div className="text-[10px] text-zinc-400">📅 Sep 1, 2026</div>
                    <div className="text-xs font-bold font-mono text-zinc-900">USD $78,400.00</div>
                    <div className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                      ✓ Merged to General Ledger
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="rounded-xl border border-black/[0.08] bg-white p-3 space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-zinc-900">Westwind Logistics</span>
                    </div>
                    <div className="text-[10px] text-zinc-400">📅 Aug 30, 2026</div>
                    <div className="text-xs font-bold font-mono text-zinc-900">USD $26,100.00</div>
                    <div className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                      ✓ Audit Hash Sealed
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lower 2-Column Split (Image 2) */}
            <div className="grid grid-cols-1 md:grid-cols-2 border-t border-black/[0.08] pt-8 gap-8">
              <div className="space-y-2 md:pr-6 md:border-r border-black/[0.08]">
                <h4 className="text-sm font-bold text-zinc-900">Catch changes to the ledger.</h4>
                <p className="text-xs text-[#64748b] leading-relaxed">
                  Spot unapproved FX tickers, missing citations, and debit/credit imbalances before the general ledger is touched.
                </p>
              </div>

              <div className="space-y-2 md:pl-2">
                <h4 className="text-sm font-bold text-zinc-900">Skip the month-end scramble.</h4>
                <p className="text-xs text-[#64748b] leading-relaxed">
                  Walk into audit reviews with every journal line mathematically proven and linked to immutable source artifacts.
                </p>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* STAGE 3: THE CI MOMENT (Attio & Linear Quality CI Policy Evaluation Suite) */}
          {/* ========================================================================= */}
          <section id="stage-ci" className="p-6 sm:p-8 lg:p-10 space-y-8 scroll-mt-28">
            <div className="space-y-1.5 max-w-2xl">
              <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-950 leading-snug">
                The CI moment.{' '}
                <span className="text-[#64748b] font-normal">
                  Automated gates evaluate every proposed entry before humans ever see it. Zero uninspected lines enter the general ledger.
                </span>
              </h3>
            </div>

            {/* Top Interactive CI Pipeline Execution Rail */}
            <div className="rounded-xl border border-black/[0.08] bg-[#f8fafc] p-4 sm:p-5 shadow-2xs">
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <GitBranch className="h-3.5 w-3.5 text-blue-600" />
                  <span>Pipeline Execution: PR #2049 (Target: NetSuite GL)</span>
                </span>
                <span className="text-zinc-500 font-medium">18ms total latency</span>
              </div>

              {/* 5-Step Pipeline Rail with Connected Nodes */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                {/* Node 1 */}
                <div className="p-2.5 rounded-lg border border-emerald-200 bg-white space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono text-zinc-500">01. INGEST</span>
                    <span className="text-emerald-600 font-bold">✓ 2ms</span>
                  </div>
                  <div className="font-semibold text-zinc-900 text-[11px] truncate">MT940 Wire Feed</div>
                  <div className="text-[10px] text-zinc-400 font-mono truncate">BNK-9921</div>
                </div>

                {/* Node 2 */}
                <div className="p-2.5 rounded-lg border border-emerald-200 bg-white space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono text-zinc-500">02. LINEAGE</span>
                    <span className="text-emerald-600 font-bold">✓ 3ms</span>
                  </div>
                  <div className="font-semibold text-zinc-900 text-[11px] truncate">SHA-256 Proof</div>
                  <div className="text-[10px] text-zinc-400 font-mono truncate">2 Hashes Locked</div>
                </div>

                {/* Node 3 */}
                <div className="p-2.5 rounded-lg border border-emerald-200 bg-white space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono text-zinc-500">03. BALANCE</span>
                    <span className="text-emerald-600 font-bold">✓ 1ms</span>
                  </div>
                  <div className="font-semibold text-zinc-900 text-[11px] truncate">Double-Entry</div>
                  <div className="text-[10px] text-zinc-400 font-mono truncate">ΣΔ = $0.00</div>
                </div>

                {/* Node 4: Blocked Gate */}
                <div className="p-2.5 rounded-lg border-2 border-rose-300 bg-rose-50/50 space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono text-rose-800 font-bold">04. POLICY</span>
                    <span className="text-rose-600 font-bold">✕ 14ms</span>
                  </div>
                  <div className="font-semibold text-rose-950 text-[11px] truncate">Treasury §4.2</div>
                  <div className="text-[10px] text-rose-700 font-mono truncate font-medium">Quarantined</div>
                </div>

                {/* Node 5: Dispatched Hook */}
                <div className="col-span-2 sm:col-span-1 p-2.5 rounded-lg border border-blue-200 bg-blue-50/40 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono text-blue-800 font-bold">05. REPAIR</span>
                    <span className="text-blue-600 font-bold">⚡ Hook</span>
                  </div>
                  <div className="font-semibold text-blue-950 text-[11px] truncate">Agent Dispatched</div>
                  <div className="text-[10px] text-blue-600 font-mono truncate">Contract Dispatched</div>
                </div>
              </div>
            </div>

            {/* Main Showcase Viewport: Soft Backing Frame with Attio/Linear Inspection Console */}
            <div className="rounded-2xl border border-black/[0.08] bg-[#f0f3f8] p-4 sm:p-8 overflow-hidden shadow-xs">
              <div className="rounded-xl border border-black/[0.08] bg-white shadow-sm overflow-hidden">
                {/* Check Suite Top Toolbar */}
                <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-3 border-b border-black/[0.06] bg-[#fafbfc] gap-2">
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-zinc-700" />
                    <span className="font-mono text-xs font-semibold text-zinc-900">finance-pr-2049</span>
                    <span className="text-[11px] font-mono text-zinc-400">commit 7f3b89a</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                      Agent Alpha-03
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-semibold border border-rose-200/80 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                      1 Check Failed • 2 Passed
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400">18ms latency</span>
                  </div>
                </div>

                {/* Interactive Two-Pane Runner (Linear & GitHub Actions Inspector) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-black/[0.06]">
                  {/* Left Column: Test Suite Hierarchy (5 cols) */}
                  <div className="lg:col-span-5 p-3 sm:p-4 space-y-2 bg-[#fafbfc]/50">
                    <div className="relative mb-2">
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                      <input
                        type="text"
                        readOnly
                        suppressHydrationWarning
                        value="Filter check suites (4)..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-black/[0.06] bg-white text-xs text-zinc-500 outline-hidden"
                      />
                    </div>

                    {/* Suite Item 1 */}
                    <div className="p-2.5 rounded-lg bg-white border border-black/[0.04] flex items-start gap-2.5 shadow-2xs">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-zinc-900 truncate">verity/evidence-lineage-v1</span>
                          <span className="text-[10px] font-mono text-emerald-600 font-bold">3ms</span>
                        </div>
                        <div className="text-[10px] text-zinc-500 truncate">2 SHA-256 artifacts cryptographically tied</div>
                      </div>
                    </div>

                    {/* Suite Item 2 */}
                    <div className="p-2.5 rounded-lg bg-white border border-black/[0.04] flex items-start gap-2.5 shadow-2xs">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-zinc-900 truncate">verity/balanced-entry-v2</span>
                          <span className="text-[10px] font-mono text-emerald-600 font-bold">1ms</span>
                        </div>
                        <div className="text-[10px] text-zinc-500 truncate">Double-entry equilibrium: Debits == Credits</div>
                      </div>
                    </div>

                    {/* Suite Item 3: Active / Failed */}
                    <div className="p-2.5 rounded-lg bg-rose-50/70 border-2 border-rose-300 flex items-start gap-2.5 shadow-2xs">
                      <XCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-rose-950 truncate">verity/treasury-policy-fx</span>
                          <span className="text-[10px] font-mono text-rose-700 font-bold">14ms</span>
                        </div>
                        <div className="text-[10px] text-rose-800 font-medium truncate">Policy §4.2: Disallowed rate source</div>
                      </div>
                    </div>

                    {/* Suite Item 4 */}
                    <div className="p-2.5 rounded-lg bg-white border border-black/[0.04] flex items-start gap-2.5 shadow-2xs">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-zinc-900 truncate">verity/sanctions-ofac</span>
                          <span className="text-[10px] font-mono text-emerald-600 font-bold">2ms</span>
                        </div>
                        <div className="text-[10px] text-zinc-500 truncate">Beneficiary entity screening cleared</div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Violation Assertion Studio (7 cols) */}
                  <div className="lg:col-span-7 p-4 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
                          GATE BLOCKED
                        </span>
                        <span className="text-xs font-semibold text-zinc-900">TREASURY_POLICY_RULE_042</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400">Sandbox Isolation: ACTIVE</span>
                    </div>

                    {/* Assertion Table */}
                    <div className="rounded-lg border border-black/[0.06] bg-zinc-50/50 p-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b border-black/[0.04] pb-2 text-[11px]">
                        <span className="text-zinc-500 font-medium">Evaluated Rule:</span>
                        <span className="font-mono text-zinc-900 font-semibold">Treasury Bylaws §4.2 (FX Oracle Fix)</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-black/[0.04] pb-2 text-[11px]">
                        <span className="text-zinc-500 font-medium">Approved Sources:</span>
                        <span className="font-mono text-emerald-700 font-semibold">ECB Official Reference Fix (1.0820)</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-black/[0.04] pb-2 text-[11px]">
                        <span className="text-zinc-500 font-medium">Proposed Ingest:</span>
                        <span className="font-mono text-rose-700 font-semibold">unapproved_spot_scraper (1.0923)</span>
                      </div>
                      <div className="flex items-center justify-between pt-0.5 text-[11px]">
                        <span className="text-zinc-500 font-medium">Net Discrepancy:</span>
                        <span className="font-mono text-rose-700 font-bold">+$134.00 unbooked foreign exchange gain</span>
                      </div>
                    </div>

                    {/* Dispatched Typed Machine-Readable Error Contract */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono text-zinc-500">Autonomous Repair Dispatch Payload:</span>
                        <span className="text-blue-600 font-mono text-[10px]">contract_v1.json</span>
                      </div>
                      <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/30 font-mono text-[11px] text-zinc-800 space-y-1">
                        <div className="text-blue-700 font-bold">&quot;status&quot;: &quot;QUARANTINED_BLOCKED&quot;,</div>
                        <div>&quot;error_code&quot;: &quot;VERITY-FX-003&quot;,</div>
                        <div>&quot;required_action&quot;: &quot;QUERY_ORACLE(ECB_DAILY_FIX)&quot;,</div>
                        <div>&quot;target_agent&quot;: &quot;agent_alpha_03&quot;</div>
                      </div>
                    </div>

                    {/* Quarantine Barrier Guarantee */}
                    <div className="text-[11px] text-zinc-600 bg-zinc-50 p-2.5 rounded-lg border border-black/[0.06] flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-medium">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        Quarantine Boundary: Active (Zero ERP escape)
                      </span>
                      <span className="font-mono text-[10px] text-zinc-400">Memory Isolated</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lower 2-Column Split: Subcards with Hairline Divider */}
            <div className="grid grid-cols-1 md:grid-cols-2 border-t border-black/[0.08] pt-8 gap-8">
              <div className="space-y-3 md:pr-6 md:border-r border-black/[0.08]">
                <h4 className="text-sm font-bold text-zinc-900">Deterministic policy engine.</h4>
                <p className="text-xs text-[#64748b] leading-relaxed">
                  No LLM sits in the verification loop. Control checks are written in compiled TypeScript and mathematical assertions, guaranteeing zero false negatives.
                </p>
                <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
                  <span className="px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-800 border border-black/[0.06]">
                    §4.2 FX Provenance
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-800 border border-black/[0.06]">
                    §2.1 Double-Entry Proof
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-800 border border-black/[0.06]">
                    §6.0 Materiality Bounds
                  </span>
                </div>
              </div>

              <div className="space-y-3 md:pl-2">
                <h4 className="text-sm font-bold text-zinc-900">Sub-20ms gate latency.</h4>
                <p className="text-xs text-[#64748b] leading-relaxed">
                  Static analysis runs instantaneously in memory before bank webhooks commit, eliminating human review bottlenecks while securing SOX compliance.
                </p>
                <div className="p-3 rounded-xl bg-white border border-black/[0.08] shadow-2xs space-y-2 text-xs">
                  <div className="flex items-center justify-between text-zinc-900 font-semibold">
                    <span>Gate Latency Benchmark:</span>
                    <span className="text-emerald-700 font-mono font-bold">18ms</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-zinc-500">
                      <span>Verity Static CI:</span>
                      <span className="font-mono text-emerald-600 font-semibold">18ms</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-[4%]" />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
                      <span>Traditional Human Review:</span>
                      <span className="font-mono text-zinc-400">72 hours (3 days)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* STAGE 4: CLOSED-LOOP REPAIR (Attio & Linear Side-by-Side Diff Studio)      */}
          {/* ========================================================================= */}
          <section id="stage-repair" className="p-6 sm:p-8 lg:p-10 space-y-8 scroll-mt-28">
            <div className="space-y-1.5 max-w-2xl">
              <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-950 leading-snug">
                Self-healing closed loop.{' '}
                <span className="text-[#64748b] font-normal">
                  Failures don&apos;t page on-call humans. Structured error schemas re-prompt the agent with exact remedy instructions until CI passes.
                </span>
              </h3>
            </div>

            {/* Top Autonomous Self-Healing Process Track */}
            <div className="rounded-xl border border-black/[0.08] bg-[#f8fafc] p-4 sm:p-5 shadow-2xs">
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Autonomous Self-Repair Cycle #SH-2049</span>
                </span>
                <span className="text-emerald-700 font-bold font-mono">14.2s Resolution</span>
              </div>

              {/* 4-Step Process Rail */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-2.5 rounded-lg border border-black/[0.06] bg-white space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono text-zinc-400">STEP 1</span>
                    <span className="text-blue-600 font-mono font-semibold">+0.2s</span>
                  </div>
                  <div className="font-semibold text-zinc-900 text-[11px]">Error Dispatched</div>
                  <div className="text-[10px] text-zinc-500 truncate">Typed schema to agent</div>
                </div>

                <div className="p-2.5 rounded-lg border border-black/[0.06] bg-white space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono text-zinc-400">STEP 2</span>
                    <span className="text-blue-600 font-mono font-semibold">+4.8s</span>
                  </div>
                  <div className="font-semibold text-zinc-900 text-[11px]">Oracle Queried</div>
                  <div className="text-[10px] text-zinc-500 truncate">ECB Daily Fix (1.0820)</div>
                </div>

                <div className="p-2.5 rounded-lg border border-black/[0.06] bg-white space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono text-zinc-400">STEP 3</span>
                    <span className="text-blue-600 font-mono font-semibold">+9.1s</span>
                  </div>
                  <div className="font-semibold text-zinc-900 text-[11px]">Balanced Journal</div>
                  <div className="text-[10px] text-zinc-500 truncate">+$134 Realized FX Gain</div>
                </div>

                <div className="p-2.5 rounded-lg border border-emerald-300 bg-emerald-50/40 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono text-emerald-800 font-bold">STEP 4</span>
                    <span className="text-emerald-700 font-mono font-bold">+14.2s</span>
                  </div>
                  <div className="font-semibold text-emerald-950 text-[11px]">CI Re-run Passed</div>
                  <div className="text-[10px] text-emerald-700 truncate font-medium">100% Control Clearance</div>
                </div>
              </div>
            </div>

            {/* Main Showcase Viewport: Side-by-Side Accounting Diff Studio */}
            <div className="rounded-2xl border border-black/[0.08] bg-[#f0f3f8] p-4 sm:p-8 overflow-hidden shadow-xs">
              <div className="rounded-xl border border-black/[0.08] bg-white shadow-sm overflow-hidden">
                {/* Diff Header Toolbar */}
                <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-3 border-b border-black/[0.06] bg-[#fafbfc] gap-2">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-semibold text-zinc-900">Proposal Evolution: Revision 1 ➔ Revision 2</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                      Self-Healed in 14.2s • All Checks Pass
                    </span>
                  </div>
                </div>

                {/* Side-by-Side Comparison Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-black/[0.08]">
                  {/* Left Column: Revision 1 (Blocked by CI) */}
                  <div className="p-4 sm:p-6 space-y-3 bg-rose-50/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
                          Revision 1 (Blocked)
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">09:14:02 UTC</span>
                      </div>
                      <span className="text-[10px] font-mono text-rose-700 font-medium">✕ Gate Failed</span>
                    </div>

                    <div className="text-xs space-y-2">
                      <div className="text-[11px] text-zinc-500">
                        <span className="font-semibold text-zinc-800">FX Oracle Source:</span> Unofficial Web Ticker (1.0923)
                      </div>

                      {/* Accounting Table for Rev 1 */}
                      <div className="rounded-lg border border-rose-200 bg-white p-2.5 font-mono text-[11px] space-y-1.5">
                        <div className="grid grid-cols-12 text-[10px] font-sans text-zinc-400 border-b border-black/[0.04] pb-1">
                          <span className="col-span-6">GL Account</span>
                          <span className="col-span-3 text-right">Debit</span>
                          <span className="col-span-3 text-right">Credit</span>
                        </div>
                        <div className="grid grid-cols-12 text-zinc-800">
                          <span className="col-span-6 truncate">1010 Operating Cash</span>
                          <span className="col-span-3 text-right font-medium">$14,200.00</span>
                          <span className="col-span-3 text-right text-zinc-400">—</span>
                        </div>
                        <div className="grid grid-cols-12 text-zinc-800">
                          <span className="col-span-6 truncate">1200 Accounts Receivable</span>
                          <span className="col-span-3 text-right text-zinc-400">—</span>
                          <span className="col-span-3 text-right font-medium">$14,066.00</span>
                        </div>
                        <div className="grid grid-cols-12 text-rose-600 line-through">
                          <span className="col-span-6 truncate">9999 Unallocated Discrepancy</span>
                          <span className="col-span-3 text-right text-zinc-400">—</span>
                          <span className="col-span-3 text-right font-semibold">$134.00</span>
                        </div>
                      </div>

                      <div className="text-[10px] text-rose-700 bg-rose-50 p-2 rounded border border-rose-200">
                        Blocked: Disallowed spot rate caused $134.00 unbooked foreign exchange variance.
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Revision 2 (Repaired & Passed) */}
                  <div className="p-4 sm:p-6 space-y-3 bg-emerald-50/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          Revision 2 (Repaired)
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">09:14:18 UTC (+16s)</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-700 font-medium">✓ 100% Passed</span>
                    </div>

                    <div className="text-xs space-y-2">
                      <div className="text-[11px] text-zinc-500">
                        <span className="font-semibold text-zinc-800">FX Oracle Source:</span> ECB Official Reference Fix (1.0820)
                      </div>

                      {/* Accounting Table for Rev 2 */}
                      <div className="rounded-lg border border-emerald-200 bg-white p-2.5 font-mono text-[11px] space-y-1.5">
                        <div className="grid grid-cols-12 text-[10px] font-sans text-zinc-400 border-b border-black/[0.04] pb-1">
                          <span className="col-span-6">GL Account</span>
                          <span className="col-span-3 text-right">Debit</span>
                          <span className="col-span-3 text-right">Credit</span>
                        </div>
                        <div className="grid grid-cols-12 text-zinc-800">
                          <span className="col-span-6 truncate">1010 Operating Cash</span>
                          <span className="col-span-3 text-right font-medium">$14,200.00</span>
                          <span className="col-span-3 text-right text-zinc-400">—</span>
                        </div>
                        <div className="grid grid-cols-12 text-zinc-800">
                          <span className="col-span-6 truncate">1200 Accounts Receivable</span>
                          <span className="col-span-3 text-right text-zinc-400">—</span>
                          <span className="col-span-3 text-right font-medium">$14,066.00</span>
                        </div>
                        <div className="grid grid-cols-12 text-emerald-700 font-bold bg-emerald-50/50 p-0.5 rounded">
                          <span className="col-span-6 truncate">7410 Realized FX Gain</span>
                          <span className="col-span-3 text-right text-zinc-400">—</span>
                          <span className="col-span-3 text-right">$134.00</span>
                        </div>
                      </div>

                      <div className="text-[10px] text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-200">
                        Resolved: All 3 control families passed. Zero variance equilibrium verified.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Audit Defense Guarantee Bar */}
                <div className="px-4 sm:px-6 py-2.5 bg-zinc-50 border-t border-black/[0.06] text-[11px] text-zinc-500 flex items-center justify-between">
                  <span>Immutable Store: Revision 1 preserved for auditor defense</span>
                  <span className="font-mono text-[10px] text-zinc-400">Audit Hash: 0x8a92fb01...</span>
                </div>
              </div>
            </div>

            {/* Lower 2-Column Split: Subcards with Hairline Divider */}
            <div className="grid grid-cols-1 md:grid-cols-2 border-t border-black/[0.08] pt-8 gap-8">
              <div className="space-y-3 md:pr-6 md:border-r border-black/[0.08]">
                <h4 className="text-sm font-bold text-zinc-900">Machine-readable error schemas.</h4>
                <p className="text-xs text-[#64748b] leading-relaxed">
                  Agents aren&apos;t fed ambiguous chat prompts. They receive structured error schemas detailing the exact policy clause and repair contract.
                </p>
                <div className="p-3 rounded-xl border border-black/[0.08] bg-white shadow-2xs space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500">
                    <span>CONTRACT: VERITY-REPAIR-V1</span>
                    <span className="text-blue-600">Schema Validated</span>
                  </div>
                  <div className="text-[11px] text-zinc-800 space-y-0.5">
                    <div>error_code: &quot;VERITY-FX-003&quot;</div>
                    <div>oracle_target: &quot;ECB_DAILY_FIX&quot;</div>
                    <div>balancing_gain: &quot;$134.00 USD&quot;</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 md:pl-2">
                <h4 className="text-sm font-bold text-zinc-900">Immutable revision trail.</h4>
                <p className="text-xs text-[#64748b] leading-relaxed">
                  Flawed revisions are preserved forever in the audit database, giving internal controllers and Big Four auditors proof of control enforcement.
                </p>
                <div className="p-3 rounded-xl border border-black/[0.08] bg-white shadow-2xs space-y-2 text-xs">
                  <div className="text-[11px] font-mono text-zinc-400">Auditor Timeline:</div>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 line-through">Rev 1 (Blocked)</span>
                    <span className="text-zinc-400">➔</span>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700">Self-Repair</span>
                    <span className="text-zinc-400">➔</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold">Rev 2 (Passed)</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* STAGE 5: CONTROLLER SIGN-OFF (Attio & Linear Fiduciary Clearance Station)  */}
          {/* ========================================================================= */}
          <section id="stage-merge" className="p-6 sm:p-8 lg:p-10 space-y-8 scroll-mt-28">
            <div className="space-y-1.5 max-w-2xl">
              <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-950 leading-snug">
                Human in command.{' '}
                <span className="text-[#64748b] font-normal">
                  Fiduciary liability stays strictly with human controllers. One click verifies the hash-stamped audit trail and merges the entry into your ERP.
                </span>
              </h3>
            </div>

            {/* Main Showcase Viewport: Controller Fiduciary Clearance Station */}
            <div className="rounded-2xl border border-black/[0.08] bg-[#f0f3f8] p-4 sm:p-8 overflow-hidden shadow-xs">
              <div className="rounded-xl border border-black/[0.08] bg-white shadow-sm overflow-hidden">
                {/* Clearance Toolbar */}
                <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-3 border-b border-black/[0.06] bg-[#fafbfc] gap-2">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-zinc-800" />
                    <span className="text-xs font-semibold text-zinc-900">Finance PR #2049: Final Controller Clearance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-200">
                      Awaiting 1 Controller Signature
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[11px] font-mono border border-black/[0.06]">
                      SOC-1 / SOX 404 Enclave
                    </span>
                  </div>
                </div>

                {/* 3 Executive Summary KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-black/[0.06] border-b border-black/[0.06] bg-[#fafbfc]/50">
                  <div className="p-4 space-y-0.5">
                    <div className="text-[10px] font-mono text-zinc-400 uppercase">Journal Total</div>
                    <div className="text-base font-bold text-zinc-900">$14,200.00 USD</div>
                    <div className="text-[10px] text-zinc-500">€13,000.00 EUR Wire Settlement</div>
                  </div>
                  <div className="p-4 space-y-0.5">
                    <div className="text-[10px] font-mono text-zinc-400 uppercase">Net Variance</div>
                    <div className="text-base font-bold text-emerald-600 font-mono">$0.0000</div>
                    <div className="text-[10px] text-emerald-700 font-medium">100% Balanced Double-Entry</div>
                  </div>
                  <div className="p-4 space-y-0.5">
                    <div className="text-[10px] font-mono text-zinc-400 uppercase">Audit Lineage</div>
                    <div className="text-base font-bold text-zinc-900">2 Verified Hashes</div>
                    <div className="text-[10px] text-zinc-500">Bank Wire MT940 + PDF Invoice</div>
                  </div>
                </div>

                {/* Main Clearance Body */}
                <div className="p-4 sm:p-6 space-y-6">
                  {/* Verification Checklist */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-medium">
                      Fiduciary Verification Checklist
                    </div>
                    <div className="space-y-1.5 text-xs text-zinc-700">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-black/[0.04]">
                        <span className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Evidence Lineage: 2 external artifacts verified with cryptographic SHA-256 hashes</span>
                        </span>
                        <span className="text-[10px] font-mono text-emerald-700 font-semibold">VERIFIED</span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-black/[0.04]">
                        <span className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Accounting Balance: Debits ($14,200.00) == Credits ($14,200.00)</span>
                        </span>
                        <span className="text-[10px] font-mono text-emerald-700 font-semibold">BALANCED</span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-black/[0.04]">
                        <span className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Treasury Policy §4.2: ECB reference fix 1.0820 verified with timestamp</span>
                        </span>
                        <span className="text-[10px] font-mono text-emerald-700 font-semibold">COMPLIANT</span>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Sign-off Station */}
                  <div className="rounded-xl border border-black/[0.08] bg-[#fafbfc] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
                        MV
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-900">Marcus Vance</div>
                        <div className="text-[11px] text-zinc-500">Lead Controller • Authorized Signatory</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href="/cases/CASE-2049"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-black hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition-colors"
                      >
                        <kbd className="text-[10px] font-mono bg-white/20 px-1 py-0.5 rounded">A</kbd>
                        <span>Approve & Merge to NetSuite GL</span>
                      </Link>
                      <button type="button" className="px-3 py-2 rounded-lg border border-black/[0.1] hover:bg-zinc-100 text-xs font-medium text-zinc-700 transition-colors">
                        Reject [R]
                      </button>
                    </div>
                  </div>

                  {/* Cryptographic Proof Footer */}
                  <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-zinc-500 pt-2 border-t border-black/[0.06]">
                    <span className="flex items-center gap-1 text-emerald-700 font-medium">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      Merkle Seal: 0x8a92fb0194c7...c31b
                    </span>
                    <span>Net Variance: $0.0000 (100% Reconciled)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Lower 2-Column Split: Subcards with Hairline Divider */}
            <div className="grid grid-cols-1 md:grid-cols-2 border-t border-black/[0.08] pt-8 gap-8">
              <div className="space-y-3 md:pr-6 md:border-r border-black/[0.08]">
                <h4 className="text-sm font-bold text-zinc-900">Never autonomous write.</h4>
                <p className="text-xs text-[#64748b] leading-relaxed">
                  Fiduciary responsibility stays strictly with human controllers. Agents do the heavy research; humans execute the merge.
                </p>
                <div className="pt-1 flex items-center gap-2">
                  <kbd className="px-2 py-1 rounded bg-zinc-100 border border-black/[0.1] text-xs font-mono font-semibold text-zinc-800">
                    Press [A] to Approve
                  </kbd>
                  <kbd className="px-2 py-1 rounded bg-zinc-100 border border-black/[0.1] text-xs font-mono text-zinc-600">
                    [R] Reject
                  </kbd>
                </div>
              </div>

              <div className="space-y-3 md:pl-2">
                <h4 className="text-sm font-bold text-zinc-900">Tamper-proof audit seals.</h4>
                <p className="text-xs text-[#64748b] leading-relaxed">
                  Every sign-off produces a cryptographically sealed block hash linking evidence, citations, and journal entries for seamless compliance.
                </p>
                <div className="p-3 rounded-xl border border-black/[0.08] bg-white shadow-2xs space-y-1 text-xs font-mono">
                  <div className="text-zinc-900 font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Cryptographic Ledger Seal
                  </div>
                  <div className="text-[11px] text-zinc-500 font-sans">
                    Block #10492: 0x8a92fb0194c7...c31b • 0 Unreconciled Variances
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
