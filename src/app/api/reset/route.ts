import { NextResponse } from 'next/server';

import { resetDemo } from '@/lib/demo/store';

/**
 * Demo reset. Listed as Builder A's route in IMPLEMENTATION.md; C stubbed it so
 * the reset button works today. A takes it over with the real store.
 */
export async function POST() {
  resetDemo();
  return NextResponse.json({ ok: true });
}
