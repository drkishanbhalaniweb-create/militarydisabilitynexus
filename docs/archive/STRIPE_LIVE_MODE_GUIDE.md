# Stripe Live Mode Setup Guide

## 🎯 Goal
Switch from Stripe test mode to live mode to accept real payments.

---

## 📋 Prerequisites

Before starting:
- [ ] Stripe account fully verified
- [ ] Bank account connected for payouts
- [ ] Business information complete
- [ ] All test payments working correctly

---

## 🚀 Step 1: Get Live Stripe Keys (5 minutes)

### 1.1 Log into Stripe Dashboard
- Go to https://dashboard.stripe.com
- **Toggle to "Live Mode"** (top right corner - switch from "Test" to "Live")

### 1.2 Get API Keys
1. Go to **Developers** → **API Keys**
2. Copy these keys (keep them secure!):
   - **Publishable key:** `pk_live_...`
   - **Secret key:** `sk_live_...` (click "Reveal live key")

⚠️ **IMPORTANT:** Never commit these keys to Git!

---

## 🔗 Step 2: Create Live Webhook (5 minutes)

### 2.1 Create Webhook Endpoint
1. In Stripe Dashboard (Live Mode)
2. Go to **Developers** → **Webhooks**
3. Click **"Add endpoint"**

### 2.2 Configure Webhook
**Endpoint URL:**
```
https://[your-supabase-project-ref].supabase.co/functions/v1/stripe-webhook
```

**Events to listen to:**
- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

### 2.3 Get Webhook Secret
1. After creating, click on the webhook
2. Click **"Reveal"** under "Signing secret"
3. Copy the secret: `whsec_...`

---

## 🔧 Step 3: Update Environment Variables

### 3.1 Update Frontend (.env.production)

Create or update `frontend/.env.production`:

```bash
# Supabase (same as before)
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key

# Stripe LIVE Keys
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key

# Calendly (same as before)
REACT_APP_CALENDLY_URL=https://calendly.com/your-username/discovery-call
```

### 3.2 Keep Test Keys for Development

Keep `frontend/.env` or `.env.local` with test keys:

```bash
# Use test keys for local development
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key
```

---

## 🔐 Step 4: Update Supabase Secrets (3 minutes)

### Via Supabase Dashboard:

1. Go to **Supabase Dashboard**
2. Select your project
3. Go to **Edge Functions** → **Settings** → **Secrets**
4. Update these secrets:
   - `STRIPE_SECRET_KEY` = `sk_live_your_live_key`
   - `STRIPE_WEBHOOK_SECRET` = `whsec_your_live_secret`

### Via Supabase CLI:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_your_live_key
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_live_secret
```

---

## ✅ Step 5: Test with Real Payment (5 minutes)

### 5.1 Make Test Payment
1. Use a **real credit card**
2. Make a **small payment** (e.g., $1.00)
3. Complete the checkout

### 5.2 Verify Everything Works
- [ ] Payment succeeds in Stripe Dashboard
- [ ] Webhook is delivered (check Stripe Dashboard → Webhooks)
- [ ] Payment record appears in database
- [ ] Admin panel shows payment
- [ ] Customer receives email receipt (if configured)

### 5.3 Refund Test Payment
1. Go to Stripe Dashboard → Payments
2. Find your test payment
3. Click "Refund"
4. Refund the full amount

---

## 📊 Monitoring Live Payments

### Stripe Dashboard
- **Payments:** View all transactions
- **Webhooks:** Monitor delivery success rate (should be 100%)
- **Logs:** Check for errors
- **Radar:** Monitor for fraud

### Your Admin Panel
- Go to `/admin/form-submissions`
- Check payment status for submissions
- Verify payment details are correct

---

## 🐛 Troubleshooting

### Issue: Payments fail in live mode

**Check:**
1. Live publishable key is correct in `.env.production`
2. Live secret key is set in Supabase secrets
3. Webhook secret is correct
4. Webhook endpoint URL is correct

**Solution:**
```bash
# Verify Supabase secrets
supabase secrets list

# Update if needed
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

### Issue: Webhooks not delivering

**Check:**
1. Webhook endpoint created in **Live Mode** (not test mode)
2. Webhook URL is correct
3. Events are selected correctly

**Solution:**
- Go to Stripe Dashboard → Webhooks
- Check webhook logs for errors
- Verify endpoint URL matches your Supabase project

### Issue: Test cards still being used

**Cause:** Frontend still using test publishable key

**Solution:**
1. Update `.env.production` with live key
2. Rebuild: `npm run build`
3. Redeploy to Vercel
4. Clear browser cache

---

## 🔄 Rollback Plan

If something goes wrong:

### Quick Rollback
1. Update Vercel environment variable back to test key
2. Redeploy
3. Investigate issue in test mode

### Supabase Rollback
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_test_key
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_test_your_test_secret
```

---

## 📋 Checklist

### Before Going Live
- [ ] Stripe account verified
- [ ] Bank account connected
- [ ] Test mode working perfectly
- [ ] Webhooks delivering successfully
- [ ] Error handling tested
- [ ] Refund process tested

### During Switch
- [ ] Got live API keys from Stripe
- [ ] Created live webhook endpoint
- [ ] Updated `.env.production`
- [ ] Updated Supabase secrets
- [ ] Tested with real card (small amount)
- [ ] Verified webhook delivery
- [ ] Checked database updates
- [ ] Refunded test payment

### After Switch
- [ ] Monitor first real transactions
- [ ] Check webhook delivery rate
- [ ] Verify payment success rate
- [ ] Set up alerts for failed payments
- [ ] Train team on live payment handling

---

## 💰 Cost Information

### Stripe Fees (Live Mode)
- **Transaction Fee:** 2.9% + $0.30 per successful charge
- **No monthly fees** for standard integration
- **Payout schedule:** 2-7 business days (configurable)

### Example Costs
- $100 payment = $3.20 fee, you receive $96.80
- $500 payment = $14.80 fee, you receive $485.20
- $1000 payment = $29.30 fee, you receive $970.70

---

## 🎉 Success!

Once complete, you'll have:
- ✅ Live Stripe payments working
- ✅ Real money being collected
- ✅ Webhooks delivering reliably
- ✅ Payments tracked in database
- ✅ Admin panel showing live payments

---

## 📞 Support

### Stripe Support
- Dashboard: https://dashboard.stripe.com
- Docs: https://stripe.com/docs
- Support: https://support.stripe.com
- Phone: Available for verified accounts

### Before Going Live
- Review [Stripe's Go-Live Checklist](https://stripe.com/docs/development/checklist)
- Complete business verification
- Set up bank account for payouts
- Configure payout schedule

---

**Status:** Ready to implement
**Time Required:** ~20 minutes
**Risk Level:** Low (easy to rollback)
**Next Step:** Get live API keys from Stripe
