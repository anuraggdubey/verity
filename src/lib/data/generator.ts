import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { benchmarkReview } from '@/lib/data/review';
import { loadBenchmark } from '@/lib/data/benchmark';

export const BENCHMARK_INVARIANT = {
  bankLines: 29,
  autoMatched: 17,
  exceptions: 12,
} as const;

/** Validate the frozen reconciliation counts the demo depends on. */
export function validateBenchmarkCounts(): void {
  const { match } = loadBenchmark();
  const { bankLines, autoMatched, exceptions } = match.counts;
  if (
    bankLines !== BENCHMARK_INVARIANT.bankLines ||
    autoMatched !== BENCHMARK_INVARIANT.autoMatched ||
    exceptions !== BENCHMARK_INVARIANT.exceptions
  ) {
    throw new Error(
      `Benchmark invariant failed: expected ${BENCHMARK_INVARIANT.bankLines}/${BENCHMARK_INVARIANT.autoMatched}/${BENCHMARK_INVARIANT.exceptions}, received ${bankLines}/${autoMatched}/${exceptions}`,
    );
  }
}

/** Write bench/generated/reconciliation.json from the current frozen dataset. */
export function generateReconciliationArtifact(outputDir?: string): void {
  validateBenchmarkCounts();
  const { fixture, match } = loadBenchmark();
  const expectedPath = path.join(process.cwd(), 'bench', 'expected.json');
  const sourceHash = createHash('sha256')
    .update(readFileSync(path.join(process.cwd(), 'bench', 'fixtures', 'bank.csv')))
    .update(readFileSync(path.join(process.cwd(), 'bench', 'fixtures', 'ledger.csv')))
    .update(readFileSync(expectedPath))
    .digest('hex');

  const artifact = {
    schemaVersion: 2,
    seed: 'verity-demo-v2',
    sourceHash: `sha256:${sourceHash}`,
    review: benchmarkReview(),
    caseCount: fixture.cases.length,
    result: match,
    reconciliation: fixture.reconciliation,
  };

  const dir = outputDir ?? path.join(process.cwd(), 'bench', 'generated');
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, 'reconciliation.json'), `${JSON.stringify(artifact, null, 2)}\n`);
}
