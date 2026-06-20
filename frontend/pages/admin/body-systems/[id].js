import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { bodySystemApi } from '../../../src/lib/api';
import { supabase } from '../../../src/lib/supabase';
import AdminLayout from '../../../src/components/admin/AdminLayout';
import ProtectedRoute from '../../../src/components/admin/ProtectedRoute';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../../../src/components/SEO';
import Link from 'next/link';
import IconPicker from '../../../src/components/admin/IconPicker';
import RichTextEditor from '../../../src/components/admin/RichTextEditor';

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
