-- ============================================
-- SIMPLE SETUP - No verification queries, just setup
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- 1. Make 'blog' bucket public
UPDATE storage.buckets SET public = true WHERE id = 'blog';

-- 2. Drop any existing blog policies
DROP POLICY IF EXISTS "blog_upload" ON storage.objects;
DROP POLICY IF EXISTS "blog_view" ON storage.objects;
DROP POLICY IF EXISTS "blog_update" ON storage.objects;
DROP POLICY IF EXISTS "blog_delete" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete blog images" ON storage.objects;

-- 3. Create simple storage policies
CREATE POLICY "blog_upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'blog');
CREATE POLICY "blog_view" ON storage.objects FOR SELECT TO public USING (bucket_id = 'blog');
CREATE POLICY "blog_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'blog');
CREATE POLICY "blog_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'blog');

-- 4. Add blog_posts columns
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS featured_image TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS content_images JSONB DEFAULT '[]'::jsonb;

-- 5. Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'editor')),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- 6. Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 7. Drop existing admin policies
DROP POLICY IF EXISTS "admin_users_select" ON admin_users;
DROP POLICY IF EXISTS "admin_users_insert" ON admin_users;
DROP POLICY IF EXISTS "admin_users_update" ON admin_users;

-- 8. Create permissive admin policies
CREATE POLICY "admin_users_select" ON admin_users FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_users_insert" ON admin_users FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "admin_users_update" ON admin_users FOR UPDATE TO authenticated USING (true);

-- 9. Make yourself super admin
-- CHANGE THIS EMAIL TO YOUR EMAIL!
INSERT INTO admin_users (id, email, full_name, role, is_active)
SELECT id, email, 'Your Name', 'super_admin', true
FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (id) DO UPDATE SET role = 'super_admin', is_active = true;

-- DONE! Now refresh your browser and try uploading an image.
