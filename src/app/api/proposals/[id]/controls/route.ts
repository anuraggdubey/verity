import { NextResponse } from 'next/server';

import { apiError } from '@/lib/api/errors';
import { evaluateProposal } from '@/lib/controls/engine';
import { appendControlReport, getProposal } from '@/lib/demo/store';

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const proposal = getProposal(id);
  if (!proposal) return apiError(404, 'PROPOSAL_NOT_FOUND', `Unknown proposal ${id}.`);
  const report = evaluateProposal(proposal);
  appendControlReport(report);
  return NextResponse.json({ ok: true, report });
}
