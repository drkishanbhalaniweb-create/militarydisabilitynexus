import { useEffect, useState } from 'react';
import { supabase } from '../../../src/lib/supabase';
import AdminLayout from '../../../src/components/admin/AdminLayout';
import ProtectedRoute from '../../../src/components/admin/ProtectedRoute';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../../../src/components/SEO';
import Link from 'next/link';
import DynamicIcon from '../../../src/components/ui/dynamic-icon';

const AdminBodySystems = () => {
    const [systems, setSystems] = useState([]);
    const [conditionCounts, setConditionCounts] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [systemsResult, conditionsResult] = await Promise.all([
                supabase
                    .from('body_systems')
                    .select('*')
                    .order('display_order', { ascending: true }),
                supabase
                    .from('conditions')
                    .select('id, body_system_id')
                    .not('body_system_id', 'is', null),
            ]);

            if (systemsResult.error) throw systemsResult.error;
            setSystems(systemsResult.data || []);

            // Build a map of system_id → count
            const counts = {};
            (conditionsResult.data || []).forEach(c => {
                counts[c.body_system_id] = (counts[c.body_system_id] || 0) + 1;
            });
            setConditionCounts(counts);
        } catch (error) {
            console.error('Error fetching body systems:', error);
            toast.error('Failed to load body systems');
        } finally {
            setLoading(false);
        }
    };

    const togglePublish = async (id, currentStatus) => {
        try {
            const { error } = await supabase
                .from('body_systems')
                .update({ is_published: !currentStatus })
                .eq('id', id);

            if (error) throw error;

            setSystems(prev => prev.map(s =>
                s.id === id ? { ...s, is_published: !currentStatus } : s
            ));
            toast.success(currentStatus ? 'Body system unpublished' : 'Body system published');
        } catch (error) {
            console.error('Error updating body system:', error);
            toast.error('Failed to update body system status');
        }
    };

    const deleteSystem = async (id, name) => {
        if (!window.confirm(`Are you sure you want to permanently delete "${name}"? Conditions assigned to this system will be unlinked (not deleted).`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from('body_systems')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setSystems(prev => prev.filter(s => s.id !== id));
            toast.success('Body system deleted successfully');
        } catch (error) {
            console.error('Error deleting body system:', error);
            toast.error('Failed to delete body system');
        }
    };

    return (
        <ProtectedRoute>
            <AdminLayout>
                <SEO title="Admin - Body Systems" noindex={true} />
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Body Systems</h1>
                            <p className="text-slate-600 mt-2">Manage medical body system categories that group conditions</p>
                        </div>
                        <Link
                            href="/admin/body-systems/new"
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Create Body System</span>
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
                        </div>
                    ) : systems.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-slate-200">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">No Body Systems Yet</h3>
                            <p className="text-slate-600 mb-6">Create body systems like &quot;Neurology&quot;, &quot;Mental Health&quot;, or &quot;GI&quot; to organize conditions by medical category.</p>
                            <Link
                                href="/admin/body-systems/new"
                                className="inline-flex bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 items-center space-x-2 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Create First Body System</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {systems.map((system) => (
                                <div key={system.id} className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 flex flex-col h-full">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl flex items-center"><DynamicIcon name={system.icon} className="w-5 h-5 text-indigo-600" /></span>
                                            <h3 className="text-lg font-bold text-slate-900">{system.name}</h3>
                                        </div>
                                        <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ml-2 ${system.is_published
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {system.is_published ? 'Published' : 'Draft'}
                                        </span>
                                    </div>

                                    <p className="text-sm text-slate-600 mb-4 line-clamp-2 flex-grow">{system.description}</p>

                                    <div className="flex items-center justify-between text-xs text-slate-500 mb-4 border-t border-slate-100 pt-4">
                                        <span>{conditionCounts[system.id] || 0} conditions</span>
                                        <span>Order: {system.display_order}</span>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => togglePublish(system.id, system.is_published)}
                                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors"
                                        >
                                            {system.is_published ? 'Unpublish' : 'Publish'}
                                        </button>
                                        <Link
                                            href={`/admin/body-systems/${system.id}`}
                                            className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
                                            title="Edit body system"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => deleteSystem(system.id, system.name)}
                                            className="p-2 border border-red-200 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                                            title="Delete body system"
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

export default AdminBodySystems;
