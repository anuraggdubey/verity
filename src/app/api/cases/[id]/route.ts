import { NextResponse } from 'next/server';

import { apiError } from '@/lib/api/errors';
import { getCaseDetail } from '@/lib/demo/store';
import { ensureStoreReady } from '@/lib/store/ensure';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  await ensureStoreReady();
  const { id } = await context.params;
  const detail = getCaseDetail(id);
  return detail ? NextResponse.json({ ok: true, ...detail }) : apiError(404, 'CASE_NOT_FOUND', `Unknown case ${id}.`);
}
