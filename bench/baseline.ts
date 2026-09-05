/**
 * Baseline run: every case through the worker, first-pass proposals preserved.
 *
 *   npm run baseline          # pre-recorded transcripts, no key needed
 *   npm run baseline -- --live # live model for every case
 *
 * This is step 1 of the learning loop — run the frozen benchmark under the
 * current pack and keep what the agent actually produced. Cases a controller has
 * already decided are skipped rather than re-run; decisions are not replayable.
 */

import { createProvider, modelConfig } from '../src/lib/agent/model';
import { fixtureTranscript, isHandRecorded } from '../src/lib/agent/fixture-transcripts';
import { corePromptHash } from '../src/lib/agent/prompt';
import { investigateCase } from '../src/lib/agent/worker';
import {
  listCases,
  listControllerDecisions,
  packVersion,
  reconciliationStatus,
  resetCaseForInvestigation,
} from '../src/lib/demo/store';
import { computeMetrics } from '../src/lib/metrics/compute';

function loadEnv() {
  const loader = (process as NodeJS.Process & { loadEnvFile?: (path: string) => void }).loadEnvFile;
  if (typeof loader !== 'function') return;
  for (const file of ['.env.local', '.env']) {
    try {
      loader.call(process, file);
    } catch {
      // absent is fine
    }
  }
}

type Row = {
  caseId: string;
  status: string;
  source: string;
  revisions: number;
  firstPassCodes: string[];
  finalState: string;
  lane: string;
};

async function main() {
  loadEnv();
  const live = process.argv.includes('--live');
  const config = { ...modelConfig(), provider: live ? ('openai' as const) : ('fixture' as const) };

  console.log(
    `${live ? 'LIVE' : 'PRE-RECORDED'} baseline · pack ${packVersion()} · model ${config.model} · temp ${config.temperature} · prompt ${corePromptHash()}`,
  );
  console.log('='.repeat(112));

  const decided = new Set(listControllerDecisions().map((decision) => decision.caseId));
  const rows: Row[] = [];

  for (const row of listCases()) {
    const caseId = row.case.id;

    if (decided.has(caseId)) {
      rows.push({
        caseId,
        status: 'skipped',
        source: 'controller already decided',
        revisions: row.case.revisions.length,
        firstPassCodes: [],
        finalState: row.case.state,
        lane: row.lane,
      });
      continue;
    }

    // Derive the transcript before the reset removes the proposals it reads.
    const transcript = fixtureTranscript(caseId);
    if (!live && !transcript) {
      rows.push({
        caseId,
        status: 'skipped',
        source: 'no transcript, no key',
        revisions: 0,
        firstPassCodes: [],
        finalState: row.case.state,
        lane: row.lane,
      });
      continue;
    }

    const provider = createProvider({ config, fixtureTurns: transcript ?? [] });
    const reset = resetCaseForInvestigation(caseId);
    if (!reset.ok) {
      rows.push({
        caseId,
        status: 'skipped',
        source: reset.error ?? 'reset refused',
        revisions: 0,
        firstPassCodes: [],
        finalState: row.case.state,
        lane: row.lane,
      });
      continue;
    }

    const result = await investigateCase(caseId, { provider });
    const first = result.revisions[0];

    rows.push({
      caseId,
      status: result.stoppedBecause ? 'stopped' : 'ran',
      source: live ? 'live' : isHandRecorded(caseId) ? 'recorded' : 'derived',
      revisions: result.revisions.length,
      firstPassCodes: first
        ? first.report.results.filter((r) => r.status === 'blocked').map((r) => r.code)
        : [],
      finalState: result.finalState,
      lane: result.route?.lane ?? '—',
    });
  }

  console.log(
    'case       status   source     revs  first-pass blocks                  final state      lane',
  );
  console.log('-'.repeat(112));
  for (const row of rows) {
    console.log(
      `${row.caseId.padEnd(10)} ${row.status.padEnd(8)} ${row.source.slice(0, 10).padEnd(10)} ${String(row.revisions).padEnd(5)} ${(row.firstPassCodes.join(', ') || '—').padEnd(40)} ${row.finalState.padEnd(16)} ${row.lane}`,
    );
  }

  const status = reconciliationStatus();
  const metrics = computeMetrics();

  console.log('='.repeat(112));
  console.log(
    `Reconciliation: ${status.unresolvedCount} unresolved of ${status.exceptionCount} exceptions · ${status.closed ? 'CLOSED' : 'open'}`,
  );
  console.log(
    `Safety:   unsafe escapes ${metrics.safety.criticalUnsafeMergeReady} · out-of-policy postings ${metrics.safety.outOfPolicyPostings} · guardrail false positives ${metrics.safety.guardrailFalsePositives}`,
  );
  console.log(
    `Repairs:  ${metrics.efficiency.repairSuccesses}/${metrics.efficiency.repairAttempts} succeeded · safe auto-clears ${metrics.efficiency.safeAutoClears} · correct abstentions ${metrics.efficiency.correctAbstentions}`,
  );
  console.log(
    `Quality:  disposition ${metrics.quality.correctDisposition}/${metrics.efficiency.totalCases} · journal ${metrics.quality.correctJournal}/${metrics.efficiency.totalCases} · evidence-complete ${metrics.quality.evidenceComplete}/${metrics.efficiency.totalCases}`,
  );
  console.log(
    `Cost:     ${metrics.operational.modelCalls} model calls · ${metrics.operational.tokens} tokens · $${metrics.operational.costUsd.toFixed(3)} · median ${metrics.operational.medianLatencyMs}ms · tool failures ${metrics.operational.toolFailures}`,
  );
  if (!live) {
    console.log(
      '\nThese are replayed transcripts, not live model behaviour. Quality numbers from a pre-recorded run describe the fixture, not the agent.',
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
