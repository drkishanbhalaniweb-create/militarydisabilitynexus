# Calendly Redirect Update ✅

## Summary

All "Schedule Call" buttons across the website now redirect users to the Forms page with the Calendly widget automatically displayed.

## What Changed

### Forms Page (`/forms`)
- Added URL parameter detection (`?view=schedule`)
- When users visit `/forms?view=schedule`, the Calendly widget is automatically shown
- Users can still toggle between the form and Calendly widget
- URL updates when toggling to maintain state

### Updated Pages

All these pages now navigate to `/forms?view=schedule` instead of opening a modal:

1. **Home Page** (`/`)
   - "Free Discovery Call for Nexus Letter" button

2. **Contact Page** (`/contact`)
   - "Schedule Discovery Call" button

3. **Intake Form** (`/intake-form`)
   - "Free Discovery Call" button

## User Experience

### Before
- Click "Schedule Call" → Modal pops up → Book appointment
- Modal could be closed accidentally
- Separate experience from the rest of the site

### After
- Click "Schedule Call" → Redirected to `/forms?view=schedule`
- Calendly widget embedded in the page
- Consistent with site design
- Can toggle to form if they change their mind
- Shareable URL for direct booking

## Benefits

1. **Better UX** - Integrated experience, not a popup
2. **Shareable** - Users can bookmark or share the direct scheduling link
3. **Consistent** - All scheduling flows go to the same place
4. **Flexible** - Users can easily switch between form and scheduling

## Testing

Visit these URLs to test:
- Direct scheduling: http://localhost:3000/forms?view=schedule
- Regular form: http://localhost:3000/forms
- Click any "Schedule Call" button on the site

## Technical Details

The Forms page now:
- Reads `?view=schedule` from URL on mount
- Sets initial state based on URL parameter
- Updates URL when toggling views (using `navigate` with `replace: true`)
- Maintains clean URLs without unnecessary parameters
