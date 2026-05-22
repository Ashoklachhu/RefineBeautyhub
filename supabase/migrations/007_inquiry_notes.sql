-- ──────────────────────────────────────────────────────────────
-- 007 — Inquiry Notes (mini-CRM follow-up timeline)
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS inquiry_notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id  UUID NOT NULL REFERENCES contact_inquiries(id) ON DELETE CASCADE,
  note        TEXT NOT NULL,
  note_type   TEXT NOT NULL DEFAULT 'internal'
                CHECK (note_type IN ('internal','reply','call','whatsapp','email')),
  created_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS inquiry_notes_inquiry_idx ON inquiry_notes(inquiry_id);
CREATE INDEX IF NOT EXISTS inquiry_notes_created_idx ON inquiry_notes(created_at DESC);

-- Add priority to contact_inquiries if not present
ALTER TABLE contact_inquiries
  ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('low','normal','high','urgent'));

ALTER TABLE contact_inquiries
  ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- RLS
ALTER TABLE inquiry_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_inquiry_notes"
  ON inquiry_notes FOR ALL
  USING     (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
