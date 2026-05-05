# Fix Upload Error - Quick Solution

## 🔴 The Problem

You're getting these errors:
- **404 on `admin_users`** - Table doesn't exist yet
- **400 on storage upload** - Policies not applied yet

## ✅ The Solution (2 minutes)

### Step 1: Run the SQL (1 minute)

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **"New query"**
3. Open the file **`QUICK_FIX_SQL.sql`** in your project
4. Copy **ENTIRE contents** (all ~200 lines)
5. Paste into SQL Editor
6. **IMPORTANT:** Change this line near the bottom:
   ```sql
   WHERE email = 'your-email@example.com'
   ```
   Replace with YOUR actual email that you use to log into admin panel

7. Click **"Run"** or press **Ctrl+Enter**
8. Should see "Success" (might see some warnings about existing objects - that's OK)

### Step 2: Refresh Your Browser (30 seconds)

1. Go back to your admin panel
2. Press **Ctrl+Shift+R** (hard refresh)
3. Try uploading an image again
4. Should work now!

### Step 3: Verify (30 seconds)

Check that everything works:
- ✅ Image upload works
- ✅ "Admin Users" link appears in sidebar
- ✅ No more 404 errors

## 🎯 What This Does

The SQL file:
1. ✅ Adds `featured_image` column to `blog_posts`
2. ✅ Adds `content_images` column to `blog_posts`
3. ✅ Applies storage policies for 'blog' bucket
4. ✅ Creates `admin_users` table
5. ✅ Creates RLS policies
6. ✅ Creates helper functions
7. ✅ Makes you a super admin

## 🐛 If It Still Doesn't Work

### Check if 'blog' bucket exists

```sql
SELECT * FROM storage.buckets WHERE id = 'blog';
```

Should return one row with `public = true`

### Check if you're a super admin

```sql
SELECT * FROM admin_users WHERE email = 'your-email@example.com';
```

Should return one row with `role = 'super_admin'`

### Make 'blog' bucket public if needed

```sql
UPDATE storage.buckets 
SET public = true 
WHERE id = 'blog';
```

## 📝 Alternative: Step by Step

If you prefer to run commands separately:

### 1. Fix Blog Images
```sql
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS featured_image TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS content_images JSONB DEFAULT '[]'::jsonb;

CREATE POLICY "Authenticated users can upload blog images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'blog');

CREATE POLICY "Anyone can view blog images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'blog');
```

### 2. Create Admin Users Table
```sql
CREATE TABLE admin_users (
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

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
```

### 3. Make Yourself Super Admin
```sql
INSERT INTO admin_users (id, email, full_name, role, is_active)
SELECT id, email, 'Your Name', 'super_admin', true
FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (id) DO NOTHING;
```

## ✅ Success!

Once the SQL runs successfully:
- ✅ Image upload will work
- ✅ "Admin Users" link will appear
- ✅ No more errors

**Total time: 2 minutes**

---

**Quick Start:** Just run `QUICK_FIX_SQL.sql` in Supabase SQL Editor and you're done!
