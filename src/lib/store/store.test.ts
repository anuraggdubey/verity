import { beforeEach, describe, expect, it } from 'vitest';

import {
  getProposal,
  listLedgerRecords,
  postApprovedProposal,
  reconciliationStatus,
  recordControllerDecision,
  resetDemo,
  verifyLedgerRecords,
} from '@/lib/store';

describe('finance store and close', () => {
  beforeEach(() => resetDemo());

  it('does not post before controller approval', () => {
    expect(postApprovedProposal('PROP-002-r1')).toEqual({ ok: false, error: 'A controller must approve this proposal before posting' });
  });

  it('does not approve a blocked revision', () => {
    const result = recordControllerDecision({ proposalId: 'PROP-001-r1', decision: 'approve' });
    expect(result.ok).toBe(false);
  });

  it('requires a reason code on rejection', () => {
    const result = recordControllerDecision({ proposalId: 'PROP-002-r1', decision: 'reject' });
    expect(result.ok).toBe(false);
  });

  it('posts once and returns the existing record on retries', () => {
    expect(recordControllerDecision({ proposalId: 'PROP-002-r1', decision: 'approve' }).ok).toBe(true);
    const count = listLedgerRecords().length;
    const retry = postApprovedProposal('PROP-002-r1');
    expect(retry.ok && retry.existing).toBe(true);
    expect(listLedgerRecords()).toHaveLength(count);
    expect(verifyLedgerRecords()).toBe(true);
  });

  it('closes only after all active exceptions are dispositioned and cash ties', () => {
    expect(reconciliationStatus().closed).toBe(false);
    for (const proposalId of ['PROP-001-r2', 'PROP-002-r1', 'PROP-003-r1']) {
      expect(getProposal(proposalId)).toBeTruthy();
      expect(recordControllerDecision({ proposalId, decision: 'approve' }).ok).toBe(true);
    }
    expect(reconciliationStatus()).toMatchObject({ bankLineCount: 29, autoClearedCount: 17, exceptionCount: 12, unresolvedCount: 0, closed: true });
  });
});
