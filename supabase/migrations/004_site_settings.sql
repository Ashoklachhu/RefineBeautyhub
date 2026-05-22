-- ============================================================
-- 004_site_settings.sql
-- Single-row table for all editable site configuration.
-- Upserted with id = 'main'; never deleted.
-- ============================================================

CREATE TABLE IF NOT EXISTS site_settings (
  id               TEXT PRIMARY KEY DEFAULT 'main',

  -- Business Info
  name             TEXT NOT NULL DEFAULT 'Refined Beauty Hub',
  tagline          TEXT NOT NULL DEFAULT 'Where Beauty Meets Excellence',
  email            TEXT NOT NULL DEFAULT 'hello@refinedbeautyhub.com',
  phone            TEXT NOT NULL DEFAULT '+977-1-4123456',
  address          TEXT NOT NULL DEFAULT 'Lazimpat, Kathmandu, Nepal 44600',
  map_url          TEXT NOT NULL DEFAULT 'https://maps.google.com/?q=Lazimpat,Kathmandu,Nepal',

  -- Social Media
  instagram        TEXT NOT NULL DEFAULT 'https://instagram.com/refinedbeautyhub',
  facebook         TEXT NOT NULL DEFAULT 'https://facebook.com/refinedbeautyhub',
  youtube          TEXT NOT NULL DEFAULT 'https://youtube.com/@refinedbeautyhub',
  tiktok           TEXT NOT NULL DEFAULT 'https://tiktok.com/@refinedbeautyhub',

  -- Opening Hours (array of {day, open, close, closed})
  opening_hours    JSONB NOT NULL DEFAULT '[
    {"day":"Sunday",    "open":"10:00","close":"19:00","closed":false},
    {"day":"Monday",    "open":"10:00","close":"19:00","closed":false},
    {"day":"Tuesday",   "open":"10:00","close":"19:00","closed":false},
    {"day":"Wednesday", "open":"10:00","close":"19:00","closed":false},
    {"day":"Thursday",  "open":"10:00","close":"19:00","closed":false},
    {"day":"Friday",    "open":"10:00","close":"20:00","closed":false},
    {"day":"Saturday",  "open":"09:00","close":"20:00","closed":false}
  ]'::jsonb,

  -- SEO
  meta_title       TEXT NOT NULL DEFAULT 'Refined Beauty Hub — Luxury Salon & Academy, Kathmandu',
  meta_description TEXT NOT NULL DEFAULT 'Kathmandu''s premier luxury beauty salon and academy. Expert services in hair, skin, nails, makeup, and professional beauty training.',
  og_image         TEXT NOT NULL DEFAULT '',

  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed the single row so it always exists
INSERT INTO site_settings (id)
VALUES ('main')
ON CONFLICT (id) DO NOTHING;

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public can read (Footer, metadata, etc.)
CREATE POLICY "site_settings_public_read"
  ON site_settings FOR SELECT
  USING (true);

-- Only admins can update
CREATE POLICY "site_settings_admin_update"
  ON site_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );
