import { useState } from 'react';
import { CheckCircle, FileText, User, Mail, Phone, MessageSquare, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import PaymentWrapper from '../components/payment/PaymentWrapper';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';

const ClaimReadinessReview = () => {
  const [step, setStep] = useState('form'); // 'form' or 'payment'
  const [formSubmissionId, setFormSubmissionId] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    veteranName: '',
    email: '',
    phone: '',
    serviceTypes: [], // Changed to array for multiple selections
    currentStatus: '',
    additionalInfo: '',
    acceptedTerms: false,
  });

  const SERVICE_TYPES = [
    { value: 'nexus_letter', label: 'Nexus Letter' },
    { value: 'dbq', label: 'Disability Benefits Questionnaires (DBQs)' },
    { value: '1151_claim', label: '1151 Claim (VA Medical Malpractice)' },
    { value: 'aid_attendance', label: 'Aid & Attendance' },
    { value: 'unsure', label: "I'm not sure what I need" },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleServiceTypeToggle = (value) => {
    setFormData(prev => ({
      ...prev,
      serviceTypes: prev.serviceTypes.includes(value)
        ? prev.serviceTypes.filter(t => t !== value)
        : [...prev.serviceTypes, value]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Submit form to database
      const { data, error } = await supabase
        .from('form_submissions')
        .insert({
          form_type: 'claim_readiness_review',
          form_data: {
            serviceTypes: formData.serviceTypes,
            currentStatus: formData.currentStatus,
            additionalInfo: formData.additionalInfo,
          },
          full_name: formData.veteranName,
          email: formData.email,
          phone: formData.phone,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message || 'Failed to submit form');
      }

      if (!data) {
        throw new Error('No data returned from submission');
      }

      // Move to payment step
      setFormSubmissionId(data.id);
      setStep('payment');
      toast.success('Form submitted! Please complete payment to proceed.');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error.message || 'Failed to submit form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show payment wrapper after form submission
  if (step === 'payment') {
    return (
      <PaymentWrapper
        formSubmissionId={formSubmissionId}
        serviceType="claim_readiness_review"
        isRushService={false}
        customerEmail={formData.email}
        onBack={() => setStep('form')}
      />
    );
  }

  // Show form
  return (
    <>
      <SEO
        title="Claim Readiness Review - $225"
        description="Get a comprehensive review of your VA disability claim readiness. Expert analysis to ensure your claim is complete and optimized for success."
        keywords="VA claim review, disability claim readiness, claim preparation, veteran services"
      />

      <div className="min-h-screen bg-gradient-to-br from-navy-50 via-navy-100 to-slate-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-navy-600 to-navy-800 rounded-full mb-6 shadow-lg">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Claim Readiness Review
            </h1>
            <p className="text-xl text-slate-600 mb-2">
              Comprehensive analysis of your VA disability claim
            </p>
            <div className="inline-flex items-center bg-navy-100 text-navy-800 px-6 py-3 rounded-full font-bold text-2xl">
              $225 - Pay Now
            </div>
          </div>

          {/* What's Included */}
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">What's Included</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-slate-900">Complete Claim Analysis</h3>
                  <span className="text-slate-600 block">Thorough review of your claim documentation and evidence</span>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-slate-900">Gap Identification</h3>
                  <span className="text-slate-600 block">Identify missing evidence or documentation needed</span>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-slate-900">Expert Recommendations</h3>
                  <span className="text-slate-600 block">Actionable steps to strengthen your claim</span>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-slate-900">Written Report</h3>
                  <span className="text-slate-600 block">Detailed written analysis delivered within 5-7 business days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Information</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Veteran Name */}
              <div>
                <label htmlFor="veteranName" className="block text-sm font-semibold text-slate-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name *
                </label>
                <input
                  type="text"
                  id="veteranName"
                  name="veteranName"
                  value={formData.veteranName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  placeholder="john.doe@example.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  placeholder="+1 307 301-2019"
                />
              </div>

              {/* Service Types - Multiple Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  What services are you interested in? * (Select all that apply)
                </label>
                <div className="space-y-3">
                  {SERVICE_TYPES.map((type) => (
                    <label
                      key={type.value}
                      className="flex items-start cursor-pointer p-3 border border-slate-200 rounded-lg hover:bg-navy-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.serviceTypes.includes(type.value)}
                        onChange={() => handleServiceTypeToggle(type.value)}
                        className="mt-1 w-5 h-5 text-navy-600 border-slate-300 rounded focus:ring-navy-500"
                      />
                      <span className="ml-3 text-slate-700">{type.label}</span>
                    </label>
                  ))}
                </div>
                {formData.serviceTypes.length === 0 && (
                  <p className="text-sm text-red-600 mt-2">Please select at least one service type</p>
                )}
              </div>

              {/* Current Status */}
              <div>
                <label htmlFor="currentStatus" className="block text-sm font-semibold text-slate-700 mb-2">
                  Current Claim Status *
                </label>
                <select
                  id="currentStatus"
                  name="currentStatus"
                  value={formData.currentStatus}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                >
                  <option value="">Select status...</option>
                  <option value="preparing">Preparing to File</option>
                  <option value="pending">Claim Pending</option>
                  <option value="denied">Claim Denied</option>
                  <option value="rated">Claim Rated</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Additional Info */}
              <div>
                <label htmlFor="additionalInfo" className="block text-sm font-semibold text-slate-700 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Additional Information
                </label>
                <textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  placeholder="Tell us about your claim, conditions, or any specific concerns..."
                />
              </div>

              {/* Terms and Conditions */}
              <div className="border-t border-slate-200 pt-6">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    name="acceptedTerms"
                    checked={formData.acceptedTerms}
                    onChange={handleChange}
                    required
                    className="mt-1 w-5 h-5 text-navy-600 border-slate-300 rounded focus:ring-navy-500"
                  />
                  <span className="ml-3 text-sm text-slate-700">
                    I agree to the{' '}
                    <Link to="/terms" target="_blank" className="text-navy-600 hover:text-navy-700 underline font-semibold">
                      Terms and Conditions
                    </Link>
                    {' '}and{' '}
                    <Link to="/privacy" target="_blank" className="text-navy-600 hover:text-navy-700 underline font-semibold">
                      Privacy Policy
                    </Link>
                    {' '}*
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || formData.serviceTypes.length === 0 || !formData.acceptedTerms}
                className="w-full text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl"
                style={{ backgroundColor: '#B91C3C' }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Continue to Payment ($225)
                  </>
                )}
              </button>

              <p className="text-sm text-slate-500 text-center">
                You'll be redirected to secure payment after submitting this form
              </p>
            </form>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 text-center text-sm text-slate-600">
            <p className="flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              Secure payment processing via Stripe
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClaimReadinessReview;
