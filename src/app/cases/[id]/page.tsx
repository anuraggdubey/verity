import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Download } from 'lucide-react';

import { AppShell, Card } from '@/components/app/AppShell';
import { CaseWorkspace } from '@/components/app/CaseWorkspace';
import { InvestigateButton } from '@/components/app/RunActions';
import { WorkerActivity } from '@/components/app/WorkerActivity';
import { StatusPill } from '@/components/ui/StatusPill';
import { getCaseDetail, resolveCitation } from '@/lib/demo/store';
import { money, titleCase } from '@/lib/ui';

export const dynamic = 'force-dynamic';

export default async function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = getCaseDetail(id);
  if (!detail) notFound();

  const latest = detail.revisions[detail.revisions.length - 1];
  const lane = latest?.route?.lane;

  // Resolve each citation to the record it points at, so the inspector shows the
  // source rather than asserting that one exists.
  const revisions = detail.revisions.map((revision) => ({
    ...revision,
    proposal: {
      ...revision.proposal,
      citations: revision.proposal.citations.map((citation) => {
        const source = resolveCitation(citation);
        const field = citation.field ? source?.[citation.field] : undefined;
        return {
          ...citation,
          rawPayload: source,
          extractedSnippet: source
            ? field !== undefined
              ? `${citation.field}: ${String(field)}`
              : JSON.stringify(source, null, 2)
            : undefined,
        };
      }),
    },
  }));

  return (
    <AppShell
      eyebrow={`Finance PR · policy ${latest?.proposal.policyVersion ?? '—'} · control pack ${detail.packVersion}`}
      title={detail.case.id}
      subtitle={detail.case.summary}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/queue"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-white/20"
          >
            <ArrowLeft className="h-3 w-3" /> Queue
          </Link>
          <a
            href={`/api/cases/${detail.case.id}/export`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-white/20"
          >
            <Download className="h-3 w-3" /> Export JSON
          </a>
          {!detail.decision && <InvestigateButton caseId={detail.case.id} />}
        </div>
      }
    >
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <StatusPill
          status={
            detail.case.state === 'controls_failed'
              ? 'blocked'
              : detail.case.state === 'escalated' || detail.case.state === 'rejected'
                ? 'escalate'
                : detail.case.state === 'approved' || detail.case.state === 'auto_cleared'
                  ? 'auto'
                  : 'review'
          }
          label={titleCase(detail.case.state)}
          size="sm"
        />
        {lane && <StatusPill status={lane} size="sm" />}
        <span className="font-mono text-[11px] text-zinc-500">
          {titleCase(detail.case.materiality)} materiality
        </span>
        <span className="font-mono text-[11px] text-zinc-500">
          {detail.revisions.length} revision{detail.revisions.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div>
          {detail.revisions.length === 0 ? (
            <Card title="No proposal yet">
              <p className="text-[13px] leading-relaxed text-zinc-400">
                This case has not been investigated. Run a worker to produce a proposal — it is
                evaluated against control pack {detail.packVersion} the moment it is submitted, and
                a blocked proposal goes back to the same worker for repair.
              </p>
              <div className="mt-4 flex justify-start">
                <InvestigateButton caseId={detail.case.id} />
              </div>
            </Card>
          ) : (
            <CaseWorkspace
              caseId={detail.case.id}
              revisions={revisions}
              decision={detail.decision}
              ledgerRecord={detail.ledgerRecord}
            />
          )}
        </div>

        <div className="space-y-4">
          <WorkerActivity caseId={detail.case.id} />

          {detail.bankLine && (
            <Card title="Bank line" hint={detail.bankLine.id}>
              <dl className="space-y-2.5 text-[12px]">
                <Row
                  label="Amount"
                  value={money(detail.bankLine.amount, detail.bankLine.currency)}
                  mono
                />
                <Row label="Posted" value={detail.bankLine.postedDate} />
                <Row label="Counterparty" value={detail.bankLine.counterparty} />
                <Row label="Reference" value={detail.bankLine.reference || '—'} mono />
                <Row label="Description" value={detail.bankLine.description} />
              </dl>
            </Card>
          )}

          {detail.candidates.length > 0 && (
            <Card
              title="Candidate ledger entries"
              hint="Suggested by matching — the worker still has to verify them"
            >
              <ul className="space-y-2.5">
                {detail.candidates.map((entry) => (
                  <li
                    key={entry.id}
                    className="border-b border-white/[0.05] pb-2.5 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="mono-num text-[12px] text-zinc-200">{entry.id}</span>
                      <span className="mono-num text-[12px] text-zinc-300">
                        {money(entry.amount, entry.currency)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500">
                      {entry.description}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] text-zinc-600">
                      {entry.account} · {entry.period} · {entry.posted ? 'posted' : 'unposted'}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>

      {/* The controller dock is fixed to the viewport bottom; keep space clear for it. */}
      <div className="h-24" />
    </AppShell>
  );
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
        {label}
      </dt>
      <dd className={`text-right text-zinc-300 ${mono ? 'mono-num' : ''}`}>{value}</dd>
    </div>
  );
}
