# Calendly Integration Setup Guide

## Overview
This guide will help you integrate Calendly scheduling into your Military Disability Nexus website.

## Quick Reference
**To enforce 1-day minimum notice:**
1. Log into Calendly
2. Edit your event type
3. Go to "When can people book this event?"
4. Set "Minimum scheduling notice" to **1 day** or **24 hours**
5. Save changes

## Prerequisites
- A Calendly account (free or paid)
- Your Calendly scheduling link

## Setup Steps

### 1. Create Your Calendly Event
1. Log in to your Calendly account at https://calendly.com
2. Create a new event type for "Discovery Call" or "Nexus Letter Consultation"
3. Configure the event settings:
   - Duration: 15-30 minutes (recommended for discovery calls)
   - Location: Phone call, Zoom, or your preferred method
   - Questions: Add custom questions if needed
   - Notifications: Enable email confirmations
   
4. **Set Minimum Notice Period (IMPORTANT)**:
   - In your event settings, go to "When can people book this event?"
   - Find "Minimum scheduling notice" or "Date range"
   - Set minimum notice to **1 day** (or 24 hours)
   - This ensures appointments can only be booked at least 1 day in advance
   - Example: If someone books on Monday, the earliest available slot will be Tuesday

### 2. Get Your Calendly Link
1. Go to your event type in Calendly
2. Copy the scheduling link (e.g., `https://calendly.com/your-username/discovery-call`)

### 3. Configure Environment Variables
1. Open `frontend/.env` file
2. Add your Calendly URL:
   ```
   REACT_APP_CALENDLY_URL=https://calendly.com/your-username/discovery-call
   ```
3. Save the file

### 4. Update Production Environment
For production deployment (Vercel, Railway, etc.):
1. Add the environment variable in your hosting platform:
   - Variable name: `REACT_APP_CALENDLY_URL`
   - Value: Your Calendly scheduling link

### 5. Test the Integration
1. Start your development server: `npm start`
2. Navigate to the home page
3. Click "Free Discovery Call for Nexus Letter" button
4. Verify the Calendly modal opens correctly
5. Test booking a time slot

## Features Implemented

### CalendlyModal Component
- Located at: `frontend/src/components/CalendlyModal.js`
- Uses `react-calendly` library for seamless integration
- Modal overlay with proper body scroll lock
- Clean close functionality

### Home Page Integration
- Primary CTA button opens Calendly modal
- Positioned prominently at the top of the hero section
- Styled to match your brand colors

## Customization Options

### Change Button Text
Edit `frontend/src/pages/Home.js`:
```javascript
<span className="truncate">Your Custom Button Text</span>
```

### Multiple Calendly Links
You can add different Calendly links for different services:
```javascript
// In .env
REACT_APP_CALENDLY_DISCOVERY_CALL=https://calendly.com/your-username/discovery-call
REACT_APP_CALENDLY_CONSULTATION=https://calendly.com/your-username/consultation
```

### Styling the Modal
The Calendly modal uses default styling. To customize:
1. Add custom CSS in `frontend/src/App.css`
2. Target Calendly classes (check browser inspector)

## Setting Minimum Notice Period (Detailed Steps)

### Option 1: Using "Minimum Scheduling Notice"
1. Go to your Calendly dashboard
2. Click on the event type you want to edit
3. Scroll to "When can people book this event?"
4. Look for "Minimum scheduling notice"
5. Select **1 day** from the dropdown
6. Save your changes

### Option 2: Using "Date Range"
1. In the same "When can people book this event?" section
2. Find "Date range" or "Into the future"
3. Set "Invitees can schedule starting" to **1 day into the future**
4. This prevents same-day bookings

### Option 3: Using "Buffer Time" (Alternative)
1. Go to event settings
2. Find "Buffer time" or "Time before event"
3. Set to **24 hours**
4. This adds a 24-hour buffer before any booking

## Calendly Pro Features (Optional)
If you have a paid Calendly account, you can:
- Remove Calendly branding
- Add custom colors matching your brand
- Enable SMS notifications
- Add team scheduling
- Use routing forms
- Set more granular scheduling rules

## Troubleshooting

### Modal Not Opening
- Check browser console for errors
- Verify `react-calendly` is installed: `npm list react-calendly`
- Ensure environment variable is set correctly

### Wrong Link Showing
- Clear browser cache
- Restart development server after changing .env
- Verify the URL in your .env file is correct

### Styling Issues
- Check that the modal z-index is high enough
- Verify no CSS conflicts with existing styles
- Test in different browsers

## Support
For Calendly-specific issues, visit: https://help.calendly.com
