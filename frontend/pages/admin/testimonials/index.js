import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Video, ExternalLink, Pin } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from '../../../src/components/admin/AdminLayout';
import ProtectedRoute from '../../../src/components/admin/ProtectedRoute';
import SEO from '../../../src/components/SEO';
import StarRating from '../../../src/components/testimonials/StarRating';
import { testimonialApi } from '../../../src/lib/api';
import { getTestimonialTagTone, compareTestimonialsByPinned } from '../../../src/lib/testimonials';

const TestimonialsAdminPage = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all' | 'pinned' | 'videos'

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

    const handleTogglePin = async (testimonial) => {
        const nextPinned = !testimonial.is_pinned;
        const nextOrder = nextPinned
            ? (testimonial.pin_order > 0 ? testimonial.pin_order : 1)
            : (testimonial.pin_order || 0);

        // Optimistic UI update
        setTestimonials((current) =>
            current.map((t) =>
                t.id === testimonial.id
                    ? { ...t, is_pinned: nextPinned, pin_order: nextOrder }
                    : t
            ).sort(compareTestimonialsByPinned)
        );

        try {
            await testimonialApi.togglePin(testimonial.id, nextPinned, nextOrder);
            if (nextPinned) {
                toast.success('Testimonial pinned to top');
            } else {
                toast.success('Testimonial unpinned');
            }
        } catch (error) {
            console.error('Error toggling pin:', error);
            toast.error('Failed to update pin status');
            // Rollback optimistic update
            setTestimonials((current) =>
                current.map((t) =>
                    t.id === testimonial.id
                        ? { ...t, is_pinned: testimonial.is_pinned, pin_order: testimonial.pin_order }
                        : t
                ).sort(compareTestimonialsByPinned)
            );
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

    const pinnedCount = useMemo(
        () => testimonials.filter((t) => Boolean(t.is_pinned)).length,
        [testimonials]
    );

    const videoCount = useMemo(
        () => testimonials.filter((t) => Boolean(t.video_url)).length,
        [testimonials]
    );

    const filteredTestimonials = useMemo(() => {
        let list = testimonials;
        if (filter === 'pinned') {
            list = list.filter((t) => Boolean(t.is_pinned));
        } else if (filter === 'videos') {
            list = list.filter((t) => Boolean(t.video_url));
        }
        return [...list].sort(compareTestimonialsByPinned);
    }, [testimonials, filter]);

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
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Testimonials</h1>
                            <p className="mt-2 text-slate-600">
                                Pinned testimonials appear first on the website, followed by newest additions.
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

                    {/* Quick Filters */}
                    {!loading && testimonials.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setFilter('all')}
                                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                                    filter === 'all'
                                        ? 'bg-slate-900 text-white'
                                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                All ({testimonials.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setFilter('pinned')}
                                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                                    filter === 'pinned'
                                        ? 'bg-amber-600 text-white shadow-xs'
                                        : 'border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                                }`}
                            >
                                <span>📌 Pinned Only</span>
                                <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                                    filter === 'pinned' ? 'bg-white/25 text-white' : 'bg-amber-200 text-amber-900'
                                }`}>
                                    {pinnedCount}
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFilter('videos')}
                                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                                    filter === 'videos'
                                        ? 'bg-red-700 text-white shadow-xs'
                                        : 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                                }`}
                            >
                                <span>🎥 Videos</span>
                                <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                                    filter === 'videos' ? 'bg-white/25 text-white' : 'bg-red-200 text-red-900'
                                }`}>
                                    {videoCount}
                                </span>
                            </button>
                        </div>
                    )}

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
                                                Pin
                                            </th>
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
                                        {filteredTestimonials.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-12 text-center text-sm text-slate-500">
                                                    {filter === 'pinned'
                                                        ? 'No pinned testimonials yet. Click "Pin" on any testimonial to pin it to top.'
                                                        : filter === 'videos'
                                                        ? 'No video testimonials found.'
                                                        : 'No testimonials found.'}
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredTestimonials.map((testimonial) => (
                                                <tr key={testimonial.id} className="hover:bg-slate-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleTogglePin(testimonial)}
                                                            title={testimonial.is_pinned ? `Pinned (#${testimonial.pin_order || 1}). Click to unpin.` : 'Click to pin to top'}
                                                            aria-label={testimonial.is_pinned ? `Unpin testimonial (currently priority ${testimonial.pin_order || 1})` : 'Pin testimonial to top'}
                                                            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                                                                testimonial.is_pinned
                                                                    ? 'border-amber-300 bg-amber-50 text-amber-900 shadow-xs hover:bg-amber-100'
                                                                    : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600'
                                                            }`}
                                                        >
                                                            <Pin className={`h-3.5 w-3.5 ${testimonial.is_pinned ? 'fill-amber-600 text-amber-600' : 'text-slate-400'}`} />
                                                            {testimonial.is_pinned ? (
                                                                <span>📌 #{testimonial.pin_order ?? 1}</span>
                                                            ) : (
                                                                <span className="text-slate-500">Pin</span>
                                                            )}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-slate-900">{testimonial.name}</span>
                                                        {testimonial.video_url && (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                                                                <Video className="h-3 w-3" />
                                                                <span>{testimonial.video_aspect_ratio || '4:5'}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-slate-500 flex items-center gap-2 mt-0.5">
                                                        <span>{testimonial.branch || 'Branch not set'}</span>
                                                        {testimonial.slug && (
                                                            <a
                                                                href={`/testimonials/${testimonial.slug}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-0.5 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                                                            >
                                                                <ExternalLink className="h-3 w-3" />
                                                                <span>Watch Page</span>
                                                            </a>
                                                        )}
                                                    </div>
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
                                        )))}
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
