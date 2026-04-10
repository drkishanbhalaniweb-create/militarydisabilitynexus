# Supabase Edge Functions - Email Notifications

This directory contains Supabase Edge Functions for sending email notifications.

## Functions

### 1. send-email
Base function for sending emails via Resend API.

### 2. notify-contact-submission
Sends notifications when a contact form is submitted (Contact page).

### 3. notify-form-submission
Sends notifications when any service form is submitted:
- Quick Intake Form
- Aid & Attendance Form
- Any other form that uses `form_submissions` table

## Setup

### 1. Install Supabase CLI

```bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link to your project

```bash
supabase link --project-ref your-project-ref
```

### 4. Set Environment Variables

```bash
# Set Resend API key
supabase secrets set RESEND_API_KEY=YOUR_RESEND_API_KEY

# Set frontend URL (for admin panel links)
supabase secrets set FRONTEND_URL=https://militarydisabilitynexus.com

# Verify secrets
supabase secrets list
```

### 5. Deploy Functions

```bash
# Deploy all functions
supabase functions deploy

# Or deploy individually
supabase functions deploy send-email
supabase functions deploy notify-contact-submission
supabase functions deploy notify-form-submission
```

## Testing Locally

### 1. Start Supabase locally

```bash
supabase start
```

### 2. Serve functions locally

```bash
# Create .env file in supabase/functions
echo "RESEND_API_KEY=YOUR_RESEND_API_KEY" > .env
echo "FRONTEND_URL=http://localhost:3000" >> .env

# Serve a specific function
supabase functions serve send-email --env-file .env
```

### 3. Test with curl

```bash
# Test send-email function
curl -i --location --request POST 'http://localhost:54321/functions/v1/send-email' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"to":"test@example.com","subject":"Test","html":"<p>Test email</p>"}'
```

## Database Triggers

After deploying functions, you need to set up database triggers to automatically call these functions when records are inserted.

### Run the migration

```bash
# Apply the email notifications migration
supabase db push

# Or run manually in Supabase SQL Editor
```

### Trigger SQL (if not using migration)

```sql
-- Enable HTTP extension
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- Contact submission trigger
CREATE OR REPLACE FUNCTION notify_contact_submission()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://your-project-ref.supabase.co/functions/v1/notify-contact-submission',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
    ),
    body := jsonb_build_object('record', row_to_json(NEW))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_contact_insert
  AFTER INSERT ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION notify_contact_submission();

-- Form submission trigger
CREATE OR REPLACE FUNCTION notify_form_submission()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://your-project-ref.supabase.co/functions/v1/notify-form-submission',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
    ),
    body := jsonb_build_object('record', row_to_json(NEW))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_form_submission_insert
  AFTER INSERT ON form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION notify_form_submission();
```

## Monitoring

### View function logs

```bash
# View logs for a specific function
supabase functions logs send-email

# Follow logs in real-time
supabase functions logs send-email --follow
```

### Check email logs in database

```sql
-- View recent email logs
SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 10;

-- Check failed emails
SELECT * FROM email_logs WHERE status = 'failed' ORDER BY created_at DESC;

-- Email delivery rate
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM email_logs
GROUP BY status;
```

## Troubleshooting

### Function not deploying
- Make sure you're logged in: `supabase login`
- Check your project is linked: `supabase projects list`
- Verify secrets are set: `supabase secrets list`

### Emails not sending
- Check function logs: `supabase functions logs send-email`
- Verify Resend API key is correct
- Check email_logs table for error messages
- Verify admin_email_settings has active admins

### Triggers not firing
- Check if triggers exist: `SELECT * FROM pg_trigger;`
- Verify HTTP extension is enabled
- Check function URLs are correct
- Test trigger manually in SQL editor

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `RESEND_API_KEY` | Resend API key for sending emails | `re_xxx...` |
| `FRONTEND_URL` | Frontend URL for admin panel links | `https://militarydisabilitynexus.com` |
| `SUPABASE_URL` | Supabase project URL (auto-set) | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (auto-set) | `eyJ...` |

## Email Templates

Email templates are defined in the function code. To customize:

1. Edit the `generateUserConfirmationEmail()` or `generateAdminNotificationEmail()` functions
2. Redeploy the function: `supabase functions deploy notify-contact-submission`

## Rate Limiting

Resend free tier limits:
- 100 emails per day
- 3,000 emails per month

For higher volume, upgrade your Resend plan.

## Email Triggers Summary

After deployment, emails will automatically be sent when:

| Form Type | Trigger Function | User Email | Admin Email |
|-----------|-----------------|------------|-------------|
| **Contact Form** | `notify-contact-submission` | ✅ Confirmation | ✅ Notification |
| **Quick Intake** | `notify-form-submission` | ✅ Confirmation | ✅ Notification |
| **Aid & Attendance** | `notify-form-submission` | ✅ Confirmation | ✅ Notification |
| **Other Service Forms** | `notify-form-submission` | ✅ Confirmation | ✅ Notification |

**Note:** The system automatically detects which form type was submitted and customizes the email content accordingly (form type label, reference number, etc.).
