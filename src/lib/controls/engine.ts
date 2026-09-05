import { readFileSync } from 'node:fs';
import path from 'node:path';

import type {
  ConstrainedRule,
  ControlReport,
  ControlResult,
  Proposal,
} from '@/lib/contracts/types';
import {
  getBankLine,
  getSupportingDocument,
  listControlPRs,
  listFxObservations,
  listLedgerEntries,
  listSupportingDocuments,
  packVersion,
} from '@/lib/demo/store';

/**
 * Deterministic control engine.
 *
 * OWNERSHIP: Builder A per IMPLEMENTATION.md §2. Builder B wrote this cut-down
 * version because the block → feedback → repair loop cannot exist without a real
 * evaluator. It implements the checks the demo exercises, not the full families;
 * A replaces it with the complete pack and keeps the signature.
 *
 * Two layers:
 *   1. Built-in checks — pack v1.
 *   2. Constrained rules merged from Control PRs — everything above v1.
 * A rule the engine cannot evaluate warns; it never silently passes.
 */

type PolicyPack = {
  policyVersion: string;
  entities: string[];
  functionalCurrency: string;
  openPeriods: string[];
  closedPeriods: string[];
  chartOfAccounts: Record<string, string>;
  fx: {
    approvedSources: string[];
    requiredRateType: string;
    requiredRateDate: string;
    rateDateToleranceDays: number;
  };
  materiality: { immaterialBelow: number; criticalAtOrAbove: number };
  autoClearDispositions: string[];
  amountToleranceMinorUnits: number;
};

const POLICY_PATH = path.join(process.cwd(), 'bench', 'fixtures', 'policy.pack.json');

export function policyPack(): PolicyPack {
  return JSON.parse(readFileSync(POLICY_PATH, 'utf8')) as PolicyPack;
}

const money = (n: number) => n.toFixed(2);

/* ------------------------------------------------------------ evidence lineage */

function evidenceLineage(proposal: Proposal): ControlResult[] {
  const results: ControlResult[] = [];
  const cited = proposal.citations;

  // EV-001 — every material claim carries a citation.
  const missing: string[] = [];
  if (cited.length === 0) missing.push('the disposition itself');
  if (proposal.journal.length > 0 && !cited.some((c) => c.sourceType === 'bank_line')) {
    missing.push('the settled bank amount');
  }
  if (proposal.fx && !cited.some((c) => c.sourceType === 'fx_observation')) {
    missing.push('the FX rate used to convert the invoice');
  }
  results.push(
    missing.length === 0
      ? { code: 'VERITY-EV-001', family: 'evidence_lineage', status: 'pass', title: 'Every material claim carries a citation' }
      : {
          code: 'VERITY-EV-001',
          family: 'evidence_lineage',
          status: 'blocked',
          title: 'Every material claim carries a citation',
          claim: proposal.narrative.slice(0, 240),
          failure: `No citation supports ${missing.join(' or ')}. An uncited narrative is not evidence.`,
          requiredRepair: `Cite the exact source record for ${missing.join(' and ')}, then resubmit.`,
        },
  );

  // EV-002 — cited records resolve.
  const unresolved = cited.filter((c) => !resolveSource(c.sourceType, c.sourceId));
  results.push(
    unresolved.length === 0
      ? { code: 'VERITY-EV-002', family: 'evidence_lineage', status: 'pass', title: 'Cited records resolve' }
      : {
          code: 'VERITY-EV-002',
          family: 'evidence_lineage',
          status: 'blocked',
          title: 'Cited records resolve',
          claim: unresolved.map((c) => c.claim).join(' / ').slice(0, 240),
          failure: `These cited records do not exist: ${unresolved.map((c) => c.sourceId).join(', ')}.`,
          requiredRepair: 'Retrieve the record with a tool before citing it, and cite the identifier the tool returned.',
        },
  );

  // EV-003 — cited FX observation agrees with the rate actually used.
  if (proposal.fx) {
    const fxCitation = cited.find((c) => c.sourceType === 'fx_observation');
    const observation = fxCitation
      ? listFxObservations().find((o) => o.id === fxCitation.sourceId)
      : undefined;
    if (observation) {
      const mismatches: string[] = [];
      if (Math.abs(observation.rate - proposal.fx.rate) > 1e-9) {
        mismatches.push(`rate ${proposal.fx.rate} vs observed ${observation.rate}`);
      }
      if (observation.rateDate !== proposal.fx.rateDate) {
        mismatches.push(`rate date ${proposal.fx.rateDate} vs observed ${observation.rateDate}`);
      }
      if (observation.sourceId !== proposal.fx.sourceId) {
        mismatches.push(`source ${proposal.fx.sourceId} vs observed ${observation.sourceId}`);
      }
      results.push(
        mismatches.length === 0
          ? { code: 'VERITY-EV-003', family: 'evidence_lineage', status: 'pass', title: 'Cited amount, currency and date agree with source' }
          : {
              code: 'VERITY-EV-003',
              family: 'evidence_lineage',
              status: 'blocked',
              title: 'Cited amount, currency and date agree with source',
              claim: `FX ${proposal.fx.rate} ${proposal.fx.rateType} dated ${proposal.fx.rateDate} from ${proposal.fx.sourceId}.`,
              failure: `The cited observation ${observation.id} does not match the values used: ${mismatches.join('; ')}.`,
              requiredRepair: 'Use the values from the observation you cite, or cite the observation you actually used.',
            },
      );
    }
  }

  // EV-004 — missing evidence forces review or escalation rather than a posting.
  if (proposal.disposition === 'insufficient_evidence' && proposal.journal.length > 0) {
    results.push({
      code: 'VERITY-EV-004',
      family: 'evidence_lineage',
      status: 'blocked',
      title: 'Missing evidence forces review or escalation',
      claim: 'Evidence is insufficient, yet journal lines were proposed.',
      failure: 'A proposal that admits insufficient evidence cannot also post to the ledger.',
      requiredRepair: 'Withdraw the journal lines and escalate, or retrieve the missing evidence and re-evidence the disposition.',
    });
  } else if (proposal.disposition === 'insufficient_evidence') {
    results.push({
      code: 'VERITY-EV-004',
      family: 'evidence_lineage',
      status: 'warn',
      title: 'Missing evidence forces review or escalation',
      claim: 'No retrievable supporting document for this item.',
      failure: 'Evidence is absent, so no disposition can be evidenced.',
      requiredRepair: 'Route to escalation and request the missing document from treasury.',
    });
  }

  return results;
}

function resolveSource(sourceType: string, id: string): boolean {
  switch (sourceType) {
    case 'bank_line':
      return Boolean(getBankLine(id));
    case 'ledger_entry':
      return listLedgerEntries().some((e) => e.id === id);
    case 'document':
      return Boolean(getSupportingDocument(id));
    case 'fx_observation':
      return listFxObservations().some((o) => o.id === id);
    default:
      return false;
  }
}

/* ------------------------------------------------------- accounting integrity */

function accountingIntegrity(proposal: Proposal, policy: PolicyPack): ControlResult[] {
  const results: ControlResult[] = [];
  const lines = proposal.journal;

  const debits = lines.reduce((s, l) => s + l.debit, 0);
  const credits = lines.reduce((s, l) => s + l.credit, 0);
  const balanced = Math.abs(debits - credits) < 0.005;
  results.push(
    balanced
      ? { code: 'VERITY-AI-001', family: 'accounting_integrity', status: 'pass', title: 'Total debits equal total credits' }
      : {
          code: 'VERITY-AI-001',
          family: 'accounting_integrity',
          status: 'blocked',
          title: 'Total debits equal total credits',
          claim: `Debits ${money(debits)} and credits ${money(credits)}.`,
          failure: `The entry is out of balance by ${money(Math.abs(debits - credits))}.`,
          requiredRepair: 'Recalculate the entry so total debits equal total credits, then resubmit.',
        },
  );

  const unknownAccounts = lines.map((l) => l.account).filter((a) => !(a in policy.chartOfAccounts));
  results.push(
    unknownAccounts.length === 0
      ? { code: 'VERITY-AI-002', family: 'accounting_integrity', status: 'pass', title: 'Accounts exist in the permitted chart' }
      : {
          code: 'VERITY-AI-002',
          family: 'accounting_integrity',
          status: 'blocked',
          title: 'Accounts exist in the permitted chart',
          claim: `Posted to ${unknownAccounts.join(', ')}.`,
          failure: `These accounts are not in the permitted chart: ${unknownAccounts.join(', ')}.`,
          requiredRepair: `Use an account from the permitted chart: ${Object.keys(policy.chartOfAccounts).join(', ')}.`,
        },
  );

  const badEntity = lines.filter((l) => !policy.entities.includes(l.entity));
  const badCurrency = lines.filter((l) => l.currency !== policy.functionalCurrency);
  const closedPeriod = lines.filter((l) => policy.closedPeriods.includes(l.period));
  const unknownPeriod = lines.filter(
    (l) => !policy.openPeriods.includes(l.period) && !policy.closedPeriods.includes(l.period),
  );
  const problems = [
    ...badEntity.map((l) => `entity ${l.entity}`),
    ...badCurrency.map((l) => `currency ${l.currency}`),
    ...closedPeriod.map((l) => `closed period ${l.period}`),
    ...unknownPeriod.map((l) => `unknown period ${l.period}`),
  ];
  results.push(
    problems.length === 0
      ? { code: 'VERITY-AI-003', family: 'accounting_integrity', status: 'pass', title: 'Entity, currency and period are valid and open' }
      : {
          code: 'VERITY-AI-003',
          family: 'accounting_integrity',
          status: 'blocked',
          title: 'Entity, currency and period are valid and open',
          claim: `Journal lines carry ${[...new Set(problems)].join(', ')}.`,
          failure: `Not permitted: ${[...new Set(problems)].join(', ')}. Entries cannot be proposed into a closed period.`,
          requiredRepair: `Post to entity ${policy.entities.join(' or ')} in ${policy.functionalCurrency} within an open period (${policy.openPeriods.join(', ')}).`,
        },
  );

  // AI-005 — duplicate detection is advisory in v1 and says so.
  const bankLineId = proposal.citations.find((c) => c.sourceType === 'bank_line')?.sourceId;
  const bankLine = bankLineId ? getBankLine(bankLineId) : undefined;
  // A timing difference is the same payment surfacing in another period, so the
  // duplicate advisory does not apply to it.
  const alreadyPosted = bankLine && proposal.disposition !== 'timing_difference'
    ? listLedgerEntries().find(
        (e) =>
          e.posted &&
          e.account === '1010' &&
          e.reference === bankLine.reference &&
          Math.abs(e.amount - bankLine.amount) < 0.005,
      )
    : undefined;
  if (alreadyPosted) {
    results.push({
      code: 'VERITY-AI-005',
      family: 'accounting_integrity',
      status: 'warn',
      title: 'Entry is not a duplicate of a posted record',
      claim: `${bankLine?.id} carries the same reference and amount as posted entry ${alreadyPosted.id}.`,
      failure: 'Duplicate detection is advisory in pack v1 and cannot confirm intent from reference matching alone.',
      requiredRepair: 'Controller must confirm the duplicate before the item is dispositioned.',
    });
  } else {
    results.push({
      code: 'VERITY-AI-005',
      family: 'accounting_integrity',
      status: 'pass',
      title: 'Entry is not a duplicate of a posted record',
    });
  }

  return results;
}

/* --------------------------------------------- policy and market-data provenance */

function policyProvenance(proposal: Proposal, policy: PolicyPack): ControlResult[] {
  const results: ControlResult[] = [];

  if (proposal.fx) {
    const { sourceId, rateDate, rateType, rate } = proposal.fx;
    const approvedSource = policy.fx.approvedSources.includes(sourceId);
    const observation = listFxObservations().find(
      (o) => o.sourceId === sourceId && o.rateDate === rateDate && Math.abs(o.rate - rate) < 1e-9,
    );
    const observationApproved = observation?.approved === true;

    results.push(
      approvedSource && observationApproved
        ? { code: 'VERITY-FX-003', family: 'policy_provenance', status: 'pass', title: 'FX rate comes from an approved source' }
        : {
            code: 'VERITY-FX-003',
            family: 'policy_provenance',
            status: 'blocked',
            title: 'FX rate comes from an approved source',
            claim: `Converted at ${rate} ${rateType} dated ${rateDate}, sourced from ${sourceId}.`,
            failure: observation
              ? `The cited FX observation ${observation.id} is from ${sourceId}, which is not in the approved-source allowlist (${policy.fx.approvedSources.join(', ')}).`
              : `No approved FX observation exists for ${sourceId} at ${rate} on ${rateDate}.`,
            requiredRepair: `Retrieve an approved ${policy.fx.requiredRateType} rate from ${policy.fx.approvedSources.join(' or ')} for the invoice transaction date, recalculate the entry, and cite the exact observation.`,
          },
    );

    if (rateType !== policy.fx.requiredRateType) {
      results.push({
        code: 'VERITY-FX-004',
        family: 'policy_provenance',
        status: 'blocked',
        title: 'FX rate type matches policy',
        claim: `Used a ${rateType} rate.`,
        failure: `Policy requires the ${policy.fx.requiredRateType} rate; a ${rateType} rate was used.`,
        requiredRepair: `Retrieve the ${policy.fx.requiredRateType} rate for the transaction date and recalculate.`,
      });
    } else {
      results.push({ code: 'VERITY-FX-004', family: 'policy_provenance', status: 'pass', title: 'FX rate type matches policy' });
    }
  }

  // FX-006 — auto-clearable dispositions must be non-posting.
  const claimsAutoClearable = policy.autoClearDispositions.includes(proposal.disposition);
  results.push(
    claimsAutoClearable && proposal.journal.length > 0
      ? {
          code: 'VERITY-FX-006',
          family: 'policy_provenance',
          status: 'blocked',
          title: 'Auto-clear restricted to enumerated non-posting dispositions',
          claim: `Disposition ${proposal.disposition} with ${proposal.journal.length} journal lines.`,
          failure: `${proposal.disposition} is an auto-clearable disposition and must not post to the ledger.`,
          requiredRepair: 'Either withdraw the journal lines, or choose the disposition that matches the accounting you intend.',
        }
      : { code: 'VERITY-FX-006', family: 'policy_provenance', status: 'pass', title: 'Auto-clear restricted to enumerated non-posting dispositions' },
  );

  return results;
}

/* ------------------------------------------------------- constrained rules (v2+) */

function selectorValue(selector: string, proposal: Proposal): string | number | undefined {
  switch (selector) {
    case 'fx.rateDate':
      return proposal.fx?.rateDate;
    case 'fx.rateType':
      return proposal.fx?.rateType;
    case 'fx.sourceId':
      return proposal.fx?.sourceId;
    case 'fx.rate':
      return proposal.fx?.rate;
    case 'disposition':
      return proposal.disposition;
    default:
      return undefined;
  }
}

function compareValue(compareTo: string, proposal: Proposal): string | number | undefined {
  if (compareTo === 'document.transactionDate') {
    const citation = proposal.citations.find((c) => c.sourceType === 'document');
    if (!citation) return undefined;
    const doc = listSupportingDocuments().find((d) => d.id === citation.sourceId);
    const value = doc?.fields?.transactionDate;
    return typeof value === 'string' || typeof value === 'number' ? value : undefined;
  }
  if (compareTo === 'bank_line.postedDate') {
    const citation = proposal.citations.find((c) => c.sourceType === 'bank_line');
    return citation ? getBankLine(citation.sourceId)?.postedDate : undefined;
  }
  return compareTo;
}

const SUPPORTED_SELECTORS = ['fx.rateDate', 'fx.rateType', 'fx.sourceId', 'fx.rate', 'disposition'];

export function applyConstrainedRule(rule: ConstrainedRule, proposal: Proposal): ControlResult | undefined {
  if (!SUPPORTED_SELECTORS.includes(rule.selector)) {
    return {
      code: rule.onFail.code,
      family: rule.family,
      status: 'warn',
      title: rule.onFail.title,
      failure: `The engine cannot evaluate selector "${rule.selector}", so this rule was not enforced.`,
      requiredRepair: 'A controller must review this proposal manually until the selector is supported.',
    };
  }

  const actual = selectorValue(rule.selector, proposal);
  // Rule does not apply to this proposal at all (e.g. an FX rule on a non-FX case).
  if (actual === undefined && rule.comparator !== 'exists') return undefined;

  const expected = rule.compareTo ? compareValue(rule.compareTo, proposal) : undefined;
  const fail = (failure: string): ControlResult => ({
    code: rule.onFail.code,
    family: rule.family,
    status: 'blocked',
    title: rule.onFail.title,
    claim: `${rule.selector} = ${String(actual)}`,
    failure,
    requiredRepair: rule.onFail.requiredRepair,
  });
  const pass: ControlResult = {
    code: rule.onFail.code,
    family: rule.family,
    status: 'pass',
    title: rule.onFail.title,
  };

  switch (rule.comparator) {
    case 'exists':
      return actual === undefined ? fail(`${rule.selector} is missing.`) : pass;
    case 'equals': {
      if (expected === undefined) {
        return {
          code: rule.onFail.code,
          family: rule.family,
          status: 'warn',
          title: rule.onFail.title,
          failure: `Nothing to compare against: ${rule.compareTo} could not be resolved from the cited evidence.`,
          requiredRepair: rule.onFail.requiredRepair,
        };
      }
      if (rule.tolerance?.unit === 'days' && typeof actual === 'string' && typeof expected === 'string') {
        const diffDays = Math.abs(
          (Date.parse(actual) - Date.parse(expected)) / (1000 * 60 * 60 * 24),
        );
        return diffDays <= rule.tolerance.value
          ? pass
          : fail(
              `${rule.selector} ${actual} differs from ${rule.compareTo} ${expected} by ${diffDays} day(s); the permitted tolerance is ${rule.tolerance.value}.`,
            );
      }
      return actual === expected
        ? pass
        : fail(`${rule.selector} ${String(actual)} does not equal ${rule.compareTo} ${String(expected)}.`);
    }
    case 'not_equals':
      return actual !== expected ? pass : fail(`${rule.selector} must not equal ${String(expected)}.`);
    default:
      return {
        code: rule.onFail.code,
        family: rule.family,
        status: 'warn',
        title: rule.onFail.title,
        failure: `The engine cannot evaluate comparator "${rule.comparator}", so this rule was not enforced.`,
        requiredRepair: 'A controller must review this proposal manually until the comparator is supported.',
      };
  }
}

/* ------------------------------------------------------------------ public API */

export function mergedRules(): ConstrainedRule[] {
  return listControlPRs()
    .filter((pr) => pr.status === 'merged')
    .map((pr) => pr.rule);
}

export function evaluateProposal(
  proposal: Proposal,
  options?: { rules?: ConstrainedRule[]; packVersion?: string },
): ControlReport {
  const policy = policyPack();
  const rules = options?.rules ?? mergedRules();

  const results: ControlResult[] = [
    ...evidenceLineage(proposal),
    ...accountingIntegrity(proposal, policy),
    ...policyProvenance(proposal, policy),
  ];

  for (const rule of rules) {
    const result = applyConstrainedRule(rule, proposal);
    if (result) results.push(result);
  }

  return {
    proposalId: proposal.id,
    packVersion: options?.packVersion ?? packVersion(),
    results,
    blocked: results.some((r) => r.status === 'blocked'),
    evaluatedAt: new Date().toISOString(),
  };
}
