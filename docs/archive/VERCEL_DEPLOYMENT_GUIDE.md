# Vercel Deployment Guide - New Account

## 🎯 Goal
Deploy your website to a new Vercel account with all environment variables configured.

---

## 📋 Prerequisites

- [ ] GitHub repository with your code
- [ ] Vercel account (free or pro)
- [ ] Supabase project URL and keys
- [ ] Stripe live keys (from previous guide)
- [ ] Calendly URL

---

## 🚀 Step 1: Prepare for Deployment (5 minutes)

### 1.1 Create .env.production File

Create `frontend/.env.production` with production values:

```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration (LIVE KEYS)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key

# Calendly Configuration
REACT_APP_CALENDLY_URL=https://calendly.com/your-username/discovery-call
```

⚠️ **DO NOT commit this file to Git!**

Add to `.gitignore`:
```
.env.production
.env.local
.env
```

### 1.2 Test Build Locally

```bash
cd frontend
npm run build
```

Should complete without errors.

---

## 🔗 Step 2: Connect to Vercel (5 minutes)

### 2.1 Sign Up / Log In
1. Go to https://vercel.com
2. Sign up with GitHub (recommended) or email
3. Authorize Vercel to access your repositories

### 2.2 Import Project
1. Click **"Add New..."** → **"Project"**
2. Select your GitHub repository
3. Click **"Import"**

---

## ⚙️ Step 3: Configure Project (10 minutes)

### 3.1 Framework Preset
- **Framework Preset:** Create React App
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `build`
- **Install Command:** `npm install`

### 3.2 Environment Variables

Click **"Environment Variables"** and add these:

| Name | Value | Environment |
|------|-------|-------------|
| `REACT_APP_SUPABASE_URL` | `https://your-project.supabase.co` | Production |
| `REACT_APP_SUPABASE_ANON_KEY` | `your_supabase_anon_key` | Production |
| `REACT_APP_STRIPE_PUBLISHABLE_KEY` | `pk_live_your_live_key` | Production |
| `REACT_APP_CALENDLY_URL` | `https://calendly.com/your-username/...` | Production |

**For each variable:**
1. Enter **Name**
2. Enter **Value**
3. Select **Production** (and optionally Preview/Development)
4. Click **"Add"**

### 3.3 Deploy
1. Click **"Deploy"**
2. Wait for build to complete (~2-5 minutes)
3. Should see "Congratulations!" when done

---

## 🌐 Step 4: Configure Domain (Optional, 5 minutes)

### 4.1 Use Vercel Domain
- Your site is automatically available at: `your-project.vercel.app`
- This works immediately, no configuration needed

### 4.2 Add Custom Domain (Optional)
1. Go to **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain (e.g., `yourdomain.com`)
4. Follow DNS configuration instructions
5. Wait for DNS propagation (5 minutes - 48 hours)

---

## ✅ Step 5: Verify Deployment (5 minutes)

### 5.1 Check Website
1. Visit your Vercel URL
2. Navigate through pages
3. Check that everything loads

### 5.2 Test Critical Features
- [ ] Homepage loads
- [ ] Services page works
- [ ] Blog page works
- [ ] Contact form submits
- [ ] Forms page works
- [ ] Admin login works
- [ ] Payment flow works (test with real card, small amount)

### 5.3 Check Console
1. Press F12 to open DevTools
2. Go to Console tab
3. Should see no red errors
4. Check Network tab for failed requests

---

## 🔧 Step 6: Update Stripe Webhook (5 minutes)

### 6.1 Get Your Vercel URL
- Copy your Vercel URL: `https://your-project.vercel.app`

### 6.2 Update Webhook in Stripe
1. Go to Stripe Dashboard (Live Mode)
2. Go to **Developers** → **Webhooks**
3. Click on your webhook
4. Update **Endpoint URL** if needed
5. Verify events are still selected

**Note:** The webhook URL should still point to Supabase, not Vercel:
```
https://your-project.supabase.co/functions/v1/stripe-webhook
```

---

## 📊 Step 7: Monitor Deployment (Ongoing)

### Vercel Dashboard
- **Deployments:** View all deployments
- **Analytics:** See traffic and performance
- **Logs:** Check for errors
- **Functions:** Monitor serverless functions (if any)

### Check Performance
1. Go to **Analytics** tab
2. Monitor:
   - Page load times
   - Core Web Vitals
   - Traffic sources
   - Popular pages

---

## 🔄 Step 8: Set Up Continuous Deployment

### Automatic Deployments
Vercel automatically deploys when you push to GitHub:

1. **Push to main branch** → Deploys to production
2. **Push to other branches** → Creates preview deployment
3. **Pull requests** → Creates preview deployment

### Manual Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from command line
cd frontend
vercel --prod
```

---

## 🐛 Troubleshooting

### Issue: Build fails

**Check:**
1. Build works locally: `npm run build`
2. All dependencies in `package.json`
3. No syntax errors
4. Environment variables set correctly

**Solution:**
- Check build logs in Vercel dashboard
- Fix errors locally first
- Redeploy

### Issue: Environment variables not working

**Check:**
1. Variables are set in Vercel dashboard
2. Variable names match exactly (case-sensitive)
3. Variables are set for "Production" environment

**Solution:**
1. Go to **Settings** → **Environment Variables**
2. Verify all variables are present
3. Click **"Redeploy"** after updating

### Issue: 404 errors on routes

**Cause:** React Router needs rewrites configured

**Solution:**
Your `vercel.json` already has this:
```json
{
  "rewrites": [
    {
      "source": "/:path((?!sitemap\\.xml$|robots\\.txt$).*)",
      "destination": "/index.html"
    }
  ]
}
```

If missing, add it to root directory.

### Issue: Slow performance

**Check:**
1. Lighthouse score (should be 85+)
2. Bundle size (should be < 500KB)
3. Image optimization

**Solution:**
- Phase 3 optimizations should help (already implemented)
- Enable Vercel Analytics
- Check for large dependencies

---

## 💰 Vercel Pricing

### Free Tier (Hobby)
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Preview deployments
- ✅ Analytics (basic)
- ✅ Perfect for most projects

### Pro Tier ($20/month)
- Everything in Free
- ✅ 1TB bandwidth/month
- ✅ Advanced analytics
- ✅ Password protection
- ✅ Team collaboration
- ✅ Priority support

**Recommendation:** Start with Free tier, upgrade if needed.

---

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Code pushed to GitHub
- [ ] Build works locally
- [ ] Environment variables documented
- [ ] `.env.production` created (not committed)
- [ ] All features tested locally

### During Deployment
- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] Framework preset: Create React App
- [ ] Root directory: `frontend`
- [ ] Environment variables added
- [ ] Deployment successful

### Post-Deployment
- [ ] Website accessible
- [ ] All pages load correctly
- [ ] Forms work
- [ ] Payments work
- [ ] Admin panel accessible
- [ ] No console errors
- [ ] Stripe webhook updated (if needed)
- [ ] Custom domain configured (if applicable)

---

## 🎉 Success!

Once deployed, you'll have:
- ✅ Live website on Vercel
- ✅ Automatic deployments from GitHub
- ✅ HTTPS enabled
- ✅ Global CDN
- ✅ Preview deployments for PRs
- ✅ Performance monitoring

---

## 📞 Support

### Vercel Support
- Dashboard: https://vercel.com/dashboard
- Docs: https://vercel.com/docs
- Community: https://github.com/vercel/vercel/discussions
- Support: https://vercel.com/support

### Useful Links
- [Vercel CLI Docs](https://vercel.com/docs/cli)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Custom Domains](https://vercel.com/docs/concepts/projects/domains)
- [Analytics](https://vercel.com/docs/concepts/analytics)

---

## 🔄 Next Steps

After deployment:
1. **Monitor:** Check analytics and logs
2. **Test:** Verify all features work in production
3. **Optimize:** Use Lighthouse to check performance
4. **Secure:** Set up password protection if needed (Pro tier)
5. **Scale:** Upgrade to Pro if you exceed free tier limits

---

**Status:** Ready to deploy
**Time Required:** ~30 minutes
**Cost:** Free (Hobby tier)
**Next Step:** Sign up for Vercel and import project
