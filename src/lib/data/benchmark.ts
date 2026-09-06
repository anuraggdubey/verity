import { readFileSync } from 'node:fs';
import path from 'node:path';

import type {
  BankLine,
  Case,
  ControlPR,
  ControlReport,
  ControllerDecision,
  FxObservation,
  LedgerEntry,
  LedgerRecord,
  Proposal,
  RouteDecision,
  SupportingDocument,
  VerityEvent,
} from '@/lib/contracts/types';
import { loadFrozenReconciliation } from '@/lib/data/loader';
import type { MatchResult } from '@/lib/matcher/match';
import { matchReconciliation } from '@/lib/matcher/match';

export type BenchmarkFixture = {
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
    fingerprint: {
      model: string;
      temperature: number;
      tools: string[];
      corePromptHash: string;
      policyVersion: string;
      controlPackVersion: string;
    };
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

export type LoadedBenchmark = {
  fixture: BenchmarkFixture;
  match: MatchResult;
  activeBankLineIds: string[];
};

const ROOT = path.join(process.cwd(), 'bench', 'fixtures');

function loadJson<T>(file: string): T {
  return JSON.parse(readFileSync(path.join(ROOT, file), 'utf8')) as T;
}

function mergeById<T extends { id: string }>(base: T[], extra: T[]): T[] {
  const map = new Map(base.map((item) => [item.id, item]));
  for (const item of extra) map.set(item.id, item);
  return [...map.values()];
}

function autoClearCase(match: MatchResult['matches'][number], index: number): {
  case: Case;
  proposal: Proposal;
  report: ControlReport;
  route: RouteDecision;
} {
  const caseId = `CASE-A${String(index + 1).padStart(2, '0')}`;
  const proposalId = `PROP-A${String(index + 1).padStart(2, '0')}-r1`;
  const at = '2026-08-31T09:00:00Z';
  const proposal: Proposal = {
    id: proposalId,
    caseId,
    revision: 1,
    disposition: 'matched',
    narrative: `Deterministic matcher auto-cleared ${match.bankLineId} to ${match.ledgerEntryId}: ${match.reason}.`,
    citations: [
      { claim: 'Bank line amount and reference', sourceType: 'bank_line', sourceId: match.bankLineId },
      { claim: 'Matched ledger entry', sourceType: 'ledger_entry', sourceId: match.ledgerEntryId },
    ],
    journal: [],
    policyVersion: 'policy-2026.08',
    controlPackVersion: 'v1',
    createdAt: at,
    traceId: `trace-auto-${index + 1}`,
  };
  return {
    case: {
      id: caseId,
      bankLineId: match.bankLineId,
      candidateLedgerIds: [match.ledgerEntryId],
      state: 'auto_cleared',
      materiality: 'immaterial',
      autoClearPermitted: true,
      revisions: [proposalId],
      openedAt: at,
      summary: `Auto-cleared: ${match.reason}`,
    },
    proposal,
    report: {
      proposalId,
      packVersion: 'v1',
      results: [],
      blocked: false,
      evaluatedAt: at,
    },
    route: {
      proposalId,
      lane: 'auto',
      reason: match.reason,
    },
  };
}

function augmentAutoClearCases(fixture: BenchmarkFixture, match: MatchResult): void {
  const existingBankIds = new Set(fixture.cases.map((c) => c.bankLineId));
  let autoIndex = 0;
  for (const item of match.matches) {
    if (existingBankIds.has(item.bankLineId)) continue;
    const generated = autoClearCase(item, autoIndex);
    autoIndex += 1;
    fixture.cases.push(generated.case);
    fixture.proposals.push(generated.proposal);
    fixture.controlReports.push(generated.report);
    fixture.routeDecisions.push(generated.route);
    fixture.events.push({ type: 'auto_cleared', at: generated.proposal.createdAt, caseId: generated.case.id, reason: item.reason });
  }
}

function mergeSupplement(fixture: BenchmarkFixture): void {
  const supplement = loadJson<Partial<BenchmarkFixture>>('supplement.json');
  if (supplement.bankLines) fixture.bankLines = mergeById(fixture.bankLines, supplement.bankLines);
  if (supplement.ledgerEntries) fixture.ledgerEntries = mergeById(fixture.ledgerEntries, supplement.ledgerEntries);
  if (supplement.documents) fixture.documents = mergeById(fixture.documents, supplement.documents);
  if (supplement.fxObservations) fixture.fxObservations = mergeById(fixture.fxObservations, supplement.fxObservations);
  if (supplement.cases) fixture.cases.push(...supplement.cases);
  if (supplement.proposals) fixture.proposals.push(...supplement.proposals);
  if (supplement.controlReports) fixture.controlReports.push(...supplement.controlReports);
  if (supplement.routeDecisions) fixture.routeDecisions.push(...supplement.routeDecisions);
  if (supplement.events) fixture.events.push(...supplement.events);
}

/** Load the frozen benchmark: CSVs + demo.json + supplement + auto-clear cases. */
export function loadBenchmark(): LoadedBenchmark {
  const fixture = loadJson<BenchmarkFixture>('demo.json');
  const source = loadFrozenReconciliation();
  mergeSupplement(fixture);

  const bankById = new Map([...source.bankLines, ...fixture.bankLines].map((item) => [item.id, item]));
  const ledgerById = new Map([...source.ledgerEntries, ...fixture.ledgerEntries].map((item) => [item.id, item]));
  fixture.bankLines = [...bankById.values()];
  fixture.ledgerEntries = [...ledgerById.values()];

  // Matcher runs on CSV source records only. Overlay ledger rows exist for agent
  // evidence (e.g. duplicate-payment history) and must not change match counts.
  const match = matchReconciliation(source.bankLines, source.ledgerEntries);
  fixture.reconciliation = {
    bankLineCount: match.counts.bankLines,
    autoClearedCount: match.counts.autoMatched,
    exceptionCount: match.counts.exceptions,
  };

  augmentAutoClearCases(fixture, match);

  return {
    fixture,
    match,
    activeBankLineIds: match.exceptions.map((item) => item.bankLineId),
  };
}

export function countBenchmarkCases(fixture: BenchmarkFixture): number {
  return fixture.cases.length;
}
