import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { loadFrozenReconciliation } from '../src/lib/data/loader';
import { benchmarkReview } from '../src/lib/data/review';
import { matchReconciliation } from '../src/lib/matcher/match';

const { bankLines, ledgerEntries } = loadFrozenReconciliation();
const result = matchReconciliation(bankLines, ledgerEntries, {
  cashAccount: '1010',
  amountToleranceMinorUnits: 1,
  dateToleranceDays: 5,
});
if (result.counts.bankLines !== 24 || result.counts.autoMatched !== 17 || result.counts.exceptions !== 7) {
  throw new Error(`Frozen reconciliation must be 24/17/7; received ${result.counts.bankLines}/${result.counts.autoMatched}/${result.counts.exceptions}`);
}

const expectedPath = path.join(process.cwd(), 'bench', 'expected.json');
const sourceHash = createHash('sha256')
  .update(readFileSync(path.join(process.cwd(), 'bench', 'fixtures', 'bank.csv')))
  .update(readFileSync(path.join(process.cwd(), 'bench', 'fixtures', 'ledger.csv')))
  .update(readFileSync(expectedPath))
  .digest('hex');

const artifact = {
  schemaVersion: 1,
  seed: 'verity-demo-v1',
  sourceHash: `sha256:${sourceHash}`,
  review: benchmarkReview(),
  result,
};
const outputDir = path.join(process.cwd(), 'bench', 'generated');
mkdirSync(outputDir, { recursive: true });
writeFileSync(path.join(outputDir, 'reconciliation.json'), `${JSON.stringify(artifact, null, 2)}\n`);
console.log(`Generated deterministic reconciliation: ${result.counts.autoMatched} matches, ${result.counts.exceptions} exceptions.`);
