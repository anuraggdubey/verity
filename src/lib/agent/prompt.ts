import { createHash } from 'node:crypto';

import { policyPack } from '@/lib/controls/engine';
import type { Case, ControlReport } from '@/lib/contracts/types';
import { getBankLine } from '@/lib/demo/store';

/**
 * The core prompt is part of the replay fingerprint, so it is built here and
 * hashed here. Changing it after the benchmark freezes invalidates every metric,
 * which is why the hash travels with each proposal.
 *
 * It states the policy and the tools. It does NOT state expected dispositions,
 * and nothing from bench/expected.json may ever appear in a prompt.
 */

export function corePrompt(): string {
  const policy = policyPack();
  return [
    'You are a reconciliation preparer working one bank reconciliation exception in isolation.',
    'You investigate with tools, then submit exactly one structured proposal. You never post to a ledger; a human controller decides that.',
    '',
    'Accounting policy in force:',
    `- Entity ${policy.entities.join(', ')}, functional currency ${policy.functionalCurrency}.`,
    `- Open periods: ${policy.openPeriods.join(', ')}. Closed periods (never propose into these): ${policy.closedPeriods.join(', ')}.`,
    `- Permitted accounts: ${Object.entries(policy.chartOfAccounts).map(([code, name]) => `${code} ${name}`).join('; ')}.`,
    `- Foreign currency: use the ${policy.fx.requiredRateType} rate observed on the invoice transaction date, from an approved provider (${policy.fx.approvedSources.join(', ')}). Rate-date tolerance is ${policy.fx.rateDateToleranceDays} day(s).`,
    '- When a foreign-currency invoice settles for a different functional-currency amount than its carrying value, the difference is a realized FX gain or loss. It is not an adjustment to payables.',
    `- These dispositions are non-posting and must carry an empty journal: ${policy.autoClearDispositions.join(', ')}.`,
    '',
    'How to work:',
    '1. Retrieve the bank line.',
    '2. Search the ledger for entries that could correspond to it.',
    '3. Retrieve any supporting document, and read its transaction date.',
    '4. If currencies differ, look up FX observations and choose one that policy permits. Observations from unapproved sources are visible to you but are not permitted as evidence.',
    '5. Call submit_proposal once.',
    '',
    'Rules that will be checked deterministically after you submit:',
    '- Every material claim needs a citation to a record you actually retrieved. An uncited narrative is not evidence.',
    '- Total debits must equal total credits.',
    '- Accounts, entity, currency and period must be permitted and open.',
    '- FX rate, rate date and source must match the observation you cite and must satisfy policy.',
    '',
    'If the evidence does not support any disposition, choose insufficient_evidence with an empty journal and say what is missing. Abstaining is a correct outcome; guessing is not.',
  ].join('\n');
}

export function corePromptHash(): string {
  return `sha256:${createHash('sha256').update(corePrompt()).digest('hex').slice(0, 8)}`;
}

/** The case packet. Contains the exception, never the expected answer. */
export function casePacket(finance: Case): string {
  const bankLine = getBankLine(finance.bankLineId);
  return [
    `Case ${finance.id}.`,
    `Bank line ${finance.bankLineId}${bankLine ? `: ${bankLine.postedDate} ${bankLine.amount.toFixed(2)} ${bankLine.currency} ${bankLine.counterparty} ref "${bankLine.reference}" — ${bankLine.description}` : ''}`,
    finance.candidateLedgerIds.length > 0
      ? `Deterministic matching suggested these candidate ledger entries: ${finance.candidateLedgerIds.join(', ')}. Verify before relying on them.`
      : 'Deterministic matching found no candidate ledger entry.',
    '',
    'Investigate this exception and submit one proposal.',
  ].join('\n');
}

/**
 * Structured repair feedback. This is the control engine's own text — code,
 * claim, failure, required repair — handed back verbatim. Do not paraphrase it:
 * the controller and the agent must be reading the same words.
 */
export function repairMessage(report: ControlReport): string {
  const blocked = report.results.filter((result) => result.status === 'blocked');
  const lines = [
    `Your proposal was BLOCKED by control pack ${report.packVersion}. It was not recorded as a decision.`,
    '',
  ];

  for (const result of blocked) {
    lines.push(
      `${result.code}`,
      'Status: BLOCKED',
      '',
      `Claim:`,
      result.claim ?? '(none recorded)',
      '',
      'Failure:',
      result.failure ?? '(none recorded)',
      '',
      'Required repair:',
      result.requiredRepair ?? '(none recorded)',
      '',
      '---',
      '',
    );
  }

  lines.push(
    'Retrieve whatever you need with the tools, then call submit_proposal again with a corrected proposal.',
    'Do not restate your previous answer. Fix the specific failure above.',
  );
  return lines.join('\n');
}

/** Schema-level rejection: the submission never became a revision. */
export function schemaErrorMessage(errors: string[]): string {
  return [
    'submit_proposal was rejected before it became a revision because it did not fit the schema:',
    ...errors.map((error) => `- ${error}`),
    '',
    'Call submit_proposal again with a valid payload.',
  ].join('\n');
}
