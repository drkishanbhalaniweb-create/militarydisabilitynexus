import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../src/lib/supabase';
import AdminLayout from '../../../src/components/admin/AdminLayout';
import ImageUpload from '../../../src/components/admin/ImageUpload';
import ProtectedRoute from '../../../src/components/admin/ProtectedRoute';
import SEO from '../../../src/components/SEO';
import { Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { generateSlug, clinicalProfileApi } from '../../../src/lib/api';

const NewClinicalProfile = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        slug: '',
        credentials: '',
        bio: '',
        linkedin_url: '',
        photo_url: '',
        is_active: true,
        display_order: 0,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleNameChange = (e) => {
        const full_name = e.target.value;
        setFormData({
            ...formData,
            full_name,
            slug: generateSlug(full_name),
        });
    };

    const handlePhotoUpload = (url) => {
        setFormData({ ...formData, photo_url: url || '' });
    };

    const getWordCount = (text) => {
        if (!text || !text.trim()) return 0;
        return text.trim().split(/\s+/).length;
    };

    const wordCount = getWordCount(formData.bio);
    const isValidBio = wordCount >= 100 && wordCount <= 1000;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isValidBio) {
            toast.error(`Bio must be 100–1000 words. Current: ${wordCount} words.`);
            return;
        }

        setLoading(true);

        try {
            await clinicalProfileApi.create(formData);
            toast.success('Clinical profile created successfully!');
            router.push('/admin/clinical-profiles');
        } catch (error) {
            console.error('Error creating profile:', error);
            toast.error('Failed to create profile: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <AdminLayout>
                <SEO title="New Clinical Profile" noindex={true} />
                <div className="max-w-3xl">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold text-slate-900">New Clinical Profile</h1>
                        <button
                            onClick={() => router.push('/admin/clinical-profiles')}
                            className="text-slate-600 hover:text-slate-900 p-2"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Profile Information</h2>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="full_name"
                                            value={formData.full_name}
                                            onChange={handleNameChange}
                                            required
                                            placeholder="Dr. Jane Smith"
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Credentials
                                        </label>
                                        <input
                                            type="text"
                                            name="credentials"
                                            value={formData.credentials}
                                            onChange={handleChange}
                                            placeholder="MD, FACP"
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Slug (URL)
                                    </label>
                                    <div className="flex items-center">
                                        <span className="text-sm text-slate-500 mr-2">/clinician/</span>
                                        <input
                                            type="text"
                                            name="slug"
                                            value={formData.slug}
                                            onChange={handleChange}
                                            required
                                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                <ImageUpload
                                    onUploadComplete={handlePhotoUpload}
                                    existingImage={formData.photo_url}
                                    folder="clinical-profiles"
                                    label="Profile Photo"
                                />

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Bio *
                                    </label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        required
                                        rows="12"
                                        placeholder="Write a detailed professional bio for this clinician (100–1000 words). Include education, experience, specializations, and any relevant background that establishes their expertise and trustworthiness."
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <div className="flex items-center justify-between mt-2">
                                        <p className="text-xs text-slate-500">
                                            This bio will be publicly displayed on the clinician's profile page and used as a trust signal.
                                        </p>
                                        <span className={`text-xs font-semibold ${
                                            wordCount === 0
                                                ? 'text-slate-400'
                                                : isValidBio
                                                ? 'text-green-600'
                                                : wordCount < 100
                                                ? 'text-amber-600'
                                                : 'text-red-600'
                                        }`}>
                                            {wordCount} / 100–1000 words
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        LinkedIn Profile URL
                                    </label>
                                    <input
                                        type="url"
                                        name="linkedin_url"
                                        value={formData.linkedin_url}
                                        onChange={handleChange}
                                        placeholder="https://linkedin.com/in/username"
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Display Order
                                        </label>
                                        <input
                                            type="number"
                                            name="display_order"
                                            value={formData.display_order}
                                            onChange={handleChange}
                                            min="0"
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <div className="flex items-center pb-2">
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
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => router.push('/admin/clinical-profiles')}
                                className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !isValidBio}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-2"
                            >
                                <Save className="w-5 h-5" />
                                <span>{loading ? 'Saving...' : 'Create Profile'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
};

export default NewClinicalProfile;
