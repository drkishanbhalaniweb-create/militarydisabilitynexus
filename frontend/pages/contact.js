import { useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Mail, Phone, Send, Calendar, Upload, X, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { contactsApi, servicesApi, fileUploadApi } from '../src/lib/api';
import { useEffect } from 'react';
import FileUpload from '../src/components/FileUpload';
import FileList from '../src/components/FileList';
import SuccessModal from '../src/components/SuccessModal';
import SEO from '../src/components/SEO';
import Layout from '../src/components/Layout';
import { createSubmissionMeta, validateSubmissionMeta } from '../src/lib/submissionValidation';
import { formatPhoneNumber } from '../src/lib/phoneUtils';

const Contact = () => {
    const router = useRouter();
    const formStartedAt = useRef(Date.now());
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        serviceTypes: [], // Changed from subject to serviceTypes array
        message: '',
        website: '',
    });

    const [services, setServices] = useState([]);
    useEffect(() => {
        const loadServices = async () => {
            try {
                const dbServices = await servicesApi.getAll();
                const formatted = dbServices.map(s => ({
                    value: s.slug,
                    label: s.title
                }));
                formatted.push({
                    value: 'unsure',
                    label: "I'm not sure what I need"
                });
                setServices(formatted);
            } catch (error) {
                console.error('Failed to load services:', error);
                setServices([
                    { value: 'independent-medical-opinion-nexus-letter', label: 'Independent Medical Opinion (IMO) / Nexus Letter' },
                    { value: 'disability-benefits-questionnaire-dbq', label: 'Disability Benefits Questionnaire (DBQ)' },
                    { value: 'va-1151-claim', label: '1151 Claim (VA Medical Malpractice)' },
                    { value: 'aid-and-attendance', label: 'Aid & Attendance (21-2680)' },
                    { value: 'unsure', label: "I'm not sure what I need" }
                ]);
            }
        };
        loadServices();
    }, []);

    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [contactId, setContactId] = useState(null);
    const [showFileUpload, setShowFileUpload] = useState(false);
    const [fileRefreshTrigger, setFileRefreshTrigger] = useState(0);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'phone' ? formatPhoneNumber(value) : value,
        });
    };

    const handleServiceTypeToggle = (value) => {
        setFormData(prev => ({
            ...prev,
            serviceTypes: prev.serviceTypes.includes(value)
                ? prev.serviceTypes.filter(t => t !== value)
                : [...prev.serviceTypes, value]
        }));
    };

    const handleFileSelect = (e) => {
        const newFiles = Array.from(e.target.files || []);
        if (newFiles.length === 0) return;

        const maxFiles = 10;
        if (selectedFiles.length + newFiles.length > maxFiles) {
            toast.error(`Maximum ${maxFiles} files allowed`);
            return;
        }

        const validFiles = [];
        for (const file of newFiles) {
            if (file.size > 50 * 1024 * 1024) {
                toast.error(`${file.name} exceeds the 50MB file size limit`);
                continue;
            }
            validFiles.push(file);
        }

        if (validFiles.length > 0) {
            setSelectedFiles(prev => [...prev, ...validFiles]);
        }
        e.target.value = '';
    };

    const removeSelectedFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
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

            const response = await contactsApi.submit(formData, submissionMeta);
            setContactId(response.id);

            // Upload staged files if any
            if (selectedFiles.length > 0) {
                for (const file of selectedFiles) {
                    try {
                        await fileUploadApi.upload(file, response.id, 'other', false);
                    } catch (uploadErr) {
                        console.error('Failed to upload file:', file.name, uploadErr);
                        toast.error(`Failed to upload ${file.name}`);
                    }
                }
                setFileRefreshTrigger(prev => prev + 1);
            }

            setShowFileUpload(true);
            setShowSuccessModal(true);
            setFormData({ name: '', email: '', phone: '', serviceTypes: [], message: '', website: '' });
            setSelectedFiles([]);
            formStartedAt.current = Date.now();
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error(error.message || 'Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle file upload completion
    const handleFileUploadComplete = (uploadedFile) => {
        toast.success(`File "${uploadedFile.original_filename}" uploaded successfully!`);
        setFileRefreshTrigger(prev => prev + 1); // Trigger file list refresh
    };

    // Handle file upload error
    const handleFileUploadError = (error) => {
        toast.error(`Upload failed: ${error}`);
    };

    return (
        <Layout>
            <SEO
                title="Contact Us - Free VA Claim Consultation"
                description="Contact Military Disability Nexus for a free consultation on your VA disability claim. Get expert guidance on nexus letters, DBQs, and medical documentation from licensed clinicians."
                keywords="VA claim consultation, contact veteran medical experts, free case review, nexus letter consultation"
                breadcrumbs={[
                    { name: 'Home', path: '/' },
                    { name: 'Contact', path: '/contact' }
                ]}
            />
            <div className="relative min-h-screen overflow-hidden">
                {/* Fixed Background */}
                <div className="fixed inset-0 z-0 overflow-hidden">
                    <img
                        src="/contactimg.webp"
                        alt="Background pattern"
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{
                            filter: 'blur(4px)',
                            transform: 'scale(1.1)'
                        }}
                        role="presentation"
                        aria-hidden="true"
                    />
                    <div className="absolute inset-0 bg-white/50"></div>
                </div>

                <div className="relative z-10">
                    {/* Hero */}
                    <section className="py-20">
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6 drop-shadow-sm">Contact Us</h1>
                            <p className="text-xl text-slate-700">
                                Get in touch for a free case review or to ask questions
                            </p>
                        </div>
                    </section>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                            {/* Contact Info */}
                            <section className="lg:col-span-1 space-y-6 lg:space-y-8">
                                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/40">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Get in Touch</h2>
                                    <div className="space-y-4">
                                        <div className="flex items-start space-x-4">
                                            <div className="w-10 h-10 bg-gradient-to-br from-navy-600 to-navy-800 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                                                <Mail className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-900">Email</div>
                                                <div className="text-slate-600">contact@militarydisabilitynexus.com</div>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-4">
                                            <div className="w-10 h-10 bg-gradient-to-br from-navy-600 to-navy-800 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                                                <Phone className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-900">Phone</div>
                                                <div className="text-slate-600">+1 888 215 9785</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Schedule Call Button */}
                                    <div className="mt-6 pt-6 border-t border-slate-200">
                                        <button
                                            onClick={() => router.push('/forms?view=schedule')}
                                            className="w-full text-white px-6 py-3 rounded-lg font-semibold hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center space-x-2"
                                            style={{ backgroundColor: '#B91C3C' }}
                                        >
                                            <Calendar className="w-5 h-5" />
                                            <span>Schedule Discovery Call</span>
                                        </button>
                                    </div>
                                </div>
                            </section>

                            {/* Contact Form */}
                            <section className="lg:col-span-2">
                                <div className="space-y-6 lg:space-y-8">
                                    <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/40">
                                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Send Us a Message</h2>

                                        <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                                            <label htmlFor="contact-website">Website</label>
                                            <input
                                                id="contact-website"
                                                type="text"
                                                name="website"
                                                value={formData.website}
                                                onChange={handleChange}
                                                tabIndex={-1}
                                                autoComplete="off"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            <div>
                                                <label htmlFor="contact-name" className="block text-sm font-semibold text-slate-700 mb-2">
                                                    Name *
                                                </label>
                                                <input
                                                    id="contact-name"
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                    data-testid="contact-name-input"
                                                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/40 rounded-lg focus:border-indigo-500 focus:outline-none shadow-sm"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="contact-email" className="block text-sm font-semibold text-slate-700 mb-2">
                                                    Email *
                                                </label>
                                                <input
                                                    id="contact-email"
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                    data-testid="contact-email-input"
                                                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/40 rounded-lg focus:border-indigo-500 focus:outline-none shadow-sm"
                                                />
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <label htmlFor="contact-phone" className="block text-sm font-semibold text-slate-700 mb-2">
                                                Phone *
                                            </label>
                                            <input
                                                id="contact-phone"
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                required
                                                placeholder="(555) 000-0000"
                                                data-testid="contact-phone-input"
                                                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/40 rounded-lg focus:border-indigo-500 focus:outline-none shadow-sm"
                                            />
                                        </div>

                                        {/* Service Types - Multiple Selection */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                                                What services are you interested in? * (Select all that apply)
                                            </label>
                                            <div className="space-y-2">
                                                {services.map((type) => (
                                                    <label
                                                        key={type.value}
                                                        className="flex items-center cursor-pointer p-3 bg-white/60 backdrop-blur-sm border border-white/40 rounded-lg hover:bg-navy-50/60 transition-colors"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.serviceTypes.includes(type.value)}
                                                            onChange={() => handleServiceTypeToggle(type.value)}
                                                            className="w-4 h-4 text-navy-600 border-slate-300 rounded focus:ring-navy-500"
                                                        />
                                                        <span className="ml-3 text-slate-700">{type.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            {formData.serviceTypes.length === 0 && (
                                                <p className="text-sm text-slate-500 mt-2">Please select at least one service type</p>
                                            )}
                                        </div>

                                        <div className="mb-6">
                                            <label htmlFor="contact-message" className="block text-sm font-semibold text-slate-700 mb-2">
                                                Message *
                                            </label>
                                            <textarea
                                                id="contact-message"
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                required
                                                minLength={10}
                                                rows="6"
                                                data-testid="contact-message-input"
                                                placeholder="Please describe how we can help you (minimum 10 characters)..."
                                                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/40 rounded-lg focus:border-indigo-500 focus:outline-none resize-none shadow-sm"
                                            />
                                            {formData.message.length > 0 && formData.message.length < 10 && (
                                                <p className="text-sm text-amber-600 mt-1">Please add a little more detail ({formData.message.length}/10 characters minimum)</p>
                                            )}
                                        </div>

                                        {/* Optional Supporting Documents */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Upload Supporting Documents (Optional)
                                            </label>
                                            <div className="border-2 border-dashed border-slate-300 bg-white/40 backdrop-blur-sm rounded-xl p-6 transition-colors hover:border-slate-400">
                                                <label className="cursor-pointer block text-center">
                                                    <input
                                                        type="file"
                                                        multiple
                                                        onChange={handleFileSelect}
                                                        className="hidden"
                                                        accept="image/*,.pdf,.doc,.docx,.txt"
                                                    />
                                                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                                    <span className="text-sm font-semibold text-slate-700 block mb-1">
                                                        Click to attach documents
                                                    </span>
                                                    <p className="text-xs text-slate-500">
                                                        PDF, DOC, DOCX, TXT, or images (up to 50MB each)
                                                    </p>
                                                </label>

                                                {selectedFiles.length > 0 && (
                                                    <div className="mt-4 space-y-2">
                                                        {selectedFiles.map((file, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex items-center justify-between bg-white/80 px-3 py-2 rounded-lg border border-slate-200"
                                                            >
                                                                <div className="flex items-center space-x-2 truncate mr-2">
                                                                    <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                                                    <span className="text-sm text-slate-700 truncate">{file.name}</span>
                                                                    <span className="text-xs text-slate-400 flex-shrink-0">
                                                                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                                    </span>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeSelectedFile(index)}
                                                                    className="text-red-500 hover:text-red-700 p-1 flex-shrink-0 transition-colors"
                                                                    aria-label={`Remove ${file.name}`}
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading || formData.serviceTypes.length === 0}
                                            data-testid="contact-submit-button"
                                            className="w-full text-white px-8 py-4 rounded-full font-semibold hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                            style={{ backgroundColor: '#B91C3C' }}
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                                                    <span>Sending...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-5 h-5" />
                                                    <span>Send Message</span>
                                                </>
                                            )}
                                        </button>
                                    </form>

                                    {/* File Upload Section */}
                                    {showFileUpload && contactId && (
                                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/40">
                                            <h4 className="text-xl font-bold text-slate-900 mb-6">Upload Documents</h4>
                                            <FileUpload
                                                contactId={contactId}
                                                onUploadComplete={handleFileUploadComplete}
                                                onUploadError={handleFileUploadError}
                                                maxFiles={10}
                                                acceptedTypes="image/*,.pdf,.doc,.docx,.txt"
                                                maxSizeInMB={50}
                                            />
                                        </div>
                                    )}

                                    {/* File List Section */}
                                    {contactId && (
                                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/40">
                                            <FileList
                                                contactId={contactId}
                                                refreshTrigger={fileRefreshTrigger}
                                            />
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* Success Modal */}
                        <SuccessModal
                            isOpen={showSuccessModal}
                            onClose={() => setShowSuccessModal(false)}
                            title="Message Sent!"
                            message="Thank you for contacting Military Disability Nexus - a member of our clinical intake team will review your submission and respond within 1–2 business days."
                        />
                    </div>
                </div>
            </div >
        </Layout>
    );
};

export default Contact;
