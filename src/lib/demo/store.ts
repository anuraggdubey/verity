import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import type {
  BankLine,
  Case,
  ControlPR,
  ControlReport,
  ControllerDecision,
  Citation,
  FxObservation,
  LedgerEntry,
  LedgerRecord,
  Proposal,
  ReconciliationStatus,
  ReplayReport,
  RejectReasonCode,
  RouteDecision,
  SupportingDocument,
  VerityEvent,
} from '@/lib/contracts/types';

/**
 * Builder C's read/write seam.
 *
 * Today it is backed by bench/fixtures/demo.json and in-process state. When A's
 * store and B's worker land, only this file changes: every page and component
 * consumes the functions below, not the fixture. Keep the signatures stable.
 */

type Fixture = {
  meta: {
    note: string;
    benchmarkIsSynthetic: boolean;
    entity: string;
    period: string;
    policyVersion: string;
    packVersion: string;
    openingLedgerBalance: number;
    bankBalance: number;
    cashAccount: string;
    fingerprint: ReplayReport['fingerprint'];
  };
  reconciliation: { bankLineCount: number; autoClearedCount: number; exceptionCount: number };
  bankLines: BankLine[];
  ledgerEntries: LedgerEntry[];
  documents: SupportingDocument[];
  fxObservations: FxObservation[];
  cases: Case[];
  proposals: Proposal[];
  controlReports: ControlReport[];
  routeDecisions: RouteDecision[];
  controllerDecisions: ControllerDecision[];
  ledgerRecords: LedgerRecord[];
  controlPRs: ControlPR[];
  pendingReplay: ReplayReport;
  heldOut: { caseId: string; summary: string; underV1: string; underV2: string; note: string };
  events: VerityEvent[];
};

type State = {
  fixture: Fixture;
  cases: Case[];
  controllerDecisions: ControllerDecision[];
  ledgerRecords: LedgerRecord[];
  controlPRs: ControlPR[];
  events: VerityEvent[];
  packVersion: string;
};

const FIXTURE_PATH = path.join(process.cwd(), 'bench', 'fixtures', 'demo.json');

function loadFixture(): Fixture {
  return JSON.parse(readFileSync(FIXTURE_PATH, 'utf8')) as Fixture;
}

function freshState(): State {
  const fixture = loadFixture();
  return {
    fixture,
    cases: structuredClone(fixture.cases),
    controllerDecisions: structuredClone(fixture.controllerDecisions),
    ledgerRecords: structuredClone(fixture.ledgerRecords),
    controlPRs: structuredClone(fixture.controlPRs),
    events: structuredClone(fixture.events),
    packVersion: fixture.meta.packVersion,
  };
}

// Survives dev-server hot reloads so a demo run is not reset by an edit.
const globalRef = globalThis as unknown as { __verityState?: State };
function state(): State {
  if (!globalRef.__verityState) globalRef.__verityState = freshState();
  return globalRef.__verityState;
}

export function resetDemo(): void {
  globalRef.__verityState = freshState();
}

/* ---------------------------------------------------------------- reads */

export function meta() {
  return state().fixture.meta;
}

export function listCases(): CaseRow[] {
  const s = state();
  return s.cases.map((c) => {
    const latestId = c.revisions[c.revisions.length - 1];
    const latest = s.fixture.proposals.find((p) => p.id === latestId);
    const report = s.fixture.controlReports.find((r) => r.proposalId === latestId);
    const route = s.fixture.routeDecisions.find((r) => r.proposalId === latestId);
    const bankLine = s.fixture.bankLines.find((b) => b.id === c.bankLineId);
    return {
      case: c,
      bankLine,
      latestProposal: latest,
      report,
      lane: route?.lane ?? (c.state === 'auto_cleared' ? 'auto' : 'review'),
      blocked: report?.blocked ?? false,
      revisionCount: c.revisions.length,
      decision: s.controllerDecisions.find((d) => d.caseId === c.id),
    };
  });
}

export type CaseRow = {
  case: Case;
  bankLine?: BankLine;
  latestProposal?: Proposal;
  report?: ControlReport;
  lane: RouteDecision['lane'];
  blocked: boolean;
  revisionCount: number;
  decision?: ControllerDecision;
};

export type CaseDetail = {
  case: Case;
  bankLine?: BankLine;
  candidates: LedgerEntry[];
  revisions: { proposal: Proposal; report?: ControlReport; route?: RouteDecision }[];
  decision?: ControllerDecision;
  ledgerRecord?: LedgerRecord;
  packVersion: string;
};

export function getCaseDetail(caseId: string): CaseDetail | undefined {
  const s = state();
  const c = s.cases.find((x) => x.id === caseId);
  if (!c) return undefined;
  const revisions = c.revisions.map((pid) => {
    const proposal = s.fixture.proposals.find((p) => p.id === pid)!;
    return {
      proposal,
      report: s.fixture.controlReports.find((r) => r.proposalId === pid),
      route: s.fixture.routeDecisions.find((r) => r.proposalId === pid),
    };
  });
  const decision = s.controllerDecisions.find((d) => d.caseId === caseId);
  return {
    case: c,
    bankLine: s.fixture.bankLines.find((b) => b.id === c.bankLineId),
    candidates: s.fixture.ledgerEntries.filter((e) => c.candidateLedgerIds.includes(e.id)),
    revisions,
    decision,
    ledgerRecord: decision
      ? s.ledgerRecords.find((r) => r.proposalId === decision.proposalId)
      : undefined,
    packVersion: s.packVersion,
  };
}

/** Resolves a citation to the record it points at, for the evidence inspector. */
export function resolveCitation(citation: Citation): Record<string, unknown> | undefined {
  const s = state().fixture;
  switch (citation.sourceType) {
    case 'bank_line':
      return s.bankLines.find((x) => x.id === citation.sourceId) as unknown as Record<string, unknown>;
    case 'ledger_entry':
      return s.ledgerEntries.find((x) => x.id === citation.sourceId) as unknown as Record<string, unknown>;
    case 'document':
      return s.documents.find((x) => x.id === citation.sourceId) as unknown as Record<string, unknown>;
    case 'fx_observation':
      return s.fxObservations.find((x) => x.id === citation.sourceId) as unknown as Record<string, unknown>;
    default:
      return undefined;
  }
}

const DISPOSITIONED = new Set(['auto_cleared', 'approved', 'rejected', 'escalated']);

export function reconciliationStatus(): ReconciliationStatus {
  const s = state();
  const { bankBalance, openingLedgerBalance, cashAccount } = s.fixture.meta;
  const postedCash = s.ledgerRecords
    .flatMap((r) => r.lines)
    .filter((l) => l.account === cashAccount)
    .reduce((sum, l) => sum + l.credit - l.debit, 0);
  const ledgerBalance = round2(openingLedgerBalance - postedCash);
  const unresolved = s.cases.filter((c) => !DISPOSITIONED.has(c.state)).length;
  return {
    bankLineCount: s.fixture.reconciliation.bankLineCount,
    autoClearedCount: s.fixture.reconciliation.autoClearedCount,
    exceptionCount: s.fixture.reconciliation.exceptionCount,
    unresolvedCount: unresolved,
    bankBalance,
    ledgerBalance,
    closed: unresolved === 0 && Math.abs(ledgerBalance - bankBalance) < 0.005,
  };
}

export function listEvents(): VerityEvent[] {
  return [...state().events].sort((a, b) => a.at.localeCompare(b.at));
}

export function listControlPRs(): ControlPR[] {
  return state().controlPRs;
}

export function getControlPR(id: string): ControlPR | undefined {
  return state().controlPRs.find((p) => p.id === id);
}

export function heldOutCase() {
  return state().fixture.heldOut;
}

export function proposalsById(ids: string[]): Proposal[] {
  return state().fixture.proposals.filter((p) => ids.includes(p.id));
}

export function packVersion(): string {
  return state().packVersion;
}

/* --------------------------------------------------------------- writes */

export type DecisionInput = {
  proposalId: string;
  decision: 'approve' | 'reject';
  reasonCode?: RejectReasonCode;
  rationale?: string;
  decidedBy?: string;
};

export function recordControllerDecision(input: DecisionInput):
  | { ok: true; caseId: string }
  | { ok: false; error: string } {
  const s = state();
  const proposal = s.fixture.proposals.find((p) => p.id === input.proposalId);
  if (!proposal) return { ok: false, error: `Unknown proposal ${input.proposalId}` };

  const c = s.cases.find((x) => x.id === proposal.caseId);
  if (!c) return { ok: false, error: `Unknown case for ${input.proposalId}` };
  if (s.controllerDecisions.some((d) => d.proposalId === input.proposalId)) {
    return { ok: false, error: 'This proposal already has a controller decision' };
  }

  const report = s.fixture.controlReports.find((r) => r.proposalId === input.proposalId);
  if (input.decision === 'approve' && report?.blocked) {
    return { ok: false, error: 'Controls are blocking this revision — it cannot be approved' };
  }
  if (input.decision === 'reject' && !input.reasonCode) {
    return { ok: false, error: 'A reason code is required on reject' };
  }

  const at = new Date().toISOString();
  const decision: ControllerDecision = {
    proposalId: input.proposalId,
    caseId: c.id,
    decision: input.decision,
    reasonCode: input.reasonCode,
    rationale: input.rationale,
    decidedBy: input.decidedBy ?? 'controller@acme.example',
    decidedAt: at,
  };
  s.controllerDecisions.push(decision);
  s.events.push({
    type: 'controller_decided',
    at,
    proposalId: input.proposalId,
    decision: input.decision,
    reasonCode: input.reasonCode,
  });

  if (input.decision === 'approve') {
    c.state = 'approved';
    if (proposal.journal.length > 0) {
      const record = appendLedgerRecord(s, proposal.id, proposal.journal);
      s.events.push({
        type: 'journal_posted',
        at,
        proposalId: proposal.id,
        ledgerRecordId: record.id,
      });
    }
  } else {
    c.state = 'rejected';
  }

  const status = reconciliationStatus();
  if (status.closed) {
    s.events.push({ type: 'reconciliation_closed', at, unresolvedCount: 0 });
  }
  return { ok: true, caseId: c.id };
}

function appendLedgerRecord(
  s: State,
  proposalId: string,
  lines: LedgerRecord['lines'],
): LedgerRecord {
  const prev = s.ledgerRecords[s.ledgerRecords.length - 1];
  const prevHash = prev?.hash ?? '0000000000000000';
  const id = `LR-${String(s.ledgerRecords.length + 1).padStart(4, '0')}`;
  const postedAt = new Date().toISOString();
  const hash = createHash('sha256')
    .update(prevHash + JSON.stringify({ id, proposalId, lines, postedAt }))
    .digest('hex')
    .slice(0, 16);
  const record: LedgerRecord = { id, proposalId, lines, postedAt, prevHash, hash };
  s.ledgerRecords.push(record);
  return record;
}

/** Runs CPR-001's replay. Real replay lands with A's engine; this reads the fixture. */
export function replayControlPR(id: string): ControlPR | undefined {
  const s = state();
  const pr = s.controlPRs.find((p) => p.id === id);
  if (!pr) return undefined;
  const at = new Date().toISOString();
  pr.replay = { ...s.fixture.pendingReplay, controlPrId: pr.id, ranAt: at };
  pr.status = 'replayed';
  s.events.push({
    type: 'control_pr_replayed',
    at,
    controlPrId: pr.id,
    positivesCaught: pr.replay.positives.filter((p) => p.caught).length,
    negativesAllowed: pr.replay.negatives.filter((n) => n.stillAllowed).length,
  });
  return pr;
}

export function mergeControlPR(id: string):
  | { ok: true; packVersion: string }
  | { ok: false; error: string } {
  const s = state();
  const pr = s.controlPRs.find((p) => p.id === id);
  if (!pr) return { ok: false, error: `Unknown control PR ${id}` };
  if (!pr.replay) return { ok: false, error: 'Replay must run before a control pack can be merged' };
  if (pr.replay.negatives.some((n) => !n.stillAllowed)) {
    return { ok: false, error: 'A counterexample regressed — the rule cannot be merged' };
  }
  const at = new Date().toISOString();
  pr.status = 'merged';
  pr.mergedAt = at;
  s.packVersion = pr.replay.packVersion;
  s.events.push({ type: 'control_pr_merged', at, controlPrId: pr.id, packVersion: s.packVersion });
  return { ok: true, packVersion: s.packVersion };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function listProposals(): Proposal[] {
  return state().fixture.proposals;
}

export function listControlReports(): ControlReport[] {
  return state().fixture.controlReports;
}

export function listRouteDecisions(): RouteDecision[] {
  return state().fixture.routeDecisions;
}

export function listControllerDecisions(): ControllerDecision[] {
  return state().controllerDecisions;
}

export function listLedgerRecords(): LedgerRecord[] {
  return state().ledgerRecords;
}
