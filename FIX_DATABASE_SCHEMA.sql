-- ============================================
-- FIX DATABASE SCHEMA FOR BLOG POSTS
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add missing columns to blog_posts table
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS featured_image TEXT,
ADD COLUMN IF NOT EXISTS featured_image_path TEXT;

-- 2. Create the blog storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog',
  'blog',
  true,
  5242880,  -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- 3. Create storage policies for the blog bucket
-- First drop any existing policies
DROP POLICY IF EXISTS "blog_public_select" ON storage.objects;
DROP POLICY IF EXISTS "blog_insert_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "blog_update_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "blog_delete_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "blog_select" ON storage.objects;
DROP POLICY IF EXISTS "blog_insert" ON storage.objects;
DROP POLICY IF EXISTS "blog_update" ON storage.objects;
DROP POLICY IF EXISTS "blog_delete" ON storage.objects;

-- Public read access
CREATE POLICY "blog_public_select" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'blog');

-- Authenticated users can upload
CREATE POLICY "blog_insert_authenticated" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'blog');

-- Authenticated users can update
CREATE POLICY "blog_update_authenticated" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'blog')
  WITH CHECK (bucket_id = 'blog');

-- Authenticated users can delete
CREATE POLICY "blog_delete_authenticated" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'blog');

-- 4. Verify the changes
SELECT 'Blog bucket created:' as status, id, public FROM storage.buckets WHERE id = 'blog';

SELECT 'Blog posts columns:' as status, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'blog_posts' 
AND column_name IN ('featured_image', 'featured_image_path');

-- ============================================
-- DONE! Now refresh your browser and try again.
-- ============================================
