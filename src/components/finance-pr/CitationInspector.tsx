'use client';

import React, { useState } from 'react';
import { Citation } from '../../lib/contracts/types';
import { FileText, Database, Globe, ChevronDown, ChevronUp } from 'lucide-react';

interface CitationInspectorProps {
  citations: Citation[];
}

export function CitationInspector({ citations }: CitationInspectorProps) {
  const [expandedId, setExpandedId] = useState<string | null>(citations[0]?.sourceId || null);

  const icons: Record<string, React.ElementType> = {
    bank_line: Database,
    document: FileText,
    fx_observation: Globe,
    ledger_entry: FileText,
  };

  return (
    <div className="rounded-xl border border-black/[0.06] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-medium uppercase tracking-wider text-zinc-500 font-mono">
          Evidence Citations ({citations.length})
        </h4>
        <span className="text-[11px] font-mono text-zinc-400">
          Lineage verified
        </span>
      </div>

      <div className="space-y-2">
        {citations.map((cite) => {
          const Icon = icons[cite.sourceType] || FileText;
          const isExpanded = expandedId === cite.sourceId;

          return (
            <div
              key={cite.sourceId}
              className={`rounded-lg border transition-colors ${
                isExpanded
                  ? 'border-emerald-200 bg-emerald-50/30'
                  : 'border-black/[0.06] bg-zinc-50/50 hover:border-black/[0.1]'
              }`}
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : cite.sourceId)}
                className="w-full flex items-center justify-between p-3 text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white border border-black/[0.06] text-emerald-600">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-zinc-800">{cite.claim}</div>
                    <div className="text-[10px] font-mono text-zinc-400 flex items-center gap-1.5 mt-0.5">
                      <span>Source: <strong className="text-zinc-600">{cite.sourceId}</strong></span>
                      <span className="text-zinc-300">·</span>
                      <span className="capitalize">{cite.sourceType.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                <div className="text-zinc-400">
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </button>

              {isExpanded && cite.extractedSnippet && (
                <div className="px-3 pb-3 pt-1 border-t border-black/[0.04]">
                  <div className="rounded-md bg-zinc-950 border border-zinc-800 p-2.5 font-mono text-[11px] text-emerald-400 leading-relaxed overflow-x-auto">
                    <div className="text-[10px] uppercase font-medium text-zinc-500 mb-1">
                      Verified payload
                    </div>
                    {cite.extractedSnippet}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
