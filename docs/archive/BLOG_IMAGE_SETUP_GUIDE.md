# Blog Image Upload - Setup Guide

## 🚀 Quick Setup (5 Minutes)

Follow these steps to enable blog image uploads in your admin panel.

---

## Step 1: Create Storage Bucket

### Option A: Via Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Navigate to https://app.supabase.com
   - Select your project

2. **Open Storage**
   - Click "Storage" in the left sidebar
   - Click "Create a new bucket"

3. **Configure Bucket**
   - **Name:** `blog-images`
   - **Public bucket:** ✅ **YES** (Important!)
   - **File size limit:** 5242880 (5MB)
   - **Allowed MIME types:** Leave empty or add:
     - `image/jpeg`
     - `image/jpg`
     - `image/png`
     - `image/webp`
     - `image/gif`

4. **Create Bucket**
   - Click "Create bucket"
   - Bucket should appear in list

### Option B: Via SQL

Run this in Supabase SQL Editor:

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-images',
  'blog-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;
```

---

## Step 2: Apply Storage Policies

### Via Supabase SQL Editor

1. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New query"

2. **Copy & Paste This SQL**

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

3. **Run Query**
   - Click "Run" or press Ctrl+Enter
   - Should see "Success. No rows returned"

---

## Step 3: Run Database Migration

### Via Supabase SQL Editor

1. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New query"

2. **Copy & Paste This SQL**

```sql
-- Migration: Add image support to blog posts

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

3. **Run Query**
   - Click "Run" or press Ctrl+Enter
   - Should see "Success. No rows returned"

---

## Step 4: Verify Setup

### Check Storage Bucket

1. **Go to Storage**
   - Click "Storage" in left sidebar
   - Should see `blog-images` bucket
   - Click on bucket name

2. **Verify Settings**
   - Public: ✅ Yes
   - File size limit: 5MB
   - Status: Active

### Check Policies

1. **Go to Storage**
   - Click on `blog-images` bucket
   - Click "Policies" tab

2. **Verify Policies Exist**
   - ✅ Authenticated users can upload
   - ✅ Anyone can view
   - ✅ Authenticated users can update
   - ✅ Authenticated users can delete

### Check Database

1. **Go to Table Editor**
   - Click "Table Editor" in left sidebar
   - Select `blog_posts` table

2. **Verify Columns**
   - ✅ `featured_image` column exists (TEXT)
   - ✅ `content_images` column exists (JSONB)

---

## Step 5: Test Upload

### Test in Admin Panel

1. **Log into Admin Panel**
   - Go to `/admin/login`
   - Enter credentials

2. **Create New Blog Post**
   - Go to Admin → Blog
   - Click "New Post"

3. **Upload Test Image**
   - Scroll to "Featured Image" section
   - Drag & drop an image OR click to upload
   - Wait for upload to complete
   - Should see preview

4. **Save Post**
   - Fill in required fields (Title, Excerpt, Content)
   - Click "Create Post"
   - Should see success message

5. **Verify Display**
   - Go to Blog page
   - Should see featured image on post card
   - Click on post
   - Should see featured image on post page

---

## 🎉 Setup Complete!

If all steps completed successfully, you should now be able to:
- ✅ Upload images in admin panel
- ✅ See images on blog listing
- ✅ See images on blog posts
- ✅ Remove/replace images

---

## 🐛 Troubleshooting

### Issue: "Bucket not found" error

**Solution:**
1. Verify bucket name is exactly `blog-images`
2. Check bucket exists in Storage dashboard
3. Verify bucket is public

### Issue: "Permission denied" error

**Solution:**
1. Verify storage policies are applied
2. Check user is authenticated
3. Run policies SQL again

### Issue: Upload succeeds but image doesn't display

**Solution:**
1. Verify bucket is public
2. Check image URL in database
3. Check browser console for errors
4. Verify image file exists in storage

### Issue: Can't delete images

**Solution:**
1. Verify delete policy is applied
2. Check user is authenticated
3. Verify image path is correct

---

## 📞 Need Help?

### Check These First
1. ✅ Bucket created and public
2. ✅ Policies applied
3. ✅ Migration run
4. ✅ User authenticated
5. ✅ Browser console for errors

### Common Mistakes
- ❌ Bucket not public
- ❌ Policies not applied
- ❌ Wrong bucket name
- ❌ User not logged in
- ❌ Migration not run

---

## 🔄 Reset/Redo Setup

If something went wrong, you can reset:

### Delete Bucket
```sql
DELETE FROM storage.buckets WHERE id = 'blog-images';
```

### Remove Policies
```sql
DROP POLICY IF EXISTS "Authenticated users can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete blog images" ON storage.objects;
```

### Remove Columns (Optional)
```sql
ALTER TABLE blog_posts DROP COLUMN IF EXISTS content_images;
-- Note: Don't drop featured_image if it was in original schema
```

Then start over from Step 1.

---

## ✅ Checklist

Use this checklist to track your progress:

- [ ] Step 1: Storage bucket created
- [ ] Step 2: Storage policies applied
- [ ] Step 3: Database migration run
- [ ] Step 4: Setup verified
- [ ] Step 5: Test upload successful
- [ ] Images display on blog listing
- [ ] Images display on blog posts
- [ ] Remove image works
- [ ] No console errors

---

**Setup Time:** ~5 minutes
**Difficulty:** Easy
**Prerequisites:** Supabase project, Admin access
**Status:** Ready to use!
