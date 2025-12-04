# Fix Blog Storage Policies - Step by Step

## Part 1: Run SQL (Fixes admin_users access)

1. Go to Supabase Dashboard → SQL Editor
2. Open `FIX_BLOG_UPLOAD_SIMPLE.sql`
3. **Update lines 8-10** with your actual:
   - User ID (find it in Authentication → Users)
   - Email
   - Name
4. Run the SQL
5. You should see "Admin User Check" confirming your super_admin status

## Part 2: Fix Storage Bucket (Fixes image upload)

### Step 1: Configure the Blog Bucket

1. Go to **Storage** in Supabase Dashboard
2. Find the **blog** bucket (or create it if it doesn't exist)
3. Click on the bucket name
4. Click **Configuration** (gear icon)
5. Set these options:
   - **Public bucket**: ✅ ON (checked)
   - **File size limit**: 5 MB
   - **Allowed MIME types**: 
     ```
     image/jpeg
     image/jpg
     image/png
     image/webp
     image/gif
     ```
6. Click **Save**

### Step 2: Set Storage Policies

1. Still in Storage, click on the **blog** bucket
2. Click **Policies** tab
3. **Delete all existing policies** for this bucket (if any)
4. Click **New Policy**

#### Policy 1: Public Read Access
- **Policy name**: `blog_public_select`
- **Allowed operation**: SELECT
- **Target roles**: `public`
- **USING expression**:
  ```sql
  bucket_id = 'blog'
  ```
- Click **Review** → **Save policy**

#### Policy 2: Authenticated Upload
- Click **New Policy** again
- **Policy name**: `blog_insert_authenticated`
- **Allowed operation**: INSERT
- **Target roles**: `authenticated`
- **WITH CHECK expression**:
  ```sql
  bucket_id = 'blog'
  ```
- Click **Review** → **Save policy**

#### Policy 3: Authenticated Update
- Click **New Policy** again
- **Policy name**: `blog_update_authenticated`
- **Allowed operation**: UPDATE
- **Target roles**: `authenticated`
- **USING expression**:
  ```sql
  bucket_id = 'blog'
  ```
- **WITH CHECK expression**:
  ```sql
  bucket_id = 'blog'
  ```
- Click **Review** → **Save policy**

#### Policy 4: Authenticated Delete
- Click **New Policy** again
- **Policy name**: `blog_delete_authenticated`
- **Allowed operation**: DELETE
- **Target roles**: `authenticated`
- **USING expression**:
  ```sql
  bucket_id = 'blog'
  ```
- Click **Review** → **Save policy**

## Part 3: Test

1. **Refresh your browser** (hard refresh: Ctrl+Shift+R or Cmd+Shift+R)
2. Try uploading a blog image
3. Try creating a blog post

## Troubleshooting

If you still get errors:

1. Check browser console for specific error messages
2. Go to Supabase Dashboard → Logs → check for errors
3. Verify your user is logged in (check Application → Local Storage in browser dev tools)
4. Make sure the `blog` bucket exists and is public
5. Verify all 4 storage policies are created correctly

## Quick Alternative (If UI is confusing)

If the UI is too complex, you can also:

1. Go to Storage → blog bucket → Policies
2. Click **"Use a template"**
3. Select **"Allow public read access"**
4. Then add another policy using **"Allow authenticated uploads"** template
5. Modify the templates to match the bucket_id = 'blog' condition
