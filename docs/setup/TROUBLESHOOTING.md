# Troubleshooting Guide

## Admin Panel 403 Error - Quick Fix

### The Problem
Getting "403 Forbidden" error when trying to deactivate/activate services in admin panel.

### The Solution (3 Steps)

#### Step 1: Run the Setup Script
1. Open https://supabase.com/dashboard
2. Go to SQL Editor
3. Copy **ALL** of `supabase/STEP_BY_STEP_SETUP.sql`
4. Paste and click Run

#### Step 2: Refresh Your Login
1. Go to http://localhost:3000/admin
2. Log out
3. Log back in

#### Step 3: Test
1. Try toggling a service active/inactive
2. Should work now!

---

## Common Errors

### "relation 'form_submissions' already exists"
✅ **This is OK!** The table already exists. Script continues.

### "policy already exists"
✅ **This is OK!** The policy already exists. Script continues.

### "permission denied"
❌ **Action needed:**
- Make sure you're the Supabase project owner
- Check you're in the correct project
- Try logging out and back into Supabase dashboard

### Still getting 403?
Try these in order:

1. **Clear browser cache**
   - Ctrl+Shift+Delete
   - Clear everything
   - Restart browser

2. **Check you're logged in**
   - Open DevTools (F12)
   - Application > Local Storage
   - Look for `sb-*-auth-token`
   - If missing, log in again

3. **Verify policies exist**
   Run in Supabase SQL Editor:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'services';
   ```
   Should see at least 2 policies (public + authenticated)

4. **Check your .env file**
   ```
   REACT_APP_SUPABASE_URL=https://your-project.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key
   ```

---

## Form Submission Errors

### "Cannot read property 'submit' of undefined"
**Fix:** Make sure you ran the database migration:
```sql
-- Run: supabase/STEP_BY_STEP_SETUP.sql
```

### "File upload failed"
**Fix:** Check storage bucket exists:
1. Supabase Dashboard > Storage
2. Should see `medical-documents` bucket
3. If missing, run setup script again

---

## App Won't Start

### "Module not found"
```bash
cd frontend
npm install
npm start
```

### "Port 3000 already in use"
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Then restart
npm start
```

---

## Quick Verification Commands

### Check if tables exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

### Check if policies exist
```sql
SELECT tablename, policyname, roles
FROM pg_policies
WHERE tablename IN ('services', 'contacts', 'form_submissions')
ORDER BY tablename, policyname;
```

### Check storage buckets
```sql
SELECT id, name, public 
FROM storage.buckets;
```

---

## Still Stuck?

1. Check browser console (F12) for errors
2. Check Supabase Dashboard > Logs
3. Make sure dev server is running: `npm start` in frontend folder
4. Try the setup script one more time
5. Restart your browser completely

---

## Success Checklist

Everything is working when:

- [ ] No errors in Supabase SQL Editor
- [ ] Can log into admin panel
- [ ] Can toggle service active/inactive
- [ ] Can submit forms from homepage
- [ ] Can upload files
- [ ] No 403 errors in console
