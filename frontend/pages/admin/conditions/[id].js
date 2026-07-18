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
import RichTextEditor from '../../../src/components/admin/RichTextEditor';
import LayoutSectionsManager from '../../../src/components/admin/LayoutSectionsManager';
import {
    DEFAULT_CONDITION_SECTIONS,
    cloneLayoutSections,
    createCustomLayoutSection,
    getLayoutSectionsShapeError,
    hasMeaningfulLayoutRichContent,
} from '../../../src/lib/layoutSections';
import {
    createConditionRouteSnapshot,
    revalidateConditionRoutes,
} from '../../../src/lib/contentRevalidation';

const createInitialConditionFormData = () => ({
    page_title: '',
    slug: '',
    meta_description: '',
    hero_description: '',
    hero_heading: '',
    content_html: '',
    is_published: true,
    faqs: [],
    service_id: '',
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

const ConditionForm = () => {
    const router = useRouter();
    const { id } = router.query;
    const isNew = id === 'new';

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const [loadedRecordId, setLoadedRecordId] = useState(null);
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

    const [formData, setFormData] = useState(createInitialConditionFormData);

    useEffect(() => {
        if (!id) return undefined;

        let cancelled = false;
        fetchData(() => cancelled);

        return () => {
            cancelled = true;
        };
    }, [id]);

    const fetchData = async (isCancelled = () => false) => {
        setLoading(true);
        setLoadError(false);
        setLoadedRecordId(null);
        setOriginalRoute(null);
        setEditingSectionId(null);
        setShowClinical(false);
        setShowConnections(false);
        setShowSpecialist(false);
        setShowRelated(false);
        setShowStats(true);
        try {
            const [services, bodySystems] = await Promise.all([
                servicesApi.getAll(),
                bodySystemApi.getAll(true),
            ]);
            if (isCancelled()) return;
            setAllServices(services || []);
            setAllBodySystems(bodySystems || []);

            if (!isNew) {
                const condition = await conditionApi.getById(id);
                if (isCancelled()) return;
                if (condition) {
                    const keywords = Array.isArray(condition.seo_keywords)
                        ? condition.seo_keywords.join(', ')
                        : condition.seo_keywords || '';
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
                            if (p && typeof p === 'object') {
                                return {
                                    ...p,
                                    name: p.name ?? '',
                                    url: p.url ?? '',
                                };
                            }

                            try {
                                const parsed = JSON.parse(p);
                                if (typeof parsed === 'object' && parsed !== null && 'name' in parsed) {
                                    return {
                                        ...parsed,
                                        name: parsed.name ?? '',
                                        url: parsed.url ?? '',
                                    };
                                }
                            } catch {
                                // fallback for plain string
                            }
                            return { name: p || '', url: '' };
                        }),
                        pair_note: condition.pair_note || '',
                        seo_keywords: keywords,
                        internal_links: condition.internal_links || [],
                        stat_cards: condition.stat_cards || [],
                        layout_sections: condition.layout_sections ?? null,
                    });

                    // Auto-expand sections that have data
                    if (condition.dc_code || condition.ratings?.length || condition.features?.length) setShowClinical(true);
                    if (condition.secondary_connections?.length) setShowConnections(true);
                    if (condition.specialist_guide?.length) setShowSpecialist(true);
                    if (condition.paired_conditions?.length || condition.internal_links?.length) setShowRelated(true);
                    setLoadedRecordId(id);
                } else {
                    throw new Error('Condition not found.');
                }
            } else {
                setFormData(createInitialConditionFormData());
                setLoadedRecordId(id);
            }
        } catch (error) {
            if (isCancelled()) return;
            console.error('Error fetching data:', error);
            toast.error('Failed to load data');
            setLoadError(true);
        } finally {
            if (!isCancelled()) setLoading(false);
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

    const addCustomSection = () => {
        const newId = `custom_rich_text_${Date.now()}`;
        const newSection = createCustomLayoutSection(newId, 'Custom Text Box');
        setFormData(prev => ({
            ...prev,
            layout_sections: [
                ...(Array.isArray(prev.layout_sections)
                    ? prev.layout_sections
                    : cloneLayoutSections(DEFAULT_CONDITION_SECTIONS)),
                newSection,
            ],
        }));
        setEditingSectionId(newId);
        return newId;
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

    const resetLayoutSections = () => {
        if (window.confirm('Resetting will discard the custom section layout and any custom text boxes. Continue?')) {
            setFormData(prev => ({ ...prev, layout_sections: null }));
            setEditingSectionId(null);
        }
    };

    const hasText = (value) => value !== null
        && value !== undefined
        && String(value).trim().length > 0;

    const validateListEntries = () => {
        const validations = [
            {
                items: formData.faqs,
                label: 'FAQ',
                isComplete: item => item && hasText(item.question) && hasText(item.answer),
            },
            {
                items: formData.ratings,
                label: 'rating criterion',
                isComplete: item => item && hasText(item.pct) && hasText(item.criteria),
                onInvalid: () => setShowClinical(true),
            },
            {
                items: formData.features,
                label: 'feature',
                isComplete: item => hasText(item),
                onInvalid: () => setShowClinical(true),
            },
            {
                items: formData.secondary_connections,
                label: 'secondary connection',
                isComplete: item => item && hasText(item.from) && hasText(item.mechanism),
                onInvalid: () => setShowConnections(true),
            },
            {
                items: formData.specialist_guide,
                label: 'specialist',
                isComplete: item => item
                    && hasText(item.name)
                    && hasText(item.price)
                    && hasText(item.best_for),
                onInvalid: () => setShowSpecialist(true),
            },
            {
                items: formData.paired_conditions,
                label: 'paired condition',
                isComplete: item => item && hasText(item.name),
                onInvalid: () => setShowRelated(true),
            },
            {
                items: formData.internal_links,
                label: 'related page',
                isComplete: item => item
                    && hasText(item.label)
                    && hasText(item.title)
                    && hasText(item.url),
                onInvalid: () => setShowRelated(true),
            },
            {
                items: formData.stat_cards,
                label: 'hero stat card',
                isComplete: item => item && hasText(item.label) && hasText(item.value),
                onInvalid: () => setShowStats(true),
            },
        ];

        for (const validation of validations) {
            if (!Array.isArray(validation.items)) {
                toast.error(`The ${validation.label} data is invalid. Reload the page and do not save until it is corrected.`);
                return false;
            }

            const invalidIndex = validation.items.findIndex(item => !validation.isComplete(item));
            if (invalidIndex !== -1) {
                validation.onInvalid?.();
                toast.error(
                    `Complete or remove ${validation.label} ${invalidIndex + 1} before saving. No entries were discarded.`
                );
                return false;
            }
        }

        if ((formData.stat_cards || []).length > 4) {
            setShowStats(true);
            toast.error('Hero stat cards are limited to 4. Remove the extra cards before saving.');
            return false;
        }

        if (formData.layout_sections !== null) {
            const layoutShapeError = getLayoutSectionsShapeError(formData.layout_sections);
            if (layoutShapeError) {
                toast.error(`${layoutShapeError} Reset the layout or correct it before saving.`);
                return false;
            }

            for (const [index, section] of formData.layout_sections.entries()) {
                if (section.type === 'custom_rich_text' && !hasMeaningfulLayoutRichContent(section.content_html)) {
                    toast.error(`Add content to custom text box ${index + 1}, or remove it before saving.`);
                    return false;
                }
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (loading || loadedRecordId !== id || loadError) {
            toast.error('This condition form has not loaded successfully, so it cannot be saved.');
            return;
        }

        if (formData.is_published && (!formData.service_id || !formData.body_system_id)) {
            toast.error('Published conditions require both a target service and a body system.');
            return;
        }

        if (!validateListEntries()) {
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
                features: formData.features || [],
                paired_conditions: (formData.paired_conditions || [])
                    .map(p => JSON.stringify({ ...p, name: p.name, url: p.url || '' })),
                ratings: formData.ratings || [],
                secondary_connections: formData.secondary_connections || [],
                specialist_guide: formData.specialist_guide || [],
                internal_links: formData.internal_links || [],
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

    if ((loading || loadedRecordId !== id) && !loadError) {
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

    const handleSectionsChange = (sections) => setFormData(prev => ({
        ...prev,
        layout_sections: cloneLayoutSections(sections),
    }));

    const renderFaqs = () => (
        <>
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
        </>
    );

    const renderClinical = () => (
        <>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                                <button type="button" onClick={() => setShowClinical(!showClinical)} className="flex items-center justify-between w-full border-b border-slate-100 pb-3">
                                    <h2 className="text-xl font-semibold text-slate-900">VA Diagnostic Code &amp; Ratings</h2>
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

                                    </div>
                                )}
                            </div>
        </>
    );

    const renderFeatures = () => (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-xl font-semibold text-slate-900">What&apos;s Included</h2>
                <button type="button" onClick={() => addListItem('features', '')} className="text-indigo-600 hover:text-indigo-700 flex items-center text-sm font-medium">
                    <Plus className="w-4 h-4 mr-1" /> Add Feature
                </button>
            </div>
            {(formData.features || []).length === 0 ? (
                <p className="text-sm text-slate-500 italic">No features added yet.</p>
            ) : (
                <div className="space-y-2">
                    {formData.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={feature}
                                onChange={(e) => updateStringListItem('features', index, e.target.value)}
                                className="flex-1 p-2 border border-slate-300 rounded-lg text-sm outline-none"
                                placeholder="Feature description"
                            />
                            <button type="button" onClick={() => removeListItem('features', index)} className="text-slate-400 hover:text-red-600">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderStats = () => (
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
    );

    const renderConnections = () => (
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
                    {(formData.secondary_connections || []).map((connection, index) => (
                        <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-lg relative">
                            <button type="button" onClick={() => removeListItem('secondary_connections', index)} className="absolute top-4 right-4 text-slate-400 hover:text-red-600">
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="space-y-3 pr-8">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">From Condition (Name)</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={connection.from || ''}
                                            onChange={(e) => updateListItem('secondary_connections', index, 'from', e.target.value)}
                                            className="flex-1 p-2 border border-slate-300 rounded-lg text-sm outline-none"
                                            placeholder="e.g. PTSD"
                                        />
                                        {connection.url && (
                                            <button
                                                type="button"
                                                onClick={() => updateListItem('secondary_connections', index, 'url', '')}
                                                className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold transition-colors"
                                            >
                                                Unlink
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {connection.url ? (
                                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-2.5 text-xs text-indigo-800 font-medium truncate">
                                        Linked to: <span className="font-mono">{connection.url}</span>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">Link to existing page (optional)</label>
                                        <InternalLinkSearchPicker
                                            onSelect={(selected) => {
                                                updateListItem('secondary_connections', index, 'from', selected.title);
                                                updateListItem('secondary_connections', index, 'url', selected.url);
                                            }}
                                            placeholder="Search for conditions, services, blogs, etc. to link..."
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mechanism</label>
                                    <textarea
                                        value={connection.mechanism || ''}
                                        onChange={(e) => updateListItem('secondary_connections', index, 'mechanism', e.target.value)}
                                        rows={2}
                                        className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none"
                                        placeholder="How does this connection work..."
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderSpecialist = () => (
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
                    {(formData.specialist_guide || []).map((specialist, index) => (
                        <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-lg relative">
                            <button type="button" onClick={() => removeListItem('specialist_guide', index)} className="absolute top-4 right-4 text-slate-400 hover:text-red-600">
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="space-y-3 pr-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Name</label>
                                        <input type="text" value={specialist.name || ''} onChange={(e) => updateListItem('specialist_guide', index, 'name', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none" placeholder="Neurologist" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Price</label>
                                        <input type="text" value={specialist.price || ''} onChange={(e) => updateListItem('specialist_guide', index, 'price', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none" placeholder="$1,200–$1,800" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Best For</label>
                                    <textarea value={specialist.best_for || ''} onChange={(e) => updateListItem('specialist_guide', index, 'best_for', e.target.value)} rows={2} className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none" placeholder="When to choose this specialist..." />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderRelatedPages = () => (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-xl font-semibold text-slate-900">Related Pages</h2>
                <button
                    type="button"
                    onClick={() => addListItem('internal_links', { label: '', title: '', url: '', icon: '' })}
                    className="text-indigo-600 hover:text-indigo-700 flex items-center text-sm font-medium"
                >
                    <Plus className="w-4 h-4 mr-1" /> Add Related Page
                </button>
            </div>

            {(formData.internal_links || []).length === 0 ? (
                <p className="text-sm text-slate-500 italic">No related pages added yet.</p>
            ) : (
                <div className="space-y-4">
                    {formData.internal_links.map((link, index) => (
                        <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-lg relative">
                            <button
                                type="button"
                                onClick={() => removeListItem('internal_links', index)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-red-600"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="space-y-3 pr-8">
                                <InternalLinkSearchPicker
                                    onSelect={(selected) => {
                                        updateListItem('internal_links', index, 'title', selected.title || '');
                                        updateListItem('internal_links', index, 'url', selected.url || '');
                                    }}
                                    placeholder="Search for a page to link..."
                                />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Label</label>
                                        <input
                                            type="text"
                                            value={link.label || ''}
                                            onChange={(e) => updateListItem('internal_links', index, 'label', e.target.value)}
                                            className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none bg-white"
                                            placeholder="e.g. Related Service"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                                        <input
                                            type="text"
                                            value={link.title || ''}
                                            onChange={(e) => updateListItem('internal_links', index, 'title', e.target.value)}
                                            className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none bg-white"
                                            placeholder="Page title"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">URL</label>
                                    <input
                                        type="text"
                                        value={link.url || ''}
                                        onChange={(e) => updateListItem('internal_links', index, 'url', e.target.value)}
                                        className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none bg-white"
                                        placeholder="/services/..."
                                    />
                                </div>
                                <IconPicker
                                    label="Icon (Optional)"
                                    value={link.icon || ''}
                                    onChange={(value) => updateListItem('internal_links', index, 'icon', value)}
                                    helpText="Shown beside this related page on the public condition page."
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderRelated = () => (
        <>
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
        </>
    );

    const sectionEditors = {
        ratings: renderClinical,
        features: renderFeatures,
        connections: renderConnections,
        specialist: renderSpecialist,
        paired_conditions: renderRelated,
        related_pages: renderRelatedPages,
        faqs: renderFaqs,
    };

    if (loadError) {
        return (
            <ProtectedRoute>
                <AdminLayout>
                    <SEO title="Unable to Load Condition" noindex={true} />
                    <div className="mx-auto max-w-2xl rounded-xl border border-red-200 bg-red-50 p-6">
                        <h1 className="text-xl font-bold text-red-950">Condition data could not be loaded</h1>
                        <p className="mt-2 text-sm text-red-900">
                            Saving is disabled to protect existing live content. Reload the page and try again.
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
                                onClick={() => router.push('/admin/conditions')}
                                className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-900 hover:bg-red-100"
                            >
                                Back to Conditions
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
                <SEO title={isNew ? "Create Condition" : "Edit Condition"} noindex={true} />

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
                            disabled={saving || loading || loadedRecordId !== id || loadError}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2 disabled:opacity-50 transition-colors font-semibold text-sm"
                        >
                            <Save className="w-5 h-5" />
                            <span>{saving ? 'Saving...' : 'Save Condition'}</span>
                        </button>
                    </div>


                    <LayoutSectionsManager
                        sections={formData.layout_sections == null
                            ? DEFAULT_CONDITION_SECTIONS
                            : formData.layout_sections}
                        onSectionsChange={handleSectionsChange}
                        sectionEditors={sectionEditors}
                        contentIndicators={{
                            ratings: Boolean(
                                formData.dc_code
                                || formData.dc_name
                                || formData.icon
                                || formData.short_description
                                || (formData.ratings && formData.ratings.length > 0)
                            ),
                            about: !!formData.content_html,
                            features: formData.features && formData.features.length > 0,
                            connections: formData.secondary_connections && formData.secondary_connections.length > 0,
                            specialist: formData.specialist_guide && formData.specialist_guide.length > 0,
                            faqs: formData.faqs && formData.faqs.length > 0,
                            related_pages: formData.internal_links && formData.internal_links.length > 0,
                            paired_conditions: formData.paired_conditions && formData.paired_conditions.length > 0,
                        }}
                        onAddCustomSection={addCustomSection}
                        onRemoveCustomSection={removeCustomSection}
                        onUpdateCustomSection={updateCustomSection}
                        onResetSections={formData.layout_sections != null
                            ? resetLayoutSections
                            : undefined}
                    />

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

                            {/* Hero stat cards are not part of the reorderable public body layout. */}
                            {renderStats()}
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
