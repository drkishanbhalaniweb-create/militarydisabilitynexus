import { useState } from 'react';
import { User, Phone, Mail, Calendar, FileText, Heart, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { contactsApi } from '../lib/api';
import FileUpload from '../components/FileUpload';
import FileList from '../components/FileList';

const FORM_TYPES = [
  { value: 'nexus_letter', label: 'Nexus Letter' },
  { value: 'dbq', label: 'Disability Benefits Questionnaires (DBQs)' },
  { value: '1151_claim', label: '1151 Claim (VA Medical Malpractice)' },
  { value: 'aid_attendance', label: 'Aid & Attendance' },
  { value: 'unsure', label: "I'm not sure what I need" },
];

const AidAttendanceForm = () => {
  const [formData, setFormData] = useState({
    // Service Selection
    formType: 'aid_attendance',

    // Personal Information
    veteranName: '',
    veteranSSN: '',
    veteranDOB: '',
    veteranPhone: '',
    veteranEmail: '',

    // Contact Information
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    contactRelationship: '',

    // Medical Information
    primaryDiagnosis: '',
    secondaryDiagnoses: '',
    currentMedications: '',
    physicianName: '',
    physicianPhone: '',
    lastExamDate: '',

    // Activities of Daily Living Assessment
    bathing: '',
    dressing: '',
    eating: '',
    toileting: '',
    mobility: '',
    transferring: '',
    continence: '',

    // Care Requirements
    supervisionNeeded: '',
    assistanceHours: '',
    caregiverInfo: '',

    // Additional Information
    additionalInfo: '',
    rushService: false,

    // Service Selection
    serviceType: 'aid-attendance'
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [contactId, setContactId] = useState(null);
  const [showFileUpload, setShowFileUpload] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submissionData = {
        name: formData.veteranName,
        email: formData.veteranEmail,
        phone: formData.veteranPhone,
        subject: 'Aid & Attendance Form Submission',
        message: JSON.stringify(formData, null, 2),
        service: 'aid-attendance'
      };

      const response = await contactsApi.submit(submissionData);
      setSubmitted(true);
      setContactId(response.id);
      setShowFileUpload(true);
      toast.success('Aid & Attendance form submitted successfully! You can now upload supporting documents.');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const adlOptions = [
    { value: 'independent', label: 'Independent' },
    { value: 'needs-assistance', label: 'Needs Assistance' },
    { value: 'dependent', label: 'Completely Dependent' },
    { value: 'unable', label: 'Unable to Perform' }
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-50 to-slate-100 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Form Submitted Successfully!</h2>
            <p className="text-slate-600 mb-6">
              Your Aid & Attendance form has been submitted. Our medical team will review your information and contact you within 1-2 business days.
            </p>

            {showFileUpload && contactId && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Upload Supporting Documents</h3>
                <FileUpload
                  contactId={contactId}
                  onUploadComplete={() => toast.success('Document uploaded successfully!')}
                  onUploadError={(error) => toast.error('Upload failed: ' + error.message)}
                />
                <FileList contactId={contactId} />
              </div>
            )}

            <div className="mt-8 p-4 bg-indigo-50 rounded-lg">
              <h4 className="font-semibold text-teal-900 mb-2">What's Next?</h4>
              <ul className="text-sm text-indigo-700 space-y-1">
                <li>• Medical review of your information</li>
                <li>• Physician evaluation scheduling (if needed)</li>
                <li>• Form 21-2680 completion</li>
                <li>• Final documentation delivery</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-slate-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Heart className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Aid & Attendance Form</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Complete this form to begin your Aid & Attendance benefit evaluation. Our medical team will review your information and provide comprehensive documentation.
          </p>
        </div>

        {/* Pricing Info */}
        <div className="bg-white rounded-2xl p-6 mb-8 border-2 border-teal-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Service Pricing</h3>
              <p className="text-slate-600">Aid & Attendance (Form 21-2680) Evaluation</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-600">$2,000</div>
              <div className="text-sm text-slate-500">7-10 business days</div>
              <div className="text-sm text-indigo-600">Rush: +$500 (36-48 hours)</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-lg">
          {/* Service Selection */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6">
              Service Type
            </h3>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                What service do you need? *
              </label>
              <select
                name="formType"
                value={formData.formType}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:outline-none"
              >
                {FORM_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Personal Information */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <User className="w-5 h-5 mr-2 text-indigo-600" />
              Veteran Information
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Veteran's Full Name *
                </label>
                <input
                  type="text"
                  name="veteranName"
                  value={formData.veteranName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:outline-none"
                  placeholder="Enter veteran's full name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Social Security Number *
                </label>
                <input
                  type="text"
                  name="veteranSSN"
                  value={formData.veteranSSN}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:outline-none"
                  placeholder="XXX-XX-XXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="veteranDOB"
                  value={formData.veteranDOB}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="veteranPhone"
                  value={formData.veteranPhone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:outline-none"
                  placeholder="+1 307 318 1367"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="veteranEmail"
                  value={formData.veteranEmail}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:outline-none"
                  placeholder="veteran@email.com"
                />
              </div>
            </div>
          </div>

          {/* Contact Person Information */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <Phone className="w-5 h-5 mr-2 text-indigo-600" />
              Contact Person (if different from veteran)
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Contact Name
                </label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:outline-none"
                  placeholder="Contact person's name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Relationship to Veteran
                </label>
                <select
                  name="contactRelationship"
                  value={formData.contactRelationship}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">Select relationship</option>
                  <option value="spouse">Spouse</option>
                  <option value="child">Child</option>
                  <option value="parent">Parent</option>
                  <option value="sibling">Sibling</option>
                  <option value="caregiver">Caregiver</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:outline-none"
                  placeholder="+1 307 318 1367"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:outline-none"
                  placeholder="contact@email.com"
                />
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-indigo-600" />
              Medical Information
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Primary Diagnosis/Condition *
                </label>
                <input
                  type="text"
                  name="primaryDiagnosis"
                  value={formData.primaryDiagnosis}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:outline-none"
                  placeholder="Primary medical condition requiring assistance"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Secondary Diagnoses
                </label>
                <textarea
                  name="secondaryDiagnoses"
                  value={formData.secondaryDiagnoses}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:outline-none"
                  placeholder="List any additional medical conditions"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Current Medications
                </label>
                <textarea
                  name="currentMedications"
                  value={formData.currentMedications}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:outline-none"
                  placeholder="List current medications and dosages"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Primary Physician Name
                  </label>
                  <input
                    type="text"
                    name="physicianName"
                    value={formData.physicianName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:outline-none"
                    placeholder="Dr. Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Physician Phone
                  </label>
                  <input
                    type="tel"
                    name="physicianPhone"
                    value={formData.physicianPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:outline-none"
                    placeholder="+1 307 318 1367"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Last Medical Examination Date
                </label>
                <input
                  type="date"
                  name="lastExamDate"
                  value={formData.lastExamDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Activities of Daily Living */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6">
              Activities of Daily Living Assessment
            </h3>
            <p className="text-slate-600 mb-6">
              Please indicate the level of assistance needed for each activity:
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                { name: 'bathing', label: 'Bathing/Showering' },
                { name: 'dressing', label: 'Dressing/Undressing' },
                { name: 'eating', label: 'Eating/Feeding' },
                { name: 'toileting', label: 'Toileting' },
                { name: 'mobility', label: 'Walking/Mobility' },
                { name: 'transferring', label: 'Transferring (bed to chair)' },
                { name: 'continence', label: 'Continence Control' }
              ].map((activity) => (
                <div key={activity.name}>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    {activity.label} *
                  </label>
                  <select
                    name={activity.name}
                    value={formData[activity.name]}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">Select level</option>
                    {adlOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Care Requirements */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6">
              Care Requirements
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Supervision Needed *
                </label>
                <select
                  name="supervisionNeeded"
                  value={formData.supervisionNeeded}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">Select supervision level</option>
                  <option value="none">No supervision needed</option>
                  <option value="occasional">Occasional supervision</option>
                  <option value="frequent">Frequent supervision</option>
                  <option value="constant">Constant supervision</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Hours of Assistance Needed Daily
                </label>
                <input
                  type="text"
                  name="assistanceHours"
                  value={formData.assistanceHours}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:outline-none"
                  placeholder="e.g., 8 hours, 24 hours, as needed"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Current Caregiver Information
                </label>
                <textarea
                  name="caregiverInfo"
                  value={formData.caregiverInfo}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:outline-none"
                  placeholder="Who currently provides care? Family member, professional caregiver, etc."
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6">
              Additional Information
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Additional Details
                </label>
                <textarea
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:outline-none"
                  placeholder="Any additional information that would help with your evaluation..."
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="rushService"
                  checked={formData.rushService}
                  onChange={handleChange}
                  className="w-5 h-5 text-indigo-600 border-2 border-slate-300 rounded focus:ring-indigo-500"
                />
                <label className="text-sm font-semibold text-slate-700">
                  Rush Service (+$500 USD for 36-48 hour delivery)
                </label>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="mb-8 p-6 bg-amber-50 border-2 border-amber-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-900 mb-2">Important Notice</h4>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• All information provided will be kept confidential and HIPAA compliant</li>
                  <li>• A physician evaluation may be required as part of the assessment</li>
                  <li>• Supporting medical records should be uploaded after form submission</li>
                  <li>• Processing time is 7-10 business days (36-48 hours for rush service)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full text-white px-8 py-4 rounded-full font-semibold text-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
                <span>Submit Aid & Attendance Form</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AidAttendanceForm;