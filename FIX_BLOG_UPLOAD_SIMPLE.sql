-- ============================================
-- SIMPLE FIX - Run this in Supabase SQL Editor
-- This avoids the storage.objects permission issue
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

-- 3. Verify the setup
SELECT 'Admin User Check:' as check_type, email, role, is_active 
FROM admin_users 
WHERE id = '934093a8-ce71-4080-8a57-05da1489ade1';

-- ============================================
-- DONE WITH SQL!
-- Now continue with manual steps below...
-- ============================================
