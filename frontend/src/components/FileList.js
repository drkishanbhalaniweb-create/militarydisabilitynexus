import React, { useState, useEffect } from 'react';
import { Download, Trash2, Eye, File, Image, FileText, Shield, Calendar, User } from 'lucide-react';
import { fileUploadApi } from '../lib/api';

const FileList = ({ contactId = null, refreshTrigger = 0 }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // File type icons
  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType.includes('pdf')) return FileText;
    if (mimeType.includes('word') || mimeType.includes('text')) return FileText;
    return File;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get category display name and color
  const getCategoryInfo = (category) => {
    const categories = {
      'medical_record': { name: 'Medical Record', color: 'bg-red-100 text-red-800' },
      'service_record': { name: 'Service Record', color: 'bg-navy-100 text-navy-800' },
      'photo': { name: 'Photo', color: 'bg-green-100 text-green-800' },
      'document': { name: 'Document', color: 'bg-purple-100 text-purple-800' },
      'other': { name: 'Other', color: 'bg-gray-100 text-gray-800' }
    };
    return categories[category] || categories.other;
  };

  // Fetch files
  const fetchFiles = async () => {
    try {
      setLoading(true);
      const data = await fileUploadApi.getAll(contactId);
      setFiles(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  // Download file
  const downloadFile = async (fileId, filename, storagePath) => {
    try {
      const url = await fileUploadApi.getDownloadUrl(storagePath);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading file:', err);
      alert('Failed to download file');
    }
  };

  // Delete file
  const deleteFile = async (fileId, storagePath) => {
    if (!window.confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      return;
    }

    try {
      await fileUploadApi.delete(fileId, storagePath);
      setFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (err) {
      console.error('Error deleting file:', err);
      alert('Failed to delete file');
    }
  };

  // View file details
  const viewFile = async (fileId) => {
    try {
      const file = await fileUploadApi.getById(fileId);
      
      // Create a modal or detailed view
      alert(`File Details:\n\nName: ${file.original_filename}\nSize: ${formatFileSize(file.file_size)}\nType: ${file.mime_type}\nCategory: ${getCategoryInfo(file.file_category).name}\nUploaded: ${formatDate(file.created_at)}\nPHI: ${file.is_phi ? 'Yes' : 'No'}`);
    } catch (err) {
      console.error('Error viewing file:', err);
      alert('Failed to load file details');
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [contactId, refreshTrigger]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-slate-600">Loading files...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">{error}</div>
        <button 
          onClick={fetchFiles}
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Try again
        </button>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <File className="w-12 h-12 mx-auto mb-4 text-slate-300" />
        <p>No files uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">
          Uploaded Files ({files.length})
        </h3>
        <button
          onClick={fetchFiles}
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-4">
        {files.map((file) => {
          const IconComponent = getFileIcon(file.mime_type);
          const categoryInfo = getCategoryInfo(file.file_category);

          return (
            <div key={file.id} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                {/* File Icon */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-slate-600" />
                  </div>
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-slate-900 truncate">
                        {file.original_filename}
                      </h4>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-slate-500">
                        <span>{formatFileSize(file.file_size)}</span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(file.created_at)}</span>
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => viewFile(file.id)}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => downloadFile(file.id, file.original_filename, file.storage_path)}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteFile(file.id, file.storage_path)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}>
                      {categoryInfo.name}
                    </span>
                    
                    {file.is_phi && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        <Shield className="w-3 h-3 mr-1" />
                        PHI Protected
                      </span>
                    )}
                    
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      file.upload_status === 'uploaded' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {file.upload_status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FileList;