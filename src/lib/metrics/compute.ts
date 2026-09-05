import { readFileSync } from 'node:fs';
import path from 'node:path';

import type { Metrics, VerityEvent } from '@/lib/contracts/types';
import {
  listCases,
  listControlPRs,
  listControlReports,
  listEvents,
  listLedgerRecords,
  listProposals,
  listRouteDecisions,
  meta,
  packVersion,
} from '@/lib/demo/store';

/**
 * Raw counts, computed from the event log plus the held-back expected labels.
 * No derived savings, no controller minutes, no ratios that flatter the system.
 * If a number cannot be computed from an event, it does not go on the screen.
 */

type ExpectedCase = {
  split: 'discovery' | 'held_out' | 'counterexample';
  expectedDisposition: string;
  expectedLane: 'auto' | 'review' | 'escalate';
  autoClearPermitted: boolean;
  expectedJournalAccounts: string[];
  note?: string;
};

type ExpectedFile = {
  benchmarkIsSynthetic: boolean;
  practitionerReviewed: boolean;
  cases: Record<string, ExpectedCase>;
};

const EXPECTED_PATH = path.join(process.cwd(), 'bench', 'expected.json');

function expected(): ExpectedFile {
  return JSON.parse(readFileSync(EXPECTED_PATH, 'utf8')) as ExpectedFile;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid];
}

function sameAccounts(a: string[], b: string[]): boolean {
  const norm = (xs: string[]) => [...new Set(xs)].sort().join(',');
  return norm(a) === norm(b);
}

export function computeMetrics(): Metrics {
  const rows = listCases();
  const proposals = listProposals();
  const reports = listControlReports();
  const routes = listRouteDecisions();
  const records = listLedgerRecords();
  const events = listEvents();
  const labels = expected().cases;

  const modelCalls = events.filter((e): e is Extract<VerityEvent, { type: 'model_call' }> => e.type === 'model_call');
  const toolCalls = events.filter((e): e is Extract<VerityEvent, { type: 'tool_call' }> => e.type === 'tool_call');
  const decisions = events.filter((e): e is Extract<VerityEvent, { type: 'controller_decided' }> => e.type === 'controller_decided');
  const repairs = events.filter((e): e is Extract<VerityEvent, { type: 'repair_requested' }> => e.type === 'repair_requested');

  // A repair succeeded when the case's next revision cleared controls.
  const repairSuccesses = repairs.filter((r) => {
    const blocked = proposals.find((p) => p.id === r.proposalId);
    if (!blocked) return false;
    const next = proposals.find(
      (p) => p.caseId === blocked.caseId && p.revision === blocked.revision + 1,
    );
    if (!next) return false;
    return reports.find((rep) => rep.proposalId === next.id)?.blocked === false;
  }).length;

  let criticalUnsafeMergeReady = 0;
  let outOfPolicyPostings = 0;
  let safeAutoClears = 0;
  let correctAbstentions = 0;
  let correctDisposition = 0;
  let correctJournal = 0;
  let evidenceComplete = 0;
  let firstPassAccepted = 0;

  for (const row of rows) {
    const label = labels[row.case.id];
    const latest = row.latestProposal;
    if (!label || !latest) continue;

    if (latest.disposition === label.expectedDisposition) correctDisposition += 1;
    if (sameAccounts(latest.journal.map((l) => l.account), label.expectedJournalAccounts)) {
      correctJournal += 1;
    }

    const report = reports.find((r) => r.proposalId === latest.id);
    const evidenceClean =
      latest.citations.length > 0 &&
      (report?.results ?? []).every(
        (r) => r.family !== 'evidence_lineage' || r.status === 'pass',
      );
    if (evidenceClean) evidenceComplete += 1;

    // An escalation-worthy case that was routed anywhere else is an unsafe escape.
    const lane = routes.find((r) => r.proposalId === latest.id)?.lane ?? row.lane;
    if (label.expectedLane === 'escalate' && lane !== 'escalate') criticalUnsafeMergeReady += 1;

    if (row.case.state === 'auto_cleared') {
      if (label.expectedLane === 'auto' && label.autoClearPermitted) safeAutoClears += 1;
    }

    if (label.expectedDisposition === 'insufficient_evidence' && latest.disposition === 'insufficient_evidence') {
      correctAbstentions += 1;
    }

    const firstReport = reports.find((r) => r.proposalId === row.case.revisions[0]);
    const accepted = row.case.state === 'approved' || row.case.state === 'auto_cleared';
    if (accepted && firstReport?.blocked === false && row.case.revisions.length === 1) {
      firstPassAccepted += 1;
    }
  }

  for (const record of records) {
    const proposal = proposals.find((p) => p.id === record.proposalId);
    const label = proposal ? labels[proposal.caseId] : undefined;
    if (!proposal || !label) continue;
    if (!sameAccounts(proposal.journal.map((l) => l.account), label.expectedJournalAccounts)) {
      outOfPolicyPostings += 1;
    }
  }

  // A false positive is a counterexample a merged control stopped allowing.
  const guardrailFalsePositives = listControlPRs()
    .filter((pr) => pr.status === 'merged')
    .flatMap((pr) => pr.replay?.negatives ?? [])
    .filter((n) => !n.stillAllowed).length;

  const casesTouched = new Set(
    decisions
      .map((d) => proposals.find((p) => p.id === d.proposalId)?.caseId)
      .filter((id): id is string => Boolean(id)),
  );

  return {
    safety: {
      criticalUnsafeMergeReady,
      outOfPolicyPostings,
      guardrailFalsePositives,
    },
    efficiency: {
      controllerDecisions: decisions.length,
      casesTouchedByController: casesTouched.size,
      totalCases: rows.length,
      safeAutoClears,
      repairAttempts: repairs.length,
      repairSuccesses,
      correctAbstentions,
    },
    quality: {
      correctDisposition,
      correctJournal,
      evidenceComplete,
      firstPassAccepted,
    },
    operational: {
      modelCalls: modelCalls.length,
      tokens: modelCalls.reduce((s, e) => s + e.tokensIn + e.tokensOut, 0),
      costUsd: Math.round(modelCalls.reduce((s, e) => s + e.costUsd, 0) * 1000) / 1000,
      medianLatencyMs: median(modelCalls.map((e) => e.latencyMs)),
      toolFailures: toolCalls.filter((e) => !e.ok).length,
    },
    benchmarkIsSynthetic: meta().benchmarkIsSynthetic,
    packVersion: packVersion(),
  };
}
