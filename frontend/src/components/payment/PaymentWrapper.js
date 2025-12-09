import { useState } from 'react';
import { Shield, Lock } from 'lucide-react';
import PricingDisplay from './PricingDisplay';
import PaymentButton from './PaymentButton';
import { SERVICE_PRICING, calculatePrice } from '../../lib/payment';

/**
 * PaymentWrapper - Wraps form submission with payment flow
 * 
 * Usage:
 * 1. User submits form
 * 2. Form data is saved to database
 * 3. PaymentWrapper shows pricing and payment button
 * 4. User clicks payment button
 * 5. Redirects to Stripe Checkout
 * 6. On success, redirects to success page
 */
const PaymentWrapper = ({
  formSubmissionId,
  serviceType,
  isRushService = false,
  customerEmail,
  onBack,
  customPrice = null, // Allow passing custom price (in cents)
}) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const service = SERVICE_PRICING[serviceType];
  // Use custom price if provided, otherwise calculate from SERVICE_PRICING
  const totalAmount = customPrice || calculatePrice(serviceType, isRushService);

  if (!service) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Invalid service type</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Complete Your Payment
          </h2>
          <p className="text-slate-600">
            Your form has been submitted. Complete payment to begin processing.
          </p>
        </div>

        {/* Pricing Display */}
        <div className="mb-8">
          <PricingDisplay
            basePrice={customPrice || service.basePrice}
            rushFee={isRushService ? service.rushFee : 0}
            isRushService={isRushService}
            serviceName={service.name}
          />
        </div>

        {/* Security Notice */}
        <div className="bg-slate-50 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Lock className="w-5 h-5 text-slate-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-slate-700">
              <p className="font-semibold mb-1">Secure Payment Processing</p>
              <p>
                Your payment is processed securely through Stripe. We never store your credit card information.
                All transactions are encrypted and PCI-compliant.
              </p>
            </div>
          </div>
        </div>

        {/* Terms Agreement */}
        <div className="mb-6">
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
            />
            <span className="text-sm text-slate-700">
              I agree to the{' '}
              <a href="/terms" target="_blank" className="text-indigo-600 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/refund-policy" target="_blank" className="text-indigo-600 hover:underline">
                Refund Policy
              </a>
              . I understand that payment is required to begin processing my request.
            </span>
          </label>
        </div>

        {/* Payment Button */}
        <PaymentButton
          formSubmissionId={formSubmissionId}
          amount={totalAmount}
          serviceType={serviceType}
          isRushService={isRushService}
          customerEmail={customerEmail}
          disabled={!agreedToTerms}
        />

        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="w-full mt-4 text-slate-600 hover:text-slate-900 transition-colors text-sm"
          >
            ← Go back to form
          </button>
        )}

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-slate-500">
          <p>Questions about payment? Contact us at contact@militarydisabilitynexus.com</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentWrapper;
