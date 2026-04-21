import { supabase } from './supabase';

/**
 * Image Upload Utilities for Blog Posts
 * Handles uploading, deleting, and managing blog images in Supabase Storage
 */

const BUCKET_NAME = 'blog'; // Using existing blog bucket
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

/**
 * Validate image file
 */
export const validateImage = (file) => {
  const errors = [];

  if (!file) {
    errors.push('No file provided');
    return { valid: false, errors };
  }

  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    errors.push('Invalid file type. Allowed: JPG, PNG, WebP, GIF, SVG');
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Generate unique filename
 */
const generateFileName = (originalName) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const extension = originalName.split('.').pop();
  return `${timestamp}-${random}.${extension}`;
};

/**
 * Upload blog image to Supabase Storage
 * @param {File} file - Image file to upload
 * @param {string} folder - Optional folder name (e.g., 'featured', 'content')
 * @returns {Promise<{url: string, path: string}>}
 */
export const uploadBlogImage = async (file, folder = 'blog') => {
  try {
    // Validate file
    const validation = validateImage(file);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    // Generate unique filename
    const fileName = generateFileName(file.name);
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return {
      url: publicUrl,
      path: filePath,
      success: true,
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Delete blog image from Supabase Storage
 * @param {string} filePath - Path of the file to delete
 * @returns {Promise<boolean>}
 */
export const deleteBlogImage = async (filePath) => {
  try {
    if (!filePath) {
      throw new Error('No file path provided');
    }

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

/**
 * Get public URL for an image
 * @param {string} filePath - Path of the file
 * @returns {string}
 */
export const getImageUrl = (filePath) => {
  if (!filePath) return null;

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return publicUrl;
};

/**
 * Compress image on client side (optional, for future use)
 * @param {File} file - Image file to compress
 * @param {number} maxWidth - Maximum width
 * @param {number} quality - Quality (0-1)
 * @returns {Promise<File>}
 */
export const compressImage = async (file, maxWidth = 1920, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };
      
      img.onerror = reject;
    };
    
    reader.onerror = reject;
  });
};

/**
 * Upload multiple images
 * @param {File[]} files - Array of image files
 * @param {string} folder - Optional folder name
 * @returns {Promise<Array>}
 */
export const uploadMultipleImages = async (files, folder = 'blog') => {
  try {
    const uploadPromises = files.map(file => uploadBlogImage(file, folder));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string}
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
