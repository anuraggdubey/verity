# Sponsor integrations

What each one actually does in Verity, how to turn it on, and — where it
applies — what we deliberately did not build. Every claim here is backed by code
in this repo; anything not yet true says so.

The rule we held to: an integration has to do real work in the product. A logo
on a slide is not an integration, and a wrapper that would silently drop data is
worse than none.

---

## Neatlogs — observability *(implemented, needs a key)*

**What it does.** One worker run becomes one Neatlogs trace. The case is the
workflow; every model call, tool call and control evaluation is a child span
with its own tokens, latency and status. Blocked controls arrive as `ERROR`
spans carrying the control code, so a failed run is legible in their dashboard
without opening ours.

**Where.** [`src/lib/trace/neatlogs.ts`](../src/lib/trace/neatlogs.ts), posted by
`Trace.finish()` at the end of every run in
[`src/lib/agent/worker.ts`](../src/lib/agent/worker.ts).

**Wire protocol** — their documented HTTP ingest, not a guess:

```
POST https://ingest.neatlogs.com/v1/trace
Authorization: Bearer nlw_...
{ name, project, kind, children[], attributes, metadata, logs[] }
```

**Turn it on:**

```
NEATLOGS_API_KEY=nlw_...
NEATLOGS_PROJECT=verity
```

**Check the payload before you have a key:**

```bash
NEATLOGS_API_KEY=nlw_dryrun NEATLOGS_DRY_RUN=true npm run agent -- CASE-001
```

That prints the exact body instead of posting it. For CASE-001 it emits 15
spans — 6 `LLM`, 6 `TOOL`, 3 `SPAN` — with the blocked control and the repair
request marked `ERROR`, and metadata carrying the policy version, control pack,
core-prompt hash, outcome and `pre_recorded: true`.

**Two properties worth stating out loud:**

- Verity stays the enforcement layer. The send is fire-and-forget and swallows
  its own errors, because a sink outage must never change a control result.
  Neatlogs detections are annotations; they gate nothing.
- Every trace carries `pre_recorded: true|false` in its metadata, so a replayed
  transcript can never look like live agent behaviour on their dashboard either.

**Not done:** nobody has run this against a real key yet. The payload shape is
covered by unit tests ([`neatlogs.test.ts`](../src/lib/trace/neatlogs.test.ts))
and by the dry run above, so what is unverified is the wire call itself, not the
body. First run with a real key may still need a field adjusted.

---

## TensorMux — inference routing *(works today, no code needed)*

TensorMux is an OpenAI-compatible gateway: the documented integration is one
base-URL change. Verity's model layer already takes that URL, so routing,
per-tenant metering and audit logs happen at the gateway with nothing rewritten
in the app.

```
VERITY_MODEL_PROVIDER=openai
VERITY_MODEL_BASE_URL=http://localhost:8080/v1
VERITY_MODEL_API_KEY=...
```

[`src/lib/agent/model.ts`](../src/lib/agent/model.ts) passes `baseUrl` straight
to the OpenAI client. That is the whole integration, and it is honest to say so
rather than dress it up.

If it is not routing by the time the demo is cut, drop the variable and Verity
meters calls itself — tokens, cost and latency per run are already recorded in
the event log.

---

## Dodo Payments — settlement ingestion *(implemented, read-only)*

The original plan said skip Dodo as irrelevant to bank reconciliation. That was
right about *payments* and wrong about *payouts*. A processor payout is money
arriving in the company's bank account: it lands on the statement, and somebody
has to reconcile it against the ledger. That makes Dodo a source of
reconciliation work, which is a role it can honestly play here.

**What it does.** Lists payouts and maps the settled ones into the same
normalized `BankLine` shape the deterministic matcher already consumes. Amounts
arrive as integer minor units and are converted; a payout is money in, so the
sign follows the statement convention.

**Where.** [`src/lib/integrations/dodo.ts`](../src/lib/integrations/dodo.ts),
previewable at `GET /api/integrations/dodo/payouts`.

```
GET {base}/payouts?page_number=0&page_size=20
Authorization: Bearer <api key>
-> items[]: payout_id, business_id, amount, currency, status, payment_method, created_at
```

**Turn it on:**

```
DODO_API_KEY=...
DODO_MODE=test          # https://test.dodopayments.com
```

**What it will never do.** There is exactly one HTTP verb in that file and it is
`GET`. No payment is created, no refund issued, no money moved, nothing written
back to Dodo. Live mode is double-gated — `DODO_MODE=live` *and*
`DODO_ALLOW_LIVE=true` — so a demo cannot read a real merchant's settlement data
by accident.

Payouts that are not `success` are excluded and reported separately: an
in-progress payout is not on the statement, and inventing a reconciling item for
it would be inventing a fact.

---

## Maximor — accounting judgement *(process, not an SDK)*

Maximor automates accounting close and reconciliation. They have no public
developer API to call, and pretending otherwise would be the kind of decorative
integration this project exists to argue against. What they have that we need is
practitioners.

The benchmark's biggest weakness is that no one who closes books has checked it.
So the integration is a document their accountants can mark up and an importer
that records the result where the app reads it:

```bash
npm run review:pack                      # -> docs/practitioner-review-pack.md
npm run review:import verdicts.json      # -> bench/fixtures/review.json
```

The pack states the policy, then for each case gives the bank line, candidate
ledger entries, the evidence the agent could see, the FX observations available
(including the ones policy forbids), and the answer Verity expects — with a
verdict line to fill in. It asks whether the *policy itself* is right first,
because a wrong policy makes every expected answer wrong too.

The importer refuses an anonymous review, and `practitionerReviewed` only flips
to true when every labelled case carries a human verdict. Until then the metrics
screen keeps saying the benchmark is synthetic, which is the correct thing for
it to say.

One narrow question for them, if there is time for nothing else:

> When a reconciliation exception reaches a controller, what missing evidence or
> policy violation most often forces it back to the preparer?

**Status:** `bench/fixtures/review.json` now covers all 29 cases, every one
`unreviewed`, reviewer unset. The pack itself generates in full.

---

## Current state, honestly

| Sponsor | Code | Works without credentials | Blocked on |
|---|---|---|---|
| Neatlogs | yes | disabled, no-op | a write key |
| TensorMux | config only | yes (unrouted) | a gateway URL |
| Dodo Payments | yes | disabled, no-op | a test API key |
| Maximor | yes (review pack) | yes — the pack generates now | a practitioner's time |

Each one degrades to a no-op with a stated reason rather than a silent failure
or a fabricated success. That is deliberate: the demo has to be able to run with
none of these configured, and it has to be obvious which are live.
