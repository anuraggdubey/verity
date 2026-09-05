import type {
  CaseState,
  ControlReport,
  Proposal,
  RouteDecision,
} from '@/lib/contracts/types';
import { evaluateProposal, policyPack } from '@/lib/controls/engine';
import {
  appendControlReport,
  appendEvent,
  appendProposal,
  appendRouteDecision,
  getCase,
  listControllerDecisions,
  nextProposalId,
  packVersion,
  setCaseState,
} from '@/lib/demo/store';
import { routeProposal } from '@/lib/router/risk';
import { Trace } from '@/lib/trace/trace';
import {
  createProvider,
  type AgentMessage,
  type ModelProvider,
  type ToolSpec,
} from '@/lib/agent/model';
import { casePacket, corePrompt, corePromptHash } from '@/lib/agent/prompt';
import { REPAIR_POLICY, repairMessage, schemaErrorMessage } from '@/lib/agent/repair';
import { buildProposal, parseProposalArguments, SUBMIT_PROPOSAL_SPEC } from '@/lib/agent/proposal';
import { executeTool, TOOL_NAMES, TOOL_SPECS } from '@/lib/agent/tools';

/**
 * The logical finance worker.
 *
 * One case, isolated context, four tools, a bounded number of turns, and one
 * constrained submission channel. A blocked proposal is never edited: the same
 * worker receives the control engine's own text and produces the next revision.
 *
 * These are logical tasks inside the app. They are not AO sessions, and there is
 * no worktree per exception.
 */

const MAX_CONCURRENT_WORKERS = 3;

export type RunOptions = {
  provider?: ModelProvider;
  maxToolTurns?: number;
  maxRepairs?: number;
};

export type RunRevision = { proposal: Proposal; report: ControlReport };

export type RunResult = {
  caseId: string;
  traceId: string;
  provider: string;
  model: string;
  revisions: RunRevision[];
  route?: RouteDecision;
  finalState: CaseState;
  schemaRejections: number;
  stoppedBecause?: string;
};

/* --------------------------------------------------------- concurrency gate */

let active = 0;
const waiting: (() => void)[] = [];

async function acquireSlot(): Promise<() => void> {
  if (active >= MAX_CONCURRENT_WORKERS) {
    await new Promise<void>((resolve) => waiting.push(resolve));
  }
  active += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    active -= 1;
    waiting.shift()?.();
  };
}

export function activeWorkerCount(): number {
  return active;
}

/* ------------------------------------------------------------------ the loop */

export async function investigateCase(caseId: string, options: RunOptions = {}): Promise<RunResult> {
  const financeCase = getCase(caseId);
  if (!financeCase) throw new Error(`Unknown case ${caseId}`);

  const decided = listControllerDecisions().some((decision) => decision.caseId === caseId);
  if (decided) throw new Error(`${caseId} already has a controller decision and cannot be re-investigated`);

  const release = await acquireSlot();
  try {
    const provider = options.provider ?? createProvider();
    const maxToolTurns = options.maxToolTurns ?? REPAIR_POLICY.maxToolTurns;
    const maxRepairs = options.maxRepairs ?? REPAIR_POLICY.maxRepairs;

    const trace = new Trace(caseId, provider.id, provider.model);
    const policy = policyPack();
    const tools: ToolSpec[] = [...TOOL_SPECS, SUBMIT_PROPOSAL_SPEC];

    const messages: AgentMessage[] = [
      { role: 'system', content: corePrompt() },
      { role: 'user', content: casePacket(financeCase) },
    ];

    setCaseState(caseId, 'investigating');
    appendEvent({
      type: 'investigation_started',
      at: new Date().toISOString(),
      caseId,
      traceId: trace.id,
    });
    trace.note('prompt', `core prompt ${corePromptHash()}, policy ${policy.policyVersion}, pack ${packVersion()}`);

    const revisions: RunRevision[] = [];
    let schemaRejections = 0;
    let repairsUsed = 0;
    let emptyTurns = 0;
    let route: RouteDecision | undefined;
    let stoppedBecause: string | undefined;

    for (let turn = 0; turn < maxToolTurns; turn += 1) {
      const response = await provider.complete({ messages, tools });
      trace.modelCall({
        tokensIn: response.tokensIn,
        tokensOut: response.tokensOut,
        costUsd: response.costUsd,
        latencyMs: response.latencyMs,
        finishReason: response.finishReason,
        toolCalls: response.toolCalls.map((call) => call.name),
      });

      if (response.toolCalls.length === 0) {
        emptyTurns += 1;
        messages.push({ role: 'assistant', content: response.text });
        if (emptyTurns >= 2) {
          stoppedBecause = 'The agent stopped calling tools without submitting a proposal.';
          break;
        }
        messages.push({
          role: 'user',
          content:
            'You have not submitted a proposal. Continue the investigation with the tools, then call submit_proposal.',
        });
        continue;
      }

      messages.push({ role: 'assistant', content: response.text, toolCalls: response.toolCalls });

      let finished = false;

      for (const call of response.toolCalls) {
        if (TOOL_NAMES.includes(call.name)) {
          const startedAt = Date.now();
          const result = executeTool(call.name, call.arguments);
          trace.toolCall(call.name, result.ok, Date.now() - startedAt, call.arguments.slice(0, 200));
          messages.push({
            role: 'tool',
            toolCallId: call.id,
            name: call.name,
            content: JSON.stringify(result.content),
          });
          continue;
        }

        if (call.name !== SUBMIT_PROPOSAL_SPEC.name) {
          trace.toolCall(call.name, false, 0, 'unknown tool');
          messages.push({
            role: 'tool',
            toolCallId: call.id,
            name: call.name,
            content: JSON.stringify({
              error: `Unknown tool ${call.name}. Available: ${[...TOOL_NAMES, SUBMIT_PROPOSAL_SPEC.name].join(', ')}`,
            }),
          });
          continue;
        }

        // --- constrained submission ---
        const parsed = parseProposalArguments(call.arguments);
        if (!parsed.ok) {
          schemaRejections += 1;
          trace.note('schema_rejected', parsed.errors.join(' '), false);
          messages.push({
            role: 'tool',
            toolCallId: call.id,
            name: call.name,
            content: schemaErrorMessage(parsed.errors),
          });
          continue;
        }

        // appendProposal pushes onto the live case, so this is always the next revision.
        const revision = financeCase.revisions.length + 1;
        const previous = revisions[revisions.length - 1]?.proposal;
        const proposal = buildProposal({
          id: nextProposalId(caseId, revision),
          caseId,
          revision,
          draft: parsed.draft,
          policyVersion: policy.policyVersion,
          controlPackVersion: packVersion(),
          traceId: trace.id,
          repairedFrom: previous?.id,
        });

        appendProposal(proposal);
        setCaseState(caseId, 'proposed');
        appendEvent({
          type: 'proposal_submitted',
          at: proposal.createdAt,
          caseId,
          proposalId: proposal.id,
          revision: proposal.revision,
        });

        const report = evaluateProposal(proposal);
        appendControlReport(report);
        const blockedCodes = report.results.filter((r) => r.status === 'blocked').map((r) => r.code);
        trace.control(proposal.id, report.blocked, blockedCodes);
        appendEvent({
          type: 'controls_evaluated',
          at: report.evaluatedAt,
          proposalId: proposal.id,
          blocked: report.blocked,
          codes: blockedCodes,
        });

        revisions.push({ proposal, report });

        if (report.blocked && repairsUsed < maxRepairs) {
          repairsUsed += 1;
          setCaseState(caseId, 'controls_failed');
          appendEvent({
            type: 'repair_requested',
            at: new Date().toISOString(),
            proposalId: proposal.id,
            codes: blockedCodes,
          });
          trace.note('repair_requested', `revision ${proposal.revision} blocked by ${blockedCodes.join(', ')}`, false);
          setCaseState(caseId, 'revising');
          messages.push({
            role: 'tool',
            toolCallId: call.id,
            name: call.name,
            content: repairMessage(report),
          });
          continue;
        }

        if (report.blocked) {
          stoppedBecause = `Blocked by ${blockedCodes.join(', ')} with no repair attempts left.`;
          setCaseState(caseId, 'controls_failed');
          messages.push({
            role: 'tool',
            toolCallId: call.id,
            name: call.name,
            content: repairMessage(report),
          });
          finished = true;
          break;
        }

        route = routeProposal(proposal, report, financeCase);
        appendRouteDecision(route);
        appendEvent({ type: 'routed', at: new Date().toISOString(), proposalId: proposal.id, lane: route.lane });
        trace.note('routed', `${route.lane}: ${route.reason}`);

        if (route.lane === 'auto') {
          setCaseState(caseId, 'auto_cleared');
          appendEvent({ type: 'auto_cleared', at: new Date().toISOString(), caseId, reason: route.reason });
        } else if (route.lane === 'escalate') {
          setCaseState(caseId, 'escalated');
        } else {
          setCaseState(caseId, 'merge_ready');
        }

        messages.push({
          role: 'tool',
          toolCallId: call.id,
          name: call.name,
          content: JSON.stringify({
            accepted: true,
            proposalId: proposal.id,
            revision: proposal.revision,
            lane: route.lane,
          }),
        });
        finished = true;
        break;
      }

      if (finished) break;
    }

    if (revisions.length === 0 && !stoppedBecause) {
      stoppedBecause = `Turn budget of ${maxToolTurns} exhausted before a proposal was submitted.`;
    }
    if (stoppedBecause && !route) {
      // Nothing safe was produced. The case waits for a human rather than clearing.
      const state = revisions.length > 0 ? 'controls_failed' : 'escalated';
      setCaseState(caseId, state);
      trace.note('stopped', stoppedBecause, false);
    }

    const finalState = getCase(caseId)?.state ?? 'unmatched';

    return {
      caseId,
      traceId: trace.id,
      provider: provider.id,
      model: provider.model,
      revisions,
      route,
      finalState,
      schemaRejections,
      stoppedBecause,
    };
  } finally {
    release();
  }
}
