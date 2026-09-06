import { NextResponse } from 'next/server';

import { getCaseDetail } from '@/lib/demo/store';
import { ensureStoreReady } from '@/lib/store/ensure';

/** Owner: Builder C. Exportable Finance PR JSON. */
export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  await ensureStoreReady();
  const { id } = await ctx.params;
  const detail = getCaseDetail(id);
  if (!detail) return NextResponse.json({ error: 'Unknown case' }, { status: 404 });

  return new NextResponse(JSON.stringify(detail, null, 2), {
    headers: {
      'content-type': 'application/json',
      'content-disposition': `attachment; filename="finance-pr-${id}.json"`,
    },
  });
}
