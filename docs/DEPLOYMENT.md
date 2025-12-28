# Deployment Documentation

This document provides detailed instructions for deploying the Claim Readiness Diagnostic to production.

## Overview

The diagnostic is deployed as a static site with serverless functions on Vercel. The deployment process is straightforward and can be automated through GitHub integration.

## Prerequisites

Before deploying, ensure you have:

- ✅ Vercel account (free or paid)
- ✅ GitHub repository (for automatic deployments)
- ✅ Stripe account with API keys
- ✅ Calendly account with scheduling link
- ✅ Domain name (optional, Vercel provides free subdomain)

## Deployment Methods

### Method 1: Vercel CLI (Recommended for First Deploy)

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Login to Vercel

```bash
vercel login
```

#### Step 3: Deploy

From project root directory:

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

#### Step 4: Configure Environment Variables

After first deployment, add environment variables in Vercel dashboard:

1. Go to project settings
2. Navigate to "Environment Variables"
3. Add the following variables:

```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
CALENDLY_LINK=https://calendly.com/your-link/claim-readiness-review
DOMAIN=https://yourdomain.com
```

#### Step 5: Redeploy

After adding environment variables:

```bash
vercel --prod
```

### Method 2: GitHub Integration (Recommended for Continuous Deployment)

#### Step 1: Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Select the repository

#### Step 2: Configure Project

1. **Framework Preset**: Other
2. **Root Directory**: ./
3. **Build Command**: (leave empty)
4. **Output Directory**: (leave empty)
5. **Install Command**: npm install

#### Step 3: Add Environment Variables

In project settings, add all environment variables (see Method 1, Step 4).

#### Step 4: Deploy

Click "Deploy" button. Vercel will:
- Install dependencies
- Build serverless functions
- Deploy static files
- Provide deployment URL

#### Step 5: Automatic Deployments

Every push to main branch will trigger automatic deployment:
- **Production**: Pushes to `main` branch
- **Preview**: Pushes to other branches or pull requests

### Method 3: Vercel for Git

#### Step 1: Push to Git

```bash
git add .
git commit -m "Deploy diagnostic"
git push origin main
```

#### Step 2: Automatic Deployment

Vercel automatically deploys when you push to connected repository.

## Environment Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| STRIPE_SECRET_KEY | Stripe secret API key | sk_live_51... |
| STRIPE_PUBLISHABLE_KEY | Stripe publishable key | pk_live_51... |
| STRIPE_PRICE_ID | Stripe price ID for service | price_... |
| STRIPE_WEBHOOK_SECRET | Stripe webhook signing secret | whsec_... |
| CALENDLY_LINK | Calendly scheduling URL | https://calendly.com/... |
| DOMAIN | Production domain | https://yourdomain.com |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment mode | production |
| LOG_LEVEL | Logging level | info |

### Setting Environment Variables

**Via Vercel Dashboard**:
1. Project Settings → Environment Variables
2. Add each variable
3. Select environments (Production, Preview, Development)
4. Save

**Via Vercel CLI**:
```bash
vercel env add STRIPE_SECRET_KEY
# Enter value when prompted
```

**Via vercel.json** (not recommended for secrets):
```json
{
  "env": {
    "DOMAIN": "https://yourdomain.com"
  }
}
```

## Domain Configuration

### Using Vercel Subdomain

Vercel provides free subdomain:
- Format: `your-project.vercel.app`
- Automatic HTTPS
- No configuration needed

### Using Custom Domain

#### Step 1: Add Domain in Vercel

1. Project Settings → Domains
2. Enter your domain
3. Click "Add"

#### Step 2: Configure DNS

Add DNS records at your domain registrar:

**For root domain (example.com)**:
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain**:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

#### Step 3: Verify Domain

Vercel will automatically verify and provision SSL certificate.

### SSL/HTTPS

- Vercel provides automatic HTTPS
- SSL certificates auto-renewed
- HTTP automatically redirects to HTTPS

## Stripe Configuration

### Webhook Setup

#### Step 1: Create Webhook Endpoint

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter URL: `https://yourdomain.com/api/webhook`
4. Select events:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

#### Step 2: Copy Signing Secret

1. Click on webhook endpoint
2. Copy "Signing secret"
3. Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

#### Step 3: Test Webhook

```bash
stripe listen --forward-to localhost:3001/api/webhook
```

### Test Mode vs Live Mode

**Development/Staging**:
- Use test API keys (sk_test_..., pk_test_...)
- Test card: 4242 4242 4242 4242

**Production**:
- Use live API keys (sk_live_..., pk_live_...)
- Real payment processing

## Calendly Configuration

### Setup

1. Create Calendly event type for "Claim Readiness Review"
2. Copy scheduling link
3. Add to environment variables as `CALENDLY_LINK`

### Testing

Test Calendly integration:
```bash
# Open test page
open test-calendly.html
```

## Data Storage Setup

### Create Data Directory

Ensure `/data` directory exists:

```bash
mkdir -p data
echo "[]" > data/diagnostics.json
```

### Vercel Persistent Storage

**Note**: Vercel serverless functions are stateless. For persistent storage:

**Option 1: Vercel Blob Storage**
```bash
npm install @vercel/blob
```

**Option 2: External Database**
- PostgreSQL (Vercel Postgres)
- MongoDB Atlas
- Supabase

**Option 3: File Storage (Current)**
- Simple JSON file
- Works for low traffic
- Consider migration for scale

## Deployment Verification

### Automated Verification

Run verification script:

```bash
node verify-deployment.js
```

This checks:
- ✅ Homepage loads
- ✅ Diagnostic page loads
- ✅ API endpoints respond
- ✅ Stripe integration works
- ✅ Calendly integration works

### Manual Verification

1. **Homepage**: Visit `https://yourdomain.com`
2. **Diagnostic**: Complete full diagnostic flow
3. **Booking**: Test Calendly booking
4. **Payment**: Test Stripe checkout (use test card)
5. **Data Logging**: Check `/data/diagnostics.json`

### Checklist

- [ ] Homepage loads correctly
- [ ] Diagnostic intro screen displays
- [ ] All 5 questions display correctly
- [ ] Progress indicator updates
- [ ] Scoring calculates correctly
- [ ] Recommendation displays correctly
- [ ] Transparency layer shows
- [ ] CTA buttons work
- [ ] Calendly opens correctly
- [ ] Stripe checkout works
- [ ] Payment success redirects
- [ ] Data logs to backend
- [ ] localStorage persists data
- [ ] Mobile responsive
- [ ] Accessibility features work
- [ ] Performance metrics meet targets
- [ ] Cross-browser compatibility

## Monitoring

### Vercel Analytics

Enable Vercel Analytics:
1. Project Settings → Analytics
2. Enable Web Analytics
3. View metrics in dashboard

Metrics tracked:
- Page views
- Unique visitors
- Performance (Core Web Vitals)
- Top pages

### Function Logs

View serverless function logs:
1. Project → Logs
2. Filter by function name
3. View real-time logs

### Error Tracking

Consider integrating error tracking:

**Sentry**:
```bash
npm install @sentry/node @sentry/browser
```

**Configuration**:
```javascript
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});
```

### Performance Monitoring

**Lighthouse CI**:
```bash
npm install -g @lhci/cli
lhci autorun
```

**Web Vitals**:
```javascript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

## Rollback Procedure

### Rollback to Previous Deployment

**Via Vercel Dashboard**:
1. Go to Deployments
2. Find previous successful deployment
3. Click "..." menu
4. Select "Promote to Production"

**Via Vercel CLI**:
```bash
vercel rollback
```

### Emergency Rollback

If critical issue in production:
1. Immediately rollback to last known good deployment
2. Investigate issue in preview environment
3. Fix and redeploy

## Scaling Considerations

### Traffic Scaling

Vercel automatically scales:
- Serverless functions scale to zero
- Automatic scaling under load
- No configuration needed

### Database Scaling

If using file storage, consider migration when:
- Traffic > 1000 diagnostics/day
- File size > 10MB
- Query performance degrades

Migration options:
- Vercel Postgres
- MongoDB Atlas
- Supabase

### CDN and Caching

Vercel provides:
- Global CDN
- Automatic edge caching
- Cache invalidation on deploy

## Backup and Recovery

### Data Backup

**Manual Backup**:
```bash
# Download diagnostics data
vercel env pull
scp user@server:/data/diagnostics.json ./backup/
```

**Automated Backup**:
```javascript
// Add to serverless function
const backup = require('./backup');
await backup.saveToDrive(diagnostics);
```

### Recovery

**Restore from Backup**:
```bash
# Upload backup file
scp ./backup/diagnostics.json user@server:/data/
```

## Security Checklist

- [ ] Environment variables secured
- [ ] API keys not in code
- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] Input validation implemented
- [ ] Rate limiting considered
- [ ] Error messages don't expose secrets
- [ ] Webhook signatures verified
- [ ] Dependencies up to date
- [ ] Security headers configured

## Performance Optimization

### Vercel Configuration

**vercel.json**:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Asset Optimization

- Inline critical CSS
- Minimize JavaScript
- Optimize images
- Use system fonts
- Preconnect to external domains

### Function Optimization

- Keep functions lightweight
- Minimize dependencies
- Use edge functions for low latency
- Cache responses when possible

## Troubleshooting

### Common Issues

**Issue**: Environment variables not working
- **Solution**: Redeploy after adding variables

**Issue**: Webhook not receiving events
- **Solution**: Check webhook URL and signing secret

**Issue**: Calendly not loading
- **Solution**: Check CALENDLY_LINK environment variable

**Issue**: Payment failing
- **Solution**: Verify Stripe keys and price ID

**Issue**: Data not persisting
- **Solution**: Check /data directory permissions

### Debug Mode

Enable debug logging:
```javascript
// In serverless function
console.log('Debug:', { req: req.body, env: process.env });
```

View logs:
```bash
vercel logs
```

## Support

### Vercel Support

- Documentation: https://vercel.com/docs
- Support: https://vercel.com/support
- Community: https://github.com/vercel/vercel/discussions

### Stripe Support

- Documentation: https://stripe.com/docs
- Support: https://support.stripe.com

### Calendly Support

- Documentation: https://help.calendly.com
- Support: https://calendly.com/contact

## Changelog

### Version 1.0.0 (2025-12-18)
- Initial production deployment
- Integrated Stripe payment processing
- Integrated Calendly booking
- Implemented diagnostic logging
- Configured Vercel hosting

## Next Steps

After successful deployment:

1. Monitor analytics and logs
2. Gather user feedback
3. Optimize based on metrics
4. Plan feature enhancements
5. Schedule regular backups
6. Review security periodically
