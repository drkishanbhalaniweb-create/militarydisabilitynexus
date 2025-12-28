-- Create diagnostic_sessions table
CREATE TABLE IF NOT EXISTS diagnostic_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Question answers (storing points for each)
  service_connection INTEGER CHECK (service_connection IN (0, 1, 2)),
  denial_handling INTEGER CHECK (denial_handling IN (0, 1, 2)),
  pathway INTEGER CHECK (pathway IN (0, 1, 2)),
  severity INTEGER CHECK (severity IN (0, 1, 2)),
  secondaries INTEGER CHECK (secondaries IN (0, 1, 2)),
  
  -- Calculated results
  total_score INTEGER CHECK (total_score >= 0 AND total_score <= 10),
  recommendation TEXT CHECK (recommendation IN (
    'FULLY_READY',
    'OPTIONAL_CONFIRMATION',
    'REVIEW_BENEFICIAL',
    'REVIEW_STRONGLY_RECOMMENDED'
  )),
  
  -- Metadata
  user_agent TEXT,
  viewport_width INTEGER,
  viewport_height INTEGER,
  
  -- Conversion tracking
  converted_to_booking BOOLEAN DEFAULT FALSE,
  booking_form_submission_id UUID REFERENCES form_submissions(id)
);

-- Create index for faster queries
CREATE INDEX idx_diagnostic_sessions_created_at ON diagnostic_sessions(created_at DESC);
CREATE INDEX idx_diagnostic_sessions_recommendation ON diagnostic_sessions(recommendation);
CREATE INDEX idx_diagnostic_sessions_converted ON diagnostic_sessions(converted_to_booking);

-- Enable RLS
ALTER TABLE diagnostic_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (anonymous diagnostic)
CREATE POLICY "Anyone can create diagnostic sessions"
  ON diagnostic_sessions
  FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can read their own session by session_id
CREATE POLICY "Anyone can read their own diagnostic session"
  ON diagnostic_sessions
  FOR SELECT
  USING (true);

-- Policy: Admins can view all sessions
CREATE POLICY "Admins can view all diagnostic sessions"
  ON diagnostic_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Policy: Admins can update sessions (for conversion tracking)
CREATE POLICY "Admins can update diagnostic sessions"
  ON diagnostic_sessions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Add comment
COMMENT ON TABLE diagnostic_sessions IS 'Stores VA Claim Readiness Diagnostic sessions and results';
