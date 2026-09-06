import type {
  Case,
  ControlPR,
  ControllerDecision,
  ControlReport,
  LedgerRecord,
  Proposal,
  RouteDecision,
  VerityEvent,
} from '@/lib/contracts/types';
import { useDatabase } from '@/lib/db/env';
import {
  deleteProposalsForCase,
  persistCase,
  persistControlPR,
  persistControlReport,
  persistControllerDecision,
  persistEvent,
  persistLedgerRecord,
  persistPackVersion,
  persistProposal,
  persistRouteDecision,
  replaceAllEvents,
} from '@/lib/db/persistence';

function fire(promise: Promise<void>): void {
  if (!useDatabase()) return;
  void promise.catch((err) => console.error('[verity] database persist failed:', err));
}

export const dbSync = {
  case: (row: Case) => fire(persistCase(row)),
  proposal: (row: Proposal) => fire(persistProposal(row)),
  controlReport: (row: ControlReport) => fire(persistControlReport(row)),
  routeDecision: (row: RouteDecision) => fire(persistRouteDecision(row)),
  controllerDecision: (row: ControllerDecision) => fire(persistControllerDecision(row)),
  ledgerRecord: (row: LedgerRecord) => fire(persistLedgerRecord(row)),
  controlPR: (row: ControlPR) => fire(persistControlPR(row)),
  event: (row: VerityEvent) => fire(persistEvent(row)),
  packVersion: (version: string) => fire(persistPackVersion(version)),
  events: (rows: VerityEvent[]) => fire(replaceAllEvents(rows)),
  deleteProposals: (ids: string[]) => fire(deleteProposalsForCase(ids)),
};
