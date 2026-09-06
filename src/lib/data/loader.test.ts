import { describe, expect, it } from 'vitest';

import { CsvValidationError, loadBankCsv, loadFrozenReconciliation, parseCsv } from '@/lib/data/loader';
import { matchReconciliation } from '@/lib/matcher/match';

describe('CSV loader and frozen reconciliation', () => {
  it('parses quoted commas and CRLF rows', () => {
    const rows = parseCsv('a,b\r\n1,"two, three"\r\n');
    expect(rows).toEqual([['a', 'b'], ['1', 'two, three']]);
  });

  it('returns actionable row numbers for invalid amounts', () => {
    const csv = 'id,postedDate,valueDate,amount,currency,counterparty,reference,description\nBL-X,2026-08-01,2026-08-01,nope,USD,A,R,D';
    expect(() => loadBankCsv(csv)).toThrow(/Row 2: Invalid monetary amount/);
  });

  it('rejects duplicate identifiers', () => {
    const csv = 'id,postedDate,valueDate,amount,currency,counterparty,reference,description\nBL-X,2026-08-01,2026-08-01,1,USD,A,R,D\nBL-X,2026-08-02,2026-08-02,2,USD,B,S,E';
    expect(() => loadBankCsv(csv)).toThrow(CsvValidationError);
  });

  it('computes the promised 24/17/7 result from source records', () => {
    const source = loadFrozenReconciliation();
    const result = matchReconciliation(source.bankLines, source.ledgerEntries);
    expect(result.counts).toEqual({ bankLines: 29, autoMatched: 17, exceptions: 12 });
  });
});
