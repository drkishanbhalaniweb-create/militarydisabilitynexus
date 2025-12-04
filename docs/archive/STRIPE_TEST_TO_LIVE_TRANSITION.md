# Stripe: Test Mode → Live Mode Transition Guide

## Current Setup: Test Mode (Sandbox) ✅

You're currently using Stripe in **test mode**, which is perfect for:
- Development and testing
- Using test credit cards
- Testing webhooks
- No real money involved
- Safe to experiment

### Test Mode Keys
- Publishable Key: `pk_test_...`
- Secret Key: `sk_test_...`
- Webhook Secret: `whsec_test_...`

---

## When to Switch to Live Mode

Switch to live mode when:
- ✅ All testing is complete
- ✅ Payment flow works perfectly
- ✅ Webhooks are delivering successfully
- ✅ You're ready to accept real payments
- ✅ Your business is verified with Stripe

**Don't rush this!** Test thoroughly in test mode first.

---

## What Changes When Going Live

### 1. API Keys Change

| Environment | Publishable Key | Secret Key | Webhook Secret |
|-------------|----------------|------------|----------------|
| **Test Mode** | `pk_test_...` | `sk_test_...` | `whsec_test_...` |
| **Live Mode** | `pk_live_...` | `sk_live_...` | `whsec_live_...` |

### 2. Test Cards Stop Working

In live mode:
- ❌ Test cards (4242 4242 4242 4242) won't work
- ✅ Only real credit cards work
- ✅ Real money is charged
- ✅ Real refunds are processed

### 3. Separate Webhook Endpoints

You'll need to create a **new webhook endpoint** in live mode with a new signing secret.

---

## Step-by-Step: Switching to Live Mode

### Phase 1: Get Live API Keys

1. **Go to Stripe Dashboard**
2. **Toggle to Live Mode** (top right corner - switch from "Test" to "Live")
3. **Go to Developers → API Keys**
4. **Copy your live keys:**
   - Publishable key: `pk_live_...`
   - Secret key: `sk_live_...` (click "Reveal test key")

⚠️ **Important:** Keep these keys secure! Never commit them to Git.

---

### Phase 2: Update Frontend Environment Variables

**Development Environment** (`frontend/.env.local` or `.env.development`):
```bash
# Keep test keys for development
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key
```

**Production Environment** (`frontend/.env.production` or deployment platform):
```bash
# Use live keys for production
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
```

**On Vercel/Netlify:**
1. Go to your project settings
2. Find "Environment Variables"
3. Update `REACT_APP_STRIPE_PUBLISHABLE_KEY` with live key
4. Redeploy your application

---

### Phase 3: Update Supabase Edge Function Secrets

**Option A: Via Supabase Dashboard**

1. Go to **Edge Functions** → **Settings** → **Secrets**
2. Update `STRIPE_SECRET_KEY`:
   - Delete old test key
   - Add new live key: `sk_live_...`
3. Keep `STRIPE_WEBHOOK_SECRET` for now (we'll update in Phase 4)

**Option B: Via Supabase CLI**

```bash
# Update to live secret key
supabase secrets set STRIPE_SECRET_KEY=sk_live_your_live_key
```

---

### Phase 4: Create Live Webhook Endpoint

1. **Go to Stripe Dashboard** (make sure you're in **Live Mode**)
2. **Go to Developers → Webhooks**
3. **Click "Add endpoint"**
4. **Enter your webhook URL:**
   ```
   https://your-project-ref.supabase.co/functions/v1/stripe-webhook
   ```
5. **Select events:**
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
6. **Click "Add endpoint"**
7. **Copy the Signing Secret** (starts with `whsec_`)
8. **Update Supabase secret:**

   **Via Dashboard:**
   - Go to Edge Functions → Settings → Secrets
   - Update `STRIPE_WEBHOOK_SECRET` with new live secret

   **Via CLI:**
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_live_secret
   ```

---

### Phase 5: Test with Real Card (Small Amount)

Before going fully live, test with a real card:

1. **Use a real credit card**
2. **Make a small test payment** (e.g., $1.00)
3. **Verify:**
   - Payment succeeds
   - Webhook is delivered
   - Database is updated
   - Email receipt is sent
4. **Refund the test payment** (in Stripe Dashboard)

---

### Phase 6: Deploy to Production

1. **Update environment variables** on your hosting platform
2. **Redeploy your frontend**
3. **Verify Edge Functions** are using live keys
4. **Test the complete flow** one more time

---

## Maintaining Both Environments

### Recommended Setup

Keep both test and live modes active:

**Development/Staging:**
- Use test mode keys
- Test webhook endpoint
- Safe to experiment

**Production:**
- Use live mode keys
- Live webhook endpoint
- Real payments only

### Environment Variable Strategy

```bash
# .env.development (local development)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...

# .env.production (production deployment)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

## Checklist: Going Live

### Before Switching

- [ ] All features tested in test mode
- [ ] Payment flow works perfectly
- [ ] Webhooks deliver successfully
- [ ] Error handling tested
- [ ] Refund process tested
- [ ] Email notifications working
- [ ] Admin panel shows payments correctly

### During Switch

- [ ] Get live API keys from Stripe
- [ ] Update frontend environment variables
- [ ] Update Supabase Edge Function secrets
- [ ] Create live webhook endpoint
- [ ] Update webhook secret in Supabase
- [ ] Test with real card (small amount)
- [ ] Verify webhook delivery
- [ ] Check database updates

### After Switch

- [ ] Monitor first real transactions
- [ ] Check Stripe Dashboard regularly
- [ ] Verify webhook delivery rate
- [ ] Review payment success rate
- [ ] Set up alerts for failed payments
- [ ] Train team on live payment handling

---

## Quick Reference: What to Update

| Item | Test Mode | Live Mode | Where to Update |
|------|-----------|-----------|-----------------|
| Frontend Key | `pk_test_...` | `pk_live_...` | `.env` or hosting platform |
| Backend Key | `sk_test_...` | `sk_live_...` | Supabase Edge Function secrets |
| Webhook Secret | `whsec_test_...` | `whsec_live_...` | Supabase Edge Function secrets |
| Webhook Endpoint | Test endpoint | New live endpoint | Stripe Dashboard |

---

## Rollback Plan

If something goes wrong after switching to live:

1. **Immediately switch back to test keys**
2. **Disable live webhook** in Stripe Dashboard
3. **Investigate the issue** in test mode
4. **Fix the problem**
5. **Test thoroughly** before switching to live again

---

## Monitoring Live Payments

### Stripe Dashboard
- **Payments:** View all transactions
- **Webhooks:** Monitor delivery success rate
- **Logs:** Check for errors
- **Radar:** Monitor for fraud

### Supabase
- **Edge Function Logs:** Check for errors
- **Database:** Query payment records
- **Alerts:** Set up for failed payments

### Your Application
- **Admin Panel:** Monitor payment status
- **Email Notifications:** Verify receipts are sent
- **Error Logs:** Track payment failures

---

## Common Issues When Switching

### Issue: Payments fail in live mode

**Causes:**
- Wrong API keys
- Webhook secret not updated
- Card declined (real card issues)

**Solution:**
- Verify all keys are live keys
- Check Stripe Dashboard for error details
- Test with different card

### Issue: Webhooks not delivering

**Causes:**
- Using test webhook secret with live payments
- Webhook endpoint not created in live mode

**Solution:**
- Create new webhook endpoint in live mode
- Update webhook secret in Supabase
- Check webhook logs in Stripe

### Issue: Test cards still being used

**Cause:**
- Frontend still using test publishable key

**Solution:**
- Update frontend environment variable
- Redeploy application
- Clear browser cache

---

## Support

### Stripe Support
- Dashboard: https://dashboard.stripe.com
- Docs: https://stripe.com/docs
- Support: https://support.stripe.com

### Before Going Live
- Review Stripe's [Go-Live Checklist](https://stripe.com/docs/development/checklist)
- Complete business verification
- Set up bank account for payouts

---

## Summary

**For Now (Test Mode):**
- ✅ Use test keys (`pk_test_...`, `sk_test_...`)
- ✅ Test thoroughly with test cards
- ✅ Perfect your payment flow
- ✅ No real money involved

**When Ready (Live Mode):**
- 🔄 Switch to live keys (`pk_live_...`, `sk_live_...`)
- 🔄 Create new webhook endpoint
- 🔄 Update all environment variables
- 🔄 Test with real card (small amount)
- 🔄 Monitor closely

**You're doing it right by starting in test mode!** Take your time to test everything thoroughly before switching to live mode.

---

**Current Status:** ✅ Test Mode (Perfect for development)

**Next Step:** Complete testing in test mode, then follow this guide when ready to go live.
