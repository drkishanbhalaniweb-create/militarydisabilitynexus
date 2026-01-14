import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../../src/lib/supabase';
import AdminLayout from '../../../../src/components/admin/AdminLayout';
import ProtectedRoute from '../../../../src/components/admin/ProtectedRoute';
import { Save, X } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../../../../src/components/SEO';

const CaseStudyForm = () => {
    const router = useRouter();
    const { id } = router.query;
    const isEdit = true;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        challenge: '',
        solution: '',
        results: '',
        key_takeaway: '',
        is_published: false,
        published_at: new Date().toISOString().split('T')[0],
        tags: [],
    });

    const availableTags = [
        'SMC/Aid & Attendance',
        'Primary Service Connection',
        'Secondary Service Connection',
        'Mental Health Claim',
        '1151 Claim',
        'Claim Readiness Review'
    ];

    const [contentText, setContentText] = useState({
        challenge: '',
        solution: '',
        results: '',
        key_takeaway: '',
    });

    useEffect(() => {
        if (id) {
            fetchCaseStudy();
        }
    }, [id]);

    const fetchCaseStudy = async () => {
        try {
            const { data, error } = await supabase
                .from('case_studies')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setFormData({
                ...data,
                published_at: data.published_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            });
            // Convert HTML back to plain text for editing
            setContentText({
                challenge: htmlToText(data.challenge || ''),
                solution: htmlToText(data.solution || ''),
                results: htmlToText(data.results || ''),
                key_takeaway: htmlToText(data.key_takeaway || ''),
            });
        } catch (error) {
            console.error('Error fetching case study:', error);
            toast.error('Failed to load case study');
        }
    };

    // Convert HTML to plain text for editing
    const htmlToText = (html) => {
        if (!html) return '';

        return html
            .replace(/<a href="(.*?)".*?>(.*?)<\/a>/g, '[$2]($1)')
            .replace(/<h2>(.*?)<\/h2>/g, '# $1\n\n')
            .replace(/<h3>(.*?)<\/h3>/g, '## $1\n\n')
            .replace(/<\/p>/g, '\n\n')
            .replace(/<p>/g, '')
            .replace(/<li>(.*?)<\/li>/g, '- $1\n')
            .replace(/<\/?ul>/g, '\n')
            .replace(/<br\s*\/?>/g, '\n')
            .replace(/<[^>]+>/g, '')
            .trim();
    };

    // Convert plain text to HTML with basic formatting
    const textToHtml = (text) => {
        if (!text) return '';

        // Add support for [text](url) links
        let processedText = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-indigo-600 hover:underline">$1</a>');

        // Split by double line breaks for paragraphs
        const paragraphs = processedText.split('\n\n');

        return paragraphs.map(para => {
            para = para.trim();
            if (!para) return '';

            // Check if it's a heading (starts with # or ##)
            if (para.startsWith('## ')) {
                return `<h3>${para.substring(3)}</h3>`;
            } else if (para.startsWith('# ')) {
                return `<h2>${para.substring(2)}</h2>`;
            }

            // Check if it's a list (lines starting with - or *)
            if (para.includes('\n-') || para.includes('\n*') || para.startsWith('-') || para.startsWith('*')) {
                const items = para.split('\n').filter(line => line.trim());
                const listItems = items.map(item => {
                    const cleaned = item.replace(/^[-*]\s*/, '').trim();
                    return cleaned ? `<li>${cleaned}</li>` : '';
                }).filter(Boolean).join('');
                return `<ul>${listItems}</ul>`;
            }

            // Regular paragraph
            return `<p>${para}</p>`;
        }).join('');
    };

    const handleContentChange = (field, text) => {
        setContentText({
            ...contentText,
            [field]: text,
        });
        setFormData({
            ...formData,
            [field]: textToHtml(text),
        });
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const generateSlug = (title) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        setFormData({
            ...formData,
            title,
            slug: generateSlug(title),
        });
    };

    const handleTagToggle = (tag) => {
        const currentTags = formData.tags || [];
        const newTags = currentTags.includes(tag)
            ? currentTags.filter(t => t !== tag)
            : [...currentTags, tag];

        setFormData({
            ...formData,
            tags: newTags,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.challenge || !contentText.challenge.trim()) {
            toast.error('Challenge is required');
            return;
        }

        setLoading(true);

        try {
            const dataToSave = {
                title: formData.title,
                slug: formData.slug,
                excerpt: formData.excerpt,
                content_html: formData.challenge, // Use challenge as main content for backwards compatibility
                challenge: formData.challenge,
                solution: formData.solution || null,
                results: formData.results || null,
                key_takeaway: formData.key_takeaway || null,
                tags: formData.tags || [],
                is_published: formData.is_published,
                published_at: formData.published_at + 'T00:00:00Z',
            };

            const { error } = await supabase
                .from('case_studies')
                .update(dataToSave)
                .eq('id', id);

            if (error) throw error;
            toast.success('Case study updated successfully!');

            router.push('/admin/case-studies');
        } catch (error) {
            console.error('Error saving case study:', error);
            toast.error('Failed to save case study: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <AdminLayout>
                <SEO title="Edit Case Study" noindex={true} />
                <div className="max-w-4xl">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold text-slate-900">
                            Edit Case Study
                        </h1>
                        <button
                            onClick={() => router.push('/admin/case-studies')}
                            className="text-slate-600 hover:text-slate-900"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Case Study Details</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleTitleChange}
                                        required
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Slug (URL) *
                                    </label>
                                    <input
                                        type="text"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Excerpt *
                                    </label>
                                    <textarea
                                        name="excerpt"
                                        value={formData.excerpt}
                                        onChange={handleChange}
                                        required
                                        rows="3"
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Brief summary of the case study..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Tags
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {availableTags.map((tag) => (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => handleTagToggle(tag)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${(formData.tags || []).includes(tag)
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                    }`}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Published Date *
                                        </label>
                                        <input
                                            type="date"
                                            name="published_at"
                                            value={formData.published_at}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div className="flex items-center">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="is_published"
                                                checked={formData.is_published}
                                                onChange={handleChange}
                                                className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                            />
                                            <span className="text-sm font-semibold text-slate-700">
                                                Published
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Content Sections</h2>
                            <p className="text-sm text-slate-500 mb-4">
                                Use bullet points with "- " at the start of each line. Use [text](url) for links. Use blank lines between paragraphs.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Challenge * <span className="text-red-500">(Required)</span>
                                    </label>
                                    <textarea
                                        value={contentText.challenge}
                                        onChange={(e) => handleContentChange('challenge', e.target.value)}
                                        required
                                        rows="6"
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                                        placeholder="Describe the challenge or problem...&#10;&#10;Use bullet points:&#10;- First point&#10;- Second point"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        What Existed Before (Optional)
                                    </label>
                                    <textarea
                                        value={contentText.solution}
                                        onChange={(e) => handleContentChange('solution', e.target.value)}
                                        rows="6"
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                                        placeholder="Describe what existed before or previous attempts...&#10;&#10;Use bullet points:&#10;- First point&#10;- Second point"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Our Contribution (Optional)
                                    </label>
                                    <textarea
                                        value={contentText.results}
                                        onChange={(e) => handleContentChange('results', e.target.value)}
                                        rows="6"
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                                        placeholder="Describe our contribution and outcomes...&#10;&#10;Use bullet points:&#10;- First point&#10;- Second point"
                                    />
                                </div>

                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                    <label className="block text-sm font-semibold text-amber-800 mb-2">
                                        Key Takeaway (Optional) - Yellow Highlight Box
                                    </label>
                                    <textarea
                                        value={contentText.key_takeaway}
                                        onChange={(e) => handleContentChange('key_takeaway', e.target.value)}
                                        rows="4"
                                        className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-sm bg-white"
                                        placeholder="Key takeaway or important note to highlight...&#10;&#10;Use bullet points:&#10;- First point&#10;- Second point"
                                    />
                                    <p className="text-xs text-amber-600 mt-1">
                                        This will appear in a yellow highlighted box on the public page
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => router.push('/admin/case-studies')}
                                className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                <Save className="w-5 h-5" />
                                <span>{loading ? 'Saving...' : 'Update Case Study'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
};

export default CaseStudyForm;
