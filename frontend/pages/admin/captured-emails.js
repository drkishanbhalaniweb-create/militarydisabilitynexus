import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../src/lib/supabase';
import AdminLayout from '../../src/components/admin/AdminLayout';
import ProtectedRoute from '../../src/components/admin/ProtectedRoute';
import ErrorBoundary from '../../src/components/admin/ErrorBoundary';
import { TableRowSkeleton } from '../../src/components/admin/SkeletonLoader';
import { useDebounce } from '../../src/hooks/useDebounce';
import SEO from '../../src/components/SEO';
import { AlertCircle, Calendar, ExternalLink, Mail, Phone, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_STYLES = {
  sent: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800',
};

const CapturedEmails = () => {
  const [captures, setCaptures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCaptures();
  }, []);

  const fetchCaptures = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('lead_magnet_captures')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setCaptures(data || []);
    } catch (fetchError) {
      console.error('Error fetching captured emails:', fetchError);
      setError('Failed to load captured emails. Please try again.');
      toast.error('Failed to load captured emails');
    } finally {
      setLoading(false);
    }
  };

  const deleteCapture = async (id) => {
    if (!window.confirm('Delete this captured email record?')) return;

    try {
      const { error: deleteError } = await supabase
        .from('lead_magnet_captures')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setCaptures((current) => current.filter((capture) => capture.id !== id));
      toast.success('Captured email deleted');
    } catch (deleteError) {
      console.error('Error deleting captured email:', deleteError);
      toast.error('Failed to delete captured email');
    }
  };

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const filteredCaptures = useMemo(() => {
    if (!debouncedSearchQuery) return captures;

    const query = debouncedSearchQuery.toLowerCase();
    return captures.filter((capture) => (
      capture.email?.toLowerCase().includes(query) ||
      capture.phone?.toLowerCase().includes(query) ||
      capture.lead_magnet_title?.toLowerCase().includes(query) ||
      capture.source_path?.toLowerCase().includes(query)
    ));
  }, [captures, debouncedSearchQuery]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <SEO title="Captured Emails" noindex={true} />
        <ErrorBoundary errorMessage="Failed to load captured emails page">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Captured Emails</h1>
                <p className="text-slate-600 mt-2">Lead magnet PDF download requests from blog posts</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by email, phone, template title, or page path..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 text-slate-900 bg-white"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-red-800 font-medium">{error}</p>
                <button
                  onClick={fetchCaptures}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            )}

            {!error && (loading || filteredCaptures.length > 0) ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Template</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Source</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Captured</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {loading ? (
                        <TableRowSkeleton columns={7} rows={5} />
                      ) : (
                        filteredCaptures.map((capture) => (
                          <tr key={capture.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <a
                                href={`mailto:${capture.email}`}
                                className="text-sm font-medium text-slate-900 hover:text-indigo-700 inline-flex items-center gap-2"
                              >
                                <Mail className="w-4 h-4 text-slate-400" />
                                {capture.email}
                              </a>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {capture.phone ? (
                                <a
                                  href={`tel:${capture.phone}`}
                                  className="text-sm font-medium text-slate-900 hover:text-indigo-700 inline-flex items-center gap-2"
                                >
                                  <Phone className="w-4 h-4 text-slate-400" />
                                  {capture.phone}
                                </a>
                              ) : (
                                <span className="text-sm text-slate-400">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-slate-900">{capture.lead_magnet_title}</div>
                              {capture.pdf_file_name && (
                                <div className="text-xs text-slate-500 mt-1">{capture.pdf_file_name}</div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {capture.source_path ? (
                                <a
                                  href={capture.source_path}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sm text-indigo-700 hover:text-indigo-900"
                                >
                                  {capture.source_path}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                <span className="text-sm text-slate-400">Unknown</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[capture.email_status] || STATUS_STYLES.pending}`}>
                                {capture.email_status}
                              </span>
                              {capture.email_error && (
                                <p className="text-xs text-red-600 mt-1 max-w-xs truncate" title={capture.email_error}>
                                  {capture.email_error}
                                </p>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-slate-500 flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(capture.created_at)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => deleteCapture(capture.id)}
                                className="text-red-600 hover:text-red-900"
                                aria-label={`Delete captured email ${capture.email}`}
                                title="Delete captured email"
                              >
                                <Trash2 className="w-5 h-5" aria-hidden="true" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : !error && filteredCaptures.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-slate-200">
                <Mail className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No captured emails found</p>
                {searchQuery && (
                  <p className="text-slate-500 text-sm mt-2">Try adjusting your search</p>
                )}
              </div>
            )}
          </div>
        </ErrorBoundary>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default CapturedEmails;
