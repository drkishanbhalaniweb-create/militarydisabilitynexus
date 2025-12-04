# Stripe Integration - Quick Reference

## 🔑 Environment Variables

```bash
# Frontend (.env)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Supabase Edge Functions (via CLI)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 🚀 Deployment Commands

```bash
# Deploy Edge Functions
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook

# Set Secrets
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...

# Run Migration
supabase db push
```

## 💳 Test Cards

| Purpose | Card Number | Result |
|---------|-------------|--------|
| Success | 4242 4242 4242 4242 | Payment succeeds |
| Decline | 4000 0000 0000 0002 | Payment declined |
| 3D Secure | 4000 0027 6000 3184 | Requires authentication |

**All test cards:**
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

## 📦 Import Statements

```javascript
// Payment API
import { paymentApi, SERVICE_PRICING, calculatePrice, formatPrice } from '../lib/payment';

// Components
import PaymentButton from '../components/payment/PaymentButton';
import PricingDisplay from '../components/payment/PricingDisplay';
import PaymentWrapper from '../components/payment/PaymentWrapper';

// Admin Components
import PaymentDetails from '../components/admin/PaymentDetails';
import PaymentStatusBadge from '../components/admin/PaymentStatusBadge';
```

## 🎯 Common Use Cases

### Create Checkout Session

```javascript
const { url } = await paymentApi.createCheckoutSession({
  formSubmissionId: 'uuid',
  serviceType: 'aid_attendance',
  amount: 200000, // $2,000 in cents
  isRushService: false,
  customerEmail: 'user@example.com',
  successUrl: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
  cancelUrl: `${window.location.origin}/payment/canceled`,
});

window.location.href = url;
```

### Get Payment Status

```javascript
const payment = await paymentApi.getPaymentStatus(formSubmissionId);
console.log(payment.status); // 'pending', 'succeeded', 'failed', etc.
```

### Calculate Price

```javascript
const total = calculatePrice('aid_attendance', true); // with rush
console.log(formatPrice(total)); // "$2,500.00"
```

### Display Payment Button

```jsx
<PaymentButton
  formSubmissionId="uuid"
  amount={200000}
  serviceType="aid_attendance"
  isRushService={false}
  customerEmail="user@example.com"
/>
```

## 🗄️ Database Queries

### Get All Payments

```sql
SELECT * FROM payments ORDER BY created_at DESC;
```

### Get Payments by Status

```sql
SELECT * FROM payments WHERE status = 'succeeded';
```

### Get Form Submission with Payment

```sql
SELECT 
  fs.*,
  p.amount,
  p.status as payment_status,
  p.paid_at
FROM form_submissions fs
LEFT JOIN payments p ON p.form_submission_id = fs.id
WHERE fs.id = 'uuid';
```

### Get Payment Revenue

```sql
SELECT 
  COUNT(*) as total_payments,
  SUM(amount) as total_revenue,
  AVG(amount) as avg_payment
FROM payments
WHERE status = 'succeeded';
```

## 🔗 Webhook Events

| Event | Description | Action |
|-------|-------------|--------|
| `checkout.session.completed` | Checkout completed | Update status to 'processing' |
| `payment_intent.succeeded` | Payment succeeded | Update status to 'succeeded' |
| `payment_intent.payment_failed` | Payment failed | Update status to 'failed' |

## 💰 Service Pricing

```javascript
// Edit in: frontend/src/lib/payment.js
export const SERVICE_PRICING = {
  aid_attendance: {
    name: 'Aid & Attendance Evaluation',
    basePrice: 200000, // $2,000
    rushFee: 50000,    // $500
  },
  nexus_letter: {
    name: 'Nexus Letter',
    basePrice: 150000, // $1,500
    rushFee: 50000,    // $500
  },
};
```

## 🔍 Debugging

### Check Edge Function Logs

```bash
supabase functions logs stripe-webhook
supabase functions logs create-checkout-session
```

### Test Webhook Locally

```bash
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook
stripe trigger checkout.session.completed
```

### View Stripe Dashboard

- Payments: https://dashboard.stripe.com/payments
- Webhooks: https://dashboard.stripe.com/webhooks
- Logs: https://dashboard.stripe.com/logs

## 📊 Payment Status Flow

```
pending → processing → succeeded
                    ↘ failed
                    ↘ canceled
                    ↘ refunded
```

## 🎨 Status Badge Colors

| Status | Color | Icon |
|--------|-------|------|
| paid | Green | CheckCircle |
| pending | Yellow | Clock |
| unpaid | Gray | DollarSign |
| failed | Red | XCircle |
| refunded | Purple | RefreshCw |

## 🔐 Security Checklist

- [ ] Never commit API keys
- [ ] Use environment variables
- [ ] Verify webhook signatures
- [ ] Use HTTPS only
- [ ] Enable Stripe Radar
- [ ] Set up RLS policies
- [ ] Use service role for webhooks

## 📱 Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/payment/success` | PaymentSuccess | Show after successful payment |
| `/payment/canceled` | PaymentCanceled | Show when payment canceled |

## 🛠️ Useful Functions

```javascript
// Format price
formatPrice(200000) // "$2,000.00"

// Calculate total
calculatePrice('aid_attendance', true) // 250000 (with rush)

// Get service info
SERVICE_PRICING['aid_attendance'].name // "Aid & Attendance Evaluation"
```

## 📞 Support Links

- Stripe Docs: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
- Supabase Docs: https://supabase.com/docs
- Test Cards: https://stripe.com/docs/testing

## ⚡ Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Button not working | Check publishable key in .env |
| Webhook not firing | Verify webhook URL and secret |
| Payment not updating | Check Edge Function logs |
| Test card declined | Use 4242 4242 4242 4242 |

---

**Need more details?** See [STRIPE_INTEGRATION_COMPLETE.md](./STRIPE_INTEGRATION_COMPLETE.md)
