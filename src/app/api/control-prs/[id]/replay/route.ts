import { NextResponse } from 'next/server';

import { getControlPR, setControlPRReplay } from '@/lib/demo/store';
import { runReplay } from '@/lib/learning/replay-runner';

/**
 * Owner: Builder B (replay runner) over Builder A's control engine.
 * Re-evaluates the stored proposals under the current pack plus the proposed
 * rule: positives must now be caught, counterexamples must still be allowed.
 */
export async function POST(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const pr = getControlPR(id);
  if (!pr) return NextResponse.json({ error: 'Unknown control PR' }, { status: 404 });

  const replay = runReplay(pr);
  const stored = setControlPRReplay(id, replay);
  if (!stored.ok) return NextResponse.json({ error: stored.error }, { status: 409 });

  return NextResponse.json({ ok: true, replay });
}
