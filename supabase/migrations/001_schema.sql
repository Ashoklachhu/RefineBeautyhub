-- ============================================================
-- REFINED BEAUTY HUB — Production Database Schema
-- Migration: 001_schema.sql
-- Run this in your Supabase SQL Editor (in order)
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- fuzzy text search

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role        AS ENUM ('client', 'staff', 'admin');
CREATE TYPE booking_status   AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
CREATE TYPE course_level     AS ENUM ('beginner', 'intermediate', 'advanced', 'professional');
CREATE TYPE course_format    AS ENUM ('in_person', 'online', 'hybrid');
CREATE TYPE enrollment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE inquiry_status   AS ENUM ('new', 'in_progress', 'resolved', 'closed');
CREATE TYPE day_of_week      AS ENUM ('sunday','monday','tuesday','wednesday','thursday','friday','saturday');

-- ============================================================
-- TABLE: profiles
-- Extends auth.users (one-to-one, same UUID)
-- ============================================================

CREATE TABLE profiles (
  id              UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT        NOT NULL,
  full_name       TEXT        NOT NULL DEFAULT '',
  phone           TEXT,
  avatar_url      TEXT,
  role            user_role   NOT NULL DEFAULT 'client',
  date_of_birth   DATE,
  notes           TEXT,                   -- internal staff notes about client
  is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'Public profile data extending auth.users';

-- ============================================================
-- TABLE: categories
-- Service categories (hair, skin, nails, etc.)
-- ============================================================

CREATE TABLE categories (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT        NOT NULL UNIQUE,
  slug        TEXT        NOT NULL UNIQUE,
  description TEXT,
  icon        TEXT,
  display_order INT       NOT NULL DEFAULT 0,
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: staff
-- Staff members who perform services
-- ============================================================

CREATE TABLE staff (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id    UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  name          TEXT        NOT NULL,
  slug          TEXT        NOT NULL UNIQUE,
  role          TEXT        NOT NULL DEFAULT 'Beauty Artist',
  bio           TEXT,
  avatar_url    TEXT,
  experience_years INT      DEFAULT 0,
  instagram_url TEXT,
  specialties   TEXT[]      DEFAULT '{}',
  is_featured   BOOLEAN     NOT NULL DEFAULT FALSE,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  display_order INT         NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: services
-- Beauty services offered
-- ============================================================

CREATE TABLE services (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id       UUID        NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name              TEXT        NOT NULL,
  slug              TEXT        NOT NULL UNIQUE,
  description       TEXT,
  short_description TEXT,
  duration_minutes  INT         NOT NULL CHECK (duration_minutes > 0),
  price             NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  price_max         NUMERIC(10,2) CHECK (price_max IS NULL OR price_max >= price),
  image_url         TEXT,
  benefits          TEXT[]      DEFAULT '{}',
  is_featured       BOOLEAN     NOT NULL DEFAULT FALSE,
  is_popular        BOOLEAN     NOT NULL DEFAULT FALSE,
  is_active         BOOLEAN     NOT NULL DEFAULT TRUE,
  display_order     INT         NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Junction: which staff can perform which services
CREATE TABLE staff_services (
  staff_id    UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  service_id  UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (staff_id, service_id)
);

-- ============================================================
-- TABLE: availability_slots
-- Staff working hours per day
-- ============================================================

CREATE TABLE availability_slots (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id    UUID        NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  day         day_of_week NOT NULL,
  start_time  TIME        NOT NULL,
  end_time    TIME        NOT NULL,
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  UNIQUE (staff_id, day, start_time)
);

-- ============================================================
-- TABLE: blocked_dates
-- Days off, holidays, staff leave
-- ============================================================

CREATE TABLE blocked_dates (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id    UUID        REFERENCES staff(id) ON DELETE CASCADE, -- NULL = salon-wide
  date        DATE        NOT NULL,
  reason      TEXT,
  created_by  UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: bookings
-- Core booking records
-- ============================================================

CREATE TABLE bookings (
  id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference       TEXT          NOT NULL UNIQUE DEFAULT 'RBH-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 8)),
  user_id         UUID          REFERENCES profiles(id) ON DELETE SET NULL,
  -- guest fields (when not logged in)
  guest_name      TEXT,
  guest_email     TEXT,
  guest_phone     TEXT,
  service_id      UUID          NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  staff_id        UUID          REFERENCES staff(id) ON DELETE SET NULL,
  booking_date    DATE          NOT NULL,
  start_time      TIME          NOT NULL,
  end_time        TIME          NOT NULL,
  status          booking_status NOT NULL DEFAULT 'pending',
  total_amount    NUMERIC(10,2) NOT NULL,
  notes           TEXT,           -- client note
  staff_notes     TEXT,           -- internal note
  cancelled_at    TIMESTAMPTZ,
  cancelled_by    UUID          REFERENCES profiles(id) ON DELETE SET NULL,
  cancellation_reason TEXT,
  confirmed_at    TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT booking_has_client CHECK (user_id IS NOT NULL OR (guest_name IS NOT NULL AND guest_email IS NOT NULL)),
  CONSTRAINT valid_booking_time  CHECK (end_time > start_time)
);

-- ============================================================
-- TABLE: academy_courses
-- ============================================================

CREATE TABLE academy_courses (
  id                UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  title             TEXT          NOT NULL,
  slug              TEXT          NOT NULL UNIQUE,
  category          TEXT          NOT NULL,
  level             course_level  NOT NULL,
  format            course_format NOT NULL DEFAULT 'in_person',
  description       TEXT,
  short_description TEXT,
  duration_text     TEXT          NOT NULL,  -- e.g. "3 Months", "6 Weeks"
  price             NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  max_students      INT           NOT NULL DEFAULT 12,
  current_students  INT           NOT NULL DEFAULT 0,
  image_url         TEXT,
  instructor_name   TEXT,
  syllabus          JSONB         NOT NULL DEFAULT '[]',
  includes          TEXT[]        DEFAULT '{}',
  has_certificate   BOOLEAN       NOT NULL DEFAULT TRUE,
  is_featured       BOOLEAN       NOT NULL DEFAULT FALSE,
  is_active         BOOLEAN       NOT NULL DEFAULT TRUE,
  next_start_date   DATE,
  display_order     INT           NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: enrollments
-- Academy course enrollments
-- ============================================================

CREATE TABLE enrollments (
  id            UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference     TEXT              NOT NULL UNIQUE DEFAULT 'ACE-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 8)),
  user_id       UUID              REFERENCES profiles(id) ON DELETE SET NULL,
  guest_name    TEXT,
  guest_email   TEXT,
  guest_phone   TEXT,
  course_id     UUID              NOT NULL REFERENCES academy_courses(id) ON DELETE RESTRICT,
  status        enrollment_status NOT NULL DEFAULT 'pending',
  amount_paid   NUMERIC(10,2)     NOT NULL DEFAULT 0,
  notes         TEXT,
  enrolled_at   TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  confirmed_at  TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  CONSTRAINT enrollment_has_student CHECK (user_id IS NOT NULL OR (guest_name IS NOT NULL AND guest_email IS NOT NULL))
);

-- ============================================================
-- TABLE: testimonials
-- ============================================================

CREATE TABLE testimonials (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  client_name     TEXT        NOT NULL,
  client_image_url TEXT,
  rating          SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review          TEXT        NOT NULL,
  service_label   TEXT        NOT NULL,   -- display label e.g. "Bridal Makeup"
  service_id      UUID        REFERENCES services(id) ON DELETE SET NULL,
  is_verified     BOOLEAN     NOT NULL DEFAULT FALSE,
  is_featured     BOOLEAN     NOT NULL DEFAULT FALSE,
  is_published    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: gallery
-- ============================================================

CREATE TABLE gallery (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url    TEXT        NOT NULL,
  thumbnail_url TEXT,
  category_id  UUID        REFERENCES categories(id) ON DELETE SET NULL,
  title        TEXT,
  description  TEXT,
  alt_text     TEXT,
  is_featured  BOOLEAN     NOT NULL DEFAULT FALSE,
  is_published BOOLEAN     NOT NULL DEFAULT TRUE,
  display_order INT        NOT NULL DEFAULT 0,
  uploaded_by  UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: contact_inquiries
-- ============================================================

CREATE TABLE contact_inquiries (
  id          UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT           NOT NULL,
  email       TEXT           NOT NULL,
  phone       TEXT,
  subject     TEXT           NOT NULL,
  message     TEXT           NOT NULL,
  status      inquiry_status NOT NULL DEFAULT 'new',
  replied_at  TIMESTAMPTZ,
  replied_by  UUID           REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES — Performance
-- ============================================================

-- Profiles
CREATE INDEX idx_profiles_role        ON profiles(role);
CREATE INDEX idx_profiles_email       ON profiles(email);

-- Services
CREATE INDEX idx_services_category    ON services(category_id);
CREATE INDEX idx_services_featured    ON services(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_services_active      ON services(is_active)   WHERE is_active = TRUE;
CREATE INDEX idx_services_slug        ON services(slug);

-- Bookings
CREATE INDEX idx_bookings_user        ON bookings(user_id);
CREATE INDEX idx_bookings_staff       ON bookings(staff_id);
CREATE INDEX idx_bookings_date        ON bookings(booking_date);
CREATE INDEX idx_bookings_status      ON bookings(status);
CREATE INDEX idx_bookings_date_staff  ON bookings(booking_date, staff_id) WHERE status NOT IN ('cancelled','no_show');
CREATE INDEX idx_bookings_reference   ON bookings(reference);

-- Availability
CREATE INDEX idx_availability_staff   ON availability_slots(staff_id);

-- Enrollments
CREATE INDEX idx_enrollments_user     ON enrollments(user_id);
CREATE INDEX idx_enrollments_course   ON enrollments(course_id);

-- Gallery
CREATE INDEX idx_gallery_category     ON gallery(category_id);
CREATE INDEX idx_gallery_featured     ON gallery(is_featured) WHERE is_featured = TRUE;

-- Testimonials
CREATE INDEX idx_testimonials_pub     ON testimonials(is_published) WHERE is_published = TRUE;
CREATE INDEX idx_testimonials_feat    ON testimonials(is_featured)  WHERE is_featured = TRUE;

-- Full-text search on services
CREATE INDEX idx_services_fts ON services USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- ============================================================
-- TRIGGERS — Auto-updated timestamps
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at   BEFORE UPDATE ON profiles          FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_staff_updated_at      BEFORE UPDATE ON staff              FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_services_updated_at   BEFORE UPDATE ON services           FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_bookings_updated_at   BEFORE UPDATE ON bookings           FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_courses_updated_at    BEFORE UPDATE ON academy_courses    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_enrollments_updated_at BEFORE UPDATE ON enrollments       FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- TRIGGER — Auto-create profile after auth.users insert
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'client'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- TRIGGER — Keep enrollment count in sync
-- ============================================================

CREATE OR REPLACE FUNCTION sync_enrollment_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE academy_courses
  SET current_students = (
    SELECT COUNT(*) FROM enrollments
    WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
      AND status IN ('confirmed', 'completed')
  )
  WHERE id = COALESCE(NEW.course_id, OLD.course_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_enrollment_count
  AFTER INSERT OR UPDATE OR DELETE ON enrollments
  FOR EACH ROW EXECUTE FUNCTION sync_enrollment_count();

-- ============================================================
-- FUNCTION — Prevent double booking (used in booking logic)
-- ============================================================

CREATE OR REPLACE FUNCTION check_booking_conflict(
  p_staff_id    UUID,
  p_date        DATE,
  p_start_time  TIME,
  p_end_time    TIME,
  p_exclude_id  UUID DEFAULT NULL
)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
-- Returns TRUE if there IS a conflict
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM bookings
    WHERE staff_id   = p_staff_id
      AND booking_date = p_date
      AND status NOT IN ('cancelled', 'no_show')
      AND id != COALESCE(p_exclude_id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND (start_time, end_time) OVERLAPS (p_start_time, p_end_time)
  );
END;
$$;

-- ============================================================
-- FUNCTION — Get available time slots for a date + staff + service
-- ============================================================

CREATE OR REPLACE FUNCTION get_available_slots(
  p_staff_id   UUID,
  p_date       DATE,
  p_duration   INT    -- service duration in minutes
)
RETURNS TABLE(slot_time TIME, is_available BOOLEAN)
LANGUAGE plpgsql AS $$
DECLARE
  v_day       day_of_week;
  v_start     TIME;
  v_end       TIME;
  v_slot      TIME;
  v_slot_end  TIME;
BEGIN
  -- Get day of week
  v_day := LOWER(TO_CHAR(p_date, 'day'))::day_of_week;

  -- Get staff working hours for that day
  SELECT start_time, end_time INTO v_start, v_end
  FROM availability_slots
  WHERE staff_id = p_staff_id AND day = v_day AND is_active = TRUE
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN; -- staff not working this day
  END IF;

  -- Check if date is blocked
  IF EXISTS (
    SELECT 1 FROM blocked_dates
    WHERE date = p_date AND (staff_id = p_staff_id OR staff_id IS NULL)
  ) THEN
    RETURN;
  END IF;

  -- Generate 30-min slots
  v_slot := v_start;
  WHILE v_slot + (p_duration || ' minutes')::INTERVAL <= v_end LOOP
    v_slot_end := v_slot + (p_duration || ' minutes')::INTERVAL;

    slot_time    := v_slot;
    is_available := NOT check_booking_conflict(p_staff_id, p_date, v_slot, v_slot_end::TIME);

    RETURN NEXT;
    v_slot := v_slot + INTERVAL '30 minutes';
  END LOOP;
END;
$$;
