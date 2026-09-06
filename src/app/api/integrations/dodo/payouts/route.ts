import { NextResponse } from 'next/server';

import { dodoConfig, listPayouts, payoutsAsBankLines, unsettledPayouts } from '@/lib/integrations/dodo';

/**
 * Read-only preview of processor payouts as normalized bank lines.
 *
 * GET only, and the connector underneath is GET only. Nothing here creates,
 * refunds or moves a payment. When no key is configured the route explains
 * that rather than pretending to have data.
 */
export async function GET(request: Request) {
  const configured = dodoConfig();
  if (!configured.ok) {
    return NextResponse.json({ enabled: false, reason: configured.reason }, { status: 200 });
  }

  const params = new URL(request.url).searchParams;
  const result = await listPayouts({
    pageNumber: Number(params.get('page') ?? '0'),
    pageSize: Number(params.get('size') ?? '20'),
  });

  if (!result.ok) {
    return NextResponse.json({ enabled: true, error: result.reason }, { status: 502 });
  }

  return NextResponse.json({
    enabled: true,
    mode: result.mode,
    payoutCount: result.payouts.length,
    bankLines: payoutsAsBankLines(result.payouts),
    skipped: unsettledPayouts(result.payouts),
    note: 'Settled payouts only. These are candidate statement lines for reconciliation; nothing is posted.',
  });
}
