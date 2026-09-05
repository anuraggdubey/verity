import type { ControlReport } from '@/lib/contracts/types';
import { repairMessage as buildRepairMessage, schemaErrorMessage as buildSchemaErrorMessage } from '@/lib/agent/prompt';

/**
 * Repair policy.
 *
 * Two kinds of rejection reach the agent, and they are not the same thing:
 *
 *   schema rejection — submit_proposal did not fit the schema. Nothing was
 *                      recorded; there is no revision and no control report.
 *   control block    — a real revision exists, immutably, and the control
 *                      engine blocked it. The feedback is the engine's own
 *                      text, and the next attempt becomes revision N+1.
 *
 * Feedback is routed to the same logical worker with its context intact, which
 * is why repair lives inside the worker run rather than as a fresh session.
 */

export const REPAIR_POLICY = {
  /** Model turns per case before the worker gives up and the case waits for a human. */
  maxToolTurns: 8,
  /** Control blocks the worker may attempt to repair before escalating. */
  maxRepairs: 2,
} as const;

export const repairMessage = buildRepairMessage;
export const schemaErrorMessage = buildSchemaErrorMessage;

/** The codes a repair attempt is trying to clear — recorded on the repair event. */
export function blockedCodes(report: ControlReport): string[] {
  return report.results.filter((result) => result.status === 'blocked').map((result) => result.code);
}

/** True when the next attempt would be a repair rather than a first attempt. */
export function isRepairable(report: ControlReport, repairsUsed: number): boolean {
  return report.blocked && repairsUsed < REPAIR_POLICY.maxRepairs;
}
