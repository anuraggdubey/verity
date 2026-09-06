import type { BankLine, LedgerEntry } from '@/lib/contracts/types';
import { daysBetween, normalizeText, parseMoneyMinor } from '@/lib/matcher/normalize';

export type MatchResult = {
  matches: { bankLineId: string; ledgerEntryId: string; reason: string }[];
  exceptions: { bankLineId: string; candidateLedgerIds: string[]; reasonCode: string }[];
  counts: { bankLines: number; autoMatched: number; exceptions: number };
};

export function matchReconciliation(
  bankLines: BankLine[],
  ledgerEntries: LedgerEntry[],
  options: { cashAccount?: string; amountToleranceMinorUnits?: number; dateToleranceDays?: number } = {},
): MatchResult {
  const cashAccount = options.cashAccount ?? '1010';
  const amountTolerance = options.amountToleranceMinorUnits ?? 1;
  const dateTolerance = options.dateToleranceDays ?? 5;
  const used = new Set<string>();
  const matches: MatchResult['matches'] = [];
  const exceptions: MatchResult['exceptions'] = [];

  for (const bank of bankLines) {
    const reference = normalizeText(bank.reference);
    const broad = ledgerEntries.filter((entry) =>
      entry.posted && entry.account === cashAccount && entry.currency === bank.currency &&
      Math.abs(parseMoneyMinor(entry.amount) - parseMoneyMinor(bank.amount)) <= amountTolerance &&
      (reference === '' || normalizeText(entry.reference) === reference),
    );
    const eligible = broad.filter((entry) => !used.has(entry.id) && reference !== '' && daysBetween(entry.entryDate, bank.postedDate) <= dateTolerance);
    if (eligible.length === 1) {
      used.add(eligible[0].id);
      matches.push({ bankLineId: bank.id, ledgerEntryId: eligible[0].id, reason: 'Unique currency, signed amount, reference, and date match' });
      continue;
    }
    const reasonCode = reference === '' ? 'MISSING_REFERENCE' : eligible.length > 1 ? 'AMBIGUOUS_MATCH' : broad.length > 0 ? 'DATE_ANOMALY' : 'NO_EXACT_MATCH';
    exceptions.push({ bankLineId: bank.id, candidateLedgerIds: broad.map((entry) => entry.id), reasonCode });
  }

  return { matches, exceptions, counts: { bankLines: bankLines.length, autoMatched: matches.length, exceptions: exceptions.length } };
}
