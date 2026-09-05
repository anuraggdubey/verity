# Verity

> **"Don't trust the agent's confidence. Trust what passed."**

Verity is a change-control plane and merge gate for agent-generated finance work. 

Just as Git and CI give software engineering isolated branches, automated regression checks, and pull request reviews, Verity gives financial accounting agents isolated exception investigation, deterministic policy controls, repair loops, and human controller approval.

---

## How It Works

Verity operates across two core layers:

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

1. **Deterministic Matching:** Routinely clears straightforward matching transactions.
2. **Exception Investigation:** Unresolved items (e.g., FX variance, missing receipt, short pay) are assigned to an LLM agent with restricted tools (`get_bank_line`, `search_ledger`, `get_supporting_doc`, `get_approved_fx_rate`).
3. **Finance PR:** The agent generates a structured proposal (debits, credits, evidence citations, FX rate source).
4. **Deterministic Control Engine:** Automated CI checks enforce accounting integrity, evidence lineage, and policy rules. If a check fails, structured feedback is routed back to the agent for an automated repair iteration.
5. **Human Controller Merge:** Once controls pass, a controller reviews the evidence diff and approves posting to the sandbox ledger to complete the period close.
6. **Control PR (Guardrail Evolution):** When a failure pattern recurs, Verity drafts a constrained guardrail rule, tests it against positive and negative counterexamples, and allows the controller to merge the new control permanently.

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/anuraggdubey/verity.git
cd verity

# Install dependencies
npm install
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the Verity Controller Dashboard.
