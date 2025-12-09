# How to Change Claim Readiness Review Price

## Simple Steps

1. **Log in to Admin Panel**
   - Go to `/admin/login`
   - Enter your credentials

2. **Navigate to Services**
   - Click "Services" in the sidebar

3. **Edit Claim Readiness Review**
   - Find "Claim Readiness Review" in the list
   - Click the "Edit" button

4. **Update the Price**
   - Find the "Price (USD)" field
   - Change the value (e.g., from 225 to 300)
   - Click "Save Service"

5. **Done!**
   - The new price will appear everywhere automatically:
     - Service detail page "Book Now" button
     - Claim Readiness Review page title
     - Payment button
     - All other references

## Where the Price Appears

The price you set in the Services admin will automatically update in:

- ✅ `/services/claim-readiness-review` - Service detail page "Book Now" button
- ✅ `/claim-readiness-review` - Booking page header and title
- ✅ `/claim-readiness-review` - "Continue to Payment" button
- ✅ Payment page - Stripe checkout amount
- ✅ SEO meta tags

## Technical Details

- Price is stored in the `services` table, `base_price_usd` column
- The slug `claim-readiness-review` identifies this service
- All pages fetch the price dynamically from the database
- No code changes or redeployment needed

## Example

If you change the price from $225 to $300:
- Admin: Edit service → Change "Price (USD)" to 300 → Save
- Result: All pages now show $300 instead of $225
