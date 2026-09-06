import Link from 'next/link';
import { ArrowRight, CircleCheck, CircleDot, GitPullRequest } from 'lucide-react';

import { AppShell, Card, Metric } from '@/components/app/AppShell';
import { InvestigateButton, ResetButton } from '@/components/app/RunActions';
import { WorkerActivity } from '@/components/app/WorkerActivity';
import { StatusPill } from '@/components/ui/StatusPill';
import type { CaseState, Lane } from '@/lib/contracts/types';
import { listCases, meta, reconciliationStatus, type CaseRow } from '@/lib/demo/store';
import { money, titleCase } from '@/lib/ui';

export const dynamic = 'force-dynamic';

const LANES: { lane: Lane; title: string; blurb: string }[] = [
  {
    lane: 'auto',
    title: 'Auto',
    blurb: 'Enumerated non-posting dispositions, fully evidenced, immaterial, controls clean.',
  },
  {
    lane: 'review',
    title: 'Review',
    blurb: 'Anything that posts, plus anything needing controller judgment.',
  },
  {
    lane: 'escalate',
    title: 'Escalate',
    blurb: 'Missing or contradictory evidence, critical materiality, or a block with no repair left.',
  },
];

const laneAccent: Record<Lane, string> = {
  auto: 'border-emerald-500/25 bg-emerald-950/10',
  review: 'border-amber-500/25 bg-amber-950/10',
  escalate: 'border-rose-500/25 bg-rose-950/10',
};

function statePill(state: CaseState) {
  if (state === 'auto_cleared' || state === 'approved') return 'auto' as const;
  if (state === 'rejected' || state === 'escalated') return 'escalate' as const;
  if (state === 'controls_failed') return 'blocked' as const;
  if (state === 'investigating' || state === 'revising' || state === 'proposed') return 'active' as const;
  return 'review' as const;
}

export default function QueuePage() {
  const rows = listCases();
  const status = reconciliationStatus();
  const info = meta();

  return (
    <AppShell
      eyebrow={`${info.entity} · period ${info.period} · policy ${info.policyVersion} · control pack ${info.packVersion}`}
      title="Exception queue"
      subtitle="Deterministic matching cleared the routine lines. What is left is investigated by a worker, evaluated against the control pack, and routed to a lane. Nothing posts without a controller."
      actions={<ResetButton />}
    >
      <div className="space-y-5">
        <Card
          title="Reconciliation"
          right={
            status.closed ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-300">
                <CircleCheck className="h-3.5 w-3.5" /> Closed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-amber-300">
                <CircleDot className="h-3.5 w-3.5" /> {status.unresolvedCount} unresolved
              </span>
            )
          }
        >
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
            <Metric label="Bank lines" value={status.bankLineCount} />
            <Metric label="Auto-matched" value={status.autoClearedCount} sub="deterministic" />
            <Metric label="Exceptions" value={status.exceptionCount} sub="investigated" />
            <Metric
              label="Unresolved"
              value={status.unresolvedCount}
              tone={status.unresolvedCount === 0 ? 'good' : 'warn'}
            />
            <Metric label="Bank balance" value={money(status.bankBalance)} />
            <Metric
              label="Sandbox ledger"
              value={money(status.ledgerBalance)}
              tone={Math.abs(status.ledgerBalance - status.bankBalance) < 0.005 ? 'good' : 'warn'}
              sub={
                Math.abs(status.ledgerBalance - status.bankBalance) < 0.005
                  ? 'agrees with bank'
                  : `${money(Math.abs(status.ledgerBalance - status.bankBalance))} apart`
              }
            />
          </div>
        </Card>

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="grid gap-4 md:grid-cols-3">
            {LANES.map(({ lane, title, blurb }) => {
              const laneRows = rows.filter((row) => row.lane === lane);
              return (
                <section
                  key={lane}
                  className={`rounded-xl border ${laneAccent[lane]} flex flex-col overflow-hidden`}
                >
                  <header className="border-b border-white/[0.08] px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <StatusPill status={lane} label={title} size="sm" />
                      <span className="mono-num ml-auto text-sm font-semibold text-zinc-300">
                        {laneRows.length}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-500">{blurb}</p>
                  </header>
                  <div className="flex-1 space-y-2 p-2">
                    {laneRows.length === 0 ? (
                      <p className="px-2 py-6 text-center text-[12px] text-zinc-600">Empty</p>
                    ) : (
                      laneRows.map((row) => <CaseCard key={row.case.id} row={row} />)
                    )}
                  </div>
                </section>
              );
            })}
          </div>

          <div className="space-y-4">
            <WorkerActivity />
            <Card title="How a case moves">
              <ol className="space-y-2 text-[12px] leading-relaxed text-zinc-400">
                {[
                  'Worker investigates with four read-only tools.',
                  'It submits one structured proposal — never free text.',
                  'The control pack evaluates it deterministically.',
                  'A block returns the exact failure to the same worker, which files a new revision.',
                  'Clean proposals are routed: auto, review, or escalate.',
                  'A controller merges. Only then does anything reach the sandbox ledger.',
                ].map((step, index) => (
                  <li key={step} className="flex gap-2.5">
                    <span className="mono-num mt-0.5 text-[10px] text-zinc-600">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function CaseCard({ row }: { row: CaseRow }) {
  const { case: financeCase, bankLine, latestProposal, blocked, revisionCount, decision } = row;

  return (
    <article className="rounded-lg border border-white/[0.07] bg-[#0c0d12] p-3 transition-colors hover:border-white/[0.14]">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/cases/${financeCase.id}`}
          className="group inline-flex items-center gap-1.5 font-mono text-[12px] font-medium text-zinc-200 hover:text-white"
        >
          <GitPullRequest className="h-3.5 w-3.5 text-violet-400" />
          {financeCase.id}
          <ArrowRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
        </Link>
        <StatusPill status={statePill(financeCase.state)} label={titleCase(financeCase.state)} size="sm" />
      </div>

      <p className="mt-2 line-clamp-3 text-[12px] leading-relaxed text-zinc-400">
        {financeCase.summary}
      </p>

      <dl className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500">
        {bankLine && (
          <span className="mono-num text-zinc-300">{money(bankLine.amount, bankLine.currency)}</span>
        )}
        <span className="font-mono">{financeCase.bankLineId}</span>
        <span>{titleCase(financeCase.materiality)}</span>
        {revisionCount > 0 && (
          <span>
            {revisionCount} revision{revisionCount > 1 ? 's' : ''}
          </span>
        )}
        {blocked && <span className="font-semibold text-rose-400">BLOCKED</span>}
        {decision && (
          <span className={decision.decision === 'approve' ? 'text-emerald-400' : 'text-rose-400'}>
            {decision.decision === 'approve' ? 'Approved' : 'Rejected'}
            {decision.reasonCode ? ` · ${decision.reasonCode}` : ''}
          </span>
        )}
      </dl>

      {latestProposal?.fx && (
        <p className="mono-num mt-2 truncate rounded border border-white/[0.06] bg-black/30 px-2 py-1 text-[10px] text-zinc-500">
          FX {latestProposal.fx.rate} {latestProposal.fx.rateType} @ {latestProposal.fx.rateDate} ·{' '}
          {latestProposal.fx.sourceId}
        </p>
      )}

      {!decision && (
        <div className="mt-2.5 flex justify-end">
          <InvestigateButton caseId={financeCase.id} size="sm" />
        </div>
      )}
    </article>
  );
}
