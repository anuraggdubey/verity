import { NextResponse } from 'next/server';

import { apiError } from '@/lib/api/errors';
import { CsvValidationError, loadBankCsv, loadFrozenReconciliation, loadLedgerCsv } from '@/lib/data/loader';
import { matchReconciliation } from '@/lib/matcher/match';

export async function POST(request: Request) {
  try {
    const text = await request.text();
    const body = text ? JSON.parse(text) as { bankCsv?: string; ledgerCsv?: string } : {};
    if ((body.bankCsv && !body.ledgerCsv) || (!body.bankCsv && body.ledgerCsv)) {
      return apiError(400, 'BOTH_FILES_REQUIRED', 'bankCsv and ledgerCsv must be supplied together.');
    }
    const source = body.bankCsv && body.ledgerCsv
      ? { bankLines: loadBankCsv(body.bankCsv), ledgerEntries: loadLedgerCsv(body.ledgerCsv) }
      : loadFrozenReconciliation();
    const result = matchReconciliation(source.bankLines, source.ledgerEntries);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof SyntaxError) return apiError(400, 'INVALID_JSON', 'Request body must be valid JSON.');
    if (error instanceof CsvValidationError) return apiError(422, 'INVALID_CSV', error.message, { row: error.row });
    return apiError(500, 'RECONCILIATION_FAILED', 'The reconciliation could not be completed.');
  }
}
