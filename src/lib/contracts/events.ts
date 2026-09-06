/**
 * Append-only audit event union.
 *
 * Ownership: shared (*). Event shapes are defined alongside the rest of the
 * contract in types.ts; this module is the import surface IMPLEMENTATION.md §3
 * names explicitly.
 */
export type { VerityEvent } from '@/lib/contracts/types';
