import React, { useState, useEffect } from 'react';
import { fileUploadApi } from '../../lib/api';
import { 
  getFileIcon, 
  formatFileSize, 
  getFileTypeLabel 
} from '../../lib/fileTypeDetection';
import { 
  File, 
  FileText, 
  Image as ImageIcon, 
  Archive, 
  Download, 
  Eye, 
  AlertCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import { FileListSkeleton } from './SkeletonLoader';

/**
 * DocumentViewer Component
 * Displays a list of uploaded documents with metadata and preview capability
 * 
 * @param {object} props
 * @param {string} props.contactId - Contact ID to fetch files for (optional)
 * @param {string} props.formSubmissionId - Form submission ID to fetch files for (optional)
 * @param {function} props.onFileClick - Callback when file is clicked for preview
 * @param {string} props.className - Additional CSS classes
 */
const DocumentViewer = React.memo(({ 
  contactId = null, 
  formSubmissionId = null, 
  onFileClick = null,
  className = '' 
}) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFiles();
  }, [contactId, formSubmissionId]);

  /**
   * Fetch files from the API
   */
  const fetchFiles = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch files based on contactId or formSubmissionId
      const data = await fileUploadApi.getAll(contactId, formSubmissionId);
      
      setFiles(data);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError('Failed to load documents');
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle file download
   */
  const handleDownload = async (file, e) => {
    e.stopPropagation();
    
    try {
      const signedUrl = await fileUploadApi.getDownloadUrl(file.storage_path, file.original_filename);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = signedUrl;
      link.download = file.original_filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Download started');
    } catch (err) {
      console.error('Error downloading file:', err);
      toast.error('Failed to download file');
    }
  };

  /**
   * Get icon component based on file type
   */
  const getIconComponent = (mimeType) => {
    const iconName = getFileIcon(mimeType);
    
    switch (iconName) {
      case 'Image':
        return ImageIcon;
      case 'FileText':
        return FileText;
      case 'Archive':
        return Archive;
      default:
        return File;
    }
  };

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

  // Loading state
  if (loading) {
    return (
      <div className={className}>
        <FileListSkeleton count={3} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Failed to Load Documents</h3>
        <p className="text-slate-600 mb-6">{error}</p>
        <button
          onClick={fetchFiles}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Empty state
  if (files.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <File className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 text-sm">No documents uploaded</p>
      </div>
    );
  }

  // Files list
  return (
    <div className={`space-y-3 ${className}`}>
      {files.map((file) => {
        const IconComponent = getIconComponent(file.mime_type);
        const fileTypeLabel = getFileTypeLabel(file.mime_type, file.original_filename);
        const formattedSize = formatFileSize(file.file_size);
        const formattedDate = formatDate(file.created_at);

        return (
          <div
            key={file.id}
            className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            {/* File Info */}
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              {/* Icon */}
              <div className="flex-shrink-0">
                <IconComponent className="w-8 h-8 text-indigo-600" />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-slate-900 truncate">
                  {file.original_filename}
                </h4>
                <div className="flex items-center space-x-3 mt-1 text-xs text-slate-500">
                  <span>{fileTypeLabel}</span>
                  <span>•</span>
                  <span>{formattedSize}</span>
                  <span>•</span>
                  <span>{formattedDate}</span>
                </div>
                {file.file_category && file.file_category !== 'other' && (
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                      {file.file_category.replace('_', ' ')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 ml-4">
              {/* Preview Button */}
              {onFileClick && (
                <button
                  onClick={() => onFileClick(file)}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Preview file"
                  aria-label={`Preview ${file.original_filename}`}
                >
                  <Eye className="w-5 h-5" aria-hidden="true" />
                </button>
              )}

              {/* Download Button */}
              <button
                onClick={(e) => handleDownload(file, e)}
                className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                title="Download file"
                aria-label={`Download ${file.original_filename}`}
              >
                <Download className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
});

DocumentViewer.displayName = 'DocumentViewer';

export default DocumentViewer;
