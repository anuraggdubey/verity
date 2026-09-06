/**
 * Finance kernel runtime store.
 *
 * Ownership: Builder A (IMPLEMENTATION.md §2). Append-only events, case state,
 * sandbox ledger posting, and reconciliation close. Builder B and C consume this
 * through the stable export surface in ./index.ts and the legacy demo/store shim.
 */

export * from './kernel';
export type { CaseRow, CaseDetail } from './types';
