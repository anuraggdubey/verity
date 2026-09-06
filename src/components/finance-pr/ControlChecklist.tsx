'use client';

import React from 'react';
import { ControlReport } from '../../lib/contracts/types';
import { CheckCircle2, XCircle, ShieldCheck, ShieldAlert, Cpu } from 'lucide-react';

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
    <div className="rounded-xl border border-black/[0.06] bg-white overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.06] bg-zinc-50/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-zinc-500" />
          <h4 className="text-xs font-medium text-zinc-800">Control Evaluation</h4>
        </div>
        {report.blocked ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            CI Failed
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Merge Ready
          </span>
        )}
      </div>

      <div className="divide-y divide-black/[0.04] p-4 space-y-4">
        {Object.entries(grouped).map(([familyKey, checks]) => {
          const familyMeta = familyLabels[familyKey] || { title: familyKey, icon: ShieldCheck };
          const FamilyIcon = familyMeta.icon;

          return (
            <div key={familyKey} className="pt-3 first:pt-0">
              <div className="flex items-center gap-2 mb-2.5">
                <FamilyIcon className="h-3.5 w-3.5 text-zinc-400" />
                <h5 className="text-[11px] font-mono font-medium uppercase tracking-wider text-zinc-400">
                  {familyMeta.title}
                </h5>
              </div>

              <div className="space-y-2">
                {checks.map((check) => {
                  const isBlocked = check.status === 'blocked';
                  return (
                    <div
                      key={check.code}
                      className={`rounded-lg border p-3 transition-colors ${
                        isBlocked
                          ? 'border-rose-200 bg-rose-50/50'
                          : 'border-black/[0.04] bg-zinc-50/50 hover:border-black/[0.08]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2">
                          {isBlocked ? (
                            <XCircle className="h-4 w-4 text-rose-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-medium text-zinc-800">
                                {check.code}
                              </span>
                              <span className="text-xs text-zinc-600 font-sans">
                                {check.claim}
                              </span>
                            </div>

                            {isBlocked && check.failure && (
                              <div className="mt-2.5 rounded-md border border-rose-200 bg-white p-2.5 text-xs text-rose-700 font-mono leading-relaxed">
                                <div className="text-rose-600 font-medium mb-1">Fail reason</div>
                                <div>{check.failure}</div>
                                {check.requiredRepair && (
                                  <div className="mt-2 pt-2 border-t border-rose-100 text-emerald-700">
                                    <span className="font-medium text-zinc-500">Required repair: </span>
                                    {check.requiredRepair}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-medium flex-shrink-0 ${
                            isBlocked
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
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
