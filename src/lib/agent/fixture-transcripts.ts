import type { FixtureTurn } from '@/lib/agent/model';

/**
 * Recorded transcripts for the offline provider.
 *
 * These are RECORDINGS. They exist so the block → repair → resubmit loop can be
 * exercised, tested and demonstrated without a key or a network. Anything shown
 * from one must be described as pre-recorded, out loud, every time. Never
 * present a fixture run as a live agent decision.
 *
 * Only CASE-001 is recorded. Every other case needs a live provider.
 */

const CASE_001: FixtureTurn[] = [
  {
    text: 'Starting with the bank line.',
    toolCalls: [{ name: 'get_bank_line', arguments: JSON.stringify({ id: 'BL-014' }) }],
  },
  {
    text: 'EUR invoice settled in USD. Fetching the invoice.',
    toolCalls: [
      { name: 'get_supporting_document', arguments: JSON.stringify({ reference: 'INV-LG-2291' }) },
    ],
  },
  {
    text: 'Looking up EUR/USD observations.',
    toolCalls: [
      { name: 'get_approved_fx_rate', arguments: JSON.stringify({ base: 'EUR', quote: 'USD' }) },
    ],
  },
  {
    // The recorded mistake: an unapproved feed, on the settlement date, chosen
    // because it reconciles to the bank exactly.
    text: null,
    toolCalls: [
      {
        name: 'submit_proposal',
        arguments: JSON.stringify({
          disposition: 'fx_revaluation',
          narrative:
            'The Lyra GmbH invoice INV-LG-2291 for EUR 8,000 was settled by wire on 2026-08-14 for USD 8,712.00. Converting EUR 8,000 at 1.0890 gives USD 8,712.00, which agrees exactly with the bank line, so accounts payable is relieved in full with no FX variance.',
          citations: [
            { claim: 'Bank settled USD 8,712.00 on 2026-08-14', sourceType: 'bank_line', sourceId: 'BL-014', field: 'amount' },
            { claim: 'Invoice is EUR 8,000', sourceType: 'document', sourceId: 'DOC-LG-2291', field: 'amount' },
            { claim: 'EUR/USD 1.0890', sourceType: 'fx_observation', sourceId: 'FXO-0814-STF', field: 'rate' },
          ],
          journal: [
            { account: '2100', entity: 'ACME-US', period: '2026-08', currency: 'USD', debit: 8712, credit: 0, memo: 'Relieve AP - Lyra GmbH INV-LG-2291' },
            { account: '1010', entity: 'ACME-US', period: '2026-08', currency: 'USD', debit: 0, credit: 8712, memo: 'Wire settlement' },
          ],
          fx: { rate: 1.089, rateDate: '2026-08-14', rateType: 'spot', sourceId: 'STREETFX-FEED' },
        }),
      },
    ],
  },
  {
    text: 'Retrieving an approved rate for the transaction date.',
    toolCalls: [
      {
        name: 'get_approved_fx_rate',
        arguments: JSON.stringify({ base: 'EUR', quote: 'USD', rateDate: '2026-08-11', approvedOnly: true }),
      },
    ],
  },
  {
    text: null,
    toolCalls: [
      {
        name: 'submit_proposal',
        arguments: JSON.stringify({
          disposition: 'fx_revaluation',
          narrative:
            'Policy requires the transaction-date spot rate from an approved provider. The invoice transaction date is 2026-08-11 and the approved APEX-REF-RATES spot rate for that date is 1.0785, giving a carrying value of USD 8,628.00. The bank settled USD 8,712.00, so the USD 84.00 difference is a realized FX loss rather than a reduction of payables.',
          citations: [
            { claim: 'Bank settled USD 8,712.00 on 2026-08-14', sourceType: 'bank_line', sourceId: 'BL-014', field: 'amount' },
            { claim: 'Invoice is EUR 8,000 with transaction date 2026-08-11', sourceType: 'document', sourceId: 'DOC-LG-2291', field: 'transactionDate' },
            { claim: 'Approved transaction-date spot rate EUR/USD 1.0785', sourceType: 'fx_observation', sourceId: 'FXO-0811-APX', field: 'rate' },
            { claim: 'AP carrying value USD 8,628.00', sourceType: 'ledger_entry', sourceId: 'GL-2201', field: 'amount' },
          ],
          journal: [
            { account: '2100', entity: 'ACME-US', period: '2026-08', currency: 'USD', debit: 8628, credit: 0, memo: 'Relieve AP at invoice-date carrying value' },
            { account: '7420', entity: 'ACME-US', period: '2026-08', currency: 'USD', debit: 84, credit: 0, memo: 'Realized FX loss on EUR settlement' },
            { account: '1010', entity: 'ACME-US', period: '2026-08', currency: 'USD', debit: 0, credit: 8712, memo: 'Wire settlement' },
          ],
          fx: { rate: 1.0785, rateDate: '2026-08-11', rateType: 'spot', sourceId: 'APEX-REF-RATES' },
        }),
      },
    ],
  },
];

const TRANSCRIPTS: Record<string, FixtureTurn[]> = {
  'CASE-001': CASE_001,
};

export function fixtureTranscript(caseId: string): FixtureTurn[] | undefined {
  return TRANSCRIPTS[caseId];
}

export function hasFixtureTranscript(caseId: string): boolean {
  return caseId in TRANSCRIPTS;
}
