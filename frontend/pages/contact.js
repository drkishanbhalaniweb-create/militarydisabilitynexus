import { useState } from 'react';
import { useRouter } from 'next/router';
import { Mail, Phone, Send, Upload, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { contactsApi } from '../src/lib/api';
import FileUpload from '../src/components/FileUpload';
import FileList from '../src/components/FileList';
import SuccessModal from '../src/components/SuccessModal';
import SEO from '../src/components/SEO';
import Layout from '../src/components/Layout';

const Contact = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        serviceTypes: [], // Changed from subject to serviceTypes array
        message: '',
    });

    const SERVICE_TYPES = [
        { value: 'nexus_letter', label: 'Nexus Letter' },
        { value: 'dbq', label: 'Disability Benefits Questionnaires (DBQs)' },
        { value: '1151_claim', label: '1151 Claim (VA Medical Malpractice)' },
        { value: 'aid_attendance', label: 'Aid & Attendance' },
        { value: 'unsure', label: "I'm not sure what I need" },
    ];
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [contactId, setContactId] = useState(null);
    const [showFileUpload, setShowFileUpload] = useState(false);
    const [fileRefreshTrigger, setFileRefreshTrigger] = useState(0);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await contactsApi.submit(formData);
            setContactId(response.id);
            setShowFileUpload(true);
            setShowSuccessModal(true);
            setFormData({ name: '', email: '', phone: '', serviceTypes: [], message: '' });
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('Failed to send message. Please try again.');
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
                        src="/contactimg.png"
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
                                                <div className="text-slate-600">+1 307 318 1367</div>
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

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                    Name *
                                                </label>
                                                <input
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
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                    Email *
                                                </label>
                                                <input
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
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Phone
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
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
                                                {SERVICE_TYPES.map((type) => (
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
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Message *
                                            </label>
                                            <textarea
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                required
                                                rows="6"
                                                data-testid="contact-message-input"
                                                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/40 rounded-lg focus:border-indigo-500 focus:outline-none resize-none shadow-sm"
                                            />
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
                </div >
            </div >
        </Layout>
    );
};

export default Contact;
