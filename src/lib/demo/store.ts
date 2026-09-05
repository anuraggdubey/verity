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
  heldOut: { caseId: string; summary: string; underV1: string; underV2: string; note: string };
  events: VerityEvent[];
};

type State = {
  fixture: Fixture;
  cases: Case[];
  proposals: Proposal[];
  controlReports: ControlReport[];
  routeDecisions: RouteDecision[];
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
    proposals: structuredClone(fixture.proposals),
    controlReports: structuredClone(fixture.controlReports),
    routeDecisions: structuredClone(fixture.routeDecisions),
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
    const latest = s.proposals.find((p) => p.id === latestId);
    const report = s.controlReports.find((r) => r.proposalId === latestId);
    const route = s.routeDecisions.find((r) => r.proposalId === latestId);
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
    const proposal = s.proposals.find((p) => p.id === pid)!;
    return {
      proposal,
      report: s.controlReports.find((r) => r.proposalId === pid),
      route: s.routeDecisions.find((r) => r.proposalId === pid),
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
  return state().proposals.filter((p) => ids.includes(p.id));
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
  const proposal = s.proposals.find((p) => p.id === input.proposalId);
  if (!proposal) return { ok: false, error: `Unknown proposal ${input.proposalId}` };

  const c = s.cases.find((x) => x.id === proposal.caseId);
  if (!c) return { ok: false, error: `Unknown case for ${input.proposalId}` };
  if (s.controllerDecisions.some((d) => d.proposalId === input.proposalId)) {
    return { ok: false, error: 'This proposal already has a controller decision' };
  }

  const report = s.controlReports.find((r) => r.proposalId === input.proposalId);
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

export function mergeControlPR(id: string):
  | { ok: true; packVersion: string }
  | { ok: false; error: string } {
  const s = state();
  const pr = s.controlPRs.find((p) => p.id === id);
  if (!pr) return { ok: false, error: `Unknown control PR ${id}` };
  if (!pr.replay) return { ok: false, error: 'Replay must run before a control pack can be merged' };
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
  return state().proposals;
}

export function listControlReports(): ControlReport[] {
  return state().controlReports;
}

export function listRouteDecisions(): RouteDecision[] {
  return state().routeDecisions;
}

export function listControllerDecisions(): ControllerDecision[] {
  return state().controllerDecisions;
}

export function listLedgerRecords(): LedgerRecord[] {
  return state().ledgerRecords;
}

/* ------------------------------------------------- record reads (for tools)
 * Builder A's lib/data owns these once the frozen dataset lands. Until then the
 * four agent tools read them from here so there is exactly one copy of the data.
 */

export function listBankLines(): BankLine[] {
  return state().fixture.bankLines;
}

export function getBankLine(id: string): BankLine | undefined {
  return state().fixture.bankLines.find((b) => b.id === id);
}

export function listLedgerEntries(): LedgerEntry[] {
  return state().fixture.ledgerEntries;
}

export function listSupportingDocuments(): SupportingDocument[] {
  return state().fixture.documents;
}

export function getSupportingDocument(id: string): SupportingDocument | undefined {
  return state().fixture.documents.find((d) => d.id === id);
}

export function listFxObservations(): FxObservation[] {
  return state().fixture.fxObservations;
}

export function getProposal(id: string): Proposal | undefined {
  return state().proposals.find((p) => p.id === id);
}

export function getControlReport(proposalId: string): ControlReport | undefined {
  return state().controlReports.find((r) => r.proposalId === proposalId);
}

export function getCase(id: string): Case | undefined {
  return state().cases.find((c) => c.id === id);
}

/* --------------------------------------------- writes used by the agent loop */

export function appendEvent(event: VerityEvent): void {
  state().events.push(event);
}

/** Appends a revision. Earlier revisions are never mutated. */
export function appendProposal(proposal: Proposal): void {
  const s = state();
  s.proposals.push(proposal);
  const c = s.cases.find((x) => x.id === proposal.caseId);
  if (c && !c.revisions.includes(proposal.id)) c.revisions.push(proposal.id);
}

export function appendControlReport(report: ControlReport): void {
  const s = state();
  const existing = s.controlReports.findIndex((r) => r.proposalId === report.proposalId);
  if (existing >= 0) s.controlReports[existing] = report;
  else s.controlReports.push(report);
}

export function appendRouteDecision(decision: RouteDecision): void {
  const s = state();
  const existing = s.routeDecisions.findIndex((r) => r.proposalId === decision.proposalId);
  if (existing >= 0) s.routeDecisions[existing] = decision;
  else s.routeDecisions.push(decision);
}

export function setCaseState(caseId: string, next: Case['state']): void {
  const c = state().cases.find((x) => x.id === caseId);
  if (c) c.state = next;
}

export function nextProposalId(caseId: string, revision: number): string {
  return `PROP-${caseId.replace('CASE-', '')}-r${revision}`;
}

/**
 * Clears a case back to unmatched so the agent can investigate it again.
 * Refuses once a controller has decided — decisions are not replayable.
 */
export function resetCaseForInvestigation(caseId: string): { ok: boolean; error?: string } {
  const s = state();
  const c = s.cases.find((x) => x.id === caseId);
  if (!c) return { ok: false, error: `Unknown case ${caseId}` };
  if (s.controllerDecisions.some((d) => d.caseId === caseId)) {
    return { ok: false, error: `${caseId} has a controller decision and cannot be re-investigated` };
  }
  const proposalIds = new Set(c.revisions);
  s.proposals = s.proposals.filter((p) => !proposalIds.has(p.id));
  s.controlReports = s.controlReports.filter((r) => !proposalIds.has(r.proposalId));
  s.routeDecisions = s.routeDecisions.filter((r) => !proposalIds.has(r.proposalId));
  c.revisions = [];
  c.state = 'unmatched';
  return { ok: true };
}

export function setControlPRReplay(id: string, replay: ReplayReport): { ok: boolean; error?: string } {
  const s = state();
  const pr = s.controlPRs.find((p) => p.id === id);
  if (!pr) return { ok: false, error: `Unknown control PR ${id}` };
  pr.replay = replay;
  pr.status = 'replayed';
  s.events.push({
    type: 'control_pr_replayed',
    at: replay.ranAt,
    controlPrId: id,
    positivesCaught: replay.positives.filter((p) => p.caught).length,
    negativesAllowed: replay.negatives.filter((n) => n.stillAllowed).length,
  });
  return { ok: true };
}

export function addControlPR(pr: ControlPR): void {
  const s = state();
  if (s.controlPRs.some((existing) => existing.id === pr.id)) return;
  s.controlPRs.push(pr);
  s.events.push({ type: 'control_pr_drafted', at: pr.draftedAt, controlPrId: pr.id });
}
