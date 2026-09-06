import { NextResponse } from 'next/server';

import { apiError } from '@/lib/api/errors';
import { getCase, setCaseState } from '@/lib/demo/store';
import { ensureStoreReady } from '@/lib/store/ensure';

/** Owner: Builder C. Escalate a case to senior controller review. */
export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  await ensureStoreReady();
  const { id } = await context.params;
  const caseRow = getCase(id);
  if (!caseRow) return apiError(404, 'CASE_NOT_FOUND', `Unknown case ${id}.`);

  setCaseState(id, 'escalated');
  return NextResponse.json({ ok: true, caseId: id });
}
