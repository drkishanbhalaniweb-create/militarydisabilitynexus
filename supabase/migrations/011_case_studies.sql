-- Case Studies Feature Migration
-- Creates table, indexes, RLS policies, and functions for case studies

-- ============================================
-- CASE STUDIES TABLE
-- ============================================
CREATE TABLE case_studies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    client_name TEXT,
    excerpt TEXT NOT NULL,
    content_html TEXT NOT NULL,
    challenge TEXT,
    solution TEXT,
    results TEXT,
    featured_image TEXT,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    is_published BOOLEAN DEFAULT true,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX idx_case_studies_slug ON case_studies(slug);
CREATE INDEX idx_case_studies_published ON case_studies(is_published, published_at DESC);
CREATE INDEX idx_case_studies_created ON case_studies(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on case_studies table
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;

-- Public read access for published case studies only
CREATE POLICY "Published case studies are viewable by everyone"
    ON case_studies FOR SELECT
    USING (is_published = true);

-- Admin full access (authenticated users with admin role)
-- Note: This assumes you have admin users set up with proper authentication
-- Adjust the policy based on your actual admin authentication setup

-- Allow authenticated users to view all case studies (for admin panel)
CREATE POLICY "Authenticated users can view all case studies"
    ON case_studies FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to insert case studies
CREATE POLICY "Authenticated users can insert case studies"
    ON case_studies FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow authenticated users to update case studies
CREATE POLICY "Authenticated users can update case studies"
    ON case_studies FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users to delete case studies
CREATE POLICY "Authenticated users can delete case studies"
    ON case_studies FOR DELETE
    TO authenticated
    USING (true);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Increment case study views
CREATE OR REPLACE FUNCTION increment_case_study_views(study_slug TEXT)
RETURNS void AS $$
BEGIN
    UPDATE case_studies
    SET views = views + 1
    WHERE slug = study_slug AND is_published = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Create trigger for updated_at (reuse existing function)
CREATE TRIGGER update_case_studies_updated_at
    BEFORE UPDATE ON case_studies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STORAGE BUCKET SETUP
-- ============================================
-- Note: Storage buckets must be created through Supabase Dashboard or API
-- This is a reference for the required configuration:
--
-- Bucket name: case-study-images
-- Public: true (for public read access)
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/webp
--
-- Storage Policies to create:
-- 1. Public read access:
--    CREATE POLICY "Public read access for case study images"
--    ON storage.objects FOR SELECT
--    USING (bucket_id = 'case-study-images');
--
-- 2. Authenticated upload access:
--    CREATE POLICY "Authenticated users can upload case study images"
--    ON storage.objects FOR INSERT
--    TO authenticated
--    WITH CHECK (bucket_id = 'case-study-images');
--
-- 3. Authenticated update access:
--    CREATE POLICY "Authenticated users can update case study images"
--    ON storage.objects FOR UPDATE
--    TO authenticated
--    USING (bucket_id = 'case-study-images');
--
-- 4. Authenticated delete access:
--    CREATE POLICY "Authenticated users can delete case study images"
--    ON storage.objects FOR DELETE
--    TO authenticated
--    USING (bucket_id = 'case-study-images');

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE case_studies IS 'Case studies showcasing client work and success stories';
COMMENT ON COLUMN case_studies.slug IS 'URL-friendly identifier derived from title';
COMMENT ON COLUMN case_studies.client_name IS 'Optional client or project name';
COMMENT ON COLUMN case_studies.excerpt IS 'Short summary for listing pages';
COMMENT ON COLUMN case_studies.content_html IS 'Full HTML content of the case study';
COMMENT ON COLUMN case_studies.challenge IS 'Description of the problem or challenge faced';
COMMENT ON COLUMN case_studies.solution IS 'Description of the solution provided';
COMMENT ON COLUMN case_studies.results IS 'Outcomes and measurable results';
COMMENT ON COLUMN case_studies.featured_image IS 'URL to the featured image in storage';
COMMENT ON COLUMN case_studies.is_published IS 'Publication status (true = published, false = draft)';
COMMENT ON COLUMN case_studies.views IS 'View counter for analytics';
