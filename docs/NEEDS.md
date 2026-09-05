# What Verity still needs

Everything required to get from the current repo to the five-minute demo and a
submission. Written from the state of `main` as of the runtime merge.

Ordered by what blocks the demo. If something here is not needed for a beat in
§9 of [IMPLEMENTATION.md](../IMPLEMENTATION.md), it belongs in "later", not here.

---

## 1. Blocking — the demo does not work without these

### 1.1 Wire the UI to the live engine  *(owner: C, with B)*
The frontend reads static JSON from `src/lib/data/fixtures/*.json` and makes no
`fetch` calls. Nothing on screen is connected to the control engine, so today
the pages cannot show a real block, a real repair, or a real merge.

What exists to wire to, all verified working over HTTP:

| Need | Endpoint |
|---|---|
| Run a case | `POST /api/cases/[id]/investigate` `{ live?, reset? }` |
| Live worker activity | `GET /api/stream?caseId=` (SSE) |
| Trace for a case | `GET /api/cases/[id]/trace` |
| Approve / request changes | `POST /api/proposals/[id]/decision` |
| Failure groups + Control PRs | `GET`/`POST /api/control-prs` |
| Replay / merge a Control PR | `POST /api/control-prs/[id]/replay` \| `/merge` |
| Raw metrics | `GET /api/metrics` |
| Reset the demo | `POST /api/reset` |
| Export a Finance PR | `GET /api/cases/[id]/export` |

The only components currently calling these are
`src/components/DecisionPanel.tsx` and `src/components/ControlPRActions.tsx`.
Port that wiring into `finance-pr/ControllerDock.tsx` and the controls page, or
delete the old components once the new ones do the same job.

### 1.2 A model API key  *(owner: whoever holds the account)*
Set in `.env.local`, never committed — see [`.env.example`](../.env.example):

```
VERITY_MODEL_PROVIDER=openai
VERITY_MODEL_API_KEY=...
VERITY_MODEL=gpt-4o-mini          # or whichever model we standardise on
VERITY_MODEL_TEMPERATURE=0
```

Until this exists, every run is a replayed transcript. **A pre-recorded run must
be called pre-recorded, on camera, every time.**

### 1.3 A live run of the FX case  *(owner: B)*
```bash
npm run agent -- CASE-001 --live
```
The live path is written against the installed SDK and typechecks, but it has
never made a real call. First live run may need small fixes. The unscripted
failure beat depends on it, and any of these outcomes is acceptable and handled:
unapproved source, wrong rate date, missing citation, or a clean first pass.

### 1.4 The full benchmark  *(owner: A)*
Currently 8 cases in `bench/fixtures/demo.json`; the spec calls for 24–30.
Missing categories: short pay, wrong entity, closed-period proposal, additional
exact matches and timing differences, and more held-out FX cases. Also needs the
generator that produces them, and expected labels added to `bench/expected.json`.

### 1.5 Real deterministic matching  *(owner: A)*
`bench/fixtures/demo.json` states 24 bank lines with 17 auto-matched, but no
matcher produced that — the numbers are asserted. Needs CSV ingestion,
normalisation, and a matcher that actually clears the routine lines, or the
0:25–0:55 beat is a claim rather than a demonstration.

### 1.6 The full control pack  *(owner: A)*
`src/lib/controls/engine.ts` is a cut-down engine B wrote so the repair loop had
something to react to. It implements EV-001/002/003/004, AI-001/002/003/005,
FX-003/004/006 plus the constrained-rule evaluator. Still missing from the three
families: duplicate detection beyond reference matching, amount/date tolerances
as explicit checks, materiality-driven approval requirements, and the sandbox
reconciliation-consistency check. Keep `evaluateProposal`'s signature.

---

## 2. People

- **A controller or practitioner** to review the policy pack and the expected
  outcomes, and to sit for the recorded review. Without one, the benchmark is
  synthetic and every screen and the README must say so — which the code already
  does. This is the single highest-leverage credibility item.
- **Someone to drive the demo** end to end, twice, before recording.
- **AO evidence owner** to capture sessions, worktrees, PRs, failed tests and
  routed feedback as they happen. This cannot be reconstructed afterwards.

---

## 3. Accounts, keys and services

| Thing | Needed for | Status |
|---|---|---|
| Model API key | live agent runs | **missing** |
| Neatlogs account + ingest URL and key | trace/eval layer | **not wired** — `src/lib/trace/neatlogs.ts` posts to `VERITY_TRACE_INGEST_URL` with `VERITY_TRACE_API_KEY`; the URL and payload shape were never confirmed against their docs, so it stays disabled rather than silently dropping spans |
| TensorMux | inference routing | optional. `VERITY_MODEL_BASE_URL` already points the OpenAI client at any compatible gateway. Cut it if it is not working early — do not risk the demo |
| Per-1k token prices | honest cost numbers | `VERITY_COST_PER_1K_IN` / `_OUT`. Unset means every run reports $0.00 |
| Deployment target | judges clicking a link | not set up. `npm run build && npm start` works locally |
| Devpost account + submission | entry | not started |
| Video hosting with public permissions | entry | not started |

Dodo Payments: deliberately not integrated.

---

## 4. Decisions the team owes each other

1. **Freeze the contract.** `src/lib/contracts/types.ts` had two independent
   drafts and is now a merged superset. Someone must confirm the merge and stop
   editing it outside a single PR that updates every consumer.
2. **One source of data.** There are two fixture sets: `bench/fixtures/*.json`
   (drives the engine, the agent and the tests) and `src/lib/data/fixtures/*.json`
   (drives the UI). They will drift. Pick one — the engine's — and have the UI
   read it through the API.
3. **Which model, and freeze it.** Model, temperature, tools and core prompt go
   into the replay fingerprint. Changing any of them after the benchmark freezes
   invalidates every metric on screen.
4. **Where the queue lives.** The landing page is `/`, the queue is `/queue`.
   Confirm that is the demo path.
5. **Who owns `src/lib/controls`.** B wrote the current engine; the plan assigns
   it to A. Hand it over explicitly or reassign it in IMPLEMENTATION.md.

---

## 5. Remaining build work by owner

**A — finance kernel**
- CSV ingestion + normaliser + matcher (§1.5)
- Expand the dataset to 24–30 cases with labels (§1.4)
- Finish the three control families (§1.6)
- Sandbox ledger and close belong to the kernel; the working implementation is
  currently in `src/lib/demo/store.ts` and should move
- `npm run bench` is the harness to keep green

**B — agent and learning loop**
- Live provider verification (§1.3)
- Transcripts, or live runs, for the cases beyond CASE-001 — every other case
  currently replays a transcript derived from its stored proposal
- Neatlogs wiring once the endpoint is confirmed
- More rule templates in `src/lib/learning/control-pr.ts`; only `WRONG_RATE_DATE`
  is enforceable today, and every other reason code correctly refuses to draft

**C — product and proof**
- Wire the UI to the API (§1.1)
- Controller reject flow with enumerated reason codes — the learning loop reads
  those codes, so the dropdown is load-bearing, not decoration
- Metrics page against `GET /api/metrics` rather than static JSON
- README, architecture diagram, AO evidence, Devpost copy, video

---

## 6. Demo assets

- Thesis slide (code ↔ finance comparison) for 0:00–0:25
- A recorded fallback trace of the FX failure, from the same frozen benchmark,
  in case the live agent gets it right first time — and a sentence said out loud
  that it is pre-recorded
- Reset between takes: `POST /api/reset`
- Held-out case comparison under v1 and v2 for 3:55–4:25
- Final metric counts captured after the last benchmark run, not typed by hand

---

## 7. Verify before submitting

```bash
npm ci && npm test && npm run bench && npm run learn && npm run baseline && npm run build
```

Then: clone the repo fresh into an empty directory and run the above. Check every
link in an incognito window. Confirm the video is public.

---

## 8. Standing honesty rules

These are in the code and the commit history; keep them in the video and the
Devpost text.

- The benchmark is synthetic and not practitioner-reviewed until someone reviews it.
- No invented controller minutes, no production savings. Observed benchmark
  results are labelled as observed benchmark results.
- The agent does not learn. The control suite gained a reviewed, replay-tested policy.
- Sandbox ledger only. Nothing posts anywhere real.
- Verity is a domain translation of AO's operating insight, not an AO plugin.
- If a new control reduces auto-clear coverage, say so on screen.
