import { describe, expect, it } from 'vitest';

import type { BankLine, LedgerEntry } from '@/lib/contracts/types';
import { matchReconciliation } from '@/lib/matcher/match';

const bank = (overrides: Partial<BankLine> = {}): BankLine => ({ id: 'B1', postedDate: '2026-08-01', valueDate: '2026-08-01', amount: -10, currency: 'USD', counterparty: 'Acme, Inc.', reference: 'INV-1', description: '', ...overrides });
const ledger = (overrides: Partial<LedgerEntry> = {}): LedgerEntry => ({ id: 'L1', entryDate: '2026-08-01', account: '1010', entity: 'ACME-US', period: '2026-08', amount: -10, currency: 'USD', counterparty: 'ACME INC', reference: 'inv 1', description: '', posted: true, ...overrides });

describe('deterministic matcher', () => {
  it('normalizes references and produces a unique exact match', () => {
    expect(matchReconciliation([bank()], [ledger()]).matches).toHaveLength(1);
  });

  it('does not match across currencies', () => {
    expect(matchReconciliation([bank()], [ledger({ currency: 'EUR' })]).exceptions[0].reasonCode).toBe('NO_EXACT_MATCH');
  });

  it('does not auto-match ambiguous candidates', () => {
    const result = matchReconciliation([bank()], [ledger(), ledger({ id: 'L2' })]);
    expect(result.matches).toHaveLength(0);
    expect(result.exceptions[0].reasonCode).toBe('AMBIGUOUS_MATCH');
  });

  it('does not auto-match a distant timing item', () => {
    const result = matchReconciliation([bank()], [ledger({ entryDate: '2026-07-01' })]);
    expect(result.exceptions[0].reasonCode).toBe('DATE_ANOMALY');
  });
});
