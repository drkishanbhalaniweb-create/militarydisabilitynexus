# Supabase Setup Required - Phase 4 & 5

## 📋 Quick Checklist

Before Phase 4 (Blog Images) and Phase 5 (Admin Accounts) will work, you need to:

### Phase 4: Blog Image Upload
- [ ] Create `blog-images` storage bucket
- [ ] Apply storage policies
- [ ] Run database migration 007

### Phase 5: Admin Account Creation
- [ ] Run database migration 008
- [ ] Deploy `create-admin-user` edge function
- [ ] Create initial super admin

**Total Time:** ~10 minutes

---

## 🚀 Phase 4 Setup: Blog Image Upload

### Step 1: Create Storage Bucket (2 minutes)

**Via Supabase Dashboard:**

1. Go to https://app.supabase.com
2. Select your project
3. Click **Storage** in left sidebar
4. Click **"Create a new bucket"**
5. Configure:
   - **Name:** `blog-images`
   - **Public bucket:** ✅ **YES** (Important!)
   - **File size limit:** `5242880` (5MB)
   - Click **"Create bucket"**

**Via SQL (Alternative):**
```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('blog-images', 'blog-images', true, 5242880)
ON CONFLICT (id) DO NOTHING;
```

### Step 2: Apply Storage Policies (1 minute)

1. Go to **SQL Editor**
2. Click **"New query"**
3. Copy and paste this:

```sql
-- Policy: Allow authenticated users to upload blog images
CREATE POLICY "Authenticated users can upload blog images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-images');

-- Policy: Allow anyone to view blog images (public bucket)
CREATE POLICY "Anyone can view blog images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'blog-images');

-- Policy: Allow authenticated users to update their uploaded images
CREATE POLICY "Authenticated users can update blog images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'blog-images');

-- Policy: Allow authenticated users to delete blog images
CREATE POLICY "Authenticated users can delete blog images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'blog-images');
```

4. Click **"Run"**
5. Should see "Success. No rows returned"

### Step 3: Run Database Migration (1 minute)

1. Go to **SQL Editor**
2. Click **"New query"**
3. Copy entire contents of `supabase/migrations/007_blog_images.sql`
4. Paste and click **"Run"**
5. Should see "Success"

**Or copy this:**
```sql
-- Add content_images column to blog_posts for inline images
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS content_images JSONB DEFAULT '[]'::jsonb;

-- Add index for content_images for better query performance
CREATE INDEX IF NOT EXISTS idx_blog_content_images 
ON blog_posts USING GIN(content_images);

-- Ensure featured_image column exists and allows NULL
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' 
        AND column_name = 'featured_image'
    ) THEN
        ALTER TABLE blog_posts ADD COLUMN featured_image TEXT;
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN blog_posts.content_images IS 
'Array of image objects for inline content: [{url: string, alt: string, caption: string, position: number}]';

COMMENT ON COLUMN blog_posts.featured_image IS 
'URL of the featured/hero image for the blog post';
```

### ✅ Phase 4 Verification

Test that it works:
1. Log into admin panel
2. Go to Blog → New Post
3. Should see "Featured Image" upload section
4. Try uploading an image
5. Should see preview
6. Save post
7. View post on blog - should see image

---

## 🚀 Phase 5 Setup: Admin Account Creation

### Step 1: Run Database Migration (2 minutes)

1. Go to **SQL Editor**
2. Click **"New query"**
3. Copy entire contents of `supabase/migrations/008_admin_users.sql`
4. Paste and click **"Run"**
5. Should see "Success"

**This creates:**
- `admin_users` table
- RLS policies
- Helper functions (is_admin, is_super_admin, get_user_role)
- Triggers

### Step 2: Deploy Edge Function (2 minutes)

**Option A: Via Supabase CLI (Recommended)**

```bash
# Make sure you're in project root
cd /path/to/your/project

# Deploy the function
supabase functions deploy create-admin-user
```

**Option B: Via Supabase Dashboard**

1. Go to **Edge Functions**
2. Click **"Create a new function"**
3. Name: `create-admin-user`
4. Copy entire contents of `supabase/functions/create-admin-user/index.ts`
5. Paste into editor
6. Click **"Deploy"**

### Step 3: Create Initial Super Admin (2 minutes)

**Important:** You need at least one super admin to create others.

**Find Your User ID:**
1. Go to **Authentication** → **Users**
2. Find your email
3. Copy the UUID (user ID)

**Insert Super Admin:**
1. Go to **SQL Editor**
2. Click **"New query"**
3. Run this (replace with your details):

```sql
-- Replace these values:
-- 'your-user-id' = UUID from auth.users
-- 'your-email@example.com' = your email
-- 'Your Name' = your full name

INSERT INTO admin_users (id, email, full_name, role, is_active)
VALUES (
  'your-user-id',
  'your-email@example.com',
  'Your Name',
  'super_admin',
  true
)
ON CONFLICT (id) DO NOTHING;
```

**Or use this automatic version:**
```sql
-- This automatically gets your user ID from auth.users
-- Just replace the email
INSERT INTO admin_users (id, email, full_name, role, is_active)
SELECT id, email, 'Your Name', 'super_admin', true
FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (id) DO NOTHING;
```

### ✅ Phase 5 Verification

Test that it works:
1. Log into admin panel
2. Should see **"Admin Users"** link in sidebar
3. Click it
4. Should see list of admin users (including yourself)
5. Click **"Create Admin"**
6. Fill in form and submit
7. Should see success message
8. New admin should appear in list
9. Try logging in with new admin credentials

---

## 🔍 Verification Commands

Run these to verify everything is set up correctly:

### Check Phase 4 (Blog Images)

```sql
-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'blog-images';

-- Check if policies exist
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%blog images%';

-- Check if columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'blog_posts' 
AND column_name IN ('featured_image', 'content_images');
```

### Check Phase 5 (Admin Accounts)

```sql
-- Check if admin_users table exists
SELECT * FROM admin_users LIMIT 1;

-- Check if functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN ('is_admin', 'is_super_admin', 'get_user_role');

-- Check if you're a super admin
SELECT * FROM admin_users WHERE email = 'your-email@example.com';

-- Check edge function (via CLI)
-- supabase functions list
```

---

## 🐛 Troubleshooting

### Phase 4 Issues

**Issue: "Bucket not found" error**
```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('blog-images', 'blog-images', true, 5242880)
ON CONFLICT (id) DO NOTHING;
```

**Issue: "Permission denied" on upload**
```sql
-- Reapply policies (drop first if they exist)
DROP POLICY IF EXISTS "Authenticated users can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete blog images" ON storage.objects;

-- Then run the CREATE POLICY commands again
```

**Issue: Images don't display**
- Verify bucket is **public** (check in Storage settings)
- Check image URL in database
- Check browser console for errors

### Phase 5 Issues

**Issue: "Admin Users" link not showing**
```sql
-- Check if you're in admin_users table
SELECT * FROM admin_users WHERE email = 'your-email@example.com';

-- If not found, insert yourself
INSERT INTO admin_users (id, email, full_name, role, is_active)
SELECT id, email, 'Your Name', 'super_admin', true
FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (id) DO NOTHING;
```

**Issue: Cannot create admin user**
```bash
# Check if function is deployed
supabase functions list

# Redeploy if needed
supabase functions deploy create-admin-user

# Check function logs
supabase functions logs create-admin-user
```

**Issue: New admin cannot log in**
```sql
-- Check if user exists in auth.users
SELECT id, email, email_confirmed_at FROM auth.users 
WHERE email = 'new-admin@example.com';

-- Check if user is in admin_users
SELECT * FROM admin_users WHERE email = 'new-admin@example.com';

-- Activate if needed
UPDATE admin_users SET is_active = true 
WHERE email = 'new-admin@example.com';
```

---

## 📋 Complete Setup Checklist

Use this to track your progress:

### Phase 4: Blog Images
- [ ] Storage bucket `blog-images` created
- [ ] Bucket is public
- [ ] Storage policies applied (4 policies)
- [ ] Migration 007 run successfully
- [ ] `featured_image` column exists
- [ ] `content_images` column exists
- [ ] Can upload image in admin panel
- [ ] Image displays on blog

### Phase 5: Admin Accounts
- [ ] Migration 008 run successfully
- [ ] `admin_users` table created
- [ ] RLS policies applied
- [ ] Helper functions created
- [ ] Edge function deployed
- [ ] Initial super admin created
- [ ] "Admin Users" link visible
- [ ] Can create new admin
- [ ] New admin can log in

---

## 🎯 Quick Start Commands

Copy and paste these in order:

### 1. Create Blog Images Bucket
```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('blog-images', 'blog-images', true, 5242880)
ON CONFLICT (id) DO NOTHING;
```

### 2. Apply Storage Policies
```sql
CREATE POLICY "Authenticated users can upload blog images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'blog-images');
CREATE POLICY "Anyone can view blog images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'blog-images');
CREATE POLICY "Authenticated users can update blog images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'blog-images');
CREATE POLICY "Authenticated users can delete blog images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'blog-images');
```

### 3. Run Migration 007 (Blog Images)
Copy from `supabase/migrations/007_blog_images.sql`

### 4. Run Migration 008 (Admin Users)
Copy from `supabase/migrations/008_admin_users.sql`

### 5. Deploy Edge Function
```bash
supabase functions deploy create-admin-user
```

### 6. Create Super Admin
```sql
INSERT INTO admin_users (id, email, full_name, role, is_active)
SELECT id, email, 'Your Name', 'super_admin', true
FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (id) DO NOTHING;
```

---

## ✅ Success!

Once all steps are complete:
- ✅ Blog image upload will work
- ✅ Admin account creation will work
- ✅ All features are production-ready

**Total Setup Time:** ~10 minutes

---

## 📞 Need Help?

If you encounter issues:
1. Check the verification commands above
2. Review troubleshooting section
3. Check Supabase logs (Dashboard → Logs)
4. Check browser console for errors
5. Verify you're logged in as admin

---

**Status:** Setup Required
**Difficulty:** Easy
**Time:** ~10 minutes
**Prerequisites:** Supabase project, Admin access
