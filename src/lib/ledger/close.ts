import type { Case, LedgerRecord, Proposal, ReconciliationStatus } from '@/lib/contracts/types';

const terminal = new Set(['auto_cleared', 'approved', 'rejected', 'escalated']);

export function calculateReconciliationStatus(input: {
  bankLineCount: number;
  autoClearedCount: number;
  exceptionCount: number;
  openingLedgerBalance: number;
  bankBalance: number;
  cashAccount: string;
  activeBankLineIds: string[];
  cases: Case[];
  proposals: Proposal[];
  ledgerRecords: LedgerRecord[];
}): ReconciliationStatus {
  const activeCases = input.cases.filter((item) => input.activeBankLineIds.includes(item.bankLineId));
  const activeProposalIds = new Set(input.proposals.filter((item) => activeCases.some((c) => c.id === item.caseId)).map((item) => item.id));
  const postedCash = input.ledgerRecords.filter((record) => activeProposalIds.has(record.proposalId)).flatMap((record) => record.lines).filter((line) => line.account === input.cashAccount).reduce((sum, line) => sum + line.credit - line.debit, 0);
  const ledgerBalance = Math.round((input.openingLedgerBalance - postedCash) * 100) / 100;
  const unresolvedCount = activeCases.filter((item) => !terminal.has(item.state)).length;
  return {
    bankLineCount: input.bankLineCount,
    autoClearedCount: input.autoClearedCount,
    exceptionCount: input.exceptionCount,
    unresolvedCount,
    bankBalance: input.bankBalance,
    ledgerBalance,
    closed: unresolvedCount === 0 && Math.abs(ledgerBalance - input.bankBalance) < 0.005,
  };
}
