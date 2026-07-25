-- ============================================================
-- 016 — Video Gallery (homepage reels)
-- Cloudinary video URLs, managed from the admin panel.
-- Run this in your Supabase SQL Editor.
-- ============================================================

CREATE TABLE IF NOT EXISTS video_gallery (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_url     TEXT        NOT NULL,
  poster_url    TEXT,
  title         TEXT,
  caption       TEXT,
  is_published  BOOLEAN     NOT NULL DEFAULT TRUE,
  display_order INT         NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS video_gallery_order_idx
  ON video_gallery (display_order);

ALTER TABLE video_gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "video_gallery: public read published" ON video_gallery;
CREATE POLICY "video_gallery: public read published"
  ON video_gallery FOR SELECT
  USING (is_published = TRUE);

DROP POLICY IF EXISTS "video_gallery: admin full access" ON video_gallery;
CREATE POLICY "video_gallery: admin full access"
  ON video_gallery FOR ALL
  USING (is_admin());
