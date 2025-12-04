# RLS Policy Fix - Step-by-Step Instructions

## Overview
This guide walks you through applying the RLS policy fixes to resolve 500 errors and security issues in your Supabase database.

## Prerequisites
- Access to Supabase SQL Editor with service_role privileges
- Your auth user ID (from Supabase Auth dashboard)
- Backup of current database (recommended)

## Step-by-Step Process

### Step 1: Get Your User ID
1. Go to Supabase Dashboard → Authentication → Users
2. Find your email and copy the UUID (e.g., `934093a8-ce71-4080-8a57-05da1489ade1`)
3. Keep this handy for Step 3

### Step 2: Inspect Current State (Optional but Recommended)
Run these queries in Supabase SQL Editor to see current policies:

```sql
-- Check admin_users policies
SELECT policyname, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'admin_users';

-- Check storage policies
SELECT policyname, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
AND policyname LIKE 'blog%';

-- Check blog bucket configuration
SELECT id, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'blog';
```

Save the output for reference.

### Step 3: Update Migration File
1. Open `supabase/migrations/009_fix_rls_policies.sql`
2. Find Section 3 (around line 60)
3. Uncomment and update the INSERT statement with YOUR details:

```sql
INSERT INTO public.admin_users (id, email, full_name, role, is_active)
VALUES (
  'YOUR-USER-ID-HERE',      -- Paste your UUID from Step 1
  'your-email@example.com',  -- Your actual email
  'Your Name',               -- Your actual name
  'super_admin',
  true
)
ON CONFLICT (id) DO UPDATE
  SET role = 'super_admin', 
      is_active = true,
      updated_at = now();
```

4. Save the file

### Step 4: Apply the Migration

#### Option A: Using Supabase CLI (Recommended)
```bash
# Make sure you're in the project root
cd /path/to/your/project

# Link to your Supabase project (if not already linked)
supabase link --project-ref your-project-ref

# Apply the migration
supabase db push
```

#### Option B: Manual SQL Editor
1. Open the entire `009_fix_rls_policies.sql` file
2. Copy all contents
3. Go to Supabase Dashboard → SQL Editor
4. Paste the SQL
5. Click "Run"

### Step 5: Verify the Fix
Run these verification queries:

```sql
-- 1. Verify helper function was created
SELECT routine_name, security_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'is_super_admin';
-- Expected: 1 row with security_type = 'DEFINER'

-- 2. Verify admin_users policies
SELECT policyname, roles, cmd 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'admin_users'
ORDER BY policyname;
-- Expected: 3 policies (admin_users_select_own, admin_users_update_own, admin_users_super_admin)

-- 3. Verify storage policies
SELECT policyname, roles, cmd 
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
AND policyname LIKE 'blog%'
ORDER BY policyname;
-- Expected: 5 policies (blog_public_select, blog_insert_authenticated, etc.)

-- 4. Verify your admin account
SELECT id, email, role, is_active 
FROM public.admin_users 
WHERE email = 'your-email@example.com';
-- Expected: 1 row with role = 'super_admin', is_active = true
```

### Step 6: Test Functionality

#### Test 1: Admin Login
1. Log out of your application
2. Log back in with your admin credentials
3. Navigate to `/admin/users`
4. Verify you can see the admin users list (no 500 error)

#### Test 2: Blog Image Upload
1. Go to `/admin/blog/new` or edit existing post
2. Try uploading an image
3. Verify upload succeeds (no 400/500 error)
4. Check that image displays correctly

#### Test 3: Create New Admin User
1. Go to `/admin/users`
2. Click "Add New Admin"
3. Fill in details and submit
4. Verify new user is created successfully

### Step 7: Monitor for Issues
Check Supabase logs for any remaining errors:
1. Go to Supabase Dashboard → Logs
2. Filter by "Postgres Logs" and "API Logs"
3. Look for any 500 errors or policy violations
4. If issues persist, see Troubleshooting section below

## Troubleshooting

### Issue: Still getting 500 errors on admin_users
**Possible causes:**
- Helper function not created properly
- User ID mismatch between auth.users and admin_users
- RLS still disabled

**Solutions:**
```sql
-- Check if function exists and is SECURITY DEFINER
SELECT routine_name, security_type, routine_definition
FROM information_schema.routines 
WHERE routine_name = 'is_super_admin';

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'admin_users';
-- rowsecurity should be true

-- Check user ID match
SELECT au.id, au.email, u.id as auth_id, u.email as auth_email
FROM public.admin_users au
FULL OUTER JOIN auth.users u ON au.id = u.id
WHERE au.email = 'your-email@example.com' OR u.email = 'your-email@example.com';
-- Both IDs should match
```

### Issue: Blog images not uploading (400/500 error)
**Possible causes:**
- Bucket doesn't exist
- Storage policies not applied
- File size/type restrictions

**Solutions:**
```sql
-- Verify bucket exists and is configured
SELECT * FROM storage.buckets WHERE id = 'blog';

-- Check storage policies
SELECT * FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
AND policyname LIKE 'blog%';

-- Test bucket access
SELECT bucket_id, name, created_at 
FROM storage.objects 
WHERE bucket_id = 'blog' 
LIMIT 5;
```

### Issue: "Response body is already used" error
This is a client-side JavaScript error, not database-related.

**Solution:** Check your frontend code for duplicate response reads:
```javascript
// BAD - reading response twice
const response = await fetch(url);
const data1 = await response.json();
const data2 = await response.json(); // ERROR!

// GOOD - clone if you need multiple reads
const response = await fetch(url);
const clone = response.clone();
const data1 = await response.json();
const data2 = await clone.json();
```

### Issue: Cannot create new admin users
**Possible causes:**
- Not logged in as super_admin
- Helper function not working
- Policy WITH CHECK failing

**Solutions:**
```sql
-- Verify your role
SELECT role, is_active FROM public.admin_users WHERE id = auth.uid();

-- Test helper function directly
SELECT public.is_super_admin(auth.uid());
-- Should return true

-- Check policy evaluation
SET ROLE authenticated;
SET request.jwt.claims.sub = 'your-user-id';
SELECT * FROM public.admin_users; -- Should work
```

## Rollback Plan
If something goes wrong, you can rollback:

```sql
-- Drop new policies
DROP POLICY IF EXISTS admin_users_select_own ON public.admin_users;
DROP POLICY IF EXISTS admin_users_update_own ON public.admin_users;
DROP POLICY IF EXISTS admin_users_super_admin ON public.admin_users;
DROP POLICY IF EXISTS blog_public_select ON storage.objects;
DROP POLICY IF EXISTS blog_insert_authenticated ON storage.objects;
DROP POLICY IF EXISTS blog_update_authenticated ON storage.objects;
DROP POLICY IF EXISTS blog_delete_authenticated ON storage.objects;
DROP POLICY IF EXISTS blog_super_admin ON storage.objects;

-- Drop helper function
DROP FUNCTION IF EXISTS public.is_super_admin(uuid);

-- Then restore from your backup or re-run previous migrations
```

## Additional Configuration

### Making Blog Bucket Private
If you want signed URLs instead of public access:

```sql
UPDATE storage.buckets 
SET public = false 
WHERE id = 'blog';
```

Then update your frontend to use signed URLs:
```javascript
const { data } = await supabase.storage
  .from('blog')
  .createSignedUrl(filePath, 3600); // 1 hour expiry
```

### Enforcing User-Specific Folders
To restrict users to only upload/manage files in their own folder:

1. Uncomment the path checks in the migration file (lines with `storage.foldername`)
2. Update your frontend upload code to include user ID in path:
```javascript
const filePath = `${user.id}/${fileName}`;
await supabase.storage.from('blog').upload(filePath, file);
```

## Next Steps
1. ✅ Apply migration
2. ✅ Verify all tests pass
3. ✅ Monitor logs for 24 hours
4. Consider additional security hardening (see ADVANCED_SECURITY.md)
5. Document any custom policies for your team

## Support
If issues persist after following this guide:
1. Check Supabase Postgres logs for detailed error messages
2. Review the Supabase RLS documentation
3. Consider posting in Supabase Discord with specific error messages
