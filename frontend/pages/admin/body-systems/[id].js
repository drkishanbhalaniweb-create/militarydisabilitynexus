import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { bodySystemApi } from '../../../src/lib/api';
import { supabase } from '../../../src/lib/supabase';
import AdminLayout from '../../../src/components/admin/AdminLayout';
import ProtectedRoute from '../../../src/components/admin/ProtectedRoute';
import { ArrowLeft, Save, Plus, Trash2, Settings, ArrowUp, ArrowDown, Eye, EyeOff, Edit2, X } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../../../src/components/SEO';
import Link from 'next/link';
import IconPicker from '../../../src/components/admin/IconPicker';
import RichTextEditor from '../../../src/components/admin/RichTextEditor';
import InternalLinkSearchPicker from '../../../src/components/admin/InternalLinkSearchPicker';

const EMPTY_SPECIALIST = { name: '', role: '', best_for: '', price: '', note: '' };
const EMPTY_STAT_CARD = { label: '', value: '', subtext: '' };
const EMPTY_TRUST_LINK = { label: '', url: '' };

const BodySystemForm = () => {
    const router = useRouter();
    const { id } = router.query;
    const isNew = id === 'new';

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const [allSystems, setAllSystems] = useState([]);
    const [services, setServices] = useState([]);
    const [editingSectionId, setEditingSectionId] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        icon: '',
        description: '',
        overview: '',
        hero_description: '',
        is_mental_health: false,
        specialist_guide: [],
        paired_systems: [],
        pair_note: '',
        stat_cards: [],
        build_trust_links: [],
        faqs: [],
        pathways: [],
        challenges: [],
        service_descriptions: [],
        display_order: 0,
        is_published: true,
        pathways_intro: '',
        challenges_title: '',
        services_title: '',
        services_intro: '',
        paired_title: '',
        cta_price: '',
        layout_sections: null,
    });

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch all systems for the "paired systems" selector
            const { data: systemsData, error: systemsError } = await supabase
                .from('body_systems')
                .select('id, name')
                .order('display_order', { ascending: true });

            if (systemsError) throw systemsError;
            setAllSystems(systemsData || []);

            // Fetch all active services
            const { data: servicesData, error: servicesError } = await supabase
                .from('services')
                .select('id, title, slug')
                .eq('is_active', true)
                .order('display_order', { ascending: true });

            if (servicesError) throw servicesError;
            const activeServicesList = servicesData || [];
            setServices(activeServicesList);

            if (!isNew) {
                const system = await bodySystemApi.getById(id);
                if (system) {
                    // Populate service descriptions with defaults if empty
                    const existingDescriptions = system.service_descriptions || [];
                    const mappedServiceDescriptions = activeServicesList.map(s => {
                        const existing = existingDescriptions.find(d => d.service_slug === s.slug);
                        return {
                            service_slug: s.slug,
                            text: existing ? existing.text : ''
                        };
                    });

                    setFormData({
                        name: system.name || '',
                        slug: system.slug || '',
                        icon: system.icon || '',
                        description: system.description || '',
                        overview: system.overview || '',
                        hero_description: system.hero_description || '',
                        is_mental_health: system.is_mental_health ?? false,
                        specialist_guide: system.specialist_guide || [],
                        paired_systems: system.paired_systems || [],
                        pair_note: system.pair_note || '',
                        stat_cards: system.stat_cards || [],
                        build_trust_links: system.build_trust_links || [],
                        faqs: system.faqs || [],
                        pathways: system.pathways || [],
                        challenges: system.challenges || [],
                        service_descriptions: mappedServiceDescriptions,
                        display_order: system.display_order ?? 0,
                        is_published: system.is_published ?? true,
                        pathways_intro: system.pathways_intro || '',
                        challenges_title: system.challenges_title || '',
                        services_title: system.services_title || '',
                        services_intro: system.services_intro || '',
                        paired_title: system.paired_title || '',
                        cta_price: system.cta_price || '',
                        layout_sections: system.layout_sections || null,
                    });
                }
            } else {
                setFormData(prev => ({
                    ...prev,
                    service_descriptions: activeServicesList.map(s => ({
                        service_slug: s.slug,
                        text: ''
                    }))
                }));
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
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    // --- Specialist Guide ---
    const addSpecialist = () => {
        setFormData(prev => ({
            ...prev,
            specialist_guide: [...prev.specialist_guide, { ...EMPTY_SPECIALIST }],
        }));
    };

    const removeSpecialist = (index) => {
        setFormData(prev => ({
            ...prev,
            specialist_guide: prev.specialist_guide.filter((_, i) => i !== index),
        }));
    };

    const updateSpecialist = (index, field, value) => {
        setFormData(prev => {
            const updated = [...prev.specialist_guide];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, specialist_guide: updated };
        });
    };

    // --- Paired Systems ---
    const togglePairedSystem = (systemName) => {
        setFormData(prev => {
            const current = prev.paired_systems || [];
            if (current.includes(systemName)) {
                return { ...prev, paired_systems: current.filter(n => n !== systemName) };
            }
            return { ...prev, paired_systems: [...current, systemName] };
        });
    };

    // --- Stat Cards ---
    const addStatCard = () => {
        setFormData(prev => ({
            ...prev,
            stat_cards: [...prev.stat_cards, { ...EMPTY_STAT_CARD }],
        }));
    };

    const removeStatCard = (index) => {
        setFormData(prev => ({
            ...prev,
            stat_cards: prev.stat_cards.filter((_, i) => i !== index),
        }));
    };

    const updateStatCard = (index, field, value) => {
        setFormData(prev => {
            const updated = [...prev.stat_cards];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, stat_cards: updated };
        });
    };

    const updateStringListItem = (field, index, value) => {
        setFormData(prev => {
            const updated = [...prev[field]];
            updated[index] = value;
            return { ...prev, [field]: updated };
        });
    };

    // --- FAQs ---
    const addFaq = () => {
        setFormData(prev => ({
            ...prev,
            faqs: [...(prev.faqs || []), { question: '', answer: '' }]
        }));
    };

    const removeFaq = (index) => {
        setFormData(prev => ({
            ...prev,
            faqs: (prev.faqs || []).filter((_, i) => i !== index)
        }));
    };

    const updateFaq = (index, field, value) => {
        setFormData(prev => {
            const newFaqs = [...(prev.faqs || [])];
            newFaqs[index] = { ...newFaqs[index], [field]: value };
            return { ...prev, faqs: newFaqs };
        });
    };

    // --- Signature Pathways ---
    const addPathway = () => {
        setFormData(prev => ({
            ...prev,
            pathways: [...(prev.pathways || []), { from: '', to: '', mechanism: '' }]
        }));
    };

    const removePathway = (index) => {
        setFormData(prev => ({
            ...prev,
            pathways: (prev.pathways || []).filter((_, i) => i !== index)
        }));
    };

    const updatePathway = (index, field, value) => {
        setFormData(prev => {
            const updated = [...(prev.pathways || [])];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, pathways: updated };
        });
    };

    // --- Challenges ---
    const addChallenge = () => {
        setFormData(prev => ({
            ...prev,
            challenges: [...(prev.challenges || []), { icon: 'HelpCircle', title: '', description: '' }]
        }));
    };

    const removeChallenge = (index) => {
        setFormData(prev => ({
            ...prev,
            challenges: (prev.challenges || []).filter((_, i) => i !== index)
        }));
    };

    const updateChallenge = (index, field, value) => {
        setFormData(prev => {
            const updated = [...(prev.challenges || [])];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, challenges: updated };
        });
    };

    // --- Service Descriptions ---
    const updateServiceDescription = (serviceSlug, text) => {
        setFormData(prev => {
            const updated = [...(prev.service_descriptions || [])];
            const idx = updated.findIndex(d => d.service_slug === serviceSlug);
            if (idx !== -1) {
                updated[idx] = { ...updated[idx], text };
            } else {
                updated.push({ service_slug: serviceSlug, text });
            }
            return { ...prev, service_descriptions: updated };
        });
    };

    // --- Build Trust Links ---
    const addTrustLink = () => {
        setFormData(prev => ({
            ...prev,
            build_trust_links: [...prev.build_trust_links, { ...EMPTY_TRUST_LINK }],
        }));
    };

    const removeTrustLink = (index) => {
        setFormData(prev => ({
            ...prev,
            build_trust_links: prev.build_trust_links.filter((_, i) => i !== index),
        }));
    };

    const updateTrustLink = (index, field, value) => {
        setFormData(prev => {
            const updated = [...prev.build_trust_links];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, build_trust_links: updated };
        });
    };

    // --- Custom Layout System ---
    const enableCustomLayout = () => {
        const defaultSections = [
            { id: 'overview', type: 'standard', name: 'Overview', is_visible: true },
            { id: 'conditions_directory', type: 'standard', name: 'Conditions Directory', is_visible: true },
            { id: 'signature_pathways', type: 'standard', name: 'Signature Pathways', is_visible: true },
            { id: 'challenges', type: 'standard', name: 'Challenges', is_visible: true },
            { id: 'services_comparison', type: 'standard', name: 'Services Comparison', is_visible: true },
            { id: 'specialist_guide', type: 'standard', name: 'Specialist Guide', is_visible: true },
            { id: 'paired_systems', type: 'standard', name: 'Paired Systems', is_visible: true },
            { id: 'faqs', type: 'standard', name: 'Frequently Asked Questions', is_visible: true },
            { id: 'related_systems', type: 'standard', name: 'Related Body Systems', is_visible: true },
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
            toast.error('Cannot save because the body system failed to load properly.');
            return;
        }

        if (!formData.overview || formData.overview.trim() === '' || formData.overview === '<p></p>') {
            toast.error('Overview content is required.');
            return;
        }

        setSaving(true);

        try {
            const payload = {
                ...formData,
                display_order: parseInt(formData.display_order, 10) || 0,
                specialist_guide: (formData.specialist_guide || []).filter(s => (s.name ?? '').trim() !== ''),
                faqs: (formData.faqs || []).filter(f => (f.question ?? '').trim() !== '' || (f.answer ?? '').trim() !== ''),
                pathways: (formData.pathways || []).filter(p => (p.from ?? '').trim() !== '' && (p.to ?? '').trim() !== ''),
                challenges: (formData.challenges || []).filter(c => (c.title ?? '').trim() !== ''),
                service_descriptions: (formData.service_descriptions || []).filter(d => (d.text ?? '').trim() !== ''),
                pathways_intro: (formData.pathways_intro || '').trim(),
                challenges_title: (formData.challenges_title || '').trim(),
                services_title: (formData.services_title || '').trim(),
                services_intro: (formData.services_intro || '').trim(),
                paired_title: (formData.paired_title || '').trim(),
                cta_price: (formData.cta_price || '').trim() || null,
            };

            if (isNew) {
                await bodySystemApi.create(payload);
                toast.success('Body system created successfully');
                router.push('/admin/body-systems');
            } else {
                await bodySystemApi.update(id, payload);
                toast.success('Body system updated successfully');
            }
        } catch (error) {
            console.error('Error saving body system:', error);
            const safeMessage = error instanceof Error ? error.message : String(error) || 'Unknown error';
            toast.error('Failed to save body system: ' + safeMessage);
        } finally {
            setSaving(false);
        }
    };

    // Exclude self from paired systems list
    const otherSystems = allSystems.filter(s => s.id !== id);

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
                <SEO title={isNew ? 'Create Body System' : 'Edit Body System'} noindex={true} />

                {loadError && !isNew && (
                    <div className="max-w-5xl mx-auto mb-6 bg-red-50 border-l-4 border-red-500 p-4">
                        <p className="text-sm text-red-700">
                            Error loading body system data. Please do not submit this form as it may overwrite existing data.
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8 pb-20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link href="/admin/body-systems" className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                <ArrowLeft className="w-5 h-5 text-slate-600" />
                            </Link>
                            <h1 className="text-3xl font-bold text-slate-900">
                                {isNew ? 'Create Body System' : 'Edit Body System'}
                            </h1>
                        </div>
                        <button
                            type="submit"
                            disabled={saving || (loadError && !isNew)}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2 disabled:opacity-50 transition-colors"
                        >
                            <Save className="w-5 h-5" />
                            <span>{saving ? 'Saving...' : 'Save System'}</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Info */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                                <h2 className="text-xl font-semibold text-slate-900 border-b border-slate-100 pb-3">Basic Information</h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">System Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                                            placeholder='e.g. "Neurology" or "Mental Health"'
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
                                            placeholder="Auto-generated from name if left blank"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <IconPicker
                                        label="System Icon"
                                        value={formData.icon}
                                        onChange={(val) => setFormData(prev => ({ ...prev, icon: val }))}
                                        required
                                        helpText="Select a visual icon representing this body system."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Short Description (SEO & List Previews) *</label>
                                    <input
                                        type="text"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                                        placeholder='e.g. "Headaches, TBI, movement disorders, neuropathy"'
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Hero Card Description</label>
                                    <p className="text-xs text-slate-500 mb-2">Distinct plain text description displayed on the hero card of the public-facing page.</p>
                                    <textarea
                                        name="hero_description"
                                        value={formData.hero_description}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                                        placeholder="Explain this body system category for the hero card (optional, falls back to overview plain text if left blank)..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Overview *</label>
                                    <p className="text-xs text-slate-500 mb-2">Longer description explaining this body system category. You can use full-suite formatting tools.</p>
                                    <RichTextEditor
                                        value={formData.overview}
                                        onChange={(html) => setFormData(prev => ({ ...prev, overview: html }))}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">CTA Custom Price</label>
                                    <p className="text-xs text-slate-500 mb-2">Custom pricing displayed on the public CTA buttons (e.g., "$400+", "$1,600+"). Leave blank to use system defaults.</p>
                                    <input
                                        type="text"
                                        name="cta_price"
                                        value={formData.cta_price}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow text-slate-900 text-sm"
                                        placeholder='e.g. "$400+" or "From $550"'
                                    />
                                </div>

                                <label className="flex items-center space-x-3 cursor-pointer pt-2">
                                    <input
                                        type="checkbox"
                                        name="is_mental_health"
                                        checked={formData.is_mental_health}
                                        onChange={handleInputChange}
                                        className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                    />
                                    <div>
                                        <span className="font-medium text-slate-700">Mental Health System</span>
                                        <p className="text-xs text-slate-500">Triggers mental health pricing in the pricing modal</p>
                                    </div>
                                </label>
                            </div>

                             {/* Section Content Overrides */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                                <h2 className="text-xl font-semibold text-slate-900 border-b border-slate-100 pb-3">Custom Section Content Overrides</h2>
                                <p className="text-xs text-slate-500 mb-2">Optional overrides for heading and introduction texts on the public-facing body system page.</p>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Pathways Section Intro</label>
                                    <textarea
                                        name="pathways_intro"
                                        value={formData.pathways_intro || ''}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow text-slate-900 text-sm"
                                        placeholder='Fallback: "Many claims succeed not as standalone conditions, but as part of a chain..."'
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Challenges Section Title</label>
                                    <input
                                        type="text"
                                        name="challenges_title"
                                        value={formData.challenges_title || ''}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow text-slate-900 text-sm"
                                        placeholder='Fallback: "Why [System Name] Claims Can Be Challenging"'
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Medical Evidence Services Section Title</label>
                                    <input
                                        type="text"
                                        name="services_title"
                                        value={formData.services_title || ''}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow text-slate-900 text-sm"
                                        placeholder='Fallback: "Medical Evidence Services for [System Name] Claims"'
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Medical Evidence Services Section Intro</label>
                                    <textarea
                                        name="services_intro"
                                        value={formData.services_intro || ''}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow text-slate-900 text-sm"
                                        placeholder='Fallback: "Clinician-led services support [system name] claims at different stages. Each focuses on the medical evidence..."'
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Commonly Paired Section Title</label>
                                    <input
                                        type="text"
                                        name="paired_title"
                                        value={formData.paired_title || ''}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow text-slate-900 text-sm"
                                        placeholder='Fallback: "Veterans Usually Pair [System Name] With These Systems"'
                                    />
                                </div>
                            </div>

                            {/* Specialist Guide */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <h2 className="text-xl font-semibold text-slate-900">Specialist Guide</h2>
                                    <button
                                        type="button"
                                        onClick={addSpecialist}
                                        className="text-indigo-600 hover:text-indigo-700 flex items-center text-sm font-medium"
                                    >
                                        <Plus className="w-4 h-4 mr-1" /> Add Specialist Tier
                                    </button>
                                </div>

                                {formData.specialist_guide.length === 0 ? (
                                    <p className="text-sm text-slate-500 italic">No specialist tiers added. These help veterans decide which provider level to choose.</p>
                                ) : (
                                    <div className="space-y-6">
                                        {formData.specialist_guide.map((spec, index) => (
                                            <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-lg relative">
                                                <button
                                                    type="button"
                                                    onClick={() => removeSpecialist(index)}
                                                    className="absolute top-4 right-4 text-slate-400 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <div className="space-y-3 pr-8">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs font-semibold text-slate-700 mb-1">Provider Name *</label>
                                                            <input
                                                                type="text"
                                                                value={spec.name || ''}
                                                                onChange={(e) => updateSpecialist(index, 'name', e.target.value)}
                                                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none"
                                                                placeholder='e.g. "Nurse Practitioner"'
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
                                                            <input
                                                                type="text"
                                                                value={spec.role || ''}
                                                                onChange={(e) => updateSpecialist(index, 'role', e.target.value)}
                                                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none"
                                                                placeholder='e.g. "Former C&P Examiner"'
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs font-semibold text-slate-700 mb-1">Price</label>
                                                            <input
                                                                type="text"
                                                                value={spec.price || ''}
                                                                onChange={(e) => updateSpecialist(index, 'price', e.target.value)}
                                                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none"
                                                                placeholder='e.g. "From $400"'
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-semibold text-slate-700 mb-1">Note</label>
                                                            <input
                                                                type="text"
                                                                value={spec.note || ''}
                                                                onChange={(e) => updateSpecialist(index, 'note', e.target.value)}
                                                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none"
                                                                placeholder='e.g. "+$250/additional"'
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Best For</label>
                                                        <textarea
                                                            value={spec.best_for || ''}
                                                            onChange={(e) => updateSpecialist(index, 'best_for', e.target.value)}
                                                            rows={2}
                                                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none"
                                                            placeholder="When should a veteran choose this provider level..."
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Paired Systems */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                                <h2 className="text-xl font-semibold text-slate-900 border-b border-slate-100 pb-3">Commonly Paired Systems</h2>
                                <p className="text-xs text-slate-500">Select body systems that are commonly filed together with this one.</p>

                                {otherSystems.length === 0 ? (
                                    <p className="text-sm text-slate-500 italic">No other body systems exist yet. Create more systems first.</p>
                                ) : (
                                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                        {otherSystems.map(sys => (
                                            <label key={sys.id} className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={(formData.paired_systems || []).includes(sys.name)}
                                                    onChange={() => togglePairedSystem(sys.name)}
                                                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                                />
                                                <span className="text-sm font-medium text-slate-700">{sys.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Pair Note</label>
                                    <textarea
                                        name="pair_note"
                                        value={formData.pair_note}
                                        onChange={handleInputChange}
                                        rows={2}
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                        placeholder='e.g. "Veterans with neurological conditions often also have mental health claims"'
                                    />
                                </div>
                            </div>

                            {/* Stat Cards */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <div>
                                        <h2 className="text-xl font-semibold text-slate-900">Stat Cards</h2>
                                        <p className="text-xs text-slate-500 mt-1">Up to 4 key metrics shown in a grid on the system page (e.g. &quot;Conditions: 7&quot;, &quot;Starting At: $400&quot;).</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addStatCard}
                                        disabled={(formData.stat_cards || []).length >= 4}
                                        className="text-indigo-600 hover:text-indigo-700 flex items-center text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <Plus className="w-4 h-4 mr-1" /> Add Stat
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
                                                    onClick={() => removeStatCard(index)}
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
                                                            onChange={(e) => updateStatCard(index, 'label', e.target.value)}
                                                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none"
                                                            placeholder='e.g. "Conditions" or "Starting At"'
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Value *</label>
                                                        <input
                                                            type="text"
                                                            value={stat.value || ''}
                                                            onChange={(e) => updateStatCard(index, 'value', e.target.value)}
                                                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none"
                                                            placeholder='e.g. "7" or "$400"'
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Subtext</label>
                                                        <input
                                                            type="text"
                                                            value={stat.subtext || ''}
                                                            onChange={(e) => updateStatCard(index, 'subtext', e.target.value)}
                                                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none"
                                                            placeholder='e.g. "Covered" or "Rush available"'
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Build Trust Before Buying */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <div>
                                        <h2 className="text-xl font-semibold text-slate-900">Build Trust Before Buying</h2>
                                        <p className="text-xs text-slate-500 mt-1">Sidebar links for social proof (case studies, testimonials, medical review policy, etc.).</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addTrustLink}
                                        className="text-indigo-600 hover:text-indigo-700 flex items-center text-sm font-medium"
                                    >
                                        <Plus className="w-4 h-4 mr-1" /> Add Link
                                    </button>
                                </div>

                                {(formData.build_trust_links || []).length === 0 ? (
                                    <p className="text-sm text-slate-500 italic">No trust links added yet. These appear in the sidebar to build credibility.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {formData.build_trust_links.map((link, index) => (
                                            <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-lg relative">
                                                <button
                                                    type="button"
                                                    onClick={() => removeTrustLink(index)}
                                                    className="absolute top-3 right-3 text-slate-400 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <div className="space-y-3 pr-6">
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Label *</label>
                                                        <input
                                                            type="text"
                                                            value={link.label || ''}
                                                            onChange={(e) => updateTrustLink(index, 'label', e.target.value)}
                                                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none"
                                                            placeholder='e.g. "Case studies"'
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-700 mb-1">URL *</label>
                                                        <input
                                                            type="text"
                                                            value={link.url || ''}
                                                            onChange={(e) => updateTrustLink(index, 'url', e.target.value)}
                                                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none"
                                                            placeholder='e.g. "/case-studies" or "https://..."'
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
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
                                            {['Overview', 'Conditions Directory', 'Signature Pathways', 'Challenges', 'Services Comparison', 'Specialist Guide', 'Paired Systems', 'FAQs', 'Related Body Systems'].map((lbl, idx) => (
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
                                    <div>
                                        <h2 className="text-xl font-semibold text-slate-900">Frequently Asked Questions</h2>
                                        <p className="text-xs text-slate-500 mt-1">Add FAQs specific to this body system to improve SEO and user understanding.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addFaq}
                                        className="text-indigo-600 hover:text-indigo-700 flex items-center text-sm font-medium"
                                    >
                                        <Plus className="w-4 h-4 mr-1" /> Add FAQ
                                    </button>
                                </div>

                                {(!formData.faqs || formData.faqs.length === 0) ? (
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
                                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Question {index + 1} *</label>
                                                        <input
                                                            type="text"
                                                            value={faq.question || ''}
                                                            onChange={(e) => updateFaq(index, 'question', e.target.value)}
                                                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none"
                                                            placeholder="e.g. What is the VA rating for Neurology conditions?"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Answer *</label>
                                                        <textarea
                                                            value={faq.answer || ''}
                                                            onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                                                            rows={3}
                                                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none"
                                                            placeholder="Enter answer..."
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Signature Pathways */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <div>
                                        <h2 className="text-xl font-semibold text-slate-900">Signature Pathways</h2>
                                        <p className="text-xs text-slate-500 mt-1">Causation relationships shown as flowcharts (e.g. PTSD → Migraine).</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addPathway}
                                        className="text-indigo-600 hover:text-indigo-700 flex items-center text-sm font-medium"
                                    >
                                        <Plus className="w-4 h-4 mr-1" /> Add Pathway
                                    </button>
                                </div>

                                {(!formData.pathways || formData.pathways.length === 0) ? (
                                    <p className="text-sm text-slate-500 italic">No signature pathways added yet. Section will be hidden on public page if empty.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {formData.pathways.map((path, index) => (
                                            <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-lg relative">
                                                <button
                                                    type="button"
                                                    onClick={() => removePathway(index)}
                                                    className="absolute top-3 right-3 text-slate-400 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <div className="space-y-3 pr-6">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs font-semibold text-slate-700 mb-1">Source Node (From) *</label>
                                                            <input
                                                                type="text"
                                                                value={path.from || ''}
                                                                onChange={(e) => updatePathway(index, 'from', e.target.value)}
                                                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none"
                                                                placeholder='e.g. "PTSD" or "TBI"'
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Node (To) *</label>
                                                            <input
                                                                type="text"
                                                                value={path.to || ''}
                                                                onChange={(e) => updatePathway(index, 'to', e.target.value)}
                                                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none"
                                                                placeholder='e.g. "Migraine Headaches"'
                                                                required
                                                            />
                                                        </div>
                                                    </div>

                                                    {path.url ? (
                                                        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-2.5 flex items-center justify-between text-xs">
                                                            <span className="text-indigo-800 font-medium truncate">
                                                                🔗 Linked to: <span className="font-mono">{path.url}</span>
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => updatePathway(index, 'url', '')}
                                                                className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold transition-colors"
                                                                title="Remove Link"
                                                            >
                                                                Unlink
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <label className="block text-xs font-semibold text-slate-700 mb-1">Link to existing page (optional)</label>
                                                            <InternalLinkSearchPicker
                                                                onSelect={(selected) => {
                                                                    updatePathway(index, 'url', selected.url);
                                                                }}
                                                                placeholder="Search for conditions, services, blogs, etc. to link this pathway..."
                                                            />
                                                        </div>
                                                    )}

                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Biological Mechanism *</label>
                                                        <textarea
                                                            value={path.mechanism || ''}
                                                            onChange={(e) => updatePathway(index, 'mechanism', e.target.value)}
                                                            rows={2}
                                                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none"
                                                            placeholder="Explain the connection mechanism..."
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Complexity / Challenges */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <div>
                                        <h2 className="text-xl font-semibold text-slate-900">Why Claims Are Challenging</h2>
                                        <p className="text-xs text-slate-500 mt-1">Cards highlighting why these specific claims are complex (typically 6 items).</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addChallenge}
                                        className="text-indigo-600 hover:text-indigo-700 flex items-center text-sm font-medium"
                                    >
                                        <Plus className="w-4 h-4 mr-1" /> Add Challenge
                                    </button>
                                </div>

                                {(!formData.challenges || formData.challenges.length === 0) ? (
                                    <p className="text-sm text-slate-500 italic">No challenges added yet. Section will be hidden on public page if empty.</p>
                                ) : (
                                    <div className="space-y-6">
                                        {formData.challenges.map((chal, index) => (
                                            <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-lg relative border-l-4 border-l-indigo-500">
                                                <button
                                                    type="button"
                                                    onClick={() => removeChallenge(index)}
                                                    className="absolute top-4 right-4 text-slate-400 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <div className="space-y-3 pr-8">
                                                    <div className="pt-2">
                                                        <IconPicker
                                                            label="Challenge Card Icon"
                                                            value={chal.icon}
                                                            onChange={(val) => updateChallenge(index, 'icon', val)}
                                                            helpText="Select an icon representing this challenge."
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
                                                        <input
                                                            type="text"
                                                            value={chal.title || ''}
                                                            onChange={(e) => updateChallenge(index, 'title', e.target.value)}
                                                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none"
                                                            placeholder='e.g. "Multiple Possible Causes"'
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
                                                        <textarea
                                                            value={chal.description || ''}
                                                            onChange={(e) => updateChallenge(index, 'description', e.target.value)}
                                                            rows={2}
                                                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none"
                                                            placeholder="Explain why this is a challenge..."
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Service-Specific Descriptions */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                                <h2 className="text-xl font-semibold text-slate-900 border-b border-slate-100 pb-3">Service Comparison Descriptions</h2>
                                <p className="text-xs text-slate-500">Provide a description explaining what each service does specifically for this body system category.</p>

                                {services.length === 0 ? (
                                    <p className="text-sm text-slate-500 italic">No active services found.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {services.map(svc => {
                                            const descObj = (formData.service_descriptions || []).find(d => d.service_slug === svc.slug) || { text: '' };
                                            return (
                                                <div key={svc.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                                    <label className="block text-sm font-semibold text-slate-800 mb-1">{svc.title}</label>
                                                    <textarea
                                                        value={descObj.text || ''}
                                                        onChange={(e) => updateServiceDescription(svc.slug, e.target.value)}
                                                        rows={3}
                                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                                                        placeholder={`Describe how ${svc.title} applies specifically to this body system (falls back to service description if empty)...`}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Display Settings */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                                <h2 className="text-xl font-semibold text-slate-900 border-b border-slate-100 pb-3">Display Settings</h2>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Display Order</label>
                                    <input
                                        type="number"
                                        name="display_order"
                                        value={formData.display_order}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Lower numbers appear first</p>
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

export default BodySystemForm;
