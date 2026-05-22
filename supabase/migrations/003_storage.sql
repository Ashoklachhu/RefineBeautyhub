-- ============================================================
-- REFINED BEAUTY HUB — Storage Buckets & Policies
-- Migration: 003_storage.sql
-- Run AFTER 002_rls.sql
-- ============================================================

-- ============================================================
-- CREATE STORAGE BUCKETS
-- ============================================================

-- Public buckets (images served publicly via CDN URL)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('gallery',
   'gallery',
   TRUE,
   5242880,  -- 5 MB
   ARRAY['image/jpeg','image/png','image/webp','image/avif']),

  ('services',
   'services',
   TRUE,
   5242880,
   ARRAY['image/jpeg','image/png','image/webp','image/avif']),

  ('staff',
   'staff',
   TRUE,
   3145728,  -- 3 MB
   ARRAY['image/jpeg','image/png','image/webp']),

  ('courses',
   'courses',
   TRUE,
   5242880,
   ARRAY['image/jpeg','image/png','image/webp','image/avif']),

  ('avatars',
   'avatars',
   TRUE,
   2097152,  -- 2 MB
   ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STORAGE RLS POLICIES
-- ============================================================

-- ── GALLERY BUCKET ───────────────────────────────────────────

-- Anyone can read public gallery images
CREATE POLICY "gallery: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery');

-- Admins can upload gallery images
CREATE POLICY "gallery: admin upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'gallery' AND is_admin());

-- Admins can delete gallery images
CREATE POLICY "gallery: admin delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'gallery' AND is_admin());

-- Admins can update gallery images
CREATE POLICY "gallery: admin update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'gallery' AND is_admin());

-- ── SERVICES BUCKET ──────────────────────────────────────────

CREATE POLICY "services: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'services');

CREATE POLICY "services: admin upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'services' AND is_admin());

CREATE POLICY "services: admin delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'services' AND is_admin());

-- ── STAFF BUCKET ─────────────────────────────────────────────

CREATE POLICY "staff: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'staff');

CREATE POLICY "staff: admin upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'staff' AND is_admin());

CREATE POLICY "staff: admin delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'staff' AND is_admin());

-- ── COURSES BUCKET ───────────────────────────────────────────

CREATE POLICY "courses: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'courses');

CREATE POLICY "courses: admin upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'courses' AND is_admin());

CREATE POLICY "courses: admin delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'courses' AND is_admin());

-- ── AVATARS BUCKET ───────────────────────────────────────────

-- Anyone can read avatars (public profile pictures)
CREATE POLICY "avatars: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Users can upload their own avatar (path must start with their user id)
CREATE POLICY "avatars: user upload own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::TEXT = (SPLIT_PART(name, '/', 1))
  );

-- Users can update/delete their own avatar
CREATE POLICY "avatars: user delete own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::TEXT = (SPLIT_PART(name, '/', 1))
  );

-- Admins can manage all avatars
CREATE POLICY "avatars: admin manage"
  ON storage.objects FOR ALL
  USING (bucket_id = 'avatars' AND is_admin());
