-- Add phone column to lead_magnet_captures and diagnostic_sessions tables

ALTER TABLE lead_magnet_captures ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE diagnostic_sessions ADD COLUMN IF NOT EXISTS phone TEXT;

CREATE INDEX IF NOT EXISTS idx_lead_magnet_captures_phone
  ON lead_magnet_captures(phone);

COMMENT ON COLUMN lead_magnet_captures.phone IS 'Optional phone number captured for follow-up regarding the requested lead magnet.';
COMMENT ON COLUMN diagnostic_sessions.phone IS 'Optional phone number captured for follow-up regarding the diagnostic assessment.';
