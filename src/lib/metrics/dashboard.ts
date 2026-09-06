import { benchmarkReview } from '@/lib/data/review';
import { computeMetrics } from '@/lib/metrics/compute';
import { heldOutCase, listCases, listControlPRs, listProposals } from '@/lib/demo/store';
import { CONTROL_ENGINE_EXPECTATIONS, loadExpectedLabels } from '@/lib/replay/fixtures';

import type { DashboardPayload, BenchmarkRunRow } from '@/lib/metrics/types';

export type { DashboardPayload, BenchmarkRunRow } from '@/lib/metrics/types';

function pct(numerator: number, denominator: number): string {
  if (denominator === 0) return '0%';
  return `${Math.round((numerator / denominator) * 1000) / 10}%`;
}

export function buildDashboardMetrics(): DashboardPayload {
  const metrics = computeMetrics();
  const rows = listCases();
  const labels = loadExpectedLabels();
  const proposals = listProposals();

  const autoClearEligible = rows.filter((row) => {
    const label = labels.cases[row.case.id];
    return label?.autoClearPermitted === true;
  }).length;

  const benchmarkRuns: BenchmarkRunRow[] = CONTROL_ENGINE_EXPECTATIONS.map((exp) => {
    const proposal = proposals.find((p) => p.id === exp.proposalId);
    const caseId = proposal?.caseId ?? exp.proposalId;
    const isCounterexample = exp.because.includes('counterexample');
    const regression = !exp.v1Blocked && exp.v2Blocked && isCounterexample;

    return {
      caseId,
      proposalId: exp.proposalId,
      category: exp.because,
      v1Status: exp.v1Blocked ? 'Blocked' : 'Passed',
      v2Status: exp.v2Blocked ? 'Blocked' : 'Passed',
      regression,
    };
  });

  const controlPR = listControlPRs().find((pr) => pr.id === 'CPR-001');
  const replay = controlPR?.replay;

  return {
    metrics,
    summary: {
      unsafeEscapes: metrics.safety.criticalUnsafeMergeReady,
      falsePositives: metrics.safety.guardrailFalsePositives,
      controllerTouchRate: pct(metrics.efficiency.casesTouchedByController, metrics.efficiency.totalCases),
      safeAutoClearCoverage: pct(metrics.efficiency.safeAutoClears, autoClearEligible),
      repairSuccessRate: pct(metrics.efficiency.repairSuccesses, metrics.efficiency.repairAttempts),
      benchmarkRunCount: rows.length,
      averageCostPerCase: `$${(metrics.operational.costUsd / Math.max(metrics.efficiency.totalCases, 1)).toFixed(3)}`,
      averageLatencyMs: metrics.operational.medianLatencyMs,
    },
    heldOut: heldOutCase(),
    controlPRReplay: replay
      ? {
          autoClearBefore: replay.autoClearBefore,
          autoClearAfter: replay.autoClearAfter,
          regression: replay.autoClearAfter < replay.autoClearBefore,
        }
      : null,
    benchmarkRuns,
    // bench/fixtures/review.json is the only place a human verdict is recorded;
    // the flag in expected.json is documentation, not evidence.
    practitionerReviewed: benchmarkReview().practitionerReviewed,
    unlabelledCases: Math.max(metrics.efficiency.totalCases - metrics.quality.scoredCases, 0),
    scoredCases: metrics.quality.scoredCases,
    benchmarkIsSynthetic: labels.benchmarkIsSynthetic,
    packVersion: metrics.packVersion,
  };
}
