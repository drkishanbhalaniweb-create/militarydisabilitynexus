import React, { useState } from 'react';
import { X } from 'lucide-react';
import FormDataParser from './FormDataParser';
import DocumentViewer from './DocumentViewer';
import FilePreviewModal from './FilePreviewModal';

/**
 * ContactDetailModal Component
 * 
 * Enhanced modal for viewing contact details with tabbed interface
 * Includes Details, Documents, and Activity tabs
 * 
 * @param {Object} props
 * @param {Object} props.contact - Contact object with all details
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Callback to close the modal
 * @param {Function} props.onDelete - Callback to delete the contact
 */
const ContactDetailModal = ({ contact, isOpen, onClose, onDelete }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Don't render if not open
  if (!isOpen || !contact) return null;

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Handle backdrop click to close
   */
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  /**
   * Handle delete with confirmation
   */
  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(contact.id);
      onClose();
    } else {
      setShowDeleteConfirm(true);
    }
  };

  /**
   * Handle file click for preview
   */
  const handleFileClick = (file) => {
    setSelectedFile(file);
  };

  /**
   * Tab configuration
   */
  const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'documents', label: 'Documents' },
    { id: 'activity', label: 'Activity' }
  ];

  return (
    <>
      {/* Main Modal */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50"
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-detail-title"
      >
        <div className="bg-white rounded-lg sm:rounded-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200">
            <div className="flex-1 min-w-0 pr-2">
              <h2
                id="contact-detail-title"
                className="text-xl sm:text-2xl font-bold text-slate-900 truncate"
              >
                Contact Details
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 truncate">
                {contact.name} • {formatDate(contact.created_at)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 px-4 sm:px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Basic Contact Information */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Name</label>
                    <p className="text-slate-900 mt-1">{contact.name}</p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700">Email</label>
                    <p className="text-slate-900 mt-1">{contact.email}</p>
                  </div>

                  {contact.phone && (
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Phone</label>
                      <p className="text-slate-900 mt-1">{contact.phone}</p>
                    </div>
                  )}

                  {contact.subject && (
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Subject</label>
                      <p className="text-slate-900 mt-1">{contact.subject}</p>
                    </div>
                  )}

                  {contact.service_interest && (
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Service Interest</label>
                      <p className="text-slate-900 mt-1">{contact.service_interest}</p>
                    </div>
                  )}
                </div>

                {/* Message / Form Data */}
                {contact.message && (
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-3">
                      Message / Form Data
                    </label>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <FormDataParser 
                        data={contact.message}
                        formType={contact.form_type || null}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div>
                <DocumentViewer
                  contactId={contact.id}
                  onFileClick={handleFileClick}
                />
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Submission Timeline</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Form Submitted</p>
                        <p className="text-xs text-slate-500">{formatDate(contact.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-500 text-center py-8">
                  Additional activity tracking coming soon
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 sm:p-6 border-t border-slate-200 bg-slate-50">
            <div className="order-2 sm:order-1">
              {showDeleteConfirm && (
                <p className="text-xs sm:text-sm text-red-600 font-medium text-center sm:text-left">
                  Click Delete again to confirm
                </p>
              )}
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 order-1 sm:order-2">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-white transition-colors text-sm sm:text-base"
              >
                Close
              </button>
              <button
                onClick={handleDelete}
                className={`px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                  showDeleteConfirm
                    ? 'bg-red-700 text-white hover:bg-red-800'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {showDeleteConfirm ? 'Confirm Delete' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* File Preview Modal */}
      {selectedFile && (
        <FilePreviewModal
          file={selectedFile}
          isOpen={!!selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </>
  );
};

export default ContactDetailModal;
