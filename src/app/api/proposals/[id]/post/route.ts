import { NextResponse } from 'next/server';

import { apiError } from '@/lib/api/errors';
import { postApprovedProposal } from '@/lib/demo/store';

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const result = postApprovedProposal(id);
  if (!result.ok) {
    const status = result.error.startsWith('Unknown') ? 404 : result.error.includes('no journal') ? 422 : 409;
    return apiError(status, 'POSTING_REJECTED', result.error);
  }
  return NextResponse.json({ ok: true, record: result.record, existing: result.existing });
}
