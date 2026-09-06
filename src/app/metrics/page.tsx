import { ShieldAlert } from 'lucide-react';

import { AppShell, Card, Metric } from '@/components/app/AppShell';
import { ResetButton } from '@/components/app/RunActions';
import { StatusPill } from '@/components/ui/StatusPill';
import { computeMetrics } from '@/lib/metrics/compute';
import { listEvents, reconciliationStatus } from '@/lib/demo/store';

export const dynamic = 'force-dynamic';

export default function MetricsPage() {
  const m = computeMetrics();
  const status = reconciliationStatus();
  const events = listEvents();

  const safetyClean =
    m.safety.criticalUnsafeMergeReady === 0 &&
    m.safety.outOfPolicyPostings === 0 &&
    m.safety.guardrailFalsePositives === 0;

  return (
    <AppShell
      eyebrow={`Control pack ${m.packVersion} · ${events.length} recorded events`}
      title="Benchmark results"
      subtitle="Raw counts, computed from the event log. No controller minutes, no production savings, no ratio chosen because it flatters the system."
      actions={
        <div className="flex items-center gap-2">
          {m.benchmarkIsSynthetic && (
            <StatusPill status="warn" label="Synthetic benchmark" size="sm" />
          )}
          <ResetButton />
        </div>
      }
    >
      <div className="space-y-5">
        <Card
          title="Safety gate"
          hint="The numbers that decide whether Verity works. Targets are all zero."
          right={
            <StatusPill
              status={safetyClean ? 'pass' : 'blocked'}
              label={safetyClean ? 'All targets met' : 'Target missed'}
              size="sm"
            />
          }
        >
          <div className="grid gap-5 sm:grid-cols-3">
            <Metric
              label="Critical unsafe merge-ready"
              value={m.safety.criticalUnsafeMergeReady}
              tone={m.safety.criticalUnsafeMergeReady === 0 ? 'good' : 'bad'}
              sub="escalation-worthy cases routed elsewhere"
            />
            <Metric
              label="Out-of-policy postings"
              value={m.safety.outOfPolicyPostings}
              tone={m.safety.outOfPolicyPostings === 0 ? 'good' : 'bad'}
              sub="approved journals that disagree with the labels"
            />
            <Metric
              label="Guardrail false positives"
              value={m.safety.guardrailFalsePositives}
              tone={m.safety.guardrailFalsePositives === 0 ? 'good' : 'bad'}
              sub="counterexamples a merged rule now blocks"
            />
          </div>
        </Card>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card title="Efficiency" hint="Controller touches, not time saved">
            <div className="grid gap-5 sm:grid-cols-2">
              <Metric label="Controller decisions" value={m.efficiency.controllerDecisions} />
              <Metric
                label="Cases touched by a controller"
                value={`${m.efficiency.casesTouchedByController} / ${m.efficiency.totalCases}`}
              />
              <Metric label="Safe auto-clears" value={m.efficiency.safeAutoClears} tone="good" />
              <Metric
                label="Repairs succeeded"
                value={`${m.efficiency.repairSuccesses} / ${m.efficiency.repairAttempts}`}
                sub="blocked revisions that cleared on the next attempt"
              />
              <Metric
                label="Correct abstentions"
                value={m.efficiency.correctAbstentions}
                sub="cases where refusing was the right answer"
              />
            </div>
          </Card>

          <Card title="Quality" hint={`Scored against labels held back from the agent`}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Metric
                label="Correct disposition"
                value={`${m.quality.correctDisposition} / ${m.efficiency.totalCases}`}
              />
              <Metric
                label="Correct journal"
                value={`${m.quality.correctJournal} / ${m.efficiency.totalCases}`}
              />
              <Metric
                label="Evidence-complete"
                value={`${m.quality.evidenceComplete} / ${m.efficiency.totalCases}`}
              />
              <Metric label="First-pass acceptance" value={m.quality.firstPassAccepted} />
            </div>
          </Card>
        </div>

        <Card title="Operational" hint="Cost is 0.00 unless per-1k prices are configured">
          <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-5">
            <Metric label="Model calls" value={m.operational.modelCalls} />
            <Metric label="Tokens" value={m.operational.tokens.toLocaleString('en-US')} />
            <Metric label="Cost (USD)" value={m.operational.costUsd.toFixed(3)} />
            <Metric label="Median latency" value={`${m.operational.medianLatencyMs}ms`} />
            <Metric
              label="Tool failures"
              value={m.operational.toolFailures}
              tone={m.operational.toolFailures > 0 ? 'warn' : 'default'}
            />
          </div>
        </Card>

        <Card title="Reconciliation">
          <div className="grid gap-5 sm:grid-cols-4">
            <Metric label="Bank lines" value={status.bankLineCount} />
            <Metric label="Exceptions" value={status.exceptionCount} />
            <Metric
              label="Unresolved"
              value={status.unresolvedCount}
              tone={status.unresolvedCount === 0 ? 'good' : 'warn'}
            />
            <Metric
              label="Close"
              value={status.closed ? 'Closed' : 'Open'}
              tone={status.closed ? 'good' : 'warn'}
            />
          </div>
        </Card>

        <p className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-950/10 p-3 text-[12px] leading-relaxed text-amber-200/80">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <span>
            The benchmark is synthetic and has not been reviewed by a practitioner. These are
            observed results on a frozen dataset, not operational savings. A run that replayed a
            recorded transcript tells you about the fixture, not about the agent.
          </span>
        </p>
      </div>
    </AppShell>
  );
}
