import { NextResponse } from 'next/server';

import { listCases, reconciliationStatus } from '@/lib/demo/store';
import { ensureStoreReady } from '@/lib/store/ensure';

export async function GET() {
  await ensureStoreReady();
  return NextResponse.json({ ok: true, cases: listCases(), reconciliation: reconciliationStatus() });
}
