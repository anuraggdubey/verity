-- Verity Database Schema for Neon PostgreSQL
-- Runtime state mirrors src/lib/store/kernel.ts + bench/fixtures/demo.json

-- 1. Key-value config (meta, reconciliation, heldOut, packVersion, activeBankLineIds)
CREATE TABLE IF NOT EXISTS verity_meta (
  key VARCHAR(64) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Reference data (immutable benchmark inputs)
CREATE TABLE IF NOT EXISTS bank_lines (
  id VARCHAR(64) PRIMARY KEY,
  posted_date DATE NOT NULL,
  value_date DATE NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  currency VARCHAR(8) NOT NULL,
  counterparty VARCHAR(255) NOT NULL,
  reference VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ledger_entries (
  id VARCHAR(64) PRIMARY KEY,
  entry_date DATE NOT NULL,
  account VARCHAR(64) NOT NULL,
  entity VARCHAR(64) NOT NULL,
  period VARCHAR(16) NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  currency VARCHAR(8) NOT NULL,
  counterparty VARCHAR(255) NOT NULL,
  reference VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  posted BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supporting_documents (
  id VARCHAR(64) PRIMARY KEY,
  doc_type VARCHAR(64) NOT NULL,
  issued_date DATE NOT NULL,
  counterparty VARCHAR(255) NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  currency VARCHAR(8) NOT NULL,
  reference VARCHAR(255) NOT NULL,
  fields JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fx_observations (
  id VARCHAR(64) PRIMARY KEY,
  base VARCHAR(8) NOT NULL,
  quote VARCHAR(8) NOT NULL,
  rate NUMERIC(12, 6) NOT NULL,
  rate_date DATE NOT NULL,
  rate_type VARCHAR(32) NOT NULL,
  source_id VARCHAR(64) NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Runtime exception workflow
CREATE TABLE IF NOT EXISTS cases (
  id VARCHAR(64) PRIMARY KEY,
  bank_line_id VARCHAR(64) REFERENCES bank_lines(id) ON DELETE CASCADE,
  candidate_ledger_ids JSONB DEFAULT '[]'::jsonb,
  state VARCHAR(32) NOT NULL,
  materiality VARCHAR(32) NOT NULL,
  auto_clear_permitted BOOLEAN DEFAULT FALSE,
  revisions JSONB DEFAULT '[]'::jsonb,
  opened_at TIMESTAMPTZ NOT NULL,
  summary TEXT NOT NULL,
  title TEXT,
  counterparty VARCHAR(255),
  amount NUMERIC(14, 2),
  currency VARCHAR(8),
  worker_active BOOLEAN DEFAULT FALSE,
  worker_id VARCHAR(64),
  trace_id VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS proposals (
  id VARCHAR(64) PRIMARY KEY,
  case_id VARCHAR(64) REFERENCES cases(id) ON DELETE CASCADE,
  revision INT NOT NULL,
  repaired_from VARCHAR(64),
  disposition VARCHAR(64) NOT NULL,
  narrative TEXT NOT NULL,
  citations JSONB DEFAULT '[]'::jsonb,
  journal JSONB DEFAULT '[]'::jsonb,
  fx JSONB,
  policy_version VARCHAR(64) NOT NULL,
  control_pack_version VARCHAR(64) NOT NULL,
  trace_id VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS control_reports (
  proposal_id VARCHAR(64) PRIMARY KEY REFERENCES proposals(id) ON DELETE CASCADE,
  pack_version VARCHAR(64) NOT NULL,
  blocked BOOLEAN NOT NULL DEFAULT FALSE,
  results JSONB DEFAULT '[]'::jsonb,
  evaluated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS route_decisions (
  proposal_id VARCHAR(64) PRIMARY KEY REFERENCES proposals(id) ON DELETE CASCADE,
  lane VARCHAR(32) NOT NULL,
  reason TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS controller_decisions (
  proposal_id VARCHAR(64) PRIMARY KEY REFERENCES proposals(id) ON DELETE CASCADE,
  case_id VARCHAR(64) REFERENCES cases(id) ON DELETE CASCADE,
  decision VARCHAR(32) NOT NULL,
  reason_code VARCHAR(64),
  rationale TEXT,
  decided_by VARCHAR(255) NOT NULL,
  decided_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS ledger_records (
  id VARCHAR(64) PRIMARY KEY,
  proposal_id VARCHAR(64) NOT NULL UNIQUE REFERENCES proposals(id) ON DELETE CASCADE,
  lines JSONB NOT NULL,
  posted_at TIMESTAMPTZ NOT NULL,
  prev_hash VARCHAR(64) NOT NULL,
  hash VARCHAR(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS control_prs (
  id VARCHAR(64) PRIMARY KEY,
  body JSONB NOT NULL,
  status VARCHAR(32) NOT NULL,
  drafted_at TIMESTAMPTZ NOT NULL,
  merged_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS verity_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(64) NOT NULL,
  payload JSONB NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cases_state ON cases(state);
CREATE INDEX IF NOT EXISTS idx_proposals_case ON proposals(case_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON verity_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_recorded ON verity_events(recorded_at);
