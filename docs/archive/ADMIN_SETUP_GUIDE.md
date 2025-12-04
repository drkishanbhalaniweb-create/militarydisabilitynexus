# Admin Account Creation - Quick Setup Guide

## 🚀 5-Minute Setup

Follow these steps to enable admin account creation in your admin panel.

---

## Step 1: Run Database Migration (2 minutes)

### Via Supabase SQL Editor

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New query"

3. **Run Migration**
   - Copy entire contents of `supabase/migrations/008_admin_users.sql`
   - Paste into SQL Editor
   - Click "Run" or press Ctrl+Enter
   - Should see "Success. No rows returned"

---

## Step 2: Deploy Edge Function (2 minutes)

### Via Supabase CLI (Recommended)

```bash
# Make sure you're in the project root
cd /path/to/your/project

# Deploy the function
supabase functions deploy create-admin-user
```

### Via Supabase Dashboard (Alternative)

1. **Go to Edge Functions**
   - Click "Edge Functions" in left sidebar
   - Click "Create a new function"

2. **Configure Function**
   - Name: `create-admin-user`
   - Copy contents of `supabase/functions/create-admin-user/index.ts`
   - Paste into editor
   - Click "Deploy"

---

## Step 3: Create Initial Super Admin (1 minute)

**Important:** You need at least one super admin to create others.

### Find Your User ID

1. **Go to Authentication**
   - Click "Authentication" in left sidebar
   - Click "Users"
   - Find your email
   - Copy the UUID (user ID)

### Insert Super Admin Record

1. **Open SQL Editor**
   - Click "SQL Editor"
   - Click "New query"

2. **Run This SQL** (replace with your details)

```sql
-- Replace 'your-user-id' with the UUID from auth.users
-- Replace 'your-email@example.com' with your email
-- Replace 'Your Name' with your full name

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

3. **Verify**
   - Go to Table Editor
   - Select `admin_users` table
   - Should see your entry

---

## Step 4: Test (1 minute)

### Test Access

1. **Log into Admin Panel**
   - Go to `/admin/login`
   - Enter your credentials

2. **Check Admin Users Link**
   - Should see "Admin Users" in sidebar
   - Click it

3. **Create Test Admin**
   - Click "Create Admin" button
   - Fill in form:
     - Full Name: Test Admin
     - Email: test@example.com
     - Password: testpassword123
     - Role: Admin
   - Click "Create Admin User"
   - Should see success message

4. **Verify Creation**
   - Should see new user in list
   - Try logging in with new credentials

---

## ✅ Setup Complete!

If all steps completed successfully, you should now be able to:
- ✅ See "Admin Users" link in sidebar
- ✅ View list of admin users
- ✅ Create new admin accounts
- ✅ Activate/deactivate users
- ✅ Assign roles

---

## 🐛 Quick Troubleshooting

### "Admin Users" link not showing

**Fix:**
```sql
-- Verify you're in admin_users table
SELECT * FROM admin_users WHERE email = 'your-email@example.com';

-- If not found, insert yourself
INSERT INTO admin_users (id, email, full_name, role, is_active)
SELECT id, email, 'Your Name', 'super_admin', true
FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (id) DO NOTHING;
```

### Cannot create admin user

**Check:**
1. Edge function deployed: `supabase functions list`
2. Secrets set in Supabase Dashboard → Edge Functions → Settings
3. You are super admin in admin_users table

**Fix:**
```bash
# Redeploy function
supabase functions deploy create-admin-user

# Check logs
supabase functions logs create-admin-user
```

### New admin cannot log in

**Check:**
1. User exists in auth.users table
2. Email is confirmed
3. Account is active in admin_users table

**Fix:**
```sql
-- Check auth.users
SELECT id, email, email_confirmed_at FROM auth.users 
WHERE email = 'new-admin@example.com';

-- Check admin_users
SELECT * FROM admin_users WHERE email = 'new-admin@example.com';

-- Activate if needed
UPDATE admin_users SET is_active = true 
WHERE email = 'new-admin@example.com';
```

---

## 📋 Verification Checklist

Use this to verify everything is working:

- [ ] Migration ran successfully
- [ ] admin_users table exists
- [ ] Edge function deployed
- [ ] Initial super admin created
- [ ] Can log into admin panel
- [ ] "Admin Users" link visible
- [ ] Can view admin users list
- [ ] Can create new admin
- [ ] New admin can log in
- [ ] Activate/deactivate works

---

## 🔄 Reset/Redo

If something went wrong, you can reset:

### Remove Everything

```sql
-- Drop table (WARNING: This deletes all admin users)
DROP TABLE IF EXISTS admin_users CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS is_admin(UUID);
DROP FUNCTION IF EXISTS is_super_admin(UUID);
DROP FUNCTION IF EXISTS get_user_role(UUID);
```

### Start Over

1. Run migration again
2. Deploy edge function again
3. Create super admin again
4. Test again

---

## 📞 Need Help?

### Check These First
1. ✅ Migration ran without errors
2. ✅ Edge function deployed
3. ✅ Super admin created
4. ✅ User logged in
5. ✅ Browser console for errors

### Common Issues
- ❌ Migration not run
- ❌ Edge function not deployed
- ❌ No super admin created
- ❌ User not logged in
- ❌ RLS policies blocking access

### Get Logs

```bash
# Edge function logs
supabase functions logs create-admin-user

# Database logs
# Check in Supabase Dashboard → Logs
```

---

## 🎯 Next Steps

After setup is complete:

1. **Create Admin Accounts**
   - Create accounts for your team
   - Assign appropriate roles
   - Test each account

2. **Document Credentials**
   - Store credentials securely
   - Share with team members
   - Set up password manager

3. **Test Permissions**
   - Verify super admins can manage users
   - Verify admins can manage content
   - Verify editors have limited access

4. **Monitor Usage**
   - Check audit logs regularly
   - Monitor last login times
   - Deactivate unused accounts

---

**Setup Time:** ~5 minutes
**Difficulty:** Easy
**Prerequisites:** Supabase project, Admin access
**Status:** Ready to use!
