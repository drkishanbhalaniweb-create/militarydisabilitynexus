import { useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import AdminLayout from '../../../src/components/admin/AdminLayout';
import ProtectedRoute from '../../../src/components/admin/ProtectedRoute';
import SEO from '../../../src/components/SEO';
import TestimonialForm from '../../../src/components/admin/TestimonialForm';
import { testimonialApi } from '../../../src/lib/api';

const initialFormData = {
    name: '',
    branch: '',
    tags: [],
    rating: 5,
    feedback: '',
};

const NewTestimonialPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(initialFormData);

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
            await testimonialApi.create({
                ...formData,
                name: formData.name.trim(),
                branch: formData.branch.trim(),
                feedback: formData.feedback.trim(),
            });

            toast.success('Testimonial created');
            router.push('/admin/testimonials');
        } catch (error) {
            console.error('Error creating testimonial:', error);
            toast.error(`Failed to save testimonial: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <AdminLayout>
                <SEO title="New Testimonial" noindex={true} />
                <TestimonialForm
                    title="New Testimonial"
                    formData={formData}
                    loading={loading}
                    onChange={handleChange}
                    onTagToggle={handleTagToggle}
                    onRatingChange={(rating) => setFormData((current) => ({ ...current, rating }))}
                    onCancel={() => router.push('/admin/testimonials')}
                    onSubmit={handleSubmit}
                    submitLabel="Save Testimonial"
                />
            </AdminLayout>
        </ProtectedRoute>
    );
};

export default NewTestimonialPage;
