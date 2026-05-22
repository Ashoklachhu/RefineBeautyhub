-- ============================================================
-- REFINED BEAUTY HUB — Row Level Security Policies
-- Migration: 002_rls.sql
-- Run AFTER 001_schema.sql
-- ============================================================

-- ============================================================
-- HELPER: is_admin()
-- Checks if the current user has admin role in profiles table
-- ============================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

CREATE OR REPLACE FUNCTION is_staff_or_admin()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('staff', 'admin')
  );
END;
$$;

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================

ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories         ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff              ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_services     ENABLE ROW LEVEL SECURITY;
ALTER TABLE services           ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates      ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings           ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_courses    ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials       ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery            ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_inquiries  ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES
-- ============================================================

-- Anyone can read their own profile
CREATE POLICY "profiles: users read own"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- Users can update their own profile (not role)
CREATE POLICY "profiles: users update own"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

-- Admins can read all profiles
CREATE POLICY "profiles: admins read all"
  ON profiles FOR SELECT
  USING (is_admin());

-- Admins can update all profiles (including role changes)
CREATE POLICY "profiles: admins update all"
  ON profiles FOR UPDATE
  USING (is_admin());

-- Service role (used server-side) bypasses RLS automatically
-- Profile insert is handled by the trigger — no INSERT policy needed for users

-- ============================================================
-- CATEGORIES — Public read
-- ============================================================

CREATE POLICY "categories: public read active"
  ON categories FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "categories: admin full access"
  ON categories FOR ALL
  USING (is_admin());

-- ============================================================
-- STAFF — Public read active staff
-- ============================================================

CREATE POLICY "staff: public read active"
  ON staff FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "staff: admin full access"
  ON staff FOR ALL
  USING (is_admin());

-- ============================================================
-- STAFF_SERVICES — Public read
-- ============================================================

CREATE POLICY "staff_services: public read"
  ON staff_services FOR SELECT
  USING (TRUE);

CREATE POLICY "staff_services: admin manage"
  ON staff_services FOR ALL
  USING (is_admin());

-- ============================================================
-- SERVICES — Public read active services
-- ============================================================

CREATE POLICY "services: public read active"
  ON services FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "services: admin full access"
  ON services FOR ALL
  USING (is_admin());

-- ============================================================
-- AVAILABILITY SLOTS — Public read (needed for booking)
-- ============================================================

CREATE POLICY "availability: public read active"
  ON availability_slots FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "availability: admin manage"
  ON availability_slots FOR ALL
  USING (is_admin());

-- ============================================================
-- BLOCKED DATES — Public read (needed for booking calendar)
-- ============================================================

CREATE POLICY "blocked_dates: public read"
  ON blocked_dates FOR SELECT
  USING (TRUE);

CREATE POLICY "blocked_dates: admin manage"
  ON blocked_dates FOR ALL
  USING (is_admin());

-- ============================================================
-- BOOKINGS
-- ============================================================

-- Authenticated users see their own bookings
CREATE POLICY "bookings: users read own"
  ON bookings FOR SELECT
  USING (user_id = auth.uid());

-- Authenticated users can create a booking for themselves
CREATE POLICY "bookings: users create own"
  ON bookings FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR user_id IS NULL  -- guest bookings allowed (no auth required)
  );

-- Users can cancel (update status to cancelled) their own pending bookings
CREATE POLICY "bookings: users cancel own"
  ON bookings FOR UPDATE
  USING (
    user_id = auth.uid()
    AND status IN ('pending', 'confirmed')
  )
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'cancelled'  -- can only set to cancelled, nothing else
  );

-- Staff see bookings assigned to them
CREATE POLICY "bookings: staff read own assigned"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM staff s
      JOIN profiles p ON p.id = auth.uid()
      WHERE s.profile_id = auth.uid()
        AND s.id = bookings.staff_id
        AND p.role IN ('staff', 'admin')
    )
  );

-- Admins can do everything
CREATE POLICY "bookings: admin full access"
  ON bookings FOR ALL
  USING (is_admin());

-- Allow anonymous SELECT for guest booking lookups by reference (handled via service role)
-- Public INSERT for guests (no user_id)
CREATE POLICY "bookings: guest create"
  ON bookings FOR INSERT
  WITH CHECK (
    user_id IS NULL
    AND guest_name IS NOT NULL
    AND guest_email IS NOT NULL
  );

-- ============================================================
-- ACADEMY COURSES — Public read active courses
-- ============================================================

CREATE POLICY "courses: public read active"
  ON academy_courses FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "courses: admin full access"
  ON academy_courses FOR ALL
  USING (is_admin());

-- ============================================================
-- ENROLLMENTS
-- ============================================================

CREATE POLICY "enrollments: users read own"
  ON enrollments FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "enrollments: users create own"
  ON enrollments FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "enrollments: guest create"
  ON enrollments FOR INSERT
  WITH CHECK (
    user_id IS NULL
    AND guest_name IS NOT NULL
    AND guest_email IS NOT NULL
  );

CREATE POLICY "enrollments: admin full access"
  ON enrollments FOR ALL
  USING (is_admin());

-- ============================================================
-- TESTIMONIALS — Public read published
-- ============================================================

CREATE POLICY "testimonials: public read published"
  ON testimonials FOR SELECT
  USING (is_published = TRUE);

-- Authenticated users can submit their own
CREATE POLICY "testimonials: users create own"
  ON testimonials FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "testimonials: users read own"
  ON testimonials FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "testimonials: admin full access"
  ON testimonials FOR ALL
  USING (is_admin());

-- ============================================================
-- GALLERY — Public read published
-- ============================================================

CREATE POLICY "gallery: public read published"
  ON gallery FOR SELECT
  USING (is_published = TRUE);

CREATE POLICY "gallery: admin full access"
  ON gallery FOR ALL
  USING (is_admin());

-- ============================================================
-- CONTACT INQUIRIES
-- ============================================================

-- Anyone can submit an inquiry
CREATE POLICY "inquiries: anyone create"
  ON contact_inquiries FOR INSERT
  WITH CHECK (TRUE);

-- Admins manage everything
CREATE POLICY "inquiries: admin full access"
  ON contact_inquiries FOR ALL
  USING (is_admin());
