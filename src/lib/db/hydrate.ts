import { bindRuntime } from '@/lib/data/access';
import { useDatabase } from '@/lib/db/env';

type KernelState = {
  fixture: import('@/lib/data/benchmark').BenchmarkFixture;
  cases: import('@/lib/contracts/types').Case[];
  proposals: import('@/lib/contracts/types').Proposal[];
  controlReports: import('@/lib/contracts/types').ControlReport[];
  routeDecisions: import('@/lib/contracts/types').RouteDecision[];
  controllerDecisions: import('@/lib/contracts/types').ControllerDecision[];
  ledgerRecords: import('@/lib/contracts/types').LedgerRecord[];
  controlPRs: import('@/lib/contracts/types').ControlPR[];
  events: import('@/lib/contracts/types').VerityEvent[];
  packVersion: string;
  activeBankLineIds: string[];
};

const globalRef = globalThis as unknown as {
  __verityState?: KernelState;
  __verityStoreInit?: Promise<void>;
};

function bindDataAccessFromState(s: KernelState): void {
  bindRuntime({
    bankLines: () => s.fixture.bankLines,
    ledgerEntries: () => s.fixture.ledgerEntries,
    documents: () => s.fixture.documents,
    fxObservations: () => s.fixture.fxObservations,
    controlPRs: () => s.controlPRs,
    packVersion: () => s.packVersion,
  });
}

export function isStoreHydrated(): boolean {
  return Boolean(globalRef.__verityState);
}

export async function hydrateStoreFromDatabase(): Promise<void> {
  if (!useDatabase()) return;
  const { runMigrations } = await import('@/lib/db/migrate');
  const migrated = await runMigrations();
  if (!migrated.ok) {
    console.warn('[verity] database migration:', migrated.message);
    return;
  }
  const { loadStateFromDatabase } = await import('@/lib/db/persistence');
  const loaded = await loadStateFromDatabase();
  globalRef.__verityState = loaded;
  bindDataAccessFromState(loaded);
}

export async function ensureStoreReady(): Promise<void> {
  if (!useDatabase()) return;
  if (globalRef.__verityState) {
    bindDataAccessFromState(globalRef.__verityState);
    return;
  }
  if (!globalRef.__verityStoreInit) {
    globalRef.__verityStoreInit = hydrateStoreFromDatabase().finally(() => {
      globalRef.__verityStoreInit = undefined;
    });
  }
  await globalRef.__verityStoreInit;
}

export function setHydratedState(state: KernelState): void {
  globalRef.__verityState = state;
  bindDataAccessFromState(state);
}

export function clearHydratedState(): void {
  globalRef.__verityState = undefined;
}
