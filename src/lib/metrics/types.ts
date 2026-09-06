import type { Metrics } from '@/lib/contracts/types';

export type BenchmarkRunRow = {
  caseId: string;
  proposalId: string;
  category: string;
  v1Status: string;
  v2Status: string;
  regression: boolean;
};

export type HeldOutSummary = {
  caseId: string;
  summary: string;
  underV1: string;
  underV2: string;
  note?: string;
};

export type DashboardPayload = {
  metrics: Metrics;
  summary: {
    unsafeEscapes: number;
    falsePositives: number;
    controllerTouchRate: string;
    safeAutoClearCoverage: string;
    repairSuccessRate: string;
    benchmarkRunCount: number;
    averageCostPerCase: string;
    averageLatencyMs: number;
  };
  heldOut: HeldOutSummary;
  controlPRReplay: {
    autoClearBefore: number;
    autoClearAfter: number;
    regression: boolean;
  } | null;
  benchmarkRuns: BenchmarkRunRow[];
  practitionerReviewed: boolean;
  benchmarkIsSynthetic: boolean;
  scoredCases: number;
  unlabelledCases: number;
  packVersion: string;
};
