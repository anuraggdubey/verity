# Verity

> **"Don't trust the agent's confidence. Trust what passed."**

Verity is a change-control plane and merge gate for agent-generated finance work.

Just as Git and CI give software engineering isolated branches, automated regression checks, and pull request reviews, Verity gives financial accounting agents isolated exception investigation, deterministic policy controls, repair loops, and human controller approval.

**Benchmark status:** The frozen dataset in `bench/fixtures/` is **synthetic** and has **not** been practitioner-reviewed. The UI labels this explicitly on the metrics screen and in this README.

---

## Vercel deployment (fresh)

The Neon database link in Vercel env is enough — the build runs `db:migrate` automatically
and seeds the demo benchmark on first deploy.

### Required Vercel environment variables

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | *(from Neon integration)* | Already linked |
| `VERITY_MODEL_PROVIDER` | `fixture` | Pre-recorded demo, no model spend |

Optional for live agent runs: `GROQ_API_KEY`, `VERITY_MODEL`, etc.

### Deploy steps

1. Push to GitHub (or connect repo in Vercel).
2. **Redeploy** with “Clear build cache” for a truly fresh build.
3. Open `/queue` — you should see 29 cases from Postgres.
4. Use navbar **Reset** or `POST /api/reset` to restore demo state anytime.

To re-seed the database manually (e.g. before recording):

```bash
npm run db:reset
```

---

## Live deployment

**https://verity-merge-control.vercel.app**

| Page | What it shows |
|---|---|
| [/queue](https://verity-merge-control.vercel.app/queue) | Exception queue, Auto / Review / Escalate lanes, live worker activity |
| [/cases/CASE-001](https://verity-merge-control.vercel.app/cases/CASE-001) | The Finance PR: evidence, accounting impact, control checklist, revision diff |
| [/controls](https://verity-merge-control.vercel.app/controls) | Failure groups, the drafted Control PR, replay, merge to pack v2 |
| [/metrics](https://verity-merge-control.vercel.app/metrics) | Raw counts from the event log |

Verified on the deployment: run CASE-001, revision 1 blocked by `VERITY-FX-003`,
revision 2 repaired and passing, approve, posted to the hash-linked sandbox
ledger. `POST /api/reset` returns everything to the frozen initial state.

Two things to know before demoing from the deployed URL:

- **Runs are pre-recorded there.** No model key is set in the deployment, so the
  worker replays transcripts. That is deliberate — the deployed demo should not
  spend money or depend on a provider — but it means anything you show from it
  must be described as pre-recorded. For live agent behaviour, run locally with
  `ANTHROPIC_API_KEY` set, or add the key in Vercel's project settings.
- **State persists in Neon PostgreSQL when `DATABASE_URL` is set.** Controller
  decisions, proposals, events, and ledger records survive server restarts and
  cold starts. Without `DATABASE_URL`, the app falls back to in-memory state
  (fine for local fixture-only runs). Use **Reset** in the navbar or
  `POST /api/reset` to restore the frozen benchmark demo data.

---

## How It Works

```
Bank Statement + Ledger
           │
           ▼
 Deterministic Matcher ──► Clears routine matches
           │
   Exceptions Queue
           │
           ▼
 Logical Finance Agents ──► Propose resolution with citations
           │
           ▼
      Finance PR ────────► Evaluated against Deterministic Controls
           │                 ├─ Blocked: returns structured feedback to agent to repair
           │                 └─ Passed: sent for Controller Review
           ▼
  Controller Approval ────► Written to Sandbox Ledger (Bank Rec Closes)
           │
  Recurring Rejections ───► Generates Control PR (versioned, replay-tested guardrail)
```

1. **Deterministic Matching** — Routinely clears straightforward matching transactions.
2. **Exception Investigation** — Unresolved items are assigned to an LLM agent with restricted tools.
3. **Finance PR** — Structured proposal with debits, credits, evidence citations, and FX rate source.
4. **Deterministic Control Engine** — Automated CI checks; failures route structured feedback for repair.
5. **Human Controller Merge** — Controller reviews evidence and approves posting to the sandbox ledger.
6. **Control PR** — Recurring failure patterns become versioned guardrails with replay before merge.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/anuraggdubey/verity.git
cd verity
npm install
```

### Database (Neon PostgreSQL)

Add your Neon connection string to `.env`:

```env
DATABASE_URL=postgresql://...
```

Then seed the demo benchmark (29 cases, proposals, events, CPR-001, ledger records):

```bash
npm run db:migrate    # first-time schema + seed
npm run db:reset      # restore frozen demo data (video reset)
```

When `DATABASE_URL` is set, all API routes load and persist state through Postgres.
Tests always use the in-memory store so `npm test` stays fast and offline.

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Five-Minute Demo Path (UI only — no terminal)

1. **Queue** (`/queue`) — See Auto / Review / Escalate lanes from live store data.
2. **Finance PR** (`/cases/CASE-001`) — Revision diff, control checklist, approve with keyboard shortcuts (A/R/E).
3. **Controls** (`/controls`) — Run replay on CPR-001, then merge to pack v2.
4. **Metrics** (`/metrics`) — Raw counts from the event store; held-out CASE-012 comparison.
5. **Reset** — Navbar **Reset** button restores the frozen benchmark (`POST /api/reset`).

### Benchmark & Evaluation Commands

```bash
npm test          # Unit tests
npm run bench     # Matcher + control engine expectations
npm run replay    # Control PR replay fixtures
npm run agent -- CASE-001   # Offline worker transcript
```

---

## Architecture

See [docs/architecture.md](docs/architecture.md) for the system diagram and module ownership (Builders A/B/C).

### Key API Routes

| Route | Purpose |
|---|---|
| `GET /api/cases` | Exception queue + reconciliation status |
| `GET /api/cases/[id]` | Finance PR detail |
| `POST /api/cases/[id]/investigate` | Run worker on a case |
| `POST /api/proposals/[id]/decision` | Controller approve/reject |
| `GET /api/stream` | SSE worker trace stream |
| `GET /api/control-prs` | Control PR list |
| `POST /api/control-prs/[id]/replay` | Historical replay |
| `POST /api/control-prs/[id]/merge` | Merge control pack |
| `GET /api/metrics` | Raw benchmark telemetry |
| `POST /api/reset` | Reset demo state |

---

## Honesty Rules

- Synthetic benchmark data is labeled **synthetic** on screen and in docs.
- Metrics show **raw counts only** — no invented controller-minutes-saved.
- Pre-recorded worker transcripts are labeled when `live: false` is used on investigate.

---

## License

MIT
