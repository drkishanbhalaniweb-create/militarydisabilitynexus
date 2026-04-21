import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../../src/lib/supabase';
import AdminLayout from '../../../src/components/admin/AdminLayout';
import ProtectedRoute from '../../../src/components/admin/ProtectedRoute';
import SEO from '../../../src/components/SEO';
import { Plus, Edit2, Trash2, ExternalLink, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';

const ClinicalProfilesList = () => {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        try {
            const { data, error } = await supabase
                .from('clinical_profiles')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) throw error;
            setProfiles(data || []);
        } catch (error) {
            console.error('Error fetching profiles:', error);
            toast.error('Failed to load clinical profiles');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete profile for "${name}"? This will unlink them from any blog posts or case studies.`)) return;

        try {
            const { error } = await supabase
                .from('clinical_profiles')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success('Profile deleted');
            setProfiles(profiles.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting profile:', error);
            toast.error('Failed to delete profile');
        }
    };

    const handleToggleActive = async (id, currentStatus) => {
        try {
            const { error } = await supabase
                .from('clinical_profiles')
                .update({ is_active: !currentStatus })
                .eq('id', id);

            if (error) throw error;
            toast.success(currentStatus ? 'Profile deactivated' : 'Profile activated');
            setProfiles(profiles.map(p =>
                p.id === id ? { ...p, is_active: !currentStatus } : p
            ));
        } catch (error) {
            console.error('Error toggling profile:', error);
            toast.error('Failed to update profile');
        }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <AdminLayout>
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
                    </div>
                </AdminLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <AdminLayout>
                <SEO title="Clinical Profiles" noindex={true} />
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Clinical Profiles</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Manage clinician profiles used as trust signals on blogs and case studies
                        </p>
                    </div>
                    <Link
                        href="/admin/clinical-profiles/new"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        <span>New Profile</span>
                    </Link>
                </div>

                {profiles.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-slate-200">
                        <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No clinical profiles yet</h3>
                        <p className="text-slate-500 mb-6">Create your first clinician profile to start building trust signals.</p>
                        <Link
                            href="/admin/clinical-profiles/new"
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-flex items-center space-x-2"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Create First Profile</span>
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Profile</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Credentials</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">LinkedIn</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {profiles.map((profile) => (
                                    <tr key={profile.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-3">
                                                {profile.photo_url ? (
                                                    <img
                                                        src={profile.photo_url}
                                                        alt={profile.full_name}
                                                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                        <Stethoscope className="w-5 h-5 text-indigo-600" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="text-sm font-semibold text-slate-900">{profile.full_name}</div>
                                                    <div className="text-xs text-slate-500">/clinician/{profile.slug}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            {profile.credentials || '—'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {profile.linkedin_url ? (
                                                <a
                                                    href={profile.linkedin_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-indigo-600 hover:text-indigo-800 inline-flex items-center space-x-1 text-sm"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    <span>View</span>
                                                </a>
                                            ) : (
                                                <span className="text-slate-400 text-sm">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleToggleActive(profile.id, profile.is_active)}
                                                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                                                    profile.is_active
                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                            >
                                                {profile.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Link
                                                    href={`/admin/clinical-profiles/edit/${profile.id}`}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(profile.id, profile.full_name)}
                                                    className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </AdminLayout>
        </ProtectedRoute>
    );
};

export default ClinicalProfilesList;
