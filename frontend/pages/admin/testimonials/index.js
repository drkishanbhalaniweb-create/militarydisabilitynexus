import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from '../../../src/components/admin/AdminLayout';
import ProtectedRoute from '../../../src/components/admin/ProtectedRoute';
import SEO from '../../../src/components/SEO';
import StarRating from '../../../src/components/testimonials/StarRating';
import { testimonialApi } from '../../../src/lib/api';
import { getTestimonialTagTone } from '../../../src/lib/testimonials';

const TestimonialsAdminPage = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            const data = await testimonialApi.getAll();
            setTestimonials(data);
        } catch (error) {
            console.error('Error fetching testimonials:', error);
            toast.error('Failed to load testimonials');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this testimonial? This action cannot be undone.')) {
            return;
        }

        try {
            await testimonialApi.delete(id);
            setTestimonials((current) => current.filter((testimonial) => testimonial.id !== id));
            toast.success('Testimonial deleted');
        } catch (error) {
            console.error('Error deleting testimonial:', error);
            toast.error('Failed to delete testimonial');
        }
    };

    const formatDate = (dateString) =>
        new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });

    return (
        <ProtectedRoute>
            <AdminLayout>
                <SEO title="Admin Testimonials" noindex={true} />
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Testimonials</h1>
                            <p className="mt-2 text-slate-600">
                                Every saved testimonial is public and appears newest first on the website.
                            </p>
                        </div>

                        <Link
                            href="/admin/testimonials/new"
                            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                        >
                            <Plus className="h-5 w-5" />
                            <span>New Testimonial</span>
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600" />
                        </div>
                    ) : testimonials.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
                            <h2 className="text-xl font-semibold text-slate-900">No testimonials yet</h2>
                            <p className="mt-2 text-slate-600">
                                Add your first testimonial and it will publish immediately on `/testimonials`.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                                Client
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                                Tags
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                                Rating
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                                Added
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 bg-white">
                                        {testimonials.map((testimonial) => (
                                            <tr key={testimonial.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-slate-900">{testimonial.name}</div>
                                                    <div className="text-sm text-slate-500">{testimonial.branch || 'Branch not set'}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        {testimonial.tags?.length ? (
                                                            testimonial.tags.map((tag) => (
                                                                <span
                                                                    key={`${testimonial.id}-${tag}`}
                                                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${getTestimonialTagTone(tag)}`}
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-sm text-slate-400">No tags</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <StarRating value={testimonial.rating} />
                                                        <span className="text-sm text-slate-600">{testimonial.rating || 0}/5</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                    {formatDate(testimonial.created_at)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <Link
                                                        href={`/admin/testimonials/edit/${testimonial.id}`}
                                                        className="mr-3 text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        <Edit className="inline h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(testimonial.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <Trash2 className="inline h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
};

export default TestimonialsAdminPage;
