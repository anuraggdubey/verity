/**
 * Verity shared contracts.
 *
 * Ownership: shared (*). Drafted from IMPLEMENTATION.md §3 by Builder C so the
 * product surface could be built before the kernel exists. Builder A owns this
 * file from the hour-2 freeze onward; B and C sign off. After the freeze, a
 * change needs three-way agreement and one PR that updates all consumers.
 *
 * Nothing in here imports from lib/data, lib/agent, or lib/controls. The
 * contract is the only thing the three builders share.
 *
 * MERGE NOTE: two drafts of this file existed briefly — the runtime one and a
 * display-oriented one written for the UI. This is the union. The executable
 * shapes (ConstrainedRule, ReplayReport) are the runtime's, because the control
 * engine and replay runner evaluate them; the UI's extra fields are carried as
 * optional. Read §3 of IMPLEMENTATION.md before changing anything here, and do
 * it in one PR that updates every consumer.
 */

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

export type Materiality = 'immaterial' | 'material' | 'critical';

export type Lane = 'auto' | 'review' | 'escalate';

export type ControlFamily =
  | 'evidence_lineage'
  | 'accounting_integrity'
  | 'policy_provenance';

export type SourceType =
  | 'bank_line'
  | 'ledger_entry'
  | 'document'
  | 'fx_observation';

/** A normalized line from the bank statement. Produced by A's matcher. */
export interface BankLine {
  id: string;
  postedDate: string;
  valueDate: string;
  amount: number;
  currency: string;
  counterparty: string;
  reference: string;
  description: string;
}

/** A cash-GL entry. */
export interface LedgerEntry {
  id: string;
  entryDate: string;
  account: string;
  entity: string;
  period: string;
  amount: number;
  currency: string;
  counterparty: string;
  reference: string;
  description: string;
  posted: boolean;
}

/** Supporting evidence the agent can retrieve — invoice, remittance, fee schedule. */
export interface SupportingDocument {
  id: string;
  docType: string;
  issuedDate: string;
  counterparty: string;
  amount: number;
  currency: string;
  reference: string;
  fields: Record<string, string | number>;
}

/** A single observed FX rate. Only some sources are policy-approved. */
export interface FxObservation {
  id: string;
  base: string;
  quote: string;
  rate: number;
  rateDate: string;
  rateType: 'spot' | 'closing' | 'average';
  sourceId: string;
  approved: boolean;
}

export interface Citation {
  claim: string;
  sourceType: SourceType;
  sourceId: string;
  field?: string;
  /* Display: the exact text or value pulled from the source record. */
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
  memo?: string;
}

export interface Case {
  id: string;
  bankLineId: string;
  candidateLedgerIds: string[];
  state: CaseState;
  materiality: Materiality;
  autoClearPermitted: boolean;
  /** Proposal ids, append-only, oldest first. Index 0 is immutable forever. */
  revisions: string[];
  openedAt: string;
  summary: string;
  /* Display fields used by the queue and case header. */
  title?: string;
  amount?: number;
  currency?: string;
  bankDescription?: string;
  counterparty?: string;
  createdAt?: string;
  /* Set while a worker is running against this case. */
  workerActive?: boolean;
  workerId?: string;
  traceId?: string;
}

export interface Proposal {
  id: string;
  caseId: string;
  /** 1-based. Revision 1 is never edited; a repair appends revision N+1. */
  revision: number;
  disposition: Disposition;
  narrative: string;
  citations: Citation[];
  /** Empty for non-posting dispositions. */
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
  /** Set on revisions produced by the repair loop. */
  repairedFrom?: string;
  /** Convenience for display; the store keeps reports separately. */
  controlReport?: ControlReport;
}

export interface ControlResult {
  /** e.g. 'VERITY-FX-003' */
  code: string;
  family: ControlFamily;
  status: 'pass' | 'blocked' | 'warn';
  title: string;
  /** What the agent asserted. */
  claim?: string;
  /** Why it is wrong. */
  failure?: string;
  /** What the agent must do next — this text is B's repair input. */
  requiredRepair?: string;
}

export interface ControlReport {
  proposalId: string;
  packVersion: string;
  results: ControlResult[];
  blocked: boolean;
  evaluatedAt: string;
}

export interface RouteDecision {
  proposalId: string;
  lane: Lane;
  reason: string;
}

export type RejectReasonCode =
  | 'UNSUPPORTED_FX_SOURCE'
  | 'WRONG_RATE_DATE'
  | 'MISSING_EVIDENCE'
  | 'WRONG_ACCOUNT'
  | 'WRONG_ENTITY'
  | 'DUPLICATE_POSTING'
  | 'CLOSED_PERIOD'
  | 'INSUFFICIENT_NARRATIVE'
  | 'OTHER';

export interface ControllerDecision {
  proposalId: string;
  caseId: string;
  decision: 'approve' | 'reject';
  /** Required on reject. Feeds B's failure grouping. */
  reasonCode?: RejectReasonCode;
  rationale?: string;
  decidedBy: string;
  decidedAt: string;
  controllerId?: string;
}

/**
 * A guardrail the model may propose but never activate. The model fills this
 * schema; it does not emit executable code.
 */
export interface ConstrainedRule {
  family: ControlFamily;
  /** Dotted path into the Proposal, e.g. 'fx.rateDate'. */
  selector: string;
  comparator:
    | 'equals'
    | 'not_equals'
    | 'in_allowlist'
    | 'not_in_allowlist'
    | 'within_tolerance'
    | 'exists';
  /** Named list in the policy pack, e.g. 'approved_fx_sources'. */
  allowlistRef?: string;
  tolerance?: { unit: 'days' | 'currency_minor' | 'percent'; value: number };
  compareTo?: string;
  onFail: { code: string; title: string; requiredRepair: string };
}

export interface ReplayReport {
  controlPrId: string;
  /* Aggregate counts for display. Derived from positives/negatives. */
  totalFixtures?: number;
  passedCount?: number;
  blockedCount?: number;
  regressions?: string[];
  packVersion: string;
  fingerprint: ReplayFingerprint;
  positives: { proposalId: string; caught: boolean }[];
  negatives: { proposalId: string; stillAllowed: boolean }[];
  autoClearBefore: number;
  autoClearAfter: number;
  ranAt: string;
}

export interface ReplayFingerprint {
  model: string;
  temperature: number;
  tools: string[];
  corePromptHash: string;
  policyVersion: string;
  controlPackVersion: string;
}

export interface ControlPR {
  id: string;
  failureMode: string;
  /** At least two reviewer-confirmed failures are required to draft one. */
  supportingProposalIds: string[];
  specAmendment: string;
  rule: ConstrainedRule;
  /** Proposal ids the rule must now catch. */
  positiveFixtures: string[];
  /** Proposal ids the rule must still allow. */
  negativeFixtures: string[];
  replay?: ReplayReport;
  status: 'draft' | 'replayed' | 'merged' | 'rejected';
  draftedAt: string;
  mergedAt?: string;
  author?: string;
}

/** Append-only audit event. The store is the only source of truth for metrics. */
export type VerityEvent =
  | { type: 'case_opened'; at: string; caseId: string }
  | { type: 'auto_cleared'; at: string; caseId: string; reason: string }
  | { type: 'investigation_started'; at: string; caseId: string; traceId: string }
  | { type: 'proposal_submitted'; at: string; caseId: string; proposalId: string; revision: number }
  | { type: 'controls_evaluated'; at: string; proposalId: string; blocked: boolean; codes: string[] }
  | { type: 'repair_requested'; at: string; proposalId: string; codes: string[] }
  | { type: 'routed'; at: string; proposalId: string; lane: Lane }
  | { type: 'controller_decided'; at: string; proposalId: string; decision: 'approve' | 'reject'; reasonCode?: RejectReasonCode }
  | { type: 'journal_posted'; at: string; proposalId: string; ledgerRecordId: string }
  | { type: 'reconciliation_closed'; at: string; unresolvedCount: number }
  | { type: 'control_pr_drafted'; at: string; controlPrId: string }
  | { type: 'control_pr_replayed'; at: string; controlPrId: string; positivesCaught: number; negativesAllowed: number }
  | { type: 'control_pr_merged'; at: string; controlPrId: string; packVersion: string }
  | { type: 'model_call'; at: string; traceId: string; caseId: string; tokensIn: number; tokensOut: number; costUsd: number; latencyMs: number }
  | { type: 'tool_call'; at: string; traceId: string; tool: string; ok: boolean };

/** Hash-linked sandbox ledger record. Written only on controller approval. */
export interface LedgerRecord {
  id: string;
  proposalId: string;
  lines: JournalLine[];
  postedAt: string;
  prevHash: string;
  hash: string;
}

export interface ReconciliationStatus {
  bankLineCount: number;
  autoClearedCount: number;
  exceptionCount: number;
  unresolvedCount: number;
  bankBalance: number;
  ledgerBalance: number;
  /** True only when unresolved === 0 and balances agree. */
  closed: boolean;
}

/** Raw counts only. No derived savings, no invented controller minutes. */
export interface Metrics {
  safety: {
    criticalUnsafeMergeReady: number;
    outOfPolicyPostings: number;
    guardrailFalsePositives: number;
  };
  efficiency: {
    controllerDecisions: number;
    casesTouchedByController: number;
    totalCases: number;
    safeAutoClears: number;
    repairAttempts: number;
    repairSuccesses: number;
    correctAbstentions: number;
  };
  quality: {
    correctDisposition: number;
    correctJournal: number;
    evidenceComplete: number;
    firstPassAccepted: number;
  };
  operational: {
    modelCalls: number;
    tokens: number;
    costUsd: number;
    medianLatencyMs: number;
    toolFailures: number;
  };
  /** Set when the benchmark has not been reviewed by a practitioner. */
  benchmarkIsSynthetic: boolean;
  packVersion: string;
}
