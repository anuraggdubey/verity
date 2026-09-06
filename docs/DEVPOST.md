# Verity — Devpost submission copy

Paste-ready. Every number here is reproducible from the repo; the commands that
produce them are at the bottom.

**Live:** https://verity-merge-control.vercel.app
**Repo:** https://github.com/anuraggdubey/verity

---

## Inspiration

Coding agents got trusted with real repositories the moment the workflow stopped
depending on the model being right. A branch isolates the change, CI runs
whether or not the agent is confident, a diff shows exactly what will happen, and
a human merges. The agent is not trusted — the process is.

Finance agents have none of that. They are asked to be careful, and then their
output goes straight into a ledger. "The model is usually right" is not a control
environment, and no controller will sign off on it.

So we asked a narrower question than "can an AI do accounting": **what would have
to be true for a finance agent's decision to be safe to merge?** The answer looks
a lot like CI. That is Verity.

## What it does

Verity is a merge gate for agent-generated finance work, proved on one real
workflow: a bank reconciliation that closes.

- A **deterministic matcher** clears the routine lines — 29 bank lines in, 17
  auto-matched, 12 exceptions out. No model touches this.
- Each exception becomes an **isolated case**. A worker investigates it with four
  read-only tools (`get_bank_line`, `search_ledger`, `get_supporting_document`,
  `get_approved_fx_rate`) and submits one **structured proposal** — never free
  text, never a direct write.
- The proposal becomes a **Finance PR** and is evaluated by a deterministic
  control pack: evidence lineage, accounting integrity, policy and market-data
  provenance. 18 named checks today.
- A blocked proposal is **not edited**. The control engine's own text — code,
  claim, failure, required repair — goes back to the same worker, which files
  revision 2. Revision 1 stays immutable, and the UI shows the accounting diff
  between them.
- Clean proposals are **routed**: `auto` only for enumerated non-posting
  dispositions that are immaterial and fully evidenced, `review` for anything
  that posts, `escalate` for missing evidence or critical materiality.
- A **controller merges**. Only then does anything reach the hash-linked sandbox
  ledger, and the reconciliation reruns to a closed state.

Then the second, rarer gate. When controllers reject the same way twice, Verity
drafts a **Control PR**: a plain-language amendment plus a constrained rule, run
against the failures it should catch *and* counterexamples it must not, merged by
a human into a new control pack version. The model fills a fixed schema. It never
writes code and never activates a rule.

Two things a controller can do directly:

- **Write a control in plain English.** "Never post into a closed accounting
  period" becomes a real rule, and before anything is proposed you see which past
  decisions it would have blocked — including any a controller had already
  approved.
- **Upload the paperwork.** Receipts, invoices, remittances and statements in 13
  formats (pdf, png, jpg, jpeg, webp, gif, csv, tsv, txt, md, json, docx, xlsx).
  They become evidence the agent must cite, checked by the same controls. An
  upload is evidence, never a decision.

## How we built it

One Next.js app, three lanes, one shared contract.

- **Finance kernel** — CSV ingestion, normalizer and matcher; the control engine;
  the hash-linked sandbox ledger; reconciliation close; replay fixtures.
- **Agent runtime** — a provider-neutral model seam (native Anthropic SDK,
  defaulting to `claude-opus-5`; an OpenAI-compatible path that doubles as the
  TensorMux integration; and a recorded-transcript replayer for offline runs),
  the four tools, the constrained submission channel, the repair loop with a
  three-worker concurrency cap, tracing, failure grouping, Control PR drafting
  and replay.
- **Console** — exception queue with live worker activity over SSE, the Finance
  PR view, Control PR governance, and a metrics screen computed from the append-
  only event log.

Sponsors, each doing real work or honestly marked as not:

- **Neatlogs** — one worker run is posted as one nested trace to their documented
  HTTP ingest: model calls become LLM spans, tool calls TOOL spans, a blocked
  control an ERROR span carrying its code. Fire-and-forget, because an
  observability outage must never change a control result.
- **TensorMux** — an OpenAI-compatible gateway, so it needs no code: one base URL
  and routing happens at the gateway. We say that rather than dress it up.
- **Dodo Payments** — the original plan called it irrelevant. That was right about
  payments and wrong about payouts: a processor payout is money landing in the
  bank account, which is exactly a statement line somebody must reconcile. We
  ingest settled payouts as bank lines. One HTTP verb in that module, and it is
  GET.
- **Maximor** — no public API, and inventing one would be the decorative
  integration this project argues against. What they have is practitioners, and
  our benchmark's weakness is that no one who closes books has checked it. So
  `npm run review:pack` produces a document their accountants can mark up, and an
  importer records their verdicts where the app reads them.

## Challenges we ran into

**The model was too good for our demo.** Claude Opus 5 gets the flagship FX case
right on the first attempt — approved provider, transaction-date rate, the USD
84.00 settlement difference booked as a realized FX loss. Haiku 4.5 does too. Our
"watch it fail and repair" beat could not assume failure. We wrote that finding
down instead of hiding it, and ran the full benchmark live to find the blocks
that *do* happen: four, five and six across three runs, on the cases where the
model does slip.

**We had a flattering bug and deleted it.** The first live run blocked, and it
looked great — until we read why. Our `fx.sourceId` field wanted the provider
(`APEX-REF-RATES`) while the tool also returns an observation id
(`FXO-0811-APX`); the model supplied the observation id and was correctly
blocked, for a schema reason rather than a policy one. A demo built on that block
would have been showing off our own confusing contract. We fixed the field, and
the model then got the case right first time — a worse demo and a better system.

**A control was quietly emptying the Auto lane.** The duplicate advisory fired on
every line the matcher had deterministically cleared, so all 17 auto-cleared
cases carried a warning and the router sent every one to a controller. Lanes went
from 1 auto / 27 review to 18 / 10 / 1 once scoped correctly.

**Our safety headline was wrong.** The deployed metrics screen read *1 unsafe
escape*. It wasn't one: a case had genuinely escalated while an older routing
record still said "review", and the metric read the record instead of the
outcome. It now judges the outcome and errs toward over-reporting.

**Parallel builders drifted.** Two independent drafts of the shared contract and
two competing fixture sets appeared within a day. Merging them meant choosing the
executable shapes over the display ones and deleting a whole parallel dataset.

**Deploying found what local runs never would.** Windows-only native binaries
were declared as hard dependencies, so `npm install` failed on Linux and macOS —
including Vercel's builders. And the kernel reads its frozen benchmark through a
runtime-built path, which Next's file tracing cannot see, so the first bundle
would have shipped without any data at all.

## Accomplishments that we're proud of

- **The loop is real, and the numbers are measured — three times.** Across three
  live baselines of 26 runnable cases each, the safety rows never moved: **0
  unsafe escapes, 0 out-of-policy postings, 0 guardrail false positives**, every
  run. The agent's own success rate moved a lot — 4 blocks with 4 repaired, then
  5 with 1, then 6 with 2. That gap is the argument for the product, made by the
  data instead of by us: the small model's reliability was not dependable, and it
  did not have to be. 17 safe auto-clears and 25/29 correct dispositions on the
  latest run, at $2.56 and 2.5 s median.
- **The reconciliation actually closes.** Run the FX case, watch it get blocked
  and repaired, approve it, and the sandbox ledger posts and the period closes —
  verified on the deployed URL, not just locally.
- **A control PR that is tested before it is trusted.** Positives caught,
  counterexamples still allowed, auto-clear coverage reported before and after —
  including when it drops.
- **The system refuses well.** Ask the composer for "block anything that looks
  fishy" and it declines, listing what it can actually test. Ask it to check that
  a citation is specifically a receipt and it explains it can count documents but
  not classify them. A guardrail that cannot be enforced is worse than none.
- **Nothing on screen overclaims.** The benchmark is labelled synthetic because
  no practitioner has reviewed it yet. Pre-recorded runs are labelled
  pre-recorded, in the UI and in the trace metadata. Cost reads $0.00 unless real
  prices are configured.
- 92 tests, and every claim in the demo is backed by a script that fails loudly
  when the claim stops being true.

## What we learned

**Running the thing for real is a different activity from building it.** Every
one of our worst bugs — the empty Auto lane, the phantom unsafe escape, the
un-shippable dataset, the cross-platform install — was invisible to code review
and obvious within one execution.

**A benchmark you cannot fail is not a benchmark.** Once a frontier model solved
our flagship case first try, the interesting question stopped being "did the
agent get it right" and became "what did the controls catch when it didn't". That
reframing made the metrics honest: unsafe escapes and repair success, not
accuracy theatre.

**Report the distribution, not your best run.** Repair success came out 4/4, then
1/5, then 2/6 on the same dataset. Quoting the first would have been true and
misleading. The safety numbers held at zero in all three, which is the claim that
actually survives repetition — and the one worth putting on a slide.

**Blocking is cheap; explaining is the product.** The control text *is* the repair
instruction. The same words a controller reads are the words the agent receives,
which is why revision 2 tends to fix the actual problem instead of guessing.

**Measure the outcome, not the paperwork.** Two of our metric bugs came from
reading an intermediate record instead of what actually happened to the case.

**A fingerprint has to be a promise you keep.** Ours recorded `temperature 0`
while the request never sent it, so "reproducible replay" was decorative for the
models that would have accepted the parameter. Fixed — and it is the kind of
thing only a careful read of your own claims catches.

## What's next for Verity

- **A practitioner review.** The pack generates for all 29 cases; it needs an hour
  from someone who closes books. Until then `practitionerReviewed` stays false and
  every screen says synthetic — that flag is the single biggest credibility item
  left.
- **More of the rule surface.** Every enumerated rejection reason can now be
  drafted as an enforceable rule except `OTHER`. The next batch needs selectors
  the engine can evaluate: separation of duties, sanctions screening, real
  duplicate detection beyond reference matching.
- **Durable state.** The kernel is in-memory. Real deployment needs a store so
  decisions survive a cold start.
- **Wider evidence.** Uploads become citable documents today; next is matching an
  uploaded statement's lines into the reconciliation automatically.
- **The workflows we deliberately did not build.** AP, intercompany, revenue —
  each is a new policy pack and a new control family, not a new product. We built
  one workflow properly instead of four badly, and that is the order we would
  keep.

---

### Reproducing every number above

```bash
npm ci
npm test            # 92 tests
npm run bench       # control engine under pack v1 and v2
npm run replay      # Control PR replay fixtures
npm run learn       # rejections -> group -> drafted rule -> replay
npm run baseline    # every case; add --live for real model calls
```

The benchmark is synthetic and has not been reviewed by a practitioner. Numbers
from a pre-recorded run describe the fixture, not the agent; live numbers are
labelled as live.
