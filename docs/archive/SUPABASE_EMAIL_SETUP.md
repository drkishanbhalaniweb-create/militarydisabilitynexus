# Supabase Email Notifications Setup Guide

Complete step-by-step guide to set up email notifications for your Military Disability Nexus application.

## Prerequisites

- Supabase CLI installed
- Supabase project created
- Resend API key: `re_7QUxVQQy_GE93KB2nETJPqgwK2A9AN5Sd`

## Step 1: Install Supabase CLI (if not already installed)

### macOS/Linux
```bash
brew install supabase/tap/supabase
```

### Windows
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

## Step 2: Login to Supabase

```bash
supabase login
```

This will open a browser window for authentication.

## Step 3: Link Your Project

```bash
# Find your project reference ID from Supabase dashboard
# It's in the URL: https://supabase.com/dashboard/project/YOUR-PROJECT-REF

supabase link --project-ref YOUR-PROJECT-REF
```

## Step 4: Run Database Migrations

```bash
# This creates the email_logs and admin_email_settings tables
supabase db push
```

This will run:
- `003_email_notifications.sql` - Creates tables
- `004_email_triggers.sql` - Creates triggers

## Step 5: Configure Database Functions

After running migrations, you need to update the configuration functions with your actual values.

### Get Your Values First:

1. **Project URL**: Go to Settings > API > Project URL
   - Example: `https://abcdefghijklmnop.supabase.co`

2. **Service Role Key**: Go to Settings > API > Project API keys > service_role
   - Click "Reveal" to see the key
   - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Update Configuration Functions:

In Supabase Dashboard → SQL Editor, run this SQL (replace with your actual values):

```sql
-- Update Supabase URL function
CREATE OR REPLACE FUNCTION get_supabase_url()
RETURNS TEXT AS $$
BEGIN
  RETURN 'https://YOUR-ACTUAL-PROJECT-REF.supabase.co';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update Service Role Key function
CREATE OR REPLACE FUNCTION get_service_role_key()
RETURNS TEXT AS $$
BEGIN
  RETURN 'YOUR-ACTUAL-SERVICE-ROLE-KEY';
END;
$$ LANGUAGE plpgsql IMMUTABLE SECURITY DEFINER;
```

**Important:** Replace `YOUR-ACTUAL-PROJECT-REF` and `YOUR-ACTUAL-SERVICE-ROLE-KEY` with your real values!

## Step 6: Set Edge Function Secrets

```bash
# Set Resend API key
supabase secrets set RESEND_API_KEY=re_7QUxVQQy_GE93KB2nETJPqgwK2A9AN5Sd

# Set frontend URL (for admin panel links in emails)
supabase secrets set FRONTEND_URL=https://militarydisabilitynexus.com

# For local development, use:
# supabase secrets set FRONTEND_URL=http://localhost:3000

# Verify secrets are set
supabase secrets list
```

## Step 7: Deploy Edge Functions

```bash
# Deploy all functions at once
supabase functions deploy

# Or deploy individually
supabase functions deploy send-email
supabase functions deploy notify-contact-submission
supabase functions deploy notify-form-submission
```

## Step 8: Update Admin Email Settings

Update the default admin email in the database:

```sql
-- In Supabase SQL Editor, run:
UPDATE admin_email_settings 
SET admin_email = 'your-actual-admin@email.com'
WHERE admin_email = 'admin@militarydisabilitynexus.com';

-- Or insert a new admin email
INSERT INTO admin_email_settings (admin_email, notify_new_contact, notify_new_form_submission)
VALUES ('your-admin@email.com', true, true);
```

## Step 9: Verify Setup

### Check Tables Exist
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('email_logs', 'admin_email_settings');
```

### Check Triggers Exist
```sql
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE '%contact%' OR trigger_name LIKE '%form%';
```

### Check Functions Deployed
```bash
supabase functions list
```

You should see:
- send-email
- notify-contact-submission
- notify-form-submission

## Step 10: Test Email Notifications

### Test Contact Form
1. Go to your website's contact page
2. Fill out and submit the form
3. Check your email (both user and admin)
4. Check email logs:

```sql
SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 5;
```

### Test Quick Intake Form
1. Go to your website's home page
2. Fill out the Quick Intake form
3. Submit the form
4. Check emails and logs

## Troubleshooting

### Emails Not Sending

**Check Edge Function Logs:**
```bash
supabase functions logs send-email --follow
supabase functions logs notify-contact-submission --follow
```

**Check Email Logs Table:**
```sql
-- See failed emails
SELECT * FROM email_logs WHERE status = 'failed' ORDER BY created_at DESC;

-- See error messages
SELECT recipient_email, error_message, created_at 
FROM email_logs 
WHERE status = 'failed' 
ORDER BY created_at DESC;
```

**Verify Secrets:**
```bash
supabase secrets list
```

Should show:
- RESEND_API_KEY
- FRONTEND_URL

### Triggers Not Firing

**Check if triggers exist:**
```sql
SELECT * FROM pg_trigger WHERE tgname IN ('on_contact_insert', 'on_form_submission_insert');
```

**Check configuration functions:**
```sql
-- Test if functions return correct values
SELECT get_supabase_url();
SELECT get_service_role_key();

-- Should NOT return placeholder values
-- get_supabase_url should return your actual project URL
-- get_service_role_key should return your actual service role key
```

**Test trigger manually:**
```sql
-- Insert a test contact
INSERT INTO contacts (name, email, subject, message)
VALUES ('Test User', 'test@example.com', 'Test Subject', 'Test message');

-- Check if email log was created
SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 1;
```

### HTTP Extension Not Enabled

If you get an error about `net.http_post`:

```sql
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;
```

### Function URL Issues

Verify your function URLs are correct:

```sql
SELECT get_function_url('notify-contact-submission');
```

Should return: `https://YOUR-PROJECT-REF.supabase.co/functions/v1/notify-contact-submission`

## Monitoring

### View Email Delivery Stats
```sql
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM email_logs
GROUP BY status;
```

### Recent Emails
```sql
SELECT 
  recipient_email,
  email_type,
  status,
  subject,
  created_at
FROM email_logs
ORDER BY created_at DESC
LIMIT 10;
```

### Failed Emails
```sql
SELECT 
  recipient_email,
  subject,
  error_message,
  failed_at
FROM email_logs
WHERE status = 'failed'
ORDER BY failed_at DESC;
```

## Production Checklist

- [ ] Database migrations applied
- [ ] Database settings configured (supabase_url, service_role_key)
- [ ] Edge Functions deployed
- [ ] Secrets set (RESEND_API_KEY, FRONTEND_URL)
- [ ] Admin email updated in admin_email_settings
- [ ] Triggers verified and working
- [ ] Test emails sent and received
- [ ] Email logs showing 'sent' status
- [ ] Resend dashboard showing sent emails

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Edge Function logs: `supabase functions logs FUNCTION_NAME`
3. Check email_logs table for error messages
4. Verify all configuration steps were completed

## Next Steps

After email notifications are working:
- Set up Stripe payment integration
- Add more admin email addresses
- Customize email templates
- Set up email analytics
