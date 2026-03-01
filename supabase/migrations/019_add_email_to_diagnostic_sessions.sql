-- Add first_name and email columns to diagnostic_sessions table
ALTER TABLE diagnostic_sessions ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE diagnostic_sessions ADD COLUMN IF NOT EXISTS email TEXT;

-- Update the comment to reflect the new columns
COMMENT ON TABLE diagnostic_sessions IS 'Stores VA Claim Readiness Diagnostic sessions and results, including optionally captured lead info (first_name, email).';
