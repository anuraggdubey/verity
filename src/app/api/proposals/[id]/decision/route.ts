import { NextResponse } from 'next/server';

import type { RejectReasonCode } from '@/lib/contracts/types';
import { recordControllerDecision } from '@/lib/demo/store';

/** Owner: Builder C. Controller merge gate. */
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = (await request.json()) as {
    decision?: 'approve' | 'reject';
    reasonCode?: RejectReasonCode;
    rationale?: string;
  };

  if (body.decision !== 'approve' && body.decision !== 'reject') {
    return NextResponse.json({ error: 'decision must be approve or reject' }, { status: 400 });
  }

  const result = recordControllerDecision({
    proposalId: id,
    decision: body.decision,
    reasonCode: body.reasonCode,
    rationale: body.rationale,
  });

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 409 });
  return NextResponse.json({ ok: true, caseId: result.caseId });
}
