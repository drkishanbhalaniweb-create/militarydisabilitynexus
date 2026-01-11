import { useState, useEffect, useCallback } from 'react';
import { X, Download, Loader2, AlertCircle } from 'lucide-react';
import { fileUploadApi } from '../../lib/api';
import { canPreview, getPreviewType, getFileTypeLabel } from '../../lib/fileTypeDetection';

/**
 * FilePreviewModal Component
 * 
 * Displays a modal for previewing uploaded files (PDFs and images)
 * with download capability and proper error handling.
 * 
 * @param {Object} props
 * @param {Object} props.file - File object with storage_path, original_filename, mime_type
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Callback to close the modal
 */
const FilePreviewModal = ({ file, isOpen, onClose }) => {
  const [signedUrl, setSignedUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Generate signed URL when modal opens
  useEffect(() => {
    if (!isOpen || !file) {
      setSignedUrl(null);
      setLoading(true);
      setError(null);
      return;
    }

    const generateSignedUrl = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = await fileUploadApi.getDownloadUrl(file.storage_path);
        setSignedUrl(url);
      } catch (err) {
        console.error('Error generating signed URL:', err);
        setError('Failed to load file. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    generateSignedUrl();
  }, [isOpen, file]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle click outside to close
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Handle download
  const handleDownload = useCallback(() => {
    if (!signedUrl || typeof document === 'undefined') return;

    const link = document.createElement('a');
    link.href = signedUrl;
    link.download = file.original_filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [signedUrl, file]);

  if (!isOpen) return null;

  const previewType = getPreviewType(file.mime_type);
  const fileTypeLabel = getFileTypeLabel(file.mime_type, file.original_filename);
  const canShowPreview = canPreview(file.mime_type);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="file-preview-title"
    >
      <div className="bg-white rounded-lg sm:rounded-xl max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-200">
          <div className="flex-1 min-w-0">
            <h2
              id="file-preview-title"
              className="text-base sm:text-lg font-semibold text-slate-900 truncate"
              title={file.original_filename}
            >
              {file.original_filename}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">{fileTypeLabel}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-2 sm:ml-4 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
            aria-label="Close preview"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-3 sm:p-6 bg-slate-50">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
              <p className="text-slate-600 mt-4">Loading preview...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <p className="text-slate-900 font-medium mt-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && signedUrl && (
            <>
              {previewType === 'pdf' && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden h-full min-h-[400px] sm:min-h-[600px]">
                  <iframe
                    src={signedUrl}
                    className="w-full h-full min-h-[400px] sm:min-h-[600px]"
                    title={`PDF preview of ${file.original_filename}`}
                    aria-label="PDF document preview"
                  />
                </div>
              )}

              {previewType === 'image' && (
                <div className="flex items-center justify-center">
                  <img
                    src={signedUrl}
                    alt={file.original_filename}
                    className="max-w-full h-auto rounded-lg shadow-lg"
                    style={{ maxHeight: '70vh' }}
                  />
                </div>
              )}

              {previewType === 'none' && (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                  <AlertCircle className="w-12 h-12 text-slate-400" />
                  <p className="text-slate-900 font-medium mt-4">Preview not available</p>
                  <p className="text-slate-600 mt-2">
                    This file type cannot be previewed in the browser.
                  </p>
                  <p className="text-slate-600">Please download the file to view it.</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0 p-3 sm:p-4 border-t border-slate-200 bg-white">
          <button
            onClick={handleDownload}
            disabled={!signedUrl || loading}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
            aria-label="Download file"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm sm:text-base"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
