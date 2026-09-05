'use client';

import React, { useState } from 'react';
import { Citation } from '../../lib/contracts/types';
import { FileText, Database, Globe, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

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
    <div className="rounded-xl border border-white/[0.08] bg-[#0c0d12] p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
          Auditable Evidence Citations ({citations.length})
        </h4>
        <span className="text-[11px] font-mono text-zinc-500">
          Source Lineage Verified
        </span>
      </div>

      <div className="space-y-2">
        {citations.map((cite) => {
          const Icon = icons[cite.sourceType] || FileText;
          const isExpanded = expandedId === cite.sourceId;

          return (
            <div
              key={cite.sourceId}
              className={`rounded-lg border transition-all ${
                isExpanded
                  ? 'border-emerald-500/30 bg-emerald-950/10'
                  : 'border-white/[0.06] bg-black/20 hover:border-white/[0.1]'
              }`}
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : cite.sourceId)}
                className="w-full flex items-center justify-between p-3 text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-white/[0.06] text-emerald-400">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-zinc-200">{cite.claim}</div>
                    <div className="text-[10px] font-mono text-zinc-400 flex items-center gap-1.5 mt-0.5">
                      <span>Source: <strong className="text-zinc-300">{cite.sourceId}</strong></span>
                      <span className="text-zinc-600">•</span>
                      <span className="capitalize">{cite.sourceType.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                <div className="text-zinc-500 hover:text-zinc-300">
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </button>

              {/* Expanded details */}
              {isExpanded && cite.extractedSnippet && (
                <div className="px-3 pb-3 pt-1 border-t border-white/[0.04]">
                  <div className="rounded bg-black/50 border border-white/[0.06] p-2.5 font-mono text-[11px] text-emerald-300/90 leading-relaxed overflow-x-auto">
                    <div className="text-[10px] uppercase font-semibold text-zinc-500 mb-1">
                      Raw Verified Payload Snippet:
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
