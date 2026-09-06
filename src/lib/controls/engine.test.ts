import { describe, expect, it, beforeEach } from 'vitest';

import type { ConstrainedRule, Proposal } from '@/lib/contracts/types';
import { applyConstrainedRule, evaluateProposal } from '@/lib/controls/engine';
import { getProposal, resetDemo } from '@/lib/store';

/** The blocked FX proposal from the fixture, rebuilt here so the test is self-contained. */
const unapprovedFx: Proposal = {
  id: 'PROP-TEST-r1',
  caseId: 'CASE-001',
  revision: 1,
  disposition: 'fx_revaluation',
  narrative: 'EUR 8,000 converts to USD 8,712.00 at 1.0890, which ties to the bank exactly.',
  citations: [
    { claim: 'Bank settled USD 8,712.00', sourceType: 'bank_line', sourceId: 'BL-014' },
    { claim: 'Invoice is EUR 8,000', sourceType: 'document', sourceId: 'DOC-LG-2291' },
    { claim: 'EUR/USD 1.0890', sourceType: 'fx_observation', sourceId: 'FXO-0814-STF' },
  ],
  journal: [
    { account: '2100', entity: 'ACME-US', period: '2026-08', currency: 'USD', debit: 8712, credit: 0 },
    { account: '1010', entity: 'ACME-US', period: '2026-08', currency: 'USD', debit: 0, credit: 8712 },
  ],
  fx: { rate: 1.089, rateDate: '2026-08-14', rateType: 'spot', sourceId: 'STREETFX-FEED' },
  policyVersion: 'policy-2026.08',
  controlPackVersion: 'v1',
  createdAt: '2026-08-31T09:00:00Z',
  traceId: 'trace-test',
};

const blockedCodes = (proposal: Proposal) =>
  evaluateProposal(proposal, { rules: [], packVersion: 'v1' })
    .results.filter((result) => result.status === 'blocked')
    .map((result) => result.code);

describe('control engine', () => {
  beforeEach(() => resetDemo());

  it('blocks a rate from a source outside the approved allowlist', () => {
    const report = evaluateProposal(unapprovedFx, { rules: [], packVersion: 'v1' });
    expect(report.blocked).toBe(true);
    const fx = report.results.find((result) => result.code === 'VERITY-FX-003');
    expect(fx?.status).toBe('blocked');
    expect(fx?.failure).toContain('STREETFX-FEED');
    expect(fx?.requiredRepair).toBeTruthy();
  });

  it('blocks an entry that does not balance', () => {
    const unbalanced: Proposal = {
      ...unapprovedFx,
      journal: [
        { account: '2100', entity: 'ACME-US', period: '2026-08', currency: 'USD', debit: 8712, credit: 0 },
        { account: '1010', entity: 'ACME-US', period: '2026-08', currency: 'USD', debit: 0, credit: 8000 },
      ],
    };
    expect(blockedCodes(unbalanced)).toContain('VERITY-AI-001');
  });

  it('blocks an account outside the permitted chart', () => {
    const badAccount: Proposal = {
      ...unapprovedFx,
      journal: [
        { account: '9999', entity: 'ACME-US', period: '2026-08', currency: 'USD', debit: 8712, credit: 0 },
        { account: '1010', entity: 'ACME-US', period: '2026-08', currency: 'USD', debit: 0, credit: 8712 },
      ],
    };
    expect(blockedCodes(badAccount)).toContain('VERITY-AI-002');
  });

  it('blocks a proposal into a closed period', () => {
    const closed: Proposal = {
      ...unapprovedFx,
      journal: unapprovedFx.journal.map((line) => ({ ...line, period: '2026-07' })),
    };
    expect(blockedCodes(closed)).toContain('VERITY-AI-003');
  });

  it('blocks a citation that does not resolve', () => {
    const ghost: Proposal = {
      ...unapprovedFx,
      citations: [{ claim: 'Invented record', sourceType: 'ledger_entry', sourceId: 'GL-DOES-NOT-EXIST' }],
    };
    expect(blockedCodes(ghost)).toContain('VERITY-EV-002');
  });

  it('warns rather than silently passing when it cannot evaluate a rule', () => {
    const unsupported: ConstrainedRule = {
      family: 'policy_provenance',
      selector: 'journal.someField',
      comparator: 'equals',
      onFail: { code: 'VERITY-XX-001', title: 'unsupported', requiredRepair: 'n/a' },
    };
    const result = applyConstrainedRule(unsupported, unapprovedFx);
    expect(result?.status).toBe('warn');
    expect(result?.failure).toContain('cannot evaluate selector');
  });

  it('enforces a merged rate-date rule within its tolerance', () => {
    const rule: ConstrainedRule = {
      family: 'policy_provenance',
      selector: 'fx.rateDate',
      comparator: 'equals',
      compareTo: 'document.transactionDate',
      tolerance: { unit: 'days', value: 0 },
      onFail: { code: 'VERITY-FX-005', title: 'rate date', requiredRepair: 'use the transaction date' },
    };
    // DOC-LG-2291 carries transactionDate 2026-08-11; this proposal used 2026-08-14.
    expect(applyConstrainedRule(rule, unapprovedFx)?.status).toBe('blocked');

    const onTransactionDate: Proposal = {
      ...unapprovedFx,
      fx: { rate: 1.0785, rateDate: '2026-08-11', rateType: 'spot', sourceId: 'APEX-REF-RATES' },
    };
    expect(applyConstrainedRule(rule, onTransactionDate)?.status).toBe('pass');
  });

  it('does not apply an FX rule to a proposal with no FX', () => {
    const rule: ConstrainedRule = {
      family: 'policy_provenance',
      selector: 'fx.rateDate',
      comparator: 'equals',
      compareTo: 'document.transactionDate',
      onFail: { code: 'VERITY-FX-005', title: 'rate date', requiredRepair: 'n/a' },
    };
    const noFx: Proposal = { ...unapprovedFx, fx: undefined };
    expect(applyConstrainedRule(rule, noFx)).toBeUndefined();
  });

  it('blocks a journal whose cash impact does not tie to its bank line', () => {
    const proposal: Proposal = {
      ...unapprovedFx,
      journal: [
        { ...unapprovedFx.journal[0], debit: 8700 },
        { ...unapprovedFx.journal[1], credit: 8700 },
      ],
    };
    expect(blockedCodes(proposal)).toContain('VERITY-AI-006');
  });

  it('blocks journal lines on a non-posting disposition', () => {
    expect(blockedCodes({ ...unapprovedFx, disposition: 'duplicate' })).toContain('VERITY-AI-004');
  });

  it('blocks stale policy versions', () => {
    expect(blockedCodes({ ...unapprovedFx, policyVersion: 'policy-old' })).toContain('VERITY-PP-001');
  });

  it('allows the repaired FX proposal and the approved timing rule', () => {
    const repaired = getProposal('PROP-001-r2');
    const timing = getProposal('PROP-005-r1');
    expect(repaired && evaluateProposal(repaired, { rules: [], packVersion: 'v1' }).blocked).toBe(false);
    expect(timing && evaluateProposal(timing, { rules: [], packVersion: 'v1' }).blocked).toBe(false);
  });
});
