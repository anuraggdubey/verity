# Verity — the version worth building

## Brutally honest critique

The selected idea has a genuinely strong thesis, but the current version contains several claims that could lose credibility with technical or finance judges.

### What is strong

- “Finance Pull Requests” is memorable and understandable.
- The block → feedback → repair → resubmit loop creates a real agent demo.
- One completed bank reconciliation is stronger than several shallow workflows.
- Human-approved guardrail evolution connects reliability, finance controls, and agent learning.
- AO’s code workflow provides a natural conceptual analogy.

### What is weak or misleading

- **“CI for everything else” is too broad.** Verity proves one finance workflow, not every non-code domain.
- **AO is not confirmed as 25% of the rubric.** Official information says AO usage and sessions will be reviewed, but no public weighted rubric confirms 25%. [The official Luma page](https://l.com/d0kqx45ek) confirms the AO-session requirement.
- **Do not call Verity an AO plugin slot.** Current AO documentation says its runtime, workspace, SCM, tracker, and other capabilities are built-in boundaries—not interchangeable marketplace slots. [AO plugin documentation](https://aoagents.dev.dev/docs/plugins/plugins/)
- **Fourteen exceptions should not become fourteen AO coding sessions.** AO manages the team’s software-development agents. Verity’s runtime finance workers are separate logical tasks. Conflating them will look technically confused.
- **“Guardrails that write themselves” sounds reckless.** The system may draft Control PRs, but a human must approve every new rule.
- **A new guardrail does not automatically increase auto-clear rate.** It may correctly block more cases. Measure unsafe escapes and human touches separately.
- **“Controller minutes saved” is fake unless timed against real reviewers.** Use controller decisions per case as the primary efficiency metric.
- **Three individual checks are too thin.** Three complete control families are enough; three `if` statements are not.
- **A hash chain is demo garnish.** It does not make synthetic data audit-ready. Keep it as implementation detail.
- **Posting must be sandbox-only.** Never imply that a weekend prototype can safely post into a real ledger.
- **The failure-discovery sequence can look planted.** Freeze the dataset, hide labels from the agent, include negative counterexamples, and preserve the original reviewer decision.
- **Verity is a crowded product name.** Keep it for speed, but always present it as “Verity Finance PR” or “Verity — Merge Control for Finance Agents.”

## The 100× idea

### The pitch

AO makes coding agents manageable because each change is isolated, tested, repaired, and reviewed before merge.

Verity applies those operating semantics to agent-generated finance decisions.

Every proposed accounting action becomes a **Finance PR**. It contains the proposed ledger change, exact evidence, accounting impact, policy version, deterministic check results, revision history, and required approval. Unsafe proposals are blocked and returned to their owning agent. Repeated reviewer-confirmed failures produce a second artifact: a **Control PR** containing a proposed specification change, executable guardrail, regression test, and replay report.

Verity therefore governs both:

1. Changes to financial state
2. Changes to the controls that govern financial state

That second layer is the 100× improvement.

### README sentence

> Git gives coding agents branches, CI, and merge review. Verity gives finance agents isolated decisions, evidence-backed controls, repair loops, and controller approval. We prove it by closing a sandbox bank reconciliation end to end.

### Spoken tagline

> **Don’t trust the agent’s confidence. Trust what passed.**

### Category statement

> Verity is a change-control plane for agent-generated finance work.

Do not call it a reconciliation application. Bank reconciliation is the proof workload.

## What Verity proves

A bank statement and cash ledger are ingested.

Deterministic matching clears obvious transactions. Every unresolved line becomes an isolated reconciliation case with limited tools and context. A live LLM agent investigates it and selects one disposition:

- Match an existing ledger entry
- Record an approved timing difference
- Propose a journal entry
- Mark a possible duplicate
- Request missing evidence
- Escalate ambiguity

The proposal becomes a Finance PR. Verity evaluates it and either:

- **Auto-clears:** only non-posting, fully evidenced exact matches and approved timing differences
- **Requests review:** journal proposals or decisions requiring controller judgment
- **Escalates:** missing evidence, conflicts, ambiguity, policy exceptions, or high risk
- **Blocks and repairs:** deterministic failure returns structured feedback to the same agent

After approval, the journal is written only to Verity’s sandbox ledger. The reconciliation reruns and demonstrates that the close completes.

## Two nested merge gates

### Finance PR

The proposed finance decision contains:

- Case and source-record identifiers
- Disposition
- Evidence citations
- Proposed debit and credit lines
- Currency and FX treatment
- Before/after ledger impact
- Policy version
- Control results
- Materiality and residual risk
- Original proposal and revisions
- Agent/tool trace
- Controller decision
- Replay fingerprint

### Control PR

A repeated failure or reviewer rejection produces:

- Named failure mode
- Supporting failed cases
- Plain-language specification amendment
- Constrained guardrail definition
- Regression fixtures
- Positive cases the rule should catch
- Negative counterexamples it must not catch
- Before/after replay report
- Expected human-review impact
- Required controller approval
- New control-suite version

The model cannot activate the rule or generate arbitrary executable code. It fills a constrained rule schema. The controller reviews and merges it.

## Architecture

```text
Bank statement + GL + evidence + policy
                    │
                    ▼
        Deterministic normalizer/matcher
                    │
             unresolved cases
                    ▼
       Logical investigation worker pool
                    │
        tools + isolated case context
                    ▼
               Finance PR
                    │
        Verity deterministic controls
             ┌──────┴──────┐
             │             │
          blocked        passed
             │             │
 structured feedback      risk router
             │        ┌────┼─────────┐
             ▼        ▼    ▼         ▼
        agent repair  auto review  escalate
                              │
                       sandbox posting
                              │
                       reconciliation rerun

Reviewer decisions + failed controls
                    │
                    ▼
             Failure grouper
                    │
                    ▼
               Control PR
                    │
       replay on catches + counterexamples
                    │
                    ▼
             controller merge
```

### Unified Fullstack Architecture (Next.js)

Verity is implemented as a single, unified **Next.js Fullstack application** (App Router) rather than a split multi-service backend + frontend setup:

- **Server & Engine Layer (`src/lib/` & `src/app/api/`):**
  - **Deterministic Matcher:** Ingests bank statements, cash GL, and auto-clears routine exact matches.
  - **Logical Worker Runtime:** Orchestrates the LLM investigation loop using restricted tools (`get_bank_line`, `search_ledger`, `get_supporting_document`, `get_approved_fx_rate`).
  - **Deterministic Controls Engine:** Validates Finance PRs against Evidence Lineage, Accounting Integrity, and Policy Provenance rules.
  - **Sandbox Ledger:** In-memory ledger with hash-linked audit records that updates upon controller approval to complete the period close.
  - **Control PR & Replay Suite:** Groups repeated rejections, generates constrained guardrail rules, and executes replay tests on positive failures and negative counterexamples.
- **Client & Dashboard Layer (`src/components/` & `src/app/`):**
  - **Reconciliation Dashboard & Exception Queue:** Real-time queue of unmatched items and active worker tasks.
  - **Finance PR View:** Accounting impact diff (debits/credits), evidence citation inspector, and pass/fail control checklist.
  - **Block & Repair Visualizer:** Live demonstration of the Block → Structured Feedback → Agent Repair resubmission cycle.
  - **Control PR Governance:** Review interface for proposing, replay-testing, and merging versioned controls.

### Runtime distinction

- AO sessions are used to build, test, review, and integrate Verity.
- Verity cases are logical finance-agent tasks running within the Next.js fullstack application runtime.
- Do not create one AO worktree for each reconciliation exception.
- Limit finance-case concurrency to three workers so cost and behavior remain observable.

### Agent tools

Build only four:

- `get_bank_line`
- `search_ledger`
- `get_supporting_document`
- `get_approved_fx_rate`

The agent submits a structured proposal through the application rather than through an unrestricted tool.

### State machine

```text
unmatched
→ investigating
→ proposed
→ controls_failed
→ revising
→ merge_ready
→ auto_cleared | approved | rejected | escalated
```

Original proposals are immutable. A repair creates another revision.

## Three real control families

### 1. Evidence lineage

- Every material claim references an available source.
- Cited records actually exist.
- Currency, amount, counterparty, and date claims agree with the source.
- Missing or contradictory evidence forces review or escalation.
- An uncited narrative does not count as evidence.

### 2. Accounting integrity

- Total debits equal total credits.
- Accounts exist in the permitted chart.
- Entity, currency, and accounting period are valid.
- Duplicate or already-posted entries are rejected.
- Closed-period entries cannot be proposed.
- Resulting sandbox reconciliation remains internally consistent.

### 3. Policy and market-data provenance

- FX rates come from an approved source.
- Rate date and rate type match policy.
- Amount/date tolerances are explicit.
- Materiality determines approval requirements, not correctness.
- Automatic clearance is allowed only for enumerated non-posting dispositions.

Call these three controls in the demo, but implement their constituent checks. Roadmap workflow-specific packs, separation of duties, sanctions, advanced duplicate detection, and real ERP connectors.

## The critical unscripted failure

Use a live model against messy but frozen cases. Do not hard-code the model’s invalid proposal.

Select a case where:

- An invoice is denominated in EUR.
- The bank settlement is in USD.
- Multiple plausible FX rates are available.
- The policy requires the transaction-date spot rate from an approved provider.

The agent may choose an unsupported rate, use the wrong date, omit the citation, or abstain. The demo runner must tolerate all outcomes.

If the live agent submits a valid proposal immediately, offer a pre-recorded failed trace from the same frozen benchmark. Never pretend the failure happened live when it did not.

Structured rejection example:

```text
VERITY-FX-003
Status: BLOCKED

Claim:
EUR 8,000 converts to USD 8,712.

Failure:
The cited FX observation is not from an approved source and uses
the settlement date instead of the transaction date.

Required repair:
Retrieve an approved transaction-date spot rate, recalculate the
entry, and cite the exact observation.
```

The same logical worker receives this feedback and creates revision two. The Finance PR displays the accounting diff between revisions.

## Failure discovery without theatre

Do not claim sophisticated autonomous clustering from six synthetic rows.

Implement reviewer-grounded failure grouping:

1. Run the frozen benchmark with control pack `v1`.
2. Preserve first-pass agent proposals.
3. Have the controller review cases without seeing expected system metrics.
4. Store structured rejection reason codes and free-text rationale.
5. Group repeated reasons using embeddings or a lightweight LLM classification.
6. Require at least two supporting failures.
7. Generate a Control PR.
8. Test it on positive failures and negative counterexamples.
9. Human approves the rule.
10. Publish control pack `v2`.
11. Replay using the same model, temperature, tools, and core prompt.

The headline should be:

> One controller decision became a versioned control that prevented the same unsafe failure from reaching review again.

Do not say the agent “learned permanently.” Say the control suite gained a reviewed, replay-tested policy.

## Evaluation dataset

Create 24–30 sanitized or practitioner-reviewed cases:

- Exact matches
- Approved timing differences
- Bank fees requiring journal proposals
- Duplicates
- Missing evidence
- Multiple plausible matches
- Foreign-currency settlements
- Wrong FX dates or sources
- Wrong entities
- Closed-period proposals
- Correct escalation cases

Freeze:

- Inputs
- Supporting evidence
- Accounting policy
- Expected disposition
- Materiality classification
- Permitted auto-clear status
- Model configuration
- Core prompt

Split the benchmark into:

- Discovery cases
- Held-out replay cases
- Negative counterexamples for proposed controls

Publish the synthetic generator and expected outcomes. Keep expected labels hidden from the running agent.

## Numbers on screen

### Safety gate

- Critical unsafe proposals marked merge-ready
- Out-of-policy sandbox postings
- Guardrail false positives

Targets:

- Zero out-of-policy postings
- Zero critical unsafe merge-ready proposals
- Zero false positives on the named counterexample set

### Efficiency

- Controller decisions required per case
- Safe auto-clear count
- Agent repair success
- Correct abstention count

Primary efficiency headline:

> Controller-touch rate decreased while the critical escape rate remained zero.

### Quality

- Correct disposition count
- Correct journal count
- Evidence-complete proposal count
- First-pass acceptance
- Repair success

### Operational

- Model calls per case
- Tokens and cost per case
- Median case latency
- Tool failures

Never present invented controller minutes. If one controller completes two timed review rounds, label the timing as an observed benchmark result, not production savings.

## Neatlogs and TensorMux

### Neatlogs

Use Neatlogs for:

- Full agent traces
- Tool-call visibility
- Block and retry spans
- Cost and latency dashboards
- Human or AI evaluation forms
- Reviewer evidence for failure grouping

Neatlogs supports trace detections and structured human-evaluation campaigns. However, its detections are read-only annotations; they do not enforce Verity’s controls. [Neatlogs detections](https://docs.neatlogs.com/docs/features/detections) and [human evaluators](https://docs.neatlogs.com/docs/features/evals/human-evaluators)

Verity remains the enforcement layer. Neatlogs is the independent observability and evaluation layer.

### TensorMux

Use TensorMux only if the model can be routed through it without delaying the core workflow. Its documented value is inference routing, usage metering, and audit logs. [TensorMux](https://www.tensormux.com/)

If integration is not working by hour 10, remove it and meter calls inside Verity. Do not risk the demo for sponsor decoration.

### Dodo Payments

Skip it. It is irrelevant to the internal bank-reconciliation workflow.

### Maximor

Use precise finance vocabulary:

- Preparer and reviewer
- Reconciliation disposition
- Supporting evidence
- Policy version
- Materiality
- Adjustment
- Period close
- Controller approval
- Audit trail

Ask Maximor one narrow question:

> When a reconciliation exception reaches a controller, what missing evidence or policy violation most often forces it back to the preparer?

Use the answer only if received early enough to incorporate honestly.

## AO usage

AO is mandatory and should be visible throughout the build. The official event description says organizers will review how many AO sessions were used, so begin with AO immediately. [Official Syndicate listing](https://luma.com/d0kq45ek)

Use AO for genuine development work:

- Product and data contract
- Agent runtime and repair loop
- Control engine and replay suite
- Controller interface and demo
- Review, integration, and documentation

Capture:

- Initial orchestration
- Focused worker sessions
- Separate worktrees
- Pull requests
- Failed tests
- Review comments
- Feedback routed to the owning worker
- Final merged state

Do not claim Verity is an installable AO verifier plugin. Present Verity as a domain translation of AO’s operating insight and a potential future integration direction.

## What gets built

### Non-negotiable

- Frozen bank and ledger dataset
- Live LLM investigation loop
- Four constrained tools
- Finance PR with evidence and accounting diff
- Three control families
- Block → feedback → repair → resubmit
- Strict Auto/Review/Escalate router
- Controller approval
- Sandbox journal posting
- Reconciliation rerun to closed state
- Immutable revision/event history
- Benchmark dashboard
- One Control PR
- Positive and negative guardrail replay
- AO development evidence

### Cheap implementation details

- Replay fingerprint
- Hash-linked audit-event records
- CSV ingestion
- Static policy pack
- Demo reset button
- Exportable Finance PR JSON

### Explicitly not built

- Real bank or ERP connectors
- Real financial posting
- Authentication
- Multi-tenancy
- OCR
- Multiple finance workflows
- General-purpose non-code orchestration
- Autonomous control activation
- Arbitrary model-generated code
- Production-grade anomaly detection
- Dodo integration
- Mobile interface
- Elaborate deployment infrastructure

## Five-minute demo

### 0:00–0:25 — Thesis

Show one comparison:

```text
Code                       Finance
Branch                     Isolated case
Pull request               Finance PR
Diff                       Ledger impact
CI                         Verity controls
Requested changes          Structured repair
Human merge                Controller approval
```

Say:

> Coding agents scale because every change must earn the right to merge. Verity brings that discipline to finance agents.

### 0:25–0:55 — Reconciliation begins

- Ingest bank statement, cash ledger, and evidence.
- Deterministic matcher clears obvious lines.
- Exceptions enter the worker queue.
- Show Auto, Review, and Escalate counts.

Do not claim each case is a separate AO session.

### 0:55–2:05 — The CI moment

- Open one FX exception.
- Show live tool calls and evidence.
- Agent submits a plausible proposal.
- Verity blocks an invalid or unsupported decision.
- Show exact failed control.
- Route structured feedback to the same worker.
- Agent submits a corrected revision.
- Show the proposal diff.
- Controls pass.

### 2:05–2:40 — Controller merge

- Controller reviews the Finance PR.
- Show evidence, accounting impact, policy version, and control results.
- Approve the journal.
- Write it to the sandbox ledger.
- Rerun reconciliation.
- Show the case resolved and balances consistent.

### 2:40–3:55 — Control PR

- Show repeated reviewer-confirmed failure evidence.
- Verity proposes a Control PR.
- Display specification, rule, regression cases, and replay impact.
- Run it against failures and a similar counterexample.
- The failures are caught.
- The counterexample remains allowed.
- Controller merges control pack `v2`.

### 3:55–4:25 — New case

- Introduce a held-out case of the same failure class.
- Show it blocked under `v2`.
- Compare against its result under `v1`.

### 4:25–4:45 — Metrics

Show raw counts:

- Unsafe escapes
- Controller-touch rate
- Safe auto-clears
- Repair success
- False positives
- Cost per case

Do not hide regressions. If a new control reduces auto-clear coverage, explain the safety tradeoff.

### 4:45–5:00 — AO proof and close

Show the AO board, real worktrees, PRs, tests, and routed feedback.

End with:

> Verity does not make finance agents trustworthy. It makes every consequential decision prove that it is safe to merge.

## Team split

### Builder A — Finance kernel

- Dataset and policy pack
- Deterministic matching
- Control families
- Sandbox ledger
- Reconciliation close
- Replay fixtures

### Builder B — Agent and learning loop

- Agent tools
- Structured proposal
- Repair routing
- Trace instrumentation
- Failure grouping
- Control PR generation and replay

### Builder C — Product and proof

- Exception queue
- Finance PR interface
- Controller approval
- Metrics
- AO evidence capture
- README, Devpost, and demo production

Nobody owns “general platform architecture.” Every task must directly support the five-minute demo.

## Thirty-hour clock

### Hours 0–2

- Freeze the story and control boundary
- Confirm controller/practitioner availability
- Start AO sessions
- Create dataset contract
- Draft the demo before implementation

### Hours 2–8

- Build one case end to end
- Agent calls tools
- Finance PR appears
- One real control blocks it
- Agent repairs it
- Controller approves it

If this loop is not working by hour 8, cut Control PR discovery.

### Hours 8–14

- Add matching and exception queue
- Finish three control families
- Add sandbox posting
- Close one reconciliation end to end

If reconciliation does not close by hour 14, stop all integrations and UI polish.

### Hours 14–20

- Freeze benchmark
- Run baseline
- Capture traces
- Add reviewer rejection reasons
- Implement Control PR and replay

### Hours 20–23

- Add counterexamples
- Validate false-positive behavior
- Produce final metrics
- Obtain controller review

### Hours 23–26

- Add Neatlogs if not already stable
- Polish only demo-critical screens
- Finish README and diagrams
- Capture AO evidence

### Hours 26–28

- Record the final video
- Upload immediately
- Verify public permissions

### Hours 28–30

- Complete Devpost
- Test repository setup
- Verify all links in incognito mode
- Submit early
- Use remaining time only for blocking defects

## Scope fence

Immediately reject these suggestions:

- “Add AP to prove generality.”
- “Connect QuickBooks.”
- “Let it post a real journal.”
- “Generate arbitrary controls with AI.”
- “Create one AO session per finance exception.”
- “Add another dashboard.”
- “Build seven partial controls.”
- “Add a chatbot.”
- “Claim production readiness.”
- “Call every blocked output an accuracy improvement.”

One workflow. Three control families. One visible repair. One Control PR. One counterexample. One closed sandbox reconciliation.

## Go/no-go conditions

Proceed with this version only if:

- A practitioner can approve the policy and expected outcomes.
- At least 20 credible cases can be frozen early.
- A live block-and-repair loop works by hour 8.
- A complete sandbox reconciliation closes by hour 14.
- The team begins using AO immediately.
- Nobody expands the workflow.

If practitioner-reviewed data is unavailable, disclose the benchmark as synthetic and position the result as a control-mechanism demonstration. Do not present fabricated operational savings.

## Honest winning assessment

The original Verity concept is approximately a **6/10 hackathon idea**: excellent framing, but overclaimed and vulnerable to a scripted-demo objection.

This version is potentially a **9/10 Track 2 submission** because it has:

- A memorable thesis
- A real finance workflow
- Genuine agent behavior
- Deterministic safety
- Visible recovery
- Human authority
- A novel Control PR
- Counterexample testing
- Measurable outcomes
- Natural AO alignment

Assuming competent execution and credible practitioner-reviewed data:

- Probability of shipping: **75–85%**
- Probability of being memorable: **60–75%**
- Probability of placing: **25–40%**
- Probability of winning: **12–25%**

No honest strategist can promise a win. The strongest path is to make the judges remember one undeniable moment:

> A finance agent was wrong, Verity stopped it, the agent repaired its work, and one controller-approved control prevented the entire failure class from returning.
