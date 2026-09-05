import type { ConstrainedRule, ControlPR, Proposal, RejectReasonCode } from '@/lib/contracts/types';
import { applyConstrainedRule, policyPack } from '@/lib/controls/engine';
import { listControllerDecisions, listProposals } from '@/lib/demo/store';
import type { FailureGroup } from '@/lib/learning/grouping';

/**
 * Control PR drafting.
 *
 * The rule is filled from a fixed catalog of schemas the engine can actually
 * enforce. Nothing here generates code, and nothing here activates a rule — the
 * output is a draft that a controller merges or rejects.
 *
 * A reason code with no enforceable schema returns a refusal explaining why,
 * instead of a rule the engine would quietly fail to evaluate.
 */

type Template = {
  build: () => ConstrainedRule;
  /** Which proposals the rule could ever apply to. */
  appliesTo: (proposal: Proposal) => boolean;
};

const TEMPLATES: Partial<Record<RejectReasonCode, Template>> = {
  WRONG_RATE_DATE: {
    appliesTo: (proposal) => Boolean(proposal.fx),
    build: () => {
      const policy = policyPack();
      return {
        family: 'policy_provenance',
        selector: 'fx.rateDate',
        comparator: 'equals',
        compareTo: 'document.transactionDate',
        tolerance: { unit: 'days', value: policy.fx.rateDateToleranceDays },
        onFail: {
          code: 'VERITY-FX-005',
          title: 'FX rate date matches the invoice transaction date',
          requiredRepair:
            'Retrieve the approved spot rate observed on the invoice transaction date, recalculate the entry, recognize any settlement difference as realized FX gain or loss, and cite the exact observation.',
        },
      };
    },
  },
};

export type DraftResult =
  | { ok: true; controlPR: ControlPR }
  | { ok: false; reason: string };

export function draftControlPR(group: FailureGroup, options?: { id?: string }): DraftResult {
  const template = TEMPLATES[group.reasonCode];
  if (!template) {
    return {
      ok: false,
      reason: `No constrained rule schema can express "${group.reasonCode}" yet. This failure stays a controller judgment rather than becoming a guardrail the engine cannot enforce.`,
    };
  }
  if (group.proposalIds.length < 2) {
    return { ok: false, reason: 'A Control PR needs at least two reviewer-confirmed failures.' };
  }

  const rule = template.build();
  const proposals = listProposals();
  const positives = group.proposalIds.filter((id) => {
    const proposal = proposals.find((p) => p.id === id);
    return proposal ? template.appliesTo(proposal) : false;
  });

  if (positives.length < 2) {
    return {
      ok: false,
      reason: 'Fewer than two of the rejected proposals are in scope for this rule.',
    };
  }

  // Counterexamples: in-scope proposals outside the group that the rule leaves
  // alone. Controller-approved ones first — those are the ones that would hurt.
  const approved = new Set(
    listControllerDecisions()
      .filter((decision) => decision.decision === 'approve')
      .map((decision) => decision.proposalId),
  );
  const candidates = proposals
    .filter((proposal) => template.appliesTo(proposal) && !group.proposalIds.includes(proposal.id))
    .filter((proposal) => {
      const result = applyConstrainedRule(rule, proposal);
      return !result || result.status === 'pass';
    })
    .sort((a, b) => Number(approved.has(b.id)) - Number(approved.has(a.id)));

  const negatives = candidates.slice(0, 3).map((proposal) => proposal.id);

  const draftedAt = new Date().toISOString();
  const controlPR: ControlPR = {
    id: options?.id ?? `CPR-${group.reasonCode}`,
    failureMode: failureModeText(group),
    supportingProposalIds: group.proposalIds,
    specAmendment: specAmendmentText(group, rule),
    rule,
    positiveFixtures: positives,
    negativeFixtures: negatives,
    status: 'draft',
    draftedAt,
  };

  return { ok: true, controlPR };
}

function failureModeText(group: FailureGroup): string {
  switch (group.reasonCode) {
    case 'WRONG_RATE_DATE':
      return 'FX rate dated other than the invoice transaction date';
    default:
      return `Repeated controller rejection: ${group.reasonCode}`;
  }
}

function specAmendmentText(group: FailureGroup, rule: ConstrainedRule): string {
  const policy = policyPack();
  return [
    `${group.proposalIds.length} proposals were rejected by a controller with reason code ${group.reasonCode} (${group.caseIds.join(', ')}).`,
    group.sharedTraits.length > 0
      ? `Every one of them shares these traits: ${group.sharedTraits.join('; ')}.`
      : '',
    `Policy already requires the ${policy.fx.requiredRateType} rate observed on the invoice transaction date, but the control pack only checks the source and the rate type, so a correctly sourced rate carrying the wrong date passes controls and reaches review.`,
    `Proposed amendment: require ${rule.selector} to equal ${rule.compareTo} within ${rule.tolerance?.value ?? 0} ${rule.tolerance?.unit ?? 'days'}, blocking as ${rule.onFail.code}.`,
    'Merging this moves the failure from controller judgment to a deterministic control. It does not teach the agent anything; it versions the control suite.',
  ]
    .filter(Boolean)
    .join(' ');
}
