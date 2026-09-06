import { NextResponse } from 'next/server';

import { resetDemoWithDatabase } from '@/lib/store/ensure';

/**
 * Demo reset — restores the frozen benchmark to its initial state.
 */
export async function POST() {
  await resetDemoWithDatabase();
  return NextResponse.json({ ok: true });
}
