import { NextResponse } from 'next/server';

import { reconciliationStatus } from '@/lib/demo/store';

export async function POST() {
  const status = reconciliationStatus();
  return NextResponse.json({ ok: status.closed, status }, { status: status.closed ? 200 : 409 });
}
