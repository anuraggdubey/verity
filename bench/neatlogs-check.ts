/**
 * Verify the Neatlogs trace ingest actually accepts what we send.
 *
 *   npm run neatlogs:check
 *
 * The runtime sink is deliberately fire-and-forget — an observability outage
 * must never change a control result — which means a rejected trace would be
 * invisible. This script is the opposite: it sends one small trace and prints
 * the exact status and body, so "traces are flowing" is something we checked
 * rather than something we assumed.
 */

import { neatlogsConfig } from '../src/lib/trace/neatlogs';

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

  const config = neatlogsConfig();
  if (!config) {
    console.error('No NEATLOGS_API_KEY configured — nothing to check.');
    process.exit(1);
  }

  console.log(`endpoint: ${config.endpoint}`);
  console.log(`project:  ${config.project}`);
  console.log(`key:      ${config.apiKey.slice(0, 4)}…${config.apiKey.slice(-4)} (${config.apiKey.length} chars)`);

  const payload = {
    name: 'verity connectivity check',
    project: config.project,
    kind: 'AGENT',
    status: 'OK',
    children: [
      {
        name: 'controls:CHECK-001',
        kind: 'TOOL',
        output: 'connectivity check — not a real reconciliation',
        status: 'OK',
      },
    ],
    metadata: { check: true, benchmark_is_synthetic: true },
  };

  const started = Date.now();
  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  const body = await response.text();
  console.log(`\nHTTP ${response.status} ${response.statusText} in ${Date.now() - started}ms`);
  console.log(body.slice(0, 600) || '(empty body)');

  if (!response.ok) {
    console.error('\nIngest rejected the trace. Traces are NOT flowing.');
    process.exit(1);
  }
  console.log('\nAccepted. Traces are flowing.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
