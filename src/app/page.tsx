'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  ShieldCheck,
  Check,
  Search,
  ChevronDown,
  Play,
  Share2,
  ExternalLink,
  MessageSquare,
  FileText,
  Globe,
  BookOpen,
  Headphones,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import { PinnedScrollytelling } from '../components/landing/PinnedScrollytelling';

export default function VerityLandingPage() {
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const heroTextRef = useRef<HTMLDivElement | null>(null);
  const macWindowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (!heroSectionRef.current || !macWindowRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroSectionRef.current,
          start: 'top top',
          end: '+=100%',
          pin: true,
          pinSpacing: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // 1. Verity OS window takes the screen: scales up, centers, and flattens corners
      tl.to(
        macWindowRef.current,
        {
          scale: 1.25,
          y: -40,
          borderRadius: '0px',
          boxShadow: '0 30px 100px -20px rgba(0,0,0,0.18)',
          ease: 'none',
        },
        0
      );

      // 2. Hero background transitions from #F8F9FB to soft sky blue #DCEEFB
      tl.to(
        heroSectionRef.current,
        {
          backgroundColor: '#DCEEFB',
          ease: 'none',
        },
        0
      );

      // 3. Hero headline, subtitle, buttons fade away and translate up cleanly
      if (heroTextRef.current) {
        tl.to(
          heroTextRef.current,
          {
            opacity: 0,
            y: -50,
            ease: 'none',
          },
          0
        );
      }
    }, heroSectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="flex flex-col w-full bg-[#fbfbfd] text-[#111827] selection:bg-blue-100 selection:text-blue-900">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Exact Attio Structure, Tuned for Verity Platform)         */}
      {/* ========================================================================= */}
      <section
        ref={heroSectionRef}
        className="hero-section relative z-30 w-full min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8 mx-auto flex flex-col items-center text-center overflow-hidden transition-colors -mt-16"
        style={{ backgroundColor: '#F8F9FB' }}
      >
        <div ref={heroTextRef} className="flex flex-col items-center text-center max-w-4xl mx-auto will-change-transform">
          {/* Top pill badge */}
          <Link
            href="/cases/CASE-2049"
            className="inline-flex items-center gap-1.5 px-3 py-1 mb-6 rounded-full border border-black/[0.08] bg-white text-zinc-600 text-[11px] font-medium shadow-2xs hover:border-black/20 transition-colors"
          >
            <span>Merge control for finance agents: Read the 2026 Benchmark</span>
            <ArrowRight className="h-3 w-3 text-zinc-400" />
          </Link>

          {/* Headline (Attio exact font-size & weight) */}
          <h1 className="text-3xl sm:text-5xl md:text-[56px] font-semibold tracking-[-0.035em] text-zinc-950 max-w-3xl leading-[1.08]">
            Welcome to agentic finance.
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-sm sm:text-[15px] text-zinc-500 max-w-lg leading-relaxed">
            &ldquo;Don&apos;t trust the agent&apos;s confidence. Trust what passed.&rdquo; Verity is the change-control plane that gives finance agents isolated decisions, evidence-backed controls, repair loops, and human controller approval.
          </p>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 mt-6 mb-10">
            <Link
              href="/cases/CASE-2049"
              className="px-3.5 py-1.5 rounded-lg border border-black/[0.12] bg-white text-xs font-medium text-zinc-900 hover:bg-zinc-50 transition-colors shadow-2xs"
            >
              Talk to sales
            </Link>
            <Link
              href="/queue"
              className="px-3.5 py-1.5 rounded-lg bg-black text-xs font-semibold text-white hover:bg-zinc-800 transition-colors shadow-xs"
            >
              Launch Verity
            </Link>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* HERO APP WINDOW (macOS basepoint window mockup as in Image 5)           */}
        {/* ======================================================================= */}
        <div
          ref={macWindowRef}
          className="mac-window w-full max-w-5xl lg:max-w-6xl rounded-[12px] border border-black/[0.1] bg-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.08)] overflow-hidden text-left will-change-transform origin-center"
          style={{ transform: 'scale(1)', borderRadius: '12px' }}
        >
          {/* macOS Titlebar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.06] bg-[#fafafa]">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 mr-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f] border border-[#1aab29]" />
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-zinc-800">
                <ShieldCheck className="h-3.5 w-3.5 text-black" />
                <span>Verity OS</span>
                <ChevronDown className="h-3 w-3 text-zinc-400" />
              </div>
            </div>

            <div className="text-xs font-medium text-zinc-600 flex items-center gap-1.5">
              <span>Reconcile EUR/USD Wire Variance #2049</span>
              <span className="text-amber-500">★</span>
            </div>

            <div className="flex items-center gap-2 text-zinc-400 text-xs">
              <button className="hover:text-zinc-600">+</button>
              <button className="hover:text-zinc-600">◫</button>
            </div>
          </div>

          {/* Window Body: Sidebar + Main Area */}
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[400px]">
            {/* Left Sidebar */}
            <div className="hidden md:block md:col-span-3 border-r border-black/[0.06] bg-[#fbfbfd] p-3 text-[11px] space-y-3">
              <div className="flex items-center justify-between px-2 py-1.5 rounded-md bg-black/[0.04] text-zinc-700 font-medium">
                <span className="flex items-center gap-1.5">
                  <Search className="h-3 w-3 text-zinc-400" />
                  Quick Actions
                </span>
                <kbd className="text-[9px] font-mono bg-white px-1 rounded border border-black/[0.08]">⌘K</kbd>
              </div>

              <div className="space-y-0.5 text-zinc-600">
                <div className="px-2 py-1 rounded bg-black/[0.04] text-zinc-900 font-semibold flex items-center justify-between">
                  <span>Exceptions Queue</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-blue-100 text-blue-700">14</span>
                </div>
                <div className="px-2 py-1 rounded hover:bg-black/[0.03] flex items-center justify-between">
                  <span>Finance PRs</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-amber-100 text-amber-700">3</span>
                </div>
                <div className="px-2 py-1 rounded hover:bg-black/[0.03] flex items-center gap-2">
                  <span>CI Control Gates</span>
                </div>
                <div className="px-2 py-1 rounded hover:bg-black/[0.03] flex items-center gap-2">
                  <span>Sandbox Ledger</span>
                </div>
                <div className="px-2 py-1 rounded hover:bg-black/[0.03] flex items-center gap-2">
                  <span>Bank Feeds (MT940)</span>
                </div>
                <div className="px-2 py-1 rounded hover:bg-black/[0.03] flex items-center gap-2">
                  <span>ECB Rate Oracles</span>
                </div>
              </div>

              <div className="pt-2 border-t border-black/[0.06] space-y-1">
                <div className="text-[10px] uppercase font-semibold text-zinc-400 px-2 tracking-wider">Control Families</div>
                <div className="px-2 py-1 rounded hover:bg-black/[0.03] text-zinc-600 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Evidence Lineage
                </div>
                <div className="px-2 py-1 rounded hover:bg-black/[0.03] text-zinc-600 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Accounting Integrity
                </div>
                <div className="px-2 py-1 rounded hover:bg-black/[0.03] text-zinc-600 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Policy Provenance
                </div>
              </div>

              <div className="pt-2 border-t border-black/[0.06] space-y-1">
                <div className="text-[10px] uppercase font-semibold text-zinc-400 px-2 tracking-wider">Recent Closes</div>
                <div className="px-2 py-1 rounded hover:bg-black/[0.03] text-zinc-600 truncate">
                  EUR/USD Settlement #2049
                </div>
                <div className="px-2 py-1 rounded hover:bg-black/[0.03] text-zinc-600 truncate">
                  Stripe Payout Batch #8812
                </div>
                <div className="px-2 py-1 rounded hover:bg-black/[0.03] text-zinc-600 truncate">
                  Mercury Wire Rec #9021
                </div>
              </div>

              <div className="pt-2 border-t border-black/[0.06] space-y-1">
                <div className="text-[10px] uppercase font-semibold text-zinc-400 px-2 tracking-wider">Ledger State</div>
                <div className="px-2 py-1 rounded hover:bg-black/[0.03] text-zinc-600">Double-Entry Journals</div>
                <div className="px-2 py-1 rounded hover:bg-black/[0.03] text-zinc-600">Cryptographic Hashes</div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="col-span-1 md:col-span-9 p-6 flex flex-col justify-between bg-white">
              <div className="space-y-6">
                {/* User Prompt Bubble */}
                <div className="flex justify-end">
                  <div className="bg-[#f3f4f6] text-zinc-800 px-4 py-2 rounded-2xl rounded-tr-xs text-xs max-w-md font-medium shadow-2xs">
                    How should we settle invoice #INV-8821 with €180 FX variance against wire BNK-2026-08-9921?
                  </div>
                </div>

                {/* Agent Response & Plan */}
                <div className="space-y-4 max-w-xl">
                  <div className="text-xs font-semibold text-zinc-900">
                    Strategy to clear variance:
                    <div className="text-[11px] text-zinc-400 font-normal">Evidence & Ledger Context:</div>
                  </div>

                  {/* Document & Evidence Preview Card */}
                  <div className="flex items-center justify-between p-3 rounded-xl border border-black/[0.08] bg-[#f9fafb] hover:bg-[#f3f4f6] transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-zinc-900 flex items-center justify-center text-white">
                        <FileText className="h-4 w-4 text-white" />
                        <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-400 border border-white" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors">
                          Acme Europe B.V. Remittance Advice & MT103 Swift Wire
                        </div>
                        <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                          <span>Aug 28, 2026 • Verified ECB Rate 1.0820</span>
                          <span>•</span>
                          <span>Hash: #7f89a2</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center -space-x-1.5">
                      <div className="h-6 w-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">✓</div>
                      <div className="h-6 w-6 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">V</div>
                    </div>
                  </div>

                  {/* Deterministic Verification Plan */}
                  <div className="space-y-1.5 text-xs text-zinc-700 leading-relaxed font-sans">
                    <p className="font-semibold text-zinc-900">Deterministic verification plan:</p>
                    <p>1. Ingest €13,000.00 EUR invoice with $14,200.00 USD bank wire settlement.</p>
                    <p>2. Query approved European Central Bank oracle for official reference rate 1.0820.</p>
                    <p>3. Propose balanced double-entry journal ($14,066 AR + $134 Realized FX Gain).</p>
                    <p>4. Pass 3 control families before human controller sign-off.</p>
                  </div>
                </div>
              </div>

              {/* Bottom Floating Prompt Input Box */}
              <div className="mt-8 pt-4 border-t border-black/[0.06]">
                <div className="flex items-center justify-between p-3 rounded-xl border border-black/[0.1] bg-[#fafafa] shadow-xs">
                  <input
                    type="text"
                    readOnly
                    suppressHydrationWarning
                    value="Ask anything or instruct finance agent..."
                    className="w-full bg-transparent text-xs text-zinc-400 focus:outline-none cursor-default"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-zinc-500 flex items-center gap-1 cursor-pointer hover:text-black">
                      Auto ↗
                    </span>
                    <button suppressHydrationWarning className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs">
                      ↑
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. PINNED SCROLLYTELLING / STICKY SCROLL REVEAL (Replaces CRM Section)     */}
      {/* ========================================================================= */}
      <PinnedScrollytelling />

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 4. CELESTIAL ARC & "UNIVERSAL CONTEXT™" SECTION (Exact Attio Screenshot)   */}
      {/* ========================================================================= */}
      <section className="relative w-full attio-pinstripe-dark text-white pt-24 sm:pt-32 pb-24 border-y border-white/[0.08] overflow-hidden">
        {/* Soft Radial Ambient Spotlight in Header */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_70%)] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 text-center space-y-3">
          <p className="text-[#8e96a4] text-sm sm:text-base font-normal tracking-normal">
            The only change-control plane with
          </p>
          <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-[76px] font-semibold tracking-[-0.04em] text-white leading-none">
            Universal Financial Context<span className="text-2xl sm:text-3xl md:text-4xl font-normal align-super ml-0.5 text-white/90">™</span>
          </h2>
        </div>

        {/* The Massive Full-Width Celestial Horizon Arc with Glowing Gradient Rim */}
        <div className="relative w-full mt-8 sm:mt-12 overflow-hidden pointer-events-none">
          <svg
            viewBox="0 0 1440 420"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-[240px] sm:h-[340px] md:h-[420px] lg:h-[480px] block"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Full Rainbow Horizon Rim Gradient: Orange -> Amber -> Yellow -> Chartreuse -> Mint -> Cyan -> Royal Blue */}
              <linearGradient id="universalArcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ea580c" stopOpacity="0.85" />
                <stop offset="6%" stopColor="#f97316" />
                <stop offset="18%" stopColor="#f59e0b" />
                <stop offset="35%" stopColor="#eab308" />
                <stop offset="47%" stopColor="#84cc16" />
                <stop offset="53%" stopColor="#10b981" />
                <stop offset="65%" stopColor="#06b6d4" />
                <stop offset="82%" stopColor="#38bdf8" />
                <stop offset="94%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.85" />
              </linearGradient>

              {/* Wide Atmospheric Glow Blur */}
              <filter id="arcWideGlow" x="-20%" y="-40%" width="140%" height="200%">
                <feGaussianBlur stdDeviation="24" result="blur1" />
                <feGaussianBlur stdDeviation="8" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur1" />
                  <feMergeNode in="blur2" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Pitch Black Void for the Planet Body */}
              <linearGradient id="planetBodyFill" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#040507" />
                <stop offset="100%" stopColor="#000000" />
              </linearGradient>
            </defs>

            {/* Diffuse Warm Ambient Glow along the Curve */}
            <path
              d="M -120 460 Q 720 -30 1560 460"
              stroke="url(#universalArcGradient)"
              strokeWidth="28"
              strokeOpacity="0.32"
              filter="url(#arcWideGlow)"
            />

            {/* Mid-Intensity Haze */}
            <path
              d="M -120 460 Q 720 -30 1560 460"
              stroke="url(#universalArcGradient)"
              strokeWidth="10"
              strokeOpacity="0.65"
              filter="url(#arcWideGlow)"
            />

            {/* Solid Dark Body of the Planet / Dome */}
            <path
              d="M -120 460 Q 720 -30 1560 460 L 1560 500 L -120 500 Z"
              fill="url(#planetBodyFill)"
            />

            {/* Crisp High-Intensity Glowing Rim Stroke */}
            <path
              d="M -120 460 Q 720 -30 1560 460"
              stroke="url(#universalArcGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* 5-Column Feature Grid Inside the Dark Dome Base (Exact Image 1) */}
        <div className="relative z-10 w-full border-t border-b border-white/[0.08] bg-[#050608] mt-4">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 text-left divide-y sm:divide-y-0 sm:divide-x divide-white/[0.08]">
            {/* Card 1 */}
            <div className="p-6 sm:p-8 space-y-3">
              <div className="h-5 w-5 flex items-center justify-center text-zinc-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <rect width="18" height="18" x="3" y="3" rx="3" />
                  <path d="M7 13v4M12 9v8M17 11v6" />
                </svg>
              </div>
              <div className="font-bold text-white text-sm">It audits itself.</div>
              <p className="text-[#8896a6] leading-relaxed text-xs">
                Every bank wire, MT940 line, invoice, and FX fix captured with immutable cryptographic lineage.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 sm:p-8 space-y-3">
              <Globe className="h-4 w-4 text-zinc-400" />
              <div className="font-bold text-white text-sm">Your ledger tools talk.</div>
              <p className="text-[#8896a6] leading-relaxed text-xs">
                Stripe, NetSuite, Mercury, SAP, and bank feeds unified into one deterministic close engine.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 sm:p-8 space-y-3">
              <BookOpen className="h-4 w-4 text-zinc-400" />
              <div className="font-bold text-white text-sm">Gets sharper with every PR.</div>
              <p className="text-[#8896a6] leading-relaxed text-xs">
                Rejected entries produce versioned Control PRs so the same accounting mistake never happens twice.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 sm:p-8 space-y-3">
              <MessageSquare className="h-4 w-4 text-zinc-400" />
              <div className="font-bold text-white text-sm">Ask, and the citation is there.</div>
              <p className="text-[#8896a6] leading-relaxed text-xs">
                Every journal proposal backed by clickable source invoices and approved ECB rate fixes.
              </p>
            </div>

            {/* Card 5 */}
            <div className="p-6 sm:p-8 space-y-3">
              <Headphones className="h-4 w-4 text-zinc-400" />
              <div className="font-bold text-white text-sm">No agent left guessing.</div>
              <p className="text-[#8896a6] leading-relaxed text-xs">
                Deterministic gates catch FX drift, missing receipts, and unbalanced debits before human review.
              </p>
            </div>
          </div>
        </div>

        {/* Signals & Radar Display (Exact Image 1) */}
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 text-left">
            {/* Left Column: Signals text & navigation */}
            <div className="lg:col-span-6 p-8 sm:p-12 lg:p-16 space-y-6">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#131b2e] text-[#60a5fa] border border-[#1e3a8a]">
                Deterministic Gates
              </span>
              <h3 className="text-3xl sm:text-4xl lg:text-[44px] font-semibold tracking-[-0.03em] text-white leading-[1.15]">
                All of the evidence, none of the hallucinations.{' '}
                <span className="text-[#8896a6] font-normal">Ready to merge.</span>
              </h3>
              <div>
                <button className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-white/[0.15] text-xs font-medium text-white hover:bg-white/[0.08] transition-colors">
                  Explore Control Rules →
                </button>
              </div>

              {/* Interactive Context Tabs */}
              <div className="pt-10 space-y-5">
                <div className="text-xs sm:text-sm font-medium text-[#64748b] hover:text-white cursor-pointer transition-colors">
                  Evidence Lineage
                </div>

                <div className="space-y-2">
                  <div className="text-sm sm:text-base font-semibold text-white">
                    Agents + automated repair
                  </div>
                  <p className="text-xs text-[#8896a6] leading-relaxed max-w-sm">
                    An always-on finance gatekeeper. Deterministic matching, FX variance repair, citation verification, running 24/7.
                  </p>
                  <div className="w-full max-w-sm h-0.5 bg-white/10 mt-3 rounded-full overflow-hidden">
                    <div className="w-[45%] h-full bg-white rounded-full" />
                  </div>
                </div>

                <div className="text-xs sm:text-sm font-medium text-[#64748b] hover:text-white cursor-pointer transition-colors pt-2">
                  Audit Sandbox
                </div>
              </div>
            </div>

            {/* Right Column: Radar Visual with hairline vertical dividing border */}
            <div className="lg:col-span-6 border-t lg:border-t-0 lg:border-l border-white/[0.08] p-8 sm:p-12 flex items-center justify-center relative overflow-hidden">
              <div className="relative w-full max-w-[440px] aspect-square flex items-center justify-center">
                {/* SVG Radar */}
                <svg viewBox="0 0 500 500" className="w-full h-full">
                  <defs>
                    <radialGradient id="radarCenterGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                      <stop offset="20%" stopColor="#ffffff" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="radarVerticalBeam" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                      <stop offset="30%" stopColor="#ffffff" stopOpacity="0.5" />
                      <stop offset="70%" stopColor="#ffffff" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* 4 Concentric Circles */}
                  <circle cx="250" cy="250" r="60" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none" />
                  <circle cx="250" cy="250" r="120" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none" />
                  <circle cx="250" cy="250" r="185" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none" />
                  <circle cx="250" cy="250" r="240" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none" />

                  {/* Crosshair Axes (Dashed) */}
                  <line x1="250" y1="10" x2="250" y2="490" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="10" y1="250" x2="490" y2="250" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="4 4" />

                  {/* Diagonal Axes (Finer dashed) */}
                  <line x1="80" y1="80" x2="420" y2="420" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="3 4" />
                  <line x1="80" y1="420" x2="420" y2="80" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="3 4" />

                  {/* Vertical Illuminated Radar Trace Line (from center up to top ring) */}
                  <line x1="250" y1="250" x2="250" y2="65" stroke="url(#radarVerticalBeam)" strokeWidth="1.5" />
                  {/* Glowing Detection Ping along the vertical line */}
                  <circle cx="250" cy="140" r="3" fill="#ffffff" filter="drop-shadow(0 0 8px #ffffff)" />

                  {/* Central Glowing Radar Core */}
                  <circle cx="250" cy="250" r="12" fill="url(#radarCenterGlow)" />
                  <circle cx="250" cy="250" r="4.5" fill="#ffffff" filter="drop-shadow(0 0 10px #ffffff)" />

                  {/* Rotating Radar Sweep Beam */}
                  <g className="animate-radar-sweep origin-[250px_250px]">
                    <path
                      d="M 250 250 L 250 10 A 240 240 0 0 1 420 80 Z"
                      fill="url(#sweepGradient)"
                      opacity="0.18"
                    />
                    <defs>
                      <linearGradient id="sweepGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. CONNECTIVITY SECTION (Exact Attio Image 2 Replication)                 */}
      {/* ========================================================================= */}
      <section className="w-full attio-pinstripe-dark text-white pt-20 pb-28 border-b border-white/[0.08] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12 text-center">
          {/* Top Header */}
          <div className="space-y-3 max-w-2xl mx-auto">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#131b2e] text-[#60a5fa] border border-[#1e3a8a]">
              Integrations &amp; Stack
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.035em] text-white">
              Your entire financial stack, unified.
            </h2>
            <p className="text-xs sm:text-sm text-[#8896a6] max-w-md mx-auto leading-relaxed">
              Stripe, NetSuite, SAP, Mercury, Brex, Claude, OpenAI, and your core enterprise ledgers.
            </p>
            <div className="pt-1">
              <button className="px-3.5 py-1.5 rounded-lg border border-white/[0.15] text-xs font-medium text-white hover:bg-white/[0.08] transition-colors">
                Explore the ecosystem →
              </button>
            </div>
          </div>

          {/* App Icons Dock Row (Exact Icons from Image 2) */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 overflow-x-auto py-4 px-2 no-scrollbar">
            {/* 1. Notion */}
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-[#121316] border border-white/[0.08] flex items-center justify-center hover:scale-110 hover:border-white/30 transition-all cursor-pointer shadow-lg shrink-0">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l11.238-.839c.373 0 .466-.187.327-.467L17.26 1.83C16.84 1.177 16.094 1 15.068 1.093L3.107 2.026C2.36 2.073 2.08 2.399 2.22 2.866l2.239 1.342zm.886 4.385v12.315c0 .746.467 1.026 1.306 1.026l12.778-.746c.746 0 .933-.56.933-1.12V7.659c0-.653-.28-1.026-.84-1.026l-13.337.84c-.56 0-.84.373-.84 1.12zm12.314.933c.093.466 0 .933-.466.933l-1.027.093v8.303c-.466.373-.933.56-1.399.56-.653 0-.933-.28-1.399-1.026l-4.292-6.623v6.717l1.306.186c.093.467 0 .933-.467.933l-3.265.187c-.093-.467 0-.933.467-.933l1.026-.093V10.738l-1.306-.093c-.093-.467 0-.933.467-.933l3.452-.187 4.57 6.81V10.18l-1.213-.093c-.093-.467 0-.933.467-.933l3.078-.187z" />
              </svg>
            </div>

            {/* 2. Raycast Asterisk */}
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-[#121316] border border-white/[0.08] flex items-center justify-center hover:scale-110 hover:border-white/30 transition-all cursor-pointer shadow-lg shrink-0">
              <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-white" strokeWidth="2.2" strokeLinecap="round">
                <line x1="12" y1="3" x2="12" y2="21" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="5.64" y1="5.64" x2="18.36" y2="18.36" />
                <line x1="5.64" y1="18.36" x2="18.36" y2="5.64" />
              </svg>
            </div>

            {/* 3. Linear */}
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-[#121316] border border-white/[0.08] flex items-center justify-center hover:scale-110 hover:border-white/30 transition-all cursor-pointer shadow-lg shrink-0">
              <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-white" strokeWidth="2" fill="none">
                <circle cx="12" cy="12" r="9" />
                <path d="M7 17L17 7M7 12L12 7M12 17L17 12" />
              </svg>
            </div>

            {/* 4. Slack */}
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-[#121316] border border-white/[0.08] flex items-center justify-center hover:scale-110 hover:border-white/30 transition-all cursor-pointer shadow-lg shrink-0">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
              </svg>
            </div>

            {/* 5. Clay / Expensify */}
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-[#121316] border border-white/[0.08] flex items-center justify-center hover:scale-110 hover:border-white/30 transition-all cursor-pointer shadow-lg shrink-0">
              <div className="h-7 w-7 rounded-lg border-2 border-white flex items-center justify-center text-white font-bold text-sm">
                E
              </div>
            </div>

            {/* 6. Granola Spiral */}
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-[#121316] border border-white/[0.08] flex items-center justify-center hover:scale-110 hover:border-white/30 transition-all cursor-pointer shadow-lg shrink-0">
              <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-white" strokeWidth="2" fill="none">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7a5 5 0 0 1 5 5c0 2.76-2.24 5-5 5s-5-2.24-5-5a2.5 2.5 0 0 1 2.5-2.5" />
              </svg>
            </div>

            {/* 7. Grid Matrix */}
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-[#121316] border border-white/[0.08] flex items-center justify-center hover:scale-110 hover:border-white/30 transition-all cursor-pointer shadow-lg shrink-0">
              <div className="grid grid-cols-3 gap-1">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="h-1.5 w-1.5 rounded-xs bg-white" />
                ))}
              </div>
            </div>

            {/* 8. OpenAI */}
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-[#121316] border border-white/[0.08] flex items-center justify-center hover:scale-110 hover:border-white/30 transition-all cursor-pointer shadow-lg shrink-0">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 8.76a4.485 4.485 0 0 1 2.37-2.024v5.7l5.843 3.37a.78.78 0 0 0 .39.106.758.758 0 0 0 .39-.106l-2.02-1.168a.08.08 0 0 1-.037-.06V9.083L4.44 6.326a4.495 4.495 0 0 1-2.1 2.434zm15.42-3.882l-4.78-2.76a.795.795 0 0 0-.78 0L6.357 5.487l2.02 1.167a.08.08 0 0 1 .038.062v5.584l4.839-2.793a4.495 4.495 0 0 1 4.506.12zm3.9 4.764a4.476 4.476 0 0 1-.535 3.014l-.142-.085-4.783-2.759a.771.771 0 0 0-.78 0l-5.843 3.369v-2.332a.08.08 0 0 1 .033-.062L14.26 8.05a4.5 4.5 0 0 1 6.14 1.646zM10.74 15.24l-2.39-1.38 2.39-1.38 2.39 1.38z" />
              </svg>
            </div>

            {/* 9. Stripe / S */}
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-[#121316] border border-white/[0.08] flex items-center justify-center hover:scale-110 hover:border-white/30 transition-all cursor-pointer shadow-lg shrink-0">
              <span className="text-white font-bold text-xl font-sans">S</span>
            </div>

            {/* 10. Swirl Icon */}
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-[#121316] border border-white/[0.08] flex items-center justify-center hover:scale-110 hover:border-white/30 transition-all cursor-pointer shadow-lg shrink-0">
              <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-white" strokeWidth="2" fill="none">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 16a6 6 0 1 1 6-6 6 6 0 0 1-6 6zm0-8a2 2 0 1 0 2 2 2 2 0 0 0-2-2z" />
              </svg>
            </div>

            {/* 11. Anthropic Sunburst */}
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-[#121316] border border-white/[0.08] flex items-center justify-center hover:scale-110 hover:border-white/30 transition-all cursor-pointer shadow-lg shrink-0">
              <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-white" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="2" x2="12" y2="6" />
                <line x1="12" y1="18" x2="12" y2="22" />
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                <line x1="2" y1="12" x2="6" y2="12" />
                <line x1="18" y1="12" x2="22" y2="12" />
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
                <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
              </svg>
            </div>
          </div>

          {/* Bottom Technical Card: SDK. API. MCP. (Exact Image 2 Bottom) */}
          <div className="relative mt-12 rounded-2xl border border-white/[0.08] bg-[#0c0d10] p-6 sm:p-10 max-w-5xl mx-auto overflow-hidden text-left shadow-2xl">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Left Column: SDK info card */}
              <div className="md:col-span-6 rounded-xl border border-white/[0.08] bg-[#111317]/80 p-6 sm:p-8 backdrop-blur-xs space-y-4">
                <div className="space-y-1">
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    SDK. API. MCP.
                  </h3>
                  <div className="text-xl sm:text-2xl font-normal text-[#60a5fa]">
                    Govern any agent on Verity.
                  </div>
                  <p className="text-xs text-[#8896a6] leading-relaxed pt-1">
                    Expose deterministic control gates, citation inspectors, and sandbox ledgers via REST, Python SDK, and Model Context Protocol.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/controls"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.2] text-xs font-medium text-white hover:bg-white/[0.08] transition-colors"
                  >
                    View control docs →
                  </Link>
                </div>
              </div>

              {/* Right Column: 3D Isometric Geometric Wireframe Constellation */}
              <div className="md:col-span-6 h-64 w-full flex items-center justify-center relative">
                <svg viewBox="0 0 400 240" className="w-full h-full">
                  <defs>
                    {/* Isometric Hatching Pattern */}
                    <pattern id="isoHatch" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
                    </pattern>
                  </defs>

                  {/* Isometric Grid Background Lines */}
                  <g stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" strokeDasharray="3 3">
                    <line x1="50" y1="40" x2="350" y2="200" />
                    <line x1="50" y1="120" x2="350" y2="40" />
                    <line x1="120" y1="20" x2="120" y2="220" />
                    <line x1="280" y1="20" x2="280" y2="220" />
                    <line x1="200" y1="20" x2="200" y2="220" />
                  </g>

                  {/* Isometric Prism 1 (Left Wing) */}
                  <polygon points="120,80 170,50 170,110 120,140" fill="url(#isoHatch)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" />
                  <polygon points="170,50 220,80 220,140 170,110" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

                  {/* Isometric Prism 2 (Right Wing) */}
                  <polygon points="220,80 270,50 270,110 220,140" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  <polygon points="270,50 320,80 320,140 270,110" fill="url(#isoHatch)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" />

                  {/* Isometric Lower Extension */}
                  <polygon points="170,110 220,140 220,200 170,170" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  <polygon points="220,140 270,110 270,170 220,200" fill="url(#isoHatch)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" />

                  {/* Constellation Nodes at Vertices */}
                  <circle cx="120" cy="80" r="3.5" fill="#ffffff" />
                  <circle cx="170" cy="50" r="3.5" fill="#ffffff" />
                  <circle cx="220" cy="80" r="4.5" fill="#ffffff" filter="drop-shadow(0 0 6px #ffffff)" />
                  <circle cx="270" cy="50" r="3.5" fill="#ffffff" />
                  <circle cx="320" cy="80" r="3.5" fill="#ffffff" />

                  <circle cx="120" cy="140" r="3" fill="#8896a6" />
                  <circle cx="170" cy="110" r="3" fill="#8896a6" />
                  <circle cx="220" cy="140" r="3" fill="#ffffff" />
                  <circle cx="270" cy="110" r="3" fill="#8896a6" />
                  <circle cx="320" cy="140" r="3" fill="#8896a6" />

                  <circle cx="170" cy="170" r="3" fill="#8896a6" />
                  <circle cx="220" cy="200" r="3.5" fill="#ffffff" />
                  <circle cx="270" cy="170" r="3" fill="#8896a6" />

                  {/* Floating Micro Nodes */}
                  <circle cx="80" cy="110" r="2.5" fill="#60a5fa" />
                  <circle cx="350" cy="110" r="2.5" fill="#60a5fa" />
                  <circle cx="220" cy="30" r="2.5" fill="#60a5fa" />
                  <line x1="80" y1="110" x2="120" y2="80" stroke="rgba(96,165,250,0.3)" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="320" y1="80" x2="350" y2="110" stroke="rgba(96,165,250,0.3)" strokeWidth="1" strokeDasharray="3 3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. "RUN AT ANY SCALE"                                                     */}
      {/* ========================================================================= */}
      <section className="w-full py-16 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto">
        {/* Scale Section: Full-Width Unified Canvas with Exponential Growth Curve & Vertical Pinstripes */}
        <div className="relative w-full rounded-2xl border border-zinc-200/80 bg-white overflow-hidden shadow-xs min-h-[520px] sm:min-h-[580px] lg:min-h-[620px] flex flex-col justify-between p-8 sm:p-12 lg:p-16">
          {/* Background Exponential Curve with Vertical Hairlines Underneath (Exact Match to Image) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1440 640"
            fill="none"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="scaleVerticalPinstripes"
                width="12"
                height="12"
                patternUnits="userSpaceOnUse"
              >
                <line x1="0" y1="0" x2="0" y2="12" stroke="#e2e8f0" strokeWidth="1" />
              </pattern>
              <clipPath id="scaleCurveArea">
                <path d="M 0 585 C 680 585, 1120 340, 1440 0 L 1440 640 L 0 640 Z" />
              </clipPath>
            </defs>

            {/* Vertical pinstripes shading exclusively under the curve */}
            <rect
              x="0"
              y="0"
              width="1440"
              height="640"
              fill="url(#scaleVerticalPinstripes)"
              clipPath="url(#scaleCurveArea)"
            />

            {/* Sharp blue trajectory curve */}
            <path
              d="M 0 585 C 680 585, 1120 340, 1440 0"
              stroke="#2563eb"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>

          {/* Left-Aligned Foreground Content */}
          <div className="relative z-10 max-w-xl">
            {/* Pill Badge */}
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#eff6ff] text-[#2563eb] border border-[#dbeafe] mb-5">
              Build to scale
            </span>

            {/* Headline matching image typography and line breaks */}
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-[#0f172a] leading-[1.14]">
              Run at any scale.
              <br />
              <span className="font-normal text-[#64748b]">
                Production-grade for
                <br />
                your team and agents.
              </span>
            </h2>

            {/* 2x2 Metric Stats Grid with blue vertical indicators */}
            <div className="grid grid-cols-2 gap-x-12 sm:gap-x-16 gap-y-7 sm:gap-y-8 mt-10 sm:mt-12 max-w-md">
              {/* Stat 1: 10.9M */}
              <div className="border-l-2 border-[#2563eb] pl-3.5">
                <div className="text-2xl sm:text-[28px] font-semibold text-[#0f172a] tracking-tight leading-none">
                  10.9M
                </div>
                <div className="text-[12px] sm:text-[13px] text-[#64748b] mt-1.5 font-normal">
                  MCP calls/month
                </div>
              </div>

              {/* Stat 2: 400M */}
              <div className="border-l-2 border-[#2563eb] pl-3.5">
                <div className="text-2xl sm:text-[28px] font-semibold text-[#0f172a] tracking-tight leading-none">
                  400M
                </div>
                <div className="text-[12px] sm:text-[13px] text-[#64748b] mt-1.5 font-normal">
                  API calls/week
                </div>
              </div>

              {/* Stat 3: 76k */}
              <div className="border-l-2 border-[#2563eb] pl-3.5">
                <div className="text-2xl sm:text-[28px] font-semibold text-[#0f172a] tracking-tight leading-none">
                  76k
                </div>
                <div className="text-[12px] sm:text-[13px] text-[#64748b] mt-1.5 font-normal">
                  active customer agents
                </div>
              </div>

              {/* Stat 4: 15M */}
              <div className="border-l-2 border-[#2563eb] pl-3.5">
                <div className="text-2xl sm:text-[28px] font-semibold text-[#0f172a] tracking-tight leading-none">
                  15M
                </div>
                <div className="text-[12px] sm:text-[13px] text-[#64748b] mt-1.5 font-normal">
                  ledger lines verified/day
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. CHANGELOG & VERITY FOOTER HERO                                         */}
      {/* ========================================================================= */}
      <section className="w-full py-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-8 border-t border-black/[0.06]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-600 border border-blue-200/60 mb-2">
              Changelog
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950">
              Better as you grow.{' '}
              <span className="text-zinc-400 font-normal">
                New features every week to keep pace with you.
              </span>
            </h2>
          </div>
          <button className="px-3 py-1.5 rounded-lg border border-black/[0.12] text-xs font-medium text-zinc-900 hover:bg-zinc-50 transition-colors shadow-2xs">
            View all →
          </button>
        </div>

        {/* Horizontal Changelog Cards with Ruler Ticks Below */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { date: 'August 28, 2026', title: 'New Control Packs', desc: 'Pre-built rules for FX, intercompany, and bank fee reconciliation.' },
            { date: 'August 28, 2026', title: 'Automated Repair Loops', desc: 'Deterministic block feedback returns directly to agent context.' },
            { date: 'August 28, 2026', title: 'Hash-Linked Ledger', desc: 'Sandbox ledger records with cryptographic block hashes.' },
            { date: 'August 28, 2026', title: 'A refreshed Finance PR', desc: 'High-density split diffs and citation source drawers.' },
          ].map((item, idx) => (
            <div key={idx} className="space-y-2">
              <div className="text-[10px] font-mono text-zinc-400">{item.date}</div>
              <div className="text-xs font-semibold text-zinc-900">{item.title}</div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">{item.desc}</p>
              <div className="ruler-pattern border-t border-black/[0.08] pt-1.5" />
            </div>
          ))}
        </div>

        {/* Newsletter Box */}
        <div className="flex flex-wrap items-center justify-between gap-6 p-5 rounded-2xl border border-black/[0.08] bg-white shadow-2xs">
          <div>
            <div className="text-xs font-semibold text-zinc-900">Stay ahead of reconciliation.</div>
            <div className="text-[11px] text-zinc-500">Merge control updates in your inbox.</div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="email"
              suppressHydrationWarning
              placeholder="Your work email..."
              className="h-8 px-3 text-xs bg-zinc-50 border border-black/[0.1] rounded-lg text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-black w-60"
            />
            <button suppressHydrationWarning className="h-8 px-3.5 text-xs font-semibold bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. ATTIO EXACT FOOTER HERO & MULTI-COLUMN NAVIGATION                      */}
      {/* ========================================================================= */}
      <footer className="w-full bg-black text-white">
        {/* Top Pinstriped CTA Hero Banner */}
        <div className="w-full attio-pinstripe-dark border-y border-white/[0.08] py-24 sm:py-32 relative overflow-hidden flex flex-col items-center justify-center">
          {/* Subtle radial center vignette */}
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#08090b]/60 to-[#08090b] pointer-events-none" />

          <div className="relative z-10 text-center space-y-6 max-w-3xl px-4 mx-auto">
            <h2 className="text-4xl sm:text-5xl md:text-[56px] font-bold tracking-[-0.035em] text-white leading-[1.08]">
              Agentic finance
              <br />
              runs on Verity.
            </h2>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link
                href="/cases/CASE-2049"
                className="px-4 py-2 rounded-lg border border-white/20 bg-[#16171a] text-xs font-medium text-white hover:bg-white/[0.1] transition-colors shadow-xs"
              >
                Talk to sales
              </Link>
              <Link
                href="/queue"
                className="px-4 py-2 rounded-lg border border-white/10 bg-[#25272e] text-xs font-medium text-white hover:bg-[#2f323a] transition-colors shadow-xs"
              >
                Launch Verity
              </Link>
            </div>
          </div>
        </div>

        {/* Main Multi-Column Navigation */}
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pt-20 pb-12">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-10 lg:gap-8">
            {/* Column 1: Verity Logo & Mission */}
            <div className="col-span-2 md:col-span-12 lg:col-span-3">
              <div className="flex items-center gap-2.5">
                {/* Verity Signature Layered Prism Mark */}
                <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-white text-black shadow-xs">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-black">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-2xl font-bold tracking-tight text-white lowercase">verity</span>
              </div>
              <p className="text-xs text-zinc-500 mt-3 leading-relaxed max-w-xs">
                The change-control plane &amp; merge gate for agent-generated finance work.
              </p>
            </div>

            {/* Column 2: Platform & Governance */}
            <div className="col-span-1 md:col-span-3 lg:col-span-2 space-y-9 text-[13px]">
              <div>
                <h4 className="text-[13px] font-medium text-[#60a5fa] mb-3.5">Platform</h4>
                <ul className="space-y-2.5 text-zinc-400 font-normal">
                  <li>
                    <Link href="/cases/CASE-2049" className="hover:text-white transition-colors inline-flex items-center">
                      Finance PRs
                      <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-medium bg-blue-950/80 text-blue-400 border border-blue-500/30 rounded-full leading-none">
                        New
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/controls" className="hover:text-white transition-colors">
                      Deterministic CI
                    </Link>
                  </li>
                  <li>
                    <Link href="/queue" className="hover:text-white transition-colors">
                      Sandbox Ledger
                    </Link>
                  </li>
                  <li>
                    <Link href="/metrics" className="hover:text-white transition-colors inline-flex items-center gap-0.5">
                      Repair Loops <span className="text-[11px] opacity-70">↗</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/queue" className="hover:text-white transition-colors inline-flex items-center gap-0.5">
                      Audit Replay <span className="text-[11px] opacity-70">↗</span>
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-[13px] font-medium text-[#60a5fa] mb-3.5">Governance</h4>
                <ul className="space-y-2.5 text-zinc-400 font-normal">
                  <li><Link href="/cases/CASE-2049" className="hover:text-white transition-colors">Controller Review</Link></li>
                  <li><Link href="/controls" className="hover:text-white transition-colors">Policy Provenance</Link></li>
                  <li>
                    <Link href="/metrics" className="hover:text-white transition-colors inline-flex items-center">
                      Evidence Lineage
                      <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-medium bg-blue-950/80 text-blue-400 border border-blue-500/30 rounded-full leading-none">
                        New
                      </span>
                    </Link>
                  </li>
                  <li><a href="#" className="hover:text-white transition-colors">SOC2 Type II</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Security Spec</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Status ↗</a></li>
                </ul>
              </div>
            </div>

            {/* Column 3: Ingest from & Verity for */}
            <div className="col-span-1 md:col-span-3 lg:col-span-2 space-y-9 text-[13px]">
              <div>
                <h4 className="text-[13px] font-medium text-[#60a5fa] mb-3.5">Ingest from</h4>
                <ul className="space-y-2.5 text-zinc-400 font-normal">
                  <li><a href="#" className="hover:text-white transition-colors">Stripe</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">NetSuite</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">SAP ERP</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Mercury Bank</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Brex</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Plaid MT940</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-[13px] font-medium text-[#60a5fa] mb-3.5">Verity for</h4>
                <ul className="space-y-2.5 text-zinc-400 font-normal">
                  <li><a href="#" className="hover:text-white transition-colors">Autonomous Finance</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Enterprise Controllers</a></li>
                </ul>
              </div>
            </div>

            {/* Column 4: Agent Runtimes */}
            <div className="col-span-1 md:col-span-3 lg:col-span-2 text-[13px]">
              <h4 className="text-[13px] font-medium text-[#60a5fa] mb-3.5">Agent Runtimes</h4>
              <ul className="space-y-2.5 text-zinc-400 font-normal">
                <li><a href="#" className="hover:text-white transition-colors">Anthropic Claude</a></li>
                <li><a href="#" className="hover:text-white transition-colors">OpenAI Operator</a></li>
                <li><a href="#" className="hover:text-white transition-colors">LangGraph</a></li>
                <li><a href="#" className="hover:text-white transition-colors">CrewAI</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Model Context Protocol</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Python SDK</a></li>
                <li><a href="#" className="hover:text-white transition-colors">TypeScript SDK</a></li>
                <li><a href="#" className="hover:text-white transition-colors">REST API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Webhooks</a></li>
              </ul>
            </div>

            {/* Column 5: Resources */}
            <div className="col-span-1 md:col-span-3 lg:col-span-2 text-[13px]">
              <h4 className="text-[13px] font-medium text-[#60a5fa] mb-3.5">Resources</h4>
              <ul className="space-y-2.5 text-zinc-400 font-normal">
                <li><Link href="/controls" className="hover:text-white transition-colors">Merge Control Guide</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation ↗</a></li>
                <li><a href="#" className="hover:text-white transition-colors">ECB Oracle Fixes ↗</a></li>
                <li><Link href="/controls" className="hover:text-white transition-colors">Control Packs Library</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Hire a Specialist</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Downloads</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Trust Center ↗</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Row: Social Icons & Legal */}
          <div className="mt-20 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-6 text-[12px] text-zinc-500">
            {/* Left: 4 Social Icons */}
            <div className="flex items-center gap-5 text-zinc-500">
              {/* LinkedIn */}
              <a href="#" aria-label="LinkedIn" className="hover:text-white transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.4 9.74v-8.37H5.06v8.37h2.8z" />
                </svg>
              </a>
              {/* X / Twitter */}
              <a href="#" aria-label="X (Twitter)" className="hover:text-white transition-colors">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* GitHub */}
              <a href="https://github.com/anuraggdubey/verity" target="_blank" rel="noreferrer" aria-label="GitHub" className="hover:text-white transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
              {/* YouTube */}
              <a href="#" aria-label="YouTube" className="hover:text-white transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>

            {/* Right: Copyright & Legal Links */}
            <div className="flex flex-wrap items-center gap-6">
              <span>© 2026 Verity Technologies Inc. All rights reserved.</span>
              <a href="#" className="hover:text-zinc-400 transition-colors">Services Agreement</a>
              <a href="#" className="hover:text-zinc-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-zinc-400 transition-colors">Security &amp; LLMs</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
