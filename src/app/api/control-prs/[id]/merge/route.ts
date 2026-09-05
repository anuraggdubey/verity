import { NextResponse } from 'next/server';

import { mergeControlPR } from '@/lib/demo/store';

/** Controller merge of a control pack. Builder A takes this over with the engine. */
export async function POST(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const result = mergeControlPR(id);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 409 });
  return NextResponse.json({ ok: true, packVersion: result.packVersion });
}
