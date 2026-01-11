import { useState, useCallback, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { uploadBlogImage, deleteBlogImage, validateImage, formatFileSize } from '../../lib/imageUpload';

/**
 * ImageUpload Component
 * Drag & drop image upload with preview for blog posts
 */
const ImageUpload = ({
  onUploadComplete,
  existingImage = null,
  existingPath = null,
  folder = 'blog',
  label = 'Upload Image',
  showPreview = true
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(existingImage);
  const [imagePath, setImagePath] = useState(existingPath);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

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

  // Handle drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  // Handle file input change
  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Handle file upload
  const handleFile = async (file) => {
    // Validate file
    const validation = validateImage(file);
    if (!validation.valid) {
      toast.error(validation.errors.join(', '));
      return;
    }

    setUploading(true);

    try {
      // Delete old image if exists
      if (imagePath) {
        try {
          await deleteBlogImage(imagePath);
        } catch (error) {
          console.warn('Could not delete old image:', error);
        }
      }

      // Upload new image
      const result = await uploadBlogImage(file, folder);

      // Create preview URL only in browser
      if (typeof window !== 'undefined') {
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);
      }
      setImagePath(result.path);

      // Notify parent component
      onUploadComplete(result.url, result.path);

      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Handle remove image
  const handleRemove = async () => {
    try {
      if (imagePath) {
        await deleteBlogImage(imagePath);
      }

      setPreview(null);
      setImagePath(null);
      onUploadComplete(null, null);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast.success('Image removed');
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Failed to remove image');
    }
  };

  // Trigger file input click
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {label}
      </label>

      {!preview ? (
        // Upload area
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${dragActive
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-slate-300 hover:border-slate-400'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleChange}
            disabled={uploading}
          />

          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
              <p className="text-sm font-semibold text-slate-700">
                Uploading...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-12 h-12 text-slate-400 mb-4" />
              <p className="text-sm font-semibold text-slate-700 mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-slate-500">
                PNG, JPG, WebP, GIF up to 5MB
              </p>
            </div>
          )}
        </div>
      ) : (
        // Preview area
        showPreview && (
          <div className="relative group">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-64 object-cover rounded-lg border-2 border-slate-200"
            />

            {/* Overlay with remove button */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center">
              <button
                type="button"
                onClick={handleRemove}
                className="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Remove Image</span>
              </button>
            </div>

            {/* Image info */}
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center space-x-1">
                <ImageIcon className="w-4 h-4" />
                <span>Image uploaded</span>
              </span>
              <button
                type="button"
                onClick={handleRemove}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        )
      )}

      {/* Help text */}
      <p className="text-xs text-slate-500">
        Recommended: 1200x630px for featured images, 800x600px for content images
      </p>
    </div>
  );
};

export default ImageUpload;
