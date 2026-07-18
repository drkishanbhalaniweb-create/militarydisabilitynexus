import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../../src/lib/supabase';
import AdminLayout from '../../../../src/components/admin/AdminLayout';
import ProtectedRoute from '../../../../src/components/admin/ProtectedRoute';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../../../../src/components/SEO';
import LayoutSectionsManager from '../../../../src/components/admin/LayoutSectionsManager';
import {
    createCustomLayoutSection,
    DEFAULT_SERVICE_SECTIONS,
    getLayoutSectionsShapeError,
    getRenderableLayoutSections,
    hasMeaningfulLayoutRichContent,
    SERVICE_SECTION_ALIASES,
} from '../../../../src/lib/layoutSections';

const getLayoutValidationError = (sections) => {
    if (sections === null) return null;
    const shapeError = getLayoutSectionsShapeError(sections, { aliases: SERVICE_SECTION_ALIASES });
    if (shapeError) return shapeError;

    for (const [index, section] of sections.entries()) {
        const label = `Layout section ${index + 1}`;
        if (section.type === 'custom_rich_text') {
            if (!hasMeaningfulLayoutRichContent(section.content_html)) {
                return `${label} needs text or media content before it can be saved.`;
            }
        }
    }

    return null;
};

const getEditableServiceSections = (sections) => {
    if (sections == null || (Array.isArray(sections) && sections.length === 0)) {
        return DEFAULT_SERVICE_SECTIONS;
    }
    if (!Array.isArray(sections)) return sections;
    if (getLayoutSectionsShapeError(sections, { aliases: SERVICE_SECTION_ALIASES })) return sections;

    return getRenderableLayoutSections(sections, DEFAULT_SERVICE_SECTIONS, {
        aliases: SERVICE_SECTION_ALIASES,
        appendMissingStandards: true,
    });
};

const ServiceForm = () => {
    const router = useRouter();
    const { id } = router.query;

    const [loading, setLoading] = useState(false);
    const [isLoadingService, setIsLoadingService] = useState(true);
    const [serviceLoaded, setServiceLoaded] = useState(false);
    const [loadedServiceId, setLoadedServiceId] = useState(null);
    const [loadError, setLoadError] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        short_description: '',
        ai_citable_lead: '',
        full_description: '',
        base_price_usd: '',
        duration: '',
        category: 'nexus-letter',
        icon: 'file-text',
        is_active: true,
        display_order: 1,
        features: [''],
        faqs: [{ question: '', answer: '' }],
        seo_title: '',
        seo_keywords: '',
        seo_description: '',
        layout_sections: null,
    });

    useEffect(() => {
        if (!router.isReady || !id) return undefined;

        let cancelled = false;

        const fetchService = async () => {
            setIsLoadingService(true);
            setServiceLoaded(false);
            setLoadedServiceId(null);
            setLoadError(null);
            setNotFound(false);

            try {
                const { data, error } = await supabase
                    .from('services')
                    .select('*')
                    .eq('id', id)
                    .maybeSingle();

                if (error) throw error;
                if (cancelled) return;

                if (!data) {
                    setNotFound(true);
                    return;
                }

                setFormData(data);
                setServiceLoaded(true);
                setLoadedServiceId(id);
            } catch (error) {
                if (cancelled) return;
                console.error('Error fetching service:', error);
                setLoadError(error instanceof Error ? error.message : 'Unknown error');
                toast.error('Failed to load service');
            } finally {
                if (!cancelled) setIsLoadingService(false);
            }
        };

        fetchService();

        return () => {
            cancelled = true;
        };
    }, [id, router.isReady]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleFeatureChange = (index, value) => {
        const newFeatures = Array.isArray(formData.features) ? [...formData.features] : [];
        newFeatures[index] = value;
        setFormData({ ...formData, features: newFeatures });
    };

    const addFeature = () => {
        const features = Array.isArray(formData.features) ? formData.features : [];
        setFormData({ ...formData, features: [...features, ''] });
    };

    const removeFeature = (index) => {
        const features = Array.isArray(formData.features) ? formData.features : [];
        const newFeatures = features.filter((_, i) => i !== index);
        setFormData({ ...formData, features: newFeatures });
    };

    const handleFaqChange = (index, field, value) => {
        const newFaqs = Array.isArray(formData.faqs) ? [...formData.faqs] : [];
        newFaqs[index] = { ...(newFaqs[index] || {}), [field]: value };
        setFormData({ ...formData, faqs: newFaqs });
    };

    const addFaq = () => {
        const faqs = Array.isArray(formData.faqs) ? formData.faqs : [];
        setFormData({ ...formData, faqs: [...faqs, { question: '', answer: '' }] });
    };

    const removeFaq = (index) => {
        const faqs = Array.isArray(formData.faqs) ? formData.faqs : [];
        const newFaqs = faqs.filter((_, i) => i !== index);
        setFormData({ ...formData, faqs: newFaqs });
    };

    const generateSlug = (title) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        setFormData({
            ...formData,
            title,
            slug: generateSlug(title),
        });
    };


    // --- Custom Layout System ---
    const handleSectionsChange = (sections) => setFormData(prev => ({ ...prev, layout_sections: sections }));

    const resetLayout = () => {
        if (!window.confirm('Resetting will discard your custom section layout and any custom text boxes you added. Existing service content will not be deleted. Are you sure?')) return;
        setFormData(prev => ({ ...prev, layout_sections: null }));
    };

    const addCustomSection = () => {
        const newId = `custom_rich_text_${Date.now()}`;
        const newSection = createCustomLayoutSection(newId);
        setFormData(prev => {
            const sections = Array.isArray(prev.layout_sections) && prev.layout_sections.length > 0
                ? prev.layout_sections
                : DEFAULT_SERVICE_SECTIONS;
            return {
                ...prev,
                layout_sections: [...sections, newSection]
            };
        });
        return newId;
    };

    const removeCustomSection = (sectionId) => {
        if (!window.confirm('Are you sure you want to remove this custom section? This cannot be undone.')) return;
        setFormData(prev => {
            const sections = Array.isArray(prev.layout_sections) && prev.layout_sections.length > 0
                ? prev.layout_sections
                : DEFAULT_SERVICE_SECTIONS;
            return {
                ...prev,
                layout_sections: sections.filter(section => section.id !== sectionId)
            };
        });
    };

    const updateCustomSection = (sectionId, field, value) => {
        if (field !== 'title' && field !== 'content_html') return;
        setFormData(prev => {
            const sections = Array.isArray(prev.layout_sections) && prev.layout_sections.length > 0
                ? prev.layout_sections
                : DEFAULT_SERVICE_SECTIONS;
            return {
                ...prev,
                layout_sections: sections.map(section =>
                    section.id === sectionId ? { ...section, [field]: value } : section
                )
            };
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isLoadingService || !serviceLoaded || loadedServiceId !== id || loadError || notFound) {
            toast.error('This service has not loaded successfully, so it cannot be saved.');
            return;
        }

        const layoutValidationError = getLayoutValidationError(formData.layout_sections);
        if (layoutValidationError) {
            toast.error(layoutValidationError);
            return;
        }

        setLoading(true);

        try {
            const dataToSave = {
                ...formData,
                base_price_usd: parseInt(formData.base_price_usd),
                display_order: parseInt(formData.display_order),
            };

            const { error } = await supabase
                .from('services')
                .update(dataToSave)
                .eq('id', id);

            if (error) throw error;
            toast.success('Service updated successfully!');

            router.push('/admin/services');
        } catch (error) {
            console.error('Error saving service:', error);
            toast.error('Failed to save service: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const renderFeatures = () => (
        <>
                        {/* Features */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-slate-900">Features</h2>
                                <button
                                    type="button"
                                    onClick={addFeature}
                                    className="text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Add Feature</span>
                                </button>
                            </div>

                            <div className="space-y-3">
                                {(Array.isArray(formData.features) ? formData.features : []).map((feature, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <input
                                            type="text"
                                            value={feature}
                                            onChange={(e) => handleFeatureChange(index, e.target.value)}
                                            placeholder="Feature description"
                                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                        {Array.isArray(formData.features) && formData.features.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeFeature(index)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

        </>
    );

    const renderFaqs = () => (
        <>
                        {/* FAQs */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-slate-900">FAQs</h2>
                                <button
                                    type="button"
                                    onClick={addFaq}
                                    className="text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Add FAQ</span>
                                </button>
                            </div>

                            <div className="space-y-4">
                                {(Array.isArray(formData.faqs) ? formData.faqs : []).map((faq, index) => (
                                    <div key={index} className="border border-slate-200 rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <span className="text-sm font-semibold text-slate-700">FAQ {index + 1}</span>
                                        {Array.isArray(formData.faqs) && formData.faqs.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeFaq(index)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                value={faq.question}
                                                onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                                                placeholder="Question"
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="text-xs font-semibold text-slate-500">Answer</label>
                                                <span className="text-[10px] text-slate-400">Supports [text](url)</span>
                                            </div>
                                            <textarea
                                                value={faq.answer}
                                                onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                                                placeholder="Answer"
                                                rows="2"
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

        </>
    );

    const sectionEditors = {
        included: renderFeatures,
        features: renderFeatures,
        faq: renderFaqs,
        faqs: renderFaqs,
    };

    const isCurrentServiceLoaded = serviceLoaded && loadedServiceId === id;

    if (!router.isReady || !id || isLoadingService || (!isCurrentServiceLoaded && !loadError && !notFound)) {
        return (
            <ProtectedRoute>
                <AdminLayout>
                    <SEO title="Edit Service" noindex={true} />
                    <div className="min-h-[50vh] flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
                    </div>
                </AdminLayout>
            </ProtectedRoute>
        );
    }

    if (notFound) {
        return (
            <ProtectedRoute>
                <AdminLayout>
                    <SEO title="Service Not Found" noindex={true} />
                    <div className="max-w-2xl rounded-xl border border-amber-200 bg-amber-50 p-6">
                        <h1 className="text-xl font-bold text-amber-950">Service not found</h1>
                        <p className="mt-2 text-sm text-amber-900">No service exists for this URL. Nothing was changed.</p>
                        <button
                            type="button"
                            onClick={() => router.push('/admin/services')}
                            className="mt-5 rounded-lg bg-amber-900 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-950"
                        >
                            Back to Services
                        </button>
                    </div>
                </AdminLayout>
            </ProtectedRoute>
        );
    }

    if (loadError || !serviceLoaded) {
        return (
            <ProtectedRoute>
                <AdminLayout>
                    <SEO title="Unable to Load Service" noindex={true} />
                    <div className="max-w-2xl rounded-xl border border-red-200 bg-red-50 p-6">
                        <h1 className="text-xl font-bold text-red-950">Service could not be loaded</h1>
                        <p className="mt-2 text-sm text-red-900">
                            Saving is disabled to protect the existing live content. Reload the page and try again.
                        </p>
                        <div className="mt-5 flex gap-3">
                            <button
                                type="button"
                                onClick={() => router.reload()}
                                className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
                            >
                                Reload Page
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push('/admin/services')}
                                className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-900 hover:bg-red-100"
                            >
                                Back to Services
                            </button>
                        </div>
                    </div>
                </AdminLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <AdminLayout>
                <SEO title="Edit Service" noindex={true} />
                <div className="max-w-4xl">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold text-slate-900">
                            Edit Service
                        </h1>
                        <button
                            onClick={() => router.push('/admin/services')}
                            className="text-slate-600 hover:text-slate-900"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Basic Information</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleTitleChange}
                                        required
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Slug (URL) *
                                    </label>
                                    <input
                                        type="text"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Auto-generated from title</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Short Description *
                                    </label>
                                    <textarea
                                        name="short_description"
                                        value={formData.short_description}
                                        onChange={handleChange}
                                        required
                                        rows="2"
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        AI-Citable Lead <span className="text-xs font-normal text-slate-500">(Used as subtitle on service page & in schema data for AI search engines)</span>
                                    </label>
                                    <textarea
                                        name="ai_citable_lead"
                                        value={formData.ai_citable_lead || ''}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="A direct-answer paragraph that AI search engines can cite when asked about this service."
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">This text appears as the visible subtitle on the service detail page. If empty, short_description is used instead.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Full Description * <span className="text-xs font-normal text-slate-500">(Supports [text](url) for links)</span>
                                    </label>
                                    <textarea
                                        name="full_description"
                                        value={formData.full_description}
                                        onChange={handleChange}
                                        required
                                        rows="4"
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Price (USD) *
                                        </label>
                                        <input
                                            type="number"
                                            name="base_price_usd"
                                            value={formData.base_price_usd}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Duration *
                                        </label>
                                        <input
                                            type="text"
                                            name="duration"
                                            value={formData.duration}
                                            onChange={handleChange}
                                            required
                                            placeholder="e.g., 7-10 business days"
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Category *
                                        </label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="nexus-letter">Nexus Letter</option>
                                            <option value="dbq">DBQ</option>
                                            <option value="aid-attendance">Aid & Attendance</option>
                                            <option value="coaching">Coaching</option>
                                            <option value="consultation">Consultation</option>
                                            <option value="review">Review</option>
                                            <option value="malpractice">Malpractice</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Icon
                                        </label>
                                        <input
                                            type="text"
                                            name="icon"
                                            value={formData.icon}
                                            onChange={handleChange}
                                            placeholder="file-text"
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Display Order
                                        </label>
                                        <input
                                            type="number"
                                            name="display_order"
                                            value={formData.display_order}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={formData.is_active}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                    />
                                    <label className="ml-2 text-sm font-semibold text-slate-700">
                                        Active (visible on website)
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* SEO Settings */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">SEO Settings</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        SEO Title (Tab Title)
                                    </label>
                                    <input
                                        type="text"
                                        name="seo_title"
                                        value={formData.seo_title || ''}
                                        onChange={handleChange}
                                        placeholder="Custom browser tab title"
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">If left blank, the standard Title will be used. This does not change the on-page H1.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        SEO Keywords
                                    </label>
                                    <input
                                        type="text"
                                        name="seo_keywords"
                                        value={formData.seo_keywords || ''}
                                        onChange={handleChange}
                                        placeholder="Custom keywords separated by commas"
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">If left blank, keywords will be automatically generated from Category.</p>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-semibold text-slate-700">
                                            SEO Description
                                        </label>
                                        <span className={`text-xs font-medium ${(formData.seo_description?.length || 0) > 160 ? 'text-red-500' : (formData.seo_description?.length || 0) >= 150 ? 'text-green-600' : 'text-slate-500'}`}>
                                            {formData.seo_description?.length || 0} / 160 chars
                                        </span>
                                    </div>
                                    <textarea
                                        name="seo_description"
                                        value={formData.seo_description || ''}
                                        onChange={handleChange}
                                        rows="2"
                                        placeholder="Custom SEO meta description"
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Best practice is 150-160 characters. If left blank, the Short Description will be used.</p>
                                </div>
                            </div>
                        </div>


                        {/* Layout Sections Manager */}
                        <LayoutSectionsManager
                            sections={getEditableServiceSections(formData.layout_sections)}
                            onSectionsChange={handleSectionsChange}
                            sectionAliases={SERVICE_SECTION_ALIASES}
                            sectionEditors={sectionEditors}
                            contentIndicators={{
                                overview: [formData.full_description, formData.short_description, formData.ai_citable_lead]
                                    .some(value => typeof value === 'string' && value.trim().length > 0),
                                included: Array.isArray(formData.features)
                                    && formData.features.some(feature => typeof feature === 'string' && feature.trim().length > 0),
                                features: Array.isArray(formData.features)
                                    && formData.features.some(feature => typeof feature === 'string' && feature.trim().length > 0),
                                pricing: formData.slug === 'independent-medical-opinion-nexus-letter',
                                systems: Boolean(formData.slug),
                                faq: Array.isArray(formData.faqs)
                                    && formData.faqs.some(faq =>
                                        typeof faq?.question === 'string' && faq.question.trim().length > 0
                                        && typeof faq?.answer === 'string' && faq.answer.trim().length > 0
                                    ),
                                faqs: Array.isArray(formData.faqs)
                                    && formData.faqs.some(faq =>
                                        typeof faq?.question === 'string' && faq.question.trim().length > 0
                                        && typeof faq?.answer === 'string' && faq.answer.trim().length > 0
                                    ),
                                insights: Boolean(formData.title?.trim() || formData.category?.trim()),
                                testimonials: Boolean(formData.slug),
                                related_services: true,
                            }}
                            onAddCustomSection={addCustomSection}
                            onRemoveCustomSection={removeCustomSection}
                            onUpdateCustomSection={updateCustomSection}
                            onResetSections={formData.layout_sections != null ? resetLayout : undefined}
                        />
                        {/* Submit Buttons */}
                        <div className="flex items-center justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => router.push('/admin/services')}
                                className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || isLoadingService || !isCurrentServiceLoaded || Boolean(loadError) || notFound}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-2"
                            >
                                <Save className="w-5 h-5" />
                                <span>{loading ? 'Saving...' : 'Update Service'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
};

export default ServiceForm;
