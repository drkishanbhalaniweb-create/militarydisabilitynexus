# Payment Integration Example

## How to Add Payment to Your Forms

Here's a simple example of integrating payment into the Aid & Attendance form.

### Step 1: Import Payment Components

```javascript
import { useState } from 'react';
import PaymentWrapper from '../components/payment/PaymentWrapper';
import { contactsApi } from '../lib/api';
```

### Step 2: Add Payment Step to Your Form

```javascript
const AidAttendanceForm = () => {
  const [step, setStep] = useState('form'); // 'form' or 'payment'
  const [formSubmissionId, setFormSubmissionId] = useState(null);
  const [formData, setFormData] = useState({
    veteranName: '',
    veteranEmail: '',
    isRushService: false,
    // ... other fields
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Submit form to database
      const { data, error } = await contactsApi.submitForm({
        form_type: 'aid_attendance',
        form_data: formData,
        contact_email: formData.veteranEmail,
      });

      if (error) throw error;

      // Move to payment step
      setFormSubmissionId(data.id);
      setStep('payment');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to submit form');
    }
  };

  // Show payment wrapper after form submission
  if (step === 'payment') {
    return (
      <PaymentWrapper
        formSubmissionId={formSubmissionId}
        serviceType="aid_attendance"
        isRushService={formData.isRushService}
        customerEmail={formData.veteranEmail}
        onBack={() => setStep('form')}
      />
    );
  }

  // Show form
  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields */}
      <button type="submit">Submit & Continue to Payment</button>
    </form>
  );
};
```

### Step 3: Test the Flow

1. Fill out the form
2. Click submit
3. See payment page with pricing
4. Click "Proceed to Payment"
5. Redirected to Stripe Checkout
6. Use test card: `4242 4242 4242 4242`
7. Complete payment
8. Redirected to success page

---

## Quick Test Without Form Integration

Want to test payment immediately? Create a simple test page:

```javascript
// frontend/src/pages/TestPayment.js
import PaymentButton from '../components/payment/PaymentButton';

const TestPayment = () => {
  return (
    <div className="p-8">
      <h1>Test Payment</h1>
      <PaymentButton
        formSubmissionId="test-123"
        amount={200000} // $2,000
        serviceType="aid_attendance"
        isRushService={false}
        customerEmail="test@example.com"
      />
    </div>
  );
};

export default TestPayment;
```

Add route in App.js:
```javascript
<Route path="/test-payment" element={<TestPayment />} />
```

Then visit: `http://localhost:3000/test-payment`

---

## Test Cards

Use these Stripe test cards:

**Success:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

**Decline:**
- Card: `4000 0000 0000 0002`

**3D Secure:**
- Card: `4000 0027 6000 3184`

---

## Verify Payment in Database

After successful payment, check Supabase:

```sql
-- View all payments
SELECT * FROM payments ORDER BY created_at DESC;

-- View payment with form submission
SELECT 
  p.*,
  fs.form_type,
  fs.contact_email
FROM payments p
LEFT JOIN form_submissions fs ON fs.id = p.form_submission_id
ORDER BY p.created_at DESC;
```

---

## Check Webhook Delivery

1. Go to Stripe Dashboard
2. Click **Developers** → **Webhooks**
3. Click on your webhook endpoint
4. View **Recent deliveries**
5. Should see successful deliveries (200 status)

---

## Common Issues

### Payment button doesn't work
- Check browser console for errors
- Verify `REACT_APP_STRIPE_PUBLISHABLE_KEY` is set in `.env`
- Make sure frontend is running

### Redirects to Stripe but shows error
- Check Edge Function logs in Supabase
- Verify all secrets are set correctly
- Check that Edge Functions are deployed

### Payment succeeds but database not updated
- Check webhook delivery in Stripe Dashboard
- View Edge Function logs for `stripe-webhook`
- Verify webhook secret is correct

---

## Next Steps

1. Test payment flow
2. Verify webhook delivery
3. Check database updates
4. Integrate into your actual forms
5. Customize success page
6. Add payment status to admin panel
