-- ============================================================
-- Migration 023: Fix submission INSERT policies
-- ============================================================
-- 
-- CONTEXT:
-- Migration 022 locked contacts & form_submissions to service_role-only 
-- inserts, assuming Supabase Edge Functions would handle submissions.
-- Those Edge Functions were never deployed. The project now uses 
-- Next.js API routes (/api/submit-contact, /api/submit-form) which 
-- use the service_role key server-side.
--
-- This migration keeps the service_role INSERT policies (used by API routes)
-- and adds database-level safety constraints as a defense-in-depth layer.
-- ============================================================

-- =====================
-- 1. CONTACTS TABLE
-- =====================

-- Keep the existing service_role INSERT policy (migration 022).
-- No anon INSERT policy needed — our API routes use the service_role key.

-- Add field-length constraints to block oversized payloads even if 
-- something bypasses application validation.
ALTER TABLE contacts
  ADD CONSTRAINT contacts_name_length CHECK (char_length(name) BETWEEN 2 AND 120),
  ADD CONSTRAINT contacts_email_length CHECK (char_length(email) BETWEEN 5 AND 254),
  ADD CONSTRAINT contacts_message_length CHECK (char_length(message) BETWEEN 10 AND 5000),
  ADD CONSTRAINT contacts_subject_length CHECK (char_length(subject) <= 200),
  ADD CONSTRAINT contacts_phone_length CHECK (phone IS NULL OR char_length(phone) BETWEEN 7 AND 32),
  ADD CONSTRAINT contacts_service_interest_length CHECK (service_interest IS NULL OR char_length(service_interest) <= 255);

-- Ensure anon users CANNOT read submitted contacts (PHI protection).
-- This should already be the case, but let's be explicit.
DROP POLICY IF EXISTS "Anon cannot read contacts" ON contacts;
-- (No SELECT policy for anon = no access. RLS is already enabled.)

-- Service role full access (admin dashboards, API routes)
DROP POLICY IF EXISTS "Service role full access to contacts" ON contacts;
CREATE POLICY "Service role full access to contacts"
  ON contacts FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- =====================
-- 2. FORM SUBMISSIONS TABLE
-- =====================

-- Same approach: keep service_role-only INSERT from migration 022.

-- Remove the overly permissive SELECT policy from migration 002 if it still exists
DROP POLICY IF EXISTS "Users can view their own submissions" ON form_submissions;

-- Add field-length constraints
ALTER TABLE form_submissions
  ADD CONSTRAINT form_submissions_name_length CHECK (char_length(full_name) BETWEEN 2 AND 120),
  ADD CONSTRAINT form_submissions_email_length CHECK (char_length(email) BETWEEN 5 AND 254),
  ADD CONSTRAINT form_submissions_phone_length CHECK (phone IS NULL OR char_length(phone) BETWEEN 7 AND 32);

-- Service role full access
DROP POLICY IF EXISTS "Service role full access to form submissions" ON form_submissions;
CREATE POLICY "Service role full access to form submissions"
  ON form_submissions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- =====================
-- 3. SUBMISSION RATE LIMITS TABLE
-- =====================

-- Ensure the table exists (idempotent, from migration 022)
CREATE TABLE IF NOT EXISTS submission_rate_limits (
  id BIGSERIAL PRIMARY KEY,
  route TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submission_rate_limits_lookup
  ON submission_rate_limits(route, ip_hash, created_at DESC);

ALTER TABLE submission_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service_role can read/write rate limit records
DROP POLICY IF EXISTS "Service role can manage submission rate limits" ON submission_rate_limits;
CREATE POLICY "Service role can manage submission rate limits"
  ON submission_rate_limits FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Auto-cleanup: delete rate limit records older than 24 hours
-- (Run manually or via pg_cron if available)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM submission_rate_limits
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================
-- 4. FILE UPLOADS - ensure policies are correct
-- =====================

-- file_uploads should also be service_role only for INSERT
-- (the API route or authenticated admin handles uploads)
DROP POLICY IF EXISTS "Anyone can upload files with contact" ON file_uploads;
DROP POLICY IF EXISTS "Anyone can upload files with form submission" ON file_uploads;

DROP POLICY IF EXISTS "Service role full access to file uploads" ON file_uploads;
CREATE POLICY "Service role full access to file uploads"
  ON file_uploads FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ============================================================
-- SUMMARY OF SECURITY MODEL:
-- 
-- anon key (browser) CAN:
--   ✅ SELECT services, blog_posts, testimonials (public content)
--   ✅ POST to /api/submit-contact, /api/submit-form (Next.js API routes)
--
-- anon key (browser) CANNOT:
--   ❌ INSERT into contacts, form_submissions, file_uploads (blocked by RLS)
--   ❌ SELECT from contacts, form_submissions, file_uploads (blocked by RLS)
--   ❌ UPDATE/DELETE any sensitive table (blocked by RLS)
--
-- service_role key (server-side API routes only) CAN:
--   ✅ Full CRUD on all tables (bypasses RLS)
--   ✅ Rate limit tracking
--
-- Database constraints enforce:
--   ✅ Field length limits (name, email, message, phone, etc.)
--   ✅ Valid form_type values (CHECK constraint from migration 022)
--   ✅ Valid status values (CHECK constraint from migration 001)
-- ============================================================
