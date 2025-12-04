# Supabase Setup Guide - UPDATED

## Quick Fix for Admin Panel 403 Error

The 403 error when deactivating services is caused by missing RLS (Row Level Security) policies for authenticated users.

### Solution: Run the Setup Script (RECOMMENDED)

**Use this file:** `supabase/STEP_BY_STEP_SETUP.sql`

This script handles everything including creating missing tables.

1. **Open Supabase Dashboard**
   - Go to your project at https://supabase.com/dashboard
   - Navigate to **SQL Editor** (left sidebar)

2. **Run the Complete Setup Script**
   - Open `supabase/STEP_BY_STEP_SETUP.sql` in your code editor
   - Copy the **entire contents** (Ctrl+A, Ctrl+C)
   - Paste into Supabase SQL Editor
   - Click **Run** button (or press Ctrl+Enter)

3. **Check Results**
   - Scroll down to see the output
   - Look for:
     - ✓ EXISTS for all tables
     - Policy counts for each table
     - ✓ PRIVATE for storage bucket
     - Success message at the end

4. **If You See Errors**
   - Read the error message carefully
   - Common issues:
     - "relation already exists": Safe to ignore (table already created)
     - "policy already exists": Safe to ignore (policy already created)
     - "permission denied": Make sure you're the project owner
     - "syntax error": Make sure you copied the entire script

5. **Test Admin Panel**
   - Go back to your app at http://localhost:3000/admin
   - Log out and log back in (to refresh auth token)
   - Try deactivating/activating a service
   - Should work without 403 error!

## What This Script Does

### Step 1: Creates Missing Tables
- Creates `form_submissions` table if it doesn't exist
- Adds `form_submission_id` column to `file_uploads` if missing
- Creates all necessary indexes

### Step 2: Public Access Policies
- Allows anyone to submit forms
- Allows anyone to upload files
- Allows anyone to read published content

### Step 3: Admin Access Policies
- Gives authenticated users (admins) full CRUD access to:
  - Services
  - Blog posts
  - Contacts
  - File uploads
  - Form submissions
  - Audit logs

### Step 4: Storage Setup
- Creates `medical-documents` bucket (private)
- Sets up public upload/download policies
- Sets up admin full access policies

### Step 5: Verification
- Shows which tables exist
- Shows policy counts
- Shows storage bucket status
- Displays success message

## Common Errors and Solutions

### Error: "relation 'form_submissions' already exists"
**Solution:** This is fine! It means the table was already created. The script will continue.

### Error: "policy 'Admin full access to services' already exists"
**Solution:** This is fine! The script drops existing policies before creating new ones.

### Error: "permission denied for table services"
**Solution:** 
1. Make sure you're logged into Supabase as the project owner
2. Check that you're in the correct project
3. Try running the script again

### Error: "column 'form_submission_id' already exists"
**Solution:** This is fine! The script checks before adding columns.

### Still Getting 403 in Admin Panel?

1. **Clear browser cache and cookies**
   - Press Ctrl+Shift+Delete
   - Clear cached images and files
   - Clear cookies

2. **Log out and back in**
   - Go to /admin/login
   - Log out completely
   - Log back in with your credentials

3. **Check auth token**
   - Open DevTools (F12)
   - Go to Application > Local Storage
   - Look for your Supabase URL
   - Check if `sb-*-auth-token` exists
   - If missing or expired, log in again

4. **Verify policies in Supabase**
   ```sql
   SELECT tablename, policyname, roles, cmd
   FROM pg_policies
   WHERE tablename = 'services'
   ORDER BY policyname;
   ```
   - Should see policies for both `public` and `authenticated` roles

## Testing Checklist

After running the setup script:

### Public Access (Not Logged In)
- [ ] Can view homepage
- [ ] Can submit Quick Intake form
- [ ] Can upload files (for Aid & Attendance)
- [ ] Can view services page
- [ ] Can view blog posts

### Admin Access (Logged In)
- [ ] Can log into admin panel
- [ ] Can activate/deactivate services
- [ ] Can edit services
- [ ] Can create/edit blog posts
- [ ] Can view contacts
- [ ] Can view form submissions
- [ ] Can delete files

## Alternative: Manual Setup

If the automated script doesn't work, you can run each step manually:

### 1. Create form_submissions table
```sql
-- Copy from supabase/migrations/002_form_submissions.sql
```

### 2. Add public policies
```sql
-- Copy from supabase/enable_all_access.sql
```

### 3. Add admin policies
```sql
-- Copy from supabase/admin_permissions.sql
```

## Need More Help?

1. **Check Supabase Logs**
   - Dashboard > Logs
   - Look for recent errors

2. **Check Browser Console**
   - F12 > Console tab
   - Look for red error messages

3. **Verify Environment Variables**
   - Check `frontend/.env`
   - Make sure `REACT_APP_SUPABASE_URL` is correct
   - Make sure `REACT_APP_SUPABASE_ANON_KEY` is correct

4. **Test Supabase Connection**
   ```javascript
   // In browser console on your app
   console.log(window.localStorage);
   // Look for Supabase auth token
   ```

## Success Indicators

You'll know everything is working when:

✅ No errors in Supabase SQL Editor output
✅ Admin panel loads without errors
✅ Can toggle service active/inactive status
✅ Can submit forms from homepage
✅ Can upload files
✅ No 403 errors in browser console

## Security Notes

- All PHI (Protected Health Information) is properly secured
- Storage buckets are private by default
- RLS is enabled on all tables
- Audit logging is in place for admin actions
- File uploads are encrypted at rest
