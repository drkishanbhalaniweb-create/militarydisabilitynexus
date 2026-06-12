import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { conditionApi, servicesApi, bodySystemApi } from '../../../src/lib/api';
import AdminLayout from '../../../src/components/admin/AdminLayout';
import ProtectedRoute from '../../../src/components/admin/ProtectedRoute';
import { ArrowLeft, Save, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../../../src/components/SEO';
import Link from 'next/link';
import InternalLinkSearchPicker from '../../../src/components/admin/InternalLinkSearchPicker';
import IconPicker from '../../../src/components/admin/IconPicker';

const ConditionForm = () => {
    const router = useRouter();
    const { id } = router.query;
    const isNew = id === 'new';

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const [allServices, setAllServices] = useState([]);
    const [allBodySystems, setAllBodySystems] = useState([]);

    // Collapsible section toggles (expanded by default when data exists)
    const [showClinical, setShowClinical] = useState(false);
    const [showConnections, setShowConnections] = useState(false);
    const [showSpecialist, setShowSpecialist] = useState(false);
    const [showRelated, setShowRelated] = useState(false);
    const [showStats, setShowStats] = useState(true);

    const [formData, setFormData] = useState({
        page_title: '',
        slug: '',
        meta_description: '',
        hero_heading: '',
        content_html: '',
        is_published: true,
        faqs: [],
        service_id: '',
        // Phase 1 fields
        body_system_id: '',
        icon: '',
        short_description: '',
        display_order: 0,
        dc_code: '',
        dc_name: '',
        ratings: [],
        features: [],
        secondary_connections: [],
        specialist_guide: [],
        paired_conditions: [],
        pair_note: '',
        seo_keywords: '',
        internal_links: [],
        stat_cards: [],
    });

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [services, bodySystems] = await Promise.all([
                servicesApi.getAll(),
                bodySystemApi.getAll(true),
            ]);
            setAllServices(services || []);
            setAllBodySystems(bodySystems || []);

            if (!isNew) {
                const condition = await conditionApi.getById(id);
                if (condition) {
                    const keywords = (condition.seo_keywords || []).join(', ');
                    setFormData({
                        page_title: condition.page_title || '',
                        slug: condition.slug || '',
                        meta_description: condition.meta_description || '',
                        hero_heading: condition.hero_heading || '',
                        content_html: condition.content_html || '',
                        is_published: condition.is_published ?? true,
                        faqs: condition.faqs || [],
                        service_id: condition.service_id || '',
                        body_system_id: condition.body_system_id || '',
                        icon: condition.icon || '',
                        short_description: condition.short_description || '',
                        display_order: condition.display_order ?? 0,
                        dc_code: condition.dc_code || '',
                        dc_name: condition.dc_name || '',
                        ratings: condition.ratings || [],
                        features: condition.features || [],
                        secondary_connections: condition.secondary_connections || [],
                        specialist_guide: condition.specialist_guide || [],
                        paired_conditions: condition.paired_conditions || [],
                        pair_note: condition.pair_note || '',
                        seo_keywords: keywords,
                        internal_links: condition.internal_links || [],
                        stat_cards: condition.stat_cards || [],
                    });

                    // Auto-expand sections that have data
                    if (condition.dc_code || condition.ratings?.length || condition.features?.length) setShowClinical(true);
                    if (condition.secondary_connections?.length) setShowConnections(true);
                    if (condition.specialist_guide?.length) setShowSpecialist(true);
                    if (condition.paired_conditions?.length || condition.internal_links?.length) setShowRelated(true);
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

    // --- Generic dynamic list helpers ---
    const addListItem = (field, template) => {
        setFormData(prev => ({ ...prev, [field]: [...(prev[field] || []), template] }));
    };
    const removeListItem = (field, index) => {
        setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
    };
    const updateListItem = (field, index, key, value) => {
        setFormData(prev => {
            const updated = [...prev[field]];
            if (typeof updated[index] === 'string') {
                updated[index] = value;
            } else {
                updated[index] = { ...updated[index], [key]: value };
            }
            return { ...prev, [field]: updated };
        });
    };
    const updateStringListItem = (field, index, value) => {
        setFormData(prev => {
            const updated = [...prev[field]];
            updated[index] = value;
            return { ...prev, [field]: updated };
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
            // Prepare payload — convert seo_keywords string to array, clean empty entries
            const payload = {
                ...formData,
                display_order: parseInt(formData.display_order, 10) || 0,
                body_system_id: formData.body_system_id || null,
                seo_keywords: formData.seo_keywords
                    ? formData.seo_keywords.split(',').map(k => k.trim()).filter(Boolean)
                    : [],
                features: (formData.features || []).filter(f => f.trim() !== ''),
                paired_conditions: (formData.paired_conditions || []).filter(p => p.trim() !== ''),
                ratings: (formData.ratings || []).filter(r => r.pct || r.criteria),
                secondary_connections: (formData.secondary_connections || []).filter(c => c.from),
                specialist_guide: (formData.specialist_guide || []).filter(s => s.name),
                internal_links: (formData.internal_links || []).filter(l => l.label || l.url),
            };

            if (isNew) {
                await conditionApi.create(payload);
                toast.success('Condition created successfully');
                router.push('/admin/conditions');
            } else {
                await conditionApi.update(id, payload);
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

                            {/* Clinical Details (Collapsible) */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                                <button type="button" onClick={() => setShowClinical(!showClinical)} className="flex items-center justify-between w-full border-b border-slate-100 pb-3">
                                    <h2 className="text-xl font-semibold text-slate-900">Clinical Details</h2>
                                    {showClinical ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                                </button>
                                {showClinical && (
                                    <div className="space-y-4 pt-2">
                                        <div className="mb-4">
                                            <IconPicker
                                                label="Condition Icon"
                                                value={formData.icon}
                                                onChange={(val) => setFormData(prev => ({ ...prev, icon: val }))}
                                                helpText="Select a visual icon representing this condition."
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">DC Code</label>
                                                <input type="text" name="dc_code" value={formData.dc_code} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="8100" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">DC Name</label>
                                                <input type="text" name="dc_name" value={formData.dc_name} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Migraine Headaches" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Short Description</label>
                                            <textarea name="short_description" value={formData.short_description} onChange={handleInputChange} rows={3} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="Brief description for card views" />
                                        </div>

                                        {/* Ratings */}
                                        <div className="border-t border-slate-100 pt-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <label className="text-sm font-medium text-slate-700">Rating Criteria</label>
                                                <button type="button" onClick={() => addListItem('ratings', { pct: '', criteria: '' })} className="text-indigo-600 hover:text-indigo-700 flex items-center text-xs font-medium">
                                                    <Plus className="w-3 h-3 mr-1" /> Add Rating
                                                </button>
                                            </div>
                                            {(formData.ratings || []).map((r, i) => (
                                                <div key={i} className="flex items-start gap-2 mb-2">
                                                    <input type="text" value={r.pct} onChange={(e) => updateListItem('ratings', i, 'pct', e.target.value)} className="w-20 p-2 border border-slate-300 rounded-lg text-sm outline-none" placeholder="50%" />
                                                    <textarea value={r.criteria} onChange={(e) => updateListItem('ratings', i, 'criteria', e.target.value)} rows={1} className="flex-1 p-2 border border-slate-300 rounded-lg text-sm outline-none" placeholder="Rating criteria description" />
                                                    <button type="button" onClick={() => removeListItem('ratings', i)} className="text-slate-400 hover:text-red-600 mt-2"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Features */}
                                        <div className="border-t border-slate-100 pt-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <label className="text-sm font-medium text-slate-700">Features Checklist</label>
                                                <button type="button" onClick={() => addListItem('features', '')} className="text-indigo-600 hover:text-indigo-700 flex items-center text-xs font-medium">
                                                    <Plus className="w-3 h-3 mr-1" /> Add Feature
                                                </button>
                                            </div>
                                            {(formData.features || []).map((f, i) => (
                                                <div key={i} className="flex items-center gap-2 mb-2">
                                                    <input type="text" value={f} onChange={(e) => updateStringListItem('features', i, e.target.value)} className="flex-1 p-2 border border-slate-300 rounded-lg text-sm outline-none" placeholder="Feature description" />
                                                    <button type="button" onClick={() => removeListItem('features', i)} className="text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Stat Cards (Hero Section) */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                                <button type="button" onClick={() => setShowStats(!showStats)} className="flex items-center justify-between w-full border-b border-slate-100 pb-3">
                                    <div>
                                        <h2 className="text-xl font-semibold text-slate-900">Hero Stat Cards</h2>
                                        <p className="text-xs text-slate-500 mt-1">Up to 4 key metrics shown in a grid below the hero (e.g. "DC 8045", "Starting At: $400").</p>
                                    </div>
                                    {showStats ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                                </button>
                                {showStats && (
                                    <div className="space-y-4 pt-2">
                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => addListItem('stat_cards', { label: '', value: '', subtext: '' })}
                                                disabled={(formData.stat_cards || []).length >= 4}
                                                className="text-indigo-600 hover:text-indigo-700 flex items-center text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                <Plus className="w-4 h-4 mr-1" /> Add Stat Card
                                            </button>
                                        </div>

                                        {(formData.stat_cards || []).length === 0 ? (
                                            <p className="text-sm text-slate-500 italic">No stat cards added yet. Add up to 4 key metrics.</p>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {formData.stat_cards.map((stat, index) => (
                                                    <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-lg relative">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeListItem('stat_cards', index)}
                                                            className="absolute top-3 right-3 text-slate-400 hover:text-red-600 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                        <div className="space-y-2 pr-6">
                                                            <div>
                                                                <label className="block text-xs font-semibold text-slate-700 mb-1">Label *</label>
                                                                <input
                                                                    type="text"
                                                                    value={stat.label || ''}
                                                                    onChange={(e) => updateListItem('stat_cards', index, 'label', e.target.value)}
                                                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none"
                                                                    placeholder='e.g. "Diagnostic Code" or "Starting At"'
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-semibold text-slate-700 mb-1">Value *</label>
                                                                <input
                                                                    type="text"
                                                                    value={stat.value || ''}
                                                                    onChange={(e) => updateListItem('stat_cards', index, 'value', e.target.value)}
                                                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none"
                                                                    placeholder='e.g. "DC 8045" or "$400"'
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-semibold text-slate-700 mb-1">Subtext</label>
                                                                <input
                                                                    type="text"
                                                                    value={stat.subtext || ''}
                                                                    onChange={(e) => updateListItem('stat_cards', index, 'subtext', e.target.value)}
                                                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none"
                                                                    placeholder='e.g. "Rush 48-72hrs" or "No obligation"'
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Secondary Connections (Collapsible) */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                                <button type="button" onClick={() => setShowConnections(!showConnections)} className="flex items-center justify-between w-full border-b border-slate-100 pb-3">
                                    <h2 className="text-xl font-semibold text-slate-900">Secondary Connections</h2>
                                    {showConnections ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                                </button>
                                {showConnections && (
                                    <div className="space-y-4 pt-2">
                                        <button type="button" onClick={() => addListItem('secondary_connections', { from: '', mechanism: '', url: '' })} className="text-indigo-600 hover:text-indigo-700 flex items-center text-sm font-medium">
                                            <Plus className="w-4 h-4 mr-1" /> Add Connection
                                        </button>
                                        {(formData.secondary_connections || []).map((c, i) => (
                                            <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-lg relative">
                                                <button type="button" onClick={() => removeListItem('secondary_connections', i)} className="absolute top-4 right-4 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                                <div className="space-y-3 pr-8">
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-700 mb-1">From Condition (Name)</label>
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={c.from}
                                                                onChange={(e) => updateListItem('secondary_connections', i, 'from', e.target.value)}
                                                                className="flex-1 p-2 border border-slate-300 rounded-lg text-sm outline-none"
                                                                placeholder="e.g. PTSD"
                                                            />
                                                            {c.url && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => updateListItem('secondary_connections', i, 'url', '')}
                                                                    className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold transition-colors"
                                                                    title="Remove Link"
                                                                >
                                                                    Unlink
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {c.url ? (
                                                        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-2.5 flex items-center justify-between text-xs">
                                                            <span className="text-indigo-800 font-medium truncate">
                                                                🔗 Linked to: <span className="font-mono">{c.url}</span>
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <label className="block text-[10px] font-semibold text-slate-500 mb-1">Link to existing page (optional)</label>
                                                            <InternalLinkSearchPicker
                                                                onSelect={(selected) => {
                                                                    updateListItem('secondary_connections', i, 'from', selected.title);
                                                                    updateListItem('secondary_connections', i, 'url', selected.url);
                                                                }}
                                                                placeholder="Search for conditions, services, blogs, etc. to link..."
                                                            />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Mechanism</label>
                                                        <textarea value={c.mechanism} onChange={(e) => updateListItem('secondary_connections', i, 'mechanism', e.target.value)} rows={2} className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none" placeholder="How does this connection work..." />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Specialist Guide (Collapsible) */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                                <button type="button" onClick={() => setShowSpecialist(!showSpecialist)} className="flex items-center justify-between w-full border-b border-slate-100 pb-3">
                                    <h2 className="text-xl font-semibold text-slate-900">Specialist Guide</h2>
                                    {showSpecialist ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                                </button>
                                {showSpecialist && (
                                    <div className="space-y-4 pt-2">
                                        <button type="button" onClick={() => addListItem('specialist_guide', { name: '', price: '', best_for: '' })} className="text-indigo-600 hover:text-indigo-700 flex items-center text-sm font-medium">
                                            <Plus className="w-4 h-4 mr-1" /> Add Specialist
                                        </button>
                                        {(formData.specialist_guide || []).map((s, i) => (
                                            <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-lg relative">
                                                <button type="button" onClick={() => removeListItem('specialist_guide', i)} className="absolute top-4 right-4 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                                <div className="space-y-3 pr-8">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs font-semibold text-slate-700 mb-1">Name</label>
                                                            <input type="text" value={s.name} onChange={(e) => updateListItem('specialist_guide', i, 'name', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none" placeholder="Neurologist" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-semibold text-slate-700 mb-1">Price</label>
                                                            <input type="text" value={s.price} onChange={(e) => updateListItem('specialist_guide', i, 'price', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none" placeholder="$1,200–$1,800" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Best For</label>
                                                        <textarea value={s.best_for} onChange={(e) => updateListItem('specialist_guide', i, 'best_for', e.target.value)} rows={2} className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none" placeholder="When to choose this specialist..." />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Related Conditions (Collapsible) */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                                <button type="button" onClick={() => setShowRelated(!showRelated)} className="flex items-center justify-between w-full border-b border-slate-100 pb-3">
                                    <h2 className="text-xl font-semibold text-slate-900">Related Conditions</h2>
                                    {showRelated ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                                </button>
                                {showRelated && (
                                    <div className="space-y-4 pt-2">
                                        {/* Paired Conditions */}
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <label className="text-sm font-medium text-slate-700">Paired Conditions</label>
                                                <button type="button" onClick={() => addListItem('paired_conditions', '')} className="text-indigo-600 hover:text-indigo-700 flex items-center text-xs font-medium">
                                                    <Plus className="w-3 h-3 mr-1" /> Add
                                                </button>
                                            </div>
                                            {(formData.paired_conditions || []).map((p, i) => (
                                                <div key={i} className="flex items-center gap-2 mb-2">
                                                    <input type="text" value={p} onChange={(e) => updateStringListItem('paired_conditions', i, e.target.value)} className="flex-1 p-2 border border-slate-300 rounded-lg text-sm outline-none" placeholder="e.g. Sleep Apnea" />
                                                    <button type="button" onClick={() => removeListItem('paired_conditions', i)} className="text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            ))}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Pair Note</label>
                                            <textarea name="pair_note" value={formData.pair_note} onChange={handleInputChange} rows={2} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="Why are these conditions commonly paired..." />
                                        </div>

                                        {/* Internal Links */}
                                        <div className="border-t border-slate-100 pt-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <label className="text-sm font-medium text-slate-700">Internal Links</label>
                                                <button type="button" onClick={() => addListItem('internal_links', { type: 'Service', icon: '', label: '', title: '', url: '' })} className="text-indigo-600 hover:text-indigo-700 flex items-center text-xs font-medium">
                                                    <Plus className="w-3 h-3 mr-1" /> Add Link
                                                </button>
                                            </div>
                                            {(formData.internal_links || []).map((link, i) => (
                                                <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-lg mb-2 relative">
                                                    <button type="button" onClick={() => removeListItem('internal_links', i)} className="absolute top-3 right-3 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                                    <div className="grid grid-cols-3 gap-2 pr-8">
                                                        <select value={link.type} onChange={(e) => updateListItem('internal_links', i, 'type', e.target.value)} className="p-2 border border-slate-300 rounded-lg text-sm outline-none">
                                                            <option value="Service">Service</option>
                                                            <option value="Condition">Condition</option>
                                                            <option value="Guide">Guide</option>
                                                        </select>
                                                        <select
                                                            value={link.icon || ''}
                                                            onChange={(e) => updateListItem('internal_links', i, 'icon', e.target.value)}
                                                            className="p-2 border border-slate-300 rounded-lg text-sm outline-none bg-white font-medium"
                                                        >
                                                            <option value="">No Icon</option>
                                                            <option value="Brain">Brain</option>
                                                            <option value="HeartPulse">Heart Pulse</option>
                                                            <option value="Activity">Activity</option>
                                                            <option value="Wind">Wind / Lungs</option>
                                                            <option value="Bone">Bone</option>
                                                            <option value="Sparkles">Sparkles</option>
                                                            <option value="Ear">Ear</option>
                                                            <option value="Ribbon">Ribbon</option>
                                                            <option value="Venus">Venus</option>
                                                            <option value="Mars">Mars</option>
                                                            <option value="Zap">Zap</option>
                                                            <option value="Moon">Moon</option>
                                                            <option value="Flame">Flame</option>
                                                            <option value="Pill">Pill</option>
                                                            <option value="FileText">File Text</option>
                                                        </select>
                                                        <input type="text" value={link.label} onChange={(e) => updateListItem('internal_links', i, 'label', e.target.value)} className="p-2 border border-slate-300 rounded-lg text-sm outline-none" placeholder="Label" />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 mt-2 pr-8">
                                                        <input type="text" value={link.title} onChange={(e) => updateListItem('internal_links', i, 'title', e.target.value)} className="p-2 border border-slate-300 rounded-lg text-sm outline-none" placeholder="Link title" />
                                                        <input type="text" value={link.url} onChange={(e) => updateListItem('internal_links', i, 'url', e.target.value)} className="p-2 border border-slate-300 rounded-lg text-sm outline-none" placeholder="/conditions/..." />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar Column */}
                        <div className="space-y-6">
                            {/* Body System */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                                <h2 className="text-xl font-semibold text-slate-900 border-b border-slate-100 pb-3">Body System</h2>
                                <select name="body_system_id" value={formData.body_system_id} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
                                    <option value="">— No body system —</option>
                                    {allBodySystems.map(sys => (
                                        <option key={sys.id} value={sys.id}>{sys.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Display & SEO */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                                <h2 className="text-xl font-semibold text-slate-900 border-b border-slate-100 pb-3">Display &amp; SEO</h2>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Display Order</label>
                                    <input type="number" name="display_order" value={formData.display_order} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    <p className="text-xs text-slate-500 mt-1">Lower numbers appear first</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">SEO Keywords</label>
                                    <textarea name="seo_keywords" value={formData.seo_keywords} onChange={handleInputChange} rows={2} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="nexus letter, sleep apnea, VA disability" />
                                    <p className="text-xs text-slate-500 mt-1">Comma-separated</p>
                                </div>
                            </div>

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

                            {/* Target Service */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                                <h2 className="text-xl font-semibold text-slate-900 border-b border-slate-100 pb-3">Target Service</h2>
                                <p className="text-xs text-slate-500 mb-2">Select which service this condition content belongs to. (Required)</p>
                                
                                <div>
                                    <select
                                        name="service_id"
                                        value={formData.service_id}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    >
                                        <option value="">-- Select a Service --</option>
                                        {allServices.map(service => (
                                            <option key={service.id} value={service.id}>
                                                {service.title}
                                            </option>
                                        ))}
                                    </select>
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
