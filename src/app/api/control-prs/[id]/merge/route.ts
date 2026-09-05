import { NextResponse } from 'next/server';

import { getControlPR, mergeControlPR } from '@/lib/demo/store';
import { replayIsMergeable } from '@/lib/learning/replay-runner';

/** Controller merge of a control pack version. */
export async function POST(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const pr = getControlPR(id);
  if (!pr) return NextResponse.json({ error: 'Unknown control PR' }, { status: 404 });
  if (!pr.replay) {
    return NextResponse.json(
      { error: 'Replay must run before a control pack can be merged' },
      { status: 409 },
    );
  }

  const mergeable = replayIsMergeable(pr.replay);
  if (!mergeable.ok) return NextResponse.json({ error: mergeable.reason }, { status: 409 });

  const result = mergeControlPR(id);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 409 });
  return NextResponse.json({ ok: true, packVersion: result.packVersion });
}
