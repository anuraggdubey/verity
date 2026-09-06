import { NextResponse } from 'next/server';

import { listCases, reconciliationStatus } from '@/lib/demo/store';

export async function GET() {
  return NextResponse.json({ ok: true, cases: listCases(), reconciliation: reconciliationStatus() });
}
