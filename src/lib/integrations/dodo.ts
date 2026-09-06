import type { BankLine } from '@/lib/contracts/types';

/**
 * Dodo Payments — settlement ingestion.
 *
 * What this is: a READ-ONLY connector that lists payouts and maps them to the
 * same normalized BankLine shape the matcher already consumes. A payout is
 * money a processor sent to the company's bank account, so it is exactly the
 * kind of line that shows up on a statement and has to be reconciled against
 * the ledger. That makes Dodo a source of reconciliation work, which is the
 * only role it can honestly play in this product.
 *
 * What this is NOT, and will not become: this module never creates a payment,
 * never issues a refund, never moves money and never writes anything to Dodo.
 * There is one HTTP verb in this file and it is GET.
 *
 * Mode:
 *   DODO_API_KEY=...          required to call anything
 *   DODO_MODE=test|live       defaults to test (https://test.dodopayments.com)
 *   DODO_ALLOW_LIVE=true      additionally required before live is permitted
 *
 * Live mode is double-gated on purpose: a demo should never read a real
 * merchant's settlement data by accident.
 */

const BASE_URLS = {
  test: 'https://test.dodopayments.com',
  live: 'https://live.dodopayments.com',
} as const;

export type DodoMode = keyof typeof BASE_URLS;

export type DodoConfig = {
  apiKey: string;
  mode: DodoMode;
  baseUrl: string;
};

/** Per Dodo's payouts API. Unknown extra fields are ignored, not assumed. */
export type DodoPayout = {
  payout_id: string;
  business_id: string;
  amount: number;
  currency: string;
  status: 'not_initiated' | 'in_progress' | 'on_hold' | 'failed' | 'success';
  payment_method: string;
  created_at: string;
};

export type DodoConfigResult =
  | { ok: true; config: DodoConfig }
  | { ok: false; reason: string };

export function dodoConfig(): DodoConfigResult {
  const apiKey = process.env.DODO_API_KEY;
  if (!apiKey) {
    return { ok: false, reason: 'DODO_API_KEY is not set, so the payout connector is disabled.' };
  }

  const requested = (process.env.DODO_MODE ?? 'test').toLowerCase();
  if (requested !== 'test' && requested !== 'live') {
    return { ok: false, reason: `DODO_MODE must be "test" or "live", got "${requested}".` };
  }
  if (requested === 'live' && process.env.DODO_ALLOW_LIVE !== 'true') {
    return {
      ok: false,
      reason: 'Live mode also requires DODO_ALLOW_LIVE=true. Refusing to read live settlement data by default.',
    };
  }

  const mode = requested as DodoMode;
  return { ok: true, config: { apiKey, mode, baseUrl: BASE_URLS[mode] } };
}

export type ListPayoutsResult =
  | { ok: true; mode: DodoMode; payouts: DodoPayout[] }
  | { ok: false; reason: string };

/** GET {base}/payouts — the only Dodo call this codebase makes. */
export async function listPayouts(options?: {
  pageNumber?: number;
  pageSize?: number;
}): Promise<ListPayoutsResult> {
  const configured = dodoConfig();
  if (!configured.ok) return { ok: false, reason: configured.reason };

  const url = new URL('/payouts', configured.config.baseUrl);
  url.searchParams.set('page_number', String(options?.pageNumber ?? 0));
  url.searchParams.set('page_size', String(Math.min(options?.pageSize ?? 20, 100)));

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        authorization: `Bearer ${configured.config.apiKey}`,
        'content-type': 'application/json',
      },
    });

    if (!response.ok) {
      return { ok: false, reason: `Dodo responded ${response.status} ${response.statusText}.` };
    }

    const body = (await response.json()) as { items?: DodoPayout[] };
    return { ok: true, mode: configured.config.mode, payouts: body.items ?? [] };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : 'Dodo request failed.',
    };
  }
}

/**
 * Maps payouts to bank lines.
 *
 * Amounts arrive as integer minor units, so they are divided by 100 and the
 * scale is recorded rather than guessed at read time. A payout is money in, so
 * the amount is positive — the sign convention matches the statement, not the
 * processor's ledger.
 *
 * Only settled payouts become bank lines: an in-progress or failed payout has
 * not hit the account, and inventing a statement line for it would be inventing
 * a reconciling item.
 */
export function payoutsAsBankLines(payouts: DodoPayout[]): BankLine[] {
  return payouts
    .filter((payout) => payout.status === 'success')
    .map((payout) => ({
      id: `DODO-${payout.payout_id}`,
      postedDate: payout.created_at.slice(0, 10),
      valueDate: payout.created_at.slice(0, 10),
      amount: Math.round(payout.amount) / 100,
      currency: payout.currency.toUpperCase(),
      counterparty: 'Dodo Payments',
      reference: payout.payout_id,
      description: `PROCESSOR PAYOUT ${payout.payment_method.toUpperCase()}`,
    }));
}

/** Payouts that are not yet money in the bank, and why they were skipped. */
export function unsettledPayouts(payouts: DodoPayout[]): { payoutId: string; status: string; reason: string }[] {
  return payouts
    .filter((payout) => payout.status !== 'success')
    .map((payout) => ({
      payoutId: payout.payout_id,
      status: payout.status,
      reason: 'Not settled, so it is not on the bank statement and is not a reconciling item yet.',
    }));
}
