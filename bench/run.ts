/**
 * Headless control-engine benchmark.
 *
 * Runs every stored proposal through the control engine under pack v1 (built-in
 * checks only) and under pack v2 (v1 plus the constrained rule drafted in
 * CPR-001), and checks the result against what the fixture and the Control PR
 * claim. It exits non-zero when a claim is not true, so the demo cannot rest on
 * an assertion nobody ran.
 *
 *   npm run bench
 */

import { evaluateProposal } from '../src/lib/controls/engine';
import { listControlPRs, listProposals } from '../src/lib/demo/store';

type Expectation = { proposalId: string; v1Blocked: boolean; v2Blocked: boolean; because: string };

const EXPECTATIONS: Expectation[] = [
  { proposalId: 'PROP-001-r1', v1Blocked: true, v2Blocked: true, because: 'unapproved FX source (VERITY-FX-003)' },
  { proposalId: 'PROP-001-r2', v1Blocked: false, v2Blocked: false, because: 'repaired: approved transaction-date spot rate' },
  { proposalId: 'PROP-002-r1', v1Blocked: false, v2Blocked: false, because: 'bank fee journal, fully evidenced' },
  { proposalId: 'PROP-003-r1', v1Blocked: false, v2Blocked: false, because: 'non-posting duplicate flag, advisory only' },
  { proposalId: 'PROP-004-r1', v1Blocked: false, v2Blocked: false, because: 'correct abstention, no journal' },
  { proposalId: 'PROP-005-r1', v1Blocked: false, v2Blocked: false, because: 'approved timing difference, non-posting' },
  { proposalId: 'PROP-006-r1', v1Blocked: false, v2Blocked: true, because: 'settlement-date rate: escapes v1, caught by v2' },
  { proposalId: 'PROP-008-r1', v1Blocked: false, v2Blocked: false, because: 'counterexample: correct rate date, must stay allowed' },
  { proposalId: 'PROP-009-r1', v1Blocked: false, v2Blocked: true, because: 'month-end closing rate: escapes v1, caught by v2' },
];

function codes(blockedOnly: boolean, results: { code: string; status: string }[]) {
  return results
    .filter((r) => (blockedOnly ? r.status !== 'pass' : true))
    .map((r) => `${r.code}:${r.status}`)
    .join(' ');
}

function main() {
  const proposals = listProposals();
  const cpr = listControlPRs().find((pr) => pr.id === 'CPR-001');
  if (!cpr) throw new Error('CPR-001 missing from the fixture');

  const v2Rules = [cpr.rule];
  let failures = 0;

  console.log('proposal      v1        v2        non-passing controls (v2)');
  console.log('-'.repeat(96));

  for (const expectation of EXPECTATIONS) {
    const proposal = proposals.find((p) => p.id === expectation.proposalId);
    if (!proposal) {
      console.error(`MISSING   ${expectation.proposalId} is not in the fixture`);
      failures += 1;
      continue;
    }

    const v1 = evaluateProposal(proposal, { rules: [], packVersion: 'v1' });
    const v2 = evaluateProposal(proposal, { rules: v2Rules, packVersion: 'v2' });

    const ok = v1.blocked === expectation.v1Blocked && v2.blocked === expectation.v2Blocked;
    if (!ok) failures += 1;

    console.log(
      `${proposal.id.padEnd(13)} ${(v1.blocked ? 'BLOCKED' : 'passed').padEnd(9)} ${(v2.blocked ? 'BLOCKED' : 'passed').padEnd(9)} ${codes(true, v2.results) || '—'}${ok ? '' : '   <-- MISMATCH'}`,
    );
    if (!ok) {
      console.error(
        `          expected v1=${expectation.v1Blocked ? 'BLOCKED' : 'passed'} v2=${expectation.v2Blocked ? 'BLOCKED' : 'passed'} (${expectation.because})`,
      );
    }
  }

  console.log('-'.repeat(96));

  // The Control PR's own claim: every positive is caught, every counterexample survives.
  for (const id of cpr.positiveFixtures) {
    const proposal = proposals.find((p) => p.id === id);
    if (!proposal) continue;
    const caught = evaluateProposal(proposal, { rules: v2Rules, packVersion: 'v2' }).results.some(
      (r) => r.code === cpr.rule.onFail.code && r.status === 'blocked',
    );
    console.log(`positive     ${id.padEnd(13)} ${caught ? 'caught by ' + cpr.rule.onFail.code : 'NOT CAUGHT'}`);
    if (!caught) failures += 1;
  }
  for (const id of cpr.negativeFixtures) {
    const proposal = proposals.find((p) => p.id === id);
    if (!proposal) continue;
    const blocked = evaluateProposal(proposal, { rules: v2Rules, packVersion: 'v2' }).blocked;
    console.log(`counterex.   ${id.padEnd(13)} ${blocked ? 'FALSE POSITIVE' : 'still allowed'}`);
    if (blocked) failures += 1;
  }

  console.log('-'.repeat(96));
  if (failures > 0) {
    console.error(`${failures} claim(s) did not hold.`);
    process.exit(1);
  }
  console.log('All control-engine claims hold.');
}

main();
