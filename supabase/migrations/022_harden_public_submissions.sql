-- Harden public submissions by routing inserts through edge functions
-- and tracking rate-limited submission attempts.

ALTER TABLE form_submissions DROP CONSTRAINT IF EXISTS form_submissions_form_type_check;

ALTER TABLE form_submissions
ADD CONSTRAINT form_submissions_form_type_check
CHECK (
  form_type IN (
    'quick_intake',
    'aid_attendance',
    'unsure',
    'general',
    'claim_readiness_review',
    'nexus_letter',
    'dbq',
    '1151_claim'
  )
);

CREATE TABLE IF NOT EXISTS submission_rate_limits (
  id BIGSERIAL PRIMARY KEY,
  route TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submission_rate_limits_lookup
  ON submission_rate_limits(route, ip_hash, created_at DESC);

ALTER TABLE submission_rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage submission rate limits" ON submission_rate_limits;
CREATE POLICY "Service role can manage submission rate limits"
  ON submission_rate_limits FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public contact submissions" ON contacts;
DROP POLICY IF EXISTS "Anyone can submit contact form" ON contacts;
DROP POLICY IF EXISTS "Allow public form submissions" ON form_submissions;
DROP POLICY IF EXISTS "Anyone can submit forms" ON form_submissions;

CREATE POLICY "Service role can insert contacts"
  ON contacts FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can insert form submissions"
  ON form_submissions FOR INSERT
  TO service_role
  WITH CHECK (true);

COMMENT ON TABLE submission_rate_limits IS 'Tracks public submission attempts for edge-function rate limiting';
COMMENT ON CONSTRAINT form_submissions_form_type_check ON form_submissions IS 'Allowed public form types including service-specific submissions';
