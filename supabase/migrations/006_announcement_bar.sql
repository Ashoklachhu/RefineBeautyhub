-- ──────────────────────────────────────────────────────────────
-- 006 — Announcement Bar
-- Single-row table (id = 'main') for the global top-bar banner
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS announcement_bar (
  id          TEXT PRIMARY KEY DEFAULT 'main',
  is_active   BOOLEAN NOT NULL DEFAULT false,
  message     TEXT    NOT NULL DEFAULT '',
  link_text   TEXT,
  link_url    TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed a default row so getAnnouncementBar never returns null
INSERT INTO announcement_bar (id, is_active, message)
VALUES ('main', false, '✨ Welcome to Refined Beauty Hub — Book your luxury experience today!')
ON CONFLICT (id) DO NOTHING;

-- Only admins may write; anyone may read (needed for SSR public pages)
ALTER TABLE announcement_bar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_announcement"
  ON announcement_bar FOR SELECT USING (true);

CREATE POLICY "admin_all_announcement"
  ON announcement_bar FOR ALL
  USING     (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
