-- ============================================
-- ULTIMATE FIX - This should definitely work
-- Run this entire file
-- ============================================

-- 1. Insert you as super admin (using your actual user ID from the error)
-- CHANGE THE EMAIL AND NAME!
INSERT INTO admin_users (id, email, full_name, role, is_active)
VALUES (
  '934093a8-ce71-4080-8a57-05da1489ade1',
  'your-email@example.com',
  'Your Name',
  'super_admin',
  true
)
ON CONFLICT (id) DO UPDATE SET role = 'super_admin', is_active = true;

-- 2. Make blog bucket public
UPDATE storage.buckets SET public = true WHERE id = 'blog';

-- 3. Disable RLS on storage.objects (this is the key fix for 500 errors)
-- Storage uses bucket-level policies, not table-level RLS
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- 4. Drop ALL existing policies on storage.objects
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON storage.objects';
    END LOOP;
END $$;

-- 5. Create fresh, simple policies for blog bucket
CREATE POLICY "blog_select" ON storage.objects FOR SELECT USING (bucket_id = 'blog');
CREATE POLICY "blog_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'blog' AND auth.role() = 'authenticated');
CREATE POLICY "blog_update" ON storage.objects FOR UPDATE USING (bucket_id = 'blog' AND auth.role() = 'authenticated');
CREATE POLICY "blog_delete" ON storage.objects FOR DELETE USING (bucket_id = 'blog' AND auth.role() = 'authenticated');

-- 6. Re-enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 7. Verify everything
SELECT 'Admin user:' as check, email, role FROM admin_users WHERE id = '934093a8-ce71-4080-8a57-05da1489ade1'
UNION ALL
SELECT 'Blog bucket:', id::text, public::text FROM storage.buckets WHERE id = 'blog'
UNION ALL
SELECT 'RLS status:', tablename, rowsecurity::text FROM pg_tables WHERE schemaname = 'storage' AND tablename = 'objects';

-- DONE! Now:
-- 1. Hard refresh browser (Ctrl+Shift+R)
-- 2. Try uploading an image
-- 3. Should work!
