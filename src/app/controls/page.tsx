import Link from 'next/link';
import { AlertCircle, Check, Users, X } from 'lucide-react';

import { AppShell, Card, EmptyState } from '@/components/app/AppShell';
import { ControlPRActions, DraftControlPRButton } from '@/components/app/ControlPRPanel';
import { StatusPill } from '@/components/ui/StatusPill';
import { heldOutCase, listControlPRs, packVersion, proposalsById } from '@/lib/demo/store';
import { groupReviewerRejections } from '@/lib/learning/grouping';

export const dynamic = 'force-dynamic';

export default function ControlsPage() {
  const groups = groupReviewerRejections();
  const controlPRs = listControlPRs();
  const heldOut = heldOutCase();
  const pack = packVersion();
  const merged = controlPRs.some((pr) => pr.status === 'merged');

  return (
    <AppShell
      eyebrow={`Active control pack ${pack}`}
      title="Control PRs"
      subtitle="A repeated, reviewer-confirmed failure becomes a proposed guardrail. The model fills a constrained rule schema — it cannot write code and cannot activate a rule. A controller merges it, or it stays a draft."
      actions={<DraftControlPRButton />}
    >
      <div className="space-y-5">
        <Card
          title="Reviewer-grounded failure groups"
          hint="Grouped by the controller's own reason code. Two supporting failures minimum — one rejection is an incident, not a pattern."
          right={<span className="font-mono">{groups.length} group(s)</span>}
        >
          {groups.length === 0 ? (
            <EmptyState>
              No group yet. Reject at least two proposals with the same reason code on the case
              pages, and the pattern appears here.
            </EmptyState>
          ) : (
            <ul className="space-y-3">
              {groups.map((group) => (
                <li key={group.id} className="rounded-lg border border-white/[0.07] bg-black/20 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-zinc-500" />
                    <span className="font-mono text-[12px] text-zinc-200">{group.reasonCode}</span>
                    <StatusPill
                      status="warn"
                      label={`${group.proposalIds.length} rejections`}
                      size="sm"
                    />
                    <span className="text-[11px] text-zinc-500">
                      rationale overlap {group.coherence}
                    </span>
                    <span className="ml-auto font-mono text-[11px] text-zinc-500">
                      {group.caseIds.join(' · ')}
                    </span>
                  </div>
                  {group.sharedTraits.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {group.sharedTraits.map((trait) => (
                        <li key={trait} className="flex gap-2 text-[12px] text-zinc-400">
                          <span className="text-zinc-600">—</span>
                          {trait}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-3 flex justify-end">
                    <DraftControlPRButton reasonCode={group.reasonCode} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {controlPRs.length === 0 ? (
          <EmptyState>No Control PR drafted yet.</EmptyState>
        ) : (
          controlPRs.map((pr) => {
            const supporting = proposalsById(pr.supportingProposalIds);
            return (
              <Card
                key={pr.id}
                title={pr.failureMode}
                hint={`${pr.id} · ${pr.supportingProposalIds.length} supporting failures · drafted ${pr.draftedAt.replace('T', ' ').slice(0, 19)}`}
                right={
                  <StatusPill
                    status={pr.status === 'merged' ? 'pass' : pr.status === 'replayed' ? 'active' : 'warn'}
                    label={pr.status}
                    size="sm"
                  />
                }
              >
                <div className="space-y-5">
                  <section>
                    <h3 className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
                      Specification amendment
                    </h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-300">
                      {pr.specAmendment}
                    </p>
                  </section>

                  <section>
                    <h3 className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
                      Constrained rule
                    </h3>
                    <div className="mt-2 overflow-x-auto rounded-lg border border-white/[0.07] bg-black/40 p-3">
                      <code className="mono-num whitespace-pre text-[12px] text-zinc-300">
                        {`family     ${pr.rule.family}
selector   ${pr.rule.selector}
comparator ${pr.rule.comparator}${pr.rule.compareTo ? `\ncompareTo  ${pr.rule.compareTo}` : ''}${
                          pr.rule.allowlistRef ? `\nallowlist  ${pr.rule.allowlistRef}` : ''
                        }${
                          pr.rule.tolerance
                            ? `\ntolerance  ${pr.rule.tolerance.value} ${pr.rule.tolerance.unit}`
                            : ''
                        }
blocks as  ${pr.rule.onFail.code}`}
                      </code>
                    </div>
                    <p className="mt-2 rounded-lg border border-white/[0.06] bg-black/20 p-3 text-[12px] leading-relaxed text-zinc-400">
                      <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
                        Repair text the agent will receive
                      </span>
                      {pr.rule.onFail.requiredRepair}
                    </p>
                  </section>

                  <section>
                    <h3 className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
                      Supporting failures
                    </h3>
                    <ul className="mt-2 space-y-1.5">
                      {supporting.map((proposal) => (
                        <li key={proposal.id} className="text-[12px]">
                          <Link
                            href={`/cases/${proposal.caseId}`}
                            className="mono-num text-violet-300 hover:underline"
                          >
                            {proposal.caseId}
                          </Link>
                          <span className="text-zinc-500">
                            {' '}
                            · {proposal.id}
                            {proposal.fx
                              ? ` · ${proposal.fx.rateType} rate dated ${proposal.fx.rateDate}`
                              : ''}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section>
                    <h3 className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
                      Replay
                    </h3>
                    {pr.replay ? (
                      <div className="mt-2 space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <FixtureList
                            title="Positives — must now be caught"
                            items={pr.replay.positives.map((positive) => ({
                              id: positive.proposalId,
                              ok: positive.caught,
                            }))}
                          />
                          <FixtureList
                            title="Counterexamples — must still be allowed"
                            items={pr.replay.negatives.map((negative) => ({
                              id: negative.proposalId,
                              ok: negative.stillAllowed,
                            }))}
                          />
                        </div>
                        <div className="rounded-lg border border-white/[0.07] bg-black/20 p-3 text-[12px]">
                          <p className="text-zinc-300">
                            Auto-clear coverage {pr.replay.autoClearBefore} →{' '}
                            {pr.replay.autoClearAfter}
                            {pr.replay.autoClearAfter < pr.replay.autoClearBefore && (
                              <span className="text-amber-300">
                                {' '}
                                — coverage decreased. Stated, not hidden: this rule costs us
                                automation to buy safety.
                              </span>
                            )}
                          </p>
                          <p className="mt-1.5 font-mono text-[10px] leading-relaxed text-zinc-500">
                            model {pr.replay.fingerprint.model} · temp{' '}
                            {pr.replay.fingerprint.temperature} · prompt{' '}
                            {pr.replay.fingerprint.corePromptHash} · policy{' '}
                            {pr.replay.fingerprint.policyVersion} · pack{' '}
                            {pr.replay.fingerprint.controlPackVersion}
                          </p>
                          <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-500">
                            This is a control-pack replay: the stored proposals are re-evaluated
                            under the new rule. It is not a re-run of the model.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-1.5 text-[12px] leading-relaxed text-zinc-500">
                        Not replayed yet. A rule cannot be merged until it has been run against
                        both the failures it should catch and the counterexamples it must not.
                      </p>
                    )}
                  </section>

                  <ControlPRActions controlPrId={pr.id} status={pr.status} />

                  {pr.status === 'merged' && (
                    <section className="rounded-lg border border-violet-500/25 bg-violet-950/10 p-3">
                      <h3 className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-violet-300">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Held-out case {heldOut.caseId}
                      </h3>
                      <p className="mt-1.5 text-[13px] text-zinc-300">{heldOut.summary}</p>
                      <dl className="mt-2.5 grid gap-3 text-[12px] sm:grid-cols-2">
                        <div>
                          <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
                            Under v1
                          </dt>
                          <dd className="mt-1 text-rose-300">{heldOut.underV1}</dd>
                        </div>
                        <div>
                          <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
                            Under {pr.replay?.packVersion ?? 'v2'}
                          </dt>
                          <dd className="mt-1 text-emerald-300">{heldOut.underV2}</dd>
                        </div>
                      </dl>
                      <p className="mt-2 text-[11px] text-zinc-500">{heldOut.note}</p>
                    </section>
                  )}
                </div>
              </Card>
            );
          })
        )}

        <p className="text-[11px] leading-relaxed text-zinc-500">
          {merged
            ? 'The control suite gained a reviewed, replay-tested policy. The agent did not learn anything permanently.'
            : 'Nothing is enforced until a controller merges it. Drafting a rule changes nothing on its own.'}
        </p>
      </div>
    </AppShell>
  );
}

function FixtureList({
  title,
  items,
}: {
  title: string;
  items: { id: string; ok: boolean }[];
}) {
  return (
    <div className="rounded-lg border border-white/[0.07] bg-black/20 p-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">{title}</p>
      <ul className="mt-2 space-y-1">
        {items.length === 0 ? (
          <li className="text-[12px] text-zinc-600">none</li>
        ) : (
          items.map((item) => (
            <li key={item.id} className="flex items-center gap-2 text-[12px]">
              {item.ok ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <X className="h-3.5 w-3.5 text-rose-400" />
              )}
              <span className="mono-num text-zinc-300">{item.id}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
