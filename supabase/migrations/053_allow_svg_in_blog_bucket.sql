-- Migration: Allow SVG MIME type in the blog storage bucket
-- Add 'image/svg+xml' to the allowed_mime_types array for the 'blog' bucket

UPDATE storage.buckets
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
WHERE id = 'blog';
