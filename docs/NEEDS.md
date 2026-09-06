# What Verity still needs

Everything required to get from the current repo to the five-minute demo and a
submission. Written from the state of `main` as of the runtime merge.

Ordered by what blocks the demo. If something here is not needed for a beat in
§9 of [IMPLEMENTATION.md](../IMPLEMENTATION.md), it belongs in "later", not here.

---

## 1. Blocking — the demo does not work without these

### 1.1 Wire the UI to the live engine  — **DONE**
The four console pages (`/queue`, `/cases/[id]`, `/controls`, `/metrics`) now read
the live store and call the real endpoints. The static UI fixtures under
`src/lib/data/fixtures/` are deleted, so there is one source of data again.

What each page does now: run a worker (recorded or live) and watch the trace
stream in; see the control block, the repair and the revision diff from the
stored artifacts; approve, which posts to the hash-linked sandbox ledger and
closes the reconciliation; request changes with an enumerated reason code that
the failure grouper reads; draft a Control PR from a group, replay it, merge it.

Endpoints, all verified over HTTP:

| Need | Endpoint |
|---|---|
| Run a case | `POST /api/cases/[id]/investigate` `{ live?, reset? }` |
| Live worker activity | `GET /api/stream?caseId=` (SSE) |
| Trace for a case | `GET /api/cases/[id]/trace` |
| Approve / request changes | `POST /api/proposals/[id]/decision` |
| Escalate | `POST /api/cases/[id]/escalate` |
| Failure groups + Control PRs | `GET`/`POST /api/control-prs` |
| Replay / merge a Control PR | `POST /api/control-prs/[id]/replay` \| `/merge` |
| Raw metrics | `GET /api/metrics` |
| Reset the demo | `POST /api/reset` |
| Export a Finance PR | `GET /api/cases/[id]/export` |

Still on the UI list: the landing page (`src/app/page.tsx`) contains illustrative
figures — a EUR 13,000 invoice, a USD 14,200.00 wire, `BNK-2026-08-9921` — that
do not exist in the dataset. Fine as marketing narrative, but if the demo cuts
from the landing page to the console, the numbers should match or the voiceover
should say the landing page is illustrative.

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

### 1.5 Expected labels  — **DONE**
The matcher is real (`loadBenchmark()` runs `matchReconciliation()` over the
CSVs, so the counts on screen are computed), and all 29 cases now carry labels.
The 17 auto-cleared cases were labelled from the matcher's own ground truth —
`matched`, lane `auto`, non-posting — not from agent output, which would have
been circular.

Scoring on the frozen set: disposition 29/29, journal 26/29, evidence-complete
27/29. The three journal misses are the intentional failure cases.

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
| Model API key | live agent runs | **missing** — everything else is ready for it |
| Neatlogs write key (`nlw_…`) | observability | **code done**, disabled without the key. One run = one nested trace, posted to their documented ingest. See [SPONSORS.md](./SPONSORS.md) |
| TensorMux gateway URL | inference routing | **no code needed** — set `VERITY_MODEL_BASE_URL`; it is an OpenAI-compatible gateway |
| Dodo test API key | settlement ingestion | **code done**, read-only, disabled without the key. Payouts → bank lines |
| A practitioner's time (Maximor) | the synthetic caveat | **pack generates now**: `npm run review:pack`. Nobody has filled it in |
| Per-1k token prices | honest cost numbers | `VERITY_COST_PER_1K_IN` / `_OUT`. Unset means every run reports $0.00 |
| Deployment target | judges clicking a link | not set up. `npm run build && npm start` works locally |
| Devpost account + submission | entry | not started |
| Video hosting with public permissions | entry | not started |

Dodo Payments is integrated as a **read-only payout connector**, not a payments
feature: a processor payout is a statement line that has to be reconciled. There
is one HTTP verb in that module and it is GET.

---

## 4. Decisions the team owes each other

1. **Freeze the contract.** `src/lib/contracts/types.ts` had two independent
   drafts and is now a merged superset. Someone must confirm the merge and stop
   editing it outside a single PR that updates every consumer.
2. **One source of data.** Settled: `bench/fixtures/*.json` is it. The UI's own
   fixture set is deleted and every console page reads the store. Keep it that
   way — a second dataset added for a screen will drift within a day.
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
- Live provider verification (§1.3) — still the one thing only a key can settle
- Neatlogs wiring once the endpoint is confirmed
- Rule templates: every enumerated reason code now drafts an enforceable rule
  except `OTHER`, which by definition names no specific failure. The engine
  gained numeric comparators (`gte`/`lte`) and selectors for evidence shape,
  narrative length and duplicate risk to support the last three
- Per-case transcripts are derived from stored proposals; only CASE-001 is
  hand-recorded with the tool calls that produced the mistake

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
