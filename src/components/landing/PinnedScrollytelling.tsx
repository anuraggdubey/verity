'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
  Play,
  Send,
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
  const [promptInput, setPromptInput] = useState<string>('');
  const [promptSubmitted, setPromptSubmitted] = useState<boolean>(false);

  // Typing effect for the prompt input
  useEffect(() => {
    if (activeTab === 'stage-ingest') {
      const fullText = 'Show me unposted FX variances > $1,000';
      let currentText = '';
      let i = 0;
      let cleared = false;
      const typingInterval = setInterval(() => {
        if (!cleared) {
          // Reset on the first tick rather than synchronously in the effect body,
          // which is what the cascading-render rule objects to. Visually
          // identical: the field is empty for one 40ms frame either way.
          cleared = true;
          setPromptInput('');
        }
        if (i < fullText.length) {
          currentText += fullText.charAt(i);
          setPromptInput(currentText);
          i++;
        } else {
          clearInterval(typingInterval);
        }
      }, 40);
      return () => clearInterval(typingInterval);
    }
  }, [activeTab]);

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
            <div className="relative rounded-2xl border border-black/[0.08] bg-[#f0f3f8] p-4 sm:p-8 shadow-xs min-h-[620px] sm:min-h-[660px]">
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
              <motion.div 
                initial="hidden"
                animate={activeTab === 'stage-ingest' ? "visible" : "hidden"}
                variants={{
                  hidden: { opacity: 0, scale: 0.85 },
                  visible: { 
                    opacity: 1, scale: 1,
                    transition: { type: "spring", damping: 20, stiffness: 200, staggerChildren: 0.1, delayChildren: 0.2 }
                  }
                }}
                className="mt-4 sm:mt-0 sm:absolute sm:right-6 sm:top-10 w-full sm:w-[350px] rounded-xl border border-black/[0.12] bg-white p-4 shadow-2xl space-y-3 origin-center"
              >
                <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="flex items-center justify-between border-b border-black/[0.06] pb-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Settlement Draft</span>
                    <h4 className="text-xs font-bold text-zinc-950">Draft Finance PR #2049</h4>
                  </div>
                  <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                    Priority: High
                  </span>
                </motion.div>

                <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="text-[11.5px] text-zinc-500 leading-snug">
                  The proposal links wire #BNK-9921, invoice #INV-8821, and official ECB reference fix 1.0820.
                </motion.div>

                <motion.div variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }} className="rounded-lg border border-black/[0.08] bg-white text-[12px] flex flex-col shadow-xs">
                  {/* To Line */}
                  <div className="flex items-center justify-between px-3 py-2.5 border-b border-black/[0.04]">
                    <div className="flex items-center gap-4">
                      <span className="text-zinc-400 text-[11px]">To</span>
                      <span className="font-semibold text-zinc-900 flex items-center gap-1.5 text-[11px]">
                        <span className="h-4 w-4 rounded-full bg-blue-600 text-white text-[8px] flex items-center justify-center font-bold">C</span>
                        Lead Controller
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-medium">CC / BCC</span>
                  </div>
                  
                  {/* Subject Line */}
                  <div className="px-3 py-2.5 border-b border-black/[0.04] text-[11.5px] font-medium text-zinc-800">
                    Settlement Proposal for Acme Europe B.V. Wire
                  </div>

                  {/* Body Content */}
                  <div className="px-3 py-3 space-y-3 text-[11.5px]">
                    <p className="text-zinc-800">Hi team,</p>
                    
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={activeTab === 'stage-ingest' ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                      className="overflow-hidden space-y-3"
                    >
                      <p className="text-zinc-700 leading-relaxed">
                        I&apos;ve drafted a balanced PR for the Acme Europe B.V. wire. It settles <span className="font-semibold text-zinc-900">€13,000.00 EUR</span> against <span className="font-semibold text-zinc-900">$14,200.00 USD</span>.
                      </p>
                      
                      <p className="text-zinc-700 leading-relaxed">
                        I queried the official ECB fix (1.0820), booked the $134.00 Realized FX Gain, and balanced all double-entry ledger lines. Everything is hash-verified and ready for your sign-off.
                      </p>
                    </motion.div>

                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={activeTab === 'stage-ingest' ? { opacity: 1 } : { opacity: 0 }}
                      transition={{ duration: 0.5, delay: 1.5 }}
                      className="text-zinc-800 pt-2 pb-1"
                    >
                      Best,<br/>Agent Alpha-03
                    </motion.p>
                  </div>
                </motion.div>

                <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="flex items-center gap-2 pt-1">
                  <Link
                    href="/cases/CASE-001"
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
                </motion.div>
              </motion.div>
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

                {/* Minimal Interactive Prompt Bar and List Group */}
                <div className="pt-1 flex flex-col space-y-2">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setPromptSubmitted(true);
                      setTimeout(() => setPromptSubmitted(false), 3000);
                    }}
                    className="flex items-center justify-between p-2 rounded-xl border border-black/[0.1] bg-white shadow-2xs focus-within:border-blue-500 relative z-10"
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
                    <div className="text-[11px] text-emerald-600 font-medium px-2 flex items-center gap-1">
                      <Check className="h-3 w-3" /> Found 1 unposted variance: Case #2049 (€13,000 / $14,200)
                    </div>
                  )}

                  {/* Accounts / Invoices Ready for Review Card */}
                  <motion.div 
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={activeTab === 'stage-ingest' ? { opacity: 1, height: 'auto', y: 0 } : { opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: 0.4, delay: 1.6, type: 'spring', bounce: 0.2 }}
                    className="overflow-hidden relative z-0"
                  >
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
                  </motion.div>
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
                <div className="relative h-64 w-full flex items-center justify-center overflow-visible">
                  {/* Concentric rings with continuous subtle pulse */}
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={activeTab === 'stage-ingest' ? { scale: [1, 1.02, 1], opacity: 1 } : { scale: 0.8, opacity: 0 }}
                    transition={{ 
                      opacity: { duration: 1 }, 
                      scale: { duration: 4, repeat: Infinity, ease: "easeInOut" } 
                    }}
                    className="absolute h-56 w-56 rounded-full border border-black/[0.06]" 
                  />
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={activeTab === 'stage-ingest' ? { scale: [1, 1.03, 1], opacity: 1 } : { scale: 0.5, opacity: 0 }}
                    transition={{ 
                      opacity: { duration: 0.8, delay: 0.1 }, 
                      scale: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.1 } 
                    }}
                    className="absolute h-40 w-40 rounded-full border border-black/[0.08]" 
                  />
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={activeTab === 'stage-ingest' ? { scale: [1, 1.05, 1], opacity: 1 } : { scale: 0, opacity: 0 }}
                    transition={{ 
                      opacity: { duration: 0.6, delay: 0.2 },
                      scale: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }
                    }}
                    className="absolute h-24 w-24 rounded-full border border-blue-500/10 bg-gradient-to-tr from-blue-500/5 to-transparent" 
                  />

                  {/* Center Node: Verity Logo / Shield */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={activeTab === 'stage-ingest' ? { scale: 1 } : { scale: 0 }}
                    transition={{ type: 'spring', bounce: 0.5, delay: 0.3 }}
                    className="relative z-10 h-16 w-16 rounded-full bg-white shadow-[0_0_20px_rgba(0,0,0,0.05)] flex items-center justify-center"
                  >
                    <motion.div animate={{ rotate: [0, -5, 5, -5, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
                       <ShieldCheck className="h-7 w-7 text-zinc-900" strokeWidth={1.5} />
                    </motion.div>
                  </motion.div>

                  {/* Floating Minimal Badges placed directly on orbits */}
                  {/* Top Right on Outer Ring (radius ~112px) */}
                  <div className="absolute top-1/2 left-1/2 z-20" style={{ transform: 'translate(calc(-50% + 80px), calc(-50% - 80px))' }}>
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={activeTab === 'stage-ingest' ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                      transition={{ type: 'spring', delay: 0.6 }}
                    >
                      <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-[#fef9c3]/95 backdrop-blur-sm text-[#854d0e] border border-amber-200/50 shadow-sm whitespace-nowrap">
                        Variance: $134
                      </span>
                    </motion.div>
                  </div>
                  
                  {/* Left on Middle Ring (radius ~80px) */}
                  <div className="absolute top-1/2 left-1/2 z-20" style={{ transform: 'translate(calc(-50% - 75px), calc(-50% - 25px))' }}>
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={activeTab === 'stage-ingest' ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                      transition={{ type: 'spring', delay: 0.8 }}
                    >
                      <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-[#dcfce7]/95 backdrop-blur-sm text-[#166534] border border-emerald-200/50 shadow-sm whitespace-nowrap">
                        ECB Fix: 1.0820
                      </span>
                    </motion.div>
                  </div>
                  
                  {/* Bottom Left on Outer Ring (radius ~112px) */}
                  <div className="absolute top-1/2 left-1/2 z-20" style={{ transform: 'translate(calc(-50% - 70px), calc(-50% + 85px))' }}>
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={activeTab === 'stage-ingest' ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                      transition={{ type: 'spring', delay: 1.0 }}
                    >
                      <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-[#dbeafe]/95 backdrop-blur-sm text-[#1e40af] border border-blue-200/50 shadow-sm whitespace-nowrap">
                        MT940 Hash Verified
                      </span>
                    </motion.div>
                  </div>
                  
                  {/* Bottom Right on Middle Ring (radius ~80px) */}
                  <div className="absolute top-1/2 left-1/2 z-20" style={{ transform: 'translate(calc(-50% + 60px), calc(-50% + 55px))' }}>
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={activeTab === 'stage-ingest' ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                      transition={{ type: 'spring', delay: 1.2 }}
                    >
                      <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-[#f3e8ff]/95 backdrop-blur-sm text-[#6b21a8] border border-purple-200/50 shadow-sm whitespace-nowrap">
                        Zero Variance
                      </span>
                    </motion.div>
                  </div>
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
              <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 mt-4">
                <div className="w-[840px] h-[380px] relative bg-[#f8fafc] rounded-2xl border border-black/[0.08] shadow-inner shrink-0 overflow-hidden">
                  
                  {/* Dot Grid Background */}
                  <svg className="absolute inset-0 h-full w-full opacity-60" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="dotGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1.5" fill="#cbd5e1" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#dotGrid)" />
                  </svg>

                  {/* SVG Paths with Flowing Animation */}
                  <svg className="absolute inset-0 h-full w-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    <style>
                      {`
                        @keyframes flowData {
                          from { stroke-dashoffset: 20; }
                          to { stroke-dashoffset: 0; }
                        }
                        .data-flow {
                          stroke-dasharray: 4 16;
                          animation: flowData 1s linear infinite;
                          stroke-linecap: round;
                        }
                      `}
                    </style>
                    {/* Base Solid Paths (Faint Blue/Grey) */}
                    <path d="M 260 80 L 320 80" stroke="#dbeafe" strokeWidth="2" fill="none" />
                    <path d="M 540 80 L 580 80 Q 592 80 592 92 L 592 138 Q 592 150 580 150 L 28 150 Q 16 150 16 162 L 16 208 Q 16 220 28 220 L 40 220" stroke="#dbeafe" strokeWidth="2" fill="none" />
                    <path d="M 260 220 L 320 220" stroke="#dbeafe" strokeWidth="2" fill="none" />
                    <path d="M 540 205 L 550 205 Q 562 205 562 193 L 562 192 Q 562 180 574 180 L 580 180" stroke="#dbeafe" strokeWidth="2" fill="none" />
                    <path d="M 540 235 L 550 235 Q 562 235 562 247 L 562 288 Q 562 300 574 300 L 580 300" stroke="#f1f5f9" strokeWidth="2" fill="none" />

                    {/* Animated Moving Dots overlay (Vibrant Blue/Grey) */}
                    <path d="M 260 80 L 320 80" stroke="#3b82f6" strokeWidth="2.5" fill="none" className="data-flow" />
                    <path d="M 540 80 L 580 80 Q 592 80 592 92 L 592 138 Q 592 150 580 150 L 28 150 Q 16 150 16 162 L 16 208 Q 16 220 28 220 L 40 220" stroke="#3b82f6" strokeWidth="2.5" fill="none" className="data-flow" />
                    <path d="M 260 220 L 320 220" stroke="#3b82f6" strokeWidth="2.5" fill="none" className="data-flow" />
                    <path d="M 540 205 L 550 205 Q 562 205 562 193 L 562 192 Q 562 180 574 180 L 580 180" stroke="#3b82f6" strokeWidth="2.5" fill="none" className="data-flow" />
                    <path d="M 540 235 L 550 235 Q 562 235 562 247 L 562 288 Q 562 300 574 300 L 580 300" stroke="#94a3b8" strokeWidth="2.5" fill="none" className="data-flow" />
                  </svg>

                  {/* Node 1: Trigger */}
                  <div className="absolute top-[40px] left-[40px] w-[220px] rounded-xl border border-blue-500 bg-white p-3 shadow-sm flex flex-col gap-1.5 z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-500 text-white rounded text-[10px] font-semibold">
                        <Play className="h-3 w-3" fill="currentColor" /> Trigger
                      </div>
                      <span className="text-emerald-500 text-[10px] font-medium flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded">
                        <Check className="h-3 w-3" /> Triggered
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-zinc-900 mt-1">Record created</div>
                    <div className="text-[11px] text-zinc-500">Bank wire received (MT940)</div>
                    <div className="absolute -right-[5px] top-1/2 -translate-y-1/2 w-[9px] h-[9px] rounded-full bg-blue-500 ring-2 ring-white" />
                  </div>

                  {/* Node 2: Web agent */}
                  <div className="absolute top-[40px] left-[320px] w-[220px] rounded-xl border border-blue-400 bg-white p-3 shadow-sm flex flex-col gap-1.5 z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-pink-50 text-pink-600 rounded text-[10px] font-semibold border border-pink-100">
                        <Search className="h-3 w-3" /> Web agent
                      </div>
                      <span className="text-emerald-500 text-[10px] font-medium flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded">
                        <Check className="h-3 w-3" /> Completed
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-zinc-900 mt-1">Locate Invoice</div>
                    <div className="text-[11px] text-zinc-500">Query GL open balances</div>
                    <div className="absolute -left-[5px] top-1/2 -translate-y-1/2 w-[9px] h-[9px] rounded-full bg-blue-500 ring-2 ring-white" />
                    <div className="absolute -right-[5px] top-1/2 -translate-y-1/2 w-[9px] h-[9px] rounded-full bg-blue-500 ring-2 ring-white" />
                  </div>

                  {/* Node 3: Custom agent */}
                  <div className="absolute top-[180px] left-[40px] w-[220px] rounded-xl border border-blue-400 bg-white p-3 shadow-sm flex flex-col gap-1.5 z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-semibold border border-emerald-100">
                        <Cpu className="h-3 w-3" /> Custom agent
                      </div>
                      <span className="text-emerald-500 text-[10px] font-medium flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded">
                        <Check className="h-3 w-3" /> Completed
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-zinc-900 mt-1">Query ECB Daily Fix</div>
                    <div className="text-[11px] text-zinc-500">Extract official rate: 1.0820</div>
                    <div className="absolute -left-[5px] top-1/2 -translate-y-1/2 w-[9px] h-[9px] rounded-full bg-blue-500 ring-2 ring-white" />
                    <div className="absolute -right-[5px] top-1/2 -translate-y-1/2 w-[9px] h-[9px] rounded-full bg-blue-500 ring-2 ring-white" />
                  </div>

                  {/* Node 4: If */}
                  <div className="absolute top-[180px] left-[320px] w-[220px] rounded-xl border border-blue-400 bg-white p-3 shadow-sm flex flex-col gap-1.5 z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-[10px] font-semibold border border-purple-100">
                        <GitBranch className="h-3 w-3" /> If
                      </div>
                      <span className="text-emerald-500 text-[10px] font-medium flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded">
                        <Check className="h-3 w-3" /> Completed
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-zinc-900 mt-1">Check Tolerance</div>
                    <div className="text-[10px] text-zinc-500 font-mono pb-1">Variance &lt; $500</div>
                    
                    <div className="absolute -right-8 top-[20px] text-[10px] text-zinc-500 font-medium bg-[#f8fafc] px-1">True</div>
                    <div className="absolute -right-9 top-[50px] text-[10px] text-zinc-400 font-medium bg-[#f8fafc] px-1">False</div>

                    <div className="absolute -left-[5px] top-1/2 -translate-y-1/2 w-[9px] h-[9px] rounded-full bg-blue-500 ring-2 ring-white" />
                    <div className="absolute -right-[5px] top-[25px] w-[9px] h-[9px] rounded-full bg-blue-500 ring-2 ring-white" />
                    <div className="absolute -right-[5px] top-[55px] w-[9px] h-[9px] rounded-full bg-zinc-300 ring-2 ring-white" />
                  </div>

                  {/* Node 5: Enroll in sequence (True) */}
                  <div className="absolute top-[140px] left-[580px] w-[220px] rounded-xl border border-black/[0.08] bg-white p-3 shadow-sm flex flex-col gap-1.5 z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-semibold border border-amber-100">
                        <Send className="h-3 w-3" /> Action
                      </div>
                      <span className="text-purple-500 text-[10px] font-medium flex items-center gap-1 bg-purple-50 px-1.5 py-0.5 rounded">
                        <RefreshCw className="h-3 w-3 animate-spin" /> Running
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-zinc-900 mt-1">Draft Balanced PR</div>
                    <div className="text-[11px] text-zinc-500">Route to Controller Review</div>
                    <div className="absolute -left-[5px] top-1/2 -translate-y-1/2 w-[9px] h-[9px] rounded-full bg-blue-500 ring-2 ring-white" />
                  </div>

                  {/* Node 6: Enroll in sequence (False) */}
                  <div className="absolute top-[260px] left-[580px] w-[220px] rounded-xl border border-black/[0.08] bg-white p-3 shadow-sm flex flex-col gap-1.5 z-10 opacity-60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-semibold border border-amber-100">
                        <Send className="h-3 w-3" /> Action
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-zinc-900 mt-1">Auto-Clear Ledger</div>
                    <div className="text-[11px] text-zinc-500">Post directly to GL</div>
                    <div className="absolute -left-[5px] top-1/2 -translate-y-1/2 w-[9px] h-[9px] rounded-full bg-zinc-300 ring-2 ring-white" />
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

            {/* 4-Column Kanban Exception Board (Replica of Attio style board) */}
            <div className="overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex gap-4 min-w-[900px] h-[500px]">
                {/* Column 1: Discovery / Auto-Cleared */}
                <div className="flex-1 rounded-2xl bg-[#f8fafc] border border-black/[0.04] p-3 space-y-3 flex flex-col shadow-inner">
                  <div className="flex items-center justify-between px-1 text-xs font-semibold text-zinc-800">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-sm" />
                      <span>Auto-Cleared</span>
                      <span className="text-[10px] font-mono text-zinc-500 px-1.5 py-0.5 rounded-md bg-zinc-200/60 shadow-inner">2</span>
                    </div>
                    <button type="button" className="text-zinc-400 hover:text-zinc-600 transition-colors">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                    </button>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {/* Card 1 */}
                    <motion.div 
                      initial={{ opacity: 0, x: -30 }}
                      animate={activeTab === 'stage-workflows' ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                      transition={{ type: 'spring', bounce: 0.2, delay: 0.1 }}
                      className="rounded-xl border border-black/[0.06] bg-white p-3.5 space-y-2.5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="font-semibold text-zinc-900">Stripe Merchant Settlement</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-medium">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        Sep 5, 2026
                      </div>
                      <div className="text-[13px] font-bold font-mono text-zinc-900">USD $18,940.20</div>
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-2 border-t border-black/[0.04]">
                        <span className="text-emerald-600 font-medium flex items-center gap-1"><Check className="h-3 w-3"/> Exact Hash</span>
                        <span className="flex items-center gap-1"><RefreshCw className="h-3 w-3"/> 12ms</span>
                      </div>
                    </motion.div>

                    {/* Card 2 */}
                    <motion.div 
                      initial={{ opacity: 0, x: -30 }}
                      animate={activeTab === 'stage-workflows' ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                      transition={{ type: 'spring', bounce: 0.2, delay: 0.2 }}
                      className="rounded-xl border border-black/[0.06] bg-white p-3.5 space-y-2.5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="font-semibold text-zinc-900">AWS Cloud EMEA</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-medium">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        Sep 4, 2026
                      </div>
                      <div className="text-[13px] font-bold font-mono text-zinc-900">USD $4,210.50</div>
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-2 border-t border-black/[0.04]">
                        <span className="text-emerald-600 font-medium flex items-center gap-1"><Check className="h-3 w-3"/> Vendor PO #4812</span>
                        <span>Auto</span>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Column 2: Demo / Review Lane */}
                <div className="flex-1 rounded-2xl bg-[#f8fafc] border border-black/[0.04] p-3 space-y-3 flex flex-col shadow-inner">
                  <div className="flex items-center justify-between px-1 text-xs font-semibold text-zinc-800">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-sm" />
                      <span>Review Lane</span>
                      <span className="text-[10px] font-mono text-zinc-500 px-1.5 py-0.5 rounded-md bg-zinc-200/60 shadow-inner">1</span>
                    </div>
                    <button type="button" className="text-zinc-400 hover:text-zinc-600 transition-colors">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                    </button>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {/* Card 1 */}
                    <motion.div 
                      initial={{ opacity: 0, y: 30 }}
                      animate={activeTab === 'stage-workflows' ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                      transition={{ type: 'spring', bounce: 0.2, delay: 0.3 }}
                      className="rounded-xl border-2 border-blue-200 bg-white p-3.5 space-y-3 shadow-md hover:shadow-lg transition-shadow cursor-pointer relative"
                    >
                      <div className="absolute inset-0 bg-blue-50/20 rounded-xl pointer-events-none" />
                      <div className="flex items-center justify-between text-[12px] relative z-10">
                        <span className="font-bold text-zinc-900">Acme Europe B.V.</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-medium relative z-10">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        Sep 5, 2026
                      </div>
                      <div className="text-[13px] font-bold font-mono text-zinc-900 relative z-10">USD $14,200.00</div>
                      
                      <div className="flex flex-col gap-2 relative z-10 pt-2 border-t border-black/[0.04]">
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 font-medium">
                          <span className="h-4 w-4 rounded-full bg-blue-600 text-white text-[8px] flex items-center justify-center shadow-sm">α</span>
                          <span>Agent Alpha-03 Assigned</span>
                        </div>
                        <div className="text-[10px] text-amber-700 font-medium bg-amber-50 px-2 py-1 rounded-md border border-amber-100 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> €180 FX variance
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Column 3: Proposal / In Repair */}
                <div className="flex-1 rounded-2xl bg-[#f8fafc] border border-black/[0.04] p-3 space-y-3 flex flex-col shadow-inner">
                  <div className="flex items-center justify-between px-1 text-xs font-semibold text-zinc-800">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-purple-500 shadow-sm" />
                      <span>In CI Repair</span>
                      <span className="text-[10px] font-mono text-zinc-500 px-1.5 py-0.5 rounded-md bg-zinc-200/60 shadow-inner">2</span>
                    </div>
                    <button type="button" className="text-zinc-400 hover:text-zinc-600 transition-colors">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                    </button>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {/* Card 1 */}
                    <motion.div 
                      initial={{ opacity: 0, y: 30 }}
                      animate={activeTab === 'stage-workflows' ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                      transition={{ type: 'spring', bounce: 0.2, delay: 0.4 }}
                      className="rounded-xl border border-black/[0.06] bg-white p-3.5 space-y-2.5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="font-semibold text-zinc-900">JPMorgan Treasury</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-medium">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        Sep 3, 2026
                      </div>
                      <div className="text-[13px] font-bold font-mono text-zinc-900">USD $54,000.00</div>
                      <div className="text-[10px] text-purple-700 bg-purple-50 px-2 py-1 rounded-md font-medium border border-purple-100 flex items-center gap-1">
                        <RefreshCw className="h-3 w-3 animate-spin" /> Lineage active
                      </div>
                    </motion.div>

                    {/* Card 2 */}
                    <motion.div 
                      initial={{ opacity: 0, y: 30 }}
                      animate={activeTab === 'stage-workflows' ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                      transition={{ type: 'spring', bounce: 0.2, delay: 0.5 }}
                      className="rounded-xl border border-black/[0.06] bg-white p-3.5 space-y-2.5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="font-semibold text-zinc-900">Driftwave Software</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-medium">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        Sep 2, 2026
                      </div>
                      <div className="text-[13px] font-bold font-mono text-zinc-900">USD $31,200.00</div>
                      <div className="text-[10px] text-rose-700 bg-rose-50 px-2 py-1 rounded-md font-medium border border-rose-100">
                        Self-healing §4.2 rule retry
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Column 4: Signed Off / Closed */}
                <div className="flex-1 rounded-2xl bg-[#f8fafc] border border-black/[0.04] p-3 space-y-3 flex flex-col shadow-inner">
                  <div className="flex items-center justify-between px-1 text-xs font-semibold text-zinc-800">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm" />
                      <span>Signed Off</span>
                      <span className="text-[10px] font-mono text-zinc-500 px-1.5 py-0.5 rounded-md bg-zinc-200/60 shadow-inner">2</span>
                    </div>
                    <button type="button" className="text-zinc-400 hover:text-zinc-600 transition-colors">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                    </button>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {/* Card 1 */}
                    <motion.div 
                      initial={{ opacity: 0, x: 30 }}
                      animate={activeTab === 'stage-workflows' ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
                      transition={{ type: 'spring', bounce: 0.2, delay: 0.6 }}
                      className="rounded-xl border border-black/[0.06] bg-white p-3.5 space-y-2.5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="font-semibold text-zinc-900">Northpeak Global</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-medium">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        Sep 1, 2026
                      </div>
                      <div className="text-[13px] font-bold font-mono text-zinc-900">USD $78,400.00</div>
                      <div className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md font-medium border border-emerald-100 flex items-center gap-1">
                        <Check className="h-3 w-3" /> Merged to Ledger
                      </div>
                    </motion.div>

                    {/* Card 2 */}
                    <motion.div 
                      initial={{ opacity: 0, x: 30 }}
                      animate={activeTab === 'stage-workflows' ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
                      transition={{ type: 'spring', bounce: 0.2, delay: 0.7 }}
                      className="rounded-xl border border-black/[0.06] bg-white p-3.5 space-y-2.5 shadow-sm hover:shadow-md transition-shadow cursor-pointer opacity-60 hover:opacity-100"
                    >
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="font-semibold text-zinc-900">Westwind Logistics</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-medium">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        Aug 30, 2026
                      </div>
                      <div className="text-[13px] font-bold font-mono text-zinc-900">USD $26,100.00</div>
                      <div className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md font-medium border border-emerald-100 flex items-center gap-1">
                        <Check className="h-3 w-3" /> Audit Hash Sealed
                      </div>
                    </motion.div>
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
              <div className="space-y-4 md:pr-6 md:border-r border-black/[0.08]">
                <div>
                  <h4 className="text-base font-bold text-zinc-950 flex items-center gap-2">
                    <Database className="h-4 w-4 text-blue-600" /> Machine-readable error schemas.
                  </h4>
                  <p className="text-xs text-zinc-500 leading-relaxed mt-1.5">
                    Agents aren&apos;t fed ambiguous chat prompts. They receive structured error schemas detailing the exact policy clause and repair contract.
                  </p>
                </div>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="relative p-[1px] rounded-xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 shadow-sm overflow-hidden group"
                >
                  <motion.div 
                    animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-blue-500/30 bg-[length:200%_auto] opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                  
                  <div className="relative bg-zinc-50/90 backdrop-blur-sm p-4 rounded-xl h-full w-full border border-black/[0.04]">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl" />
                    
                    <div className="relative z-10 space-y-3 font-mono text-[11px]">
                      <div className="flex items-center justify-between text-zinc-500 border-b border-black/[0.06] pb-2">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Terminal className="h-3.5 w-3.5 text-zinc-400" /> CONTRACT: VERITY-REPAIR-V1
                        </span>
                        <span className="flex items-center gap-1.5 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-medium border border-blue-100">
                          <motion.span 
                            animate={{ opacity: [1, 0.4, 1] }} 
                            transition={{ duration: 2, repeat: Infinity }}
                            className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                          />
                          Schema Validated
                        </span>
                      </div>
                      <div className="text-zinc-600 space-y-1.5 pt-1 text-xs">
                        <div><span className="text-purple-700 font-semibold">error_code:</span> <span className="text-emerald-700">&quot;VERITY-FX-003&quot;</span></div>
                        <div><span className="text-purple-700 font-semibold">oracle_target:</span> <span className="text-emerald-700">&quot;ECB_DAILY_FIX&quot;</span></div>
                        <div><span className="text-purple-700 font-semibold">balancing_gain:</span> <span className="text-emerald-700">&quot;$134.00 USD&quot;</span></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="space-y-4 md:pl-2">
                <div>
                  <h4 className="text-base font-bold text-zinc-950 flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-emerald-600" /> Immutable revision trail.
                  </h4>
                  <p className="text-xs text-zinc-500 leading-relaxed mt-1.5">
                    Flawed revisions are preserved forever in the audit database, giving internal controllers and Big Four auditors proof of control enforcement.
                  </p>
                </div>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="relative p-[1px] rounded-xl bg-gradient-to-r from-emerald-500/30 to-blue-500/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden group"
                >
                  <div className="relative bg-white p-5 rounded-xl h-full w-full">
                    {/* Subtle animated background glow */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    
                    <div className="relative z-10 space-y-4">
                      <div className="text-[11px] font-mono text-zinc-400 font-medium tracking-wider uppercase flex items-center gap-1.5">
                        <Layers className="h-3 w-3" /> Auditor Timeline
                      </div>
                      
                      <div className="flex items-center justify-between font-mono text-[11px] mt-2 relative py-2">
                        {/* Connecting Line with gradient and glowing pulse */}
                        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-rose-200 via-blue-200 to-emerald-200 rounded-full z-0 overflow-hidden">
                          <motion.div 
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-1/3 h-full bg-white/60 blur-sm"
                          />
                        </div>
                        
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.1 }}
                          className="z-10 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 line-through border border-rose-200 shadow-sm flex flex-col items-center gap-1 backdrop-blur-sm"
                        >
                          <span className="text-[9px] text-rose-400 uppercase tracking-wider">09:14:02</span>
                          <span className="font-semibold">Rev 1</span>
                        </motion.div>
                        
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 }}
                          className="z-10 px-3 py-1.5 rounded-lg bg-blue-500 text-white shadow-md flex flex-col items-center gap-1 relative overflow-hidden group/btn"
                        >
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="absolute -right-2 -top-2 opacity-20 group-hover/btn:opacity-40 transition-opacity"
                          >
                            <RefreshCw className="h-8 w-8" />
                          </motion.div>
                          <span className="text-[9px] text-blue-100 uppercase tracking-wider relative z-10">Agent</span>
                          <span className="font-semibold relative z-10">Self-Repair</span>
                        </motion.div>
                        
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.5 }}
                          className="z-10 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm flex flex-col items-center gap-1 backdrop-blur-sm relative"
                        >
                          {/* Inner glow on passed */}
                          <div className="absolute inset-0 rounded-lg shadow-[0_0_10px_rgba(16,185,129,0.3)] opacity-0 group-hover:opacity-100 transition-opacity" />
                          <span className="text-[9px] text-emerald-500 uppercase tracking-wider relative z-10">09:14:18</span>
                          <span className="font-bold relative z-10 flex items-center gap-1">Rev 2 <CheckCircle2 className="h-3 w-3" /></span>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
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
                  <div className="relative rounded-xl border border-black/[0.08] bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                    
                    <div className="relative z-10 flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-zinc-950 text-white flex items-center justify-center font-bold text-xs ring-2 ring-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                        MV
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                          Marcus Vance
                          <ShieldCheck className="h-3 w-3 text-blue-500" />
                        </div>
                        <div className="text-[11px] text-zinc-500">Lead Controller • Authorized Signatory</div>
                      </div>
                    </div>

                    <div className="relative z-10 flex items-center gap-2">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Link
                          href="/cases/CASE-001"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-950 hover:bg-black text-white text-xs font-semibold shadow-md transition-all border border-zinc-800 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                        >
                          <kbd className="text-[10px] font-mono bg-zinc-800 text-emerald-400 px-1 py-0.5 rounded border border-zinc-700">A</kbd>
                          <span>Approve & Merge to NetSuite GL</span>
                        </Link>
                      </motion.div>
                      <motion.button 
                        whileHover={{ scale: 1.02 }} 
                        whileTap={{ scale: 0.98 }}
                        type="button" 
                        className="px-3 py-2 rounded-lg border border-black/[0.1] bg-white hover:bg-rose-50 text-xs font-medium text-zinc-700 hover:text-rose-700 hover:border-rose-200 transition-colors"
                      >
                        Reject [R]
                      </motion.button>
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

              <div className="space-y-4 md:pl-2">
                <div>
                  <h4 className="text-base font-bold text-zinc-950 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-emerald-600" /> Tamper-proof audit seals.
                  </h4>
                  <p className="text-xs text-zinc-500 leading-relaxed mt-1.5">
                    Every sign-off produces a cryptographically sealed block hash linking evidence, citations, and journal entries for seamless compliance.
                  </p>
                </div>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="relative p-[1px] rounded-xl bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-emerald-500/20 shadow-sm overflow-hidden group"
                >
                  <motion.div 
                    animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 via-blue-500/30 to-emerald-500/30 bg-[length:200%_auto] opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="relative bg-zinc-50/90 backdrop-blur-sm p-4 rounded-xl h-full w-full border border-black/[0.04]">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl" />
                    
                    <div className="relative z-10 space-y-2 text-xs font-mono">
                      <div className="text-emerald-700 font-semibold flex items-center gap-2 border-b border-black/[0.06] pb-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" /> 
                        Cryptographic Ledger Seal
                      </div>
                      <div className="text-[11px] text-zinc-600 space-y-1.5 pt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500 font-medium">Block height:</span>
                          <span className="text-zinc-900 font-bold">#10492</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500 font-medium">SHA-256 Hash:</span>
                          <span className="text-blue-700 bg-blue-50 border border-blue-100 px-1.5 rounded truncate max-w-[120px] font-semibold">0x8a92fb0194c7c31b</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-black/[0.06] mt-1">
                          <span className="text-zinc-500 font-medium">State:</span>
                          <span className="text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                            <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }} className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                            0 Unreconciled
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
