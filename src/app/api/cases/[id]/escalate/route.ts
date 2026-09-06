import { NextResponse } from 'next/server';

import { appendEvent, getCase, listControllerDecisions, setCaseState } from '@/lib/demo/store';

/**
 * Owner: Builder B. Escalation is a routing outcome, not a controller decision —
 * it records no approve/reject and posts nothing. It parks the case with a human
 * and leaves the proposal exactly as the worker filed it.
 */
export async function POST(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const financeCase = getCase(id);
  if (!financeCase) return NextResponse.json({ error: `Unknown case ${id}` }, { status: 404 });

  if (listControllerDecisions().some((decision) => decision.caseId === id)) {
    return NextResponse.json(
      { error: `${id} already has a controller decision` },
      { status: 409 },
    );
  }

  setCaseState(id, 'escalated');
  const latest = financeCase.revisions[financeCase.revisions.length - 1];
  if (latest) {
    appendEvent({
      type: 'routed',
      at: new Date().toISOString(),
      proposalId: latest,
      lane: 'escalate',
    });
  }

  return NextResponse.json({ ok: true, caseId: id, state: 'escalated' });
}
