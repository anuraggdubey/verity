import type {
  Case,
  ControlPR,
  ControllerDecision,
  ControlReport,
  FxObservation,
  LedgerRecord,
  Proposal,
  RouteDecision,
  VerityEvent,
} from '@/lib/contracts/types';
import { loadBenchmark, type BenchmarkFixture } from '@/lib/data/benchmark';
import { getSql } from './client';

type Row = Record<string, unknown>;

function asRows<T extends Row>(result: unknown): T[] {
  return result as T[];
}
import {
  insertControlPR,
  insertControlReport,
  insertControllerDecision,
  insertEvent,
  insertLedgerRecord,
  insertProposal,
  insertRouteDecision,
} from './migrate';

export type PersistedState = {
  fixture: BenchmarkFixture;
  cases: Case[];
  proposals: Proposal[];
  controlReports: ControlReport[];
  routeDecisions: RouteDecision[];
  controllerDecisions: ControllerDecision[];
  ledgerRecords: LedgerRecord[];
  controlPRs: ControlPR[];
  events: VerityEvent[];
  packVersion: string;
  activeBankLineIds: string[];
};

async function metaValue<T>(key: string, fallback: T): Promise<T> {
  const sql = getSql();
  const rows = asRows<{ value: T }>(await sql`SELECT value FROM verity_meta WHERE key = ${key}`);
  if (!rows[0]?.value) return fallback;
  return rows[0].value;
}

export async function loadStateFromDatabase(): Promise<PersistedState> {
  const sql = getSql();
  const { fixture: benchmarkFixture, activeBankLineIds: defaultIds } = loadBenchmark();

  const meta = await metaValue('meta', benchmarkFixture.meta);
  const reconciliation = await metaValue('reconciliation', benchmarkFixture.reconciliation);
  const heldOut = await metaValue('heldOut', benchmarkFixture.heldOut);
  const packVersion = await metaValue('packVersion', benchmarkFixture.meta.packVersion);
  const activeBankLineIds = await metaValue('activeBankLineIds', defaultIds);

  const bankLines = asRows<Row>(await sql`SELECT * FROM bank_lines ORDER BY id`);
  const ledgerEntries = asRows<Row>(await sql`SELECT * FROM ledger_entries ORDER BY id`);
  const documents = asRows<Row>(await sql`SELECT * FROM supporting_documents ORDER BY id`);
  const fxRows = asRows<Row>(await sql`SELECT * FROM fx_observations ORDER BY id`);
  const caseRows = asRows<Row>(await sql`SELECT * FROM cases ORDER BY id`);
  const proposalRows = asRows<Row>(await sql`SELECT * FROM proposals ORDER BY case_id, revision`);
  const reportRows = asRows<Row>(await sql`SELECT * FROM control_reports`);
  const routeRows = asRows<Row>(await sql`SELECT * FROM route_decisions`);
  const decisionRows = asRows<Row>(await sql`SELECT * FROM controller_decisions`);
  const ledgerRows = asRows<Row>(await sql`SELECT * FROM ledger_records ORDER BY posted_at`);
  const cprRows = asRows<Row>(await sql`SELECT * FROM control_prs ORDER BY drafted_at`);
  const eventRows = asRows<Row>(await sql`SELECT payload FROM verity_events ORDER BY id`);

  const fixture: BenchmarkFixture = {
    meta,
    reconciliation,
    heldOut,
    bankLines: bankLines.map((b) => ({
      id: String(b.id),
      postedDate: String(b.posted_date).slice(0, 10),
      valueDate: String(b.value_date).slice(0, 10),
      amount: Number(b.amount),
      currency: String(b.currency),
      counterparty: String(b.counterparty),
      reference: String(b.reference),
      description: String(b.description),
    })),
    ledgerEntries: ledgerEntries.map((l) => ({
      id: String(l.id),
      entryDate: String(l.entry_date).slice(0, 10),
      account: String(l.account),
      entity: String(l.entity),
      period: String(l.period),
      amount: Number(l.amount),
      currency: String(l.currency),
      counterparty: String(l.counterparty),
      reference: String(l.reference),
      description: String(l.description),
      posted: Boolean(l.posted),
    })),
    documents: documents.map((d) => ({
      id: String(d.id),
      docType: String(d.doc_type),
      issuedDate: String(d.issued_date).slice(0, 10),
      counterparty: String(d.counterparty),
      amount: Number(d.amount),
      currency: String(d.currency),
      reference: String(d.reference),
      fields: d.fields as Record<string, string | number>,
    })),
    fxObservations: fxRows.map((fx) => ({
      id: String(fx.id),
      base: String(fx.base),
      quote: String(fx.quote),
      rate: Number(fx.rate),
      rateDate: String(fx.rate_date).slice(0, 10),
      rateType: fx.rate_type as FxObservation['rateType'],
      sourceId: String(fx.source_id),
      approved: Boolean(fx.approved),
    })),
    cases: [],
    proposals: [],
    controlReports: [],
    routeDecisions: [],
    controllerDecisions: [],
    ledgerRecords: [],
    controlPRs: [],
    events: [],
  };

  const cases: Case[] = caseRows.map((c) => ({
    id: String(c.id),
    bankLineId: String(c.bank_line_id),
    candidateLedgerIds: c.candidate_ledger_ids as string[],
    state: c.state as Case['state'],
    materiality: c.materiality as Case['materiality'],
    autoClearPermitted: Boolean(c.auto_clear_permitted),
    revisions: c.revisions as string[],
    openedAt: new Date(String(c.opened_at)).toISOString(),
    summary: String(c.summary),
    title: c.title ? String(c.title) : undefined,
    counterparty: c.counterparty ? String(c.counterparty) : undefined,
    amount: c.amount != null ? Number(c.amount) : undefined,
    currency: c.currency ? String(c.currency) : undefined,
    workerActive: Boolean(c.worker_active),
    workerId: c.worker_id ? String(c.worker_id) : undefined,
    traceId: c.trace_id ? String(c.trace_id) : undefined,
  }));

  const proposals: Proposal[] = proposalRows.map((p) => ({
    id: String(p.id),
    caseId: String(p.case_id),
    revision: Number(p.revision),
    repairedFrom: p.repaired_from ? String(p.repaired_from) : undefined,
    disposition: p.disposition as Proposal['disposition'],
    narrative: String(p.narrative),
    citations: p.citations as Proposal['citations'],
    journal: p.journal as Proposal['journal'],
    fx: p.fx as Proposal['fx'],
    policyVersion: String(p.policy_version),
    controlPackVersion: String(p.control_pack_version),
    traceId: String(p.trace_id),
    createdAt: new Date(String(p.created_at)).toISOString(),
  }));

  const controlReports: ControlReport[] = reportRows.map((r) => ({
    proposalId: String(r.proposal_id),
    packVersion: String(r.pack_version),
    blocked: Boolean(r.blocked),
    results: r.results as ControlReport['results'],
    evaluatedAt: new Date(String(r.evaluated_at)).toISOString(),
  }));

  const routeDecisions: RouteDecision[] = routeRows.map((r) => ({
    proposalId: String(r.proposal_id),
    lane: r.lane as RouteDecision['lane'],
    reason: String(r.reason),
  }));

  const controllerDecisions: ControllerDecision[] = decisionRows.map((d) => ({
    proposalId: String(d.proposal_id),
    caseId: String(d.case_id),
    decision: d.decision as ControllerDecision['decision'],
    reasonCode: d.reason_code ? (d.reason_code as ControllerDecision['reasonCode']) : undefined,
    rationale: d.rationale ? String(d.rationale) : undefined,
    decidedBy: String(d.decided_by),
    decidedAt: new Date(String(d.decided_at)).toISOString(),
  }));

  const ledgerRecords: LedgerRecord[] = ledgerRows.map((l) => ({
    id: String(l.id),
    proposalId: String(l.proposal_id),
    lines: l.lines as LedgerRecord['lines'],
    postedAt: new Date(String(l.posted_at)).toISOString(),
    prevHash: String(l.prev_hash),
    hash: String(l.hash),
  }));

  const controlPRs: ControlPR[] = cprRows.map((row) => row.body as ControlPR);
  const events: VerityEvent[] = eventRows.map((row) => row.payload as VerityEvent);

  fixture.cases = cases;
  fixture.proposals = proposals;
  fixture.controlReports = controlReports;
  fixture.routeDecisions = routeDecisions;
  fixture.controllerDecisions = controllerDecisions;
  fixture.ledgerRecords = ledgerRecords;
  fixture.controlPRs = controlPRs;
  fixture.events = events;

  return {
    fixture,
    cases,
    proposals,
    controlReports,
    routeDecisions,
    controllerDecisions,
    ledgerRecords,
    controlPRs,
    events,
    packVersion,
    activeBankLineIds,
  };
}

export async function persistCase(caseRow: Case): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO cases (
      id, bank_line_id, candidate_ledger_ids, state, materiality, auto_clear_permitted,
      revisions, opened_at, summary, title, counterparty, amount, currency,
      worker_active, worker_id, trace_id, updated_at
    )
    VALUES (
      ${caseRow.id}, ${caseRow.bankLineId}, ${JSON.stringify(caseRow.candidateLedgerIds)},
      ${caseRow.state}, ${caseRow.materiality}, ${caseRow.autoClearPermitted},
      ${JSON.stringify(caseRow.revisions)}, ${caseRow.openedAt}, ${caseRow.summary},
      ${caseRow.title ?? null}, ${caseRow.counterparty ?? null}, ${caseRow.amount ?? null},
      ${caseRow.currency ?? null}, ${caseRow.workerActive ?? false}, ${caseRow.workerId ?? null},
      ${caseRow.traceId ?? null}, NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      state = EXCLUDED.state,
      revisions = EXCLUDED.revisions,
      worker_active = EXCLUDED.worker_active,
      worker_id = EXCLUDED.worker_id,
      trace_id = EXCLUDED.trace_id,
      updated_at = NOW()
  `;
}

export async function persistPackVersion(version: string): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO verity_meta (key, value)
    VALUES ('packVersion', ${JSON.stringify(version)})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
  `;
}

export async function deleteProposalsForCase(proposalIds: string[]): Promise<void> {
  if (proposalIds.length === 0) return;
  const sql = getSql();
  for (const id of proposalIds) {
    await sql`DELETE FROM proposals WHERE id = ${id}`;
  }
}

export async function replaceAllEvents(events: VerityEvent[]): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM verity_events`;
  for (const event of events) {
    await insertEvent(event);
  }
}

export {
  insertProposal as persistProposal,
  insertControlReport as persistControlReport,
  insertRouteDecision as persistRouteDecision,
  insertControllerDecision as persistControllerDecision,
  insertLedgerRecord as persistLedgerRecord,
  insertControlPR as persistControlPR,
  insertEvent as persistEvent,
};
