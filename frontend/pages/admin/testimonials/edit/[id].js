import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import AdminLayout from '../../../../src/components/admin/AdminLayout';
import ProtectedRoute from '../../../../src/components/admin/ProtectedRoute';
import SEO from '../../../../src/components/SEO';
import TestimonialForm from '../../../../src/components/admin/TestimonialForm';
import { testimonialApi } from '../../../../src/lib/api';

const EditTestimonialPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        branch: '',
        tags: [],
        rating: 5,
        feedback: '',
    });

    useEffect(() => {
        if (id) {
            fetchTestimonial();
        }
    }, [id]);

    const fetchTestimonial = async () => {
        try {
            const data = await testimonialApi.getById(id);
            setFormData({
                name: data.name || '',
                branch: data.branch || '',
                tags: data.tags || [],
                rating: data.rating || 5,
                feedback: data.feedback || '',
            });
        } catch (error) {
            console.error('Error loading testimonial:', error);
            toast.error('Failed to load testimonial');
            router.push('/admin/testimonials');
        } finally {
            setPageLoading(false);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleTagToggle = (tag) => {
        setFormData((current) => ({
            ...current,
            tags: current.tags.includes(tag)
                ? current.tags.filter((item) => item !== tag)
                : [...current.tags, tag],
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.name.trim() || !formData.branch.trim() || !formData.feedback.trim()) {
            toast.error('Name, branch, and feedback are required');
            return;
        }

        setLoading(true);

        try {
            await testimonialApi.update(id, {
                ...formData,
                name: formData.name.trim(),
                branch: formData.branch.trim(),
                feedback: formData.feedback.trim(),
            });

            toast.success('Testimonial updated');
            router.push('/admin/testimonials');
        } catch (error) {
            console.error('Error updating testimonial:', error);
            toast.error(`Failed to update testimonial: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <AdminLayout>
                <SEO title="Edit Testimonial" noindex={true} />
                {pageLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600" />
                    </div>
                ) : (
                    <TestimonialForm
                        title="Edit Testimonial"
                        formData={formData}
                        loading={loading}
                        onChange={handleChange}
                        onTagToggle={handleTagToggle}
                        onRatingChange={(rating) => setFormData((current) => ({ ...current, rating }))}
                        onCancel={() => router.push('/admin/testimonials')}
                        onSubmit={handleSubmit}
                        submitLabel="Update Testimonial"
                    />
                )}
            </AdminLayout>
        </ProtectedRoute>
    );
};

export default EditTestimonialPage;
