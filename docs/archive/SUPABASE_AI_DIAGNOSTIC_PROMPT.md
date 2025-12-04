# Supabase AI Diagnostic Prompt

Copy and paste this into Supabase AI Assistant:

---

## Prompt for Supabase AI:

I have a React application with a Supabase backend. I'm experiencing issues with Row Level Security (RLS) policies that are preventing normal operations. Here are the specific problems:

### Issues:
1. **Cannot create new blog posts** - Only able to edit existing posts
2. **Getting 500 errors** when querying the `admin_users` table
3. **Getting 400/500 errors** when trying to upload files to the `blog` storage bucket
4. **Image uploads fail** with "StorageUnknownError: Failed to execute 'clone' on 'Response': Response body is already used"

### My Setup:
- **Database Tables:**
  - `blog_posts` (with RLS enabled)
  - `services` (with RLS enabled)
  - `contacts` (with RLS enabled)
  - `admin_users` (with RLS enabled)
  - `file_uploads` (with RLS enabled)

- **Storage Buckets:**
  - `blog` (should be public)
  - `services`
  - `testimonials`
  - `medical-documents`

- **Authentication:**
  - Using Supabase Auth
  - User ID: `934093a8-ce71-4080-8a57-05da1489ade1`
  - User is authenticated but getting blocked by RLS

### What I Need:

1. **Diagnose RLS policies** on `blog_posts` table - why can I edit but not create?
2. **Fix `admin_users` table** - getting 500 errors when querying
3. **Fix storage policies** on `blog` bucket - uploads failing
4. **Check if there are circular dependencies** in RLS policies

### Specific Questions:

1. What RLS policies should I have on `blog_posts` to allow authenticated users to INSERT?
2. What RLS policies should I have on `admin_users` to allow authenticated users to SELECT their own record?
3. What storage policies should I have on the `blog` bucket to allow authenticated users to upload?
4. Are there any conflicting policies that might be causing 500 errors?

### Current Policies (if any):

**blog_posts table:**
- Can you check what INSERT policies exist?
- Can you check what SELECT policies exist?

**admin_users table:**
- Can you check what SELECT policies exist?
- Are they too restrictive?

**storage.objects (blog bucket):**
- Can you check what INSERT policies exist for bucket_id = 'blog'?
- Is the bucket set to public?

### Expected Behavior:
- Authenticated users should be able to INSERT into `blog_posts`
- Authenticated users should be able to SELECT from `admin_users` where id = auth.uid()
- Authenticated users should be able to upload to `blog` storage bucket
- Public users should be able to view files in `blog` bucket

### Please provide:
1. SQL to check current policies
2. SQL to fix any issues
3. Explanation of what's wrong
4. Recommended RLS policy structure for this use case

---

## Alternative Shorter Prompt:

I'm getting RLS policy errors in my Supabase project:
- Can't INSERT into `blog_posts` table (only UPDATE works)
- Getting 500 errors on `admin_users` table queries
- Storage uploads to `blog` bucket failing with 400/500 errors
- User ID: `934093a8-ce71-4080-8a57-05da1489ade1`

Please diagnose RLS policies on these tables and storage bucket, and provide SQL to fix them. I need authenticated users to be able to create blog posts, query their admin user record, and upload to the blog bucket.

---

## What to Do After:

1. **Copy one of the prompts above**
2. **Go to Supabase Dashboard**
3. **Look for "AI Assistant" or "Ask AI" button**
4. **Paste the prompt**
5. **Follow the SQL recommendations it provides**
6. **Test after applying fixes**

The AI should give you specific SQL commands to fix the RLS policies!
