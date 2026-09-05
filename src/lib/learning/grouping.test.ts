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
      reasonCode: 'INSUFFICIENT_NARRATIVE',
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
