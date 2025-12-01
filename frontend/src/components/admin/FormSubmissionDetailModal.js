import { useState } from 'react';
import { X } from 'lucide-react';
import FormDataParser from './FormDataParser';
import DocumentViewer from './DocumentViewer';
import FilePreviewModal from './FilePreviewModal';

const FormSubmissionDetailModal = ({ submission, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [previewFile, setPreviewFile] = useState(null);

  if (!isOpen || !submission) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{submission.full_name}</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm text-slate-600">{getFormTypeLabel(submission.form_type)}</span>
                <span className="text-slate-300">•</span>
                {getStatusBadge(submission.status)}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 px-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'documents'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Documents
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'activity'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Activity
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Email</p>
                      <p className="text-sm text-slate-900">{submission.email}</p>
                    </div>
                    {submission.phone && (
                      <div>
                        <p className="text-xs text-slate-500">Phone</p>
                        <p className="text-sm text-slate-900">{submission.phone}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-slate-500">Submitted</p>
                      <p className="text-sm text-slate-900">{formatDate(submission.created_at)}</p>
                    </div>
                    {submission.completed_at && (
                      <div>
                        <p className="text-xs text-slate-500">Completed</p>
                        <p className="text-sm text-slate-900">{formatDate(submission.completed_at)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Data */}
                {submission.form_data && Object.keys(submission.form_data).length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">Form Details</h3>
                    <FormDataParser 
                      data={submission.form_data} 
                      formType={submission.form_type}
                    />
                  </div>
                )}

                {/* Admin Notes */}
                {submission.notes && (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Admin Notes</h3>
                    <p className="text-sm text-slate-900 whitespace-pre-wrap">{submission.notes}</p>
                  </div>
                )}

                {/* Assigned To */}
                {submission.assigned_to && (
                  <div className="bg-navy-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Assigned To</h3>
                    <p className="text-sm text-slate-900">{submission.assigned_to}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'documents' && (
              <DocumentViewer
                formSubmissionId={submission.id}
                onFileClick={(file) => setPreviewFile(file)}
              />
            )}

            {activeTab === 'activity' && (
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 mt-2 bg-indigo-600 rounded-full" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Form Submitted</p>
                    <p className="text-xs text-slate-500">{formatDate(submission.created_at)}</p>
                  </div>
                </div>
                {submission.updated_at !== submission.created_at && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 mt-2 bg-navy-600 rounded-full" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Last Updated</p>
                      <p className="text-xs text-slate-500">{formatDate(submission.updated_at)}</p>
                    </div>
                  </div>
                )}
                {submission.completed_at && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 mt-2 bg-green-600 rounded-full" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Completed</p>
                      <p className="text-xs text-slate-500">{formatDate(submission.completed_at)}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* File Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </>
  );
};

export default FormSubmissionDetailModal;
