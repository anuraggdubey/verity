import { FileText, Landmark, LineChart, Table2 } from 'lucide-react';

import type { Citation, SourceType } from '@/lib/contracts/types';
import { resolveCitation } from '@/lib/demo/store';
import { Mono } from '@/components/primitives';

const icons: Record<SourceType, typeof FileText> = {
  bank_line: Landmark,
  ledger_entry: Table2,
  document: FileText,
  fx_observation: LineChart,
};

const labels: Record<SourceType, string> = {
  bank_line: 'Bank line',
  ledger_entry: 'Ledger entry',
  document: 'Document',
  fx_observation: 'FX observation',
};

/**
 * Evidence inspector. Each citation resolves to the underlying record so a
 * controller can check the claim against the source without leaving the PR.
 * An uncited narrative is not evidence and gets no row here.
 */
export function EvidenceList({ citations }: { citations: Citation[] }) {
  if (citations.length === 0) {
    return <p className="text-sm text-zinc-500">No citations. Narrative alone is not evidence.</p>;
  }

  return (
    <ul className="space-y-2">
      {citations.map((citation, i) => {
        const source = resolveCitation(citation);
        const Icon = icons[citation.sourceType];
        return (
          <li key={`${citation.sourceId}-${i}`} className="rounded-md border border-line p-3">
            <div className="flex items-start gap-2">
              <Icon className="size-4 text-zinc-500 mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-zinc-200">{citation.claim}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-zinc-500">
                  <span>{labels[citation.sourceType]}</span>
                  <Mono className="text-zinc-400">{citation.sourceId}</Mono>
                  {citation.field && <span>field: {citation.field}</span>}
                  {!source && (
                    <span className="text-rose-400">source does not resolve</span>
                  )}
                </div>
                {source && (
                  <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
                    {Object.entries(source)
                      .filter(([key]) => key !== 'fields' && key !== 'id')
                      .map(([key, value]) => (
                        <div key={key} className="min-w-0">
                          <dt className="text-[10px] uppercase tracking-wide text-zinc-600">
                            {key}
                          </dt>
                          <dd className="truncate text-[12px] text-zinc-300">{String(value)}</dd>
                        </div>
                      ))}
                  </dl>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
