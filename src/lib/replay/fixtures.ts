import { readFileSync } from 'node:fs';
import path from 'node:path';

import type { ConstrainedRule } from '@/lib/contracts/types';
import { evaluateProposal } from '@/lib/controls/engine';
import { listControlPRs, listProposals } from '@/lib/store';

export type ControlExpectation = {
  proposalId: string;
  v1Blocked: boolean;
  v2Blocked: boolean;
  because: string;
};

export const CONTROL_ENGINE_EXPECTATIONS: ControlExpectation[] = [
  { proposalId: 'PROP-001-r1', v1Blocked: true, v2Blocked: true, because: 'unapproved FX source (VERITY-FX-003)' },
  { proposalId: 'PROP-001-r2', v1Blocked: false, v2Blocked: false, because: 'repaired: approved transaction-date spot rate' },
  { proposalId: 'PROP-002-r1', v1Blocked: false, v2Blocked: false, because: 'bank fee journal, fully evidenced' },
  { proposalId: 'PROP-003-r1', v1Blocked: false, v2Blocked: false, because: 'non-posting duplicate flag, advisory only' },
  { proposalId: 'PROP-004-r1', v1Blocked: false, v2Blocked: false, because: 'correct abstention, no journal' },
  { proposalId: 'PROP-005-r1', v1Blocked: false, v2Blocked: false, because: 'approved timing difference, non-posting' },
  { proposalId: 'PROP-006-r1', v1Blocked: false, v2Blocked: true, because: 'settlement-date rate: escapes v1, caught by v2' },
  { proposalId: 'PROP-008-r1', v1Blocked: false, v2Blocked: false, because: 'counterexample: correct rate date, must stay allowed' },
  { proposalId: 'PROP-009-r1', v1Blocked: false, v2Blocked: true, because: 'month-end closing rate: escapes v1, caught by v2' },
  { proposalId: 'PROP-010-r1', v1Blocked: true, v2Blocked: true, because: 'wrong legal entity on journal lines (VERITY-AI-003)' },
  { proposalId: 'PROP-011-r1', v1Blocked: false, v2Blocked: false, because: 'short pay with partial AP relief' },
  { proposalId: 'PROP-012-r1', v1Blocked: false, v2Blocked: true, because: 'held-out settlement-date FX rate caught by v2' },
];

export type ExpectedLabels = {
  benchmarkIsSynthetic: boolean;
  practitionerReviewed: boolean;
  cases: Record<string, Record<string, unknown>>;
};

export function loadExpectedLabels(): ExpectedLabels {
  return JSON.parse(
    readFileSync(path.join(process.cwd(), 'bench', 'expected.json'), 'utf8'),
  ) as ExpectedLabels;
}

export function runControlEngineBench(): number {
  const proposals = listProposals();
  const cpr = listControlPRs().find((pr) => pr.id === 'CPR-001');
  if (!cpr) throw new Error('CPR-001 missing from the frozen benchmark');

  const v2Rules: ConstrainedRule[] = [cpr.rule];
  let failures = 0;

  for (const expectation of CONTROL_ENGINE_EXPECTATIONS) {
    const proposal = proposals.find((p) => p.id === expectation.proposalId);
    if (!proposal) {
      failures += 1;
      continue;
    }

    const v1 = evaluateProposal(proposal, { rules: [], packVersion: 'v1' });
    const v2 = evaluateProposal(proposal, { rules: v2Rules, packVersion: 'v2' });
    if (v1.blocked !== expectation.v1Blocked || v2.blocked !== expectation.v2Blocked) {
      failures += 1;
    }
  }

  for (const id of cpr.positiveFixtures) {
    const proposal = proposals.find((p) => p.id === id);
    if (!proposal) continue;
    const caught = evaluateProposal(proposal, { rules: v2Rules, packVersion: 'v2' }).results.some(
      (r) => r.code === cpr.rule.onFail.code && r.status === 'blocked',
    );
    if (!caught) failures += 1;
  }

  for (const id of cpr.negativeFixtures) {
    const proposal = proposals.find((p) => p.id === id);
    if (!proposal) continue;
    if (evaluateProposal(proposal, { rules: v2Rules, packVersion: 'v2' }).blocked) failures += 1;
  }

  return failures;
}
