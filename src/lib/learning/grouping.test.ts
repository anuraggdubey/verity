import { describe, expect, it } from 'vitest';

import { draftControlPR } from '@/lib/learning/control-pr';
import { groupReviewerRejections } from '@/lib/learning/grouping';

describe('reviewer-grounded failure grouping', () => {
  it('groups the seeded rejections by the controller reason code', () => {
    const groups = groupReviewerRejections();
    expect(groups).toHaveLength(1);
    expect(groups[0].reasonCode).toBe('WRONG_RATE_DATE');
    expect(groups[0].proposalIds).toEqual(['PROP-006-r1', 'PROP-009-r1']);
  });

  it('reads shared traits off the proposals rather than asserting them', () => {
    const [group] = groupReviewerRejections();
    expect(group.sharedTraits).toContain(
      'in every proposal the FX rate date differed from the invoice transaction date',
    );
  });

  it('requires at least two supporting failures', () => {
    expect(groupReviewerRejections(3)).toHaveLength(0);
  });

  it('drafts a rule the engine can enforce, with counterexamples', () => {
    const [group] = groupReviewerRejections();
    const draft = draftControlPR(group);
    expect(draft.ok).toBe(true);
    if (!draft.ok) return;
    expect(draft.controlPR.rule.selector).toBe('fx.rateDate');
    expect(draft.controlPR.rule.compareTo).toBe('document.transactionDate');
    expect(draft.controlPR.positiveFixtures).toEqual(['PROP-006-r1', 'PROP-009-r1']);
    expect(draft.controlPR.negativeFixtures.length).toBeGreaterThan(0);
    expect(draft.controlPR.status).toBe('draft');
  });

  it('refuses to draft a rule for a failure the schema cannot express', () => {
    const draft = draftControlPR({
      id: 'GRP-TEST',
      reasonCode: 'OTHER',
      proposalIds: ['PROP-006-r1', 'PROP-009-r1'],
      caseIds: ['CASE-006', 'CASE-009'],
      rationales: [],
      coherence: 0,
      sharedTraits: [],
    });
    expect(draft.ok).toBe(false);
    if (!draft.ok) expect(draft.reason).toContain('No constrained rule schema');
  });
});

describe('rule templates', () => {
  const group = (reasonCode: Parameters<typeof draftControlPR>[0]['reasonCode']) => ({
    id: `GRP-${reasonCode}`,
    reasonCode,
    proposalIds: ['PROP-006-r1', 'PROP-009-r1'],
    caseIds: ['CASE-006', 'CASE-009'],
    rationales: [],
    coherence: 0,
    sharedTraits: [],
  });

  it('drafts an allowlist rule for an unapproved FX source', () => {
    const draft = draftControlPR(group('UNSUPPORTED_FX_SOURCE'));
    expect(draft.ok).toBe(true);
    if (!draft.ok) return;
    expect(draft.controlPR.rule.comparator).toBe('in_allowlist');
    expect(draft.controlPR.rule.allowlistRef).toBe('approved_fx_sources');
  });

  it('drafts an open-period rule for a closed-period rejection', () => {
    const draft = draftControlPR(group('CLOSED_PERIOD'));
    expect(draft.ok).toBe(true);
    if (!draft.ok) return;
    expect(draft.controlPR.rule.selector).toBe('journal.periods');
    expect(draft.controlPR.rule.allowlistRef).toBe('open_periods');
  });

  it('still refuses a reason code with no enforceable schema', () => {
    // OTHER is the only one left: by definition it names no specific failure.
    expect(draftControlPR(group('OTHER')).ok).toBe(false);
  });
});

describe('remaining reason codes', () => {
  const group = (reasonCode: Parameters<typeof draftControlPR>[0]['reasonCode']) => ({
    id: `GRP-${reasonCode}`,
    reasonCode,
    proposalIds: ['PROP-006-r1', 'PROP-009-r1'],
    caseIds: ['CASE-006', 'CASE-009'],
    rationales: [],
    coherence: 0,
    sharedTraits: [],
  });

  it('now drafts a rule for every enumerated reason code except OTHER', () => {
    const codes = [
      'WRONG_RATE_DATE',
      'UNSUPPORTED_FX_SOURCE',
      'CLOSED_PERIOD',
      'WRONG_ACCOUNT',
      'WRONG_ENTITY',
      'MISSING_EVIDENCE',
      'DUPLICATE_POSTING',
      'INSUFFICIENT_NARRATIVE',
    ] as const;
    for (const code of codes) {
      expect(draftControlPR(group(code)).ok, `${code} should draft`).toBe(true);
    }
  });

  it('still refuses OTHER, which by definition has no schema', () => {
    const draft = draftControlPR(group('OTHER'));
    expect(draft.ok).toBe(false);
    if (!draft.ok) expect(draft.reason).toContain('No constrained rule schema');
  });
});
