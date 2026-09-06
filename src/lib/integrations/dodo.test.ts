import { describe, expect, it } from 'vitest';

import type { DodoPayout } from '@/lib/integrations/dodo';
import { payoutsAsBankLines, unsettledPayouts } from '@/lib/integrations/dodo';

const payout = (over: Partial<DodoPayout> = {}): DodoPayout => ({
  payout_id: 'pyt_123',
  business_id: 'biz_1',
  amount: 482350,
  currency: 'usd',
  status: 'success',
  payment_method: 'ach',
  created_at: '2026-08-19T04:11:07Z',
  ...over,
});

describe('Dodo payout ingestion', () => {
  it('maps a settled payout to a normalized bank line', () => {
    const [line] = payoutsAsBankLines([payout()]);
    expect(line.id).toBe('DODO-pyt_123');
    expect(line.amount).toBe(4823.5);
    expect(line.currency).toBe('USD');
    expect(line.postedDate).toBe('2026-08-19');
    expect(line.reference).toBe('pyt_123');
    expect(line.counterparty).toBe('Dodo Payments');
  });

  it('treats a payout as money in, matching the statement sign convention', () => {
    expect(payoutsAsBankLines([payout()])[0].amount).toBeGreaterThan(0);
  });

  it('ignores payouts that have not settled', () => {
    const lines = payoutsAsBankLines([
      payout({ payout_id: 'a', status: 'in_progress' }),
      payout({ payout_id: 'b', status: 'failed' }),
      payout({ payout_id: 'c', status: 'not_initiated' }),
      payout({ payout_id: 'd', status: 'on_hold' }),
    ]);
    expect(lines).toHaveLength(0);
  });

  it('reports what it skipped and why, rather than dropping it silently', () => {
    const skipped = unsettledPayouts([payout({ payout_id: 'x', status: 'on_hold' }), payout()]);
    expect(skipped).toHaveLength(1);
    expect(skipped[0].payoutId).toBe('x');
    expect(skipped[0].reason).toContain('Not settled');
  });
});
