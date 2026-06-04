import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { pricingTierApi } from '../../../src/lib/api';
import AdminLayout from '../../../src/components/admin/AdminLayout';
import ProtectedRoute from '../../../src/components/admin/ProtectedRoute';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../../../src/components/SEO';
import Link from 'next/link';

const PricingTierForm = () => {
    const router = useRouter();
    const { id } = router.query;
    const isNew = id === 'new';

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        provider_description: '',
        base_price: '',
        mental_health_price: '',
        note: '',
        best_for: '',
        features: [],
        is_featured: false,
        display_order: 0,
        is_active: true,
    });

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (!isNew) {
                const tier = await pricingTierApi.getById(id);
                if (tier) {
                    setFormData({
                        name: tier.name || '',
                        slug: tier.slug || '',
                        provider_description: tier.provider_description || '',
                        base_price: tier.base_price || '',
                        mental_health_price: tier.mental_health_price || '',
                        note: tier.note || '',
                        best_for: tier.best_for || '',
                        features: tier.features || [],
                        is_featured: tier.is_featured ?? false,
                        display_order: tier.display_order ?? 0,
                        is_active: tier.is_active ?? true,
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching tier:', error);
            toast.error('Failed to load pricing tier');
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

    const addFeature = () => {
        setFormData(prev => ({
            ...prev,
            features: [...(prev.features || []), ''],
        }));
    };

    const removeFeature = (index) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index),
        }));
    };

    const updateFeature = (index, value) => {
        setFormData(prev => {
            const updated = [...prev.features];
            updated[index] = value;
            return { ...prev, features: updated };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loadError && !isNew) {
            toast.error('Cannot save because the tier failed to load properly.');
            return;
        }

        setSaving(true);

        try {
            const payload = {
                ...formData,
                display_order: parseInt(formData.display_order, 10) || 0,
                features: (formData.features || []).filter(f => f.trim() !== ''),
            };

            if (isNew) {
                await pricingTierApi.create(payload);
                toast.success('Pricing tier created successfully');
                router.push('/admin/pricing-tiers');
            } else {
                await pricingTierApi.update(id, payload);
                toast.success('Pricing tier updated successfully');
            }
        } catch (error) {
            console.error('Error saving tier:', error);
            const safeMessage = error instanceof Error ? error.message : String(error) || 'Unknown error';
            toast.error('Failed to save pricing tier: ' + safeMessage);
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
                <SEO title={isNew ? 'Create Pricing Tier' : 'Edit Pricing Tier'} noindex={true} />

                {loadError && !isNew && (
                    <div className="max-w-5xl mx-auto mb-6 bg-red-50 border-l-4 border-red-500 p-4">
                        <p className="text-sm text-red-700">
                            Error loading tier data. Please do not submit this form as it may overwrite existing data.
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8 pb-20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link href="/admin/pricing-tiers" className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                <ArrowLeft className="w-5 h-5 text-slate-600" />
                            </Link>
                            <h1 className="text-3xl font-bold text-slate-900">
                                {isNew ? 'Create Pricing Tier' : 'Edit Pricing Tier'}
                            </h1>
                        </div>
                        <button
                            type="submit"
                            disabled={saving || (loadError && !isNew)}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2 disabled:opacity-50 transition-colors"
                        >
                            <Save className="w-5 h-5" />
                            <span>{saving ? 'Saving...' : 'Save Tier'}</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Info */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                                <h2 className="text-xl font-semibold text-slate-900 border-b border-slate-100 pb-3">Basic Information</h2>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Tier Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                                        placeholder='e.g. "Nurse Practitioner" or "Internist / Specialist"'
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

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Provider Description</label>
                                    <input
                                        type="text"
                                        name="provider_description"
                                        value={formData.provider_description}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                                        placeholder='e.g. "Former C&P Examiner" or "Board-Certified Specialist"'
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Best For</label>
                                    <textarea
                                        name="best_for"
                                        value={formData.best_for}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                                        placeholder="Describe when a veteran should choose this tier..."
                                    />
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                                <h2 className="text-xl font-semibold text-slate-900 border-b border-slate-100 pb-3">Pricing</h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Base Price *</label>
                                        <input
                                            type="text"
                                            name="base_price"
                                            value={formData.base_price}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                                            placeholder='e.g. "$400" or "$945–$1,800"'
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Displayed as-is (include $ sign)</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Mental Health Price</label>
                                        <input
                                            type="text"
                                            name="mental_health_price"
                                            value={formData.mental_health_price}
                                            onChange={handleInputChange}
                                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                                            placeholder='e.g. "$1,600–$2,400" or "N/A"'
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Shown when viewing MH conditions</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Price Note</label>
                                    <input
                                        type="text"
                                        name="note"
                                        value={formData.note}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                                        placeholder='e.g. "+ $250 per additional condition"'
                                    />
                                </div>
                            </div>

                            {/* Features */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <h2 className="text-xl font-semibold text-slate-900">Features</h2>
                                    <button
                                        type="button"
                                        onClick={addFeature}
                                        className="text-indigo-600 hover:text-indigo-700 flex items-center text-sm font-medium"
                                    >
                                        <Plus className="w-4 h-4 mr-1" /> Add Feature
                                    </button>
                                </div>

                                {formData.features.length === 0 ? (
                                    <p className="text-sm text-slate-500 italic">No features added yet. These appear as a checklist in the pricing modal.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {formData.features.map((feature, index) => (
                                            <div key={index} className="flex items-center space-x-2">
                                                <input
                                                    type="text"
                                                    value={feature}
                                                    onChange={(e) => updateFeature(index, e.target.value)}
                                                    className="flex-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                                    placeholder="Feature description"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeFeature(index)}
                                                    className="text-slate-400 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
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

                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="is_featured"
                                        checked={formData.is_featured}
                                        onChange={handleInputChange}
                                        className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                    />
                                    <div>
                                        <span className="font-medium text-slate-700">Featured Tier</span>
                                        <p className="text-xs text-slate-500">Shows a &quot;Most Chosen&quot; badge</p>
                                    </div>
                                </label>
                            </div>

                            {/* Publishing */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <h2 className="text-xl font-semibold text-slate-900 border-b border-slate-100 pb-3 mb-4">Publishing</h2>

                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={formData.is_active}
                                        onChange={handleInputChange}
                                        className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                    />
                                    <span className="font-medium text-slate-700">Active (Visible in pricing modal)</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </form>
            </AdminLayout>
        </ProtectedRoute>
    );
};

export default PricingTierForm;
