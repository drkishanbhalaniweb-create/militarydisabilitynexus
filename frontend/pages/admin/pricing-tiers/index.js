import { useEffect, useState } from 'react';
import { supabase } from '../../../src/lib/supabase';
import AdminLayout from '../../../src/components/admin/AdminLayout';
import ProtectedRoute from '../../../src/components/admin/ProtectedRoute';
import { Plus, Edit, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../../../src/components/SEO';
import Link from 'next/link';

const AdminPricingTiers = () => {
    const [tiers, setTiers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTiers();
    }, []);

    const fetchTiers = async () => {
        try {
            const { data, error } = await supabase
                .from('pricing_tiers')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) throw error;
            setTiers(data || []);
        } catch (error) {
            console.error('Error fetching pricing tiers:', error);
            toast.error('Failed to load pricing tiers');
        } finally {
            setLoading(false);
        }
    };

    const toggleActive = async (id, currentStatus) => {
        try {
            const { error } = await supabase
                .from('pricing_tiers')
                .update({ is_active: !currentStatus })
                .eq('id', id);

            if (error) throw error;

            setTiers(prev => prev.map(t =>
                t.id === id ? { ...t, is_active: !currentStatus } : t
            ));
            toast.success(currentStatus ? 'Tier deactivated' : 'Tier activated');
        } catch (error) {
            console.error('Error updating tier:', error);
            toast.error('Failed to update tier status');
        }
    };

    const deleteTier = async (id, name) => {
        if (!window.confirm(`Are you sure you want to permanently delete "${name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from('pricing_tiers')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setTiers(prev => prev.filter(t => t.id !== id));
            toast.success('Pricing tier deleted successfully');
        } catch (error) {
            console.error('Error deleting tier:', error);
            toast.error('Failed to delete pricing tier');
        }
    };

    return (
        <ProtectedRoute>
            <AdminLayout>
                <SEO title="Admin - Pricing Tiers" noindex={true} />
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Pricing Tiers</h1>
                            <p className="text-slate-600 mt-2">Manage pricing tiers displayed in the pricing comparison modal</p>
                        </div>
                        <Link
                            href="/admin/pricing-tiers/new"
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Create Tier</span>
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
                        </div>
                    ) : tiers.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-slate-200">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">No Pricing Tiers Yet</h3>
                            <p className="text-slate-600 mb-6">Create pricing tiers like &quot;Nurse Practitioner&quot;, &quot;Internist&quot;, or &quot;Complex Specialist&quot; to power the pricing comparison modal.</p>
                            <Link
                                href="/admin/pricing-tiers/new"
                                className="inline-flex bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 items-center space-x-2 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Create First Tier</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tiers.map((tier) => (
                                <div key={tier.id} className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 flex flex-col h-full">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-bold text-slate-900">{tier.name}</h3>
                                            {tier.is_featured && (
                                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                            )}
                                        </div>
                                        <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ml-2 ${tier.is_active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {tier.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>

                                    <div className="space-y-2 mb-4 flex-grow">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Base Price</span>
                                            <span className="font-semibold text-slate-900">{tier.base_price}</span>
                                        </div>
                                        {tier.mental_health_price && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">MH Price</span>
                                                <span className="font-semibold text-slate-900">{tier.mental_health_price}</span>
                                            </div>
                                        )}
                                        {tier.provider_description && (
                                            <p className="text-xs text-slate-500 italic">{tier.provider_description}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-slate-500 mb-4 border-t border-slate-100 pt-4">
                                        <span>Order: {tier.display_order}</span>
                                        <span>{(tier.features || []).length} features</span>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => toggleActive(tier.id, tier.is_active)}
                                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors"
                                        >
                                            {tier.is_active ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <Link
                                            href={`/admin/pricing-tiers/${tier.id}`}
                                            className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
                                            title="Edit tier"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => deleteTier(tier.id, tier.name)}
                                            className="p-2 border border-red-200 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                                            title="Delete tier"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
};

export default AdminPricingTiers;
