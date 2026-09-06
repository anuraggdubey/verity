import type { ConstrainedRule, ControlFamily, Proposal } from '@/lib/contracts/types';
import { createProvider, modelConfig, type ToolSpec } from '@/lib/agent/model';
import { applyConstrainedRule, policyPack } from '@/lib/controls/engine';
import { listCases, listControllerDecisions, listProposals } from '@/lib/store';

/**
 * Plain-English rule composer.
 *
 * A controller writes what they want in their own words; the model fills the
 * same `ConstrainedRule` schema the Control PR flow already uses. That is the
 * only thing it is allowed to produce — it cannot write code, cannot invent a
 * selector the engine does not implement, and cannot enable anything. Every
 * draft is validated against the engine's real capabilities here, and a draft
 * that does not validate is refused with the reason rather than repaired into
 * something plausible.
 *
 * The composed rule then goes through the unchanged path: simulate → propose as
 * a Control PR → replay against positives and counterexamples → a human merges.
 */

const SELECTORS: { selector: string; means: string }[] = [
  { selector: 'fx.rateDate', means: 'the date of the FX rate the proposal used' },
  { selector: 'fx.rateType', means: 'spot, closing or average' },
  { selector: 'fx.sourceId', means: 'the FX provider, e.g. APEX-REF-RATES' },
  { selector: 'fx.rate', means: 'the numeric FX rate' },
  { selector: 'disposition', means: 'the reconciliation decision, e.g. fx_revaluation' },
  { selector: 'journal.accounts', means: 'every GL account on the entry' },
  { selector: 'journal.periods', means: 'every accounting period on the entry' },
  { selector: 'journal.entities', means: 'every legal entity on the entry' },
  { selector: 'journal.currencies', means: 'every currency on the entry' },
  { selector: 'citations.count', means: 'how many citations the proposal carries' },
  { selector: 'citations.documentCount', means: 'how many supporting documents it cites' },
  { selector: 'narrative.length', means: 'length of the written explanation, in characters' },
  { selector: 'duplicate.postedMatchExists', means: '"true" when a posted entry already matches this bank line' },
];

const COMPARATORS = [
  'equals',
  'not_equals',
  'in_allowlist',
  'not_in_allowlist',
  'gte',
  'lte',
  'exists',
] as const;

const ALLOWLISTS = [
  'approved_fx_sources',
  'permitted_accounts',
  'open_periods',
  'closed_periods',
  'permitted_entities',
  'auto_clear_dispositions',
] as const;

const COMPARE_TO = ['document.transactionDate', 'bank_line.postedDate'];
const FAMILIES: ControlFamily[] = ['evidence_lineage', 'accounting_integrity', 'policy_provenance'];

export type ComposedRule = {
  rule: ConstrainedRule;
  /** The rule read back in plain English, so a non-technical reviewer can check it. */
  restatement: string;
  source: 'model' | 'offline';
};

export type ComposeResult =
  | { ok: true; composed: ComposedRule }
  | { ok: false; reason: string; suggestions?: string[] };

/* ------------------------------------------------------------- validation */

function validate(candidate: unknown): { ok: true; rule: ConstrainedRule } | { ok: false; reason: string } {
  if (typeof candidate !== 'object' || candidate === null) {
    return { ok: false, reason: 'The draft was not an object.' };
  }
  const draft = candidate as Record<string, unknown>;
  const onFail = (draft.onFail ?? {}) as Record<string, unknown>;

  if (!FAMILIES.includes(draft.family as ControlFamily)) {
    return { ok: false, reason: `family must be one of ${FAMILIES.join(', ')}.` };
  }
  if (!SELECTORS.some((entry) => entry.selector === draft.selector)) {
    return {
      ok: false,
      reason: `Verity cannot check "${String(draft.selector)}". It can only read: ${SELECTORS.map((s) => s.selector).join(', ')}.`,
    };
  }
  if (!COMPARATORS.includes(draft.comparator as (typeof COMPARATORS)[number])) {
    return { ok: false, reason: `comparator must be one of ${COMPARATORS.join(', ')}.` };
  }
  if (draft.allowlistRef !== undefined && !ALLOWLISTS.includes(draft.allowlistRef as (typeof ALLOWLISTS)[number])) {
    return { ok: false, reason: `allowlistRef must be one of ${ALLOWLISTS.join(', ')}.` };
  }
  if (
    (draft.comparator === 'in_allowlist' || draft.comparator === 'not_in_allowlist') &&
    !draft.allowlistRef
  ) {
    return { ok: false, reason: 'An allowlist comparator must name a list from the policy pack.' };
  }
  if ((draft.comparator === 'gte' || draft.comparator === 'lte') && !Number.isFinite(Number(draft.compareTo))) {
    return { ok: false, reason: 'A numeric comparator needs a numeric threshold in compareTo.' };
  }
  // Existing families are two letters (AI, EV, FX, PP), but a longer mnemonic
  // like ACCT or PERIOD is a reasonable draft and not worth refusing over. The
  // received value goes in the message: a validator that rejects without
  // showing what it rejected is not debuggable.
  if (typeof onFail.code !== 'string' || !/^VERITY-[A-Z]{2,8}-\d{3}$/.test(onFail.code)) {
    return {
      ok: false,
      reason: `onFail.code must look like VERITY-XX-000; received ${JSON.stringify(onFail.code)}.`,
    };
  }
  if (typeof onFail.title !== 'string' || onFail.title.length < 8) {
    return { ok: false, reason: 'onFail.title must say what the rule requires.' };
  }
  if (typeof onFail.requiredRepair !== 'string' || onFail.requiredRepair.length < 20) {
    return {
      ok: false,
      reason: 'onFail.requiredRepair must tell the agent what to do next — that text is the repair instruction.',
    };
  }

  const rule: ConstrainedRule = {
    family: draft.family as ControlFamily,
    selector: draft.selector as string,
    comparator: draft.comparator as ConstrainedRule['comparator'],
    ...(draft.compareTo !== undefined ? { compareTo: String(draft.compareTo) } : {}),
    ...(draft.allowlistRef ? { allowlistRef: String(draft.allowlistRef) } : {}),
    ...(draft.tolerance && typeof draft.tolerance === 'object'
      ? { tolerance: draft.tolerance as ConstrainedRule['tolerance'] }
      : {}),
    onFail: {
      code: onFail.code as string,
      title: onFail.title as string,
      requiredRepair: onFail.requiredRepair as string,
    },
  };
  return { ok: true, rule };
}

/** Reads a rule back in the words a controller would use. */
export function restate(rule: ConstrainedRule): string {
  const subject = SELECTORS.find((entry) => entry.selector === rule.selector)?.means ?? rule.selector;
  switch (rule.comparator) {
    case 'equals':
      return `Block the proposal unless ${subject} matches ${rule.compareTo}${
        rule.tolerance ? ` within ${rule.tolerance.value} ${rule.tolerance.unit}` : ''
      }.`;
    case 'not_equals':
      return `Block the proposal when ${subject} equals ${rule.compareTo}.`;
    case 'in_allowlist':
      return `Block the proposal unless ${subject} appears in the policy pack's ${rule.allowlistRef} list.`;
    case 'not_in_allowlist':
      return `Block the proposal when ${subject} appears in the policy pack's ${rule.allowlistRef} list.`;
    case 'gte':
      return `Block the proposal unless ${subject} is at least ${rule.compareTo}.`;
    case 'lte':
      return `Block the proposal unless ${subject} is at most ${rule.compareTo}.`;
    case 'exists':
      return `Block the proposal unless ${subject} is present.`;
    default:
      return `Apply ${rule.comparator} to ${subject}.`;
  }
}

/* --------------------------------------------------------------- offline */

/**
 * Canned drafts for when no model key is configured — the deployed demo, and
 * any offline run. Keyword-matched, never guessed: a request that matches
 * nothing is refused with the list of what Verity can actually check, rather
 * than answered with a rule that looks right and enforces nothing.
 */
const OFFLINE: { match: RegExp; rule: ConstrainedRule }[] = [
  {
    match: /(rate|fx).*(date|day)|transaction.date|settlement.date/i,
    rule: {
      family: 'policy_provenance',
      selector: 'fx.rateDate',
      comparator: 'equals',
      compareTo: 'document.transactionDate',
      tolerance: { unit: 'days', value: 0 },
      onFail: {
        code: 'VERITY-FX-005',
        title: 'FX rate date matches the invoice transaction date',
        requiredRepair:
          'Retrieve the approved spot rate observed on the invoice transaction date, recalculate the entry, recognize any settlement difference as realized FX gain or loss, and cite the exact observation.',
      },
    },
  },
  {
    match: /(approved|allowed|trusted|official).*(source|provider|feed)|unapproved|street/i,
    rule: {
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
    },
  },
  {
    match: /closed period|open period|prior period|period is closed/i,
    rule: {
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
    },
  },
  {
    match: /(receipt|invoice|document|evidence|attachment).*(cite|attach|require|support)|no evidence|without evidence/i,
    rule: {
      family: 'evidence_lineage',
      selector: 'citations.documentCount',
      comparator: 'gte',
      compareTo: '1',
      onFail: {
        code: 'VERITY-EV-006',
        title: 'A posting decision cites at least one supporting document',
        requiredRepair:
          'Retrieve the invoice, remittance or fee schedule that supports this entry and cite it. If no document exists, choose insufficient_evidence and escalate instead of posting.',
      },
    },
  },
  {
    match: /duplicate|paid twice|already paid|second payment/i,
    rule: {
      family: 'accounting_integrity',
      selector: 'duplicate.postedMatchExists',
      comparator: 'not_equals',
      compareTo: 'true',
      onFail: {
        code: 'VERITY-AI-009',
        title: 'No posted cash entry already carries this reference and amount',
        requiredRepair:
          'A posted entry already matches this bank line by reference and amount. Confirm whether this is the same payment; if it is, choose duplicate rather than posting a second entry.',
      },
    },
  },
  {
    match: /explain|narrative|reason|justif|too short|one.?line/i,
    rule: {
      family: 'evidence_lineage',
      selector: 'narrative.length',
      comparator: 'gte',
      compareTo: '120',
      onFail: {
        code: 'VERITY-EV-007',
        title: 'The narrative explains the decision',
        requiredRepair:
          'State what happened, which records support it, and how the amounts were derived — in at least a couple of sentences. A one-line assertion is not a reviewable explanation.',
      },
    },
  },
];

function composeOffline(text: string): ComposeResult {
  const hit = OFFLINE.find((entry) => entry.match.test(text));
  if (!hit) {
    return {
      ok: false,
      reason:
        'No model is configured, so rule drafting is running from a small offline library and this request did not match any of it.',
      suggestions: [
        'FX rates must be dated the invoice transaction date',
        'Only use FX rates from an approved provider',
        'Never post into a closed accounting period',
        'Any journal entry must cite a supporting document',
        'Do not post a second entry for a payment already recorded',
      ],
    };
  }
  return { ok: true, composed: { rule: hit.rule, restatement: restate(hit.rule), source: 'offline' } };
}

/* ----------------------------------------------------------------- model */

const EMIT_RULE: ToolSpec = {
  name: 'emit_rule',
  description:
    'Express the controller request as one constrained rule. Use only the listed selectors and comparators. If the request cannot be expressed with them, do not call this tool.',
  parameters: {
    type: 'object',
    properties: {
      family: { type: 'string', enum: FAMILIES },
      selector: { type: 'string', enum: SELECTORS.map((entry) => entry.selector) },
      comparator: { type: 'string', enum: [...COMPARATORS] },
      compareTo: {
        type: 'string',
        description: `A field to compare against (${COMPARE_TO.join(', ')}), a literal value, or a numeric threshold for gte/lte.`,
      },
      allowlistRef: { type: 'string', enum: [...ALLOWLISTS] },
      tolerance: {
        type: 'object',
        properties: {
          unit: { type: 'string', enum: ['days', 'currency_minor', 'percent'] },
          value: { type: 'number' },
        },
        required: ['unit', 'value'],
        additionalProperties: false,
      },
      onFail: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
            description:
              'A new control code shaped VERITY-<FAMILY>-<3 digits>, where FAMILY is 2-8 capital letters. Existing families: FX, AI, EV, PP. Example: VERITY-FX-008.',
          },
          title: { type: 'string', description: 'What the rule requires, stated positively.' },
          requiredRepair: {
            type: 'string',
            description: 'What the agent must do to fix a blocked proposal. This text is sent to the agent verbatim.',
          },
        },
        required: ['code', 'title', 'requiredRepair'],
        additionalProperties: false,
      },
    },
    required: ['family', 'selector', 'comparator', 'onFail'],
    additionalProperties: false,
  },
};

function composerPrompt(): string {
  const policy = policyPack();
  return [
    'You translate a finance controller’s plain-English policy into one constrained rule for a deterministic control engine.',
    'You are not writing code and you are not enabling anything. You fill a fixed schema; a human reviews and merges it.',
    '',
    'Verity can only read these fields of a proposal:',
    ...SELECTORS.map((entry) => `- ${entry.selector} — ${entry.means}`),
    '',
    `Named lists in the policy pack: ${ALLOWLISTS.join(', ')}.`,
    `Fields you may compare against: ${COMPARE_TO.join(', ')}.`,
    `Policy in force: FX must use the ${policy.fx.requiredRateType} rate on the invoice transaction date from ${policy.fx.approvedSources.join(' or ')}; open periods ${policy.openPeriods.join(', ')}; permitted accounts ${Object.keys(policy.chartOfAccounts).join(', ')}.`,
    '',
    'If the request cannot be expressed with those fields, do not call the tool — reply with one sentence explaining what Verity cannot check.',
    'requiredRepair is read by the agent whose proposal was blocked, so write it as an instruction to that agent.',
  ].join('\n');
}

export async function composeRule(text: string): Promise<ComposeResult> {
  const request = text.trim();
  if (request.length < 8) {
    return { ok: false, reason: 'Describe the rule in a sentence.' };
  }

  const config = modelConfig();
  if (config.provider === 'fixture') return composeOffline(request);

  try {
    const provider = createProvider({ config });
    const response = await provider.complete({
      messages: [
        { role: 'system', content: composerPrompt() },
        { role: 'user', content: `Controller request: ${request}` },
      ],
      tools: [EMIT_RULE],
    });

    const call = response.toolCalls.find((entry) => entry.name === EMIT_RULE.name);
    if (!call) {
      return {
        ok: false,
        reason:
          response.text?.trim() ||
          'That cannot be expressed as a deterministic rule over the fields Verity reads.',
      };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(call.arguments || '{}');
    } catch {
      return { ok: false, reason: 'The drafted rule was not valid JSON.' };
    }

    const checked = validate(parsed);
    if (!checked.ok) return { ok: false, reason: checked.reason };

    return {
      ok: true,
      composed: { rule: checked.rule, restatement: restate(checked.rule), source: 'model' },
    };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : 'Rule drafting failed.',
    };
  }
}

/* ------------------------------------------------------------ simulation */

export type Simulation = {
  wouldBlock: { proposalId: string; caseId: string; why: string }[];
  stillAllowed: string[];
  /** Blocked proposals a controller had approved — the false positives that matter. */
  wouldBlockApproved: string[];
  totalEvaluated: number;
  notApplicable: number;
  summary: string;
};

/**
 * Runs the drafted rule over every stored proposal before anything is merged.
 * This is the part a non-technical reviewer should read: not the schema, but
 * which real decisions the rule would have stopped, and whether it would have
 * stopped anything a controller already approved.
 */
export function simulateRule(rule: ConstrainedRule): Simulation {
  const proposals = listProposals();
  const cases = listCases();
  const approved = new Set(
    listControllerDecisions()
      .filter((decision) => decision.decision === 'approve')
      .map((decision) => decision.proposalId),
  );

  const wouldBlock: Simulation['wouldBlock'] = [];
  const stillAllowed: string[] = [];
  let notApplicable = 0;

  for (const proposal of proposals) {
    const result = applyConstrainedRule(rule, proposal);
    if (!result) {
      notApplicable += 1;
      continue;
    }
    if (result.status === 'blocked') {
      wouldBlock.push({
        proposalId: proposal.id,
        caseId: proposal.caseId,
        why: result.failure ?? result.title,
      });
    } else {
      stillAllowed.push(proposal.id);
    }
  }

  const wouldBlockApproved = wouldBlock
    .map((entry) => entry.proposalId)
    .filter((id) => approved.has(id));

  const evaluated = wouldBlock.length + stillAllowed.length;
  const summary =
    evaluated === 0
      ? `This rule does not apply to any of the ${cases.length} cases on file, so it would change nothing today.`
      : `Of ${evaluated} proposals this rule applies to, it would block ${wouldBlock.length} and allow ${stillAllowed.length}.` +
        (wouldBlockApproved.length > 0
          ? ` ${wouldBlockApproved.length} of the blocked ones were previously approved by a controller — check those before merging.`
          : ' None of the blocked ones had been approved by a controller.');

  return {
    wouldBlock,
    stillAllowed,
    wouldBlockApproved,
    totalEvaluated: evaluated,
    notApplicable,
    summary,
  };
}

/** Fixtures for a composed rule: what it catches, and what must keep passing. */
export function fixturesFor(rule: ConstrainedRule, simulation: Simulation) {
  const proposals = listProposals();
  const positives = simulation.wouldBlock.map((entry) => entry.proposalId);
  const negatives = simulation.stillAllowed
    .map((id) => proposals.find((proposal) => proposal.id === id))
    .filter((proposal): proposal is Proposal => Boolean(proposal))
    .filter((proposal) => applyConstrainedRule(rule, proposal)?.status === 'pass')
    .slice(0, 3)
    .map((proposal) => proposal.id);
  return { positives, negatives };
}
