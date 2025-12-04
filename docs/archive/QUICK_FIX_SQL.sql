-- ============================================
-- QUICK FIX: Run this entire file in Supabase SQL Editor
-- This will fix both Phase 4 and Phase 5 issues
-- ============================================

-- ============================================
-- PHASE 4: Blog Image Upload Fix
-- ============================================

-- 1. Add columns to blog_posts table
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS content_images JSONB DEFAULT '[]'::jsonb;

ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS featured_image TEXT;

-- 2. Add index
CREATE INDEX IF NOT EXISTS idx_blog_content_images 
ON blog_posts USING GIN(content_images);

-- 3. Apply storage policies for 'blog' bucket
-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Authenticated users can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete blog images" ON storage.objects;

-- Create new policies
CREATE POLICY "Authenticated users can upload blog images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog');

CREATE POLICY "Anyone can view blog images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'blog');

CREATE POLICY "Authenticated users can update blog images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'blog');

CREATE POLICY "Authenticated users can delete blog images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'blog');

-- ============================================
-- PHASE 5: Admin Account Creation Setup
-- ============================================

-- 1. Create admin_users table
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

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_users_created_by ON admin_users(created_by);

-- 3. Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all admin users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can create admin users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can update admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can update their own profile" ON admin_users;

-- 5. Create RLS policies
CREATE POLICY "Admins can view all admin users"
ON admin_users FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE id = auth.uid() AND is_active = true
    )
);

CREATE POLICY "Super admins can create admin users"
ON admin_users FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE id = auth.uid() 
        AND role = 'super_admin' 
        AND is_active = true
    )
);

CREATE POLICY "Super admins can update admin users"
ON admin_users FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE id = auth.uid() 
        AND role = 'super_admin' 
        AND is_active = true
    )
);

CREATE POLICY "Admins can update their own profile"
ON admin_users FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 6. Create helper functions
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users
        WHERE id = user_id AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users
        WHERE id = user_id 
        AND role = 'super_admin' 
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM admin_users
    WHERE id = user_id AND is_active = true;
    
    RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create triggers
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_admin_users_updated_at ON admin_users;
CREATE TRIGGER trigger_update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_admin_users_updated_at();

-- 8. Grant permissions
GRANT SELECT, INSERT, UPDATE ON admin_users TO authenticated;

-- ============================================
-- IMPORTANT: Create Your Super Admin Account
-- ============================================
-- Replace 'your-email@example.com' with your actual email
-- Replace 'Your Name' with your actual name

INSERT INTO admin_users (id, email, full_name, role, is_active)
SELECT id, email, 'Your Name', 'super_admin', true
FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify everything worked:

-- Check blog_posts columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'blog_posts' 
AND column_name IN ('featured_image', 'content_images');

-- Check storage policies
SELECT policyname FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%blog%';

-- Check admin_users table
SELECT * FROM admin_users;

-- Check if you're a super admin
SELECT * FROM admin_users WHERE email = 'your-email@example.com';

-- ============================================
-- SUCCESS!
-- ============================================
-- If no errors, you're done!
-- Now you can:
-- 1. Upload images in blog posts
-- 2. See "Admin Users" link in admin panel
-- 3. Create new admin accounts
-- ============================================
