import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../src/lib/supabase';
import AdminLayout from '../../../src/components/admin/AdminLayout';
import ImageUpload from '../../../src/components/admin/ImageUpload';
import ProtectedRoute from '../../../src/components/admin/ProtectedRoute';
import SEO from '../../../src/components/SEO';
import { Save, X, Eye } from 'lucide-react';
import { toast } from 'sonner';
import RichTextEditor from '../../../src/components/admin/RichTextEditor';
import BlogPreviewModal from '../../../src/components/admin/BlogPreviewModal';
import RelatedPostPicker from '../../../src/components/admin/RelatedPostPicker';
import ClinicalProfilePicker from '../../../src/components/admin/ClinicalProfilePicker';

const BlogForm = () => {
    const router = useRouter();
    const { id } = router.query;
    const isEdit = false;

    const [loading, setLoading] = useState(false);
    const [useAdvancedEditor, setUseAdvancedEditor] = useState(true);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content_html: '',
        category: 'nexus-letters',
        tags: [],
        author_name: 'Editorial Team',
        read_time: '5 min read',
        is_published: false,
        published_at: new Date().toISOString().split('T')[0],
        featured_image: '',
        featured_image_path: '',
        related_post_ids: [],
        author_profile_id: null,
        reviewer_profile_id: null,
        seo_title: '',
        seo_keywords: '',
        seo_description: '',
        featured_image_alt: '',
    });

    const [tagInput, setTagInput] = useState('');
    const [contentText, setContentText] = useState('');

    // Escape HTML special characters to prevent XSS
    const escapeHtml = (str) => {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    // Convert plain text to HTML with basic formatting
    const textToHtml = (text) => {
        if (!text) return '';

        // Store links with placeholders to protect them from escaping
        const links = [];
        let processedText = text.replace(/\[([^\]]+)\]\s*\(([^)]+)\)/g, (match, linkText, url) => {
            const trimmedUrl = url.trim();
            // Validate URL: only allow http, https, mailto, tel, and relative paths (excluding protocol-relative //)
            if (/^(https?:\/\/|mailto:|tel:|\/(?!\/))/i.test(trimmedUrl)) {
                const placeholder = `__LINK_${links.length}__`;
                links.push(`<a href="${escapeHtml(trimmedUrl)}">${escapeHtml(linkText)}</a>`);
                return placeholder;
            }
            return match;
        });

        // Split by double line breaks for paragraphs
        const paragraphs = processedText.split('\n\n');

        let html = paragraphs.map(para => {
            para = para.trim();
            if (!para) return '';

            // Check if it's a heading (starts with # or ##)
            if (para.startsWith('## ')) {
                return `<h3>${escapeHtml(para.substring(3))}</h3>`;
            } else if (para.startsWith('# ')) {
                return `<h2>${escapeHtml(para.substring(2))}</h2>`;
            }

            // Check if it's a list (lines starting with - or *)
            if (para.includes('\n-') || para.includes('\n*') || para.startsWith('-') || para.startsWith('*')) {
                const items = para.split('\n').filter(line => line.trim());
                const listItems = items.map(item => {
                    const cleaned = item.replace(/^[-*]\s*/, '').trim();
                    return cleaned ? `<li>${escapeHtml(cleaned)}</li>` : '';
                }).filter(Boolean).join('');
                return `<ul>${listItems}</ul>`;
            }

            // Regular paragraph
            return `<p>${escapeHtml(para)}</p>`;
        }).join('');

        // Restore links
        links.forEach((link, i) => {
            html = html.replace(`__LINK_${i}__`, link);
        });

        return html;
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
                        <div className="flex items-center space-x-3">
                            <button
                                type="button"
                                onClick={() => setIsPreviewOpen(true)}
                                className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 flex items-center space-x-2 transition-colors border border-slate-200"
                            >
                                <Eye className="w-5 h-5" />
                                <span>Preview Page</span>
                            </button>
                            <button
                                onClick={() => router.push('/admin/blog')}
                                className="text-slate-600 hover:text-slate-900 p-2"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
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
                                    altValue={formData.featured_image_alt}
                                    onAltChange={(val) => setFormData({ ...formData, featured_image_alt: val })}
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
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-semibold text-slate-700">
                                            Content *
                                        </label>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="editorToggle"
                                                checked={useAdvancedEditor}
                                                onChange={(e) => setUseAdvancedEditor(e.target.checked)}
                                                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                            />
                                            <label htmlFor="editorToggle" className="ml-2 text-sm font-medium text-slate-600">
                                                Use Advanced Editor (TipTap)
                                            </label>
                                        </div>
                                    </div>

                                    {!useAdvancedEditor && (
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
                                    )}

                                    {useAdvancedEditor ? (
                                        <RichTextEditor
                                            value={formData.content_html}
                                            onChange={(html) => setFormData({ ...formData, content_html: html })}
                                        />
                                    ) : (
                                        <>
                                            <textarea
                                                value={contentText}
                                                onChange={handleContentChange}
                                                required={!formData.content_html}
                                                rows="16"
                                                placeholder="# Main Heading&#10;&#10;Write your content here. Leave blank lines between paragraphs.&#10;&#10;## Subheading&#10;&#10;More content here.&#10;&#10;- Bullet point 1&#10;- Bullet point 2&#10;- Bullet point 3"
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                            <p className="text-xs text-slate-500 mt-2">
                                                Write naturally - formatting will be applied automatically
                                            </p>
                                        </>
                                    )}
                                </div>

                                {/* Preview */}
                                {(!useAdvancedEditor && contentText) && (
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

                                <div className="grid grid-cols-1 gap-4">
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

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                                    <ClinicalProfilePicker
                                        label="Clinical Author Profile"
                                        value={formData.author_profile_id}
                                        onChange={(id) => setFormData({ ...formData, author_profile_id: id })}
                                        helpText="Overrides author display with a rich clinical profile card."
                                    />
                                    <ClinicalProfilePicker
                                        label="Medical Reviewer Profile"
                                        value={formData.reviewer_profile_id}
                                        onChange={(id) => setFormData({ ...formData, reviewer_profile_id: id })}
                                        helpText="Adds a 'Reviewed for Clinical Accuracy' trust signal."
                                    />
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

                                {/* SEO Settings */}
                                <div className="pt-4 mt-6 border-t border-slate-100">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4">SEO Settings</h3>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                SEO Title (Tab Title)
                                            </label>
                                            <input
                                                type="text"
                                                name="seo_title"
                                                value={formData.seo_title || ''}
                                                onChange={handleChange}
                                                placeholder="Custom browser tab title"
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                            <p className="text-xs text-slate-500 mt-1">If left blank, the standard Title will be used. This does not change the on-page H1.</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                SEO Keywords
                                            </label>
                                            <input
                                                type="text"
                                                name="seo_keywords"
                                                value={formData.seo_keywords || ''}
                                                onChange={handleChange}
                                                placeholder="Custom keywords separated by commas (e.g., veteran benefits 2026, free VA claim calculator)"
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                            <p className="text-xs text-slate-500 mt-1">If left blank, keywords will be automatically generated from the Category and Tags.</p>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="block text-sm font-semibold text-slate-700">
                                                    SEO Description
                                                </label>
                                                <span className={`text-xs font-medium ${(formData.seo_description?.length || 0) > 160 ? 'text-red-500' : (formData.seo_description?.length || 0) >= 150 ? 'text-green-600' : 'text-slate-500'}`}>
                                                    {formData.seo_description?.length || 0} / 160 chars
                                                </span>
                                            </div>
                                            <textarea
                                                name="seo_description"
                                                value={formData.seo_description || ''}
                                                onChange={handleChange}
                                                rows="2"
                                                placeholder="Custom SEO meta description"
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                            <p className="text-xs text-slate-500 mt-1">Best practice is 150-160 characters. If left blank, the post's Excerpt will be used.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 mt-6 border-t border-slate-100">
                                    <RelatedPostPicker 
                                        selectedIds={formData.related_post_ids}
                                        onChange={(ids) => setFormData({ ...formData, related_post_ids: ids })}
                                    />
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
                
                <BlogPreviewModal 
                    isOpen={isPreviewOpen} 
                    onClose={() => setIsPreviewOpen(false)} 
                    post={formData} 
                />
            </AdminLayout>
        </ProtectedRoute>
    );
};

export default BlogForm;
