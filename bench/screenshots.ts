/**
 * Capture the screenshots used in the README.
 *
 *   npm run screenshots                      # against the live deployment
 *   npm run screenshots -- http://localhost:3000
 *
 * Uses whichever Chrome or Edge is already installed rather than downloading a
 * browser. Every shot is taken against a real running app on the frozen
 * benchmark, so the figures in the README are the app's own — nothing here
 * mocks a screen.
 */

import { mkdirSync } from 'node:fs';
import path from 'node:path';

import { chromium, type Browser } from 'playwright-core';

const OUT = path.join(process.cwd(), 'docs', 'screenshots');

const SHOTS: { file: string; url: string; width: number; height: number; wait?: number }[] = [
  { file: 'queue.png', url: '/queue', width: 1440, height: 900, wait: 2500 },
  { file: 'finance-pr.png', url: '/cases/CASE-001', width: 1440, height: 1100, wait: 3000 },
  { file: 'controls.png', url: '/controls', width: 1440, height: 1000, wait: 2500 },
  { file: 'metrics.png', url: '/metrics', width: 1440, height: 900, wait: 2500 },
  { file: 'queue-mobile.png', url: '/queue', width: 390, height: 844, wait: 2500 },
];

async function launch(): Promise<Browser> {
  for (const channel of ['chrome', 'msedge'] as const) {
    try {
      return await chromium.launch({ channel });
    } catch {
      // try the next installed browser
    }
  }
  throw new Error(
    'No installed Chrome or Edge found. Install one, or run `npx playwright install chromium` and re-run.',
  );
}

async function main() {
  const base = (process.argv[2] ?? 'https://verity-merge-control.vercel.app').replace(/\/$/, '');
  mkdirSync(OUT, { recursive: true });

  const browser = await launch();
  try {
    for (const shot of SHOTS) {
      const page = await browser.newPage({
        viewport: { width: shot.width, height: shot.height },
        deviceScaleFactor: 2,
      });
      await page.goto(`${base}${shot.url}`, { waitUntil: 'networkidle', timeout: 60_000 });
      await page.waitForTimeout(shot.wait ?? 2000);
      await page.screenshot({ path: path.join(OUT, shot.file) });
      await page.close();
      console.log(`captured ${shot.file}  ${shot.width}x${shot.height}  ${base}${shot.url}`);
    }
  } finally {
    await browser.close();
  }

  console.log(`\nWrote ${SHOTS.length} screenshots to docs/screenshots/`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
