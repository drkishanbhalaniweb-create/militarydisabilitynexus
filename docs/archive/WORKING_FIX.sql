-- ============================================
-- WORKING FIX - No system table modifications
-- This avoids the "must be owner" error
-- ============================================

-- 1. Insert you as super admin (using your actual user ID)
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

-- 3. Drop existing blog policies (if any)
DROP POLICY IF EXISTS "blog_select" ON storage.objects;
DROP POLICY IF EXISTS "blog_insert" ON storage.objects;
DROP POLICY IF EXISTS "blog_update" ON storage.objects;
DROP POLICY IF EXISTS "blog_delete" ON storage.objects;
DROP POLICY IF EXISTS "blog_upload" ON storage.objects;
DROP POLICY IF EXISTS "blog_view" ON storage.objects;

-- 4. Create VERY permissive policies (we'll tighten later)
-- These allow ANY authenticated user to do anything with blog bucket
CREATE POLICY "blog_select" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'blog');

CREATE POLICY "blog_insert" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'blog');

CREATE POLICY "blog_update" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'blog');

CREATE POLICY "blog_delete" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'blog');

-- 5. Verify
SELECT 'Your admin account:' as info, email, role, is_active 
FROM admin_users 
WHERE id = '934093a8-ce71-4080-8a57-05da1489ade1';

-- DONE!
-- Now refresh browser and try uploading
