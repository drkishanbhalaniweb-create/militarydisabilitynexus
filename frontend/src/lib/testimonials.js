import { supabase, STORAGE_BUCKETS, supabaseUrl, supabaseAnonKey } from './supabase';

export const TESTIMONIAL_TAG_OPTIONS = [
  'nexus letter',
  'dbq',
  'aid and attendance',
  'claim readiness review',
  'c&p exam coaching',
  '1151 claim',
];

export const testimonialThemes = [
  {
    title: 'Clarity instead of guesswork',
    summary:
      'Veterans often need a cleaner understanding of what evidence matters, what the VA may focus on, and where their file is still weak.',
  },
  {
    title: 'Respectful, evidence-first communication',
    summary:
      'The strongest feedback themes in this category are usually about being heard, avoiding hype, and getting support grounded in real medical reasoning.',
  },
  {
    title: 'Preparation that lowers stress',
    summary:
      'Whether the service is a nexus letter, DBQ, or coaching session, the practical value is usually less uncertainty before a high-stakes VA step.',
  },
];

export const getUniqueTestimonialTags = (testimonials = []) => {
  const tags = new Set();

  testimonials.forEach((testimonial) => {
    (testimonial.tags || []).forEach((tag) => {
      if (tag) {
        tags.add(tag);
      }
    });
  });

  return Array.from(tags);
};

export const getAverageRating = (testimonials = []) => {
  if (!testimonials.length) {
    return null;
  }

  const ratings = testimonials
    .map((testimonial) => Number(testimonial.rating))
    .filter((rating) => Number.isFinite(rating) && rating > 0);

  if (!ratings.length) {
    return null;
  }

  const total = ratings.reduce((sum, rating) => sum + rating, 0);
  return total / ratings.length;
};

export const getUniqueBranchCount = (testimonials = []) => {
  const branches = new Set(
    testimonials
      .map((testimonial) => testimonial.branch?.trim())
      .filter(Boolean)
  );

  return branches.size;
};

export const getTagCount = (testimonials = [], tag) =>
  testimonials.filter((testimonial) => (testimonial.tags || []).includes(tag)).length;

export const getTestimonialTagTone = (tag = '') => {
  const normalized = tag.toLowerCase();

  if (normalized.includes('nexus')) {
    return 'bg-red-50 text-red-700 border-red-200';
  }

  if (normalized.includes('dbq')) {
    return 'bg-blue-50 text-blue-700 border-blue-200';
  }

  if (normalized.includes('aid and attendance')) {
    return 'bg-amber-50 text-amber-800 border-amber-200';
  }

  if (normalized.includes('claim readiness')) {
    return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  }

  if (normalized.includes('c&p')) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }

  if (normalized.includes('1151')) {
    return 'bg-purple-50 text-purple-700 border-purple-200';
  }

  return 'bg-slate-100 text-slate-700 border-slate-200';
};

export const shortenFeedback = (feedback = '', maxLength = 240) => {
  const normalized = feedback.replace(/\s+/g, ' ').trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const slice = normalized.slice(0, maxLength);
  const breakpoint = slice.lastIndexOf(' ');

  return `${slice.slice(0, breakpoint > 80 ? breakpoint : maxLength).trim()}...`;
};

/**
 * Comparator to sort testimonials with pinned items first, ordered by pin_order ASC,
 * and falling back to created_at DESC.
 */
export const compareTestimonialsByPinned = (a, b) => {
  const aPinned = Boolean(a?.is_pinned);
  const bPinned = Boolean(b?.is_pinned);

  if (aPinned && !bPinned) return -1;
  if (!aPinned && bPinned) return 1;

  if (aPinned && bPinned) {
    const aOrder = a?.pin_order !== null && a?.pin_order !== undefined ? Number(a.pin_order) : 0;
    const bOrder = b?.pin_order !== null && b?.pin_order !== undefined ? Number(b.pin_order) : 0;
    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }
  }

  const aTime = a?.created_at ? new Date(a.created_at).getTime() : 0;
  const bTime = b?.created_at ? new Date(b.created_at).getTime() : 0;
  return bTime - aTime;
};

// Video Testimonials Configuration & Utilities
// ============================================

export const VIDEO_ASPECT_RATIO_OPTIONS = [
  { value: '4:5', label: '4:5 (Squarish Vertical - Ideal for Smartphone Reels)', aspectClass: 'aspect-[4/5]', cssRatio: '4 / 5', maxW: 'max-w-md' },
  { value: '1:1', label: '1:1 (Square)', aspectClass: 'aspect-square', cssRatio: '1 / 1', maxW: 'max-w-md' },
  { value: '3:4', label: '3:4 (Portrait)', aspectClass: 'aspect-[3/4]', cssRatio: '3 / 4', maxW: 'max-w-md' },
  { value: '9:16', label: '9:16 (Vertical Full Reel / Short)', aspectClass: 'aspect-[9/16]', cssRatio: '9 / 16', maxW: 'max-w-sm' },
  { value: '16:9', label: '16:9 (Landscape Standard)', aspectClass: 'aspect-video', cssRatio: '16 / 9', maxW: 'max-w-4xl' },
];

export const getVideoAspectRatioConfig = (ratio = '4:5') => {
  const found = VIDEO_ASPECT_RATIO_OPTIONS.find((opt) => opt.value === ratio);
  return found || VIDEO_ASPECT_RATIO_OPTIONS[0];
};

/**
 * Extracts YouTube video ID from various URL patterns:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://m.youtube.com/watch?feature=share&v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube-nocookie.com/embed/VIDEO_ID
 * - Case-insensitive domain and query parameter ordering
 */
export const extractYouTubeId = (url = '') => {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();

  // If already a clean 11-character YouTube video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  const regExp = /(?:(?:www\.|m\.)?youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
  const match = trimmed.match(regExp);

  if (match && match[1]) {
    return match[1];
  }

  return null;
};

/**
 * Generates privacy-friendly YouTube embed URL using youtube-nocookie.com
 */
export const getYouTubeEmbedUrl = (videoId, { autoplay = 1, start = 0 } = {}) => {
  if (!videoId) return '';
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    enablejsapi: '1',
    rel: '0',
    modestbranding: '1',
  });
  if (start > 0) {
    params.set('start', String(Math.floor(start)));
  }
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
};

/**
 * Gets YouTube video poster thumbnail with fallbacks (maxresdefault by default for crisp CWV poster, hqdefault fallback)
 */
export const getYouTubeThumbnail = (videoId, customThumbnailUrl = null, quality = 'maxres') => {
  if (customThumbnailUrl && customThumbnailUrl.trim()) {
    return customThumbnailUrl.trim();
  }
  if (!videoId) return '';
  const file = quality === 'maxres' ? 'maxresdefault.jpg' : 'hqdefault.jpg';
  return `https://i.ytimg.com/vi/${videoId}/${file}`;
};

/**
 * Formats seconds into human-readable duration (e.g. 165 -> "2:45", 3665 -> "1:01:05")
 */
export const formatDurationDisplay = (totalSeconds) => {
  const secNum = Number(totalSeconds);
  if (!Number.isFinite(secNum) || secNum < 0) return '0:00';

  const hours = Math.floor(secNum / 3600);
  const minutes = Math.floor((secNum % 3600) / 60);
  const seconds = Math.floor(secNum % 60);

  const paddedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

  if (hours > 0) {
    const paddedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${hours}:${paddedMinutes}:${paddedSeconds}`;
  }

  return `${minutes}:${paddedSeconds}`;
};

/**
 * Formats seconds into ISO 8601 duration string for Schema.org (e.g. 165 -> "PT2M45S")
 */
export const formatDurationIso = (totalSeconds) => {
  const secNum = Number(totalSeconds);
  if (!Number.isFinite(secNum) || secNum <= 0) return 'PT0S';

  const hours = Math.floor(secNum / 3600);
  const minutes = Math.floor((secNum % 3600) / 60);
  const seconds = Math.floor(secNum % 60);

  let result = 'PT';
  if (hours > 0) result += `${hours}H`;
  if (minutes > 0) result += `${minutes}M`;
  if (seconds > 0 || (hours === 0 && minutes === 0)) result += `${seconds}S`;

  return result;
};

/**
 * Parses user duration input (e.g. "2:45", "165", "1:05:00", "1m30s", "45s") into seconds integer
 */
export const parseDurationInput = (input) => {
  if (input === null || input === undefined) return 0;
  if (typeof input === 'number') return Math.max(0, Math.floor(input));

  const str = String(input).trim();
  if (!str) return 0;

  if (/^\d+$/.test(str)) {
    return parseInt(str, 10);
  }

  // Handle YouTube duration format e.g. "1h20m15s", "2m45s", "45s"
  const ytMatch = str.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (ytMatch && (ytMatch[1] || ytMatch[2] || ytMatch[3])) {
    const h = parseInt(ytMatch[1] || '0', 10);
    const m = parseInt(ytMatch[2] || '0', 10);
    const s = parseInt(ytMatch[3] || '0', 10);
    return h * 3600 + m * 60 + s;
  }

  const parts = str.split(':').map((part) => parseInt(part, 10));
  if (parts.some((p) => Number.isNaN(p))) return 0;

  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  return 0;
};

/**
 * Generates an SEO-optimized slug for spoke pages: /testimonials/[slug]
 */
export const generateTestimonialSlug = (name = '', condition = '', service = '') => {
  const parts = [name, condition, service, 'nexus-review']
    .filter(Boolean)
    .join(' ');

  return parts
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
};

/**
 * Generates Schema.org VideoObject structured data with Google Key Moments (hasPart: Clip)
 */
export const generateVideoStructuredData = ({
  testimonial,
  siteUrl = 'https://www.militarydisabilitynexus.com',
}) => {
  if (!testimonial || !testimonial.video_url) return null;

  const videoId = extractYouTubeId(testimonial.video_url);
  const spokeUrl = testimonial.slug ? `${siteUrl}/testimonials/${testimonial.slug}` : `${siteUrl}/testimonials`;
  const fallbackThumb = `${siteUrl}/android-chrome-512x512.png`;
  let resolvedThumb = testimonial.video_thumbnail_url?.trim() || (videoId ? getYouTubeThumbnail(videoId) : null);
  if (!resolvedThumb) {
    resolvedThumb = fallbackThumb;
  } else if (!resolvedThumb.startsWith('http://') && !resolvedThumb.startsWith('https://')) {
    resolvedThumb = `${siteUrl}${resolvedThumb.startsWith('/') ? '' : '/'}${resolvedThumb}`;
  }
  const thumbnailUrl = resolvedThumb;

  let uploadDateIso;
  try {
    const parsedDate = testimonial.created_at ? new Date(testimonial.created_at) : new Date();
    uploadDateIso = !Number.isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : new Date().toISOString();
  } catch {
    uploadDateIso = new Date().toISOString();
  }

  const totalDuration = Number(testimonial.video_duration);
  const durationIso = (Number.isFinite(totalDuration) && totalDuration > 0)
    ? formatDurationIso(totalDuration)
    : 'PT2M';

  const veteranName = testimonial.name?.trim() || 'Veteran';

  const title = testimonial.condition_tag
    ? `${veteranName} - ${testimonial.condition_tag} VA Disability Nexus Letter Review`
    : `${veteranName}'s Military Disability Nexus Letter Review`;

  const description = testimonial.feedback
    ? shortenFeedback(testimonial.feedback, 300)
    : `Veteran testimonial from ${veteranName} regarding their VA disability claim and independent medical opinion experience.`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: title,
    description: description,
    thumbnailUrl: [thumbnailUrl],
    uploadDate: uploadDateIso,
    duration: durationIso,
    publisher: {
      '@type': 'Organization',
      name: 'Military Disability Nexus',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    author: {
      '@type': 'Person',
      name: veteranName,
    },
  };

  let resolvedContentUrl = testimonial.video_url?.trim() || '';
  if (resolvedContentUrl && !resolvedContentUrl.startsWith('http://') && !resolvedContentUrl.startsWith('https://')) {
    resolvedContentUrl = `${siteUrl}${resolvedContentUrl.startsWith('/') ? '' : '/'}${resolvedContentUrl}`;
  }

  // Google Video Search Central gold standard:
  // - contentUrl: Required for direct media files (.mp4, .webm, or Supabase Storage public files).
  // - embedUrl: Omitted for direct media / Supabase files (or when video_provider is html5).
  const isDirectMedia = Boolean(
    testimonial.video_provider === 'html5' ||
    !videoId ||
    /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(resolvedContentUrl) ||
    resolvedContentUrl.includes('/storage/')
  );

  if (!isDirectMedia && testimonial.video_provider !== 'html5' && videoId) {
    schema.embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;
  } else if (resolvedContentUrl) {
    schema.contentUrl = resolvedContentUrl;
  }

  // Google Key Moments (hasPart: Clip)
  if (Array.isArray(testimonial.video_key_moments) && testimonial.video_key_moments.length > 0) {
    const validClips = testimonial.video_key_moments
      .filter((m) => m && typeof m === 'object')
      .map((moment, index) => {
        const start = Math.max(0, Number(moment.startOffset) || 0);
        const nextMoment = testimonial.video_key_moments[index + 1];
        let end = moment.endOffset !== undefined && moment.endOffset !== null && moment.endOffset !== ''
          ? Number(moment.endOffset)
          : (nextMoment ? Number(nextMoment.startOffset) : (totalDuration > 0 ? totalDuration : start + 30));

        // Google requirement: endOffset must be strictly greater than startOffset
        if (!Number.isFinite(end) || end <= start) {
          end = start + 30;
        }

        // Clip endOffset cannot exceed total video duration in Google Video Schema
        if (Number.isFinite(totalDuration) && totalDuration > 0 && end > totalDuration) {
          end = totalDuration;
        }

        // If end got clamped to <= start because start was near end, ensure at least 1s difference
        if (end <= start) {
          end = start + 1;
        }

        const clipName = moment.name && typeof moment.name === 'string' && moment.name.trim()
          ? moment.name.trim()
          : `Moment ${index + 1}`;

        return {
          '@type': 'Clip',
          name: clipName,
          startOffset: start,
          endOffset: end,
          url: `${spokeUrl}?t=${start}`,
        };
      });

    if (validClips.length > 0) {
      schema.hasPart = validClips;
    }
  }

  return schema;
};

// ============================================
// Direct Video & Poster Media Upload Utilities
// ============================================

export const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/ogg',
  'video/x-m4v',
];
export const ALLOWED_VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.ogg', '.m4v'];

export const MAX_POSTER_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_POSTER_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
];
export const ALLOWED_POSTER_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

/**
 * Validates a video file for size (<= 100MB) and format (MP4, WebM, MOV)
 */
export const validateVideoFile = (file) => {
  const errors = [];
  if (!file) {
    return { valid: false, errors: ['No video file provided'] };
  }

  const name = (file.name || '').toLowerCase();
  const hasValidExt = ALLOWED_VIDEO_EXTENSIONS.some((ext) => name.endsWith(ext));
  const hasValidMime = ALLOWED_VIDEO_TYPES.includes(file.type);

  if (!hasValidMime && !hasValidExt) {
    errors.push('Invalid video format. Supported formats: MP4, WebM, QuickTime (MOV).');
  }

  if (file.size > MAX_VIDEO_SIZE) {
    errors.push(`Video exceeds 100MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validates a poster image file for size (<= 10MB) and format (JPG, PNG, WebP, AVIF)
 */
export const validatePosterFile = (file) => {
  const errors = [];
  if (!file) {
    return { valid: false, errors: ['No image file provided'] };
  }

  const name = (file.name || '').toLowerCase();
  const hasValidExt = ALLOWED_POSTER_EXTENSIONS.some((ext) => name.endsWith(ext));
  const hasValidMime = ALLOWED_POSTER_TYPES.includes(file.type);

  if (!hasValidMime && !hasValidExt) {
    errors.push('Invalid image format. Supported formats: JPG, PNG, WebP, AVIF.');
  }

  if (file.size > MAX_POSTER_SIZE) {
    errors.push(`Image exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Detects aspect ratio from width and height matching standard video options
 * Standard ratios: 9:16 (0.5625), 3:4 (0.75), 4:5 (0.80), 1:1 (1.00), 16:9 (1.777)
 */
export const detectAspectRatio = (width, height) => {
  if (!width || !height || width <= 0 || height <= 0) return '4:5';
  const ratio = width / height;
  if (ratio < 0.66) return '9:16';
  if (ratio < 0.775) return '3:4';
  if (ratio < 0.90) return '4:5';
  if (ratio < 1.38) return '1:1';
  return '16:9';
};

/**
 * Infers appropriate MIME type from file extension when browser file.type is blank
 */
export const inferMediaType = (filename = '', isVideo = true) => {
  const ext = (filename.split('.').pop() || '').toLowerCase();
  if (isVideo) {
    if (ext === 'webm') return 'video/webm';
    if (ext === 'mov') return 'video/quicktime';
    if (ext === 'ogg') return 'video/ogg';
    if (ext === 'm4v') return 'video/x-m4v';
    return 'video/mp4';
  } else {
    if (ext === 'png') return 'image/png';
    if (ext === 'webp') return 'image/webp';
    if (ext === 'avif') return 'image/avif';
    return 'image/jpeg';
  }
};

/**
 * Extracts video duration (seconds) and dimensions/aspect ratio in browser using HTML5 <video> element
 */
export const extractVideoMetadata = (file) => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !file) {
      resolve({ duration: 0, width: 0, height: 0, aspectRatio: '4:5' });
      return;
    }

    try {
      const video = document.createElement('video');
      video.preload = 'metadata';
      const objectUrl = URL.createObjectURL(file);
      video.src = objectUrl;

      let isResolved = false;
      let timeoutId = null;

      const cleanup = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        try {
          URL.revokeObjectURL(objectUrl);
        } catch {
          // ignore
        }
        video.onloadedmetadata = null;
        video.onerror = null;
      };

      const finish = (result) => {
        if (isResolved) return;
        isResolved = true;
        cleanup();
        resolve(result);
      };

      // 4-second safety timeout so metadata extraction never hangs if browser cannot decode
      timeoutId = setTimeout(() => {
        finish({ duration: 0, width: 0, height: 0, aspectRatio: '4:5' });
      }, 4000);

      video.onloadedmetadata = () => {
        const duration = Number.isFinite(video.duration) && video.duration > 0
          ? Math.round(video.duration)
          : 0;
        const width = video.videoWidth || 0;
        const height = video.videoHeight || 0;

        const detectedRatio = detectAspectRatio(width, height);

        finish({
          duration,
          width,
          height,
          aspectRatio: detectedRatio,
        });
      };

      video.onerror = () => {
        finish({ duration: 0, width: 0, height: 0, aspectRatio: '4:5' });
      };
    } catch {
      resolve({ duration: 0, width: 0, height: 0, aspectRatio: '4:5' });
    }
  });
};

/**
 * Uploads video or poster media directly to Supabase Storage bucket ('testimonials')
 * Supports real-time upload progress callback (0-100%) via XMLHttpRequest
 */
export const uploadTestimonialMedia = async ({ file, folder = 'videos', onProgress = null }) => {
  if (!file) throw new Error('No file provided for upload.');

  const isVideo = folder === 'videos' || file.type?.startsWith('video/');
  const validation = isVideo ? validateVideoFile(file) : validatePosterFile(file);
  if (!validation.valid) {
    throw new Error(validation.errors.join(' '));
  }

  const bucketName = STORAGE_BUCKETS?.TESTIMONIALS || 'testimonials';
  const cleanBaseName = file.name
    ? file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-+|-+$/g, '')
    : (isVideo ? 'video.mp4' : 'poster.jpg');
  const filePath = `${folder}/${Date.now()}-${cleanBaseName}`;

  // If onProgress callback is provided and XMLHttpRequest is available in the browser,
  // use XHR with Supabase storage REST endpoint for exact progress tracking
  if (typeof window !== 'undefined' && typeof XMLHttpRequest !== 'undefined' && onProgress) {
    try {
      const effectiveUrl = supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
      const effectiveAnonKey = supabaseAnonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

      if (effectiveUrl && effectiveAnonKey) {
        let token = effectiveAnonKey;
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session?.access_token) {
            token = sessionData.session.access_token;
          }
        } catch {
          // fallback to anon key
        }

        const uploadUrl = `${effectiveUrl.replace(/\/$/, '')}/storage/v1/object/${bucketName}/${filePath}`;

        const effectiveContentType = file.type || inferMediaType(file.name, isVideo);

        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', uploadUrl, true);
          xhr.setRequestHeader('apikey', effectiveAnonKey);
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          xhr.setRequestHeader('Content-Type', effectiveContentType);
          xhr.setRequestHeader('x-upsert', 'false');

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable && onProgress) {
              const percent = Math.min(100, Math.max(0, Math.round((event.loaded / event.total) * 100)));
              onProgress(percent);
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              if (onProgress) onProgress(100);
              resolve();
            } else {
              let msg = 'Upload failed';
              try {
                const res = JSON.parse(xhr.responseText);
                msg = res.message || res.error || msg;
              } catch {
                msg = xhr.statusText || msg;
              }
              reject(new Error(msg));
            }
          };

          xhr.onerror = () => reject(new Error('Network error during file upload.'));
          xhr.send(file);
        });

        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        return {
          url: publicUrl,
          path: filePath,
          success: true,
        };
      }
    } catch (xhrError) {
      console.warn('XHR progress upload fallback to standard supabase storage upload:', xhrError);
    }
  }

  // Fallback to supabase.storage.upload
  if (onProgress) onProgress(10);
  const effectiveContentType = file.type || inferMediaType(file.name, isVideo);
  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: effectiveContentType,
    });

  if (uploadError) throw uploadError;

  if (onProgress) onProgress(100);

  const { data: { publicUrl } } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return {
    url: publicUrl,
    path: filePath,
    success: true,
  };
};
