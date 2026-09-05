import { NextResponse } from 'next/server';

import { fixtureTranscript } from '@/lib/agent/fixture-transcripts';
import { createProvider, modelConfig } from '@/lib/agent/model';
import { investigateCase } from '@/lib/agent/worker';
import { resetCaseForInvestigation } from '@/lib/demo/store';
import { getTrace } from '@/lib/trace/trace';

/**
 * Owner: Builder B. Runs the worker on one case.
 *
 * Body: { live?: boolean, reset?: boolean }
 *   live  — use the configured model provider. Without it the run replays a
 *           recorded transcript and the response says so; the UI must label it.
 *   reset — clear existing revisions first so the case can be re-investigated.
 */
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  let body: { live?: boolean; reset?: boolean } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    // no body is fine
  }

  const live = body.live === true;
  const transcript = fixtureTranscript(id);

  if (!live && !transcript) {
    return NextResponse.json(
      {
        error: `No recorded transcript for ${id}. Send { "live": true } to run the model, or record a transcript in src/lib/agent/fixture-transcripts.ts.`,
      },
      { status: 400 },
    );
  }

  if (body.reset) {
    const reset = resetCaseForInvestigation(id);
    if (!reset.ok) return NextResponse.json({ error: reset.error }, { status: 409 });
  }

  try {
    const provider = createProvider({
      config: { ...modelConfig(), provider: live ? 'openai' : 'fixture' },
      fixtureTurns: transcript ?? [],
    });

    const result = await investigateCase(id, { provider });

    return NextResponse.json({
      ok: true,
      live,
      preRecorded: !live,
      ...result,
      trace: getTrace(result.traceId),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Investigation failed' },
      { status: 409 },
    );
  }
}
