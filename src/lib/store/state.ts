import type { Case, Proposal } from '@/lib/contracts/types';

export function appendImmutableProposal(proposals: Proposal[], cases: Case[], proposal: Proposal): void {
  if (proposals.some((item) => item.id === proposal.id)) throw new Error(`Proposal ${proposal.id} already exists`);
  const financeCase = cases.find((item) => item.id === proposal.caseId);
  if (!financeCase) throw new Error(`Unknown case ${proposal.caseId}`);
  const expectedRevision = financeCase.revisions.length + 1;
  if (proposal.revision !== expectedRevision) throw new Error(`Expected revision ${expectedRevision}, received ${proposal.revision}`);
  proposals.push(structuredClone(proposal));
  financeCase.revisions.push(proposal.id);
}
