import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Mail, Clock, FileText, ArrowRight, Calendar } from 'lucide-react';
import SEO from '../components/SEO';
import { InlineWidget } from 'react-calendly';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [showCalendly, setShowCalendly] = useState(false);

  // Don't auto-redirect, let user book meeting first
  useEffect(() => {
    // Show Calendly after a short delay
    const timer = setTimeout(() => {
      setShowCalendly(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <SEO
        title="Payment Successful"
        description="Your payment has been processed successfully."
        noindex={true}
      />

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Card */}
          <div className="bg-white rounded-2xl p-8 shadow-xl text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>

            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              Payment Successful!
            </h1>

            <p className="text-lg text-slate-600 mb-6">
              Thank you for your payment. Your submission has been received and is being processed.
            </p>

            {sessionId && (
              <div className="bg-slate-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-slate-500 mb-1">Session ID</p>
                <p className="text-xs font-mono text-slate-700 break-all">{sessionId}</p>
              </div>
            )}
          </div>

          {/* What's Next Card */}
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <Clock className="w-6 h-6 mr-2 text-indigo-600" />
              What Happens Next?
            </h2>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-indigo-600 font-semibold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Email Confirmation</h3>
                  <p className="text-slate-600 text-sm">
                    You'll receive a payment receipt and confirmation email within the next few minutes.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-indigo-600 font-semibold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Medical Review</h3>
                  <p className="text-slate-600 text-sm">
                    Our medical team will review your submission and begin processing your request.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-indigo-600 font-semibold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Status Updates</h3>
                  <p className="text-slate-600 text-sm">
                    We'll keep you informed via email as your request progresses through each stage.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-indigo-600 font-semibold">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Delivery</h3>
                  <p className="text-slate-600 text-sm">
                    Your completed documents will be delivered via email within the specified timeframe.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-navy-50 border border-navy-200 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-navy-900 mb-3 flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Important Information
            </h3>
            <ul className="text-sm text-navy-800 space-y-2">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Check your spam folder if you don't receive the confirmation email</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Save your receipt for your records</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>If you have questions, contact us at contact@militarydisabilitynexus.com</span>
              </li>
            </ul>
          </div>

          {/* Calendly Booking Section */}
          {showCalendly && (
            <div className="bg-white rounded-2xl p-8 shadow-lg mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center justify-center">
                <Calendar className="w-6 h-6 mr-2 text-indigo-600" />
                Schedule Your Consultation
              </h2>
              <p className="text-center text-slate-600 mb-6">
                Book a time to discuss your claim with our team
              </p>
              <div className="calendly-container">
                <InlineWidget
                  url="https://calendly.com/dr-kishanbhalani-web/military-disability-nexis"
                  styles={{
                    height: '700px',
                    minWidth: '320px',
                  }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/"
              className="flex-1 text-white px-6 py-3 rounded-lg font-semibold transition-all text-center flex items-center justify-center"
              style={{ backgroundColor: '#B91C3C' }}
            >
              Return to Home
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              to="/services"
              className="flex-1 bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-all border-2 border-indigo-600 text-center flex items-center justify-center"
            >
              <FileText className="w-5 h-5 mr-2" />
              View Services
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentSuccess;
