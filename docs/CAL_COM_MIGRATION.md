# Cal.com Migration Guide

This document outlines the migration from Calendly to Cal.com for appointment scheduling.

## What Changed

### Files Updated

1. **`frontend/src/hooks/useCalendly.js`**
   - Renamed functions and variables from Calendly to Cal
   - Updated to use `REACT_APP_CAL_URL` environment variable
   - Maintained backward compatibility with `useCalendly` export

2. **`frontend/src/pages/PaymentSuccess.js`**
   - Replaced Calendly embed script with Cal.com embed script
   - Updated widget implementation to use Cal.com's `data-cal-link` attribute
   - Changed script source from `calendly.com` to `app.cal.com/embed/embed.js`

3. **`frontend/src/pages/Forms.js`**
   - Updated toggle state from `showCalendly` to `showCal`
   - Replaced Calendly widget with Cal.com inline embed
   - Updated script loading to use Cal.com embed script

4. **`frontend/src/pages/TermsAndConditions.js`**
   - Updated third-party services mention from Calendly to Cal.com

5. **`frontend/.env.example`**
   - Changed `REACT_APP_CALENDLY_URL` to `REACT_APP_CAL_URL`

6. **`frontend/package.json`**
   - Removed `react-calendly` dependency (no longer needed)

## Setup Instructions

### 1. Set Up Cal.com Account

1. Create an account at [cal.com](https://cal.com)
2. Create your event types (e.g., "Consultation", "Discovery Call")
3. Get your booking links for each event type

### 2. Update Environment Variables

Update your `.env` files with your Cal.com URLs:

```bash
# .env.local (for local development)
REACT_APP_CAL_URL_DISCOVERY=https://cal.com/mdnexus-lkd3ut/discovery-call
REACT_APP_CAL_URL_CONSULTATION=https://cal.com/mdnexus-lkd3ut/claim-readiness-review

# .env.production (for production)
REACT_APP_CAL_URL_DISCOVERY=https://cal.com/mdnexus-lkd3ut/discovery-call
REACT_APP_CAL_URL_CONSULTATION=https://cal.com/mdnexus-lkd3ut/claim-readiness-review
```

**Two separate event types:**
- `REACT_APP_CAL_URL_DISCOVERY` - Used for free discovery calls (Forms page)
- `REACT_APP_CAL_URL_CONSULTATION` - Used for post-payment consultations (PaymentSuccess page)

### 3. Install Dependencies

Since we removed `react-calendly`, run:

```bash
cd frontend
npm install
```

This will update your `package-lock.json` to remove the unused dependency.

### 4. Test the Integration

1. Start your development server
2. Navigate to `/payment/success?session_id=test` to test the post-payment booking
3. Navigate to `/forms?view=schedule` to test the discovery call scheduling
4. Verify the Cal.com widget loads correctly in both locations

## Cal.com Widget Configuration

The Cal.com widget is configured with:

```javascript
data-cal-link={calUrl}
data-cal-config='{"layout":"month_view"}'
```

You can customize the widget by modifying the `data-cal-config` attribute. See [Cal.com embed documentation](https://cal.com/docs/integrations/embed) for more options.

## Key Differences from Calendly

### Embed Script
- **Calendly**: `https://assets.calendly.com/assets/external/widget.js`
- **Cal.com**: `https://app.cal.com/embed/embed.js`

### Widget Implementation
- **Calendly**: Uses `className="calendly-inline-widget"` with `data-url`
- **Cal.com**: Uses `data-cal-link` attribute with optional `data-cal-config`

### Styling
- Cal.com widgets are more customizable and support dark mode
- The widget automatically adapts to your site's styling

## Troubleshooting

### Widget Not Loading
- Check browser console for script loading errors
- Verify your Cal.com URL is correct and publicly accessible
- Ensure the Cal.com embed script is loaded before the widget renders

### Environment Variable Not Working
- Make sure you restart your development server after changing `.env` files
- Verify the variable name is `REACT_APP_CAL_URL` (must start with `REACT_APP_`)
- Check that the `.env` file is in the `frontend/` directory

### Widget Shows Wrong Event
- Double-check the URL in your environment variable
- Each event type in Cal.com has its own unique URL

## Benefits of Cal.com

1. **Open Source**: Cal.com is open-source and can be self-hosted
2. **More Affordable**: Generally lower pricing than Calendly
3. **Better Customization**: More control over appearance and behavior
4. **Privacy**: Option to self-host for complete data control
5. **Modern UI**: Cleaner, more modern interface

## Rollback Instructions

If you need to rollback to Calendly:

1. Restore the original files from git:
   ```bash
   git checkout HEAD -- frontend/src/hooks/useCalendly.js
   git checkout HEAD -- frontend/src/pages/PaymentSuccess.js
   git checkout HEAD -- frontend/src/pages/Forms.js
   git checkout HEAD -- frontend/package.json
   ```

2. Reinstall dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Update your `.env` files to use `REACT_APP_CALENDLY_URL`

## Next Steps

After providing your Cal.com event URLs:
1. Update the environment variables in all deployment environments
2. Test thoroughly in staging before deploying to production
3. Monitor for any booking issues in the first few days
4. Update any documentation or training materials that reference Calendly
