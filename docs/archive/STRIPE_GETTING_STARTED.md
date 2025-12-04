# 🚀 Stripe Payment Integration - Getting Started

## Welcome!

Your Stripe payment integration is ready to configure. Follow this checklist to get up and running.

---

## ⏱️ Estimated Time: 30-60 minutes

---

## 📋 Pre-Flight Checklist

Before you begin, make sure you have:

- [ ] Stripe account (or ready to create one)
- [ ] Supabase project with Edge Functions enabled
- [ ] Supabase CLI installed (`npm install -g supabase`)
- [ ] Access to your deployment environment
- [ ] Admin access to your Stripe account

---

## 🎯 Step-by-Step Setup

### Step 1: Create Stripe Account (5 minutes)

1. Go to https://stripe.com
2. Click "Sign up"
3. Complete registration
4. Verify your email

**Status:** [ ] Complete

---

### Step 2: Get Stripe API Keys (2 minutes)

1. Login to Stripe Dashboard
2. Click **Developers** → **API keys**
3. Toggle to **Test mode** (top right)
4. Copy these keys:
   - Publishable key: `pk_test_...`
   - Secret key: `sk_test_...`

**Save these keys securely!**

**Status:** [ ] Complete

---

### Step 3: Configure Frontend Environment (2 minutes)

1. Open `frontend/.env` (create if doesn't exist)
2. Add this line:
   ```bash
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
   ```
3. Replace `pk_test_your_key_here` with your actual publishable key
4. Save the file

**Status:** [ ] Complete

---

### Step 4: Deploy Database Migration (3 minutes)

**Option A: Using Supabase CLI**
```bash
cd your-project
supabase db push
```

**Option B: Manual in Supabase Dashboard**
1. Go to Supabase Dashboard
2. Click **SQL Editor**
3. Open `supabase/migrations/006_payments.sql`
4. Copy and paste the SQL
5. Click **Run**

**Status:** [ ] Complete

---

### Step 5: Deploy Edge Functions (5 minutes)

```bash
# Login to Supabase
supabase login

# Link your project (if not already linked)
supabase link --project-ref your-project-ref

# Deploy create-checkout-session function
supabase functions deploy create-checkout-session

# Deploy stripe-webhook function
supabase functions deploy stripe-webhook
```

**Status:** [ ] Complete

---

### Step 6: Set Supabase Secrets (2 minutes)

```bash
# Set Stripe secret key
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_secret_key_here

# Set webhook secret (we'll get this in Step 7)
# Skip for now, we'll come back to this
```

**Status:** [ ] Complete

---

### Step 7: Configure Stripe Webhook (5 minutes)

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter webhook URL:
   ```
   https://your-project-ref.supabase.co/functions/v1/stripe-webhook
   ```
   Replace `your-project-ref` with your actual Supabase project reference
4. Click **Select events**
5. Select these events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
6. Click **Add endpoint**
7. Copy the **Signing secret** (starts with `whsec_`)
8. Run this command:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

**Status:** [ ] Complete

---

### Step 8: Test Payment Flow (10 minutes)

1. Start your frontend:
   ```bash
   cd frontend
   npm start
   ```

2. Go to a form (e.g., Aid & Attendance Form)

3. Fill out the form and submit

4. You should see the payment page

5. Click "Proceed to Payment"

6. Use test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)

7. Complete payment

8. You should be redirected to success page

9. Check Supabase database:
   ```sql
   SELECT * FROM payments ORDER BY created_at DESC LIMIT 1;
   ```

10. Verify payment status is `succeeded`

**Status:** [ ] Complete

---

### Step 9: Verify Webhook Delivery (3 minutes)

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. View **Recent deliveries**
4. You should see successful deliveries (200 status)
5. If you see failures, check:
   - Webhook URL is correct
   - Webhook secret is set correctly
   - Edge Function logs: `supabase functions logs stripe-webhook`

**Status:** [ ] Complete

---

### Step 10: Update Service Pricing (5 minutes)

1. Open `frontend/src/lib/payment.js`
2. Update the `SERVICE_PRICING` object with your actual prices:
   ```javascript
   export const SERVICE_PRICING = {
     aid_attendance: {
       name: 'Aid & Attendance Evaluation',
       basePrice: 200000, // $2,000 in cents
       rushFee: 50000,    // $500 in cents
     },
     // Update other services...
   };
   ```
3. Save the file

**Status:** [ ] Complete

---

## ✅ Verification Checklist

After completing all steps, verify:

- [ ] Frontend shows payment button
- [ ] Clicking payment button redirects to Stripe
- [ ] Test card payment succeeds
- [ ] Success page is shown
- [ ] Payment is recorded in database
- [ ] Webhook is delivered successfully
- [ ] Form submission status is updated

---

## 🎉 You're Done!

Your Stripe payment integration is now configured and ready to use in test mode.

---

## 🚀 Going to Production

When you're ready to accept real payments:

### 1. Get Live API Keys

1. Go to Stripe Dashboard
2. Toggle to **Live mode**
3. Copy live keys:
   - Publishable key: `pk_live_...`
   - Secret key: `sk_live_...`

### 2. Update Environment Variables

**Frontend:**
```bash
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key_here
```

**Supabase:**
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_your_live_secret_key_here
```

### 3. Create Production Webhook

1. Add new webhook endpoint in Stripe (live mode)
2. Use your production URL
3. Copy new webhook secret
4. Update Supabase secret:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret
   ```

### 4. Test with Real Card

Use a real credit card to test (you can refund it immediately after)

### 5. Monitor

- Watch Stripe Dashboard for transactions
- Monitor webhook delivery
- Check Supabase database
- Review Edge Function logs

---

## 📚 Need Help?

### Documentation
- **Quick Reference**: [STRIPE_QUICK_REFERENCE.md](./STRIPE_QUICK_REFERENCE.md)
- **Setup Guide**: [STRIPE_SETUP_GUIDE.md](./STRIPE_SETUP_GUIDE.md)
- **Complete Guide**: [STRIPE_INTEGRATION_COMPLETE.md](./STRIPE_INTEGRATION_COMPLETE.md)

### Common Issues

**Payment button not working?**
- Check browser console for errors
- Verify publishable key is set in `.env`
- Make sure Edge Function is deployed

**Webhook not firing?**
- Verify webhook URL is correct
- Check webhook secret matches
- View webhook logs in Stripe Dashboard

**Payment succeeds but database not updated?**
- Check webhook delivery in Stripe
- View Edge Function logs
- Verify RLS policies

### Support
- Stripe Docs: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
- Supabase Docs: https://supabase.com/docs

---

## 🎯 What's Next?

After setup is complete:

1. **Integrate into Forms**
   - Add payment flow to your forms
   - See examples in [STRIPE_INTEGRATION_COMPLETE.md](./STRIPE_INTEGRATION_COMPLETE.md)

2. **Customize**
   - Update pricing
   - Customize success page
   - Add your branding

3. **Test Thoroughly**
   - Test all payment scenarios
   - Test webhook failures
   - Test edge cases

4. **Train Your Team**
   - Show admin panel payment features
   - Explain refund process
   - Review payment reports

5. **Launch**
   - Switch to live mode
   - Monitor first transactions
   - Gather feedback

---

## 📊 Progress Tracker

- [ ] Step 1: Create Stripe Account
- [ ] Step 2: Get API Keys
- [ ] Step 3: Configure Frontend
- [ ] Step 4: Deploy Migration
- [ ] Step 5: Deploy Edge Functions
- [ ] Step 6: Set Secrets
- [ ] Step 7: Configure Webhook
- [ ] Step 8: Test Payment
- [ ] Step 9: Verify Webhook
- [ ] Step 10: Update Pricing

**Completion:** 0/10 steps

---

## 🎊 Congratulations!

Once all steps are complete, you'll have a fully functional payment system integrated with your application!

**Questions?** Review the documentation or reach out for support.

**Happy coding!** 🚀
