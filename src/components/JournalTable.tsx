import type { JournalLine } from '@/lib/contracts/types';
import { money } from '@/lib/ui';
import { Mono } from '@/components/primitives';

export function JournalTable({ lines }: { lines: JournalLine[] }) {
  if (lines.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        Non-posting disposition — no journal lines proposed.
      </p>
    );
  }

  const debits = lines.reduce((s, l) => s + l.debit, 0);
  const credits = lines.reduce((s, l) => s + l.credit, 0);
  const balanced = Math.abs(debits - credits) < 0.005;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wide text-zinc-500">
            <th className="pb-2 font-medium">Account</th>
            <th className="pb-2 font-medium">Entity</th>
            <th className="pb-2 font-medium">Period</th>
            <th className="pb-2 font-medium text-right">Debit</th>
            <th className="pb-2 font-medium text-right">Credit</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {lines.map((line, i) => (
            <tr key={`${line.account}-${i}`}>
              <td className="py-2">
                <Mono>{line.account}</Mono>
                {line.memo && <div className="text-[11px] text-zinc-500">{line.memo}</div>}
              </td>
              <td className="py-2 text-zinc-400">{line.entity}</td>
              <td className="py-2 text-zinc-400">{line.period}</td>
              <td className="py-2 text-right tabular-nums">
                {line.debit ? money(line.debit, line.currency) : '—'}
              </td>
              <td className="py-2 text-right tabular-nums">
                {line.credit ? money(line.credit, line.currency) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-line">
            <td colSpan={3} className="pt-2 text-[11px] uppercase tracking-wide text-zinc-500">
              {balanced ? 'Balanced' : 'Out of balance'}
            </td>
            <td className="pt-2 text-right tabular-nums font-medium">{money(debits)}</td>
            <td className="pt-2 text-right tabular-nums font-medium">{money(credits)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
