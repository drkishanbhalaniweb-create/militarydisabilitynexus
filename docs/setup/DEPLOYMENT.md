# Deployment Guide - Vercel

## Prerequisites

- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Your code pushed to GitHub

## Step 1: Push to GitHub

If you haven't already:

```bash
git init
git add .
git commit -m "Initial commit - Medical Consulting Website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## Step 2: Deploy to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/build`
   - **Install Command**: `cd frontend && npm install`

5. Add Environment Variables:
   - Click **"Environment Variables"**
   - Add these variables:
     ```
     REACT_APP_SUPABASE_URL = https://ehwejkvlreyokfarjjeu.supabase.co
     REACT_APP_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVod2Vqa3ZscmV5b2tmYXJqamV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NDU5ODgsImV4cCI6MjA3NzQyMTk4OH0.4WefvIpkIlpe9tczAEnqADMIY5_pvQKOiuUs4EqybQg
     ```

6. Click **"Deploy"**

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? medical-consulting-website
# - Directory? ./
# - Override settings? Yes
#   - Build Command: cd frontend && npm install && npm run build
#   - Output Directory: frontend/build
#   - Development Command: cd frontend && npm start

# Add environment variables
vercel env add REACT_APP_SUPABASE_URL
vercel env add REACT_APP_SUPABASE_ANON_KEY

# Deploy to production
vercel --prod
```

## Step 3: Configure Supabase for Production

1. Go to your Supabase project settings
2. Navigate to **API** → **URL Configuration**
3. Add your Vercel domain to allowed origins:
   - `https://your-project.vercel.app`
   - `https://your-custom-domain.com` (if you have one)

## Step 4: Test Your Deployment

Visit your Vercel URL and test:
- [ ] Homepage loads
- [ ] Services page displays
- [ ] Blog page works
- [ ] Contact form submits
- [ ] File uploads work
- [ ] All navigation works

## Troubleshooting

### Build Fails

**Error: "Command failed"**
- Check that `frontend/package.json` exists
- Verify all dependencies are listed
- Check build logs for specific errors

**Solution:**
```bash
# Test build locally first
cd frontend
npm install
npm run build
```

### Environment Variables Not Working

**Error: "Missing Supabase environment variables"**
- Verify variables are added in Vercel dashboard
- Check variable names match exactly (case-sensitive)
- Redeploy after adding variables

### 404 Errors on Routes

**Error: Routes don't work after refresh**
- This is handled by `vercel.json` rewrites
- Make sure `vercel.json` is in the root directory

### CORS Errors

**Error: "CORS policy blocked"**
- Add your Vercel domain to Supabase allowed origins
- Go to Supabase → Settings → API → URL Configuration

## Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click **"Settings"** → **"Domains"**
3. Add your custom domain
4. Follow DNS configuration instructions
5. Update Supabase allowed origins with new domain

## Automatic Deployments

Vercel automatically deploys when you push to GitHub:
- **Push to `main`** → Production deployment
- **Push to other branches** → Preview deployment
- **Pull requests** → Preview deployment with unique URL

## Environment Variables for Different Environments

### Production
```env
REACT_APP_SUPABASE_URL=https://ehwejkvlreyokfarjjeu.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_production_key
```

### Preview (optional - for testing)
You can set different variables for preview deployments if needed.

## Monitoring

- **Vercel Dashboard**: View deployment logs and analytics
- **Supabase Dashboard**: Monitor database usage and API calls
- **Browser Console**: Check for any client-side errors

## Rollback

If something goes wrong:
1. Go to Vercel dashboard
2. Click **"Deployments"**
3. Find a previous working deployment
4. Click **"..."** → **"Promote to Production"**

## Performance Optimization

After deployment, consider:
- [ ] Enable Vercel Analytics
- [ ] Set up custom domain
- [ ] Configure caching headers
- [ ] Optimize images
- [ ] Enable compression

## Security Checklist

- [ ] Environment variables are set (not in code)
- [ ] Supabase RLS policies are enabled
- [ ] CORS is configured correctly
- [ ] HTTPS is enabled (automatic with Vercel)
- [ ] API keys are not exposed in client code

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Issues**: Check deployment logs in Vercel dashboard

## Next Steps

After successful deployment:
1. Test all features thoroughly
2. Set up custom domain (optional)
3. Configure analytics
4. Set up monitoring/alerts
5. Share your live site! 🎉
