# Case Studies Storage Bucket Setup Guide

This guide explains how to set up the storage bucket for case study images in Supabase.

## Prerequisites

- Access to your Supabase project dashboard
- Admin privileges in Supabase

## Steps to Create Storage Bucket

### 1. Navigate to Storage

1. Log in to your Supabase dashboard
2. Select your project
3. Click on "Storage" in the left sidebar

### 2. Create New Bucket

1. Click the "New bucket" button
2. Configure the bucket with these settings:
   - **Name**: `case-study-images`
   - **Public bucket**: ✅ Enabled (allows public read access)
   - **File size limit**: 5242880 bytes (5MB)
   - **Allowed MIME types**: `image/jpeg,image/png,image/webp`

3. Click "Create bucket"

### 3. Configure Storage Policies

After creating the bucket, you need to set up Row Level Security policies for the storage bucket.

#### Option A: Using Supabase Dashboard

1. Go to "Storage" → "Policies"
2. Select the `case-study-images` bucket
3. Click "New Policy"

Create the following 4 policies:

**Policy 1: Public Read Access**
- Policy name: `Public read access for case study images`
- Allowed operation: `SELECT`
- Target roles: `public`
- Policy definition:
```sql
bucket_id = 'case-study-images'
```

**Policy 2: Authenticated Upload**
- Policy name: `Authenticated users can upload case study images`
- Allowed operation: `INSERT`
- Target roles: `authenticated`
- Policy definition:
```sql
bucket_id = 'case-study-images'
```

**Policy 3: Authenticated Update**
- Policy name: `Authenticated users can update case study images`
- Allowed operation: `UPDATE`
- Target roles: `authenticated`
- Policy definition:
```sql
bucket_id = 'case-study-images'
```

**Policy 4: Authenticated Delete**
- Policy name: `Authenticated users can delete case study images`
- Allowed operation: `DELETE`
- Target roles: `authenticated`
- Policy definition:
```sql
bucket_id = 'case-study-images'
```

#### Option B: Using SQL Editor

Alternatively, you can run these SQL commands in the Supabase SQL Editor:

```sql
-- Public read access
CREATE POLICY "Public read access for case study images"
ON storage.objects FOR SELECT
USING (bucket_id = 'case-study-images');

-- Authenticated upload access
CREATE POLICY "Authenticated users can upload case study images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'case-study-images');

-- Authenticated update access
CREATE POLICY "Authenticated users can update case study images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'case-study-images');

-- Authenticated delete access
CREATE POLICY "Authenticated users can delete case study images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'case-study-images');
```

## Verification

To verify the setup is correct:

1. **Test Public Read**: Try accessing an uploaded image URL in an incognito browser window - it should load
2. **Test Upload**: Try uploading an image through your admin panel - it should succeed when authenticated
3. **Test Delete**: Try deleting an image through your admin panel - it should succeed when authenticated

## Troubleshooting

### Images Not Loading
- Check that the bucket is set to "Public"
- Verify the public read policy is active
- Check the image URL format is correct

### Upload Fails
- Verify you're authenticated
- Check file size is under 5MB
- Verify MIME type is allowed (jpeg, png, or webp)
- Check the authenticated upload policy is active

### Delete Fails
- Verify you're authenticated
- Check the authenticated delete policy is active
- Ensure the file exists in the bucket

## Migration Note

The database migration (`011_case_studies.sql`) creates the case_studies table and related database objects. The storage bucket must be created manually through the Supabase dashboard as described above.

After running the migration and setting up the storage bucket, your case studies feature will be ready to use.
