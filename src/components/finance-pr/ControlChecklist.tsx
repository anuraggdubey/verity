'use client';

import React from 'react';
import { ControlReport } from '../../lib/contracts/types';
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, ShieldAlert, Cpu } from 'lucide-react';

interface ControlChecklistProps {
  report?: ControlReport;
  activeRevIndex: number;
}

export function ControlChecklist({ report, activeRevIndex }: ControlChecklistProps) {
  if (!report) return null;

  const familyLabels: Record<string, { title: string; icon: React.ElementType }> = {
    evidence_lineage: { title: 'Evidence Lineage', icon: ShieldCheck },
    accounting_integrity: { title: 'Accounting Integrity', icon: ShieldCheck },
    policy_provenance: { title: 'Policy & Market Provenance', icon: ShieldAlert },
  };

  const grouped = report.results.reduce((acc, curr) => {
    acc[curr.family] = acc[curr.family] || [];
    acc[curr.family].push(curr);
    return acc;
  }, {} as Record<string, typeof report.results>);

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0c0d12] overflow-hidden">
      {/* CI Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#11131a] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-emerald-400" />
          <h4 className="text-xs font-semibold text-zinc-200">The CI Moment: Control Evaluation Matrix</h4>
        </div>
        <div className="flex items-center gap-2">
          {report.blocked ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-rose-950/40 text-rose-300 border border-rose-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-ping" />
              Controls Blocked (CI Failed)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-950/40 text-emerald-300 border border-emerald-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              All Controls Passed (Merge Ready)
            </span>
          )}
        </div>
      </div>

      {/* Families list */}
      <div className="divide-y divide-white/[0.06] p-4 space-y-4">
        {Object.entries(grouped).map(([familyKey, checks]) => {
          const familyMeta = familyLabels[familyKey] || { title: familyKey, icon: ShieldCheck };
          const FamilyIcon = familyMeta.icon;

          return (
            <div key={familyKey} className="pt-3 first:pt-0">
              <div className="flex items-center gap-2 mb-2.5">
                <FamilyIcon className="h-3.5 w-3.5 text-zinc-400" />
                <h5 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
                  {familyMeta.title}
                </h5>
              </div>

              <div className="space-y-2">
                {checks.map((check) => {
                  const isBlocked = check.status === 'blocked';
                  return (
                    <div
                      key={check.code}
                      className={`rounded-lg border p-3 transition-all ${
                        isBlocked
                          ? 'border-rose-500/40 bg-rose-950/20 shadow-[0_0_12px_rgba(239,68,68,0.15)]'
                          : 'border-white/[0.04] bg-white/[0.01] hover:border-white/[0.08]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2">
                          {isBlocked ? (
                            <XCircle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-semibold text-zinc-200">
                                {check.code}
                              </span>
                              <span className="text-xs text-zinc-300 font-sans">
                                {check.claim}
                              </span>
                            </div>

                            {/* Failure details if blocked */}
                            {isBlocked && check.failure && (
                              <div className="mt-2.5 rounded border border-rose-500/30 bg-black/40 p-2.5 text-xs text-rose-300 font-mono leading-relaxed">
                                <div className="text-rose-400 font-semibold mb-1">FAIL REASON:</div>
                                <div>{check.failure}</div>
                                {check.requiredRepair && (
                                  <div className="mt-2 pt-2 border-t border-rose-500/20 text-emerald-300">
                                    <span className="font-semibold text-zinc-400">REQUIRED AGENT REPAIR: </span>
                                    {check.requiredRepair}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold flex-shrink-0 ${
                            isBlocked
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {check.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
