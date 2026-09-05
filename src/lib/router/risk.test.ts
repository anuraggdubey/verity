import { describe, expect, it } from 'vitest';

import type { Case, ControlReport, Proposal } from '@/lib/contracts/types';
import { routeProposal } from '@/lib/router/risk';

const baseCase: Case = {
  id: 'CASE-TEST',
  bankLineId: 'BL-007',
  candidateLedgerIds: [],
  state: 'proposed',
  materiality: 'immaterial',
  autoClearPermitted: true,
  revisions: ['PROP-TEST-r1'],
  openedAt: '2026-08-31T09:00:00Z',
  summary: 'test',
};

const baseProposal: Proposal = {
  id: 'PROP-TEST-r1',
  caseId: 'CASE-TEST',
  revision: 1,
  disposition: 'timing_difference',
  narrative: 'test',
  citations: [],
  journal: [],
  policyVersion: 'policy-2026.08',
  controlPackVersion: 'v1',
  createdAt: '2026-08-31T09:00:00Z',
  traceId: 'trace-test',
};

const cleanReport: ControlReport = {
  proposalId: 'PROP-TEST-r1',
  packVersion: 'v1',
  results: [{ code: 'VERITY-AI-001', family: 'accounting_integrity', status: 'pass', title: 'balanced' }],
  blocked: false,
  evaluatedAt: '2026-08-31T09:00:01Z',
};

describe('risk router', () => {
  it('auto-clears an enumerated non-posting disposition with a clean report', () => {
    expect(routeProposal(baseProposal, cleanReport, baseCase).lane).toBe('auto');
  });

  it('sends anything that posts to a controller', () => {
    const posting: Proposal = {
      ...baseProposal,
      disposition: 'bank_fee_journal',
      journal: [
        { account: '7110', entity: 'ACME-US', period: '2026-08', currency: 'USD', debit: 45, credit: 0 },
        { account: '1010', entity: 'ACME-US', period: '2026-08', currency: 'USD', debit: 0, credit: 45 },
      ],
    };
    expect(routeProposal(posting, cleanReport, baseCase).lane).toBe('review');
  });

  it('escalates an abstention', () => {
    const abstained: Proposal = { ...baseProposal, disposition: 'insufficient_evidence' };
    expect(routeProposal(abstained, cleanReport, baseCase).lane).toBe('escalate');
  });

  it('escalates when evidence controls warn', () => {
    const warned: ControlReport = {
      ...cleanReport,
      results: [
        ...cleanReport.results,
        { code: 'VERITY-EV-004', family: 'evidence_lineage', status: 'warn', title: 'missing evidence' },
      ],
    };
    expect(routeProposal(baseProposal, warned, baseCase).lane).toBe('escalate');
  });

  it('escalates a critical case even when controls pass', () => {
    expect(routeProposal(baseProposal, cleanReport, { ...baseCase, materiality: 'critical' }).lane).toBe(
      'escalate',
    );
  });

  it('never auto-clears a case the matcher did not mark auto-clearable', () => {
    expect(routeProposal(baseProposal, cleanReport, { ...baseCase, autoClearPermitted: false }).lane).toBe(
      'review',
    );
  });

  it('escalates a blocked proposal rather than clearing it', () => {
    const blocked: ControlReport = { ...cleanReport, blocked: true };
    expect(routeProposal(baseProposal, blocked, baseCase).lane).toBe('escalate');
  });
});
