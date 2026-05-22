-- Add branch column to bookings
-- Tracks which salon branch the appointment is at.

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS branch TEXT NOT NULL DEFAULT 'jadibuti'
    CHECK (branch IN ('jadibuti', 'machapokhari'));
