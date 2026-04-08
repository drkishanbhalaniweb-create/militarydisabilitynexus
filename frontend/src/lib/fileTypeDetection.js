/**
 * File Type Detection Utility
 * Handles file type detection, validation, and preview capability checking
 */

/**
 * Common MIME types and their categories
 */
const MIME_TYPE_CATEGORIES = {
  // Images
  'image/jpeg': 'image',
  'image/jpg': 'image',
  'image/png': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'image/svg+xml': 'image',
  'image/bmp': 'image',
  
  // PDFs
  'application/pdf': 'pdf',
  
  // Documents
  'application/msword': 'document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
  'application/vnd.ms-excel': 'document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'document',
  'application/vnd.ms-powerpoint': 'document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'document',
  'text/plain': 'document',
  'text/csv': 'document',
  
  // Archives
  'application/zip': 'archive',
  'application/x-rar-compressed': 'archive',
  'application/x-7z-compressed': 'archive',
  'application/x-tar': 'archive',
  'application/gzip': 'archive',
};

/**
 * File extensions mapped to MIME types
 */
const EXTENSION_TO_MIME = {
  // Images
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'gif': 'image/gif',
  'webp': 'image/webp',
  'svg': 'image/svg+xml',
  'bmp': 'image/bmp',
  
  // PDFs
  'pdf': 'application/pdf',
  
  // Documents
  'doc': 'application/msword',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'xls': 'application/vnd.ms-excel',
  'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'ppt': 'application/vnd.ms-powerpoint',
  'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'txt': 'text/plain',
  'csv': 'text/csv',
  
  // Archives
  'zip': 'application/zip',
  'rar': 'application/x-rar-compressed',
  '7z': 'application/x-7z-compressed',
  'tar': 'application/x-tar',
  'gz': 'application/gzip',
};

/**
 * Get file extension from filename
 * @param {string} filename - The filename
 * @returns {string} - File extension in lowercase
 */
export const getFileExtension = (filename) => {
  if (!filename || typeof filename !== 'string') return '';
  
  const parts = filename.split('.');
  if (parts.length < 2) return '';
  
  return parts[parts.length - 1].toLowerCase();
};

/**
 * Get MIME type from file extension
 * @param {string} filename - The filename
 * @returns {string|null} - MIME type or null if unknown
 */
export const getMimeTypeFromExtension = (filename) => {
  const extension = getFileExtension(filename);
  return EXTENSION_TO_MIME[extension] || null;
};

/**
 * Get file category from MIME type
 * @param {string} mimeType - The MIME type
 * @returns {string} - Category (image, pdf, document, archive, unknown)
 */
export const getFileCategory = (mimeType) => {
  if (!mimeType) return 'unknown';
  
  // Normalize MIME type
  const normalized = mimeType.toLowerCase().trim();
  
  return MIME_TYPE_CATEGORIES[normalized] || 'unknown';
};

/**
 * Check if file is an image
 * @param {string} mimeType - The MIME type
 * @returns {boolean} - True if file is an image
 */
export const isImage = (mimeType) => {
  return getFileCategory(mimeType) === 'image';
};

/**
 * Check if file is a PDF
 * @param {string} mimeType - The MIME type
 * @returns {boolean} - True if file is a PDF
 */
export const isPDF = (mimeType) => {
  return getFileCategory(mimeType) === 'pdf';
};

/**
 * Check if file is a document
 * @param {string} mimeType - The MIME type
 * @returns {boolean} - True if file is a document
 */
export const isDocument = (mimeType) => {
  return getFileCategory(mimeType) === 'document';
};

/**
 * Check if file can be previewed in browser
 * @param {string} mimeType - The MIME type
 * @returns {boolean} - True if file can be previewed
 */
export const canPreview = (mimeType) => {
  const category = getFileCategory(mimeType);
  return category === 'image' || category === 'pdf';
};

/**
 * Validate file extension against allowed types
 * @param {string} filename - The filename
 * @param {array} allowedExtensions - Array of allowed extensions (e.g., ['pdf', 'jpg', 'png'])
 * @returns {boolean} - True if extension is allowed
 */
export const isValidFileExtension = (filename, allowedExtensions = []) => {
  if (!allowedExtensions || allowedExtensions.length === 0) return true;
  
  const extension = getFileExtension(filename);
  return allowedExtensions.map(ext => ext.toLowerCase()).includes(extension);
};

/**
 * Validate MIME type against allowed types
 * @param {string} mimeType - The MIME type
 * @param {array} allowedMimeTypes - Array of allowed MIME types
 * @returns {boolean} - True if MIME type is allowed
 */
export const isValidMimeType = (mimeType, allowedMimeTypes = []) => {
  if (!allowedMimeTypes || allowedMimeTypes.length === 0) return true;
  
  const normalized = mimeType.toLowerCase().trim();
  return allowedMimeTypes.map(type => type.toLowerCase()).includes(normalized);
};

/**
 * Get human-readable file type label
 * @param {string} mimeType - The MIME type
 * @param {string} filename - The filename (optional, for fallback)
 * @returns {string} - Human-readable file type
 */
export const getFileTypeLabel = (mimeType, filename = '') => {
  const category = getFileCategory(mimeType);
  
  switch (category) {
    case 'image':
      return 'Image';
    case 'pdf':
      return 'PDF Document';
    case 'document': {
      const ext = getFileExtension(filename).toUpperCase();
      if (ext === 'DOC' || ext === 'DOCX') return 'Word Document';
      if (ext === 'XLS' || ext === 'XLSX') return 'Excel Spreadsheet';
      if (ext === 'PPT' || ext === 'PPTX') return 'PowerPoint Presentation';
      if (ext === 'TXT') return 'Text File';
      if (ext === 'CSV') return 'CSV File';
      return 'Document';
    }
    case 'archive':
      return 'Archive';
    default: {
      const extension = getFileExtension(filename);
      return extension ? `${extension.toUpperCase()} File` : 'Unknown File';
    }
  }
};

/**
 * Format file size to human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get icon name for file type (for use with lucide-react)
 * @param {string} mimeType - The MIME type
 * @returns {string} - Icon name
 */
export const getFileIcon = (mimeType) => {
  const category = getFileCategory(mimeType);
  
  switch (category) {
    case 'image':
      return 'Image';
    case 'pdf':
      return 'FileText';
    case 'document':
      return 'FileText';
    case 'archive':
      return 'Archive';
    default:
      return 'File';
  }
};

/**
 * Check if file meets size requirements
 * @param {number} fileSize - File size in bytes
 * @param {number} maxSize - Maximum allowed size in bytes
 * @returns {boolean} - True if file size is valid
 */
export const isValidFileSize = (fileSize, maxSize) => {
  if (!maxSize) return true;
  return fileSize <= maxSize;
};

/**
 * Get preview type for file
 * @param {string} mimeType - The MIME type
 * @returns {string} - Preview type (image, pdf, none)
 */
export const getPreviewType = (mimeType) => {
  if (isImage(mimeType)) return 'image';
  if (isPDF(mimeType)) return 'pdf';
  return 'none';
};

/**
 * Comprehensive file validation
 * @param {object} file - File object with properties: name, size, mime_type
 * @param {object} options - Validation options
 * @param {array} options.allowedExtensions - Allowed file extensions
 * @param {array} options.allowedMimeTypes - Allowed MIME types
 * @param {number} options.maxSize - Maximum file size in bytes
 * @returns {object} - Validation result { valid: boolean, error: string }
 */
export const validateFile = (file, options = {}) => {
  const {
    allowedExtensions = [],
    allowedMimeTypes = [],
    maxSize = null
  } = options;

  // Check file extension
  if (allowedExtensions.length > 0 && !isValidFileExtension(file.name, allowedExtensions)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${allowedExtensions.join(', ')}`
    };
  }

  // Check MIME type
  if (allowedMimeTypes.length > 0 && !isValidMimeType(file.mime_type, allowedMimeTypes)) {
    return {
      valid: false,
      error: 'File type not allowed'
    };
  }

  // Check file size
  if (maxSize && !isValidFileSize(file.size, maxSize)) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${formatFileSize(maxSize)}`
    };
  }

  return { valid: true, error: null };
};
