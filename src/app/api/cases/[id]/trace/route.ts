import { NextResponse } from 'next/server';

import { getTracesForCase } from '@/lib/trace/trace';

/** Owner: Builder B. Tool calls, model calls, blocks and retries for one case. */
export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return NextResponse.json({ caseId: id, entries: getTracesForCase(id) });
}
