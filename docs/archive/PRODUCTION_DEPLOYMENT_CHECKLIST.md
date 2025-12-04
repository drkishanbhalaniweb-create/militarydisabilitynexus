# Production Deployment Checklist

## 🎯 Complete Guide: Stripe Live + Vercel Deployment

This checklist combines both Stripe live mode setup and Vercel deployment.

---

## 📅 Timeline

**Total Time:** ~1 hour
- Stripe Live Mode: ~20 minutes
- Vercel Deployment: ~30 minutes
- Testing & Verification: ~10 minutes

---

## ✅ Phase 1: Stripe Live Mode (20 minutes)

### Step 1: Get Stripe Live Keys (5 min)
- [ ] Log into Stripe Dashboard
- [ ] Toggle to "Live Mode" (top right)
- [ ] Go to Developers → API Keys
- [ ] Copy Publishable Key: `pk_live_...`
- [ ] Copy Secret Key: `sk_live_...`
- [ ] **Save these securely!**

### Step 2: Create Live Webhook (5 min)
- [ ] In Stripe Dashboard (Live Mode)
- [ ] Go to Developers → Webhooks
- [ ] Click "Add endpoint"
- [ ] Enter URL: `https://[your-supabase].supabase.co/functions/v1/stripe-webhook`
- [ ] Select events:
  - `checkout.session.completed`
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
- [ ] Copy Webhook Secret: `whsec_...`

### Step 3: Update Supabase Secrets (3 min)
- [ ] Go to Supabase Dashboard
- [ ] Edge Functions → Settings → Secrets
- [ ] Update `STRIPE_SECRET_KEY` = `sk_live_...`
- [ ] Update `STRIPE_WEBHOOK_SECRET` = `whsec_...`

### Step 4: Create .env.production (2 min)
- [ ] Create `frontend/.env.production`
- [ ] Add:
  ```bash
  REACT_APP_SUPABASE_URL=https://your-project.supabase.co
  REACT_APP_SUPABASE_ANON_KEY=your_anon_key
  REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
  REACT_APP_CALENDLY_URL=https://calendly.com/your-username/...
  ```
- [ ] **DO NOT commit this file!**

### Step 5: Test Locally (5 min)
- [ ] Run `npm run build` in frontend folder
- [ ] Should complete without errors
- [ ] Check build size (should be ~135KB gzipped)

---

## ✅ Phase 2: Vercel Deployment (30 minutes)

### Step 1: Prepare Repository (5 min)
- [ ] Push all code to GitHub
- [ ] Verify `.gitignore` includes `.env.production`
- [ ] Ensure `vercel.json` is in root directory
- [ ] Verify `frontend/package.json` has all dependencies

### Step 2: Create Vercel Account (5 min)
- [ ] Go to https://vercel.com
- [ ] Sign up with GitHub
- [ ] Authorize Vercel to access repositories

### Step 3: Import Project (5 min)
- [ ] Click "Add New..." → "Project"
- [ ] Select your GitHub repository
- [ ] Click "Import"

### Step 4: Configure Build Settings (5 min)
- [ ] Framework Preset: **Create React App**
- [ ] Root Directory: **frontend**
- [ ] Build Command: **npm run build**
- [ ] Output Directory: **build**
- [ ] Install Command: **npm install**

### Step 5: Add Environment Variables (5 min)
Add these in Vercel dashboard:

- [ ] `REACT_APP_SUPABASE_URL`
- [ ] `REACT_APP_SUPABASE_ANON_KEY`
- [ ] `REACT_APP_STRIPE_PUBLISHABLE_KEY` (live key!)
- [ ] `REACT_APP_CALENDLY_URL`

**For each:** Select "Production" environment

### Step 6: Deploy (5 min)
- [ ] Click "Deploy"
- [ ] Wait for build (~2-5 minutes)
- [ ] Should see "Congratulations!"
- [ ] Copy your Vercel URL

---

## ✅ Phase 3: Testing & Verification (10 minutes)

### Test Website
- [ ] Visit your Vercel URL
- [ ] Homepage loads correctly
- [ ] Services page works
- [ ] Blog page works
- [ ] Contact form submits
- [ ] Forms page loads
- [ ] Admin login works

### Test Stripe Payment (IMPORTANT!)
- [ ] Go to a form with payment
- [ ] Use a **real credit card**
- [ ] Make a **$1.00 test payment**
- [ ] Payment should succeed
- [ ] Check Stripe Dashboard for payment
- [ ] Check webhook delivery (should be successful)
- [ ] Check database for payment record
- [ ] Check admin panel for payment
- [ ] **Refund the test payment** in Stripe Dashboard

### Check for Errors
- [ ] Open browser DevTools (F12)
- [ ] Check Console tab (should be no red errors)
- [ ] Check Network tab (no failed requests)
- [ ] Test on mobile device
- [ ] Test in different browsers

---

## 📊 Environment Variables Reference

### Development (.env or .env.local)
```bash
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key
REACT_APP_CALENDLY_URL=https://calendly.com/your-username/...
```

### Production (.env.production & Vercel)
```bash
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
REACT_APP_CALENDLY_URL=https://calendly.com/your-username/...
```

### Supabase Secrets
```bash
STRIPE_SECRET_KEY=sk_live_your_live_key
STRIPE_WEBHOOK_SECRET=whsec_your_live_secret
```

---

## 🐛 Common Issues & Solutions

### Issue: Build fails on Vercel
**Solution:**
1. Test build locally: `cd frontend && npm run build`
2. Fix any errors
3. Push to GitHub
4. Vercel will auto-redeploy

### Issue: Environment variables not working
**Solution:**
1. Go to Vercel Settings → Environment Variables
2. Verify all variables are set for "Production"
3. Click "Redeploy" after updating

### Issue: Payments fail in production
**Solution:**
1. Verify live publishable key in Vercel
2. Verify live secret key in Supabase
3. Check Stripe Dashboard for error details
4. Verify webhook is in Live Mode

### Issue: Webhook not delivering
**Solution:**
1. Check webhook URL is correct
2. Verify webhook is in Live Mode (not test)
3. Check Supabase Edge Functions are deployed
4. Verify webhook secret in Supabase matches Stripe

---

## 🔄 Rollback Plan

If something goes wrong:

### Quick Rollback
1. Go to Vercel Dashboard
2. Go to Deployments
3. Find previous working deployment
4. Click "..." → "Promote to Production"

### Stripe Rollback
1. Update Vercel env var to test key
2. Update Supabase secrets to test keys
3. Redeploy

---

## 💰 Cost Summary

### Stripe (Live Mode)
- **Transaction Fee:** 2.9% + $0.30 per charge
- **Monthly Fee:** $0
- **Payout Schedule:** 2-7 days

### Vercel (Free Tier)
- **Monthly Cost:** $0
- **Bandwidth:** 100GB/month
- **Deployments:** Unlimited
- **Upgrade to Pro:** $20/month (if needed)

### Total Monthly Cost
- **Minimum:** $0 (just Stripe transaction fees)
- **With Vercel Pro:** $20/month

---

## 📋 Final Checklist

### Before Going Live
- [ ] Stripe account fully verified
- [ ] Bank account connected for payouts
- [ ] All test payments working
- [ ] Code pushed to GitHub
- [ ] Build tested locally
- [ ] Environment variables documented

### Going Live
- [ ] Stripe live keys obtained
- [ ] Live webhook created
- [ ] Supabase secrets updated
- [ ] Vercel project created
- [ ] Environment variables added
- [ ] Deployment successful

### After Going Live
- [ ] Website accessible
- [ ] Test payment successful
- [ ] Webhook delivering
- [ ] Database updating
- [ ] Admin panel working
- [ ] No console errors
- [ ] Test payment refunded

---

## 🎉 Success Criteria

You're done when:
- ✅ Website live on Vercel
- ✅ Stripe accepting real payments
- ✅ Webhooks delivering 100%
- ✅ Database tracking payments
- ✅ Admin panel showing data
- ✅ No errors in console
- ✅ Performance score 85+

---

## 📞 Support Resources

### Stripe
- Dashboard: https://dashboard.stripe.com
- Docs: https://stripe.com/docs
- Support: https://support.stripe.com

### Vercel
- Dashboard: https://vercel.com/dashboard
- Docs: https://vercel.com/docs
- Support: https://vercel.com/support

### Supabase
- Dashboard: https://app.supabase.com
- Docs: https://supabase.com/docs
- Support: https://supabase.com/support

---

## 📚 Detailed Guides

For more details, see:
- **`STRIPE_LIVE_MODE_GUIDE.md`** - Complete Stripe setup
- **`VERCEL_DEPLOYMENT_GUIDE.md`** - Complete Vercel setup
- **`STRIPE_TEST_TO_LIVE_TRANSITION.md`** - Original transition guide

---

**Status:** Ready to deploy
**Estimated Time:** 1 hour
**Difficulty:** Easy
**Risk:** Low (easy to rollback)

**Let's go live! 🚀**
