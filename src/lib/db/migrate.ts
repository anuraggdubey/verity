import fs from 'fs';
import path from 'path';

import type {
  ControlPR,
  ControllerDecision,
  ControlReport,
  LedgerRecord,
  Proposal,
  RouteDecision,
  VerityEvent,
} from '@/lib/contracts/types';
import { loadBenchmark, type BenchmarkFixture } from '@/lib/data/benchmark';
import { getPool, getSql, isDatabaseConfigured } from './client';
import { useDatabase } from './env';

export { useDatabase } from './env';

function readSql(file: string): string {
  return fs.readFileSync(path.join(process.cwd(), 'src', 'lib', 'db', file), 'utf8');
}

export async function runMigrations(forceReseed = false): Promise<{ ok: boolean; message: string }> {
  if (!isDatabaseConfigured()) {
    return {
      ok: false,
      message: 'Database is not configured. Set DATABASE_URL in .env to enable Neon PostgreSQL.',
    };
  }

  const pool = getPool();
  const sql = getSql();

  try {
    await pool.query(readSql('patches.sql'));
    await pool.query(readSql('schema.sql'));

    const existingCases = (await sql`SELECT COUNT(*)::int AS count FROM cases`) as { count: number }[];
    const count = existingCases[0]?.count ?? 0;

    if (count === 0 || forceReseed) {
      if (forceReseed && count > 0) {
        await resetRuntimeTables();
      }
      await seedDatabase();
      return { ok: true, message: 'Database schema applied and benchmark fixtures seeded.' };
    }

    return { ok: true, message: 'Database schema up to date.' };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Migration failed:', error);
    return { ok: false, message: `Migration error: ${msg}` };
  }
}

export async function resetRuntimeTables(): Promise<void> {
  const pool = getPool();
  await pool.query(`
    TRUNCATE verity_events, ledger_records, controller_decisions, route_decisions,
      control_reports, proposals, cases, control_prs RESTART IDENTITY CASCADE
  `);
}

export async function seedDatabase(): Promise<void> {
  const sql = getSql();
  const { fixture, activeBankLineIds } = loadBenchmark();

  await sql`
    INSERT INTO verity_meta (key, value)
    VALUES ('meta', ${JSON.stringify(fixture.meta)})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
  `;
  await sql`
    INSERT INTO verity_meta (key, value)
    VALUES ('reconciliation', ${JSON.stringify(fixture.reconciliation)})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
  `;
  await sql`
    INSERT INTO verity_meta (key, value)
    VALUES ('heldOut', ${JSON.stringify(fixture.heldOut)})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
  `;
  await sql`
    INSERT INTO verity_meta (key, value)
    VALUES ('packVersion', ${JSON.stringify(fixture.meta.packVersion)})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
  `;
  await sql`
    INSERT INTO verity_meta (key, value)
    VALUES ('activeBankLineIds', ${JSON.stringify(activeBankLineIds)})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
  `;

  for (const b of fixture.bankLines) {
    await sql`
      INSERT INTO bank_lines (id, posted_date, value_date, amount, currency, counterparty, reference, description)
      VALUES (${b.id}, ${b.postedDate}, ${b.valueDate}, ${b.amount}, ${b.currency}, ${b.counterparty}, ${b.reference}, ${b.description})
      ON CONFLICT (id) DO NOTHING
    `;
  }

  for (const l of fixture.ledgerEntries) {
    await sql`
      INSERT INTO ledger_entries (id, entry_date, account, entity, period, amount, currency, counterparty, reference, description, posted)
      VALUES (${l.id}, ${l.entryDate}, ${l.account}, ${l.entity}, ${l.period}, ${l.amount}, ${l.currency}, ${l.counterparty}, ${l.reference}, ${l.description}, ${l.posted})
      ON CONFLICT (id) DO NOTHING
    `;
  }

  for (const d of fixture.documents) {
    await sql`
      INSERT INTO supporting_documents (id, doc_type, issued_date, counterparty, amount, currency, reference, fields)
      VALUES (${d.id}, ${d.docType}, ${d.issuedDate}, ${d.counterparty}, ${d.amount}, ${d.currency}, ${d.reference}, ${JSON.stringify(d.fields)})
      ON CONFLICT (id) DO NOTHING
    `;
  }

  for (const fx of fixture.fxObservations) {
    await sql`
      INSERT INTO fx_observations (id, base, quote, rate, rate_date, rate_type, source_id, approved)
      VALUES (${fx.id}, ${fx.base}, ${fx.quote}, ${fx.rate}, ${fx.rateDate}, ${fx.rateType}, ${fx.sourceId}, ${fx.approved})
      ON CONFLICT (id) DO NOTHING
    `;
  }

  for (const c of fixture.cases) {
    await sql`
      INSERT INTO cases (
        id, bank_line_id, candidate_ledger_ids, state, materiality, auto_clear_permitted,
        revisions, opened_at, summary, title, counterparty, amount, currency,
        worker_active, worker_id, trace_id
      )
      VALUES (
        ${c.id}, ${c.bankLineId}, ${JSON.stringify(c.candidateLedgerIds)}, ${c.state},
        ${c.materiality}, ${c.autoClearPermitted}, ${JSON.stringify(c.revisions)},
        ${c.openedAt}, ${c.summary}, ${c.title ?? null}, ${c.counterparty ?? null},
        ${c.amount ?? null}, ${c.currency ?? null}, ${c.workerActive ?? false},
        ${c.workerId ?? null}, ${c.traceId ?? null}
      )
      ON CONFLICT (id) DO UPDATE SET
        state = EXCLUDED.state,
        revisions = EXCLUDED.revisions,
        updated_at = NOW()
    `;
  }

  for (const p of fixture.proposals) {
    await insertProposal(p);
  }

  for (const cr of fixture.controlReports) {
    await insertControlReport(cr);
  }

  for (const rd of fixture.routeDecisions) {
    await insertRouteDecision(rd);
  }

  for (const cd of fixture.controllerDecisions) {
    await insertControllerDecision(cd);
  }

  for (const lr of fixture.ledgerRecords) {
    await insertLedgerRecord(lr);
  }

  for (const pr of fixture.controlPRs) {
    await insertControlPR(pr);
  }

  await sql`DELETE FROM verity_events`;
  for (const event of fixture.events) {
    await insertEvent(event);
  }
}

export async function insertProposal(p: Proposal): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO proposals (
      id, case_id, revision, repaired_from, disposition, narrative, citations, journal, fx,
      policy_version, control_pack_version, trace_id, created_at
    )
    VALUES (
      ${p.id}, ${p.caseId}, ${p.revision}, ${p.repairedFrom ?? null}, ${p.disposition},
      ${p.narrative}, ${JSON.stringify(p.citations)}, ${JSON.stringify(p.journal)},
      ${p.fx ? JSON.stringify(p.fx) : null}, ${p.policyVersion}, ${p.controlPackVersion},
      ${p.traceId}, ${p.createdAt}
    )
    ON CONFLICT (id) DO UPDATE SET
      disposition = EXCLUDED.disposition,
      narrative = EXCLUDED.narrative,
      citations = EXCLUDED.citations,
      journal = EXCLUDED.journal,
      fx = EXCLUDED.fx
  `;
}

export async function insertControlReport(cr: ControlReport): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO control_reports (proposal_id, pack_version, blocked, results, evaluated_at)
    VALUES (${cr.proposalId}, ${cr.packVersion}, ${cr.blocked}, ${JSON.stringify(cr.results)}, ${cr.evaluatedAt})
    ON CONFLICT (proposal_id) DO UPDATE SET
      pack_version = EXCLUDED.pack_version,
      blocked = EXCLUDED.blocked,
      results = EXCLUDED.results,
      evaluated_at = EXCLUDED.evaluated_at
  `;
}

export async function insertRouteDecision(rd: RouteDecision): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO route_decisions (proposal_id, lane, reason)
    VALUES (${rd.proposalId}, ${rd.lane}, ${rd.reason})
    ON CONFLICT (proposal_id) DO UPDATE SET lane = EXCLUDED.lane, reason = EXCLUDED.reason
  `;
}

export async function insertControllerDecision(cd: ControllerDecision): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO controller_decisions (proposal_id, case_id, decision, reason_code, rationale, decided_by, decided_at)
    VALUES (
      ${cd.proposalId}, ${cd.caseId}, ${cd.decision}, ${cd.reasonCode ?? null},
      ${cd.rationale ?? null}, ${cd.decidedBy}, ${cd.decidedAt}
    )
    ON CONFLICT (proposal_id) DO UPDATE SET
      decision = EXCLUDED.decision,
      reason_code = EXCLUDED.reason_code,
      rationale = EXCLUDED.rationale,
      decided_by = EXCLUDED.decided_by,
      decided_at = EXCLUDED.decided_at
  `;
}

export async function insertLedgerRecord(lr: LedgerRecord): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO ledger_records (id, proposal_id, lines, posted_at, prev_hash, hash)
    VALUES (${lr.id}, ${lr.proposalId}, ${JSON.stringify(lr.lines)}, ${lr.postedAt}, ${lr.prevHash}, ${lr.hash})
    ON CONFLICT (id) DO NOTHING
  `;
}

export async function insertControlPR(pr: ControlPR): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO control_prs (id, body, status, drafted_at, merged_at)
    VALUES (
      ${pr.id}, ${JSON.stringify(pr)}, ${pr.status}, ${pr.draftedAt}, ${pr.mergedAt ?? null}
    )
    ON CONFLICT (id) DO UPDATE SET
      body = EXCLUDED.body,
      status = EXCLUDED.status,
      merged_at = EXCLUDED.merged_at
  `;
}

export async function insertEvent(event: VerityEvent): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO verity_events (event_type, payload, recorded_at)
    VALUES (${event.type}, ${JSON.stringify(event)}, ${event.at})
  `;
}

export async function resetDatabaseToFixture(): Promise<void> {
  await resetRuntimeTables();
  await seedDatabase();
}

export type { BenchmarkFixture };
