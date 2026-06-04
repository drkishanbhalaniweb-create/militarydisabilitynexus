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

const EMPTY_SPECIALIST = { name: '', role: '', best_for: '', price: '', note: '' };

const BodySystemForm = () => {
    const router = useRouter();
    const { id } = router.query;
    const isNew = id === 'new';

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const [allSystems, setAllSystems] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        icon: '',
        description: '',
        overview: '',
        is_mental_health: false,
        specialist_guide: [],
        paired_systems: [],
        pair_note: '',
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

            if (!isNew) {
                const system = await bodySystemApi.getById(id);
                if (system) {
                    setFormData({
                        name: system.name || '',
                        slug: system.slug || '',
                        icon: system.icon || '',
                        description: system.description || '',
                        overview: system.overview || '',
                        is_mental_health: system.is_mental_health ?? false,
                        specialist_guide: system.specialist_guide || [],
                        paired_systems: system.paired_systems || [],
                        pair_note: system.pair_note || '',
                        display_order: system.display_order ?? 0,
                        is_published: system.is_published ?? true,
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loadError && !isNew) {
            toast.error('Cannot save because the body system failed to load properly.');
            return;
        }

        setSaving(true);

        try {
            const payload = {
                ...formData,
                display_order: parseInt(formData.display_order, 10) || 0,
                specialist_guide: (formData.specialist_guide || []).filter(s => s.name.trim() !== ''),
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
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Short Description *</label>
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
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Overview *</label>
                                    <textarea
                                        name="overview"
                                        value={formData.overview}
                                        onChange={handleInputChange}
                                        required
                                        rows={5}
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                                        placeholder="Longer description explaining this body system category for the public-facing page..."
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
                                                                value={spec.name}
                                                                onChange={(e) => updateSpecialist(index, 'name', e.target.value)}
                                                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none"
                                                                placeholder='e.g. "Nurse Practitioner"'
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
                                                            <input
                                                                type="text"
                                                                value={spec.role}
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
                                                                value={spec.price}
                                                                onChange={(e) => updateSpecialist(index, 'price', e.target.value)}
                                                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none"
                                                                placeholder='e.g. "From $400"'
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-semibold text-slate-700 mb-1">Note</label>
                                                            <input
                                                                type="text"
                                                                value={spec.note}
                                                                onChange={(e) => updateSpecialist(index, 'note', e.target.value)}
                                                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none"
                                                                placeholder='e.g. "+$250/additional"'
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Best For</label>
                                                        <textarea
                                                            value={spec.best_for}
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
