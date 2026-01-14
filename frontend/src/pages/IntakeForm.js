import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Send, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { formSubmissionsApi, fileUploadApi } from '../lib/api';
import SEO from '../components/SEO';
import SuccessModal from '../components/SuccessModal';

const FORM_TYPES = [
  { value: 'quick_intake', label: 'Quick Intake', requiresUpload: false },
  { value: 'aid_attendance', label: 'Aid & Attendance', requiresUpload: true },
  { value: 'unsure', label: "I'm not sure what I need", requiresUpload: false },
];

const IntakeForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    formType: 'unsure',
    briefSummary: '',
    rushService: false,
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const selectedFormType = FORM_TYPES.find(ft => ft.value === formData.formType);
  const requiresUpload = selectedFormType?.requiresUpload || false;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    setLoading(true);

    try {
      const submission = await formSubmissionsApi.submit({
        formType: formData.formType,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        formData: {
          briefSummary: formData.briefSummary,
        },
        requiresUpload,
      });

      setSubmissionId(submission.id);

      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          await fileUploadApi.upload(file, submission.id, 'medical_record', true);
        }
      }

      setShowSuccessModal(true);

      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        formType: 'unsure',
        briefSummary: '',
        rushService: false,
      });
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Intake Form"
        description="Submit your information and we'll recommend the right service for your VA disability claim."
      />
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-8">
            <FileText className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Intake Form</h1>
            <p className="text-xl text-slate-600">
              Tell us about your case and we'll recommend the right service
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-lg space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                placeholder="+1 307 318 1367"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                What service do you need? *
              </label>
              <select
                name="formType"
                value={formData.formType}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
              >
                {FORM_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Brief Summary (Optional)
              </label>
              <textarea
                name="briefSummary"
                value={formData.briefSummary}
                onChange={handleChange}
                rows="5"
                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none resize-none"
                placeholder="Describe your case, medical conditions, or what you need help with..."
              />
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6">
              <label className="cursor-pointer block text-center">
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <span className="text-base font-semibold text-slate-700 block mb-1">
                  Upload Supporting Documents (Optional)
                </span>
                <span className="text-sm text-slate-500">
                  Click to upload or drag and drop
                </span>
                <p className="text-xs text-slate-500 mt-2">
                  PDF, DOC, DOCX, JPG, PNG (max 10MB each)
                </p>
              </label>

              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-slate-50 px-4 py-3 rounded-lg"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <FileText className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        <span className="text-sm text-slate-700 truncate">{file.name}</span>
                        <span className="text-xs text-slate-500 flex-shrink-0">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-700 ml-3 text-sm font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
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

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundColor: '#B91C3C' }}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Submit Form</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/forms?view=schedule')}
                className="flex-1 bg-white text-navy-600 px-8 py-4 rounded-lg font-semibold text-lg border-2 border-slate-300 hover:border-slate-400 transition-colors flex items-center justify-center gap-2"
              >
                <span>Free Discovery Call</span>
              </button>
            </div>
          </form>
        </div>

        {/* Success Modal */}
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title="Form Submitted Successfully!"
          message="Your intake form has been submitted. Our medical team will review your information and contact you within 1-2 business days."
        />
      </div>
    </>
  );
};

export default IntakeForm;
