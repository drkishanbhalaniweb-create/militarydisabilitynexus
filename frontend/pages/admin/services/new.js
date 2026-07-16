import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../src/lib/supabase';
import AdminLayout from '../../../src/components/admin/AdminLayout';
import ProtectedRoute from '../../../src/components/admin/ProtectedRoute';
import { Save, X, Plus, Trash2, Settings, ArrowUp, ArrowDown, Eye, EyeOff, Edit2 } from 'lucide-react';
import dynamic from 'next/dynamic';
const RichTextEditor = dynamic(() => import('../../../src/components/admin/RichTextEditor'), { ssr: false });
import { toast } from 'sonner';
import SEO from '../../../src/components/SEO';

const ServiceForm = () => {
    const router = useRouter();
    const { id } = router.query;
    const isEdit = false; // This is the 'new' page

    const [loading, setLoading] = useState(false);
    const [editingSectionId, setEditingSectionId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        short_description: '',
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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleFeatureChange = (index, value) => {
        const newFeatures = [...formData.features];
        newFeatures[index] = value;
        setFormData({ ...formData, features: newFeatures });
    };

    const addFeature = () => {
        setFormData({ ...formData, features: [...formData.features, ''] });
    };

    const removeFeature = (index) => {
        const newFeatures = formData.features.filter((_, i) => i !== index);
        setFormData({ ...formData, features: newFeatures });
    };

    const handleFaqChange = (index, field, value) => {
        const newFaqs = [...formData.faqs];
        newFaqs[index][field] = value;
        setFormData({ ...formData, faqs: newFaqs });
    };

    const addFaq = () => {
        setFormData({ ...formData, faqs: [...formData.faqs, { question: '', answer: '' }] });
    };

    const removeFaq = (index) => {
        const newFaqs = formData.faqs.filter((_, i) => i !== index);
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
    const enableCustomLayout = () => {
        const defaultSections = [
            { id: 'overview', type: 'standard', name: 'Overview', is_visible: true },
            { id: 'features', type: 'standard', name: 'Features & Pricing', is_visible: true },
            { id: 'faqs', type: 'standard', name: 'Frequently Asked Questions', is_visible: true },
            { id: 'related_services', type: 'standard', name: 'Related Services', is_visible: true },
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
        setLoading(true);

        try {
            const dataToSave = {
                ...formData,
                base_price_usd: parseInt(formData.base_price_usd),
                display_order: parseInt(formData.display_order),
            };

            const { error } = await supabase
                .from('services')
                .insert([dataToSave]);

            if (error) throw error;
            toast.success('Service created successfully!');

            router.push('/admin/services');
        } catch (error) {
            console.error('Error saving service:', error);
            toast.error('Failed to save service: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <AdminLayout>
                <SEO title="Add Service" noindex={true} />
                <div className="max-w-4xl">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold text-slate-900">
                            Add New Service
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
                                        {['Overview', 'Features & Pricing', 'Frequently Asked Questions', 'Related Services'].map((lbl, idx) => (
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
                                {formData.features.map((feature, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <input
                                            type="text"
                                            value={feature}
                                            onChange={(e) => handleFeatureChange(index, e.target.value)}
                                            placeholder="Feature description"
                                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                        {formData.features.length > 1 && (
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
                                {formData.faqs.map((faq, index) => (
                                    <div key={index} className="border border-slate-200 rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <span className="text-sm font-semibold text-slate-700">FAQ {index + 1}</span>
                                            {formData.faqs.length > 1 && (
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
                                disabled={loading}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-2"
                            >
                                <Save className="w-5 h-5" />
                                <span>{loading ? 'Saving...' : 'Create Service'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
};

export default ServiceForm;
