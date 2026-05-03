import { useEffect, useState } from 'react';
import { supabase } from '../../../src/lib/supabase';
import AdminLayout from '../../../src/components/admin/AdminLayout';
import ProtectedRoute from '../../../src/components/admin/ProtectedRoute';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../../../src/components/SEO';
import Link from 'next/link';

const AdminConditions = () => {
    const [conditions, setConditions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConditions();
    }, []);

    const fetchConditions = async () => {
        try {
            const { data, error } = await supabase
                .from('conditions')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setConditions(data || []);
        } catch (error) {
            console.error('Error fetching conditions:', error);
            toast.error('Failed to load conditions');
        } finally {
            setLoading(false);
        }
    };

    const togglePublish = async (id, currentStatus) => {
        try {
            const { error } = await supabase
                .from('conditions')
                .update({ is_published: !currentStatus })
                .eq('id', id);

            if (error) throw error;

            setConditions(prev => prev.map(c =>
                c.id === id ? { ...c, is_published: !currentStatus } : c
            ));
            toast.success(currentStatus ? 'Condition unpublished' : 'Condition published');
        } catch (error) {
            console.error('Error updating condition:', error);
            toast.error('Failed to update condition status');
        }
    };

    const deleteCondition = async (id, title) => {
        if (!window.confirm(`Are you sure you want to permanently delete "${title}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from('conditions')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setConditions(prev => prev.filter(c => c.id !== id));
            toast.success('Condition deleted successfully');
        } catch (error) {
            console.error('Error deleting condition:', error);
            toast.error('Failed to delete condition');
        }
    };

    return (
        <ProtectedRoute>
            <AdminLayout>
                <SEO title="Admin - Conditions" noindex={true} />
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Programmatic SEO Conditions</h1>
                            <p className="text-slate-600 mt-2">Manage condition-specific landing pages</p>
                        </div>
                        <Link
                            href="/admin/conditions/new"
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Create Condition</span>
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
                        </div>
                    ) : conditions.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-slate-200">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">No Conditions Yet</h3>
                            <p className="text-slate-600 mb-6">Create your first condition-specific landing page (e.g., Sleep Apnea, PTSD) to boost organic traffic.</p>
                            <Link
                                href="/admin/conditions/new"
                                className="inline-flex bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 items-center space-x-2 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Create First Condition</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {conditions.map((condition) => (
                                <div key={condition.id} className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 flex flex-col h-full">
                                    <div className="flex items-start justify-between mb-4">
                                        <h3 className="text-lg font-bold text-slate-900 line-clamp-2">{condition.page_title}</h3>
                                        <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ml-2 ${condition.is_published
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {condition.is_published ? 'Published' : 'Draft'}
                                        </span>
                                    </div>

                                    <p className="text-sm text-slate-600 mb-4 line-clamp-3 flex-grow">{condition.meta_description || 'No description provided'}</p>

                                    <div className="flex items-center justify-between text-xs text-slate-500 mb-4 border-t border-slate-100 pt-4">
                                        <span>/{condition.slug}</span>
                                        <span>{condition.faqs?.length || 0} FAQs</span>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => togglePublish(condition.id, condition.is_published)}
                                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors"
                                        >
                                            {condition.is_published ? 'Unpublish' : 'Publish'}
                                        </button>
                                        <Link
                                            href={`/conditions/${condition.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
                                            title="View page"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                        <Link
                                            href={`/admin/conditions/${condition.id}`}
                                            className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
                                            title="Edit condition"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => deleteCondition(condition.id, condition.page_title)}
                                            className="p-2 border border-red-200 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                                            title="Delete condition"
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

export default AdminConditions;
