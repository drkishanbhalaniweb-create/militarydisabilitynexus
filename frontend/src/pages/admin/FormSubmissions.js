import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import AdminLayout from '../../components/admin/AdminLayout';
import FormSubmissionDetailModal from '../../components/admin/FormSubmissionDetailModal';
import ErrorBoundary from '../../components/admin/ErrorBoundary';
import { TableRowSkeleton } from '../../components/admin/SkeletonLoader';
import { useDebounce } from '../../hooks/useDebounce';
import { Search, Calendar, Eye, Filter, FileText, Mail, Phone, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const FormSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [fileCounts, setFileCounts] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('form_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data);
      
      // Fetch file counts for all submissions
      if (data && data.length > 0) {
        await fetchFileCounts(data.map(s => s.id));
      }
    } catch (error) {
      console.error('Error fetching form submissions:', error);
      setError('Failed to load form submissions. Please try again.');
      toast.error('Failed to load form submissions');
    } finally {
      setLoading(false);
    }
  };

  const fetchFileCounts = async (submissionIds) => {
    try {
      const { data, error } = await supabase
        .from('file_uploads')
        .select('form_submission_id')
        .in('form_submission_id', submissionIds);

      if (error) throw error;

      // Count files per submission
      const counts = {};
      data.forEach(file => {
        counts[file.form_submission_id] = (counts[file.form_submission_id] || 0) + 1;
      });
      
      setFileCounts(counts);
    } catch (error) {
      console.error('Error fetching file counts:', error);
    }
  };

  // Debounce search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Memoize filtered submissions to avoid unnecessary recalculations
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(submission => {
      // Filter by type
      if (filterType !== 'all' && submission.form_type !== filterType) {
        return false;
      }

      // Filter by search query
      if (debouncedSearchQuery) {
        const query = debouncedSearchQuery.toLowerCase();
        return (
          submission.full_name?.toLowerCase().includes(query) ||
          submission.email?.toLowerCase().includes(query) ||
          submission.form_type?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [submissions, filterType, debouncedSearchQuery]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFormTypeLabel = (type) => {
    const labels = {
      'quick_intake': 'Quick Intake',
      'aid_attendance': 'Aid & Attendance',
      'unsure': 'Unsure',
      'general': 'General'
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status) => {
    const styles = {
      'new': 'bg-navy-100 text-navy-800',
      'contacted': 'bg-yellow-100 text-yellow-800',
      'in_progress': 'bg-purple-100 text-purple-800',
      'completed': 'bg-green-100 text-green-800',
      'closed': 'bg-slate-100 text-slate-800'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.new}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <AdminLayout>
      <ErrorBoundary errorMessage="Failed to load form submissions page">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Form Submissions</h1>
              <p className="text-slate-600 mt-2">Manage all form submissions</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <label htmlFor="submission-search" className="sr-only">Search form submissions</label>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" aria-hidden="true" />
                <input
                  id="submission-search"
                  type="text"
                  placeholder="Search by name, email, or form type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Search form submissions by name, email, or form type"
                />
              </div>

              {/* Filter */}
              <div className="relative">
                <label htmlFor="form-type-filter" className="sr-only">Filter by form type</label>
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" aria-hidden="true" />
                <select
                  id="form-type-filter"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
                  aria-label="Filter form submissions by type"
                >
                  <option value="all">All Forms</option>
                  <option value="quick_intake">Quick Intake</option>
                  <option value="aid_attendance">Aid & Attendance</option>
                  <option value="unsure">Unsure</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-red-200">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Failed to Load Submissions</h3>
              <p className="text-slate-600 mb-6">{error}</p>
              <button
                onClick={fetchSubmissions}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Submissions List */}
          {!error && (loading || filteredSubmissions.length > 0) ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Form Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Files</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {loading ? (
                      <TableRowSkeleton columns={7} rows={5} />
                    ) : (
                      filteredSubmissions.map((submission) => {
                        const fileCount = fileCounts[submission.id] || 0;
                        return (
                          <tr key={submission.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-slate-900">{submission.full_name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-slate-900 flex items-center space-x-1">
                                <Mail className="w-4 h-4 text-slate-400" />
                                <span>{submission.email}</span>
                              </div>
                              {submission.phone && (
                                <div className="text-sm text-slate-500 flex items-center space-x-1 mt-1">
                                  <Phone className="w-4 h-4 text-slate-400" />
                                  <span>{submission.phone}</span>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-slate-900">{getFormTypeLabel(submission.form_type)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(submission.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {fileCount > 0 ? (
                                <div className="flex items-center space-x-2">
                                  <FileText className="w-4 h-4 text-indigo-600" />
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                    {fileCount} {fileCount === 1 ? 'file' : 'files'}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-slate-400">No files</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-slate-500 flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(submission.created_at)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => setSelectedSubmission(submission)}
                                className="text-indigo-600 hover:text-teal-900"
                                aria-label={`View details for ${submission.full_name}`}
                                title="View submission details"
                              >
                                <Eye className="w-5 h-5" aria-hidden="true" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : !error && filteredSubmissions.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-slate-200">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No form submissions found</p>
              {searchQuery && (
                <p className="text-slate-500 text-sm mt-2">Try adjusting your search or filter</p>
              )}
            </div>
          )}

          {/* Form Submission Detail Modal */}
          <FormSubmissionDetailModal
            submission={selectedSubmission}
            isOpen={!!selectedSubmission}
            onClose={() => setSelectedSubmission(null)}
          />
        </div>
      </ErrorBoundary>
    </AdminLayout>
  );
};

export default FormSubmissions;
