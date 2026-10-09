import { DollarSign, Zap } from 'lucide-react';
import { formatPrice } from '../../lib/payment';

const PricingDisplay = ({ basePrice, rushFee, isRushService, serviceName }) => {
  const total = basePrice + (isRushService ? rushFee : 0);

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
        <DollarSign className="w-5 h-5 mr-2 text-indigo-600" />
        Pricing Summary
      </h3>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-slate-600">{serviceName}</span>
          <span className="font-semibold text-slate-900">{formatPrice(basePrice)}</span>
        </div>

        {isRushService && (
          <div className="flex justify-between items-center text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
            <span className="flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Rush Service (36-48 hours)
            </span>
            <span className="font-semibold">{formatPrice(rushFee)}</span>
          </div>
        )}

        <div className="border-t border-indigo-200 pt-3 mt-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-slate-900">Total</span>
            <span className="text-2xl font-bold text-indigo-600">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-slate-600">
        <p className="flex items-start">
          <span className="mr-2">•</span>
          <span>Secure payment processing via Stripe</span>
        </p>
        <p className="flex items-start mt-1">
          <span className="mr-2">•</span>
          <span>You'll receive a receipt via email</span>
        </p>
        {!isRushService && (
          <p className="flex items-start mt-1">
            <span className="mr-2">•</span>
            <span>Standard processing: 10-14 business days*</span>
          </p>
        )}
        <p className="text-xs text-slate-500 mt-3 pt-2 border-t border-indigo-100">
          *The turnaround time begins once all required documents have been received and the consultation has been completed.
        </p>
      </div>
    </div>
  );
};

export default PricingDisplay;
