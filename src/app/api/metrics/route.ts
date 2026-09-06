import { NextResponse } from 'next/server';

import { buildDashboardMetrics } from '@/lib/metrics/dashboard';

/** Owner: Builder C. Raw counts for the benchmark dashboard. */
export async function GET() {
  return NextResponse.json(buildDashboardMetrics());
}
