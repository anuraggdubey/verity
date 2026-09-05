/**
 * Exercises the learning loop end to end and checks its claims.
 *
 *   npm run learn
 *
 * Controller rejections -> failure group -> drafted Control PR -> replay against
 * positives and counterexamples. Exits non-zero if the drafted rule fails to
 * catch what it was drafted for, or catches something it must not.
 */

import { draftControlPR } from '../src/lib/learning/control-pr';
import { groupReviewerRejections } from '../src/lib/learning/grouping';
import { replayIsMergeable, runReplay } from '../src/lib/learning/replay-runner';

function main() {
  const groups = groupReviewerRejections();
  console.log(`Failure groups with >= 2 reviewer-confirmed rejections: ${groups.length}`);
  for (const group of groups) {
    console.log(`\n  ${group.id}  reason=${group.reasonCode}  support=${group.proposalIds.length}  rationale coherence=${group.coherence}`);
    console.log(`  cases: ${group.caseIds.join(', ')}`);
    for (const trait of group.sharedTraits) console.log(`    - ${trait}`);
  }

  if (groups.length === 0) {
    console.error('\nNothing to draft. Reject at least two proposals with the same reason code first.');
    process.exit(1);
  }

  const draft = draftControlPR(groups[0], { id: 'CPR-DRAFT' });
  if (!draft.ok) {
    console.error(`\nNo Control PR drafted: ${draft.reason}`);
    process.exit(1);
  }

  const pr = draft.controlPR;
  console.log('\n' + '='.repeat(96));
  console.log(`Drafted ${pr.id}: ${pr.failureMode}`);
  console.log(`  rule: ${pr.rule.selector} ${pr.rule.comparator} ${pr.rule.compareTo} (tolerance ${pr.rule.tolerance?.value ?? 0} ${pr.rule.tolerance?.unit ?? 'days'}) -> ${pr.rule.onFail.code}`);
  console.log(`  positives:      ${pr.positiveFixtures.join(', ') || 'none'}`);
  console.log(`  counterexamples: ${pr.negativeFixtures.join(', ') || 'none'}`);
  console.log(`\n  ${pr.specAmendment}`);

  const replay = runReplay(pr);
  console.log('\n' + '='.repeat(96));
  console.log(`Replay under pack ${replay.packVersion} · model ${replay.fingerprint.model} · temp ${replay.fingerprint.temperature} · prompt ${replay.fingerprint.corePromptHash}`);
  for (const positive of replay.positives) {
    console.log(`  positive       ${positive.proposalId.padEnd(14)} ${positive.caught ? 'caught' : 'NOT CAUGHT'}`);
  }
  for (const negative of replay.negatives) {
    console.log(`  counterexample ${negative.proposalId.padEnd(14)} ${negative.stillAllowed ? 'still allowed' : 'FALSE POSITIVE'}`);
  }
  console.log(`  auto-clear coverage ${replay.autoClearBefore} -> ${replay.autoClearAfter}${replay.autoClearAfter < replay.autoClearBefore ? '  (decreased — safety tradeoff, state it)' : ''}`);

  const mergeable = replayIsMergeable(replay);
  console.log('\n' + '='.repeat(96));
  if (!mergeable.ok) {
    console.error(`Not mergeable: ${mergeable.reason}`);
    process.exit(1);
  }
  console.log('Replay clean: every supporting failure is caught and every counterexample survives.');
  console.log('A controller still has to merge it.');
}

main();
