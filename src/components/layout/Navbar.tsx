'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  ArrowRight,
  GitPullRequest,
  Layers,
  ShieldCheck,
  Activity,
  Lock,
  Sparkles,
  Cpu,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const [platformOpen, setPlatformOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full transition-all">
      {/* Main Frosted Glass Navbar */}
      <div className="w-full border-b border-black/[0.06] bg-white/80 backdrop-blur-xl transition-colors">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
          {/* Brand & Left Nav */}
          <div className="flex items-center gap-10">
            {/* Geometric Classy Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-b from-zinc-900 to-black text-white shadow-xs border border-black/10 group-hover:scale-105 transition-transform">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white"
                >
                  <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 17L12 22L22 17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 12L12 17L22 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="font-bold text-lg tracking-[-0.03em] text-zinc-950 font-sans">
                verity
              </span>
            </Link>

            {/* Menu Links with Attio-Grade Hover States */}
            <nav className="hidden md:flex items-center gap-1">
              {/* Platform Dropdown Trigger */}
              <div
                className="relative"
                onMouseEnter={() => setPlatformOpen(true)}
                onMouseLeave={() => setPlatformOpen(false)}
              >
                <button
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                    platformOpen || pathname === '/'
                      ? 'text-zinc-950 bg-black/[0.04]'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-black/[0.02]'
                  }`}
                >
                  <span>Platform</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 ${
                      platformOpen ? 'rotate-180 text-zinc-700' : ''
                    }`}
                  />
                </button>

                {/* Frosted Dropdown Menu */}
                {platformOpen && (
                  <div className="absolute top-full left-0 mt-1 w-96 rounded-2xl border border-black/[0.08] bg-white/95 p-3 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                    <div className="space-y-1">
                      <Link
                        href="/cases/CASE-2049"
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-zinc-50 transition-colors group"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                          <GitPullRequest className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-zinc-900 group-hover:text-blue-600 flex items-center gap-1.5">
                            <span>Finance PR Engine</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 font-medium">
                              Live
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-500 leading-snug mt-0.5">
                            Isolated accounting proposals with verified evidence citations & double-entry diffs.
                          </p>
                        </div>
                      </Link>

                      <Link
                        href="/queue"
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-zinc-50 transition-colors group"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                          <Layers className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-zinc-900 group-hover:text-emerald-600">
                            Exception Triage Queue
                          </div>
                          <p className="text-[11px] text-zinc-500 leading-snug mt-0.5">
                            Automated classification into Auto-Clear, Review, and Escalation swimlanes.
                          </p>
                        </div>
                      </Link>

                      <Link
                        href="/controls"
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-zinc-50 transition-colors group"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 border border-violet-100">
                          <ShieldCheck className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-zinc-900 group-hover:text-violet-600">
                            Control PR Governance
                          </div>
                          <p className="text-[11px] text-zinc-500 leading-snug mt-0.5">
                            Autonomous guardrail evolution with positive and negative replay tests.
                          </p>
                        </div>
                      </Link>

                      <Link
                        href="/metrics"
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-zinc-50 transition-colors group"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                          <Activity className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-zinc-900 group-hover:text-amber-600">
                            Benchmark Telemetry
                          </div>
                          <p className="text-[11px] text-zinc-500 leading-snug mt-0.5">
                            Store-backed metrics: zero unsafe escapes, auto-clear rates, and repair latency.
                          </p>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Direct Navigation Links */}
              <Link
                href="/queue"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                  pathname === '/queue'
                    ? 'text-zinc-950 bg-black/[0.04] font-semibold'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-black/[0.02]'
                }`}
              >
                <span>Exceptions</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">
                  8
                </span>
              </Link>

              <Link
                href="/cases/CASE-2049"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                  pathname.startsWith('/cases')
                    ? 'text-zinc-950 bg-black/[0.04] font-semibold'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-black/[0.02]'
                }`}
              >
                <span>Finance PR</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-600 border border-blue-200 font-medium">
                  Diff
                </span>
              </Link>

              <Link
                href="/controls"
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                  pathname === '/controls'
                    ? 'text-zinc-950 bg-black/[0.04] font-semibold'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-black/[0.02]'
                }`}
              >
                Control PRs
              </Link>

              <Link
                href="/metrics"
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                  pathname === '/metrics'
                    ? 'text-zinc-950 bg-black/[0.04] font-semibold'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-black/[0.02]'
                }`}
              >
                Benchmarks
              </Link>
            </nav>
          </div>

          {/* Right Action buttons - Attio Classy Style */}
          <div className="flex items-center gap-3">
            <Link
              href="/cases/CASE-2049"
              className="hidden sm:inline-flex items-center justify-center text-xs font-semibold px-3.5 py-2 rounded-xl text-zinc-700 hover:text-zinc-950 hover:bg-black/[0.04] transition-colors"
            >
              Talk to sales
            </Link>

            <Link
              href="/queue"
              className="inline-flex items-center justify-center text-xs font-semibold px-4 py-2 rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_3px_rgba(0,0,0,0.15)] hover:scale-[1.02] active:scale-[0.98]"
            >
              Start for free
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
