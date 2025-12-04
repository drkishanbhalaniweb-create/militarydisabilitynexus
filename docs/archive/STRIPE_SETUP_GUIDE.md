# Stripe Payment Integration - Setup Guide

## Overview

This guide will walk you through setting up Stripe payment processing for your VA Disability Docs application.

## Prerequisites

- Stripe account (create at https://stripe.com)
- Supabase project with Edge Functions enabled
- Access to your deployment environment

---

## Step 1: Create Stripe Account

1. Go to https://stripe.com and sign up
2. Complete business verification
3. Navigate to the Dashboard

---

## Step 2: Get Stripe API Keys

### Test Mode Keys (for development)

1. In Stripe Dashboard, click **Developers** → **API keys**
2. Toggle to **Test mode** (top right)
3. Copy the following keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

### Live Mode Keys (for production)

1. Toggle to **Live mode**
2. Copy the following keys:
   - **Publishable key** (starts with `pk_live_`)
   - **Secret key** (starts with `sk_live_`)

---

## Step 3: Configure Environment Variables

### Frontend Environment Variables

Add to `frontend/.env`:

```bash
# Stripe Configuration
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

For production, use your live publishable key.

### Supabase Edge Functions Environment Variables

You'll need to set these in your Supabase project:

1. Go to Supabase Dashboard → **Edge Functions** → **Settings**
2. Add the following secrets:

```bash
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

---

## Step 4: Deploy Supabase Edge Functions

### Install Supabase CLI

```bash
npm install -g supabase
```

### Login to Supabase

```bash
supabase login
```

### Link Your Project

```bash
supabase link --project-ref your-project-ref
```

### Deploy Functions

```bash
# Deploy create-checkout-session function
supabase functions deploy create-checkout-session

# Deploy stripe-webhook function
supabase functions deploy stripe-webhook
```

### Set Environment Variables

```bash
# Set Stripe secret key
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_key_here

# Set webhook secret (you'll get this in Step 5)
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

---

## Step 5: Configure Stripe Webhooks

### Get Your Webhook Endpoint URL

Your webhook URL will be:
```
https://your-project-ref.supabase.co/functions/v1/stripe-webhook
```

### Add Webhook in Stripe Dashboard

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL
4. Select events to listen to:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Update your Supabase secrets:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```

---

## Step 6: Run Database Migrations

Apply the payments table migration:

```bash
# Using Supabase CLI
supabase db push

# Or manually run the SQL in Supabase Dashboard
# Go to SQL Editor and run: supabase/migrations/006_payments.sql
```

---

## Step 7: Test Payment Flow

### Test Cards

Use these test cards in test mode:

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

**Declined Payment:**
- Card: `4000 0000 0000 0002`

**3D Secure Required:**
- Card: `4000 0027 6000 3184`

### Test the Flow

1. Go to your form (e.g., Aid & Attendance Form)
2. Fill out the form
3. Submit the form
4. Click "Proceed to Payment"
5. Use a test card
6. Verify redirect to success page
7. Check Supabase database for payment record

---

## Step 8: Verify Webhook Delivery

### Using Stripe CLI (Local Testing)

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local function
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger payment_intent.succeeded
```

### Check Webhook Logs

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. View **Recent deliveries**
4. Verify successful delivery (200 status)

---

## Step 9: Update Service Pricing

Edit `frontend/src/lib/payment.js` to match your actual pricing:

```javascript
export const SERVICE_PRICING = {
  aid_attendance: {
    name: 'Aid & Attendance Evaluation',
    basePrice: 200000, // $2,000 in cents
    rushFee: 50000, // $500 in cents
  },
  // ... update other services
};
```

---

## Step 10: Production Deployment

### Switch to Live Mode

1. Update frontend `.env` with live publishable key
2. Update Supabase secrets with live secret key
3. Create new webhook endpoint for production URL
4. Update webhook secret in Supabase

### Deploy

```bash
# Deploy frontend
npm run build
# Deploy to your hosting (Vercel, Netlify, etc.)

# Redeploy Edge Functions (if needed)
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
```

---

## Monitoring & Maintenance

### Monitor Payments

- Check Stripe Dashboard → **Payments** for all transactions
- View payment status in Admin Panel → **Form Submissions**
- Monitor webhook delivery success rate

### Handle Failed Payments

1. Check Stripe Dashboard for failed payments
2. Contact customer if needed
3. Resend payment link if necessary

### Refunds

To process refunds:
1. Go to Stripe Dashboard → **Payments**
2. Find the payment
3. Click **Refund**
4. Enter amount and reason
5. Confirm refund

---

## Troubleshooting

### Payment Button Not Working

- Check browser console for errors
- Verify `REACT_APP_STRIPE_PUBLISHABLE_KEY` is set
- Ensure Edge Function is deployed

### Webhook Not Receiving Events

- Verify webhook URL is correct
- Check webhook signing secret matches
- View webhook logs in Stripe Dashboard
- Check Supabase Edge Function logs

### Payment Succeeds but Database Not Updated

- Check webhook delivery in Stripe Dashboard
- View Edge Function logs in Supabase
- Verify RLS policies allow service role to insert

### Test Cards Not Working

- Ensure you're in test mode
- Check that you're using test API keys
- Try a different test card

---

## Security Checklist

- [ ] Never commit API keys to version control
- [ ] Use environment variables for all keys
- [ ] Verify webhook signatures
- [ ] Use HTTPS for all payment pages
- [ ] Enable Stripe Radar for fraud detection
- [ ] Set up alerts for suspicious activity
- [ ] Regularly review payment logs

---

## Support

### Stripe Support
- Documentation: https://stripe.com/docs
- Support: https://support.stripe.com

### Supabase Support
- Documentation: https://supabase.com/docs
- Discord: https://discord.supabase.com

---

## Next Steps

After setup is complete:

1. Test thoroughly in test mode
2. Train staff on payment workflow
3. Update terms of service with payment policy
4. Add refund policy to website
5. Set up payment analytics
6. Monitor first transactions closely

---

## Quick Reference

### Environment Variables

```bash
# Frontend
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Supabase Edge Functions
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Useful Commands

```bash
# Deploy Edge Functions
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook

# Set secrets
supabase secrets set STRIPE_SECRET_KEY=sk_test_...

# View logs
supabase functions logs stripe-webhook

# Test webhook locally
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook
```

### Test Cards

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0027 6000 3184`

---

## Status: Ready for Testing

All code is in place. Follow this guide to configure and deploy.
