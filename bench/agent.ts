/**
 * Run one case through the agent loop from the terminal.
 *
 *   npm run agent -- CASE-001          # offline, replays the recorded transcript
 *   npm run agent -- CASE-001 --live   # live model, needs VERITY_MODEL_* env
 *
 * A --live run is a real investigation and may end any way at all: a valid
 * proposal first time, a blocked proposal that gets repaired, or an abstention.
 * All three are correct outcomes for the harness.
 */

import { createProvider, modelConfig } from '../src/lib/agent/model';
import { fixtureTranscript } from '../src/lib/agent/fixture-transcripts';
import { investigateCase } from '../src/lib/agent/worker';
import { corePromptHash } from '../src/lib/agent/prompt';
import { getTrace } from '../src/lib/trace/trace';
import { resetCaseForInvestigation } from '../src/lib/demo/store';

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

async function main() {
  loadEnv();

  const args = process.argv.slice(2);
  const live = args.includes('--live');
  const caseId = args.find((arg) => !arg.startsWith('--')) ?? 'CASE-001';

  const config = { ...modelConfig(), provider: live ? ('openai' as const) : ('fixture' as const) };

  if (!live) {
    const transcript = fixtureTranscript(caseId);
    if (!transcript) {
      console.error(
        `No recorded transcript for ${caseId}. Run with --live, or record one in src/lib/agent/fixture-transcripts.ts.`,
      );
      process.exit(1);
    }
  }

  const provider = createProvider({
    config,
    fixtureTurns: fixtureTranscript(caseId) ?? [],
  });

  const reset = resetCaseForInvestigation(caseId);
  if (!reset.ok) {
    console.error(reset.error);
    process.exit(1);
  }

  console.log(
    `${live ? 'LIVE' : 'PRE-RECORDED'} run · ${caseId} · provider ${provider.id} · model ${provider.model} · temp ${provider.temperature} · prompt ${corePromptHash()}`,
  );
  console.log('='.repeat(100));

  const result = await investigateCase(caseId, { provider });

  for (const { proposal, report } of result.revisions) {
    console.log(
      `\nRevision ${proposal.revision} (${proposal.id}) — ${proposal.disposition} — ${report.blocked ? 'BLOCKED' : 'controls passed'}`,
    );
    if (proposal.fx) {
      console.log(
        `  fx: ${proposal.fx.rate} ${proposal.fx.rateType} dated ${proposal.fx.rateDate} from ${proposal.fx.sourceId}`,
      );
    }
    for (const line of proposal.journal) {
      const side = line.debit ? `Dr ${line.debit.toFixed(2)}` : `Cr ${line.credit.toFixed(2)}`;
      console.log(`  ${line.account.padEnd(6)} ${side}`);
    }
    for (const control of report.results.filter((r) => r.status !== 'pass')) {
      console.log(`  ${control.status.toUpperCase()} ${control.code} — ${control.failure ?? control.title}`);
      if (control.requiredRepair) console.log(`    repair: ${control.requiredRepair}`);
    }
  }

  console.log('\n' + '='.repeat(100));
  console.log(`Route:        ${result.route ? `${result.route.lane} — ${result.route.reason}` : 'none'}`);
  console.log(`Final state:  ${result.finalState}`);
  console.log(`Revisions:    ${result.revisions.length}   schema rejections: ${result.schemaRejections}`);
  if (result.stoppedBecause) console.log(`Stopped:      ${result.stoppedBecause}`);

  console.log('\nTrace');
  for (const entry of getTrace(result.traceId)) {
    const cost = entry.costUsd ? ` $${entry.costUsd.toFixed(4)}` : '';
    const tokens = entry.tokensIn ? ` ${entry.tokensIn}+${entry.tokensOut}tok` : '';
    console.log(
      `  ${String(entry.seq).padStart(2)} ${entry.kind.padEnd(7)} ${entry.name.padEnd(28)} ${entry.ok ? 'ok ' : 'ERR'}${entry.ms !== undefined ? ` ${entry.ms}ms` : ''}${tokens}${cost}${entry.detail ? ` · ${entry.detail}` : ''}`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
