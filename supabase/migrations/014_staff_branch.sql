-- Add branch column to staff
-- Each staff member belongs to a specific branch.

ALTER TABLE staff
  ADD COLUMN IF NOT EXISTS branch TEXT NOT NULL DEFAULT 'jadibuti'
    CHECK (branch IN ('jadibuti', 'machapokhari'));
