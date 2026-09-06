import { NextResponse } from 'next/server';

import { reconciliationStatus } from '@/lib/demo/store';
import { ensureStoreReady } from '@/lib/store/ensure';

export async function POST() {
  await ensureStoreReady();
  const status = reconciliationStatus();
  return NextResponse.json({ ok: status.closed, status }, { status: status.closed ? 200 : 409 });
}
