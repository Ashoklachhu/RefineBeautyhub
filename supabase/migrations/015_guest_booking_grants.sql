-- ============================================================
-- Migration: 015_guest_booking_grants.sql
-- Fix guest (anonymous) booking permissions
-- ============================================================

-- 1. Grant INSERT/SELECT on bookings to the anon role.
--    Supabase only grants SELECT to anon by default; INSERT is missing.
--    RLS policies already restrict *what* can be inserted — this just
--    allows the attempt to reach the policy check.
GRANT INSERT, SELECT ON TABLE public.bookings TO anon;

-- Ensure sequences are usable by anon (needed for default values)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- 2. Make check_booking_conflict SECURITY DEFINER so it can read
--    bookings even when called by the anon role via RPC.
--    Without this the function sees 0 rows (RLS filters everything)
--    and always reports "no conflict" for anonymous callers.
CREATE OR REPLACE FUNCTION check_booking_conflict(
  p_staff_id    UUID,
  p_date        DATE,
  p_start_time  TIME,
  p_end_time    TIME,
  p_exclude_id  UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER          -- ← run as owner, bypasses RLS for this read
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM bookings
    WHERE staff_id      = p_staff_id
      AND booking_date  = p_date
      AND status NOT IN ('cancelled', 'no_show')
      AND id           != COALESCE(p_exclude_id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND (start_time, end_time) OVERLAPS (p_start_time, p_end_time)
  );
END;
$$;
