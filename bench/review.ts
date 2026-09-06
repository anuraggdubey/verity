/**
 * Practitioner review pack.
 *
 *   npm run review:pack              -> docs/practitioner-review-pack.md
 *   npm run review:import <file>     -> bench/fixtures/review.json
 *
 * Why this exists: the single biggest credibility gap in the benchmark is that
 * nobody who closes books for a living has checked it. Maximor's contribution
 * to this project is accounting judgement, not an SDK — so the integration that
 * matters is a document their practitioners can mark up, and an importer that
 * records their verdicts where the app reads them.
 *
 * Until a reviewer signs off, `practitionerReviewed` stays false and every
 * screen keeps saying the benchmark is synthetic. This script cannot set that
 * flag on its own: it only records what a named human returned.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  getCaseDetail,
  listCases,
  listFxObservations,
  listSupportingDocuments,
} from '../src/lib/demo/store';
import { policyPack } from '../src/lib/controls/engine';

type ExpectedCase = {
  split: string;
  expectedDisposition: string;
  expectedLane: string;
  autoClearPermitted: boolean;
  expectedJournalAccounts: string[];
  note?: string;
};

type ExpectedFile = {
  benchmarkIsSynthetic: boolean;
  practitionerReviewed: boolean;
  cases: Record<string, ExpectedCase>;
};

type ReviewFile = {
  origin: 'synthetic';
  practitionerReviewed: boolean;
  reviewer?: string;
  reviewedAt?: string;
  caseReviews: Record<string, 'approved' | 'corrected' | 'unreviewed'>;
  corrections?: Record<string, string>;
};

const EXPECTED_PATH = path.join(process.cwd(), 'bench', 'expected.json');
const REVIEW_PATH = path.join(process.cwd(), 'bench', 'fixtures', 'review.json');
const PACK_PATH = path.join(process.cwd(), 'docs', 'practitioner-review-pack.md');

const expected = (): ExpectedFile =>
  JSON.parse(readFileSync(EXPECTED_PATH, 'utf8')) as ExpectedFile;

const money = (value: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);

function pack() {
  const labels = expected().cases;
  const policy = policyPack();
  const rows = listCases();
  const documents = listSupportingDocuments();
  const observations = listFxObservations();

  const lines: string[] = [
    '# Practitioner review pack',
    '',
    'Verity is a merge gate for agent-generated finance work. Before it can claim',
    'anything about accuracy, someone who closes books needs to confirm that the',
    'cases are realistic and that the expected answers are right.',
    '',
    '**What we need from you:** for each case below, mark the verdict line',
    '`approved` if our expected disposition and journal are what you would do, or',
    '`corrected` with a note if they are not. A correction is more useful to us',
    'than an approval — it is the whole reason for asking.',
    '',
    'Return the filled verdicts as JSON (see the end of this file) and we will',
    'import them with `npm run review:import`.',
    '',
    '## Accounting policy in force',
    '',
    `- Entity ${policy.entities.join(', ')}, functional currency ${policy.functionalCurrency}.`,
    `- Open periods: ${policy.openPeriods.join(', ')}. Closed: ${policy.closedPeriods.join(', ')}.`,
    `- Foreign currency: ${policy.fx.requiredRateType} rate observed on the invoice transaction date, from ${policy.fx.approvedSources.join(' or ')}, tolerance ${policy.fx.rateDateToleranceDays} day(s).`,
    `- Permitted accounts: ${Object.entries(policy.chartOfAccounts).map(([code, name]) => `${code} ${name}`).join('; ')}.`,
    `- Non-posting dispositions that may clear without a controller: ${policy.autoClearDispositions.join(', ')}.`,
    `- Materiality: immaterial below ${money(policy.materiality.immaterialBelow)}, critical at or above ${money(policy.materiality.criticalAtOrAbove)}.`,
    '',
    '**Is this policy itself right?** If any line above is not how you would',
    'write it, say so — a wrong policy makes every expected answer wrong too.',
    '',
    '---',
    '',
  ];

  for (const row of rows) {
    const detail = getCaseDetail(row.case.id);
    const label = labels[row.case.id];
    if (!detail) continue;

    lines.push(`## ${row.case.id}`, '', row.case.summary, '');

    if (detail.bankLine) {
      lines.push(
        '**Bank statement line**',
        '',
        `- ${detail.bankLine.id} · ${detail.bankLine.postedDate} · ${money(detail.bankLine.amount, detail.bankLine.currency)}`,
        `- Counterparty: ${detail.bankLine.counterparty}`,
        `- Reference: ${detail.bankLine.reference || '(none)'}`,
        `- Description: ${detail.bankLine.description}`,
        '',
      );
    }

    if (detail.candidates.length > 0) {
      lines.push('**Candidate ledger entries**', '');
      for (const entry of detail.candidates) {
        lines.push(
          `- ${entry.id} · ${entry.entryDate} · account ${entry.account} · period ${entry.period} · ${money(entry.amount, entry.currency)} · ${entry.posted ? 'posted' : 'unposted'} — ${entry.description}`,
        );
      }
      lines.push('');
    }

    const reference = detail.bankLine?.reference;
    const relatedDocs = documents.filter(
      (doc) =>
        (reference && doc.reference === reference) ||
        (detail.bankLine && doc.counterparty === detail.bankLine.counterparty),
    );
    if (relatedDocs.length > 0) {
      lines.push('**Supporting evidence available to the agent**', '');
      for (const doc of relatedDocs) {
        const fields = Object.entries(doc.fields ?? {})
          .map(([key, value]) => `${key}=${value}`)
          .join(', ');
        lines.push(
          `- ${doc.id} · ${doc.docType} · issued ${doc.issuedDate} · ${money(doc.amount, doc.currency)} · ref ${doc.reference}${fields ? ` · ${fields}` : ''}`,
        );
      }
      lines.push('');
    } else {
      lines.push('**Supporting evidence available to the agent:** none.', '');
    }

    const proposal = detail.revisions[detail.revisions.length - 1]?.proposal;
    if (proposal?.fx) {
      const candidates = observations.filter(
        (observation) =>
          observation.base === 'EUR' &&
          observation.quote === (detail.bankLine?.currency ?? 'USD'),
      );
      lines.push('**FX observations the agent could see**', '');
      for (const observation of candidates) {
        lines.push(
          `- ${observation.id} · ${observation.rate} ${observation.rateType} · ${observation.rateDate} · ${observation.sourceId}${observation.approved ? '' : ' · NOT policy-approved'}`,
        );
      }
      lines.push('');
    }

    if (label) {
      lines.push(
        '**What Verity expects**',
        '',
        `- Disposition: \`${label.expectedDisposition}\``,
        `- Routing: \`${label.expectedLane}\``,
        `- Journal accounts: ${label.expectedJournalAccounts.length > 0 ? label.expectedJournalAccounts.map((account) => `\`${account}\``).join(', ') : 'none (non-posting)'}`,
        `- Benchmark split: ${label.split}`,
        label.note ? `- Note: ${label.note}` : '',
        '',
      );
    }

    lines.push(
      '**Your verdict** — replace one word, add a note if corrected:',
      '',
      '```',
      `${row.case.id}: approved | corrected`,
      'note:',
      '```',
      '',
      '---',
      '',
    );
  }

  const caseIds = rows.map((row) => row.case.id);
  lines.push(
    '## Returning your verdicts',
    '',
    'Send back a JSON file shaped like this:',
    '',
    '```json',
    JSON.stringify(
      {
        reviewer: 'Name, role, firm',
        reviewedAt: new Date().toISOString().slice(0, 10),
        caseReviews: Object.fromEntries(caseIds.map((id) => [id, 'approved'])),
        corrections: { [caseIds[0] ?? 'CASE-001']: 'What we got wrong, in your words.' },
      },
      null,
      2,
    ),
    '```',
    '',
    'Then: `npm run review:import <that-file.json>`.',
    '',
    'One narrow question, if you have time for nothing else:',
    '',
    '> When a reconciliation exception reaches a controller, what missing evidence',
    '> or policy violation most often forces it back to the preparer?',
    '',
  );

  writeFileSync(PACK_PATH, lines.filter((line) => line !== undefined).join('\n'), 'utf8');
  console.log(`Wrote ${PACK_PATH}`);
  console.log(`${rows.length} cases, ${Object.keys(labels).length} labelled.`);
}

function importVerdicts(filePath: string) {
  const returned = JSON.parse(readFileSync(filePath, 'utf8')) as {
    reviewer?: string;
    reviewedAt?: string;
    caseReviews?: Record<string, string>;
    corrections?: Record<string, string>;
  };

  if (!returned.reviewer) {
    console.error('The returned file must name the reviewer. An anonymous review is not a review.');
    process.exit(1);
  }

  const labels = expected().cases;
  const caseIds = Object.keys(labels);
  const verdicts: ReviewFile['caseReviews'] = {};
  for (const caseId of caseIds) {
    const verdict = returned.caseReviews?.[caseId];
    verdicts[caseId] =
      verdict === 'approved' || verdict === 'corrected' ? verdict : 'unreviewed';
  }

  const unreviewed = caseIds.filter((caseId) => verdicts[caseId] === 'unreviewed');
  const review: ReviewFile = {
    origin: 'synthetic',
    // Only true when every case in the benchmark carries a human verdict.
    practitionerReviewed: unreviewed.length === 0,
    reviewer: returned.reviewer,
    reviewedAt: returned.reviewedAt ?? new Date().toISOString(),
    caseReviews: verdicts,
    corrections: returned.corrections,
  };

  writeFileSync(REVIEW_PATH, `${JSON.stringify(review, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${REVIEW_PATH}`);
  console.log(
    `reviewer: ${review.reviewer} · approved ${caseIds.filter((id) => verdicts[id] === 'approved').length} · corrected ${caseIds.filter((id) => verdicts[id] === 'corrected').length} · unreviewed ${unreviewed.length}`,
  );
  if (unreviewed.length > 0) {
    console.log(
      `practitionerReviewed stays false: ${unreviewed.join(', ')} still have no verdict.`,
    );
  } else {
    console.log('practitionerReviewed is now true. The benchmark can drop the "synthetic" caveat.');
  }
  if (review.corrections && Object.keys(review.corrections).length > 0) {
    console.log('\nCorrections to act on:');
    for (const [caseId, note] of Object.entries(review.corrections)) {
      console.log(`  ${caseId}: ${note}`);
    }
  }
}

const [mode, target] = process.argv.slice(2);
if (mode === 'import') {
  if (!target) {
    console.error('Usage: npm run review:import <returned-verdicts.json>');
    process.exit(1);
  }
  importVerdicts(target);
} else {
  pack();
}
