import type { ToolSpec } from '@/lib/agent/model';
import {
  getBankLine,
  getSupportingDocument,
  listFxObservations,
  listLedgerEntries,
  listSupportingDocuments,
} from '@/lib/demo/store';

/**
 * The four investigative tools. Four, and no more — IMPLEMENTATION.md §5.
 *
 * They read Builder A's data layer (today: the fixture store). None of them can
 * write, and none of them returns an expected label. `submit_proposal` in
 * proposal.ts is a constrained submission channel, not a fifth tool.
 */

export type ToolResult = { ok: boolean; content: unknown };

export const TOOL_SPECS: ToolSpec[] = [
  {
    name: 'get_bank_line',
    description:
      'Fetch one normalized bank statement line by id. Use it to confirm the settled amount, currency, value date and counterparty.',
    parameters: {
      type: 'object',
      properties: { id: { type: 'string', description: 'Bank line id, e.g. BL-014' } },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'search_ledger',
    description:
      'Search cash-GL entries. Filter by reference, counterparty, account, period, or an amount with an optional tolerance. Returns at most 20 entries.',
    parameters: {
      type: 'object',
      properties: {
        reference: { type: 'string' },
        counterparty: { type: 'string' },
        account: { type: 'string' },
        period: { type: 'string', description: 'Accounting period, e.g. 2026-08' },
        amount: { type: 'number' },
        amountTolerance: { type: 'number', description: 'Absolute tolerance for amount, default 0.01' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'get_supporting_document',
    description:
      'Fetch a supporting document (vendor invoice, remittance, fee schedule) by id, or search by reference or counterparty. Returns the transaction date, invoice currency and amount.',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        reference: { type: 'string' },
        counterparty: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'get_approved_fx_rate',
    description:
      'Look up FX observations for a currency pair. Returns observations with their rate date, rate type, source and whether the source is policy-approved. Filter by rateDate to get the rate observed on a specific date.',
    parameters: {
      type: 'object',
      properties: {
        base: { type: 'string', description: 'e.g. EUR' },
        quote: { type: 'string', description: 'e.g. USD' },
        rateDate: { type: 'string', description: 'ISO date, e.g. 2026-08-11' },
        rateType: { type: 'string', enum: ['spot', 'closing', 'average'] },
        approvedOnly: { type: 'boolean', description: 'Default false, so unapproved sources are visible too' },
      },
      required: ['base', 'quote'],
      additionalProperties: false,
    },
  },
];

export const TOOL_NAMES = TOOL_SPECS.map((tool) => tool.name);

type Args = Record<string, unknown>;

const str = (args: Args, key: string): string | undefined =>
  typeof args[key] === 'string' ? (args[key] as string) : undefined;
const num = (args: Args, key: string): number | undefined =>
  typeof args[key] === 'number' ? (args[key] as number) : undefined;

export function executeTool(name: string, rawArguments: string): ToolResult {
  let args: Args;
  try {
    args = rawArguments ? (JSON.parse(rawArguments) as Args) : {};
  } catch {
    return { ok: false, content: { error: 'Arguments were not valid JSON.' } };
  }

  switch (name) {
    case 'get_bank_line': {
      const id = str(args, 'id');
      if (!id) return { ok: false, content: { error: 'id is required' } };
      const line = getBankLine(id);
      return line
        ? { ok: true, content: line }
        : { ok: false, content: { error: `No bank line ${id}` } };
    }

    case 'search_ledger': {
      const reference = str(args, 'reference');
      const counterparty = str(args, 'counterparty');
      const account = str(args, 'account');
      const period = str(args, 'period');
      const amount = num(args, 'amount');
      const tolerance = num(args, 'amountTolerance') ?? 0.01;

      const matches = listLedgerEntries().filter((entry) => {
        if (reference && !entry.reference.toLowerCase().includes(reference.toLowerCase())) return false;
        if (counterparty && !entry.counterparty.toLowerCase().includes(counterparty.toLowerCase())) return false;
        if (account && entry.account !== account) return false;
        if (period && entry.period !== period) return false;
        if (amount !== undefined && Math.abs(Math.abs(entry.amount) - Math.abs(amount)) > tolerance) return false;
        return true;
      });

      return { ok: true, content: { count: matches.length, entries: matches.slice(0, 20) } };
    }

    case 'get_supporting_document': {
      const id = str(args, 'id');
      if (id) {
        const doc = getSupportingDocument(id);
        return doc
          ? { ok: true, content: doc }
          : { ok: false, content: { error: `No document ${id}` } };
      }
      const reference = str(args, 'reference');
      const counterparty = str(args, 'counterparty');
      if (!reference && !counterparty) {
        return { ok: false, content: { error: 'Provide id, reference or counterparty' } };
      }
      const matches = listSupportingDocuments().filter((doc) => {
        if (reference && !doc.reference.toLowerCase().includes(reference.toLowerCase())) return false;
        if (counterparty && !doc.counterparty.toLowerCase().includes(counterparty.toLowerCase())) return false;
        return true;
      });
      // A search that correctly finds nothing is a successful search, not a tool
      // failure: many bank lines legitimately have no supporting document, and
      // counting those as errors inflated the operational failure metric.
      return {
        ok: true,
        content:
          matches.length > 0
            ? { count: matches.length, documents: matches }
            : {
                count: 0,
                documents: [],
                note: 'No supporting document matches that search. Evidence may genuinely be missing — consider insufficient_evidence rather than assuming one exists.',
              },
      };
    }

    case 'get_approved_fx_rate': {
      const base = str(args, 'base');
      const quote = str(args, 'quote');
      if (!base || !quote) return { ok: false, content: { error: 'base and quote are required' } };
      const rateDate = str(args, 'rateDate');
      const rateType = str(args, 'rateType');
      const approvedOnly = args.approvedOnly === true;

      const matches = listFxObservations().filter((observation) => {
        if (observation.base !== base || observation.quote !== quote) return false;
        if (rateDate && observation.rateDate !== rateDate) return false;
        if (rateType && observation.rateType !== rateType) return false;
        if (approvedOnly && !observation.approved) return false;
        return true;
      });

      return {
        ok: true,
        content: {
          count: matches.length,
          observations: matches,
          note: 'An observation with approved=false is visible but is not permitted as evidence under policy.',
        },
      };
    }

    default:
      return { ok: false, content: { error: `Unknown tool ${name}. Available: ${TOOL_NAMES.join(', ')}` } };
  }
}
