/**
 * Control-pack replay harness.
 *
 *   npm run replay
 */

import { runControlEngineBench } from '../src/lib/replay/fixtures';
import { resetDemo } from '../src/lib/store';

function main() {
  resetDemo();
  const failures = runControlEngineBench();
  if (failures > 0) {
    console.error(`${failures} replay claim(s) did not hold.`);
    process.exit(1);
  }
  console.log('Replay complete: all control-engine claims hold.');
}

main();
