import { NextResponse } from 'next/server';

import { buildDashboardMetrics } from '@/lib/metrics/dashboard';
import { ensureStoreReady } from '@/lib/store/ensure';

/** Owner: Builder C. Raw counts for the benchmark dashboard. */
export async function GET() {
  await ensureStoreReady();
  return NextResponse.json(buildDashboardMetrics());
}
