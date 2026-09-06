import { NextResponse } from 'next/server';

import { resetDemo } from '@/lib/store';

/**
 * Demo reset — restores the frozen benchmark to its initial state.
 */
export async function POST() {
  resetDemo();
  return NextResponse.json({ ok: true });
}
