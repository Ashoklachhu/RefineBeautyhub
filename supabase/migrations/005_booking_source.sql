-- ============================================================
-- Migration 005 — Booking & Enrollment Source Tracking
-- Tracks how each booking/enrollment was created
-- ============================================================

-- Add source column to bookings
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'online'
CHECK (source IN ('online', 'walk_in', 'phone', 'admin'));

-- Add source column to enrollments
ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'online'
CHECK (source IN ('online', 'walk_in', 'phone', 'admin'));

-- Add index for filtering by source
CREATE INDEX IF NOT EXISTS bookings_source_idx    ON bookings(source);
CREATE INDEX IF NOT EXISTS enrollments_source_idx ON enrollments(source);

-- Comment
COMMENT ON COLUMN bookings.source    IS 'How the booking was created: online (website), walk_in, phone, admin (manual)';
COMMENT ON COLUMN enrollments.source IS 'How the enrollment was created: online (website), walk_in, phone, admin (manual)';
