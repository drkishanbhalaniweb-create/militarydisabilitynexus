-- Migration 033: Lead Attribution & Qualification System
-- Adds first-touch, last-touch attribution, journey tracking, and qualification tracking
-- to contacts, form_submissions, and lead_magnet_captures tables.

-- ====================================================================
-- 1. CONTACTS TABLE
-- ====================================================================

ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS anonymous_journey_id UUID,
  ADD COLUMN IF NOT EXISTS first_touch_source TEXT,
  ADD COLUMN IF NOT EXISTS first_touch_medium TEXT,
  ADD COLUMN IF NOT EXISTS first_touch_campaign TEXT,
  ADD COLUMN IF NOT EXISTS first_touch_landing_page TEXT,
  ADD COLUMN IF NOT EXISTS first_touch_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_touch_source TEXT,
  ADD COLUMN IF NOT EXISTS last_touch_medium TEXT,
  ADD COLUMN IF NOT EXISTS last_touch_campaign TEXT,
  ADD COLUMN IF NOT EXISTS last_touch_landing_page TEXT,
  ADD COLUMN IF NOT EXISTS last_touch_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS referrer_category TEXT,
  ADD COLUMN IF NOT EXISTS device_class TEXT CHECK (device_class IS NULL OR device_class IN ('mobile', 'tablet', 'desktop')),
  ADD COLUMN IF NOT EXISTS qualification_status TEXT DEFAULT 'pending' CHECK (qualification_status IN ('pending', 'qualified', 'unqualified', 'nurture')),
  ADD COLUMN IF NOT EXISTS qualification_reason TEXT,
  ADD COLUMN IF NOT EXISTS qualified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS qualified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_contacts_created_first_source
  ON contacts(created_at DESC, first_touch_source);

CREATE INDEX IF NOT EXISTS idx_contacts_anonymous_journey
  ON contacts(anonymous_journey_id);

CREATE INDEX IF NOT EXISTS idx_contacts_qualification_status
  ON contacts(qualification_status);

-- ====================================================================
-- 2. FORM_SUBMISSIONS TABLE
-- ====================================================================

ALTER TABLE form_submissions
  ADD COLUMN IF NOT EXISTS anonymous_journey_id UUID,
  ADD COLUMN IF NOT EXISTS first_touch_source TEXT,
  ADD COLUMN IF NOT EXISTS first_touch_medium TEXT,
  ADD COLUMN IF NOT EXISTS first_touch_campaign TEXT,
  ADD COLUMN IF NOT EXISTS first_touch_landing_page TEXT,
  ADD COLUMN IF NOT EXISTS first_touch_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_touch_source TEXT,
  ADD COLUMN IF NOT EXISTS last_touch_medium TEXT,
  ADD COLUMN IF NOT EXISTS last_touch_campaign TEXT,
  ADD COLUMN IF NOT EXISTS last_touch_landing_page TEXT,
  ADD COLUMN IF NOT EXISTS last_touch_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS referrer_category TEXT,
  ADD COLUMN IF NOT EXISTS device_class TEXT CHECK (device_class IS NULL OR device_class IN ('mobile', 'tablet', 'desktop')),
  ADD COLUMN IF NOT EXISTS qualification_status TEXT DEFAULT 'pending' CHECK (qualification_status IN ('pending', 'qualified', 'unqualified', 'nurture')),
  ADD COLUMN IF NOT EXISTS qualification_reason TEXT,
  ADD COLUMN IF NOT EXISTS qualified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS qualified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_form_submissions_created_first_source
  ON form_submissions(created_at DESC, first_touch_source);

CREATE INDEX IF NOT EXISTS idx_form_submissions_anonymous_journey
  ON form_submissions(anonymous_journey_id);

CREATE INDEX IF NOT EXISTS idx_form_submissions_qualification_status
  ON form_submissions(qualification_status);

-- ====================================================================
-- 3. LEAD_MAGNET_CAPTURES TABLE
-- ====================================================================

ALTER TABLE lead_magnet_captures
  ADD COLUMN IF NOT EXISTS anonymous_journey_id UUID,
  ADD COLUMN IF NOT EXISTS first_touch_source TEXT,
  ADD COLUMN IF NOT EXISTS first_touch_medium TEXT,
  ADD COLUMN IF NOT EXISTS first_touch_campaign TEXT,
  ADD COLUMN IF NOT EXISTS first_touch_landing_page TEXT,
  ADD COLUMN IF NOT EXISTS first_touch_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_touch_source TEXT,
  ADD COLUMN IF NOT EXISTS last_touch_medium TEXT,
  ADD COLUMN IF NOT EXISTS last_touch_campaign TEXT,
  ADD COLUMN IF NOT EXISTS last_touch_landing_page TEXT,
  ADD COLUMN IF NOT EXISTS last_touch_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS referrer_category TEXT,
  ADD COLUMN IF NOT EXISTS device_class TEXT CHECK (device_class IS NULL OR device_class IN ('mobile', 'tablet', 'desktop')),
  ADD COLUMN IF NOT EXISTS qualification_status TEXT DEFAULT 'pending' CHECK (qualification_status IN ('pending', 'qualified', 'unqualified', 'nurture')),
  ADD COLUMN IF NOT EXISTS qualification_reason TEXT,
  ADD COLUMN IF NOT EXISTS qualified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS qualified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_lead_magnet_captures_created_first_source
  ON lead_magnet_captures(created_at DESC, first_touch_source);

CREATE INDEX IF NOT EXISTS idx_lead_magnet_captures_anonymous_journey
  ON lead_magnet_captures(anonymous_journey_id);

CREATE INDEX IF NOT EXISTS idx_lead_magnet_captures_qualification_status
  ON lead_magnet_captures(qualification_status);

-- Comments for documentation
COMMENT ON COLUMN contacts.anonymous_journey_id IS 'Privacy-preserving anonymous visitor session/journey UUID';
COMMENT ON COLUMN contacts.qualification_status IS 'Lead qualification pipeline status: pending, qualified, unqualified, nurture';
COMMENT ON COLUMN form_submissions.anonymous_journey_id IS 'Privacy-preserving anonymous visitor session/journey UUID';
COMMENT ON COLUMN form_submissions.qualification_status IS 'Lead qualification pipeline status: pending, qualified, unqualified, nurture';
COMMENT ON COLUMN lead_magnet_captures.anonymous_journey_id IS 'Privacy-preserving anonymous visitor session/journey UUID';
COMMENT ON COLUMN lead_magnet_captures.qualification_status IS 'Lead qualification pipeline status: pending, qualified, unqualified, nurture';
