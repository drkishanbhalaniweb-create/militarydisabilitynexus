import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { conditionApi, servicesApi, bodySystemApi } from '../../../src/lib/api';
import AdminLayout from '../../../src/components/admin/AdminLayout';
import ProtectedRoute from '../../../src/components/admin/ProtectedRoute';
import { ArrowLeft, Save, Plus, Trash2, ChevronDown, ChevronRight, Eye, EyeOff, ArrowUp, ArrowDown, Edit2, X, Settings } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../../../src/components/SEO';
import Link from 'next/link';
import InternalLinkSearchPicker from '../../../src/components/admin/InternalLinkSearchPicker';
import IconPicker from '../../../src/components/admin/IconPicker';
import RichTextEditor from '../../../src/components/admin/RichTextEditor';
import {
    createConditionRouteSnapshot,
    revalidateConditionRoutes,
} from '../../../src/lib/contentRevalidation';

const ConditionForm = () => {
    const router = useRouter();
    const { id } = router.query;
    const isNew = id === 'new';

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const [originalRoute, setOriginalRoute] = useState(null);
    const [allServices, setAllServices] = useState([]);
    const [allBodySystems, setAllBodySystems] = useState([]);
    
    // UI state for dynamic sections layout builder
    const [editingSectionId, setEditingSectionId] = useState(null);

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
        hero_description: '',
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
        layout_sections: null,
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
                    setOriginalRoute(createConditionRouteSnapshot(condition));
                    setFormData({
                        page_title: condition.page_title || '',
                        slug: condition.slug || '',
                        meta_description: condition.meta_description || '',
                        hero_description: condition.hero_description || '',
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
                        paired_conditions: (condition.paired_conditions || []).map(p => {
                            try {
                                const parsed = JSON.parse(p);
                                if (typeof parsed === 'object' && parsed !== null && 'name' in parsed) {
                                    return { name: parsed.name || '', url: parsed.url || '' };
                                }
                            } catch (e) {
                                // fallback for plain string
                            }
                            return { name: p || '', url: '' };
                        }),
                        pair_note: condition.pair_note || '',
                        seo_keywords: keywords,
                        internal_links: condition.internal_links || [],
                        stat_cards: condition.stat_cards || [],
                        layout_sections: condition.layout_sections || null,
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

    const enableCustomLayout = () => {
        const defaultSections = [
            { id: 'ratings', type: 'standard', name: 'VA Diagnostic Code', is_visible: true },
            { id: 'about', type: 'standard', name: 'Overview Section', is_visible: true },
            { id: 'features', type: 'standard', name: "What's Included", is_visible: true },
            { id: 'connections', type: 'standard', name: 'Secondary Connections', is_visible: true },
            { id: 'specialist', type: 'standard', name: 'Specialist Guide', is_visible: true },
            { id: 'faqs', type: 'standard', name: 'Frequently Asked Questions', is_visible: true },
            { id: 'related_pages', type: 'standard', name: 'Related Pages', is_visible: true },
            { id: 'paired_conditions', type: 'standard', name: 'Commonly Paired Conditions', is_visible: true },
            { id: 'insights', type: 'standard', name: 'Related Insights & Proof', is_visible: true },
        ];
        setFormData(prev => ({
            ...prev,
            layout_sections: defaultSections
        }));
    };

    const disableCustomLayout = () => {
        if (window.confirm('Resetting will discard your custom section layout and any custom text boxes you added. Are you sure?')) {
            setFormData(prev => ({
                ...prev,
                layout_sections: null
            }));
            setEditingSectionId(null);
        }
    };

    const moveSection = (index, direction) => {
        const sections = [...(formData.layout_sections || [])];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= sections.length) return;
        
        const temp = sections[index];
        sections[index] = sections[newIndex];
        sections[newIndex] = temp;
        
        setFormData(prev => ({
            ...prev,
            layout_sections: sections
        }));
    };

    const toggleSectionVisibility = (index) => {
        const sections = [...(formData.layout_sections || [])];
        sections[index] = { ...sections[index], is_visible: !sections[index].is_visible };
        setFormData(prev => ({
            ...prev,
            layout_sections: sections
        }));
    };

    const addCustomSection = () => {
        const newId = `custom_rich_text_${Date.now()}`;
        const newSection = {
            id: newId,
            type: 'custom_rich_text',
            name: 'Custom Text Box',
            title: '',
            content_html: '',
            is_visible: true
        };
        setFormData(prev => ({
            ...prev,
            layout_sections: [...(prev.layout_sections || []), newSection]
        }));
        setEditingSectionId(newId);
    };

    const removeCustomSection = (id) => {
        if (window.confirm('Are you sure you want to delete this custom text box?')) {
            setFormData(prev => ({
                ...prev,
                layout_sections: (prev.layout_sections || []).filter(sec => sec.id !== id)
            }));
            if (editingSectionId === id) {
                setEditingSectionId(null);
            }
        }
    };

    const updateCustomSection = (id, field, value) => {
        setFormData(prev => {
            const sections = (prev.layout_sections || []).map(sec => {
                if (sec.id === id) {
                    return { ...sec, [field]: value };
                }
                return sec;
            });
            return { ...prev, layout_sections: sections };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (loadError && !isNew) {
            toast.error('Cannot save because the condition failed to load properly.');
            return;
        }

        if (formData.is_published && (!formData.service_id || !formData.body_system_id)) {
            toast.error('Published conditions require both a target service and a body system.');
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
                paired_conditions: (formData.paired_conditions || [])
                    .filter(p => p && p.name && p.name.trim() !== '')
                    .map(p => JSON.stringify({ name: p.name.trim(), url: p.url ? p.url.trim() : '' })),
                ratings: (formData.ratings || []).filter(r => r.pct || r.criteria),
                secondary_connections: (formData.secondary_connections || []).filter(c => c.from),
                specialist_guide: (formData.specialist_guide || []).filter(s => s.name),
                internal_links: (formData.internal_links || []).filter(l => l.label || l.url),
            };

            const savedCondition = isNew
                ? await conditionApi.create(payload)
                : await conditionApi.update(id, payload);

            let refreshFailed = false;
            try {
                await revalidateConditionRoutes([
                    originalRoute,
                    createConditionRouteSnapshot(savedCondition),
                ]);
            } catch (refreshError) {
                refreshFailed = true;
                console.error('Condition saved but public page refresh failed:', refreshError);
            }

            if (isNew) {
                toast.success('Condition created successfully');
                router.push('/admin/conditions');
            } else {
                setOriginalRoute(createConditionRouteSnapshot(savedCondition));
                toast.success('Condition updated successfully');
            }

            if (refreshFailed) {
                toast.warning('Saved, but the public page cache did not refresh. Please retry the save.');
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
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2 disabled:opacity-50 transition-colors font-semibold text-sm"
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
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Hero Description (Displays on Hero Card)</label>
                                    <textarea
                                        name="hero_description"
                                        value={formData.hero_description}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow text-sm"
                                        placeholder="Enter a descriptive summary for the hero card (differs from page meta description and body overview)"
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
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Content / Requirements (Overview Section)</label>
                                    <p className="text-xs text-slate-500 mb-2">Write the main condition overview. Use the "Custom Box" component from the toolbar to insert connection boxes.</p>
                                    <RichTextEditor
                                        value={formData.content_html}
                                        onChange={(html) => setFormData(prev => ({ ...prev, content_html: html }))}
                                    />
                                </div>
                            </div>

                            {/* Page Layout & Sections Manager */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <div>
                                        <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                                            <Settings className="w-5 h-5 text-indigo-600" />
                                            Page Layout &amp; Sections
                                        </h2>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Control the layout order of sections and insert custom rich text blocks anywhere.
                                        </p>
                                    </div>
                                    {formData.layout_sections ? (
                                        <button
                                            type="button"
                                            onClick={disableCustomLayout}
                                            className="text-xs text-red-600 hover:text-red-700 font-semibold border border-red-200 bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition-colors"
                                        >
                                            Reset to Default Layout
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={enableCustomLayout}
                                            className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded transition-colors"
                                        >
                                            Customize Layout Order
                                        </button>
                                    )}
                                </div>

                                {!formData.layout_sections ? (
                                    <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-6 text-center">
                                        <p className="text-sm text-slate-600 mb-2">
                                            This page is using the <strong>Default Layout</strong>. Sections are displayed in the standard order:
                                        </p>
                                        <div className="flex flex-wrap gap-2 justify-center text-xs text-slate-500 max-w-lg mx-auto">
                                            {['Diagnostic Code', 'Overview', 'What\'s Included', 'Secondary Connections', 'Specialist Guide', 'FAQs', 'Related Pages', 'Paired Conditions', 'Insights'].map((lbl, idx) => (
                                                <span key={idx} className="bg-slate-200 text-slate-700 px-2 py-1 rounded">
                                                    {lbl}
                                                </span>
                                            ))}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={enableCustomLayout}
                                            className="mt-4 inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-4 py-2 rounded-lg transition-colors"
                                        >
                                            <Plus className="w-3.5 h-3.5" /> Customize Layout &amp; Add Custom Boxes
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center bg-indigo-50/50 border border-indigo-105 rounded-lg p-3 text-xs text-indigo-900">
                                            <span>💡 Rearrange any section below. Visibility changes affect the public page immediately.</span>
                                            <button
                                                type="button"
                                                onClick={addCustomSection}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded flex items-center gap-1 transition-colors"
                                            >
                                                <Plus className="w-3 h-3" /> Add Text Box
                                            </button>
                                        </div>

                                        <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                                            {formData.layout_sections.map((sec, idx) => {
                                                const isEditing = editingSectionId === sec.id;
                                                return (
                                                    <div key={sec.id} className={`p-4 transition-colors ${isEditing ? 'bg-slate-50' : 'bg-white'}`}>
                                                        <div className="flex items-center justify-between gap-4">
                                                            {/* Drag handle / Order indicator */}
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-xs font-mono text-slate-400 w-5 text-right">{idx + 1}.</span>
                                                                <div>
                                                                    <div className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                                                                        {sec.type === 'custom_rich_text' ? (
                                                                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">Custom Box</span>
                                                                        ) : (
                                                                            <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded">Standard</span>
                                                                        )}
                                                                        {sec.name}
                                                                    </div>
                                                                    {sec.type === 'custom_rich_text' && sec.title && (
                                                                        <div className="text-xs text-slate-500 mt-0.5">Heading: {sec.title}</div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Controls */}
                                                            <div className="flex items-center gap-1.5">
                                                                {/* Move Buttons */}
                                                                <button
                                                                    type="button"
                                                                    disabled={idx === 0}
                                                                    onClick={() => moveSection(idx, 'up')}
                                                                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 rounded transition-colors"
                                                                    title="Move Up"
                                                                >
                                                                    <ArrowUp className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    disabled={idx === formData.layout_sections.length - 1}
                                                                    onClick={() => moveSection(idx, 'down')}
                                                                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 rounded transition-colors"
                                                                    title="Move Down"
                                                                >
                                                                    <ArrowDown className="w-4 h-4" />
                                                                </button>

                                                                {/* Visibility Toggle */}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleSectionVisibility(idx)}
                                                                    className={`p-1 rounded transition-colors ${sec.is_visible ? 'text-indigo-600 hover:bg-indigo-50' : 'text-slate-400 hover:bg-slate-100'}`}
                                                                    title={sec.is_visible ? 'Visible' : 'Hidden'}
                                                                >
                                                                    {sec.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                                </button>

                                                                {/* Custom Box Only Actions */}
                                                                {sec.type === 'custom_rich_text' && (
                                                                    <>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setEditingSectionId(isEditing ? null : sec.id)}
                                                                            className={`p-1.5 rounded transition-colors ${isEditing ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                                                                            title="Edit Content"
                                                                        >
                                                                            <Edit2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeCustomSection(sec.id)}
                                                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                            title="Delete Box"
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Custom Box Editor Panel (Only render when editing) */}
                                                        {sec.type === 'custom_rich_text' && isEditing && (
                                                            <div className="mt-4 pt-4 border-t border-slate-200/60 space-y-3 bg-white p-4 rounded-lg border border-slate-200/80 shadow-inner">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-xs font-semibold text-slate-700">Edit Custom Text Box</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setEditingSectionId(null)}
                                                                        className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                </div>

                                                                <div>
                                                                    <label className="block text-xs font-medium text-slate-600 mb-1">Section Title / Heading (Optional)</label>
                                                                    <input
                                                                        type="text"
                                                                        value={sec.title || ''}
                                                                        onChange={(e) => {
                                                                            updateCustomSection(sec.id, 'title', e.target.value);
                                                                            updateCustomSection(sec.id, 'name', e.target.value ? `Custom: ${e.target.value}` : 'Custom Text Box');
                                                                        }}
                                                                        className="w-full p-2 border border-slate-350 rounded-lg text-sm outline-none font-normal"
                                                                        placeholder="e.g. Recommended Next Steps"
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="block text-xs font-medium text-slate-600 mb-1">Rich Text Body</label>
                                                                    <RichTextEditor
                                                                        value={sec.content_html || ''}
                                                                        onChange={(html) => updateCustomSection(sec.id, 'content_html', html)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="flex justify-center pt-2">
                                            <button
                                                type="button"
                                                onClick={addCustomSection}
                                                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 border-dashed rounded-lg py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                                            >
                                                <Plus className="w-4 h-4" /> Add Custom Text Box
                                            </button>
                                        </div>
                                    </div>
                                )}
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
                                                <label className="text-sm font-medium text-slate-700 font-semibold">Paired Conditions</label>
                                                <button type="button" onClick={() => addListItem('paired_conditions', { name: '', url: '' })} className="text-indigo-600 hover:text-indigo-700 flex items-center text-xs font-medium">
                                                    <Plus className="w-3 h-3 mr-1" /> Add Condition
                                                </button>
                                            </div>
                                            {(formData.paired_conditions || []).map((p, i) => (
                                                <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-lg mb-3 relative">
                                                    <button type="button" onClick={() => removeListItem('paired_conditions', i)} className="absolute top-3 right-3 text-slate-400 hover:text-red-600">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                                                        <div>
                                                            <label className="block text-xs font-semibold text-slate-700 mb-1">Condition Name</label>
                                                            <input 
                                                                type="text" 
                                                                value={p.name || ''} 
                                                                onChange={(e) => updateListItem('paired_conditions', i, 'name', e.target.value)} 
                                                                className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none bg-white font-normal" 
                                                                placeholder="e.g. Sleep Apnea" 
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-semibold text-slate-700 mb-1">Link / URL</label>
                                                            <input 
                                                                type="text" 
                                                                value={p.url || ''} 
                                                                onChange={(e) => updateListItem('paired_conditions', i, 'url', e.target.value)} 
                                                                className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none bg-white font-normal" 
                                                                placeholder="e.g. /services/independent-medical-opinion-nexus-letter/respiratory-system/sleep-apnea" 
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="border-t border-slate-100 pt-3">
                                            <label className="block text-sm font-medium text-slate-700 mb-1 font-semibold">Pair Note</label>
                                            <textarea name="pair_note" value={formData.pair_note} onChange={handleInputChange} rows={2} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white font-normal" placeholder="Why are these conditions commonly paired..." />
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
                                <select name="body_system_id" value={formData.body_system_id} onChange={handleInputChange} required={formData.is_published} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
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
