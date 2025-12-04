-- ============================================
-- DIAGNOSE AND FIX - Run each section separately
-- ============================================

-- SECTION 1: Check if you're in admin_users
-- Run this first:
SELECT * FROM admin_users WHERE id = '934093a8-ce71-4080-8a57-05da1489ade1';

-- If it returns nothing, run this (replace email and name):
INSERT INTO admin_users (id, email, full_name, role, is_active)
VALUES (
  '934093a8-ce71-4080-8a57-05da1489ade1',
  'your-email@example.com',
  'Your Name',
  'super_admin',
  true
)
ON CONFLICT (id) DO UPDATE SET role = 'super_admin', is_active = true;

-- ============================================
-- SECTION 2: Check blog bucket
-- ============================================
SELECT * FROM storage.buckets WHERE id = 'blog';

-- If it shows public = false, run this:
UPDATE storage.buckets SET public = true WHERE id = 'blog';

-- If it doesn't exist at all, you need to create it:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('blog', 'blog', true);

-- ============================================
-- SECTION 3: Check storage policies
-- ============================================
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'objects' 
AND (policyname LIKE '%blog%' OR policyname LIKE 'blog%');

-- If you see NO policies, run this:
CREATE POLICY "blog_upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'blog');
CREATE POLICY "blog_view" ON storage.objects FOR SELECT TO public USING (bucket_id = 'blog');
CREATE POLICY "blog_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'blog');
CREATE POLICY "blog_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'blog');

-- ============================================
-- SECTION 4: Check if RLS is enabled on storage.objects
-- ============================================
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- If rowsecurity = false, that's actually GOOD for storage
-- Storage uses bucket-level policies, not table-level RLS

-- ============================================
-- SECTION 5: Nuclear option - Disable RLS on storage.objects temporarily
-- ============================================
-- WARNING: Only do this if nothing else works
-- This makes storage.objects accessible to everyone temporarily
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- ============================================
-- SECTION 6: Check your auth status
-- ============================================
-- Make sure you're actually logged in
-- Check in browser console: await supabase.auth.getUser()
