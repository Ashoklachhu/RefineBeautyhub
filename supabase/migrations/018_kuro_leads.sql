-- ============================================================
-- 018 — Kuro chatbot leads
-- Leads captured by the Kuro widget, delivered by signed webhook.
-- resource_id is Kuro's X-Kuro-Resource-Id and is UNIQUE, which is what
-- makes retried deliveries update the same row instead of duplicating.
-- Run this in your Supabase SQL Editor.
-- ============================================================

CREATE TABLE IF NOT EXISTS kuro_leads (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Kuro identifiers
  resource_id     TEXT        NOT NULL UNIQUE,
  lead_id         TEXT,
  session_id      TEXT,

  -- Who and what
  name            TEXT,
  phone           TEXT,
  email           TEXT,
  interest        TEXT,
  message         TEXT,
  source          TEXT,
  channel         TEXT,
  score           INT,
  kuro_status     TEXT,
  details         JSONB       NOT NULL DEFAULT '{}'::jsonb,
  lead_created_at TIMESTAMPTZ,

  -- Salon's own follow-up workflow
  status          TEXT        NOT NULL DEFAULT 'new',
  notes           TEXT,

  received_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS kuro_leads_received_idx ON kuro_leads (received_at DESC);
CREATE INDEX IF NOT EXISTS kuro_leads_status_idx   ON kuro_leads (status);

ALTER TABLE kuro_leads ENABLE ROW LEVEL SECURITY;

-- No public read: leads carry personal contact details. The webhook writes
-- with the service role, which bypasses RLS.
DROP POLICY IF EXISTS "kuro_leads: admin full access" ON kuro_leads;
CREATE POLICY "kuro_leads: admin full access"
  ON kuro_leads FOR ALL
  USING (is_admin());
