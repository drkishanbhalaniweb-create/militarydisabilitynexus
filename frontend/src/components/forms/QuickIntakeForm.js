import { useState, useEffect, useRef } from 'react';
import { Upload, Send } from 'lucide-react';
import { toast } from 'sonner';
import { formSubmissionsApi, fileUploadApi } from '../../lib/api';
import SuccessModal from '../SuccessModal';

const FORM_TYPES = [
  { value: 'nexus_letter', label: 'Nexus Letter', requiresUpload: false },
  { value: 'dbq', label: 'Disability Benefits Questionnaires (DBQs)', requiresUpload: false },
  { value: '1151_claim', label: '1151 Claim (VA Medical Malpractice)', requiresUpload: false },
  { value: 'aid_attendance', label: 'Aid & Attendance', requiresUpload: false },
  { value: 'unsure', label: "I'm not sure what I need", requiresUpload: false },
];

const QuickIntakeForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    formTypes: [], // Changed to array for multiple selections
    briefSummary: '',
    rushService: false,
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const dropdownRef = useRef(null);

  const requiresUpload = false; // Can be enabled if needed

  // Close dropdown when clicking outside
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormTypeToggle = (value) => {
    setFormData(prev => ({
      ...prev,
      formTypes: prev.formTypes.includes(value)
        ? prev.formTypes.filter(t => t !== value)
        : [...prev.formTypes, value]
    }));
  };

  const getSelectedLabel = () => {
    if (formData.formTypes.length === 0) return 'Select services...';
    if (formData.formTypes.length === 1) {
      return FORM_TYPES.find(t => t.value === formData.formTypes[0])?.label || 'Select services...';
    }
    return `${formData.formTypes.length} services selected`;
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
      // Submit form - use 'quick_intake' as formType (allowed by database CHECK constraint)
      // Store selected services in form_data
      const submission = await formSubmissionsApi.submit({
        formType: 'quick_intake', // Fixed: database only allows 'quick_intake', 'aid_attendance', 'unsure', 'general'
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        formData: {
          briefSummary: formData.briefSummary,
          selectedServices: formData.formTypes, // Store all selected services here
          rushService: formData.rushService,
        },
        requiresUpload,
      });


      // Upload files if any
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          await fileUploadApi.upload(file, submission.id, 'medical_record', true);
        }
      }

      setShowSuccessModal(true);

      if (onSuccess) {
        onSuccess(submission);
      }

      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        formTypes: [],
        briefSummary: '',
        rushService: false,
      });
      setSelectedFiles([]);
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl bg-white/80 border border-white/40">
      <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4">Quick Intake</h3>
      <p className="text-xs sm:text-sm text-slate-700 mb-4 sm:mb-6">
        Upload Redacted documents or describe your case and we will recommend the right service.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-white/30 bg-white/50 backdrop-blur-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200/50 focus:outline-none text-sm text-slate-900 placeholder:text-slate-600"
            placeholder="Full name"
          />
        </div>

        <div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-white/30 bg-white/50 backdrop-blur-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200/50 focus:outline-none text-sm text-slate-900 placeholder:text-slate-600"
            placeholder="Email"
          />
        </div>

        <div>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg border border-white/30 bg-white/50 backdrop-blur-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200/50 focus:outline-none text-sm text-slate-900 placeholder:text-slate-600"
            placeholder="Phone (optional)"
          />
        </div>

        {/* Custom Dropdown with Checkboxes */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full px-4 py-2.5 rounded-lg border border-white/30 bg-white/50 backdrop-blur-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200/50 focus:outline-none text-sm text-slate-900 text-left flex items-center justify-between"
          >
            <span className={formData.formTypes.length === 0 ? 'text-slate-600' : 'text-slate-900'}>
              {getSelectedLabel()}
            </span>
            <svg
              className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-slate-200 max-h-60 overflow-y-auto">
              {FORM_TYPES.map((type) => (
                <label
                  key={type.value}
                  className="flex items-center px-4 py-2.5 hover:bg-indigo-50 cursor-pointer transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={formData.formTypes.includes(type.value)}
                    onChange={() => handleFormTypeToggle(type.value)}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                  />
                  <span className="ml-3 text-sm text-slate-700">{type.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div>
          <textarea
            name="briefSummary"
            value={formData.briefSummary}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-2.5 rounded-lg border border-white/30 bg-white/50 backdrop-blur-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200/50 focus:outline-none text-sm resize-none text-slate-900 placeholder:text-slate-600"
            placeholder="Brief summary (optional)"
          />
        </div>

        {/* File Upload Section - Available for all services */}
        <div className="border-2 border-dashed border-white/40 bg-white/30 backdrop-blur-sm rounded-lg p-4">
          <label className="cursor-pointer block text-center">
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <span className="text-sm text-slate-600">
              Click to upload documents (optional)
            </span>
            <p className="text-xs text-slate-500 mt-1">
              PDF, DOC, or images
            </p>
          </label>

          {selectedFiles.length > 0 && (
            <div className="mt-3 space-y-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-xs bg-slate-50 px-3 py-2 rounded"
                >
                  <span className="truncate flex-1">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-600 hover:text-red-700 ml-2"
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

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading || formData.formTypes.length === 0}
            className="w-full text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ backgroundColor: '#B91C3C' }}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Start Free Discovery</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Form Submitted Successfully!"
        message="We've received your request — Thank you for your service. It's our privilege to support you in return."
      />
    </div>
  );
};

export default QuickIntakeForm;
