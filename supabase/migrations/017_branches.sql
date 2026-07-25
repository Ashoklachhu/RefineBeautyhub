-- ============================================================
-- 017 — Branch locations
-- Moves the branch list out of hardcoded constants and into
-- site_settings so admins can manage locations themselves.
-- Run this in your Supabase SQL Editor.
-- ============================================================

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS branches JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Backfill the two existing branches, reusing the business phone that is
-- already configured rather than hardcoding a number that may be stale.
UPDATE site_settings
SET branches = jsonb_build_array(
  jsonb_build_object(
    'id',      'jadibuti',
    'name',    'Jadibuti Branch',
    'address', 'Jadibuti, Kathmandu, Nepal',
    'phone',   phone,
    'map_url', 'https://maps.google.com/?q=Jadibuti,Kathmandu,Nepal'
  ),
  jsonb_build_object(
    'id',      'machapokhari',
    'name',    'Machapokhari Branch',
    'address', 'Machapokhari, Kathmandu, Nepal',
    'phone',   phone,
    'map_url', 'https://maps.google.com/?q=Machapokhari,Kathmandu,Nepal'
  )
)
WHERE id = 'main'
  AND (branches IS NULL OR jsonb_array_length(branches) = 0);
