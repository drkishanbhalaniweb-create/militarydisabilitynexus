import { useRef, useState } from 'react';
import { User, Phone, FileText, Heart, Send, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { formSubmissionsApi } from '../src/lib/api';
import FileUpload from '../src/components/FileUpload';
import FileList from '../src/components/FileList';
import Layout from '../src/components/Layout';
import SEO from '../src/components/SEO';
import { createSubmissionMeta, validateSubmissionMeta } from '../src/lib/submissionValidation';
import { formatPhoneNumber } from '../src/lib/phoneUtils';

const FORM_TYPES = [
    { value: 'nexus_letter', label: 'Nexus Letter' },
    { value: 'dbq', label: 'Disability Benefits Questionnaires (DBQs)' },
    { value: '1151_claim', label: '1151 Claim (VA Medical Malpractice)' },
    { value: 'aid_attendance', label: 'Aid & Attendance' },
    { value: 'unsure', label: "I'm not sure what I need" },
];

const AidAttendanceForm = () => {
    const formStartedAt = useRef(Date.now());
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
        transferring: '',
        walking: '',
        continence: '',
        medicationManagement: '',

        // Living Situation
        livingArrangement: '',
        caregiverName: '',
        caregiverRelationship: '',
        caregiverHours: '',

        // Additional Information
        additionalNotes: '',

        // Rush Service
        rushService: false,

        // Service Selection
        serviceType: 'aid-attendance',
        website: ''
    });

    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submissionId, setSubmissionId] = useState(null);
    const [showFileUpload, setShowFileUpload] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const isPhoneField = name === 'veteranPhone' || name === 'contactPhone' || name === 'physicianPhone';
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : (isPhoneField ? formatPhoneNumber(value) : value),
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const submissionMeta = createSubmissionMeta({
                honeypot: formData.website,
                startedAt: formStartedAt.current,
            });
            validateSubmissionMeta(submissionMeta);

            const {
                website,
                veteranName,
                veteranEmail,
                veteranPhone,
                formType,
                ...formSpecificData
            } = formData;

            const response = await formSubmissionsApi.submit({
                formType,
                fullName: veteranName,
                email: veteranEmail,
                phone: veteranPhone,
                formData: {
                    ...formSpecificData,
                    veteranName,
                    veteranEmail,
                    veteranPhone,
                },
                requiresUpload: true,
            }, submissionMeta);
            setSubmitted(true);
            setSubmissionId(response.id);
            setShowFileUpload(true);
            toast.success('Aid & Attendance form submitted successfully! You can now upload supporting documents.');
            formStartedAt.current = Date.now();
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error(error.message || 'Failed to submit form. Please try again.');
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

    return (
        <Layout>
            <SEO
                title="Aid & Attendance (21-2680) Medical Assessment Form - Military Disability Nexus"
                description="Complete our comprehensive medical assessment form for VA Aid & Attendance benefits. Expert medical documentation by licensed providers."
                keywords="aid and attendance form, va form 21-2680, housebound benefits, adl assessment, veteran caregiver support"
            />

            <div className="min-h-screen bg-slate-50 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-navy-100 rounded-full mb-4">
                            <Heart className="w-8 h-8 text-navy-700" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                            Aid & Attendance Medical Assessment Form
                        </h1>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Please provide detailed information to help our clinicians evaluate your eligibility for VA Form 21-2680.
                        </p>
                    </div>

                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-lg">
                            <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                                <label htmlFor="aid-website">Website</label>
                                <input
                                    id="aid-website"
                                    type="text"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    tabIndex={-1}
                                    autoComplete="off"
                                />
                            </div>

                            {/* Service Selection */}
                            <div className="mb-8 p-6 bg-navy-50 rounded-xl border border-navy-100">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Service Selection</h3>
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
                                            placeholder="(555) 000-0000"
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
                                            placeholder="(555) 000-0000"
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
                                            Primary Medical Diagnosis *
                                        </label>
                                        <input
                                            type="text"
                                            name="primaryDiagnosis"
                                            value={formData.primaryDiagnosis}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:outline-none"
                                            placeholder="e.g., Severe Parkinson's Disease, Advanced Dementia, Quadriplegia"
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
                                            placeholder="List any other relevant medical conditions"
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
                                                placeholder="(555) 000-0000"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Activities of Daily Living (ADL) Assessment */}
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center">
                                    <Heart className="w-5 h-5 mr-2 text-indigo-600" />
                                    Activities of Daily Living (ADL) Assessment *
                                </h3>
                                <p className="text-sm text-slate-600 mb-6">
                                    Please rate the veteran's ability to perform each activity independently:
                                </p>

                                <div className="space-y-4">
                                    {[
                                        { name: 'bathing', label: 'Bathing / Showering', desc: 'Ability to wash body, get in/out of tub/shower' },
                                        { name: 'dressing', label: 'Dressing', desc: 'Ability to choose and put on clothes, manage buttons/zippers' },
                                        { name: 'eating', label: 'Eating / Feeding', desc: 'Ability to feed self (not including food preparation)' },
                                        { name: 'transferring', label: 'Transferring / Mobility', desc: 'Ability to move in/out of bed or chair' },
                                        { name: 'walking', label: 'Walking / Locomotion', desc: 'Ability to walk on level surfaces, climb stairs' },
                                        { name: 'continence', label: 'Bowel / Bladder Continence', desc: 'Ability to control bowel and bladder function' },
                                        { name: 'medicationManagement', label: 'Medication Management', desc: 'Ability to take correct medications at right times' }
                                    ].map((item) => (
                                        <div key={item.name} className="p-4 bg-slate-50 rounded-lg">
                                            <div className="mb-2">
                                                <span className="font-semibold text-slate-900">{item.label}</span>
                                                <p className="text-xs text-slate-500">{item.desc}</p>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                {adlOptions.map(opt => (
                                                    <label key={opt.value} className="flex items-center p-2 bg-white rounded border cursor-pointer hover:bg-indigo-50">
                                                        <input
                                                            type="radio"
                                                            name={item.name}
                                                            value={opt.value}
                                                            checked={formData[item.name] === opt.value}
                                                            onChange={handleChange}
                                                            required
                                                            className="text-navy-600"
                                                        />
                                                        <span className="ml-2 text-xs text-slate-700">{opt.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Living Situation */}
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-slate-900 mb-6">Living Situation</h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Current Living Arrangement *
                                        </label>
                                        <select
                                            name="livingArrangement"
                                            value={formData.livingArrangement}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:outline-none"
                                        >
                                            <option value="">Select living arrangement</option>
                                            <option value="home-alone">Lives at Home Alone</option>
                                            <option value="home-family">Lives at Home with Family/Spouse</option>
                                            <option value="assisted-living">Assisted Living Facility</option>
                                            <option value="nursing-home">Nursing Home / Skilled Nursing</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Primary Caregiver Name
                                            </label>
                                            <input
                                                type="text"
                                                name="caregiverName"
                                                value={formData.caregiverName}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:outline-none"
                                                placeholder="Caregiver's name"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Caregiver Relationship
                                            </label>
                                            <input
                                                type="text"
                                                name="caregiverRelationship"
                                                value={formData.caregiverRelationship}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:outline-none"
                                                placeholder="e.g., Spouse, Daughter"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Care Hours per Week
                                            </label>
                                            <input
                                                type="text"
                                                name="caregiverHours"
                                                value={formData.caregiverHours}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:outline-none"
                                                placeholder="e.g., 20 hours, 24/7"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Information */}
                            <div className="mb-8">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Additional Information or Notes
                                </label>
                                <textarea
                                    name="additionalNotes"
                                    value={formData.additionalNotes}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:outline-none"
                                    placeholder="Please provide any additional details about the veteran's daily struggles, safety concerns, or medical history..."
                                />
                            </div>

                            {/* Rush Service Option */}
                            <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
                                <label className="flex items-start cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="rushService"
                                        checked={formData.rushService}
                                        onChange={handleChange}
                                        className="mt-1 w-5 h-5 text-navy-600 rounded border-slate-300 focus:ring-navy-500"
                                    />
                                    <div className="ml-3">
                                        <span className="font-semibold text-slate-900">
                                            Request Expedited / Rush Review (3-5 Business Days)
                                        </span>
                                        <p className="text-sm text-slate-600 mt-1">
                                            Additional rush fee applies. Standard review takes 7-10 business days.
                                        </p>
                                    </div>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                                style={{ backgroundColor: '#B91C3C' }}
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                                        <span>Submitting Assessment...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        <span>Submit Assessment for Review</span>
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="bg-white rounded-2xl p-8 shadow-lg">
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                                    Assessment Submitted Successfully!
                                </h2>
                                <p className="text-slate-600">
                                    Please upload any existing medical records, care plans, or physician notes to help our review.
                                </p>
                            </div>

                            {/* File Upload Component */}
                            {showFileUpload && submissionId && (
                                <div className="mb-8">
                                    <FileUpload
                                        formSubmissionId={submissionId}
                                        fileCategory="aid_attendance_records"
                                        maxFiles={10}
                                        maxSizeMB={50}
                                        allowedTypes={['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
                                        onUploadComplete={() => {
                                            toast.success('Document uploaded successfully');
                                        }}
                                        onUploadError={(err) => {
                                            toast.error(`Upload failed: ${err}`);
                                        }}
                                    />
                                    <div className="mt-4">
                                        <FileList formSubmissionId={submissionId} />
                                    </div>
                                </div>
                            )}

                            <div className="text-center">
                                <Link
                                    href="/"
                                    className="inline-flex items-center text-navy-700 font-semibold hover:underline"
                                >
                                    Return to Home Page
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default AidAttendanceForm;
