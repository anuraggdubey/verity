import type { ToolSpec } from '@/lib/agent/model';
import type {
  Citation,
  Disposition,
  JournalLine,
  Proposal,
  SourceType,
} from '@/lib/contracts/types';

/**
 * The constrained submission channel.
 *
 * The agent does not write a proposal into the system; it fills this schema and
 * the application constructs the Proposal. Anything that fails validation here
 * never becomes a revision — it goes back to the agent as a schema error, which
 * is a different thing from a control block and is counted separately.
 */

const DISPOSITIONS: Disposition[] = [
  'matched',
  'timing_difference',
  'bank_fee_journal',
  'fx_revaluation',
  'duplicate',
  'short_pay',
  'insufficient_evidence',
  'escalate',
];

const SOURCE_TYPES: SourceType[] = ['bank_line', 'ledger_entry', 'document', 'fx_observation'];

export const SUBMIT_PROPOSAL_SPEC: ToolSpec = {
  name: 'submit_proposal',
  description:
    'Submit your reconciliation decision for this case. Call this exactly once, when your investigation is complete. Every material claim in the narrative must have a citation. Use an empty journal for non-posting dispositions.',
  parameters: {
    type: 'object',
    properties: {
      disposition: { type: 'string', enum: DISPOSITIONS },
      narrative: {
        type: 'string',
        description: 'Two to four sentences: what happened, what evidence supports it, and how the amounts were derived.',
      },
      citations: {
        type: 'array',
        description: 'One entry per material claim. Cite records you actually retrieved.',
        items: {
          type: 'object',
          properties: {
            claim: { type: 'string' },
            sourceType: { type: 'string', enum: SOURCE_TYPES },
            sourceId: { type: 'string' },
            field: { type: 'string' },
          },
          required: ['claim', 'sourceType', 'sourceId'],
          additionalProperties: false,
        },
      },
      journal: {
        type: 'array',
        description: 'Proposed debit and credit lines. Empty for non-posting dispositions. Total debits must equal total credits.',
        items: {
          type: 'object',
          properties: {
            account: { type: 'string' },
            entity: { type: 'string' },
            period: { type: 'string' },
            currency: { type: 'string' },
            debit: { type: 'number' },
            credit: { type: 'number' },
            memo: { type: 'string' },
          },
          required: ['account', 'entity', 'period', 'currency', 'debit', 'credit'],
          additionalProperties: false,
        },
      },
      fx: {
        type: 'object',
        description: 'Required when the invoice currency differs from the settlement currency.',
        properties: {
          rate: { type: 'number', description: 'The rate you converted at, exactly as observed.' },
          rateDate: { type: 'string', description: "The observation's rateDate, not the settlement date." },
          rateType: { type: 'string', description: 'spot, closing or average — as observed.' },
          sourceId: {
            type: 'string',
            description:
              "The PROVIDER identifier — the observation's sourceId field, e.g. APEX-REF-RATES. Not the observation's own id (FXO-...). Cite the observation id in citations instead.",
          },
        },
        required: ['rate', 'rateDate', 'rateType', 'sourceId'],
        additionalProperties: false,
      },
    },
    required: ['disposition', 'narrative', 'citations', 'journal'],
    additionalProperties: false,
  },
};

export type ProposalDraft = {
  disposition: Disposition;
  narrative: string;
  citations: Citation[];
  journal: JournalLine[];
  fx?: Proposal['fx'];
};

export type ParseResult =
  | { ok: true; draft: ProposalDraft }
  | { ok: false; errors: string[] };

export function parseProposalArguments(rawArguments: string): ParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawArguments || '{}');
  } catch {
    return { ok: false, errors: ['submit_proposal arguments were not valid JSON.'] };
  }
  if (typeof parsed !== 'object' || parsed === null) {
    return { ok: false, errors: ['submit_proposal arguments must be an object.'] };
  }

  const input = parsed as Record<string, unknown>;
  const errors: string[] = [];

  const disposition = input.disposition;
  if (typeof disposition !== 'string' || !DISPOSITIONS.includes(disposition as Disposition)) {
    errors.push(`disposition must be one of: ${DISPOSITIONS.join(', ')}.`);
  }

  const narrative = typeof input.narrative === 'string' ? input.narrative.trim() : '';
  if (narrative.length < 20) errors.push('narrative is required and must explain the decision.');

  const citations: Citation[] = [];
  if (!Array.isArray(input.citations)) {
    errors.push('citations must be an array.');
  } else {
    input.citations.forEach((entry, index) => {
      const c = entry as Record<string, unknown>;
      if (typeof c?.claim !== 'string' || typeof c?.sourceId !== 'string') {
        errors.push(`citations[${index}] needs claim and sourceId.`);
        return;
      }
      if (typeof c.sourceType !== 'string' || !SOURCE_TYPES.includes(c.sourceType as SourceType)) {
        errors.push(`citations[${index}].sourceType must be one of: ${SOURCE_TYPES.join(', ')}.`);
        return;
      }
      citations.push({
        claim: c.claim,
        sourceType: c.sourceType as SourceType,
        sourceId: c.sourceId,
        field: typeof c.field === 'string' ? c.field : undefined,
      });
    });
  }

  const journal: JournalLine[] = [];
  if (!Array.isArray(input.journal)) {
    errors.push('journal must be an array (use [] for non-posting dispositions).');
  } else {
    input.journal.forEach((entry, index) => {
      const l = entry as Record<string, unknown>;
      const missing = ['account', 'entity', 'period', 'currency'].filter(
        (key) => typeof l?.[key] !== 'string',
      );
      if (missing.length > 0) {
        errors.push(`journal[${index}] is missing ${missing.join(', ')}.`);
        return;
      }
      const debit = typeof l.debit === 'number' ? l.debit : Number(l.debit);
      const credit = typeof l.credit === 'number' ? l.credit : Number(l.credit);
      if (!Number.isFinite(debit) || !Number.isFinite(credit)) {
        errors.push(`journal[${index}] needs numeric debit and credit (use 0 for the unused side).`);
        return;
      }
      if (debit > 0 && credit > 0) {
        errors.push(`journal[${index}] sets both debit and credit; each line takes one side.`);
        return;
      }
      journal.push({
        account: l.account as string,
        entity: l.entity as string,
        period: l.period as string,
        currency: l.currency as string,
        debit: round2(debit),
        credit: round2(credit),
        memo: typeof l.memo === 'string' ? l.memo : undefined,
      });
    });
  }

  let fx: Proposal['fx'];
  if (input.fx !== undefined && input.fx !== null) {
    const f = input.fx as Record<string, unknown>;
    const rate = typeof f.rate === 'number' ? f.rate : Number(f.rate);
    if (
      !Number.isFinite(rate) ||
      typeof f.rateDate !== 'string' ||
      typeof f.rateType !== 'string' ||
      typeof f.sourceId !== 'string'
    ) {
      errors.push('fx must carry rate, rateDate, rateType and sourceId.');
    } else {
      fx = { rate, rateDate: f.rateDate, rateType: f.rateType, sourceId: f.sourceId };
    }
  }

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    draft: {
      disposition: disposition as Disposition,
      narrative,
      citations,
      journal,
      fx,
    },
  };
}

export function buildProposal(input: {
  id: string;
  caseId: string;
  revision: number;
  draft: ProposalDraft;
  policyVersion: string;
  controlPackVersion: string;
  traceId: string;
  repairedFrom?: string;
}): Proposal {
  return {
    id: input.id,
    caseId: input.caseId,
    revision: input.revision,
    disposition: input.draft.disposition,
    narrative: input.draft.narrative,
    citations: input.draft.citations,
    journal: input.draft.journal,
    fx: input.draft.fx,
    policyVersion: input.policyVersion,
    controlPackVersion: input.controlPackVersion,
    createdAt: new Date().toISOString(),
    traceId: input.traceId,
    repairedFrom: input.repairedFrom,
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
