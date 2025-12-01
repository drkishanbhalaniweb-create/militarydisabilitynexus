import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { caseStudyApi, generateSlug } from '../../lib/api';
import AdminLayout from '../../components/admin/AdminLayout';
import { Save, X } from 'lucide-react';
import { toast } from 'sonner';

const CaseStudyForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    client_name: '',
    excerpt: '',
    content_html: '',
    challenge: '',
    solution: '',
    results: '',
    is_published: false,
    published_at: new Date().toISOString().split('T')[0],
    tags: [],
  });

  const availableTags = [
    'SMC/Aid & Attendance',
    'Primary Service Connection',
    'Secondary Service Connection',
    'Mental Health Claim',
    '1151 Claim'
  ];

  const [contentText, setContentText] = useState({
    content: '',
    challenge: '',
    solution: '',
    results: '',
  });

  useEffect(() => {
    if (isEdit) {
      fetchCaseStudy();
    }
  }, [id]);

  const fetchCaseStudy = async () => {
    try {
      const data = await caseStudyApi.getById(id);
      setFormData({
        ...data,
        published_at: data.published_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      });
      // Convert HTML back to plain text for editing
      setContentText({
        content: htmlToText(data.content_html),
        challenge: htmlToText(data.challenge || ''),
        solution: htmlToText(data.solution || ''),
        results: htmlToText(data.results || ''),
      });
    } catch (error) {
      console.error('Error fetching case study:', error);
      toast.error('Failed to load case study');
    }
  };

  // Convert plain text to HTML with basic formatting
  const textToHtml = (text) => {
    if (!text) return '';
    
    // Split by double line breaks for paragraphs
    const paragraphs = text.split('\n\n');
    
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

  // Convert HTML to plain text for editing
  const htmlToText = (html) => {
    if (!html) return '';
    
    return html
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

  const handleContentChange = (field, text) => {
    setContentText({
      ...contentText,
      [field]: text,
    });
    setFormData({
      ...formData,
      [field === 'content' ? 'content_html' : field]: textToHtml(text),
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
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
    setLoading(true);

    try {
      const dataToSave = {
        title: formData.title,
        slug: formData.slug,
        client_name: formData.client_name || null,
        excerpt: formData.excerpt,
        content_html: formData.content_html,
        challenge: formData.challenge || null,
        solution: formData.solution || null,
        results: formData.results || null,
        tags: formData.tags || [],
        is_published: formData.is_published,
        published_at: formData.published_at + 'T00:00:00Z',
      };

      if (isEdit) {
        await caseStudyApi.update(id, dataToSave);
        toast.success('Case study updated successfully!');
      } else {
        await caseStudyApi.create(dataToSave);
        toast.success('Case study created successfully!');
      }

      navigate('/admin/case-studies');
    } catch (error) {
      console.error('Error saving case study:', error);
      toast.error('Failed to save case study: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-slate-900">
            {isEdit ? 'Edit Case Study' : 'New Case Study'}
          </h1>
          <button
            onClick={() => navigate('/admin/case-studies')}
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
                  Client Name (Optional)
                </label>
                <input
                  type="text"
                  name="client_name"
                  value={formData.client_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Veteran John D."
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
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        (formData.tags || []).includes(tag)
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
            <h2 className="text-xl font-bold text-slate-900 mb-4">Content</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Main Content *
                </label>
                <textarea
                  value={contentText.content}
                  onChange={(e) => handleContentChange('content', e.target.value)}
                  required
                  rows="10"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                  placeholder="Write your content here. Use # for headings, - for lists, and double line breaks for paragraphs."
                />
                <p className="text-xs text-slate-500 mt-1">
                  Formatting: # Heading, ## Subheading, - List item, blank line for new paragraph
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  The Challenge (Optional)
                </label>
                <textarea
                  value={contentText.challenge}
                  onChange={(e) => handleContentChange('challenge', e.target.value)}
                  rows="6"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                  placeholder="Describe the challenge or problem..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Our Solution (Optional)
                </label>
                <textarea
                  value={contentText.solution}
                  onChange={(e) => handleContentChange('solution', e.target.value)}
                  rows="6"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                  placeholder="Describe the solution provided..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  The Results (Optional)
                </label>
                <textarea
                  value={contentText.results}
                  onChange={(e) => handleContentChange('results', e.target.value)}
                  rows="6"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                  placeholder="Describe the outcomes and results..."
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/case-studies')}
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
              <span>{loading ? 'Saving...' : 'Save Case Study'}</span>
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default CaseStudyForm;
