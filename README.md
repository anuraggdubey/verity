# Verity

> **"Don't trust the agent's confidence. Trust what passed."**

Verity is a change-control plane and merge gate for agent-generated finance work.

Just as Git and CI give software engineering isolated branches, automated regression checks, and pull request reviews, Verity gives financial accounting agents isolated exception investigation, deterministic policy controls, repair loops, and human controller approval.

**Benchmark status:** The frozen dataset in `bench/fixtures/` is **synthetic** and has **not** been practitioner-reviewed. The UI labels this explicitly on the metrics screen and in this README.

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
