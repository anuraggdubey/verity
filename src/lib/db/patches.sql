-- Patches for databases created before the full schema alignment.
ALTER TABLE fx_observations ADD COLUMN IF NOT EXISTS approved BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE controller_decisions ALTER COLUMN rationale DROP NOT NULL;

CREATE TABLE IF NOT EXISTS route_decisions (
  proposal_id VARCHAR(64) PRIMARY KEY,
  lane VARCHAR(32) NOT NULL,
  reason TEXT NOT NULL
);

-- Legacy control_prs table used title/description columns; replace with JSON body.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'control_prs' AND column_name = 'title'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'control_prs' AND column_name = 'body'
  ) THEN
    DROP TABLE control_prs CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS control_prs (
  id VARCHAR(64) PRIMARY KEY,
  body JSONB NOT NULL,
  status VARCHAR(32) NOT NULL,
  drafted_at TIMESTAMPTZ NOT NULL,
  merged_at TIMESTAMPTZ
);

-- Legacy table shapes from earlier scaffold — drop so schema.sql can recreate.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'ledger_records'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'ledger_records' AND column_name = 'lines'
  ) THEN
    DROP TABLE ledger_records CASCADE;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'verity_events'
  ) AND (
    NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = 'verity_events' AND column_name = 'payload'
    )
    OR EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = 'verity_events' AND column_name = 'entity_id'
    )
  ) THEN
    DROP TABLE verity_events CASCADE;
  END IF;
END $$;

-- controller_decisions: ensure proposal_id is unique for upserts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'controller_decisions'::regclass AND contype = 'u'
      AND pg_get_constraintdef(oid) LIKE '%proposal_id%'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'controller_decisions'::regclass AND contype = 'p'
      AND pg_get_constraintdef(oid) LIKE '%proposal_id%'
  ) THEN
    ALTER TABLE controller_decisions ADD CONSTRAINT controller_decisions_proposal_id_key UNIQUE (proposal_id);
  END IF;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- control_reports: migrate serial id tables to proposal_id primary key
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'control_reports' AND column_name = 'id'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'control_reports'::regclass AND contype = 'p'
      AND pg_get_constraintdef(oid) LIKE '%proposal_id%'
  ) THEN
    ALTER TABLE control_reports DROP CONSTRAINT IF EXISTS control_reports_pkey;
    ALTER TABLE control_reports DROP COLUMN IF EXISTS id;
    ALTER TABLE control_reports ADD PRIMARY KEY (proposal_id);
  END IF;
EXCEPTION
  WHEN others THEN NULL;
END $$;

ALTER TABLE cases ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS counterparty VARCHAR(255);
ALTER TABLE cases ADD COLUMN IF NOT EXISTS amount NUMERIC(14, 2);
ALTER TABLE cases ADD COLUMN IF NOT EXISTS currency VARCHAR(8);
ALTER TABLE cases ADD COLUMN IF NOT EXISTS worker_active BOOLEAN DEFAULT FALSE;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS worker_id VARCHAR(64);
ALTER TABLE cases ADD COLUMN IF NOT EXISTS trace_id VARCHAR(64);
