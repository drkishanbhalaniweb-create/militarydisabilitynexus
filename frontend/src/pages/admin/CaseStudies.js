import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import AdminLayout from '../../components/admin/AdminLayout';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const CaseStudies = () => {
  const [caseStudies, setCaseStudies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCaseStudies();
  }, []);

  const fetchCaseStudies = async () => {
    try {
      const { data, error } = await supabase
        .from('case_studies')
        .select('*')
        .order('published_at', { ascending: false });

      if (error) throw error;
      setCaseStudies(data);
    } catch (error) {
      console.error('Error fetching case studies:', error);
      toast.error('Failed to load case studies');
    } finally {
      setLoading(false);
    }
  };

  const togglePublished = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('case_studies')
        .update({ is_published: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setCaseStudies(caseStudies.map(cs => 
        cs.id === id ? { ...cs, is_published: !currentStatus } : cs
      ));
      toast.success('Case study updated');
    } catch (error) {
      console.error('Error updating case study:', error);
      toast.error('Failed to update case study');
    }
  };

  const deleteCaseStudy = async (id, featuredImage) => {
    if (!window.confirm('Are you sure you want to delete this case study? This action cannot be undone.')) {
      return;
    }

    try {
      // Delete featured image from storage if it exists
      if (featuredImage) {
        try {
          // Extract the path from the URL
          const urlParts = featuredImage.split('/');
          const bucketIndex = urlParts.findIndex(part => part === 'case-study-images');
          if (bucketIndex !== -1) {
            const storagePath = urlParts.slice(bucketIndex + 1).join('/');
            await supabase.storage
              .from('case-study-images')
              .remove([storagePath]);
          }
        } catch (storageError) {
          console.error('Error deleting image:', storageError);
          // Continue with case study deletion even if image deletion fails
        }
      }

      // Delete case study from database
      const { error } = await supabase
        .from('case_studies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCaseStudies(caseStudies.filter(cs => cs.id !== id));
      toast.success('Case study deleted successfully');
    } catch (error) {
      console.error('Error deleting case study:', error);
      toast.error('Failed to delete case study');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Case Studies</h1>
            <p className="text-slate-600 mt-2">Manage your case studies and success stories</p>
          </div>
          <a
            href="/admin/case-studies/new"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>New Case Study</span>
          </a>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Published
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {caseStudies.map((caseStudy) => (
                    <tr key={caseStudy.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900">{caseStudy.title}</div>
                        <div className="text-sm text-slate-500">{caseStudy.excerpt?.substring(0, 60)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-700">
                          {caseStudy.client_name || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          caseStudy.is_published 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {caseStudy.is_published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {formatDate(caseStudy.published_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {caseStudy.views || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => togglePublished(caseStudy.id, caseStudy.is_published)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          {caseStudy.is_published ? 'Unpublish' : 'Publish'}
                        </button>
                        <a
                          href={`/admin/case-studies/edit/${caseStudy.id}`}
                          className="text-navy-600 hover:text-navy-900 mr-3"
                        >
                          <Edit className="w-4 h-4 inline" />
                        </a>
                        <button
                          onClick={() => deleteCaseStudy(caseStudy.id, caseStudy.featured_image)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-navy-50 border border-navy-200 rounded-lg p-4">
          <p className="text-sm text-navy-800">
            💡 <strong>Tip:</strong> Case studies showcase your success stories and help build trust with potential clients.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CaseStudies;
