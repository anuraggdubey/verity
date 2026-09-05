export type CaseState =
  | 'unmatched'
  | 'investigating'
  | 'proposed'
  | 'controls_failed'
  | 'revising'
  | 'merge_ready'
  | 'auto_cleared'
  | 'approved'
  | 'rejected'
  | 'escalated';

export type Disposition =
  | 'matched'
  | 'timing_difference'
  | 'bank_fee_journal'
  | 'fx_revaluation'
  | 'duplicate'
  | 'short_pay'
  | 'insufficient_evidence'
  | 'escalate';

export interface Case {
  id: string;
  bankLineId: string;
  candidateLedgerIds: string[];
  state: CaseState;
  materiality: 'immaterial' | 'material' | 'critical';
  autoClearPermitted: boolean;
  revisions: string[]; // Proposal ids, append-only, oldest first
  title?: string;
  amount: number;
  currency: string;
  bankDescription?: string;
  counterparty?: string;
  createdAt: string;
  workerActive?: boolean;
  workerId?: string;
  traceId?: string;
}

export interface Citation {
  claim: string;
  sourceType: 'bank_line' | 'ledger_entry' | 'document' | 'fx_observation';
  sourceId: string;
  field?: string;
  extractedSnippet?: string;
  rawPayload?: Record<string, unknown>;
}

export interface JournalLine {
  account: string;
  accountName?: string;
  entity: string;
  period: string;
  currency: string;
  debit: number;
  credit: number;
}

export interface ControlResult {
  code: string; // e.g. 'VERITY-FX-003'
  family: 'evidence_lineage' | 'accounting_integrity' | 'policy_provenance';
  status: 'pass' | 'blocked' | 'warn';
  claim?: string; // what the agent asserted
  failure?: string; // why it is wrong
  requiredRepair?: string; // what the agent must do next
}

export interface ControlReport {
  proposalId: string;
  packVersion: string;
  results: ControlResult[];
  blocked: boolean;
  evaluatedAt: string;
}

export interface Proposal {
  id: string;
  caseId: string;
  revision: number; // 1-based; revision 1 is immutable forever
  disposition: Disposition;
  narrative: string;
  citations: Citation[];
  journal: JournalLine[];
  fx?: {
    rate: number;
    rateDate: string;
    rateType: string;
    sourceId: string;
    sourceName?: string;
  };
  policyVersion: string;
  controlPackVersion: string;
  createdAt: string;
  traceId: string;
  controlReport?: ControlReport;
}

export interface RouteDecision {
  proposalId: string;
  lane: 'auto' | 'review' | 'escalate';
  reason: string;
}

export interface ControllerDecision {
  proposalId: string;
  decision: 'approve' | 'reject';
  reasonCode?: string; // enumerated; required on reject
  rationale?: string;
  decidedAt: string;
  controllerId: string;
}

export interface ConstrainedRule {
  field: string;
  comparator: 'equals' | 'one_of' | 'within_tolerance' | 'exists';
  tolerance?: number;
  allowedSources?: string[];
  targetFamily: 'evidence_lineage' | 'accounting_integrity' | 'policy_provenance';
}

export interface ReplayReport {
  totalFixtures: number;
  passedCount: number;
  blockedCount: number;
  positiveCaught: boolean;
  negativePassed: boolean;
  regressions: string[];
}

export interface ControlPR {
  id: string;
  failureMode: string;
  supportingProposalIds: string[]; // >= 2 required
  specAmendment: string; // plain language
  rule: ConstrainedRule; // schema-filled, never generated code
  positiveFixtures: string[]; // must now be caught
  negativeFixtures: string[]; // must still pass
  replay?: ReplayReport;
  status: 'draft' | 'replayed' | 'merged' | 'rejected';
  createdAt: string;
  author: string;
}
