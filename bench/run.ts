/**
 * Headless control-engine benchmark.
 *
 *   npm run bench
 */

import { CONTROL_ENGINE_EXPECTATIONS } from '../src/lib/replay/fixtures';
import { evaluateProposal } from '../src/lib/controls/engine';
import { listControlPRs, listProposals } from '../src/lib/store';

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

  for (const expectation of CONTROL_ENGINE_EXPECTATIONS) {
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
