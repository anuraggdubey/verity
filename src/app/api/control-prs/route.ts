import { NextResponse } from 'next/server';

import { addControlPR, listControlPRs } from '@/lib/demo/store';
import { draftControlPR } from '@/lib/learning/control-pr';
import { groupReviewerRejections } from '@/lib/learning/grouping';

/** Owner: Builder B. Failure groups and the Control PRs drafted from them. */
export async function GET() {
  return NextResponse.json({
    groups: groupReviewerRejections(),
    controlPRs: listControlPRs(),
  });
}

/**
 * Drafts a Control PR from a reviewer-confirmed failure group.
 * Body: { reasonCode?: string } — defaults to the largest group.
 */
export async function POST(request: Request) {
  let body: { reasonCode?: string } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    // no body is fine
  }

  const groups = groupReviewerRejections();
  if (groups.length === 0) {
    return NextResponse.json(
      { error: 'No failure group has two or more reviewer-confirmed rejections yet.' },
      { status: 409 },
    );
  }

  const group = body.reasonCode
    ? groups.find((candidate) => candidate.reasonCode === body.reasonCode)
    : groups[0];
  if (!group) {
    return NextResponse.json({ error: `No group for reason code ${body.reasonCode}` }, { status: 404 });
  }

  const draft = draftControlPR(group);
  if (!draft.ok) return NextResponse.json({ error: draft.reason }, { status: 409 });

  addControlPR(draft.controlPR);
  return NextResponse.json({ ok: true, group, controlPR: draft.controlPR });
}
