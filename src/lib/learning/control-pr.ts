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

  UNSUPPORTED_FX_SOURCE: {
    appliesTo: (proposal) => Boolean(proposal.fx),
    build: () => ({
      family: 'policy_provenance',
      selector: 'fx.sourceId',
      comparator: 'in_allowlist',
      allowlistRef: 'approved_fx_sources',
      onFail: {
        code: 'VERITY-FX-007',
        title: 'FX rate comes from a provider on the approved list',
        requiredRepair:
          'Retrieve the rate from an approved provider named in the policy pack and cite that observation.',
      },
    }),
  },

  CLOSED_PERIOD: {
    appliesTo: (proposal) => proposal.journal.length > 0,
    build: () => ({
      family: 'accounting_integrity',
      selector: 'journal.periods',
      comparator: 'in_allowlist',
      allowlistRef: 'open_periods',
      onFail: {
        code: 'VERITY-AI-006',
        title: 'Every journal line posts into an open period',
        requiredRepair:
          'Move the entry into an open accounting period, or route the item to the controller as a prior-period adjustment.',
      },
    }),
  },

  WRONG_ACCOUNT: {
    appliesTo: (proposal) => proposal.journal.length > 0,
    build: () => ({
      family: 'accounting_integrity',
      selector: 'journal.accounts',
      comparator: 'in_allowlist',
      allowlistRef: 'permitted_accounts',
      onFail: {
        code: 'VERITY-AI-007',
        title: 'Every account is in the permitted chart',
        requiredRepair:
          'Post only to accounts in the permitted chart of accounts named in the policy pack.',
      },
    }),
  },

  WRONG_ENTITY: {
    appliesTo: (proposal) => proposal.journal.length > 0,
    build: () => ({
      family: 'accounting_integrity',
      selector: 'journal.entities',
      comparator: 'in_allowlist',
      allowlistRef: 'permitted_entities',
      onFail: {
        code: 'VERITY-AI-008',
        title: 'Every journal line posts to a permitted entity',
        requiredRepair: 'Post to an entity named in the policy pack, or escalate for an intercompany decision.',
      },
    }),
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
    case 'UNSUPPORTED_FX_SOURCE':
      return 'FX rate taken from a provider outside the approved list';
    case 'CLOSED_PERIOD':
      return 'Journal proposed into a closed accounting period';
    case 'WRONG_ACCOUNT':
      return 'Journal posted to an account outside the permitted chart';
    case 'WRONG_ENTITY':
      return 'Journal posted to an entity outside the permitted list';
    default:
      return `Repeated controller rejection: ${group.reasonCode}`;
  }
}

function ruleSentence(rule: ConstrainedRule): string {
  switch (rule.comparator) {
    case 'equals':
      return `require ${rule.selector} to equal ${rule.compareTo} within ${rule.tolerance?.value ?? 0} ${rule.tolerance?.unit ?? 'days'}`;
    case 'in_allowlist':
      return `require every value of ${rule.selector} to appear in the policy pack's ${rule.allowlistRef} list`;
    case 'not_in_allowlist':
      return `reject any value of ${rule.selector} that appears in the policy pack's ${rule.allowlistRef} list`;
    case 'exists':
      return `require ${rule.selector} to be present`;
    default:
      return `apply ${rule.comparator} to ${rule.selector}`;
  }
}

function specAmendmentText(group: FailureGroup, rule: ConstrainedRule): string {
  return [
    `${group.proposalIds.length} proposals were rejected by a controller with reason code ${group.reasonCode} (${group.caseIds.join(', ')}).`,
    group.sharedTraits.length > 0
      ? `Every one of them shares these traits: ${group.sharedTraits.join('; ')}.`
      : '',
    'Policy already covers this, but the control pack does not check it, so the failure reaches a controller instead of being blocked.',
    `Proposed amendment: ${ruleSentence(rule)}, blocking as ${rule.onFail.code}.`,
    'Merging this moves the failure from controller judgment to a deterministic control. It does not teach the agent anything; it versions the control suite.',
  ]
    .filter(Boolean)
    .join(' ');
}
