import { describe, expect, it } from 'vitest';

import type { JournalLine } from '@/lib/contracts/types';
import { createLedgerRecord, verifyLedgerChain } from '@/lib/ledger/sandbox';

const lines: JournalLine[] = [
  { account: '7110', entity: 'ACME-US', period: '2026-08', currency: 'USD', debit: 45, credit: 0 },
  { account: '1010', entity: 'ACME-US', period: '2026-08', currency: 'USD', debit: 0, credit: 45 },
];

describe('sandbox ledger', () => {
  it('creates a verifiable hash-linked chain', () => {
    const first = createLedgerRecord([], 'P1', lines, '2026-08-01T00:00:00Z');
    const second = createLedgerRecord([first], 'P2', lines, '2026-08-02T00:00:00Z');
    expect(second.prevHash).toBe(first.hash);
    expect(verifyLedgerChain([first, second])).toBe(true);
  });

  it('detects a modified journal', () => {
    const record = createLedgerRecord([], 'P1', lines, '2026-08-01T00:00:00Z');
    const changed = { ...record, lines: [{ ...record.lines[0], debit: 46 }, record.lines[1]] };
    expect(verifyLedgerChain([changed])).toBe(false);
  });
});
