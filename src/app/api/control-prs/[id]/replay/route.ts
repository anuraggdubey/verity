import { NextResponse } from 'next/server';

import { replayControlPR } from '@/lib/demo/store';

/**
 * Replay. Builder A owns the real implementation against the control engine;
 * this reads the fixture replay so the governance screen is drivable today.
 */
export async function POST(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const pr = replayControlPR(id);
  if (!pr) return NextResponse.json({ error: 'Unknown control PR' }, { status: 404 });
  return NextResponse.json({ ok: true, replay: pr.replay });
}
