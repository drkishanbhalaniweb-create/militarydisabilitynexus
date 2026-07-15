import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { Send, Upload, X, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../src/components/SEO';
import SuccessModal from '../src/components/SuccessModal';
import { fileUploadApi, formSubmissionsApi, servicesApi, pricingTierApi } from '../src/lib/api';
import Layout from '../src/components/Layout';
import { createSubmissionMeta, validateSubmissionMeta } from '../src/lib/submissionValidation';

// Maps CMS service slugs to canonical values for ?service= URL param auto-selection
const SERVICE_SLUG_MAP = {
    'independent-medical-opinion-nexus-letter': 'independent-medical-opinion-nexus-letter',
    'nexus-letter': 'independent-medical-opinion-nexus-letter',
    'nexus_letter': 'independent-medical-opinion-nexus-letter',
    'disability-benefits-questionnaire-dbq': 'disability-benefits-questionnaire-dbq',
    'dbq': 'disability-benefits-questionnaire-dbq',
    'va-medical-malpractice-1151-case': 'va-1151-claim',
    '1151-claim': 'va-1151-claim',
    '1151_claim': 'va-1151-claim',
    'va-1151-claim': 'va-1151-claim',
    'aid-attendance': 'aid-and-attendance',
    'aid-and-attendance': 'aid-and-attendance',
    'aid_attendance': 'aid-and-attendance',
};

const Forms = () => {
    const router = useRouter();
    const formStartedAt = useRef(Date.now());

    // Check URL parameters to determine initial view and pre-selected service
    const { view, service, tier } = router.query;
    const initialView = view === 'schedule';

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        formType: 'unsure',
        additionalDetails: '',
        rushService: false,
        website: '',
    });
    const [services, setServices] = useState([]);
    const [pricingTiers, setPricingTiers] = useState([]);
    const [selectedPricingTier, setSelectedPricingTier] = useState('');
    
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showCal, setShowCal] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [dbServices, dbTiers] = await Promise.all([
                    servicesApi.getAll(),
                    pricingTierApi.getAll()
                ]);
                
                const formatted = dbServices.map(s => ({
                    value: s.slug,
                    label: s.title
                }));
                formatted.push({
                    value: 'unsure',
                    label: "I'm not sure what I need"
                });
                
                setServices(formatted);
                setPricingTiers(dbTiers);
            } catch (error) {
                console.error('Failed to load services or pricing tiers:', error);
                setServices([
                    { value: 'independent-medical-opinion-nexus-letter', label: 'Independent Medical Opinion (IMO) / Nexus Letter' },
                    { value: 'disability-benefits-questionnaire-dbq', label: 'Disability Benefits Questionnaire (DBQ)' },
                    { value: 'va-1151-claim', label: '1151 Claim (VA Medical Malpractice)' },
                    { value: 'aid-and-attendance', label: 'Aid & Attendance (21-2680)' },
                    { value: 'unsure', label: "I'm not sure what I need" }
                ]);
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        if (router.isReady) {
            setShowCal(initialView);

            // Auto-select service from URL parameter (e.g., ?service=disability-benefits-questionnaire-dbq)
            if (service) {
                const mappedService = SERVICE_SLUG_MAP[service] || service;
                const finalService = mappedService === 'nexus_letter' ? 'independent-medical-opinion-nexus-letter' :
                                      mappedService === 'dbq' ? 'disability-benefits-questionnaire-dbq' :
                                      mappedService === '1151_claim' ? 'va-1151-claim' :
                                      mappedService === 'aid_attendance' ? 'aid-and-attendance' : mappedService;
                setFormData(prev => ({ ...prev, formType: finalService }));
                
                // If it's a nexus letter and tier is provided, select it!
                if ((finalService === 'independent-medical-opinion-nexus-letter' || finalService === 'nexus-letter') && tier) {
                    setSelectedPricingTier(tier);
                }
            }
        }
    }, [router.isReady, initialView, service, tier]);

    // Load Cal.com inline embed
    useEffect(() => {
        if (showCal) {
            if (typeof document === 'undefined') return;

            // Load Cal.com embed script
            const script = document.createElement('script');
            script.src = 'https://app.cal.com/embed/embed.js';
            script.async = true;
            document.head.appendChild(script);

            return () => {
                if (document.head.contains(script)) {
                    document.head.removeChild(script);
                }
            };
        }
    }, [showCal]);

    // Update URL when toggling views (only when showCal changes via user interaction)
    useEffect(() => {
        if (!router.isReady) return;

        const currentView = router.query.view;

        // Only update URL if the state doesn't match the current URL
        // This prevents loops by only updating when there's a mismatch
        if (showCal && currentView !== 'schedule') {
            router.replace({ pathname: router.pathname, query: { view: 'schedule' } }, undefined, { shallow: true });
        } else if (!showCal && currentView === 'schedule') {
            router.replace({ pathname: router.pathname, query: {} }, undefined, { shallow: true });
        }
    }, [showCal]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear pricing tier if service changes
        if (name === 'formType') {
            setSelectedPricingTier('');
        }
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
        
        // Check pricing tier selection for Nexus Letter
        if ((formData.formType === 'independent-medical-opinion-nexus-letter' || formData.formType === 'nexus-letter') && !selectedPricingTier) {
            toast.error('Please select a pricing tier.');
            return;
        }

        setIsSubmitting(true);

        // Helper to map dynamic service slug to DB-compatible form_type
        const getDbFormType = (val) => {
            const map = {
                'independent-medical-opinion-nexus-letter': 'nexus_letter',
                'nexus_letter': 'nexus_letter',
                'disability-benefits-questionnaire-dbq': 'dbq',
                'dbq': 'dbq',
                'va-medical-malpractice-1151-case': '1151_claim',
                'va-1151-claim': '1151_claim',
                '1151_claim': '1151_claim',
                'aid-and-attendance': 'aid_attendance',
                'aid_attendance': 'aid_attendance',
                'claim-readiness-review': 'claim_readiness_review',
                'claim_readiness_review': 'claim_readiness_review',
                'unsure': 'unsure'
            };
            return map[val] || 'general';
        };

        try {
            const submissionMeta = createSubmissionMeta({
                honeypot: formData.website,
                startedAt: formStartedAt.current,
            });
            validateSubmissionMeta(submissionMeta);

            // Submit form data first
            const submission = await formSubmissionsApi.submit({
                formType: getDbFormType(formData.formType),
                fullName: formData.name,
                email: formData.email,
                phone: formData.phone,
                formData: {
                    additionalDetails: formData.additionalDetails,
                    selectedServiceSlug: formData.formType,
                    selectedPricingTier: (formData.formType === 'independent-medical-opinion-nexus-letter' || formData.formType === 'nexus-letter') ? selectedPricingTier : undefined
                },
                requiresUpload: false,
            }, submissionMeta);

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
                rushService: false,
                website: '',
            });
            setSelectedFiles([]);
            setSelectedPricingTier('');
            formStartedAt.current = Date.now();
        } catch (error) {
            console.error('Form submission error:', error);
            toast.error(error.message || 'Failed to submit form. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const wordCount = formData.additionalDetails.trim().split(/\s+/).filter(Boolean).length;
    const maxWords = 250;

    return (
        <Layout>
            <SEO
                title="Get Started - VA Disability Claim Documentation Services"
                description="Submit your information to get started with professional VA disability claim documentation. Expert nexus letters, DBQs, Aid & Attendance evaluations, and medical consultations from licensed clinicians."
                keywords="VA claim form, nexus letter request, DBQ evaluation form, aid and attendance application, veteran medical documentation request"
                canonical="/forms"
            />

            <div className="relative min-h-screen py-16 overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="fixed inset-0 z-0 overflow-hidden">
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{
                            backgroundImage: 'url("/form bg image.webp")',
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
                                className={`px-6 py-3 rounded-lg font-semibold transition-all ${!showCal
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
                                className={`px-6 py-3 rounded-lg font-semibold transition-all ${showCal
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
                                {/* Cal.com Inline Embed */}
                                <iframe
                                    src="https://cal.com/militarydisabilitynexus/discovery-call-military-disability-nexus?embed=true"
                                    width="100%"
                                    height="700"
                                    frameBorder="0"
                                    style={{ border: 0 }}
                                    title="Schedule Discovery Call"
                                />
                            </div>
                            <p className="text-sm text-slate-500 mt-4 text-center">
                                Having trouble? <a href="https://cal.com/militarydisabilitynexus/discovery-call-military-disability-nexus" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Open in new window</a>
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/40">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Request Your Medical Documentation</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                                    <label htmlFor="forms-website">Website</label>
                                    <input
                                        id="forms-website"
                                        type="text"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        tabIndex={-1}
                                        autoComplete="off"
                                    />
                                </div>
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
                                        {services.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>

                                    {/* Pricing Tier Selection for Nexus Letter */}
                                    {(formData.formType === 'independent-medical-opinion-nexus-letter' || formData.formType === 'nexus-letter') && (
                                        <div className="mt-6 border-t border-slate-200/50 pt-6 animate-fadeIn">
                                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                                                Choose Provider Tier / Pricing Option <span className="text-red-500">*</span>
                                            </label>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                {pricingTiers.map((tier) => {
                                                    const isSelected = selectedPricingTier === tier.slug;
                                                    return (
                                                        <button
                                                            key={tier.id}
                                                            type="button"
                                                            onClick={() => setSelectedPricingTier(tier.slug)}
                                                            className={`text-left p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.01] hover:shadow-md flex flex-col h-full relative overflow-hidden ${
                                                                isSelected
                                                                    ? 'border-navy-600 bg-navy-50/20 ring-1 ring-navy-600'
                                                                    : 'border-slate-200/60 bg-white hover:border-slate-300'
                                                            }`}
                                                        >
                                                            {/* Selected Checkmark Indicator */}
                                                            {isSelected && (
                                                                <div className="absolute top-0 right-0 bg-navy-600 text-white p-1 rounded-bl-lg">
                                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                            
                                                            <div className="mb-2 pr-4">
                                                                <span className="text-xs font-bold text-slate-900 block leading-tight">
                                                                    {tier.name}
                                                                </span>
                                                                {tier.provider_description && (
                                                                    <span className="text-[10px] text-slate-500 block mt-0.5">
                                                                        {tier.provider_description}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            
                                                            <div className="mb-2">
                                                                <span className="text-lg font-black text-navy-800">
                                                                    {tier.base_price}
                                                                </span>
                                                                {tier.note && (
                                                                    <span className="text-[9px] text-slate-500 block leading-normal">
                                                                        {tier.note}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            
                                                            {tier.best_for && (
                                                                <div className="mt-auto pt-2 border-t border-slate-100 w-full">
                                                                    <p className="text-[10px] text-slate-600 leading-tight">
                                                                        <span className="font-semibold text-slate-700">Best for: </span>
                                                                        {tier.best_for}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            
                                            {/* Tier features list for the selected tier */}
                                            {selectedPricingTier && (
                                                <div className="mt-4 p-4 bg-slate-50 border border-slate-200/60 rounded-xl animate-fadeIn">
                                                    {pricingTiers.find(t => t.slug === selectedPricingTier)?.features && (
                                                        <>
                                                            <h4 className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Included Features:</h4>
                                                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5">
                                                                {pricingTiers.find(t => t.slug === selectedPricingTier).features.map((feature, i) => (
                                                                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                                                                        <span className="leading-tight">{feature}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                            
                                            {!selectedPricingTier && (
                                                <p className="text-xs text-amber-600 mt-2 font-medium">Please select a pricing tier/option to complete your request.</p>
                                            )}
                                        </div>
                                    )}
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
                                        placeholder="+1 888 215 9785"
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
                                        Additional Details <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="additionalDetails"
                                        name="additionalDetails"
                                        value={formData.additionalDetails}
                                        onChange={handleChange}
                                        required
                                        rows={6}
                                        maxLength={maxWords * 6}
                                        className="w-full px-4 py-3 border border-white/30 bg-white/50 backdrop-blur-sm rounded-lg focus:ring-2 focus:ring-navy-400 focus:border-transparent transition-all resize-none text-slate-900 placeholder:text-slate-600"
                                        placeholder="Briefly describe your case or what you need help with"
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
                                    disabled={isSubmitting || wordCount > maxWords || ((formData.formType === 'independent-medical-opinion-nexus-letter' || formData.formType === 'nexus-letter') && !selectedPricingTier)}
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
        </Layout>
    );
};

export default Forms;
