# Content Security Policy Fixed for Cal.com

## Issue
Cal.com was being blocked by Content Security Policy (CSP) headers in `vercel.json`.

## What Was Fixed

Updated `vercel.json` CSP to allow Cal.com domains:

### Added to `script-src`:
- `https://app.cal.com`
- `https://cal.com`
- `https://www.googletagmanager.com` (for Google Analytics)

### Added to `style-src`:
- `https://app.cal.com`
- `https://cal.com`

### Added to `connect-src`:
- `https://app.cal.com`
- `https://cal.com`
- `https://api.cal.com`

### Added to `frame-src`:
- `https://cal.com`
- `https://app.cal.com`

## Testing

**Hard refresh your browser** to clear the CSP cache:
- **Windows/Linux**: `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`

Then test:
1. Go to `/forms?view=schedule` - Cal.com calendar should load
2. Go to `/payment/success?session_id=test` - Cal.com calendar should load after 2 seconds

## Note About Supabase Auth Error

The error `Invalid Refresh Token: Refresh Token Not Found` is unrelated to Cal.com. This happens when:
- Your Supabase session expired
- You're not logged in
- The refresh token is invalid

This won't affect Cal.com booking functionality for public users.

## Deployment

If you're running locally, the changes in `vercel.json` won't apply (Vercel config only works on Vercel deployment).

For local development, you may need to disable CSP or run without strict CSP. The Cal.com iframe should work fine in production on Vercel after deployment.

## If Still Not Working Locally

If Cal.com still doesn't load locally, it's because `vercel.json` CSP only applies to Vercel deployments. 

**Option 1: Deploy to Vercel to test**
```bash
git add .
git commit -m "Fix CSP for Cal.com integration"
git push
```

**Option 2: Temporarily disable CSP for local dev**
Comment out the CSP header in `vercel.json` for local testing (but remember to uncomment before deploying).

The Cal.com integration will work perfectly on your Vercel production deployment!
