-- Migration: 058_video_storage_bucket.sql
-- Description: Configures the testimonials (and testimonial-videos) storage buckets to support direct MP4, WebM, and QuickTime video uploads up to 100MB with public read access.

-- Insert or update testimonials and testimonial-videos buckets with 100MB limit and video + image MIME types
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    (
        'testimonials',
        'testimonials',
        true,
        104857600, -- 100MB in bytes (100 * 1024 * 1024)
        ARRAY[
            'video/mp4',
            'video/webm',
            'video/quicktime',
            'video/ogg',
            'video/x-m4v',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'image/avif'
        ]
    ),
    (
        'testimonial-videos',
        'testimonial-videos',
        true,
        104857600,
        ARRAY[
            'video/mp4',
            'video/webm',
            'video/quicktime',
            'video/ogg',
            'video/x-m4v',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'image/avif'
        ]
    )
ON CONFLICT (id) DO UPDATE
    SET public = true,
        file_size_limit = 104857600,
        allowed_mime_types = ARRAY[
            'video/mp4',
            'video/webm',
            'video/quicktime',
            'video/ogg',
            'video/x-m4v',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'image/avif'
        ];

-- Set up storage RLS policies for testimonials and testimonial-videos buckets
DROP POLICY IF EXISTS "testimonials_public_select" ON storage.objects;
DROP POLICY IF EXISTS "testimonials_auth_insert" ON storage.objects;
DROP POLICY IF EXISTS "testimonials_auth_update" ON storage.objects;
DROP POLICY IF EXISTS "testimonials_auth_delete" ON storage.objects;

-- Allow public read access to all testimonial videos and poster thumbnails
CREATE POLICY "testimonials_public_select"
    ON storage.objects FOR SELECT
    USING (bucket_id IN ('testimonials', 'testimonial-videos'));

-- Allow authenticated staff/admin users to upload testimonial media
CREATE POLICY "testimonials_auth_insert"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id IN ('testimonials', 'testimonial-videos') AND auth.role() = 'authenticated');

-- Allow authenticated staff/admin users to update testimonial media
CREATE POLICY "testimonials_auth_update"
    ON storage.objects FOR UPDATE
    USING (bucket_id IN ('testimonials', 'testimonial-videos') AND auth.role() = 'authenticated')
    WITH CHECK (bucket_id IN ('testimonials', 'testimonial-videos') AND auth.role() = 'authenticated');

-- Allow authenticated staff/admin users to delete testimonial media
CREATE POLICY "testimonials_auth_delete"
    ON storage.objects FOR DELETE
    USING (bucket_id IN ('testimonials', 'testimonial-videos') AND auth.role() = 'authenticated');

-- Update default video provider on testimonials table to direct HTML5
ALTER TABLE public.testimonials
    ALTER COLUMN video_provider SET DEFAULT 'html5';

-- Migrate existing testimonials to html5 provider where appropriate
UPDATE public.testimonials
SET video_provider = 'html5'
WHERE video_provider IS NULL OR video_provider = 'youtube';
