-- =====================================================
-- Link Expert Answers to Clinical Profiles
-- Enables real clinician credentials in QAPage schema
-- for E-E-A-T compliance per GEO strategy
-- =====================================================

-- Add clinician_profile_id to community_answers
ALTER TABLE community_answers
ADD COLUMN IF NOT EXISTS clinician_profile_id UUID REFERENCES clinical_profiles(id) ON DELETE SET NULL;

-- Index for efficient joins
CREATE INDEX IF NOT EXISTS idx_community_answers_clinician
ON community_answers(clinician_profile_id)
WHERE clinician_profile_id IS NOT NULL;

-- Comment for documentation
COMMENT ON COLUMN community_answers.clinician_profile_id IS 'Links expert answers to clinical_profiles for E-E-A-T schema (real clinician name, credentials, jobTitle in QAPage JSON-LD)';
