import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { conditionApi, servicesApi } from '../../../src/lib/api';
import AdminLayout from '../../../src/components/admin/AdminLayout';
import ProtectedRoute from '../../../src/components/admin/ProtectedRoute';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../../../src/components/SEO';
import Link from 'next/link';

const ConditionForm = () => {
    const router = useRouter();
    const { id } = router.query;
    const isNew = id === 'new';

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const [allServices, setAllServices] = useState([]);
    
    const [formData, setFormData] = useState({
        page_title: '',
        slug: '',
        meta_description: '',
        hero_heading: '',
        content_html: '',
        is_published: true,
        faqs: [],
        related_service_ids: []
    });

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch available services for the selector
            const services = await servicesApi.getAll();
            setAllServices(services || []);

            if (!isNew) {
                const condition = await conditionApi.getById(id);
                if (condition) {
                    setFormData({
                        page_title: condition.page_title || '',
                        slug: condition.slug || '',
                        meta_description: condition.meta_description || '',
                        hero_heading: condition.hero_heading || '',
                        content_html: condition.content_html || '',
                        is_published: condition.is_published ?? true,
                        faqs: condition.faqs || [],
                        related_service_ids: condition.related_service_ids || []
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data');
            setLoadError(true);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleServiceToggle = (serviceId) => {
        setFormData(prev => {
            const current = prev.related_service_ids || [];
            if (current.includes(serviceId)) {
                return { ...prev, related_service_ids: current.filter(id => id !== serviceId) };
            } else {
                return { ...prev, related_service_ids: [...current, serviceId] };
            }
        });
    };

    const addFaq = () => {
        setFormData(prev => ({
            ...prev,
            faqs: [...(prev.faqs || []), { question: '', answer: '' }]
        }));
    };

    const removeFaq = (index) => {
        setFormData(prev => ({
            ...prev,
            faqs: prev.faqs.filter((_, i) => i !== index)
        }));
    };

    const updateFaq = (index, field, value) => {
        setFormData(prev => {
            const newFaqs = [...prev.faqs];
            newFaqs[index] = { ...newFaqs[index], [field]: value };
            return { ...prev, faqs: newFaqs };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (loadError && !isNew) {
            toast.error('Cannot save because the condition failed to load properly.');
            return;
        }

        setSaving(true);

        try {
            if (isNew) {
                await conditionApi.create(formData);
                toast.success('Condition created successfully');
                router.push('/admin/conditions');
            } else {
                await conditionApi.update(id, formData);
                toast.success('Condition updated successfully');
            }
        } catch (error) {
            console.error('Error saving condition:', error);
            const safeMessage = error instanceof Error ? error.message : String(error) || 'Unknown error';
            toast.error('Failed to save condition: ' + safeMessage);
        } finally {
            setSaving(false);
        }
    };

    if (loading && id) {
        return (
            <ProtectedRoute>
                <AdminLayout>
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
                    </div>
                </AdminLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <AdminLayout>
                <SEO title={isNew ? "Create Condition" : "Edit Condition"} noindex={true} />
                
                {loadError && !isNew && (
                    <div className="max-w-5xl mx-auto mb-6 bg-red-50 border-l-4 border-red-500 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">
                                    Error loading condition data. Please do not submit this form as it may overwrite existing data.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8 pb-20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link href="/admin/conditions" className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                <ArrowLeft className="w-5 h-5 text-slate-600" />
                            </Link>
                            <h1 className="text-3xl font-bold text-slate-900">
                                {isNew ? 'Create New Condition' : 'Edit Condition'}
                            </h1>
                        </div>
                        <button
                            type="submit"
                            disabled={saving || (loadError && !isNew)}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2 disabled:opacity-50 transition-colors"
                        >
                            <Save className="w-5 h-5" />
                            <span>{saving ? 'Saving...' : 'Save Condition'}</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Info */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                                <h2 className="text-xl font-semibold text-slate-900 border-b border-slate-100 pb-3">Basic Information</h2>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Hero Heading (H1)</label>
                                    <input
                                        type="text"
                                        name="hero_heading"
                                        value={formData.hero_heading}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                                        placeholder="e.g. VA Disability Evidence for Sleep Apnea"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">URL Slug</label>
                                    <input
                                        type="text"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                                        placeholder="e.g. sleep-apnea (leave blank to auto-generate)"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Content / Requirements (HTML)</label>
                                    <p className="text-xs text-slate-500 mb-2">You can use basic HTML like &lt;p&gt;, &lt;h3&gt;, &lt;ul&gt; &lt;li&gt;</p>
                                    <textarea
                                        name="content_html"
                                        value={formData.content_html}
                                        onChange={handleInputChange}
                                        required
                                        rows={12}
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow font-mono text-sm"
                                        placeholder="<p>To establish direct service connection for...</p>"
                                    />
                                </div>
                            </div>

                            {/* FAQs */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <h2 className="text-xl font-semibold text-slate-900">Frequently Asked Questions</h2>
                                    <button
                                        type="button"
                                        onClick={addFaq}
                                        className="text-indigo-600 hover:text-indigo-700 flex items-center text-sm font-medium"
                                    >
                                        <Plus className="w-4 h-4 mr-1" /> Add FAQ
                                    </button>
                                </div>

                                {formData.faqs.length === 0 ? (
                                    <p className="text-sm text-slate-500 italic">No FAQs added yet. FAQs are highly recommended for GEO/AI citation.</p>
                                ) : (
                                    <div className="space-y-6">
                                        {formData.faqs.map((faq, index) => (
                                            <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-lg relative">
                                                <button
                                                    type="button"
                                                    onClick={() => removeFaq(index)}
                                                    className="absolute top-4 right-4 text-slate-400 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <div className="space-y-3 pr-8">
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Question {index + 1}</label>
                                                        <input
                                                            type="text"
                                                            value={faq.question}
                                                            onChange={(e) => updateFaq(index, 'question', e.target.value)}
                                                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Answer</label>
                                                        <textarea
                                                            value={faq.answer}
                                                            onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                                                            rows={3}
                                                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar Column */}
                        <div className="space-y-6">
                            {/* SEO Metadata */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                                <h2 className="text-xl font-semibold text-slate-900 border-b border-slate-100 pb-3">SEO Metadata</h2>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Page Title</label>
                                    <input
                                        type="text"
                                        name="page_title"
                                        value={formData.page_title}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Between 50-60 characters</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Meta Description</label>
                                    <textarea
                                        name="meta_description"
                                        value={formData.meta_description}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Between 150-160 characters</p>
                                </div>
                            </div>

                            {/* Related Services */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                                <h2 className="text-xl font-semibold text-slate-900 border-b border-slate-100 pb-3">Related Services</h2>
                                <p className="text-xs text-slate-500 mb-2">Select which services to link in the sidebar funnel.</p>
                                
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                    {allServices.map(service => (
                                        <label key={service.id} className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={(formData.related_service_ids || []).includes(service.id)}
                                                onChange={() => handleServiceToggle(service.id)}
                                                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                            />
                                            <span className="text-sm font-medium text-slate-700">{service.title}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Publishing */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <h2 className="text-xl font-semibold text-slate-900 border-b border-slate-100 pb-3 mb-4">Publishing</h2>
                                
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="is_published"
                                        checked={formData.is_published}
                                        onChange={handleInputChange}
                                        className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                    />
                                    <span className="font-medium text-slate-700">Published (Visible on site)</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </form>
            </AdminLayout>
        </ProtectedRoute>
    );
};

export default ConditionForm;
