-- ============================================
-- FIX BLOG UPLOAD AND ADMIN ACCESS ISSUES
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Ensure your admin account exists and is super_admin
-- IMPORTANT: Replace with YOUR actual user ID from auth.users
INSERT INTO admin_users (id, email, full_name, role, is_active)
VALUES (
  '934093a8-ce71-4080-8a57-05da1489ade1',  -- YOUR USER ID HERE
  'dr.kishanbhalani.web@gmail.com',                 -- YOUR EMAIL HERE
  'Kishan Bhalani',                              -- YOUR NAME HERE
  'super_admin',
  true
)
ON CONFLICT (id) DO UPDATE 
SET role = 'super_admin', 
    is_active = true,
    updated_at = now();

-- 2. Fix admin_users RLS policies
-- Drop conflicting policies
DROP POLICY IF EXISTS "Admins can view all admin users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can create admin users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can update admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can update their own profile" ON admin_users;
DROP POLICY IF EXISTS "admin_users_select" ON admin_users;
DROP POLICY IF EXISTS "admin_users_insert" ON admin_users;
DROP POLICY IF EXISTS "admin_users_update" ON admin_users;
DROP POLICY IF EXISTS "admin_users_delete" ON admin_users;

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create simple, working policies
CREATE POLICY "admin_users_select" ON admin_users
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "admin_users_insert" ON admin_users
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() 
      AND role = 'super_admin' 
      AND is_active = true
    )
  );

CREATE POLICY "admin_users_update" ON admin_users
  FOR UPDATE TO authenticated
  USING (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() 
      AND role = 'super_admin' 
      AND is_active = true
    )
  );

CREATE POLICY "admin_users_delete" ON admin_users
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() 
      AND role = 'super_admin' 
      AND is_active = true
    )
  );

-- 3. Ensure blog bucket exists and is public
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

-- 4. Fix storage policies for blog bucket
-- Drop existing policies
DROP POLICY IF EXISTS "blog_select" ON storage.objects;
DROP POLICY IF EXISTS "blog_insert" ON storage.objects;
DROP POLICY IF EXISTS "blog_update" ON storage.objects;
DROP POLICY IF EXISTS "blog_delete" ON storage.objects;
DROP POLICY IF EXISTS "blog_upload" ON storage.objects;
DROP POLICY IF EXISTS "blog_view" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete blog images" ON storage.objects;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for blog bucket
CREATE POLICY "blog_select" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'blog');

CREATE POLICY "blog_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'blog');

CREATE POLICY "blog_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'blog')
  WITH CHECK (bucket_id = 'blog');

CREATE POLICY "blog_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'blog');

-- 5. Verify the setup
SELECT 'Admin User Check:' as check_type, email, role, is_active 
FROM admin_users 
WHERE id = '934093a8-ce71-4080-8a57-05da1489ade1'
UNION ALL
SELECT 'Blog Bucket Check:', id, public::text, (file_size_limit/1024/1024)::text || 'MB'
FROM storage.buckets 
WHERE id = 'blog';

-- ============================================
-- DONE! Now:
-- 1. Refresh your browser
-- 2. Try uploading a blog image
-- 3. Try creating a blog post
-- ============================================
