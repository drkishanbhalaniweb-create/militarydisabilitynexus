# How to Get Your Stripe Webhook Secret

## Step-by-Step Guide

### Step 1: Get Your Supabase Function URL

First, you need your webhook URL. It follows this format:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook
```

**To find YOUR_PROJECT_REF:**
1. Go to your Supabase Dashboard
2. Click **Settings** (gear icon in sidebar)
3. Click **General**
4. Look for **Reference ID** - this is your project ref
5. Your webhook URL will be:
   ```
   https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook
   ```

**Example:**
If your project ref is `abcdefghijklmnop`, your URL is:
```
https://abcdefghijklmnop.supabase.co/functions/v1/stripe-webhook
```

---

### Step 2: Create Webhook Endpoint in Stripe

1. **Go to Stripe Dashboard**
   - Open https://dashboard.stripe.com
   - Make sure you're in **Test mode** (toggle in top right)

2. **Navigate to Webhooks**
   - Click **Developers** in the top menu
   - Click **Webhooks** in the left sidebar

3. **Add Endpoint**
   - Click the **"Add endpoint"** button (or "+ Add an endpoint")

4. **Enter Endpoint URL**
   - Paste your Supabase function URL:
     ```
     https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook
     ```
   - Replace `YOUR_PROJECT_REF` with your actual project reference

5. **Add Description (Optional)**
   - Description: "Payment webhook for VA Disability Docs"

6. **Select Events to Listen To**
   - Click **"Select events"** button
   - Search for and select these 3 events:
     - ✅ `checkout.session.completed`
     - ✅ `payment_intent.succeeded`
     - ✅ `payment_intent.payment_failed`
   
   **Or use "Select all" shortcuts:**
   - Expand **Checkout** section → Check `checkout.session.completed`
   - Expand **Payment Intent** section → Check `payment_intent.succeeded` and `payment_intent.payment_failed`

7. **Click "Add endpoint"**

---

### Step 3: Get the Signing Secret

After creating the endpoint, you'll see the webhook details page.

1. **Find the Signing Secret**
   - Look for **"Signing secret"** section
   - It will show: `whsec_••••••••••••••••••••••••••••••••`

2. **Click "Reveal"** or the eye icon to show the full secret

3. **Copy the Secret**
   - It starts with `whsec_`
   - Example: `whsec_1234567890abcdefghijklmnopqrstuvwxyz`
   - **Copy this entire string**

---

### Step 4: Add Secret to Supabase

**Option A: Via Supabase Dashboard**

1. Go to your Supabase Dashboard
2. Click **Edge Functions** in the sidebar
3. Click **Settings** or **Secrets** tab
4. Click **"Add new secret"**
5. Name: `STRIPE_WEBHOOK_SECRET`
6. Value: Paste the webhook secret (starts with `whsec_`)
7. Click **Save** or **Add**

**Option B: Via Supabase CLI** (if you have it installed)

```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

---

### Step 5: Verify Setup

1. **In Stripe Dashboard:**
   - Go to **Developers** → **Webhooks**
   - You should see your endpoint listed
   - Status should be **"Enabled"**

2. **In Supabase Dashboard:**
   - Go to **Edge Functions** → **Settings** → **Secrets**
   - You should see `STRIPE_WEBHOOK_SECRET` listed

---

## Visual Guide

### What You'll See in Stripe:

```
┌─────────────────────────────────────────────────────┐
│ Add endpoint                                         │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Endpoint URL *                                       │
│ ┌─────────────────────────────────────────────────┐ │
│ │ https://xxxxx.supabase.co/functions/v1/stripe-  │ │
│ │ webhook                                          │ │
│ └─────────────────────────────────────────────────┘ │
│                                                      │
│ Description (optional)                               │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Payment webhook                                  │ │
│ └─────────────────────────────────────────────────┘ │
│                                                      │
│ Events to send                                       │
│ ┌─────────────────────────────────────────────────┐ │
│ │ [Select events]                                  │ │
│ └─────────────────────────────────────────────────┘ │
│                                                      │
│ ☑ checkout.session.completed                        │
│ ☑ payment_intent.succeeded                          │
│ ☑ payment_intent.payment_failed                     │
│                                                      │
│                          [Add endpoint]              │
└─────────────────────────────────────────────────────┘
```

### After Creating, You'll See:

```
┌─────────────────────────────────────────────────────┐
│ Webhook endpoint details                             │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Signing secret                                       │
│ whsec_•••••••••••••••••••••••••••••••  [Reveal]     │
│                                                      │
│ Click "Reveal" to see the full secret               │
└─────────────────────────────────────────────────────┘
```

---

## Troubleshooting

### Can't Find Webhooks Section

**Solution:** 
- Make sure you're logged into Stripe Dashboard
- Click **Developers** in the top navigation
- Look for **Webhooks** in the left sidebar

### Don't Know My Supabase Project Ref

**Solution:**
1. Go to Supabase Dashboard
2. Settings → General
3. Copy the **Reference ID**

### Webhook Secret Not Showing

**Solution:**
- Make sure you clicked "Add endpoint" first
- The secret only appears AFTER creating the endpoint
- Click "Reveal" or the eye icon to see it

### Already Created Endpoint, Lost Secret

**Solution:**
1. Go to Developers → Webhooks
2. Click on your endpoint
3. Click "Roll signing secret" to generate a new one
4. Copy the new secret
5. Update it in Supabase

---

## Quick Checklist

- [ ] Found my Supabase project reference ID
- [ ] Constructed webhook URL: `https://[PROJECT_REF].supabase.co/functions/v1/stripe-webhook`
- [ ] Logged into Stripe Dashboard (Test mode)
- [ ] Went to Developers → Webhooks
- [ ] Clicked "Add endpoint"
- [ ] Entered webhook URL
- [ ] Selected 3 events (checkout.session.completed, payment_intent.succeeded, payment_intent.payment_failed)
- [ ] Clicked "Add endpoint"
- [ ] Clicked "Reveal" on signing secret
- [ ] Copied the secret (starts with `whsec_`)
- [ ] Added secret to Supabase (Edge Functions → Settings → Secrets)
- [ ] Named it `STRIPE_WEBHOOK_SECRET`
- [ ] Saved the secret

---

## What's Next?

After adding the webhook secret:

1. ✅ Your Edge Functions are now fully configured
2. ✅ Stripe can send webhook events to your application
3. ✅ Payment status will update automatically
4. ✅ Ready to test the payment flow!

---

## Need Help?

If you get stuck:
1. Double-check your webhook URL is correct
2. Make sure you're in Test mode in Stripe
3. Verify the secret starts with `whsec_`
4. Check that all 3 events are selected
5. Ensure the secret is saved in Supabase

---

**You're almost done!** Once you add the webhook secret, your Stripe integration will be fully configured. 🎉
