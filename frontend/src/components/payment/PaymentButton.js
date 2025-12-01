import { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { paymentApi, formatPrice } from '../../lib/payment';
import { toast } from 'sonner';

const PaymentButton = ({
  formSubmissionId,
  amount,
  serviceType,
  isRushService = false,
  customerEmail,
  disabled = false,
  className = '',
}) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const { url } = await paymentApi.createCheckoutSession({
        formSubmissionId,
        serviceType,
        amount,
        isRushService,
        customerEmail,
        successUrl: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/payment/canceled`,
      });

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading || disabled}
      className={`w-full text-white px-8 py-4 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 ${className}`}
      style={{ backgroundColor: '#B91C3C' }}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          <CreditCard className="w-5 h-5" />
          <span>Proceed to Payment {formatPrice(amount)}</span>
        </>
      )}
    </button>
  );
};

export default PaymentButton;
