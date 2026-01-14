import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../src/lib/supabase';
import AdminLayout from '../../../src/components/admin/AdminLayout';
import ImageUpload from '../../../src/components/admin/ImageUpload';
import ProtectedRoute from '../../../src/components/admin/ProtectedRoute';
import SEO from '../../../src/components/SEO';
import { Save, X } from 'lucide-react';
import { toast } from 'sonner';

const BlogForm = () => {
    const router = useRouter();
    const { id } = router.query;
    const isEdit = false;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content_html: '',
        category: 'nexus-letters',
        tags: [],
        author_name: 'Military Disability Nexus',
        read_time: '5 min read',
        is_published: false,
        published_at: new Date().toISOString().split('T')[0],
        featured_image: '',
        featured_image_path: '',
    });

    const [tagInput, setTagInput] = useState('');
    const [contentText, setContentText] = useState('');

    // Convert plain text to HTML with basic formatting
    const textToHtml = (text) => {
        if (!text) return '';

        // Add support for [text](url) links
        let processedText = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

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

    const handleContentChange = (e) => {
        const text = e.target.value;
        setContentText(text);
        setFormData({
            ...formData,
            content_html: textToHtml(text),
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

    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData({
                ...formData,
                tags: [...formData.tags, tagInput.trim()],
            });
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(tag => tag !== tagToRemove),
        });
    };

    // Handle featured image upload
    const handleFeaturedImageUpload = (url, path) => {
        setFormData({
            ...formData,
            featured_image: url || '',
            featured_image_path: path || '',
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const dataToSave = {
                ...formData,
                published_at: formData.published_at + 'T00:00:00Z',
            };

            const { error } = await supabase
                .from('blog_posts')
                .insert([dataToSave]);

            if (error) throw error;
            toast.success('Post created successfully!');

            router.push('/admin/blog');
        } catch (error) {
            console.error('Error saving post:', error);
            toast.error('Failed to save post: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <AdminLayout>
                <SEO title="New Blog Post" noindex={true} />
                <div className="max-w-4xl">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold text-slate-900">
                            New Blog Post
                        </h1>
                        <button
                            onClick={() => router.push('/admin/blog')}
                            className="text-slate-600 hover:text-slate-900"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Post Details</h2>

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

                                {/* Featured Image Upload */}
                                <ImageUpload
                                    onUploadComplete={handleFeaturedImageUpload}
                                    existingImage={formData.featured_image}
                                    existingPath={formData.featured_image_path}
                                    folder="featured"
                                    label="Featured Image"
                                />

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Excerpt *
                                    </label>
                                    <textarea
                                        name="excerpt"
                                        value={formData.excerpt}
                                        onChange={handleChange}
                                        required
                                        rows="2"
                                        placeholder="Brief summary of the post"
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Content *
                                    </label>
                                    <div className="mb-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600">
                                        <p className="font-semibold mb-2">Formatting Guide:</p>
                                        <ul className="space-y-1 text-xs">
                                            <li>• <strong># Heading</strong> - Creates a main heading</li>
                                            <li>• <strong>## Subheading</strong> - Creates a subheading</li>
                                            <li>• <strong>- Item</strong> - Creates a bullet point</li>
                                            <li>• <strong>[Link Text](URL)</strong> - Inserts a link (Internal or External)</li>
                                            <li>• Leave blank lines between paragraphs</li>
                                        </ul>
                                    </div>
                                    <textarea
                                        value={contentText}
                                        onChange={handleContentChange}
                                        required
                                        rows="16"
                                        placeholder="# Main Heading&#10;&#10;Write your content here. Leave blank lines between paragraphs.&#10;&#10;## Subheading&#10;&#10;More content here.&#10;&#10;- Bullet point 1&#10;- Bullet point 2&#10;- Bullet point 3"
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <p className="text-xs text-slate-500 mt-2">
                                        Write naturally - formatting will be applied automatically
                                    </p>
                                </div>

                                {/* Preview */}
                                {contentText && (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Preview
                                        </label>
                                        <div
                                            className="p-4 border border-slate-300 rounded-lg bg-slate-50 prose prose-slate max-w-none"
                                            dangerouslySetInnerHTML={{ __html: formData.content_html }}
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Category *
                                        </label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="nexus-letters">Nexus Letters</option>
                                            <option value="exam-prep">Exam Prep</option>
                                            <option value="aid-attendance">Aid & Attendance</option>
                                            <option value="1151-claims">1151 Claims</option>
                                            <option value="general">General</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Read Time
                                        </label>
                                        <input
                                            type="text"
                                            name="read_time"
                                            value={formData.read_time}
                                            onChange={handleChange}
                                            placeholder="5 min read"
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Author Name
                                        </label>
                                        <input
                                            type="text"
                                            name="author_name"
                                            value={formData.author_name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Publish Date
                                        </label>
                                        <input
                                            type="date"
                                            name="published_at"
                                            value={formData.published_at}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Tags
                                    </label>
                                    <div className="flex items-center space-x-2 mb-2">
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                            placeholder="Add a tag"
                                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={addTag}
                                            className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm flex items-center space-x-2"
                                            >
                                                <span>{tag}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeTag(tag)}
                                                    className="text-indigo-600 hover:text-indigo-800"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="is_published"
                                        checked={formData.is_published}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                    />
                                    <label className="ml-2 text-sm font-semibold text-slate-700">
                                        Published (visible on website)
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => router.push('/admin/blog')}
                                className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-2"
                            >
                                <Save className="w-5 h-5" />
                                <span>{loading ? 'Saving...' : 'Create Post'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
};

export default BlogForm;
