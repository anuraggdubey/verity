import { NextResponse } from 'next/server';

import { addControlPR, listControlPRs } from '@/lib/store';
import { composeRule, fixturesFor, restate, simulateRule } from '@/lib/learning/compose';
import { ensureStoreReady } from '@/lib/store/ensure';

/**
 * Draft a control from plain English, and show what it would do — before any
 * of it is enforced. Composing does not create anything; POST /api/control-prs
 * with `propose: true` turns an accepted draft into a Control PR, which still
 * has to be replayed and merged by a human.
 */
export async function POST(request: Request) {
  await ensureStoreReady();
  let body: { text?: string; propose?: boolean; failureMode?: string } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Send { "text": "..." }' }, { status: 400 });
  }

  const composed = await composeRule(body.text ?? '');
  if (!composed.ok) {
    return NextResponse.json(
      { ok: false, error: composed.reason, suggestions: composed.suggestions },
      { status: 422 },
    );
  }

  const { rule, source } = composed.composed;
  const simulation = simulateRule(rule);

  if (!body.propose) {
    return NextResponse.json({
      ok: true,
      draftedBy: source,
      rule,
      restatement: composed.composed.restatement,
      simulation,
    });
  }

  const { positives, negatives } = fixturesFor(rule, simulation);
  const id = `CPR-${String(listControlPRs().length + 1).padStart(3, '0')}`;
  const draftedAt = new Date().toISOString();

  const controlPR = {
    id,
    failureMode: body.failureMode?.trim() || (body.text ?? '').trim().slice(0, 120),
    supportingProposalIds: positives,
    specAmendment: [
      `A controller asked for this in their own words: "${(body.text ?? '').trim()}"`,
      `Drafted ${source === 'model' ? 'by the model' : 'from the offline rule library'} as: ${restate(rule)}`,
      simulation.summary,
      'Nothing is enforced until this is replayed and merged.',
    ].join(' '),
    rule,
    positiveFixtures: positives,
    negativeFixtures: negatives,
    status: 'draft' as const,
    draftedAt,
  };

  addControlPR(controlPR);
  return NextResponse.json({ ok: true, draftedBy: source, controlPR, simulation });
}
