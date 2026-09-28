-- Migration: 057_video_testimonials.sql
-- Description: Extends testimonials table with video metadata, transcripts, key moments, and SEO slugs.

ALTER TABLE public.testimonials
    ADD COLUMN IF NOT EXISTS slug TEXT,
    ADD COLUMN IF NOT EXISTS video_url TEXT,
    ADD COLUMN IF NOT EXISTS video_provider TEXT DEFAULT 'html5',
    ADD COLUMN IF NOT EXISTS video_thumbnail_url TEXT,
    ADD COLUMN IF NOT EXISTS video_duration INTEGER,
    ADD COLUMN IF NOT EXISTS video_aspect_ratio TEXT DEFAULT '4:5',
    ADD COLUMN IF NOT EXISTS video_transcript TEXT,
    ADD COLUMN IF NOT EXISTS video_key_moments JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS clinician_notes TEXT,
    ADD COLUMN IF NOT EXISTS claim_outcome TEXT,
    ADD COLUMN IF NOT EXISTS condition_tag TEXT,
    ADD COLUMN IF NOT EXISTS service_slug TEXT,
    ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Unique partial index for spoke URLs (prevents thin text testimonials from claiming slugs)
CREATE UNIQUE INDEX IF NOT EXISTS idx_testimonials_video_slug
    ON public.testimonials(slug)
    WHERE slug IS NOT NULL AND slug <> '';

-- Fast index for video queries (e.g. video filter, sitemap)
CREATE INDEX IF NOT EXISTS idx_testimonials_has_video
    ON public.testimonials(created_at DESC)
    WHERE video_url IS NOT NULL;

COMMENT ON COLUMN public.testimonials.slug IS 'SEO-friendly slug for dedicated spoke video page at /testimonials/[slug]';
COMMENT ON COLUMN public.testimonials.video_aspect_ratio IS 'Aspect ratio: 4:5 (squarish vertical), 1:1 (square), 3:4 (portrait), 9:16 (reel), 16:9 (landscape)';
COMMENT ON COLUMN public.testimonials.video_key_moments IS 'Array of Google Key Moments: [{ "name": "...", "startOffset": 15, "endOffset": 45 }]';
COMMENT ON COLUMN public.testimonials.clinician_notes IS 'Dr. Kishan Bhalani clinical and medical commentary for E-E-A-T';

-- Storage bucket for custom video thumbnails/posters
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'testimonials',
    'testimonials',
    true,
    104857600,
    ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg', 'video/x-m4v', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO UPDATE
    SET public = EXCLUDED.public,
        file_size_limit = EXCLUDED.file_size_limit,
        allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS policies for testimonials bucket
DROP POLICY IF EXISTS "testimonials_public_select" ON storage.objects;
DROP POLICY IF EXISTS "testimonials_auth_insert" ON storage.objects;
DROP POLICY IF EXISTS "testimonials_auth_update" ON storage.objects;
DROP POLICY IF EXISTS "testimonials_auth_delete" ON storage.objects;

CREATE POLICY "testimonials_public_select"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'testimonials');

CREATE POLICY "testimonials_auth_insert"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'testimonials' AND auth.role() = 'authenticated');

CREATE POLICY "testimonials_auth_update"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'testimonials' AND auth.role() = 'authenticated');

CREATE POLICY "testimonials_auth_delete"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'testimonials' AND auth.role() = 'authenticated');

