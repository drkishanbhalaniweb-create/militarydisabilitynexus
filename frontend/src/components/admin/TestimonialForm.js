import { useState, useEffect, useRef } from 'react';
import {
    Save,
    X,
    Video,
    Plus,
    Trash2,
    Sparkles,
    Clock,
    UploadCloud,
    Film,
    Image as ImageIcon,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Pin,
    Info,
} from 'lucide-react';
import { toast } from 'sonner';
import StarRating from '../testimonials/StarRating';
import {
    TESTIMONIAL_TAG_OPTIONS,
    VIDEO_ASPECT_RATIO_OPTIONS,
    formatDurationDisplay,
    generateTestimonialSlug,
    validateVideoFile,
    validatePosterFile,
    extractVideoMetadata,
    uploadTestimonialMedia,
} from '../../lib/testimonials';

const TestimonialForm = ({
    title,
    formData,
    loading,
    onChange,
    onTagToggle,
    onRatingChange,
    onCustomChange,
    onCancel,
    onSubmit,
    submitLabel,
}) => {
    const [hasVideo, setHasVideo] = useState(Boolean(formData.video_url || formData.slug));
    const [videoUploading, setVideoUploading] = useState(false);
    const [videoUploadProgress, setVideoUploadProgress] = useState(0);
    const [videoUploadFileName, setVideoUploadFileName] = useState('');
    const [videoUploadError, setVideoUploadError] = useState('');

    const [posterUploading, setPosterUploading] = useState(false);
    const [posterUploadProgress, setPosterUploadProgress] = useState(0);
    const [posterUploadError, setPosterUploadError] = useState('');

    const videoFileInputRef = useRef(null);
    const posterFileInputRef = useRef(null);

    useEffect(() => {
        if (formData.video_url || formData.slug) {
            setHasVideo(true);
        }
    }, [formData.video_url, formData.slug]);

    const handleVideoToggle = (enabled) => {
        setHasVideo(enabled);
        if (!enabled && onCustomChange) {
            onCustomChange('video_url', '');
            onCustomChange('slug', '');
            onCustomChange('video_thumbnail_url', '');
            onCustomChange('video_duration', '');
            onCustomChange('video_transcript', '');
            onCustomChange('video_key_moments', []);
            onCustomChange('clinician_notes', '');
            onCustomChange('claim_outcome', '');
            onCustomChange('condition_tag', '');
        }
    };

    const handleGenerateSlug = () => {
        const slug = generateTestimonialSlug(
            formData.name || '',
            formData.condition_tag || '',
            formData.service_slug || ''
        );
        if (onCustomChange) {
            onCustomChange('slug', slug);
        }
    };

    const handleVideoFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setVideoUploadError('');
        setVideoUploadFileName(file.name);

        // 1. Client-side format & size validation
        const validation = validateVideoFile(file);
        if (!validation.valid) {
            const err = validation.errors.join(' ');
            setVideoUploadError(err);
            toast.error(validation.errors[0]);
            return;
        }

        // 2. Automatic duration and aspect ratio detection via HTML5 <video> metadata
        try {
            const meta = await extractVideoMetadata(file);
            if (meta.duration > 0 && onCustomChange) {
                onCustomChange('video_duration', meta.duration);
            }
            if (meta.aspectRatio && onCustomChange) {
                onCustomChange('video_aspect_ratio', meta.aspectRatio);
            }
            if (meta.duration > 0) {
                toast.info(`Detected duration: ${formatDurationDisplay(meta.duration)} (${meta.aspectRatio})`);
            }
        } catch (metaErr) {
            console.warn('Metadata extraction failed:', metaErr);
        }

        // 3. Upload to Supabase Storage with progress bar
        setVideoUploading(true);
        setVideoUploadProgress(0);

        try {
            const res = await uploadTestimonialMedia({
                file,
                folder: 'videos',
                onProgress: (percent) => {
                    setVideoUploadProgress(percent);
                },
            });

            if (onCustomChange) {
                onCustomChange('video_url', res.url);
                onCustomChange('video_provider', 'html5');
            }
            toast.success('Video uploaded to Supabase Storage successfully!');
        } catch (uploadErr) {
            console.error('Video upload error:', uploadErr);
            setVideoUploadError(uploadErr.message || 'Failed to upload video');
            toast.error(`Video upload error: ${uploadErr.message || 'Failed to upload'}`);
        } finally {
            setVideoUploading(false);
            if (videoFileInputRef.current) {
                videoFileInputRef.current.value = '';
            }
        }
    };

    const handlePosterFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setPosterUploadError('');
        const validation = validatePosterFile(file);
        if (!validation.valid) {
            const err = validation.errors.join(' ');
            setPosterUploadError(err);
            toast.error(validation.errors[0]);
            return;
        }

        setPosterUploading(true);
        setPosterUploadProgress(0);

        try {
            const res = await uploadTestimonialMedia({
                file,
                folder: 'posters',
                onProgress: (percent) => {
                    setPosterUploadProgress(percent);
                },
            });

            if (onCustomChange) {
                onCustomChange('video_thumbnail_url', res.url);
            }
            toast.success('Poster thumbnail uploaded successfully!');
        } catch (uploadErr) {
            console.error('Poster upload error:', uploadErr);
            setPosterUploadError(uploadErr.message || 'Failed to upload poster image');
            toast.error(`Poster upload error: ${uploadErr.message || 'Failed to upload'}`);
        } finally {
            setPosterUploading(false);
            if (posterFileInputRef.current) {
                posterFileInputRef.current.value = '';
            }
        }
    };

    const handleRemoveVideo = () => {
        if (onCustomChange) {
            onCustomChange('video_url', '');
            onCustomChange('video_duration', '');
        }
        setVideoUploadFileName('');
    };

    const handleRemovePoster = () => {
        if (onCustomChange) {
            onCustomChange('video_thumbnail_url', '');
        }
    };

    const handleAddKeyMoment = () => {
        const current = Array.isArray(formData.video_key_moments) ? formData.video_key_moments : [];
        const lastMoment = current[current.length - 1];
        const nextStart = lastMoment ? (Number(lastMoment.endOffset) || Number(lastMoment.startOffset) + 30) : 0;
        const newMoments = [
            ...current,
            { name: '', startOffset: nextStart, endOffset: nextStart + 30 },
        ];
        if (onCustomChange) {
            onCustomChange('video_key_moments', newMoments);
        }
    };

    const handleMomentChange = (index, field, value) => {
        const current = Array.isArray(formData.video_key_moments) ? [...formData.video_key_moments] : [];
        if (!current[index]) return;
        current[index] = {
            ...current[index],
            [field]: field === 'name' ? value : Number(value) || 0,
        };
        if (onCustomChange) {
            onCustomChange('video_key_moments', current);
        }
    };

    const handleRemoveKeyMoment = (index) => {
        const current = Array.isArray(formData.video_key_moments) ? formData.video_key_moments : [];
        const filtered = current.filter((_, i) => i !== index);
        if (onCustomChange) {
            onCustomChange('video_key_moments', filtered);
        }
    };

    return (
        <div className="max-w-4xl pb-16">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-slate-600 hover:text-slate-900 cursor-pointer"
                    aria-label="Close testimonial form"
                >
                    <X className="h-6 w-6" />
                </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
                {/* BASIC TESTIMONIAL DETAILS */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-bold text-slate-900">Testimonial Details</h2>

                    <div className="space-y-5">
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Client Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name || ''}
                                    onChange={onChange}
                                    required
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="e.g. John Doe, USMC Veteran"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Branch of Military Service *
                                </label>
                                <input
                                    type="text"
                                    name="branch"
                                    value={formData.branch || ''}
                                    onChange={onChange}
                                    required
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="e.g. Army, Navy, Air Force, Marine Corps"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Tags / Services
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {TESTIMONIAL_TAG_OPTIONS.map((tag) => {
                                    const selected = (formData.tags || []).includes(tag);

                                    return (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => onTagToggle(tag)}
                                            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                                                selected
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                            }`}
                                        >
                                            {tag}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Star Rating *
                            </label>
                            <div className="flex items-center gap-4">
                                <StarRating value={formData.rating || 5} onChange={onRatingChange} size={26} />
                                <span className="text-sm font-medium text-slate-600">
                                    {formData.rating || 5} out of 5
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Written Feedback / Review Summary *
                            </label>
                            <textarea
                                name="feedback"
                                value={formData.feedback || ''}
                                onChange={onChange}
                                required
                                rows="6"
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Paste the veteran's testimonial text here"
                            />
                        </div>
                    </div>
                </div>

                {/* FEATURED & PINNING SECTION */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-2 text-slate-900">
                            <Pin className="h-5 w-5 text-amber-600" />
                            <h2 className="text-xl font-bold">Featured & Pinning</h2>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                            <input
                                type="checkbox"
                                name="is_pinned"
                                checked={Boolean(formData.is_pinned)}
                                onChange={onChange}
                                className="peer sr-only"
                            />
                            <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-amber-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                            <span className="ml-3 text-sm font-medium text-slate-700">Pin to top of testimonials page</span>
                        </label>
                    </div>

                    {formData.is_pinned && (
                        <div className="mt-6 space-y-4">
                            <div className="max-w-xs">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <label htmlFor="pin_order_input" className="block text-sm font-semibold text-slate-700">
                                        Pin Display Priority (1 = first, 2 = second, etc.)
                                    </label>
                                    <div
                                        className="group relative cursor-help text-slate-400 hover:text-slate-600"
                                        title="Lower numbers appear first among pinned testimonials. For example, priority #1 is placed ahead of #2."
                                    >
                                        <Info className="h-4 w-4" />
                                        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden w-64 rounded-lg bg-slate-900 p-2.5 text-xs text-white shadow-lg group-hover:block z-10">
                                            Lower numbers appear first among pinned testimonials. For example, priority #1 is placed ahead of #2.
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                                        </div>
                                    </div>
                                </div>
                                <input
                                    id="pin_order_input"
                                    type="number"
                                    name="pin_order"
                                    min="1"
                                    step="1"
                                    value={formData.pin_order || 1}
                                    onChange={onChange}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                                    placeholder="1"
                                />
                            </div>

                            <p className="text-xs text-slate-500">
                                Pinned testimonials are highlighted with a special badge and appear at the very top of the testimonials page and relevant service pages before regular chronological reviews.
                            </p>
                        </div>
                    )}
                </div>

                {/* VIDEO TESTIMONIAL & SPOKE LANDING PAGE SECTION */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-2 text-slate-900">
                            <Video className="h-5 w-5 text-[#B91C3C]" />
                            <h2 className="text-xl font-bold">Video Testimonial & Dedicated Watch Page</h2>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                            <input
                                type="checkbox"
                                checked={hasVideo}
                                onChange={(e) => handleVideoToggle(e.target.checked)}
                                className="peer sr-only"
                            />
                            <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#B91C3C] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                            <span className="ml-3 text-sm font-medium text-slate-700">Enable Video</span>
                        </label>
                    </div>

                    {hasVideo && (
                        <div className="mt-6 space-y-6">
                            {/* DIRECT VIDEO UPLOAD TO SUPABASE STORAGE */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Testimonial Video File (Supabase Storage) *
                                </label>

                                <input
                                    ref={videoFileInputRef}
                                    type="file"
                                    accept="video/mp4,video/webm,video/quicktime,video/ogg,video/x-m4v,.mp4,.webm,.mov,.ogg,.m4v"
                                    onChange={handleVideoFileSelect}
                                    className="hidden"
                                    id="testimonial-video-upload"
                                />

                                {formData.video_url ? (
                                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
                                                    <Film className="h-5 w-5" />
                                                </div>
                                                <div className="max-w-md">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-slate-900">
                                                            Video Hosted in Supabase Storage
                                                        </span>
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                    </div>
                                                    <p className="truncate text-xs text-slate-600 mt-0.5" title={formData.video_url}>
                                                        {formData.video_url}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => videoFileInputRef.current?.click()}
                                                    disabled={videoUploading}
                                                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                                                >
                                                    Replace File
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveVideo}
                                                    className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => !videoUploading && videoFileInputRef.current?.click()}
                                        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${
                                            videoUploading
                                                ? 'border-indigo-400 bg-indigo-50/50 cursor-wait'
                                                : 'border-slate-300 bg-slate-50/50 hover:border-[#B91C3C] hover:bg-red-50/20 cursor-pointer'
                                        }`}
                                    >
                                        {videoUploading ? (
                                            <div className="w-full max-w-md space-y-3 py-2">
                                                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Loader2 className="h-4 w-4 animate-spin text-[#B91C3C]" />
                                                        <span>Uploading video to Supabase Storage...</span>
                                                    </span>
                                                    <span className="text-slate-900">{videoUploadProgress}%</span>
                                                </div>
                                                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                                                    <div
                                                        className="h-full bg-[#B91C3C] transition-all duration-300 ease-out"
                                                        style={{ width: `${videoUploadProgress}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs text-slate-500 truncate">
                                                    {videoUploadFileName}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-[#B91C3C]">
                                                    <UploadCloud className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <span className="text-sm font-semibold text-slate-800">
                                                        Click or drag MP4 / WebM video file here to upload
                                                    </span>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        Supports MP4, WebM, QuickTime MOV up to 100MB. Direct Supabase Storage hosting.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {videoUploadError && (
                                    <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                        <span>{videoUploadError}</span>
                                    </div>
                                )}

                                {/* Manual URL input for fallback / direct URL entry */}
                                <div className="mt-3">
                                    <input
                                        type="url"
                                        name="video_url"
                                        value={formData.video_url || ''}
                                        onChange={onChange}
                                        required={hasVideo}
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Or enter direct video URL (https://...)"
                                    />
                                    {/(?:youtube\.com|youtu\.be)/i.test(formData.video_url || '') && (
                                        <div className="mt-1.5 flex items-center gap-1.5 rounded bg-amber-50 px-2 py-1 text-xs text-amber-800 border border-amber-200">
                                            <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                                            <span>YouTube is deprecated. Please upload an MP4 or WebM video file directly to Supabase Storage above.</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Aspect Ratio & Automatically Detected Duration */}
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Video Aspect Ratio
                                    </label>
                                    <select
                                        name="video_aspect_ratio"
                                        value={formData.video_aspect_ratio || '4:5'}
                                        onChange={onChange}
                                        className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {VIDEO_ASPECT_RATIO_OPTIONS.map((opt) => (
                                          <option key={opt.value} value={opt.value}>
                                              {opt.label}
                                          </option>
                                        ))}
                                    </select>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Default 4:5 is ideal for smartphone vertical recordings.
                                    </p>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Video Duration (seconds)
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number"
                                            name="video_duration"
                                            value={formData.video_duration || ''}
                                            onChange={onChange}
                                            min="0"
                                            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Auto-detected on video file selection"
                                        />
                                        {formData.video_duration > 0 && (
                                            <span className="whitespace-nowrap rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                                                {formatDurationDisplay(formData.video_duration)}
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Automatically extracted from video metadata or can be adjusted manually.
                                    </p>
                                </div>
                            </div>

                            {/* DIRECT POSTER IMAGE UPLOAD */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Poster Thumbnail Image (optional)
                                </label>

                                <input
                                    ref={posterFileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/avif,.jpg,.jpeg,.png,.webp,.avif"
                                    onChange={handlePosterFileSelect}
                                    className="hidden"
                                    id="testimonial-poster-upload"
                                />

                                <div className="flex flex-wrap items-start gap-4">
                                    {formData.video_thumbnail_url && (
                                        <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-black shadow-sm">
                                            <img
                                                src={formData.video_thumbnail_url}
                                                alt="Poster preview"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-[240px] space-y-2">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => posterFileInputRef.current?.click()}
                                                disabled={posterUploading}
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
                                            >
                                                <ImageIcon className="h-4 w-4 text-slate-500" />
                                                <span>{posterUploading ? `Uploading (${posterUploadProgress}%)...` : 'Upload Poster Image'}</span>
                                            </button>

                                            {formData.video_thumbnail_url && (
                                                <button
                                                    type="button"
                                                    onClick={handleRemovePoster}
                                                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                                >
                                                    Remove Poster
                                                </button>
                                            )}
                                        </div>

                                        <input
                                            type="url"
                                            name="video_thumbnail_url"
                                            value={formData.video_thumbnail_url || ''}
                                            onChange={onChange}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Or enter direct image URL (https://...)"
                                        />
                                        <p className="text-xs text-slate-500">
                                            High-contrast cover image shown before video playback. Supports JPG, PNG, WebP up to 10MB.
                                        </p>
                                    </div>
                                </div>

                                {posterUploadError && (
                                    <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                        <span>{posterUploadError}</span>
                                    </div>
                                )}
                            </div>

                            {/* Spoke Page Slug */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-semibold text-slate-700">
                                        Dedicated Page URL Slug (/testimonials/[slug])
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleGenerateSlug}
                                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                                    >
                                        <Sparkles className="h-3.5 w-3.5" />
                                        <span>Generate</span>
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    name="slug"
                                    value={formData.slug || ''}
                                    onChange={onChange}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="e.g. john-doe-sleep-apnea-nexus-review"
                                />
                                <p className="mt-1 text-xs text-slate-500">
                                    Generates a dedicated indexed spoke page for Google Video Search.
                                </p>
                            </div>

                            {/* Claim Outcome & Condition Tag */}
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Verified Claim Outcome
                                    </label>
                                    <input
                                        type="text"
                                        name="claim_outcome"
                                        value={formData.claim_outcome || ''}
                                        onChange={onChange}
                                        className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="e.g. 70% Sleep Apnea Service Connection Approved"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Condition Tag
                                    </label>
                                    <input
                                        type="text"
                                        name="condition_tag"
                                        value={formData.condition_tag || ''}
                                        onChange={onChange}
                                        className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="e.g. Sleep Apnea, PTSD, Lumbar Strain"
                                    />
                                </div>
                            </div>

                            {/* Clinician Notes (E-E-A-T) */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Clinician Notes & Medical Review Rationale (Dr. Kishan Bhalani)
                                </label>
                                <textarea
                                    name="clinician_notes"
                                    value={formData.clinician_notes || ''}
                                    onChange={onChange}
                                    rows="4"
                                    className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Explain the clinical evidence, service connection nexus, and medical rationale for Google E-E-A-T."
                                />
                            </div>

                            {/* Full Verbatim Transcript */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Full Verbatim Transcript (Crawlable for Google SEO)
                                </label>
                                <textarea
                                    name="video_transcript"
                                    value={formData.video_transcript || ''}
                                    onChange={onChange}
                                    rows="6"
                                    className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Paste the full spoken transcript of the video review"
                                />
                            </div>

                            {/* Google Key Moments Builder */}
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-slate-700" />
                                        <h3 className="text-sm font-bold text-slate-900">
                                            Google Key Moments (Timestamps)
                                        </h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddKeyMoment}
                                        className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 cursor-pointer"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        <span>Add Timestamp</span>
                                    </button>
                                </div>

                                {(!formData.video_key_moments || formData.video_key_moments.length === 0) ? (
                                    <p className="text-xs text-slate-500 italic py-2">
                                        No key moments added. Adding moments generates Google Key Moments carousels in search results!
                                    </p>
                                ) : (
                                    <div className="space-y-3 mt-3">
                                        {formData.video_key_moments.map((moment, idx) => (
                                            <div
                                                key={idx}
                                                className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-3"
                                            >
                                                <div className="flex-1 min-w-[200px]">
                                                    <input
                                                        type="text"
                                                        value={moment.name || ''}
                                                        onChange={(e) =>
                                                            handleMomentChange(idx, 'name', e.target.value)
                                                        }
                                                        placeholder="Moment title (e.g. Evidence Review)"
                                                        className="w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-slate-500">Start (sec):</span>
                                                    <input
                                                        type="number"
                                                        value={moment.startOffset || 0}
                                                        onChange={(e) =>
                                                            handleMomentChange(idx, 'startOffset', e.target.value)
                                                        }
                                                        min="0"
                                                        className="w-20 rounded border border-slate-300 px-2 py-1.5 text-sm"
                                                    />
                                                    <span className="text-xs font-semibold text-slate-600">
                                                        ({formatDurationDisplay(moment.startOffset || 0)})
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveKeyMoment(idx)}
                                                    className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                                                    aria-label="Remove timestamp"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* SUBMIT ACTIONS */}
                <div className="flex items-center justify-end gap-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-lg border border-slate-300 px-6 py-2.5 text-slate-700 transition-colors hover:bg-slate-50 font-medium cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || videoUploading || posterUploading}
                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 font-semibold cursor-pointer"
                    >
                        <Save className="h-5 w-5" />
                        <span>{loading ? 'Saving...' : submitLabel}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TestimonialForm;
