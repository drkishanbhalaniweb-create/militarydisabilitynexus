-- Clinical Profiles Feature Migration
-- Creates clinical_profiles table, adds FK columns to blog_posts & case_studies
-- Backward compatible: all new columns are nullable

-- ============================================
-- CLINICAL PROFILES TABLE
-- ============================================
CREATE TABLE clinical_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    credentials TEXT,
    photo_url TEXT,
    bio TEXT NOT NULL,
    linkedin_url TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ADD FK COLUMNS TO EXISTING TABLES
-- ============================================

-- blog_posts: author + reviewer
ALTER TABLE blog_posts
    ADD COLUMN author_profile_id UUID REFERENCES clinical_profiles(id) ON DELETE SET NULL,
    ADD COLUMN reviewer_profile_id UUID REFERENCES clinical_profiles(id) ON DELETE SET NULL;

-- case_studies: author + reviewer
ALTER TABLE case_studies
    ADD COLUMN author_profile_id UUID REFERENCES clinical_profiles(id) ON DELETE SET NULL,
    ADD COLUMN reviewer_profile_id UUID REFERENCES clinical_profiles(id) ON DELETE SET NULL;

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_clinical_profiles_slug ON clinical_profiles(slug);
CREATE INDEX idx_clinical_profiles_active ON clinical_profiles(is_active);
CREATE INDEX idx_blog_author_profile ON blog_posts(author_profile_id);
CREATE INDEX idx_blog_reviewer_profile ON blog_posts(reviewer_profile_id);
CREATE INDEX idx_case_study_author_profile ON case_studies(author_profile_id);
CREATE INDEX idx_case_study_reviewer_profile ON case_studies(reviewer_profile_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE clinical_profiles ENABLE ROW LEVEL SECURITY;

-- Public read access for active profiles
CREATE POLICY "Active clinical profiles are viewable by everyone"
    ON clinical_profiles FOR SELECT
    USING (is_active = true);

-- Authenticated users can view all profiles (for admin panel)
CREATE POLICY "Authenticated users can view all clinical profiles"
    ON clinical_profiles FOR SELECT
    TO authenticated
    USING (true);

-- Authenticated users can insert
CREATE POLICY "Authenticated users can insert clinical profiles"
    ON clinical_profiles FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Authenticated users can update
CREATE POLICY "Authenticated users can update clinical profiles"
    ON clinical_profiles FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Authenticated users can delete
CREATE POLICY "Authenticated users can delete clinical profiles"
    ON clinical_profiles FOR DELETE
    TO authenticated
    USING (true);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER update_clinical_profiles_updated_at
    BEFORE UPDATE ON clinical_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE clinical_profiles IS 'Clinical team profiles used as E-E-A-T trust signals on blogs and case studies';
COMMENT ON COLUMN clinical_profiles.slug IS 'URL-friendly identifier for /clinician/[slug] pages';
COMMENT ON COLUMN clinical_profiles.full_name IS 'Display name of the clinician';
COMMENT ON COLUMN clinical_profiles.credentials IS 'Professional credentials shown after name, e.g. MD, FACP';
COMMENT ON COLUMN clinical_profiles.bio IS 'Full bio text, 100-1000 words';
COMMENT ON COLUMN clinical_profiles.linkedin_url IS 'LinkedIn profile URL for trust verification';
COMMENT ON COLUMN clinical_profiles.is_active IS 'Soft-delete flag: inactive profiles hidden from public and dropdowns';
