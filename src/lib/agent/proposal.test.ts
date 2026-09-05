import { describe, expect, it } from 'vitest';

import { parseProposalArguments } from '@/lib/agent/proposal';

const valid = {
  disposition: 'bank_fee_journal',
  narrative: 'The August service charge of USD 45.00 matches the published fee schedule.',
  citations: [{ claim: 'Bank charged 45.00', sourceType: 'bank_line', sourceId: 'BL-007' }],
  journal: [
    { account: '7110', entity: 'ACME-US', period: '2026-08', currency: 'USD', debit: 45, credit: 0 },
    { account: '1010', entity: 'ACME-US', period: '2026-08', currency: 'USD', debit: 0, credit: 45 },
  ],
};

describe('submit_proposal validation', () => {
  it('accepts a well-formed submission', () => {
    const result = parseProposalArguments(JSON.stringify(valid));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.draft.journal).toHaveLength(2);
      expect(result.draft.disposition).toBe('bank_fee_journal');
    }
  });

  it('rejects an unknown disposition', () => {
    const result = parseProposalArguments(JSON.stringify({ ...valid, disposition: 'write_off' }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join(' ')).toContain('disposition must be one of');
  });

  it('rejects a line that carries both a debit and a credit', () => {
    const result = parseProposalArguments(
      JSON.stringify({
        ...valid,
        journal: [{ account: '7110', entity: 'ACME-US', period: '2026-08', currency: 'USD', debit: 45, credit: 45 }],
      }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join(' ')).toContain('each line takes one side');
  });

  it('rejects malformed JSON without throwing', () => {
    const result = parseProposalArguments('{not json');
    expect(result.ok).toBe(false);
  });

  it('rounds amounts to two decimals', () => {
    const result = parseProposalArguments(
      JSON.stringify({
        ...valid,
        journal: [
          { account: '7110', entity: 'ACME-US', period: '2026-08', currency: 'USD', debit: 45.005, credit: 0 },
          { account: '1010', entity: 'ACME-US', period: '2026-08', currency: 'USD', debit: 0, credit: 45.01 },
        ],
      }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.draft.journal[0].debit).toBe(45.01);
  });

  it('requires fx to be complete when present', () => {
    const result = parseProposalArguments(
      JSON.stringify({ ...valid, fx: { rate: 1.08, rateDate: '2026-08-11' } }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join(' ')).toContain('fx must carry');
  });
});
