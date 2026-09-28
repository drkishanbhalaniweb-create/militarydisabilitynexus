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
    slug: '',
    video_url: '',
    video_provider: 'html5',
    video_thumbnail_url: '',
    video_duration: '',
    video_aspect_ratio: '4:5',
    video_transcript: '',
    video_key_moments: [],
    clinician_notes: '',
    claim_outcome: '',
    condition_tag: '',
    service_slug: '',
    is_featured: false,
};

const NewTestimonialPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(initialFormData);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFormData((current) => ({
            ...current,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleCustomChange = (name, value) => {
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
                slug: formData.slug ? formData.slug.trim() : null,
                video_url: formData.video_url ? formData.video_url.trim() : null,
                video_thumbnail_url: formData.video_thumbnail_url ? formData.video_thumbnail_url.trim() : null,
                video_duration: formData.video_duration || null,
                claim_outcome: formData.claim_outcome ? formData.claim_outcome.trim() : null,
                condition_tag: formData.condition_tag ? formData.condition_tag.trim() : null,
                clinician_notes: formData.clinician_notes ? formData.clinician_notes.trim() : null,
                video_transcript: formData.video_transcript ? formData.video_transcript.trim() : null,
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
                    onCustomChange={handleCustomChange}
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
