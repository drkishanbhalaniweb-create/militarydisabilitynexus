-- ============================================
-- EMERGENCY FIX - Run this if you're getting 500/400 errors
-- ============================================

-- Step 1: Make sure 'blog' bucket is public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'blog';

-- Step 2: Remove ALL existing policies on storage.objects for 'blog' bucket
-- This clears any conflicting policies
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname LIKE '%blog%'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', policy_record.policyname);
    END LOOP;
END $$;

-- Step 3: Create simple, permissive policies for 'blog' bucket
CREATE POLICY "blog_upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog');

CREATE POLICY "blog_view"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'blog');

CREATE POLICY "blog_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'blog');

CREATE POLICY "blog_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'blog');

-- Step 4: Add columns to blog_posts if they don't exist
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS featured_image TEXT;

ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS content_images JSONB DEFAULT '[]'::jsonb;

-- Step 5: Create admin_users table if it doesn't exist
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

-- Step 6: Enable RLS on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Step 7: Drop existing admin_users policies
DROP POLICY IF EXISTS "Admins can view all admin users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can create admin users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can update admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can update their own profile" ON admin_users;

-- Step 8: Create SIMPLE admin_users policies (very permissive for now)
-- We'll make them more restrictive later
CREATE POLICY "admin_users_select"
ON admin_users FOR SELECT
TO authenticated
USING (true); -- Allow all authenticated users to read

CREATE POLICY "admin_users_insert"
ON admin_users FOR INSERT
TO authenticated
WITH CHECK (true); -- Allow all authenticated users to insert (for now)

CREATE POLICY "admin_users_update"
ON admin_users FOR UPDATE
TO authenticated
USING (true); -- Allow all authenticated users to update (for now)

-- Step 9: Insert yourself as super admin
-- IMPORTANT: Replace 'your-email@example.com' with YOUR actual email
INSERT INTO admin_users (id, email, full_name, role, is_active)
SELECT id, email, 'Your Name', 'super_admin', true
FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (id) DO UPDATE SET role = 'super_admin', is_active = true;

-- Step 10: Verify everything (run these separately if needed)
-- SELECT * FROM storage.buckets WHERE id = 'blog';
-- SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%blog%';
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'blog_posts' AND column_name IN ('featured_image', 'content_images');
-- SELECT email, role FROM admin_users;

-- ============================================
-- DONE!
-- ============================================
-- Now:
-- 1. Refresh your browser (Ctrl+Shift+R)
-- 2. Try uploading an image
-- 3. Should work!
-- ============================================
