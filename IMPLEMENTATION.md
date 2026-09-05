# Verity — Implementation Plan

Companion to [`verity.md`](./verity.md). That file is *what we are building and why*.
This file is *who builds which file, in what order, and what "done" means*.

Three builders. One Next.js app. One workflow. Everything here exists to serve the
five-minute demo in `verity.md`. If a task does not appear in the demo script, it is
not on this plan.

**Rule zero:** nobody owns "general platform architecture." Every task below maps to a
demo beat and to exactly one owner.

---

## 1. How to use this document

1. Read §3 (contracts). They are frozen at hour 2. Everything else is parallelizable
   only because these types are agreed before code.
2. Find your charter in §5. That is your directory. You own it; nobody edits it but you.
3. Consume other builders' modules **through the contract only**. If you need something
   that does not exist yet, stub it against the contract (§6) and keep moving.
4. Hit the integration checkpoints in §7. They are hard gates with named cut decisions.

---

## 2. Ownership map

Owner tags: **A** = finance kernel, **B** = agent + learning loop, **C** = product + proof.
`*` = shared, changes require all three.

```text
src/
  lib/
    contracts/            *   types.ts, events.ts, errors.ts   <- frozen hour 2
    data/                 A   frozen dataset, policy pack, loader, generator
    matcher/              A   normalize.ts, match.ts
    controls/             A   engine.ts, three families, packs/v1.json, packs/v2.json
    ledger/               A   sandbox.ts (hash-linked), close.ts
    store/                A   events.ts (append-only), state.ts (state machine)
    replay/               A   fixtures.ts, fingerprint.ts
    agent/                B   model.ts, tools.ts, prompt.ts, worker.ts, proposal.ts, repair.ts
    router/               B   risk.ts (auto | review | escalate)
    learning/             B   grouping.ts, control-pr.ts, replay-runner.ts
    trace/                B   trace.ts, neatlogs.ts
    metrics/              C   compute.ts (reads store only)
  app/
    api/                      route owner = owner of the module behind it (§4)
    (queue)/page.tsx      C   exception queue + worker activity
    cases/[id]/page.tsx   C   Finance PR view
    controls/page.tsx     C   Control PR governance
    metrics/page.tsx      C   benchmark dashboard
  components/             C   everything visual
bench/                    A   frozen cases, expected labels (never shipped to the agent)
docs/                     C   README, diagrams, AO evidence, Devpost copy
```

Toolchain additions (owner A, hour 2, one PR, no debate): `vitest` for control and
replay tests, `tsx` for the `bench` runner. Scripts: `npm run bench`, `npm run replay`,
`npm test`. No other dependencies without all three agreeing.

---

## 3. Frozen contracts — write these first

`src/lib/contracts/types.ts`. Drafted by A, reviewed by B and C in the first two hours,
frozen at hour 2. After freezing, a change needs explicit three-way agreement and a
single PR that updates all consumers.

```ts
type CaseState =
  | 'unmatched' | 'investigating' | 'proposed' | 'controls_failed'
  | 'revising'  | 'merge_ready'   | 'auto_cleared' | 'approved'
  | 'rejected'  | 'escalated';

type Disposition =
  | 'matched' | 'timing_difference' | 'bank_fee_journal' | 'fx_revaluation'
  | 'duplicate' | 'short_pay' | 'insufficient_evidence' | 'escalate';

interface Case {                 // A produces, B consumes, C renders
  id: string;
  bankLineId: string;
  candidateLedgerIds: string[];
  state: CaseState;
  materiality: 'immaterial' | 'material' | 'critical';
  autoClearPermitted: boolean;
  revisions: string[];           // Proposal ids, append-only, oldest first
}

interface Proposal {             // B produces, A validates, C renders
  id: string;
  caseId: string;
  revision: number;              // 1-based; revision 1 is immutable forever
  disposition: Disposition;
  narrative: string;
  citations: Citation[];         // every material claim needs one
  journal: JournalLine[];        // [] for non-posting dispositions
  fx?: { rate: number; rateDate: string; rateType: string; sourceId: string };
  policyVersion: string;
  controlPackVersion: string;
  createdAt: string;
  traceId: string;
}

interface Citation {
  claim: string;
  sourceType: 'bank_line' | 'ledger_entry' | 'document' | 'fx_observation';
  sourceId: string;
  field?: string;
}

interface JournalLine {
  account: string; entity: string; period: string;
  currency: string; debit: number; credit: number;
}

interface ControlResult {        // A produces, B repairs against, C renders
  code: string;                  // e.g. 'VERITY-FX-003'
  family: 'evidence_lineage' | 'accounting_integrity' | 'policy_provenance';
  status: 'pass' | 'blocked' | 'warn';
  claim?: string;                // what the agent asserted
  failure?: string;              // why it is wrong
  requiredRepair?: string;       // what the agent must do next
}

interface ControlReport {
  proposalId: string;
  packVersion: string;
  results: ControlResult[];
  blocked: boolean;
}

interface RouteDecision {
  proposalId: string;
  lane: 'auto' | 'review' | 'escalate';
  reason: string;
}

interface ControllerDecision {   // C captures, B groups
  proposalId: string;
  decision: 'approve' | 'reject';
  reasonCode?: string;           // enumerated; required on reject
  rationale?: string;
  decidedAt: string;
}

interface ControlPR {            // B drafts, A replays, C merges via controller
  id: string;
  failureMode: string;
  supportingProposalIds: string[];   // >= 2 required
  specAmendment: string;             // plain language
  rule: ConstrainedRule;             // schema-filled, never generated code
  positiveFixtures: string[];        // must now be caught
  negativeFixtures: string[];        // must still pass
  replay?: ReplayReport;
  status: 'draft' | 'replayed' | 'merged' | 'rejected';
}
```

`src/lib/contracts/events.ts` — the append-only audit event union. Every state change in
the system is one event; the store is the only source of truth. Metrics, the PR view, and
failure grouping all read events, never module internals.

`ConstrainedRule` is a **fixed schema** — a field selector, a comparator, a tolerance, a
source-allowlist reference, and a target control family. The model fills it. The model
never emits executable code and never activates a rule.

---

## 4. API surface

Thin adapters. Owner of the route = owner of the module behind it.

| Route | Method | Owner | Purpose |
|---|---|---|---|
| `/api/reconcile` | POST | A | Ingest CSVs, normalize, match, create cases |
| `/api/reconcile/close` | POST | A | Rerun reconciliation, report closed state |
| `/api/cases` | GET | A | Queue with lane counts |
| `/api/cases/[id]` | GET | A | Case + revisions + control reports |
| `/api/cases/[id]/investigate` | POST | B | Start/resume the worker on this case |
| `/api/proposals/[id]/controls` | POST | A | Run control pack, return `ControlReport` |
| `/api/proposals/[id]/decision` | POST | C | Controller approve/reject + reason code |
| `/api/proposals/[id]/post` | POST | A | Write approved journal to sandbox ledger |
| `/api/control-prs` | GET/POST | B | List / draft from grouped failures |
| `/api/control-prs/[id]/replay` | POST | A | Positive + negative replay report |
| `/api/control-prs/[id]/merge` | POST | A | Publish pack `v2` |
| `/api/metrics` | GET | C | Raw counts from the event store |
| `/api/stream` | GET | B | SSE: worker steps, tool calls, control results |
| `/api/reset` | POST | A | Demo reset to frozen initial state |

Concurrency cap: **three** finance workers at a time, enforced in `agent/worker.ts`.
AO sessions are for building Verity. Finance cases are logical tasks inside the app —
never one AO worktree per exception.

---

## 5. Builder charters

### Builder A — Finance kernel

**Owns:** `lib/data`, `lib/matcher`, `lib/controls`, `lib/ledger`, `lib/store`,
`lib/replay`, `bench/`, and the routes marked A.

**Deliverables**

1. Frozen dataset: 24–30 cases covering exact matches, approved timing differences, bank
   fees needing journals, duplicates, missing evidence, multiple plausible matches, FX
   settlements, wrong FX date/source, wrong entity, closed-period proposals, correct
   escalations. Split: discovery / held-out replay / negative counterexamples.
2. Static policy pack: approved FX sources, rate type and date rule, chart of accounts,
   entities, open periods, materiality thresholds, enumerated auto-clear dispositions.
3. Deterministic normalizer and matcher that auto-clears the routine lines and emits the
   exception queue. No LLM anywhere in this path.
4. Three control families, each as several small named checks behind one engine:
   evidence lineage, accounting integrity, policy and market-data provenance. Every
   failure returns code + claim + failure + required repair — that text *is* B's input.
5. Sandbox ledger with hash-linked audit records; posting only on controller approval.
6. Reconciliation rerun that reaches a demonstrably closed, internally consistent state.
7. Replay fixtures + fingerprint (model, temperature, tools, core prompt, pack version).

**Definition of done:** `npm run bench` runs the frozen set headlessly and prints
per-case control results; a wrong-FX-source proposal is blocked with `VERITY-FX-003`;
the ledger closes; expected labels never leave `bench/` into any agent prompt.

**Do not:** call a model, write React, or edit `lib/agent`.

**First 90 minutes:** draft `contracts/types.ts`, get B and C to sign off, then the
policy pack and six cases — one of them the EUR-invoice / USD-settlement FX case.

---

### Builder B — Agent and learning loop

**Owns:** `lib/agent`, `lib/router`, `lib/learning`, `lib/trace`, and the routes marked B.

**Deliverables**

1. Exactly four tools, no more: `get_bank_line`, `search_ledger`,
   `get_supporting_document`, `get_approved_fx_rate`. Each reads A's data layer.
2. Worker runtime: isolated per-case context, bounded tool turns, structured proposal
   submitted through the app — never through a free-form tool.
3. Repair routing: on `blocked`, feed the `ControlResult[]` back to the *same* worker as
   structured feedback and produce revision N+1. Revision 1 stays immutable.
4. Risk router: `auto` only for enumerated non-posting dispositions with clean controls
   and immaterial amounts; `review` by default; `escalate` on missing or contradictory
   evidence, or critical materiality.
5. Trace instrumentation: every model call, tool call, block, and retry — with tokens,
   cost, and latency. Neatlogs is the observability layer; Verity remains enforcement.
   Neatlogs detections are read-only annotations and must not gate anything.
6. Reviewer-grounded failure grouping: cluster stored controller reject reason codes and
   rationale, require **≥ 2** supporting failures, then draft a `ControlPR` by filling
   `ConstrainedRule`.

**Definition of done:** on the frozen FX case, a live model call produces a proposal, the
control engine blocks it, feedback routes back, revision 2 appears with a visible
accounting diff, and the whole thing is one trace in Neatlogs.

**Do not:** hard-code the failing proposal, let the model activate a rule, or let the
model emit code. If the live model gets the FX case right on the first pass, show a
pre-recorded failed trace **from the same frozen benchmark** and say plainly on camera
that it is pre-recorded.

**First 90 minutes:** `model.ts` plus the four tool signatures against A's stubs, and one
end-to-end call that returns a schema-valid `Proposal` for a single hand-written case.

---

### Builder C — Product and proof

**Owns:** `app/(queue)`, `app/cases/[id]`, `app/controls`, `app/metrics`, `components/`,
`lib/metrics`, `docs/`, and the routes marked C.

**Deliverables**

1. Exception queue: lane counts (Auto / Review / Escalate), live worker activity, case
   states. This is the 0:25–0:55 screen.
2. Finance PR view — the centerpiece. Evidence citations with source inspection,
   debit/credit impact, before/after ledger, policy version, control checklist with the
   exact failure text, and the **revision diff** between proposal 1 and 2.
3. Controller approval: approve / reject with an enumerated reason code and free-text
   rationale. The reject path feeds B's grouping — it is not decoration.
4. Control PR governance screen: spec amendment, rule, positive and negative fixtures,
   replay report, merge to pack `v2`.
5. Metrics: raw counts only — unsafe escapes, controller-touch rate, safe auto-clears,
   repair success, false positives, cost per case. Show regressions. If `v2` reduces
   auto-clear coverage, the screen says so.
6. Proof: README, architecture diagram, AO evidence capture (sessions, worktrees, PRs,
   failed tests, review comments, routed feedback, merged state), Devpost, and the video.

**Definition of done:** the five-minute demo runs end-to-end from the UI with no terminal,
plus a reset button; and every number on screen traces to an event in the store.

**Do not:** invent controller-minutes-saved, present synthetic data as practitioner-
reviewed, or add a second dashboard. Never label a live run as pre-recorded or the reverse.

**First 90 minutes:** the Finance PR view as a static component against a fixture JSON
matching `Proposal` + `ControlReport`. Real data lands later; the layout must not.

---

## 6. Working in parallel without blocking

- **Stub, don't wait.** Every module exports its contract type from day one. A ships
  `controls/engine.ts` returning a hard-coded `ControlReport` in hour 2 so B can build
  repair routing before the real checks exist. B ships a fixture `Proposal` so C can build
  the PR view before the model works. C ships fixture JSON in `bench/fixtures/` that A and
  B both read.
- **One directory, one owner.** A cross-directory need is a request in the shared channel,
  not an edit.
- **Branches:** `a/<topic>`, `b/<topic>`, `c/<topic>`. PR into `main`. No direct pushes to
  `main`. Every PR body names the demo beat it serves.
- **AO from hour 0.** Each substantial task runs as its own AO session with its own
  worktree and PR. Capture the orchestration, focused sessions, failed tests, review
  comments, and routed feedback as they happen — this cannot be reconstructed at hour 27.
- **Frozen means frozen.** After hour 14 the benchmark, policy pack, model, temperature,
  and core prompt do not change. Changing them invalidates every metric.

---

## 7. Checkpoints and cut decisions

| Hour | Gate | If missed |
|---|---|---|
| 2 | Contracts frozen, AO running, dataset contract exists, demo drafted | Stop building and finish the contract — nothing parallelizes without it |
| 8 | One case end to end: tools → Finance PR → real block → repair → approval | **Cut Control PR discovery** (§8). Everyone moves to the core loop |
| 14 | Matching + queue + three control families + sandbox posting + one reconciliation closed | **Stop all integrations and UI polish.** No exceptions |
| 20 | Benchmark frozen, baseline run, traces captured, reject reasons stored, Control PR + replay working | Ship the Finance PR loop alone and cut the Control PR beats from the demo |
| 23 | Counterexamples validated, final metrics, controller review obtained | Present as synthetic and say so explicitly |
| 26 | Neatlogs stable, demo screens polished, README + diagrams, AO evidence captured | Drop Neatlogs, meter inside Verity |
| 28 | Video recorded, uploaded, permissions verified public | Record one unedited take rather than miss the deadline |
| 30 | Devpost complete, repo tested from a clean clone, links checked in incognito, submitted | — |

TensorMux: if routing is not working by **hour 10**, delete it and meter calls inside
Verity. Dodo: not integrated, by decision.

---

## 8. Cut order

Cut from the bottom up, and only in this order:

1. TensorMux routing
2. Metrics screen polish (keep the raw numbers, drop the styling)
3. Control PR **discovery** — keep a hand-seeded Control PR with real replay
4. Neatlogs (keep internal tracing)
5. Control PR entirely — the demo becomes the Finance PR loop, which stands alone

Never cut: the live model call, a real control block, the repair revision, controller
approval, sandbox posting, or the reconciliation close. That sequence *is* the product.

---

## 9. Demo beat → owner → surface

| Beat | Owner | What must work |
|---|---|---|
| 0:00–0:25 Thesis | C | Static comparison slide |
| 0:25–0:55 Reconciliation begins | A + C | Ingest, matcher clears routine lines, queue shows Auto/Review/Escalate |
| 0:55–2:05 The CI moment | B + A | Live tool calls, plausible proposal, real block with the exact control code, routed feedback, corrected revision, proposal diff |
| 2:05–2:40 Controller merge | C + A | Evidence + impact + policy + control results, approve, post to sandbox, rerun, case resolved, balances consistent |
| 2:40–3:55 Control PR | B + A + C | ≥2 confirmed failures, drafted rule, fixtures, replay: positives caught, counterexample still allowed, merge `v2` |
| 3:55–4:25 New case | A | Held-out case of the same class blocked under `v2`, compared to its `v1` result |
| 4:25–4:45 Metrics | C | Raw counts, regressions included |
| 4:45–5:00 AO proof | C | Board, worktrees, PRs, tests, routed feedback |

---

## 10. Scope fence

Reject on sight, no discussion: add AP, connect QuickBooks, post a real journal, generate
arbitrary controls with AI, one AO session per finance exception, another dashboard, seven
partial controls, a chatbot, production-readiness claims, or calling every blocked output
an accuracy improvement.

Not built: bank/ERP connectors, real posting, auth, multi-tenancy, OCR, additional finance
workflows, general-purpose orchestration, autonomous control activation, model-generated
code, production anomaly detection, Dodo, mobile, deployment infrastructure.

One workflow. Three control families. One visible repair. One Control PR. One
counterexample. One closed sandbox reconciliation.

---

## 11. Honesty rules (code, UI, and camera)

- If the benchmark is not practitioner-reviewed, say "synthetic" on screen and in the README.
- Never present invented controller minutes or production savings. Observed benchmark
  results are labeled as observed benchmark results.
- Never claim the agent "learned." Say the control suite gained a reviewed, replay-tested
  policy.
- Verity is a domain translation of AO's operating insight, not an installable AO plugin.
- Show regressions. A control that reduces auto-clear coverage is a safety tradeoff we
  explain, not a number we hide.
