import { NextResponse } from 'next/server';

import { computeMetrics } from '@/lib/metrics/compute';

/** Owner: Builder C. Raw counts for the benchmark dashboard. */
export async function GET() {
  return NextResponse.json(computeMetrics());
}
