import { Check, ShieldAlert, TriangleAlert } from 'lucide-react';

import type { ControlReport, ControlFamily, ControlResult } from '@/lib/contracts/types';
import { cn, familyLabel } from '@/lib/ui';
import { Mono } from '@/components/primitives';

const FAMILY_ORDER: ControlFamily[] = [
  'evidence_lineage',
  'accounting_integrity',
  'policy_provenance',
];

function Icon({ status }: { status: ControlResult['status'] }) {
  if (status === 'blocked') return <ShieldAlert className="size-4 text-rose-400 shrink-0" />;
  if (status === 'warn') return <TriangleAlert className="size-4 text-amber-400 shrink-0" />;
  return <Check className="size-4 text-emerald-400 shrink-0" />;
}

/**
 * The control checklist. A blocked result shows the exact claim, failure, and
 * required repair — the same text the agent receives. Never summarize it here;
 * the point of the screen is that the human and the agent read the same thing.
 */
export function ControlChecklist({ report }: { report?: ControlReport }) {
  if (!report) {
    return <p className="text-sm text-zinc-500">Controls have not been evaluated yet.</p>;
  }

  return (
    <div className="space-y-5">
      {FAMILY_ORDER.map((family) => {
        const results = report.results.filter((r) => r.family === family);
        if (results.length === 0) return null;
        const failed = results.filter((r) => r.status !== 'pass').length;
        return (
          <div key={family}>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                {familyLabel[family]}
              </h3>
              <span className="text-[11px] text-zinc-500">
                {results.length - failed}/{results.length} passed
              </span>
            </div>
            <ul className="space-y-1.5">
              {results.map((result) => (
                <li
                  key={result.code}
                  className={cn(
                    'rounded-md border px-3 py-2',
                    result.status === 'blocked'
                      ? 'border-rose-500/40 bg-rose-500/5'
                      : result.status === 'warn'
                        ? 'border-amber-500/30 bg-amber-500/5'
                        : 'border-line',
                  )}
                >
                  <div className="flex items-start gap-2">
                    <Icon status={result.status} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <Mono className="text-zinc-400">{result.code}</Mono>
                        <span className="text-sm">{result.title}</span>
                        {result.status !== 'pass' && (
                          <span
                            className={cn(
                              'text-[11px] font-semibold uppercase',
                              result.status === 'blocked' ? 'text-rose-400' : 'text-amber-400',
                            )}
                          >
                            {result.status}
                          </span>
                        )}
                      </div>
                      {result.status !== 'pass' && (
                        <dl className="mt-2 space-y-1.5 text-[13px]">
                          {result.claim && (
                            <div>
                              <dt className="text-[11px] uppercase tracking-wide text-zinc-500">
                                Claim
                              </dt>
                              <dd className="text-zinc-300">{result.claim}</dd>
                            </div>
                          )}
                          {result.failure && (
                            <div>
                              <dt className="text-[11px] uppercase tracking-wide text-zinc-500">
                                Failure
                              </dt>
                              <dd className="text-zinc-300">{result.failure}</dd>
                            </div>
                          )}
                          {result.requiredRepair && (
                            <div>
                              <dt className="text-[11px] uppercase tracking-wide text-zinc-500">
                                Required repair
                              </dt>
                              <dd className="text-zinc-300">{result.requiredRepair}</dd>
                            </div>
                          )}
                        </dl>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
