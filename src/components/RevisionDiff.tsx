import type { Proposal } from '@/lib/contracts/types';
import { cn, money } from '@/lib/ui';
import { Mono } from '@/components/primitives';

type Row = {
  account: string;
  before?: { debit: number; credit: number; currency: string };
  after?: { debit: number; credit: number; currency: string };
};

function buildRows(before: Proposal, after: Proposal): Row[] {
  const accounts = [
    ...new Set([...before.journal.map((l) => l.account), ...after.journal.map((l) => l.account)]),
  ].sort();

  return accounts.map((account) => {
    const b = before.journal.find((l) => l.account === account);
    const a = after.journal.find((l) => l.account === account);
    return {
      account,
      before: b ? { debit: b.debit, credit: b.credit, currency: b.currency } : undefined,
      after: a ? { debit: a.debit, credit: a.credit, currency: a.currency } : undefined,
    };
  });
}

function changed(row: Row) {
  if (!row.before || !row.after) return true;
  return row.before.debit !== row.after.debit || row.before.credit !== row.after.credit;
}

function amount(side?: { debit: number; credit: number; currency: string }) {
  if (!side) return '—';
  const value = side.debit || side.credit;
  const label = side.debit ? 'Dr' : 'Cr';
  return `${label} ${money(value, side.currency)}`;
}

/**
 * The accounting diff between two revisions. Revision 1 is immutable, so this
 * is a comparison of two stored artifacts, not an edit history.
 */
export function RevisionDiff({ before, after }: { before: Proposal; after: Proposal }) {
  const rows = buildRows(before, after);
  const fxChanged =
    JSON.stringify(before.fx ?? null) !== JSON.stringify(after.fx ?? null);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-zinc-500">
              <th className="pb-2 font-medium">Account</th>
              <th className="pb-2 font-medium">Revision {before.revision}</th>
              <th className="pb-2 font-medium">Revision {after.revision}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => (
              <tr key={row.account} className={cn(changed(row) && 'bg-zinc-800/30')}>
                <td className="py-2">
                  <Mono>{row.account}</Mono>
                </td>
                <td
                  className={cn(
                    'py-2 tabular-nums',
                    changed(row) && row.before ? 'text-rose-300' : 'text-zinc-400',
                  )}
                >
                  {amount(row.before)}
                </td>
                <td
                  className={cn(
                    'py-2 tabular-nums',
                    changed(row) && row.after ? 'text-emerald-300' : 'text-zinc-400',
                  )}
                >
                  {amount(row.after)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {fxChanged && (
        <div className="rounded-md border border-line p-3">
          <h4 className="text-[11px] uppercase tracking-wide text-zinc-500 mb-2">FX treatment</h4>
          <div className="grid gap-2 sm:grid-cols-2 text-[13px]">
            <div className="text-rose-300">
              <Mono>
                {before.fx
                  ? `${before.fx.rate} ${before.fx.rateType} @ ${before.fx.rateDate} — ${before.fx.sourceId}`
                  : 'none'}
              </Mono>
            </div>
            <div className="text-emerald-300">
              <Mono>
                {after.fx
                  ? `${after.fx.rate} ${after.fx.rateType} @ ${after.fx.rateDate} — ${after.fx.sourceId}`
                  : 'none'}
              </Mono>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-md border border-line p-3">
        <h4 className="text-[11px] uppercase tracking-wide text-zinc-500 mb-2">Disposition</h4>
        <div className="grid gap-2 sm:grid-cols-2 text-[13px]">
          <div className={cn(before.disposition !== after.disposition && 'text-rose-300')}>
            {before.disposition}
          </div>
          <div className={cn(before.disposition !== after.disposition && 'text-emerald-300')}>
            {after.disposition}
          </div>
        </div>
      </div>
    </div>
  );
}
