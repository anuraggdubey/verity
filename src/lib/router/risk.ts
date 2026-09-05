import { policyPack } from '@/lib/controls/engine';
import type { Case, ControlReport, Proposal, RouteDecision } from '@/lib/contracts/types';

/**
 * Strict Auto / Review / Escalate router.
 *
 * Auto-clear is the narrow lane, not the default: an enumerated non-posting
 * disposition, a clean control report with no warnings, an immaterial amount,
 * and a case the matcher marked auto-clearable. Everything that posts goes to a
 * controller. Anything missing, contradictory or critical escalates.
 */

export function routeProposal(
  proposal: Proposal,
  report: ControlReport,
  financeCase: Case,
): RouteDecision {
  const policy = policyPack();

  if (report.blocked) {
    return {
      proposalId: proposal.id,
      lane: 'escalate',
      reason: 'Controls are blocking this revision and no repair attempt remains.',
    };
  }

  const warnings = report.results.filter((result) => result.status === 'warn');
  const evidenceWarnings = warnings.filter((result) => result.family === 'evidence_lineage');

  if (
    proposal.disposition === 'insufficient_evidence' ||
    proposal.disposition === 'escalate' ||
    evidenceWarnings.length > 0
  ) {
    return {
      proposalId: proposal.id,
      lane: 'escalate',
      reason:
        evidenceWarnings.length > 0
          ? `Evidence is missing or contradictory: ${evidenceWarnings.map((w) => w.code).join(', ')}.`
          : 'The agent could not evidence a disposition.',
    };
  }

  if (financeCase.materiality === 'critical') {
    return {
      proposalId: proposal.id,
      lane: 'escalate',
      reason: 'Case is classified critical, so a controller must see it regardless of control results.',
    };
  }

  const largest = proposal.journal.reduce((max, line) => Math.max(max, line.debit, line.credit), 0);

  if (proposal.journal.length > 0) {
    return {
      proposalId: proposal.id,
      lane: 'review',
      reason: `Posting disposition (${proposal.disposition}) — every journal requires controller approval.`,
    };
  }

  const autoClearable =
    policy.autoClearDispositions.includes(proposal.disposition) &&
    financeCase.autoClearPermitted &&
    warnings.length === 0 &&
    largest < policy.materiality.immaterialBelow;

  if (autoClearable) {
    return {
      proposalId: proposal.id,
      lane: 'auto',
      reason: `${proposal.disposition} is an enumerated non-posting disposition, fully evidenced, controls clean, immaterial.`,
    };
  }

  const blockers: string[] = [];
  if (!policy.autoClearDispositions.includes(proposal.disposition)) {
    blockers.push(`${proposal.disposition} is not an enumerated auto-clear disposition`);
  }
  if (!financeCase.autoClearPermitted) blockers.push('the case is not marked auto-clearable');
  if (warnings.length > 0) blockers.push(`advisory controls flagged ${warnings.map((w) => w.code).join(', ')}`);

  return {
    proposalId: proposal.id,
    lane: 'review',
    reason: blockers.length > 0 ? `Controller judgment required: ${blockers.join('; ')}.` : 'Controller judgment required.',
  };
}
