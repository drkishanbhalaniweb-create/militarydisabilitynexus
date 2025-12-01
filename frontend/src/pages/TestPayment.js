import { useState } from 'react';
import { CreditCard, CheckCircle } from 'lucide-react';
import PaymentButton from '../components/payment/PaymentButton';
import PricingDisplay from '../components/payment/PricingDisplay';
import { SERVICE_PRICING } from '../lib/payment';

const TestPayment = () => {
  const [testMode, setTestMode] = useState('button'); // 'button' or 'wrapper'
  const [isRushService, setIsRushService] = useState(false);

  const service = SERVICE_PRICING.aid_attendance;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            🧪 Stripe Payment Test Page
          </h1>
          <p className="text-lg text-slate-600">
            Test your Stripe integration with test cards
          </p>
        </div>

        {/* Test Card Info */}
        <div className="bg-navy-50 border border-navy-200 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-navy-900 mb-3 flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Test Cards
          </h2>
          <div className="space-y-2 text-sm text-navy-800">
            <div className="flex items-start">
              <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-600" />
              <div>
                <strong>Success:</strong> 4242 4242 4242 4242
              </div>
            </div>
            <div className="flex items-start">
              <span className="mr-2">•</span>
              <div>Expiry: Any future date (e.g., 12/25)</div>
            </div>
            <div className="flex items-start">
              <span className="mr-2">•</span>
              <div>CVC: Any 3 digits (e.g., 123)</div>
            </div>
            <div className="flex items-start">
              <span className="mr-2">•</span>
              <div>ZIP: Any 5 digits (e.g., 12345)</div>
            </div>
          </div>
        </div>

        {/* Rush Service Toggle */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isRushService}
              onChange={(e) => setIsRushService(e.target.checked)}
              className="mr-3 h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
            />
            <div>
              <span className="text-lg font-semibold text-slate-900">
                Rush Service (36-48 hours)
              </span>
              <p className="text-sm text-slate-600">
                Add $500 for expedited processing
              </p>
            </div>
          </label>
        </div>

        {/* Pricing Display */}
        <div className="mb-6">
          <PricingDisplay
            basePrice={service.basePrice}
            rushFee={service.rushFee}
            isRushService={isRushService}
            serviceName={service.name}
          />
        </div>

        {/* Payment Button */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Test Payment Button
          </h2>
          <p className="text-slate-600 mb-6">
            Click the button below to test the Stripe Checkout flow. You'll be redirected to Stripe's secure payment page.
          </p>
          
          <PaymentButton
            formSubmissionId="test-submission-123"
            amount={service.basePrice + (isRushService ? service.rushFee : 0)}
            serviceType="aid_attendance"
            isRushService={isRushService}
            customerEmail="test@example.com"
          />

          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <h3 className="font-semibold text-slate-900 mb-2">What happens next:</h3>
            <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
              <li>You'll be redirected to Stripe Checkout</li>
              <li>Enter the test card number: 4242 4242 4242 4242</li>
              <li>Complete the payment</li>
              <li>You'll be redirected to the success page</li>
              <li>Check your Supabase database for the payment record</li>
            </ol>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            After Testing
          </h2>
          <div className="space-y-3 text-slate-600">
            <div className="flex items-start">
              <span className="font-semibold mr-2">1.</span>
              <span>Check Stripe Dashboard → Payments to see the test payment</span>
            </div>
            <div className="flex items-start">
              <span className="font-semibold mr-2">2.</span>
              <span>Check Stripe Dashboard → Webhooks to verify webhook delivery</span>
            </div>
            <div className="flex items-start">
              <span className="font-semibold mr-2">3.</span>
              <span>Check Supabase → Table Editor → payments to see the payment record</span>
            </div>
            <div className="flex items-start">
              <span className="font-semibold mr-2">4.</span>
              <span>View Edge Function logs in Supabase for any errors</span>
            </div>
          </div>
        </div>

        {/* Environment Check */}
        <div className="mt-8 bg-slate-100 rounded-xl p-6">
          <h3 className="font-semibold text-slate-900 mb-3">Environment Check</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <span className="font-medium mr-2">Stripe Key:</span>
              <span className={process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY ? 'text-green-600' : 'text-red-600'}>
                {process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY ? '✓ Configured' : '✗ Missing'}
              </span>
            </div>
            <div className="flex items-center">
              <span className="font-medium mr-2">Supabase URL:</span>
              <span className={process.env.REACT_APP_SUPABASE_URL ? 'text-green-600' : 'text-red-600'}>
                {process.env.REACT_APP_SUPABASE_URL ? '✓ Configured' : '✗ Missing'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPayment;
