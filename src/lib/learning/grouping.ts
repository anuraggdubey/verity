import type { Proposal, RejectReasonCode } from '@/lib/contracts/types';
import {
  listControllerDecisions,
  listProposals,
  listSupportingDocuments,
} from '@/lib/demo/store';

/**
 * Reviewer-grounded failure grouping.
 *
 * The grouping key is the controller's own enumerated reason code — not a
 * cluster the system invented. Free-text rationales are used only to measure
 * whether a group is coherent, and the shared traits are read off the proposals
 * themselves. Two supporting failures minimum; one rejection is an incident, not
 * a pattern.
 *
 * There is no autonomous clustering claim here. A controller decided each of
 * these, and the group is a count of their decisions.
 */

export const MIN_SUPPORT = 2;

export type FailureGroup = {
  id: string;
  reasonCode: RejectReasonCode;
  proposalIds: string[];
  caseIds: string[];
  rationales: string[];
  /** Mean pairwise Jaccard overlap of rationale wording, 0–1. Diagnostic only. */
  coherence: number;
  /** Facts true of every proposal in the group, read from the proposals. */
  sharedTraits: string[];
};

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'of', 'to', 'in',
  'on', 'at', 'for', 'with', 'that', 'this', 'it', 'as', 'from', 'by', 'not', 'than', 'rather',
  'also', 'same', 'its', 'it,',
]);

function tokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s.-]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 2 && !STOPWORDS.has(word)),
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const token of a) if (b.has(token)) shared += 1;
  return shared / (a.size + b.size - shared);
}

function meanPairwiseCoherence(rationales: string[]): number {
  const sets = rationales.map(tokens);
  if (sets.length < 2) return 0;
  let total = 0;
  let pairs = 0;
  for (let i = 0; i < sets.length; i += 1) {
    for (let j = i + 1; j < sets.length; j += 1) {
      total += jaccard(sets[i], sets[j]);
      pairs += 1;
    }
  }
  return pairs === 0 ? 0 : Math.round((total / pairs) * 100) / 100;
}

function transactionDateOf(proposal: Proposal): string | undefined {
  const citation = proposal.citations?.find((c) => c.sourceType === 'document');
  if (!citation) return undefined;
  const value = listSupportingDocuments().find((d) => d.id === citation.sourceId)?.fields
    ?.transactionDate;
  return typeof value === 'string' ? value : undefined;
}

function sharedTraits(proposals: Proposal[]): string[] {
  const traits: string[] = [];
  if (proposals.length === 0) return traits;

  const dispositions = new Set(proposals.map((p) => p.disposition));
  if (dispositions.size === 1) traits.push(`every proposal used disposition ${[...dispositions][0]}`);

  if (proposals.every((p) => p.fx)) {
    traits.push('every proposal carried an FX conversion');

    const sources = new Set(proposals.map((p) => p.fx!.sourceId));
    if (sources.size === 1) traits.push(`every rate came from ${[...sources][0]}`);

    const types = new Set(proposals.map((p) => p.fx!.rateType));
    if (types.size === 1) traits.push(`every rate was a ${[...types][0]} rate`);

    const dateMismatch = proposals.every((p) => {
      const transactionDate = transactionDateOf(p);
      return transactionDate !== undefined && transactionDate !== p.fx!.rateDate;
    });
    if (dateMismatch) {
      traits.push('in every proposal the FX rate date differed from the invoice transaction date');
    }

    const relievedInFull = proposals.every(
      (p) => !p.journal?.some((line) => line.account === '7420'),
    );
    if (relievedInFull) traits.push('no proposal recognized a realized FX gain or loss');
  }

  return traits;
}

export function groupReviewerRejections(minSupport: number = MIN_SUPPORT): FailureGroup[] {
  const proposals = listProposals();
  const rejections = listControllerDecisions().filter(
    (decision) => decision.decision === 'reject' && decision.reasonCode,
  );

  const byReason = new Map<RejectReasonCode, typeof rejections>();
  for (const rejection of rejections) {
    const code = rejection.reasonCode as RejectReasonCode;
    byReason.set(code, [...(byReason.get(code) ?? []), rejection]);
  }

  const groups: FailureGroup[] = [];
  for (const [reasonCode, members] of byReason) {
    if (members.length < minSupport) continue;
    const memberProposals = members
      .map((member) => proposals.find((p) => p.id === member.proposalId))
      .filter((p): p is Proposal => Boolean(p));
    const rationales = members.map((m) => m.rationale ?? '').filter(Boolean);

    groups.push({
      id: `GRP-${reasonCode}`,
      reasonCode,
      proposalIds: members.map((m) => m.proposalId),
      caseIds: members.map((m) => m.caseId),
      rationales,
      coherence: meanPairwiseCoherence(rationales),
      sharedTraits: sharedTraits(memberProposals),
    });
  }

  return groups.sort((a, b) => b.proposalIds.length - a.proposalIds.length);
}
