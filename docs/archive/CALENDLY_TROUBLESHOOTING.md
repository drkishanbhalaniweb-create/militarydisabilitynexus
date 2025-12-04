# Calendly 404 Error - Troubleshooting Guide

## The Problem
You're getting a 404 error when the Calendly modal loads. This means the URL is pointing to an event that doesn't exist.

## Current URL in Your .env
```
REACT_APP_CALENDLY_URL=https://calendly.com/dr-kishanbhalani-web/new-meeting
```

## How to Fix

### Step 1: Find Your Correct Calendly Link

1. **Log into Calendly**: https://calendly.com/login
2. **Go to Event Types**: Click on "Event Types" in the left sidebar
3. **Find or Create Your Event**:
   - Look for an existing event (like "Discovery Call", "Consultation", etc.)
   - OR create a new event type for "Discovery Call"

4. **Copy the Scheduling Link**:
   - Click on the event type
   - Look for "Copy Link" button
   - The link should look like: `https://calendly.com/YOUR-USERNAME/EVENT-NAME`

### Step 2: Common URL Formats

Calendly URLs can be in different formats:

**Personal Event:**
```
https://calendly.com/dr-kishanbhalani-web/discovery-call
https://calendly.com/dr-kishanbhalani-web/30min
https://calendly.com/dr-kishanbhalani-web/consultation
```

**Team Event (if you have a team account):**
```
https://calendly.com/teams/YOUR-TEAM/EVENT-NAME
```

**One-off Meeting:**
```
https://calendly.com/dr-kishanbhalani-web
```

### Step 3: Update Your .env File

Once you have the correct link:

1. Open `frontend/.env`
2. Update the line:
   ```
   REACT_APP_CALENDLY_URL=https://calendly.com/YOUR-CORRECT-LINK
   ```
3. Save the file
4. Restart the development server (it should auto-restart)

### Step 4: Test Again

1. Hard refresh your browser: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. Click the "Free Discovery Call" button
3. The Calendly modal should now load correctly

## Quick Test URLs

Try these common variations (replace in your .env):

```bash
# If you have a general booking page
REACT_APP_CALENDLY_URL=https://calendly.com/dr-kishanbhalani-web

# If you have a 30-minute meeting
REACT_APP_CALENDLY_URL=https://calendly.com/dr-kishanbhalani-web/30min

# If you have a 15-minute meeting
REACT_APP_CALENDLY_URL=https://calendly.com/dr-kishanbhalani-web/15min

# If you have a discovery call event
REACT_APP_CALENDLY_URL=https://calendly.com/dr-kishanbhalani-web/discovery-call
```

## Verify Your Event Exists

Open your Calendly link directly in a browser:
1. Copy your REACT_APP_CALENDLY_URL value
2. Paste it in a new browser tab
3. If you see a 404 page, the event doesn't exist
4. If you see the Calendly booking page, the URL is correct!

## Create a New Event (If Needed)

If you don't have an event set up:

1. Log into Calendly
2. Click "Create" → "Event Type"
3. Choose "One-on-One"
4. Set up your event:
   - **Name**: "Discovery Call" or "Free Consultation"
   - **Duration**: 15 or 30 minutes
   - **Location**: Phone call, Zoom, etc.
5. Click "Next" and configure availability
6. **Important**: Set "Minimum scheduling notice" to 1 day
7. Save and copy the link

## Still Having Issues?

Check the browser console (F12) for error messages. The console will show the exact URL being used and any error details.

## Need Help?

If you're still stuck:
1. Share the exact error message from the browser console
2. Verify you can access your Calendly dashboard
3. Check if your Calendly account is active
