import type {
  BankLine,
  Case,
  ControlReport,
  ControllerDecision,
  LedgerRecord,
  Proposal,
  RouteDecision,
} from '@/lib/contracts/types';

export type CaseRow = {
  case: Case;
  bankLine?: BankLine;
  latestProposal?: Proposal;
  report?: ControlReport;
  lane: RouteDecision['lane'];
  blocked: boolean;
  revisionCount: number;
  decision?: ControllerDecision;
};

export type CaseDetail = {
  case: Case;
  bankLine?: BankLine;
  candidates: import('@/lib/contracts/types').LedgerEntry[];
  revisions: { proposal: Proposal; report?: ControlReport; route?: RouteDecision }[];
  decision?: ControllerDecision;
  ledgerRecord?: LedgerRecord;
  packVersion: string;
};
