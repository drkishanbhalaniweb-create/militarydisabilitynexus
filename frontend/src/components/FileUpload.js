import React, { useState, useCallback } from 'react';
import { Upload, X, File, Image, FileText, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { fileUploadApi } from '../lib/api';

const FileUpload = ({ 
  contactId = null, 
  onUploadComplete = () => {}, 
  onUploadError = () => {},
  maxFiles = 5,
  acceptedTypes = "image/*,.pdf,.doc,.docx,.txt",
  maxSizeInMB = 50 
}) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

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

  // Validate file
  const validateFile = (file) => {
    const maxSize = maxSizeInMB * 1024 * 1024;
    
    if (file.size > maxSize) {
      return `File size must be less than ${maxSizeInMB}MB`;
    }

    const allowedTypes = acceptedTypes.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    const mimeType = file.type;

    const isAllowed = allowedTypes.some(type => {
      if (type.startsWith('.')) {
        return fileExtension === type;
      }
      if (type.includes('*')) {
        const baseType = type.split('/')[0];
        return mimeType.startsWith(baseType);
      }
      return mimeType === type;
    });

    if (!isAllowed) {
      return 'File type not allowed';
    }

    return null;
  };

  // Handle file selection
  const handleFiles = useCallback((selectedFiles) => {
    const fileArray = Array.from(selectedFiles);
    
    if (files.length + fileArray.length > maxFiles) {
      onUploadError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validFiles = [];
    const errors = [];

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'pending',
          progress: 0,
          error: null,
          uploadedId: null
        });
      }
    });

    if (errors.length > 0) {
      onUploadError(errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    }
  }, [files.length, maxFiles, onUploadError]);

  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  // Handle file input change
  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  // Remove file
  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Upload files
  const uploadFiles = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setUploading(true);

    for (const fileItem of pendingFiles) {
      try {
        // Update status to uploading
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'uploading', progress: 50 }
            : f
        ));

        const response = await fileUploadApi.upload(
          fileItem.file,
          contactId,
          'other'
        );

        // Update status to completed
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { 
                ...f, 
                status: 'completed', 
                progress: 100,
                uploadedId: response.id
              }
            : f
        ));

        onUploadComplete(response);

      } catch (error) {
        console.error('Upload error:', error);
        const errorMessage = error.message || 'Upload failed';
        
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'error', error: errorMessage }
            : f
        ));

        onUploadError(`${fileItem.name}: ${errorMessage}`);
      }
    }

    setUploading(false);
  };

  return (
    <div className="w-full">
      {/* Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-indigo-500 bg-indigo-50' 
            : 'border-slate-300 hover:border-slate-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept={acceptedTypes}
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        
        <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-slate-700 mb-2">
          Drop files here or click to browse
        </p>
        <p className="text-sm text-slate-500">
          Supports images, PDFs, and documents up to {maxSizeInMB}MB each
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Maximum {maxFiles} files
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="font-medium text-slate-900">Selected Files</h4>
          
          {files.map((fileItem) => {
            const IconComponent = getFileIcon(fileItem.type);
            
            return (
              <div key={fileItem.id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                <div className="flex-shrink-0">
                  <IconComponent className="w-8 h-8 text-slate-500" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {fileItem.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(fileItem.size)}
                  </p>
                  
                  {/* Progress Bar */}
                  {fileItem.status === 'uploading' && (
                    <div className="mt-2">
                      <div className="bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${fileItem.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{fileItem.progress}%</p>
                    </div>
                  )}
                  
                  {/* Error Message */}
                  {fileItem.error && (
                    <p className="text-xs text-red-600 mt-1">{fileItem.error}</p>
                  )}
                </div>
                
                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {fileItem.status === 'pending' && (
                    <button
                      onClick={() => removeFile(fileItem.id)}
                      className="text-slate-400 hover:text-slate-600"
                      disabled={uploading}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                  {fileItem.status === 'uploading' && (
                    <Loader className="w-5 h-5 text-indigo-600 animate-spin" />
                  )}
                  {fileItem.status === 'completed' && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  {fileItem.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Upload Button */}
          {files.some(f => f.status === 'pending') && (
            <button
              onClick={uploadFiles}
              disabled={uploading}
              className="w-full text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ backgroundColor: '#B91C3C' }}
            >
              {uploading ? (
                <span className="flex items-center justify-center space-x-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Uploading...</span>
                </span>
              ) : (
                `Upload ${files.filter(f => f.status === 'pending').length} file(s)`
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;