import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, Upload, X, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../components/SEO';
import SuccessModal from '../components/SuccessModal';
import { submitGenericForm, fileUploadApi, formSubmissionsApi } from '../lib/api';

const FORM_TYPES = [
  { value: 'nexus_letter', label: 'Nexus Letter' },
  { value: 'dbq', label: 'Disability Benefits Questionnaires (DBQs)' },
  { value: '1151_claim', label: '1151 Claim (VA Medical Malpractice)' },
  { value: 'aid_attendance', label: 'Aid & Attendance' },
  { value: 'unsure', label: "I'm not sure what I need" },
];

const Forms = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check URL parameter to determine initial view
  const searchParams = new URLSearchParams(location.search);
  const initialView = searchParams.get('view') === 'schedule';
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    formType: 'unsure',
    additionalDetails: '',
    rushService: false
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCal, setShowCal] = useState(initialView);
  
  const calUrl = process.env.REACT_APP_CAL_URL_DISCOVERY || 'https://cal.com/mdnexus-lkd3ut/discovery-call';
  
  // Load Cal.com widget script
  useEffect(() => {
    if (showCal) {
      const script = document.createElement('script');
      script.src = 'https://app.cal.com/embed/embed.js';
      script.async = true;
      document.body.appendChild(script);
      
      return () => {
        // Cleanup script on unmount
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [showCal]);
  
  // Update URL when toggling views
  useEffect(() => {
    const newSearchParams = new URLSearchParams();
    if (showCal) {
      newSearchParams.set('view', 'schedule');
    }
    const newSearch = newSearchParams.toString();
    const newPath = newSearch ? `${location.pathname}?${newSearch}` : location.pathname;
    if (location.pathname + location.search !== newPath) {
      navigate(newPath, { replace: true });
    }
  }, [showCal, location.pathname, location.search, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Submit form data first
      const submission = await formSubmissionsApi.submit({
        formType: formData.formType,
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone,
        formData: {
          additionalDetails: formData.additionalDetails,
        },
        requiresUpload: false,
      });

      // Upload files if any
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          await fileUploadApi.upload(file, submission.id, 'medical_record', true);
        }
      }

      setShowSuccessModal(true);
      
      // Reset form
      setFormData({
        name: '',
        phone: '',
        email: '',
        formType: 'unsure',
        additionalDetails: '',
        rushService: false
      });
      setSelectedFiles([]);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const wordCount = formData.additionalDetails.trim().split(/\s+/).filter(Boolean).length;
  const maxWords = 250;

  return (
    <>
      <SEO 
        title="Get Started - VA Disability Claim Documentation Services"
        description="Submit your information to get started with professional VA disability claim documentation. Expert nexus letters, DBQs, Aid & Attendance evaluations, and medical consultations from licensed clinicians."
        keywords="VA claim form, nexus letter request, DBQ evaluation form, aid and attendance application, veteran medical documentation request"
      />
      
      <div className="relative min-h-screen py-16 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="fixed inset-0 z-0 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url("/form bg image.png")',
              filter: 'blur(4px)',
              transform: 'scale(1.1)',
              width: '100%',
              height: '100%'
            }}
            role="presentation"
            aria-hidden="true"
          ></div>
          <div className="absolute inset-0 bg-white/40"></div>
        </div>

        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Get Started with Your VA Claim
            </h1>
            <p className="text-lg text-slate-600">
              Fill out the form below or schedule a free discovery call
            </p>
            
            {/* Toggle Buttons */}
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => setShowCal(false)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  !showCal
                    ? 'text-white shadow-lg'
                    : 'bg-white/80 text-slate-700 hover:bg-white'
                }`}
                style={!showCal ? { backgroundColor: '#B91C3C' } : {}}
              >
                <Send className="w-5 h-5 inline-block mr-2" />
                Submit Form
              </button>
              <button
                onClick={() => setShowCal(true)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  showCal
                    ? 'text-white shadow-lg'
                    : 'bg-white/80 text-slate-700 hover:bg-white'
                }`}
                style={showCal ? { backgroundColor: '#B91C3C' } : {}}
              >
                <Calendar className="w-5 h-5 inline-block mr-2" />
                Schedule Call
              </button>
            </div>
          </div>

          {/* Cal.com Inline Widget */}
          {showCal ? (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/40">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Schedule Your Free Discovery Call</h2>
              <p className="text-slate-600 mb-6">
                Book a consultation to discuss your VA claim needs. We'll help you understand which services are right for you.
              </p>
              <div className="bg-white rounded-lg overflow-hidden">
                {/* Cal.com Inline Widget */}
                <div 
                  data-cal-link={calUrl}
                  data-cal-config='{"layout":"month_view"}'
                  style={{ minWidth: '320px', height: '700px', overflow: 'scroll' }}
                ></div>
              </div>
              <p className="text-sm text-slate-500 mt-4 text-center">
                Having trouble? <a href={calUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Open in new window</a>
              </p>
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/40">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Request Your Medical Documentation</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="formType" className="block text-sm font-medium text-slate-700 mb-2">
                    What service do you need? <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="formType"
                    name="formType"
                    value={formData.formType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-white/30 bg-white/50 backdrop-blur-sm rounded-lg focus:ring-2 focus:ring-navy-400 focus:border-transparent transition-all text-slate-900"
                  >
                    {FORM_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-white/30 bg-white/50 backdrop-blur-sm rounded-lg focus:ring-2 focus:ring-navy-400 focus:border-transparent transition-all text-slate-900 placeholder:text-slate-600"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-white/30 bg-white/50 backdrop-blur-sm rounded-lg focus:ring-2 focus:ring-navy-400 focus:border-transparent transition-all text-slate-900 placeholder:text-slate-600"
                    placeholder="+1 307 301-2019"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-white/30 bg-white/50 backdrop-blur-sm rounded-lg focus:ring-2 focus:ring-navy-400 focus:border-transparent transition-all text-slate-900 placeholder:text-slate-600"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="additionalDetails" className="block text-sm font-medium text-slate-700 mb-2">
                    Additional Details
                  </label>
                  <textarea
                    id="additionalDetails"
                    name="additionalDetails"
                    value={formData.additionalDetails}
                    onChange={handleChange}
                    rows={6}
                    maxLength={maxWords * 6}
                    className="w-full px-4 py-3 border border-white/30 bg-white/50 backdrop-blur-sm rounded-lg focus:ring-2 focus:ring-navy-400 focus:border-transparent transition-all resize-none text-slate-900 placeholder:text-slate-600"
                    placeholder="Tell us more about your needs..."
                  />
                  <div className="mt-2 text-sm text-slate-500 text-right">
                    {wordCount} / {maxWords} words
                  </div>
                </div>

                {/* File Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Upload Supporting Documents (Optional)
                  </label>
                  <div className="border-2 border-dashed border-slate-300 bg-white/30 backdrop-blur-sm rounded-lg p-6">
                    <label className="cursor-pointer block text-center">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                      <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                      <span className="text-sm font-semibold text-slate-700 block mb-1">
                        Click to upload documents
                      </span>
                      <p className="text-xs text-slate-500">
                        PDF, DOC, DOCX, JPG, PNG (max 10MB each)
                      </p>
                    </label>

                    {selectedFiles.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {selectedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-white px-3 py-2 rounded-lg"
                          >
                            <span className="text-sm text-slate-700 truncate flex-1">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-red-600 hover:text-red-700 ml-2 p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Rush Service Checkbox */}
                <div className="flex items-start gap-3 p-4 bg-navy-50/50 rounded-lg border border-navy-100">
                  <input
                    type="checkbox"
                    id="rushService"
                    name="rushService"
                    checked={formData.rushService}
                    onChange={(e) => setFormData(prev => ({ ...prev, rushService: e.target.checked }))}
                    className="mt-1 w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="rushService" className="flex-1 cursor-pointer">
                    <span className="text-sm font-medium text-slate-900">Rush service (expedited fee)</span>
                    <p className="text-xs text-slate-600 mt-0.5">Get your documentation completed in 3-5 business days</p>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || wordCount > maxWords}
                  className="w-full text-white py-4 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 hover:scale-105"
                  style={{ backgroundColor: '#B91C3C' }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Submit Form</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Success Modal */}
          <SuccessModal
            isOpen={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            title="Form Submitted Successfully!"
            message="We've received your request — Thank you for your service. It's our privilege to support you in return."
          />
        </div>
      </div>
    </>
  );
};

export default Forms;
