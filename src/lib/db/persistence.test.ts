import { beforeAll, describe, expect, it } from 'vitest';

import { isDatabaseConfigured } from '@/lib/db/client';
import { loadStateFromDatabase } from '@/lib/db/persistence';
import { runMigrations } from '@/lib/db/migrate';

const dbEnabled = isDatabaseConfigured();

describe.skipIf(!dbEnabled)('postgres persistence', () => {
  beforeAll(async () => {
    const result = await runMigrations();
    expect(result.ok).toBe(true);
  });

  it('loads the full benchmark fixture from neon', async () => {
    const state = await loadStateFromDatabase();
    expect(state.cases.length).toBeGreaterThanOrEqual(12);
    expect(state.proposals.length).toBeGreaterThan(0);
    expect(state.routeDecisions.length).toBeGreaterThan(0);
    expect(state.controlPRs.some((pr) => pr.id === 'CPR-001')).toBe(true);
    expect(state.events.length).toBeGreaterThan(0);
    expect(state.ledgerRecords.length).toBeGreaterThan(0);
    expect(state.fixture.heldOut.caseId).toBe('CASE-012');
  });
});

describe('postgres fallback', () => {
  it('skips integration tests when DATABASE_URL is unset', () => {
    if (!isDatabaseConfigured()) {
      expect(dbEnabled).toBe(false);
    }
  });
});
