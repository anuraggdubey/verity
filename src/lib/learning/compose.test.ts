import { beforeEach, describe, expect, it } from 'vitest';

import type { ConstrainedRule } from '@/lib/contracts/types';
import { composeRule, parseComposedRule, restate, simulateRule } from '@/lib/learning/compose';
import { RULE_EXAMPLES } from '@/lib/learning/rule-examples';
import { resetDemo } from '@/lib/store';

const rateDateRule: ConstrainedRule = {
  family: 'policy_provenance',
  selector: 'fx.rateDate',
  comparator: 'equals',
  compareTo: 'document.transactionDate',
  tolerance: { unit: 'days', value: 0 },
  onFail: { code: 'VERITY-FX-005', title: 'rate date', requiredRepair: 'use the transaction-date rate' },
};

describe('plain-English rule composer', () => {
  beforeEach(() => resetDemo());

  it('drafts a rule offline when no model is configured', async () => {
    const result = await composeRule('FX rates must be dated the invoice transaction date');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.composed.rule.selector).toBe('fx.rateDate');
    expect(result.composed.source).toBe('offline');
  });

  it('refuses a request it cannot express, and says what it can check', async () => {
    const result = await composeRule('Block anything that feels suspicious to the CFO');
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.suggestions?.length).toBeGreaterThan(0);
  });

  it('refuses an empty request rather than inventing a rule', async () => {
    expect((await composeRule('  ')).ok).toBe(false);
  });

  it('reads a rule back in plain English', () => {
    expect(restate(rateDateRule)).toContain('matches document.transactionDate');
  });

  it('simulates against real stored proposals before anything is merged', () => {
    const simulation = simulateRule(rateDateRule);
    expect(simulation.totalEvaluated).toBeGreaterThan(0);
    expect(simulation.wouldBlock.map((entry) => entry.proposalId)).toContain('PROP-006-r1');
    expect(simulation.summary).toContain('would block');
  });

  it('flags blocked proposals a controller had already approved', () => {
    // The false positive that actually matters: a rule that would have stopped
    // work a human signed off on.
    const blockEverything: ConstrainedRule = {
      family: 'evidence_lineage',
      selector: 'citations.count',
      comparator: 'gte',
      compareTo: '99',
      onFail: { code: 'VERITY-EV-099', title: 'impossible', requiredRepair: 'cite 99 records' },
    };
    const simulation = simulateRule(blockEverything);
    expect(simulation.wouldBlockApproved.length).toBeGreaterThan(0);
    expect(simulation.summary).toContain('previously approved');
  });

  it('normalizes shorthand family and selector names from model output', () => {
    const result = parseComposedRule({
      family: 'accounting',
      selector: 'journal.period',
      comparator: 'in_allowlist',
      allowlistRef: 'open_periods',
      onFail: {
        code: 'VERITY-AI-006',
        title: 'Every journal line posts into an open period',
        requiredRepair:
          'Move the entry into an open accounting period, or route the item to the controller as a prior-period adjustment.',
      },
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.composed.rule.family).toBe('accounting_integrity');
    expect(result.composed.rule.selector).toBe('journal.periods');
  });
});

describe('offline coverage of the suggested examples', () => {
  // The deployed demo has no model key, so it composes from the offline
  // library. Every chip the UI offers must actually work there — offering a
  // suggestion that then fails is worse than offering none.
  it('composes every example the UI suggests', async () => {
    for (const example of RULE_EXAMPLES) {
      const result = await composeRule(example);
      expect(result.ok, `${example} should compose offline`).toBe(true);
    }
  });
});
