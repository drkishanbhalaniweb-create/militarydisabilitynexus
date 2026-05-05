# Deploy Stripe Edge Functions - Step by Step Guide

## Option 1: Deploy via Supabase Dashboard (Easiest - No CLI needed!)

This is the simplest method and doesn't require installing the Supabase CLI.

### Step 1: Go to Supabase Dashboard

1. Open your browser and go to https://supabase.com
2. Sign in to your account
3. Select your project

### Step 2: Navigate to Edge Functions

1. In the left sidebar, click **Edge Functions**
2. Click the **Deploy new function** button

### Step 3: Deploy create-checkout-session Function

1. Click **Create a new function**
2. Function name: `create-checkout-session`
3. Copy the code from `supabase/functions/create-checkout-session/index.ts`
4. Paste it into the code editor
5. Click **Deploy function**
6. Wait for deployment to complete (usually 10-30 seconds)

### Step 4: Deploy stripe-webhook Function

1. Click **Create a new function** again
2. Function name: `stripe-webhook`
3. Copy the code from `supabase/functions/stripe-webhook/index.ts`
4. Paste it into the code editor
5. Click **Deploy function**
6. Wait for deployment to complete

### Step 5: Set Environment Secrets

1. In the Edge Functions page, click **Settings** or **Secrets**
2. Add the following secrets:

**STRIPE_SECRET_KEY**
- Click **Add new secret**
- Name: `STRIPE_SECRET_KEY`
- Value: Your Stripe secret key (starts with `sk_test_` or `sk_live_`)
- Click **Save**

**STRIPE_WEBHOOK_SECRET**
- Click **Add new secret**
- Name: `STRIPE_WEBHOOK_SECRET`
- Value: Your Stripe webhook secret (starts with `whsec_`)
- Note: You'll get this after setting up the webhook in Stripe (Step 7)
- Click **Save**

**SUPABASE_URL**
- Click **Add new secret**
- Name: `SUPABASE_URL`
- Value: Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
- Click **Save**

**SUPABASE_SERVICE_ROLE_KEY**
- Click **Add new secret**
- Name: `SUPABASE_SERVICE_ROLE_KEY`
- Value: Your Supabase service role key
- To find it: Go to **Settings** → **API** → Copy the **service_role** key
- Click **Save**

### Step 6: Verify Deployment

1. Go back to **Edge Functions**
2. You should see both functions listed:
   - `create-checkout-session`
   - `stripe-webhook`
3. Both should show status: **Active** or **Deployed**

### Step 7: Get Function URLs

Your function URLs will be:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/create-checkout-session
https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook
```

Replace `YOUR_PROJECT_REF` with your actual project reference (found in Settings → General).

---

## Option 2: Deploy via Supabase CLI (Advanced)

If you prefer using the command line, follow these steps:

### Step 1: Install Supabase CLI

**On Windows (using npm):**
```bash
npm install -g supabase
```

**On Windows (using Scoop):**
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**On macOS (using Homebrew):**
```bash
brew install supabase/tap/supabase
```

**On Linux:**
```bash
npm install -g supabase
```

### Step 2: Verify Installation

```bash
supabase --version
```

You should see the version number (e.g., `1.x.x`).

### Step 3: Login to Supabase

```bash
supabase login
```

This will open a browser window. Authorize the CLI to access your account.

### Step 4: Link Your Project

```bash
# Navigate to your project root
cd d:\baseskel-main

# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF
```

Replace `YOUR_PROJECT_REF` with your actual project reference.

To find your project reference:
1. Go to Supabase Dashboard
2. Click **Settings** → **General**
3. Copy the **Reference ID**

### Step 5: Set Secrets

```bash
# Set Stripe secret key
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_key_here

# Set Stripe webhook secret (you'll get this after Step 7)
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_secret_here

# Set Supabase URL
supabase secrets set SUPABASE_URL=https://your-project.supabase.co

# Set Supabase service role key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 6: Deploy Functions

```bash
# Deploy create-checkout-session
supabase functions deploy create-checkout-session

# Deploy stripe-webhook
supabase functions deploy stripe-webhook
```

### Step 7: Verify Deployment

```bash
# List all functions
supabase functions list
```

You should see both functions listed.

---

## Troubleshooting

### Issue: "Function not found" error

**Solution:** Make sure you're in the project root directory where the `supabase/functions` folder exists.

### Issue: "Authentication failed"

**Solution:** Run `supabase login` again and authorize the CLI.

### Issue: "Project not linked"

**Solution:** Run `supabase link --project-ref YOUR_PROJECT_REF` with your actual project reference.

### Issue: Secrets not working

**Solution:** 
1. Verify secrets are set: Go to Dashboard → Edge Functions → Settings
2. Re-deploy functions after setting secrets
3. Check function logs for errors

### Issue: Import errors in TypeScript

**Solution:** The Edge Functions use Deno, which handles imports differently. The imports in the provided code are correct for Deno.

---

## Testing Your Deployed Functions

### Test create-checkout-session

You can test this from your frontend once it's deployed. Or use curl:

```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/create-checkout-session \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "formSubmissionId": "test-uuid",
    "serviceType": "aid_attendance",
    "amount": 200000,
    "isRushService": false,
    "customerEmail": "test@example.com",
    "successUrl": "https://example.com/success",
    "cancelUrl": "https://example.com/cancel"
  }'
```

### Test stripe-webhook

This will be tested automatically when Stripe sends webhook events. You can also test using Stripe CLI:

```bash
stripe trigger checkout.session.completed
```

---

## View Function Logs

### Via Dashboard

1. Go to **Edge Functions**
2. Click on a function name
3. Click **Logs** tab
4. View real-time logs

### Via CLI

```bash
# View logs for create-checkout-session
supabase functions logs create-checkout-session

# View logs for stripe-webhook
supabase functions logs stripe-webhook

# Follow logs in real-time
supabase functions logs stripe-webhook --follow
```

---

## Next Steps

After deploying the functions:

1. ✅ Verify both functions are deployed
2. ✅ Confirm all secrets are set
3. ✅ Test the create-checkout-session function
4. ✅ Set up Stripe webhook (Step 7 in main guide)
5. ✅ Test the complete payment flow

---

## Quick Reference

### Function URLs
```
Create Checkout: https://YOUR_PROJECT_REF.supabase.co/functions/v1/create-checkout-session
Stripe Webhook:  https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook
```

### Required Secrets
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

### CLI Commands
```bash
supabase login                                    # Login
supabase link --project-ref YOUR_REF              # Link project
supabase functions deploy FUNCTION_NAME           # Deploy function
supabase functions list                           # List functions
supabase functions logs FUNCTION_NAME             # View logs
supabase secrets set KEY=value                    # Set secret
```

---

## Support

If you encounter issues:
1. Check function logs in Dashboard
2. Verify all secrets are set correctly
3. Ensure you're using the correct project reference
4. Review the Supabase Edge Functions documentation: https://supabase.com/docs/guides/functions

---

**Recommendation:** Use **Option 1 (Dashboard)** for the easiest deployment experience!
