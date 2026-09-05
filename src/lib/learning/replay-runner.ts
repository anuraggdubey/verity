import type { ControlPR, ReplayFingerprint, ReplayReport } from '@/lib/contracts/types';
import { modelConfig } from '@/lib/agent/model';
import { corePromptHash } from '@/lib/agent/prompt';
import { TOOL_NAMES } from '@/lib/agent/tools';
import { evaluateProposal, mergedRules, policyPack } from '@/lib/controls/engine';
import { getCase, listProposals, packVersion } from '@/lib/demo/store';
import { routeProposal } from '@/lib/router/risk';

/**
 * Replay.
 *
 * What this measures, precisely: the stored first-pass proposals are re-evaluated
 * under the current pack plus the proposed rule. It is a control-pack replay, not
 * a re-run of the model — the fingerprint records the configuration those
 * proposals were produced under so nobody can quietly swap models between packs
 * and call the difference an improvement.
 *
 * Auto-clear coverage is reported before and after. If it drops, that is a real
 * cost of the new control and it goes on the screen.
 */

export function nextPackVersion(current: string = packVersion()): string {
  const match = /^v(\d+)$/.exec(current);
  return match ? `v${Number(match[1]) + 1}` : `${current}+1`;
}

export function replayFingerprint(controlPackVersion: string): ReplayFingerprint {
  const config = modelConfig();
  return {
    model: config.provider === 'fixture' ? `${config.model} (fixture replay)` : config.model,
    temperature: config.temperature,
    tools: [...TOOL_NAMES],
    corePromptHash: corePromptHash(),
    policyVersion: policyPack().policyVersion,
    controlPackVersion,
  };
}

function autoClearCount(rules: Parameters<typeof evaluateProposal>[1]): number {
  let count = 0;
  for (const proposal of listProposals()) {
    const financeCase = getCase(proposal.caseId);
    if (!financeCase) continue;
    // Only the latest revision of a case can clear.
    if (financeCase.revisions[financeCase.revisions.length - 1] !== proposal.id) continue;
    const report = evaluateProposal(proposal, rules);
    if (report.blocked) continue;
    if (routeProposal(proposal, report, financeCase).lane === 'auto') count += 1;
  }
  return count;
}

export function runReplay(controlPR: ControlPR): ReplayReport {
  const proposals = listProposals();
  const before = mergedRules();
  const after = [...before, controlPR.rule];
  const targetPack = nextPackVersion();

  const positives = controlPR.positiveFixtures.map((proposalId) => {
    const proposal = proposals.find((p) => p.id === proposalId);
    if (!proposal) return { proposalId, caught: false };
    const report = evaluateProposal(proposal, { rules: after, packVersion: targetPack });
    return {
      proposalId,
      caught: report.results.some(
        (result) => result.code === controlPR.rule.onFail.code && result.status === 'blocked',
      ),
    };
  });

  const negatives = controlPR.negativeFixtures.map((proposalId) => {
    const proposal = proposals.find((p) => p.id === proposalId);
    if (!proposal) return { proposalId, stillAllowed: false };
    const report = evaluateProposal(proposal, { rules: after, packVersion: targetPack });
    return { proposalId, stillAllowed: !report.blocked };
  });

  return {
    controlPrId: controlPR.id,
    packVersion: targetPack,
    fingerprint: replayFingerprint(targetPack),
    positives,
    negatives,
    autoClearBefore: autoClearCount({ rules: before, packVersion: packVersion() }),
    autoClearAfter: autoClearCount({ rules: after, packVersion: targetPack }),
    ranAt: new Date().toISOString(),
  };
}

export function replayIsMergeable(report: ReplayReport): { ok: boolean; reason?: string } {
  const missed = report.positives.filter((positive) => !positive.caught);
  if (missed.length > 0) {
    return {
      ok: false,
      reason: `The rule does not catch ${missed.map((m) => m.proposalId).join(', ')}, so it does not address the failure it was drafted for.`,
    };
  }
  const regressed = report.negatives.filter((negative) => !negative.stillAllowed);
  if (regressed.length > 0) {
    return {
      ok: false,
      reason: `The rule blocks counterexample${regressed.length > 1 ? 's' : ''} ${regressed.map((r) => r.proposalId).join(', ')}. That is a false positive, not a guardrail.`,
    };
  }
  return { ok: true };
}
