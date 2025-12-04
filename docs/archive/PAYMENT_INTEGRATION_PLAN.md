# Payment Integration Plan (Future Implementation)

## Overview
This document outlines the plan for integrating payment processing into the VA Disability Docs platform. This is NOT currently implemented but should be considered for future development.

---

## Payment Provider Options

### Recommended: Stripe
**Pros:**
- Industry standard for healthcare/medical services
- Excellent documentation and React integration
- PCI compliance handled by Stripe
- Supports subscriptions, one-time payments, and invoicing
- Strong fraud protection
- Easy refund management
- Detailed reporting and analytics

**Cons:**
- 2.9% + $0.30 per transaction
- Requires business verification

### Alternative: Square
**Pros:**
- Simple setup
- Good for small businesses
- Integrated invoicing

**Cons:**
- Less flexible for custom workflows
- Similar pricing to Stripe

### Alternative: PayPal
**Pros:**
- Widely recognized
- Easy for customers

**Cons:**
- Less developer-friendly
- Higher dispute rates

---

## Implementation Architecture

### Database Changes Needed

#### 1. New Tables

```sql
-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  amount_usd DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) NOT NULL, -- pending, completed, failed, refunded
  payment_method VARCHAR(50), -- card, bank_transfer, etc.
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  metadata JSONB, -- Store additional payment details
  paid_at TIMESTAMP,
  refunded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  amount_usd DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL, -- draft, sent, paid, overdue, cancelled
  due_date DATE,
  paid_date DATE,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  notes TEXT,
  line_items JSONB, -- Array of services/items
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add payment status to contacts
ALTER TABLE contacts 
ADD COLUMN payment_status VARCHAR(50) DEFAULT 'unpaid',
ADD COLUMN total_paid_usd DECIMAL(10, 2) DEFAULT 0;
```

#### 2. Update Existing Tables

```sql
-- Add payment-related fields to services
ALTER TABLE services
ADD COLUMN stripe_price_id VARCHAR(255),
ADD COLUMN requires_payment BOOLEAN DEFAULT true,
ADD COLUMN deposit_percentage INTEGER DEFAULT 0; -- For partial payments

-- Add payment tracking to contacts
ALTER TABLE contacts
ADD COLUMN stripe_customer_id VARCHAR(255),
ADD COLUMN preferred_payment_method VARCHAR(50);
```

### Backend API Endpoints

```javascript
// Payment endpoints
POST   /api/payments/create-intent          // Create Stripe payment intent
POST   /api/payments/confirm                // Confirm payment
GET    /api/payments/:id                    // Get payment details
POST   /api/payments/:id/refund             // Process refund
GET    /api/payments/contact/:contactId     // Get all payments for contact

// Invoice endpoints
POST   /api/invoices                        // Create invoice
GET    /api/invoices/:id                    // Get invoice
PUT    /api/invoices/:id                    // Update invoice
POST   /api/invoices/:id/send               // Send invoice via email
GET    /api/invoices/contact/:contactId     // Get all invoices for contact

// Webhook endpoint
POST   /api/webhooks/stripe                 // Handle Stripe webhooks
```

### Frontend Components Needed

```
frontend/src/
├── components/
│   ├── payment/
│   │   ├── PaymentForm.js              // Stripe Elements form
│   │   ├── PaymentStatus.js            // Show payment status
│   │   ├── InvoicePreview.js           // Display invoice
│   │   └── RefundModal.js              // Admin refund interface
│   └── checkout/
│       ├── CheckoutFlow.js             // Multi-step checkout
│       ├── OrderSummary.js             // Cart/order summary
│       └── PaymentSuccess.js           // Success page
├── pages/
│   ├── Checkout.js                     // Main checkout page
│   ├── PaymentSuccess.js               // Post-payment success
│   ├── PaymentFailed.js                // Payment failure handling
│   └── admin/
│       ├── Payments.js                 // Admin payment management
│       └── Invoices.js                 // Admin invoice management
└── lib/
    └── stripe.js                       // Stripe configuration
```

---

## User Flow

### Customer Journey

1. **Service Selection**
   - Browse services
   - Click "Book Now" or "Get Started"
   - Redirected to contact form or checkout

2. **Contact Information**
   - Fill out contact form (if not already done)
   - Select service
   - Review pricing

3. **Checkout**
   - Review order summary
   - Enter payment information (Stripe Elements)
   - Apply discount code (optional)
   - Agree to terms
   - Submit payment

4. **Payment Processing**
   - Show loading state
   - Stripe processes payment
   - Webhook confirms payment

5. **Confirmation**
   - Success page with order details
   - Email confirmation sent
   - Admin notified

### Admin Journey

1. **Payment Management**
   - View all payments in admin dashboard
   - Filter by status, date, service
   - Search by customer name/email
   - Export payment reports

2. **Invoice Management**
   - Create manual invoices
   - Send invoices via email
   - Track payment status
   - Mark as paid manually

3. **Refund Processing**
   - View payment details
   - Process full or partial refund
   - Add refund reason/notes
   - Customer notified automatically

---

## Security Considerations

### PCI Compliance
- **Never store credit card numbers** - Use Stripe Elements
- All payment data handled by Stripe
- Only store Stripe customer/payment IDs
- Use HTTPS for all payment pages

### Data Protection
- Encrypt sensitive payment metadata
- Implement rate limiting on payment endpoints
- Log all payment attempts for audit trail
- Require authentication for payment history access

### Fraud Prevention
- Implement Stripe Radar for fraud detection
- Require email verification before payment
- Set up alerts for suspicious activity
- Implement 3D Secure for high-value transactions

---

## Integration Steps (When Ready)

### Phase 1: Setup (Week 1)
1. Create Stripe account
2. Get API keys (test and live)
3. Install Stripe libraries
   ```bash
   npm install @stripe/stripe-js @stripe/react-stripe-js
   ```
4. Set up environment variables
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Phase 2: Database (Week 1)
1. Run payment migration scripts
2. Update Supabase RLS policies
3. Create indexes for performance
4. Test with sample data

### Phase 3: Backend (Week 2)
1. Create payment API endpoints
2. Implement Stripe webhook handler
3. Add payment validation
4. Set up email notifications
5. Test with Stripe test cards

### Phase 4: Frontend (Week 2-3)
1. Create checkout flow
2. Integrate Stripe Elements
3. Build payment success/failure pages
4. Add payment history to user dashboard
5. Create admin payment management UI

### Phase 5: Testing (Week 3)
1. Test with Stripe test cards
2. Test webhook handling
3. Test refund process
4. Test edge cases (network failures, etc.)
5. Security audit

### Phase 6: Launch (Week 4)
1. Switch to live Stripe keys
2. Update terms of service
3. Add payment policy page
4. Monitor first transactions
5. Set up alerts and monitoring

---

## Pricing Strategy Considerations

### Current Services (from seed data)
- Nexus Letter: $1,500
- DBQ Completion: $800
- Medical Opinion Letter: $1,200
- C&P Exam Preparation: $500
- 1151 Claim Support: $2,000
- Aid & Attendance Evaluation: $600

### Payment Options to Consider

1. **Full Payment Upfront**
   - Simplest to implement
   - Immediate revenue
   - May deter some customers

2. **Deposit + Balance**
   - 50% deposit to start
   - Balance due before delivery
   - Reduces risk for both parties

3. **Payment Plans**
   - Split into 2-3 installments
   - Requires subscription logic
   - More complex to manage

4. **Sliding Scale/Discounts**
   - Veteran discounts
   - Financial hardship consideration
   - Promotional codes

---

## Email Notifications Needed

### Customer Emails
- Payment confirmation
- Invoice sent
- Payment reminder (if unpaid)
- Refund processed
- Receipt for records

### Admin Emails
- New payment received
- Payment failed
- Refund requested
- High-value transaction alert

---

## Reporting & Analytics

### Metrics to Track
- Total revenue (daily, weekly, monthly)
- Average transaction value
- Payment success rate
- Refund rate
- Revenue by service type
- Customer lifetime value
- Payment method breakdown

### Reports Needed
- Daily payment summary
- Monthly revenue report
- Service popularity by revenue
- Failed payment analysis
- Refund report

---

## Compliance & Legal

### Required Documentation
- Terms of Service (payment terms)
- Refund Policy
- Privacy Policy (payment data handling)
- HIPAA compliance for payment records

### Tax Considerations
- Sales tax collection (if applicable)
- 1099 reporting for contractors
- Financial record keeping
- Audit trail maintenance

---

## Cost Estimates

### Stripe Fees
- 2.9% + $0.30 per successful card charge
- Example: $1,500 service = $43.80 + $0.30 = $44.10 fee
- Net revenue: $1,455.90

### Development Time
- Phase 1-2: 1 week (setup & database)
- Phase 3: 1 week (backend)
- Phase 4: 1-2 weeks (frontend)
- Phase 5: 1 week (testing)
- **Total: 4-5 weeks of development**

### Ongoing Costs
- Stripe fees (per transaction)
- Email service for notifications
- Monitoring/alerting tools
- Potential accounting software integration

---

## Alternative: Manual Payment Processing (Interim Solution)

If not ready for full automation, consider:

1. **Invoice-Based System**
   - Admin creates invoice manually
   - Send invoice via email (Stripe Invoice or PDF)
   - Customer pays via link
   - Admin marks as paid in system

2. **Benefits**
   - Simpler to implement
   - More control over process
   - Can start immediately

3. **Drawbacks**
   - More manual work
   - Slower payment collection
   - Less automated tracking

---

## Questions to Answer Before Implementation

1. **Business Questions**
   - What payment methods to accept? (cards, ACH, wire transfer?)
   - Will you offer payment plans?
   - What's the refund policy?
   - Do you need to collect sales tax?

2. **Technical Questions**
   - Who will handle customer support for payment issues?
   - What happens if payment fails mid-service?
   - How to handle chargebacks?
   - Need recurring billing for any services?

3. **Legal Questions**
   - Are there specific regulations for medical service payments?
   - What records must be kept for how long?
   - Any state-specific requirements?
   - HIPAA implications for payment records?

---

## Resources

### Documentation
- Stripe Docs: https://stripe.com/docs
- Stripe React: https://stripe.com/docs/stripe-js/react
- PCI Compliance: https://stripe.com/docs/security/guide

### Test Cards
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0027 6000 3184
```

### Useful Stripe Features
- Payment Links (no code required)
- Stripe Checkout (hosted page)
- Stripe Elements (custom integration)
- Stripe Billing (subscriptions)
- Stripe Radar (fraud prevention)

---

## Status: 📋 PLANNED (Not Implemented)

This document serves as a roadmap for when payment integration is needed. All current "Book Now" buttons lead to the contact form, which is the appropriate flow until payment processing is implemented.

**Next Steps When Ready:**
1. Review this document
2. Make business decisions (pricing, refund policy, etc.)
3. Set up Stripe account
4. Begin Phase 1 implementation
