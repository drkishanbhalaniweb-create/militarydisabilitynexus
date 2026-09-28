import { describe, it, expect } from 'vitest';
import {
  extractYouTubeId,
  getYouTubeEmbedUrl,
  getYouTubeThumbnail,
  formatDurationDisplay,
  formatDurationIso,
  parseDurationInput,
  generateTestimonialSlug,
  getVideoAspectRatioConfig,
  detectAspectRatio,
  inferMediaType,
  generateVideoStructuredData,
  validateVideoFile,
  validatePosterFile,
} from '../../src/lib/testimonials';
import { testimonialApi } from '../../src/lib/api';

describe('Video Testimonials Utilities & SEO', () => {
  describe('extractYouTubeId', () => {
    it('extracts ID from standard watch URL', () => {
      expect(extractYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('extracts ID with extra query parameters', () => {
      expect(extractYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=45s&feature=share')).toBe('dQw4w9WgXcQ');
    });

    it('extracts ID from youtu.be short link', () => {
      expect(extractYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('extracts ID from YouTube Shorts URL', () => {
      expect(extractYouTubeId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
      expect(extractYouTubeId('https://youtube.com/shorts/dQw4w9WgXcQ?feature=share#t=30')).toBe('dQw4w9WgXcQ');
      expect(extractYouTubeId('https://www.youtube.com/shorts/dQw4w9WgXcQ/')).toBe('dQw4w9WgXcQ');
    });

    it('extracts ID from embed URL', () => {
      expect(extractYouTubeId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('extracts ID from privacy embed URL', () => {
      expect(extractYouTubeId('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('accepts a raw 11-char ID', () => {
      expect(extractYouTubeId('dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('handles uppercase and mixed-case YouTube URLs', () => {
      expect(extractYouTubeId('HTTPS://WWW.YOUTUBE.COM/WATCH?V=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
      expect(extractYouTubeId('https://m.youtube.com/watch?feature=share&v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('returns null for invalid inputs', () => {
      expect(extractYouTubeId(null)).toBeNull();
      expect(extractYouTubeId('')).toBeNull();
      expect(extractYouTubeId('https://vimeo.com/12345678')).toBeNull();
      expect(extractYouTubeId('invalid-string')).toBeNull();
    });
  });

  describe('Duration formatting and parsing', () => {
    it('formats duration for display', () => {
      expect(formatDurationDisplay(0)).toBe('0:00');
      expect(formatDurationDisplay(45)).toBe('0:45');
      expect(formatDurationDisplay(165)).toBe('2:45');
      expect(formatDurationDisplay(3665)).toBe('1:01:05');
      expect(formatDurationDisplay(-10)).toBe('0:00');
      expect(formatDurationDisplay(null)).toBe('0:00');
    });

    it('formats duration to ISO 8601 for Schema.org', () => {
      expect(formatDurationIso(45)).toBe('PT45S');
      expect(formatDurationIso(165)).toBe('PT2M45S');
      expect(formatDurationIso(3600)).toBe('PT1H');
      expect(formatDurationIso(3665)).toBe('PT1H1M5S');
      expect(formatDurationIso(0)).toBe('PT0S');
    });

    it('parses duration user inputs', () => {
      expect(parseDurationInput(165)).toBe(165);
      expect(parseDurationInput('165')).toBe(165);
      expect(parseDurationInput('2:45')).toBe(165);
      expect(parseDurationInput('1:01:05')).toBe(3665);
      expect(parseDurationInput('invalid')).toBe(0);
      expect(parseDurationInput(null)).toBe(0);
    });
  });

  describe('Aspect ratio configurations', () => {
    it('defaults to 4:5 squarish vertical', () => {
      const config = getVideoAspectRatioConfig('4:5');
      expect(config.aspectClass).toBe('aspect-[4/5]');
      expect(config.cssRatio).toBe('4 / 5');
      expect(config.maxW).toBe('max-w-md');
    });

    it('supports 1:1 square ratio', () => {
      const config = getVideoAspectRatioConfig('1:1');
      expect(config.aspectClass).toBe('aspect-square');
      expect(config.cssRatio).toBe('1 / 1');
    });

    it('supports 3:4 portrait ratio', () => {
      const config = getVideoAspectRatioConfig('3:4');
      expect(config.aspectClass).toBe('aspect-[3/4]');
      expect(config.cssRatio).toBe('3 / 4');
    });

    it('supports 9:16 reel ratio', () => {
      const config = getVideoAspectRatioConfig('9:16');
      expect(config.aspectClass).toBe('aspect-[9/16]');
    });

    it('supports 16:9 landscape ratio', () => {
      const config = getVideoAspectRatioConfig('16:9');
      expect(config.aspectClass).toBe('aspect-video');
    });

    it('falls back safely for unknown ratios', () => {
      const config = getVideoAspectRatioConfig('unknown');
      expect(config.value).toBe('4:5');
    });
  });

  describe('detectAspectRatio', () => {
    it('detects 9:16 for vertical reels (1080x1920)', () => {
      expect(detectAspectRatio(1080, 1920)).toBe('9:16');
    });

    it('detects 3:4 for portrait video (720x960)', () => {
      expect(detectAspectRatio(720, 960)).toBe('3:4');
    });

    it('detects 4:5 for squarish mobile recordings (1080x1350)', () => {
      expect(detectAspectRatio(1080, 1350)).toBe('4:5');
    });

    it('detects 1:1 for square video (1080x1080)', () => {
      expect(detectAspectRatio(1080, 1080)).toBe('1:1');
    });

    it('detects 16:9 for landscape widescreen (1920x1080)', () => {
      expect(detectAspectRatio(1920, 1080)).toBe('16:9');
    });

    it('defaults to 4:5 for invalid or zero dimensions', () => {
      expect(detectAspectRatio(0, 0)).toBe('4:5');
      expect(detectAspectRatio(-100, 200)).toBe('4:5');
      expect(detectAspectRatio(null, null)).toBe('4:5');
    });
  });

  describe('inferMediaType', () => {
    it('infers video MIME types from extensions', () => {
      expect(inferMediaType('clip.mp4', true)).toBe('video/mp4');
      expect(inferMediaType('clip.webm', true)).toBe('video/webm');
      expect(inferMediaType('clip.mov', true)).toBe('video/quicktime');
      expect(inferMediaType('clip.m4v', true)).toBe('video/x-m4v');
      expect(inferMediaType('clip.ogg', true)).toBe('video/ogg');
    });

    it('infers image MIME types from extensions', () => {
      expect(inferMediaType('thumb.png', false)).toBe('image/png');
      expect(inferMediaType('thumb.webp', false)).toBe('image/webp');
      expect(inferMediaType('thumb.avif', false)).toBe('image/avif');
      expect(inferMediaType('thumb.jpg', false)).toBe('image/jpeg');
      expect(inferMediaType('thumb.jpeg', false)).toBe('image/jpeg');
    });
  });

  describe('Embed URL and thumbnails', () => {
    it('generates privacy-friendly youtube-nocookie embed URL', () => {
      const url = getYouTubeEmbedUrl('dQw4w9WgXcQ', { autoplay: true, start: 30 });
      expect(url).toContain('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
      expect(url).toContain('autoplay=1');
      expect(url).toContain('start=30');
      expect(url).toContain('enablejsapi=1');
    });

    it('resolves thumbnail with fallbacks', () => {
      expect(getYouTubeThumbnail('dQw4w9WgXcQ')).toBe('https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg');
      expect(getYouTubeThumbnail('dQw4w9WgXcQ', null, 'hq')).toBe('https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
      expect(getYouTubeThumbnail('dQw4w9WgXcQ', 'https://example.com/custom.jpg')).toBe('https://example.com/custom.jpg');
      expect(getYouTubeThumbnail(null)).toBe('');
    });
  });

  describe('Slug generation', () => {
    it('creates clean SEO slugs from name, condition, and service', () => {
      const slug = generateTestimonialSlug('Marcus Vance', 'Sleep Apnea Secondary to PTSD');
      expect(slug).toBe('marcus-vance-sleep-apnea-secondary-to-ptsd-nexus-review');
    });

    it('handles special characters and extra spaces', () => {
      const slug = generateTestimonialSlug('John O\'Connor & Son!', 'C&P Exam Coaching');
      expect(slug).toBe('john-o-connor-son-c-p-exam-coaching-nexus-review');
    });
  });

  describe('VideoObject Schema with Google Key Moments', () => {
    it('generates full schema with Clip array for Key Moments', () => {
      const testimonial = {
        name: 'Sgt. Miller',
        branch: 'US Army',
        rating: 5,
        feedback: 'Dr. Bhalani provided a comprehensive nexus letter that won my claim.',
        slug: 'sgt-miller-sleep-apnea-review',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        video_duration: 180,
        condition_tag: 'Sleep Apnea',
        video_key_moments: [
          { name: 'Introduction', startOffset: 0, endOffset: 30 },
          { name: 'VA Denial History', startOffset: 30, endOffset: 90 },
          { name: 'Dr. Bhalani Medical Opinion', startOffset: 90, endOffset: 180 },
        ],
      };

      const schema = generateVideoStructuredData({ testimonial });
      expect(schema['@type']).toBe('VideoObject');
      expect(schema.name).toBe('Sgt. Miller - Sleep Apnea VA Disability Nexus Letter Review');
      expect(schema.duration).toBe('PT3M');
      expect(schema.embedUrl).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
      expect(schema.contentUrl).toBeUndefined(); // Should omit contentUrl for YouTube per Google Search Console guidelines
      expect(schema.hasPart).toHaveLength(3);
      expect(schema.hasPart[0]['@type']).toBe('Clip');
      expect(schema.hasPart[0].name).toBe('Introduction');
      expect(schema.hasPart[0].startOffset).toBe(0);
      expect(schema.hasPart[0].url).toContain('?t=0');
    });

    it('clamps Clip endOffset so it does not exceed total video duration', () => {
      const testimonial = {
        name: 'Sgt. Miller',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        video_duration: 100,
        video_key_moments: [
          { name: 'Closing Remarks', startOffset: 90, endOffset: 120 },
        ],
      };

      const schema = generateVideoStructuredData({ testimonial });
      expect(schema.hasPart[0].startOffset).toBe(90);
      expect(schema.hasPart[0].endOffset).toBe(100);
    });

    it('falls back safely to PT2M when video duration is 0 or negative', () => {
      const testimonial = {
        name: 'Sgt. Miller',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        video_duration: 0,
      };

      const schema = generateVideoStructuredData({ testimonial });
      expect(schema.duration).toBe('PT2M');
    });

    it('sets contentUrl when video is a direct media file and embedUrl otherwise', () => {
      const directMediaTestimonial = {
        name: 'Direct Media Veteran',
        video_url: 'https://example.supabase.co/storage/v1/object/public/testimonials/review.mp4',
      };
      const schema = generateVideoStructuredData({ testimonial: directMediaTestimonial });
      expect(schema.contentUrl).toBe('https://example.supabase.co/storage/v1/object/public/testimonials/review.mp4');
      expect(schema.embedUrl).toBeUndefined();
    });

    it('forces contentUrl and omits embedUrl when video_provider is html5', () => {
      const html5Testimonial = {
        name: 'HTML5 Veteran',
        video_url: 'https://example.supabase.co/storage/v1/object/public/testimonials/veteran.mp4',
        video_provider: 'html5',
      };
      const schema = generateVideoStructuredData({ testimonial: html5Testimonial });
      expect(schema.contentUrl).toBe('https://example.supabase.co/storage/v1/object/public/testimonials/veteran.mp4');
      expect(schema.embedUrl).toBeUndefined();
    });

    it('resolves relative video_thumbnail_url to fully qualified absolute URL', () => {
      const relativeThumbTestimonial = {
        name: 'Thumb Veteran',
        video_url: 'https://example.supabase.co/storage/v1/object/public/testimonials/veteran.mp4',
        video_thumbnail_url: '/images/veteran-poster.webp',
      };
      const schema = generateVideoStructuredData({
        testimonial: relativeThumbTestimonial,
        siteUrl: 'https://www.militarydisabilitynexus.com',
      });
      expect(schema.thumbnailUrl[0]).toBe('https://www.militarydisabilitynexus.com/images/veteran-poster.webp');
    });

    it('resolves relative video_url to fully qualified absolute contentUrl', () => {
      const relativeVideoTestimonial = {
        name: 'Relative Video Veteran',
        video_url: '/storage/v1/object/public/testimonials/veteran.mp4',
        video_provider: 'html5',
      };
      const schema = generateVideoStructuredData({
        testimonial: relativeVideoTestimonial,
        siteUrl: 'https://www.militarydisabilitynexus.com',
      });
      expect(schema.contentUrl).toBe('https://www.militarydisabilitynexus.com/storage/v1/object/public/testimonials/veteran.mp4');
      expect(schema.embedUrl).toBeUndefined();
    });
  });

  describe('testimonialApi.normalize video properties', () => {
    it('normalizes video properties and stringified key moments', () => {
      const raw = {
        id: '123',
        name: 'Jane Doe',
        video_url: 'https://youtu.be/dQw4w9WgXcQ',
        video_aspect_ratio: '4:5',
        video_key_moments: JSON.stringify([{ name: 'Moment 1', startOffset: 10, endOffset: 25 }]),
        video_duration: '145',
        claim_outcome: 'Granted 50%',
      };

      const normalized = testimonialApi.normalize(raw);
      expect(normalized.video_url).toBe('https://youtu.be/dQw4w9WgXcQ');
      expect(normalized.video_aspect_ratio).toBe('4:5');
      expect(normalized.video_duration).toBe(145);
      expect(normalized.video_key_moments).toEqual([
        { name: 'Moment 1', startOffset: 10, endOffset: 25 },
      ]);
      expect(normalized.claim_outcome).toBe('Granted 50%');
    });

    it('parses duration strings like "2:45" and sanitizes key moments', () => {
      const raw = {
        id: '456',
        name: 'John Veteran',
        video_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        video_duration: '2:45',
        video_key_moments: [
          { name: 'Out of Order', startOffset: 60, endOffset: 90 },
          { name: '  ', startOffset: 10, endOffset: 30 }, // empty name should be filtered
          { name: 'First Moment', startOffset: 0, endOffset: 30 },
        ],
      };

      const normalized = testimonialApi.normalize(raw);
      expect(normalized.video_duration).toBe(165);
      expect(normalized.video_key_moments).toHaveLength(2);
      expect(normalized.video_key_moments[0].name).toBe('First Moment');
      expect(normalized.video_key_moments[1].name).toBe('Out of Order');
    });

    it('defaults video_provider to html5', () => {
      const raw = {
        id: '789',
        name: 'Direct Media Veteran',
        video_url: 'https://example.supabase.co/storage/v1/object/public/testimonials/test.mp4',
      };

      const normalized = testimonialApi.normalize(raw);
      expect(normalized.video_provider).toBe('html5');
    });
  });

  describe('Direct Video Media File Validation', () => {
    it('validates valid MP4 video files within 100MB limit', () => {
      const mockFile = {
        name: 'veteran-nexus-review.mp4',
        type: 'video/mp4',
        size: 25 * 1024 * 1024, // 25MB
      };
      const result = validateVideoFile(mockFile);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('validates valid WebM and QuickTime MOV files', () => {
      const webmFile = { name: 'review.webm', type: 'video/webm', size: 10 * 1024 * 1024 };
      expect(validateVideoFile(webmFile).valid).toBe(true);

      const movFile = { name: 'review.mov', type: 'video/quicktime', size: 50 * 1024 * 1024 };
      expect(validateVideoFile(movFile).valid).toBe(true);

      const m4vFile = { name: 'review.m4v', type: 'video/x-m4v', size: 15 * 1024 * 1024 };
      expect(validateVideoFile(m4vFile).valid).toBe(true);
    });

    it('rejects video files exceeding 100MB', () => {
      const oversizedFile = {
        name: 'huge-recording.mp4',
        type: 'video/mp4',
        size: 105 * 1024 * 1024, // 105MB
      };
      const result = validateVideoFile(oversizedFile);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('exceeds 100MB limit');
    });

    it('rejects invalid file formats', () => {
      const invalidFile = {
        name: 'document.pdf',
        type: 'application/pdf',
        size: 2 * 1024 * 1024,
      };
      const result = validateVideoFile(invalidFile);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Invalid video format');
    });

    it('handles null or missing file', () => {
      expect(validateVideoFile(null).valid).toBe(false);
    });
  });

  describe('Direct Poster Image File Validation', () => {
    it('validates valid JPG, PNG, and WebP poster images within 10MB', () => {
      const jpg = { name: 'poster.jpg', type: 'image/jpeg', size: 2 * 1024 * 1024 };
      expect(validatePosterFile(jpg).valid).toBe(true);

      const png = { name: 'poster.png', type: 'image/png', size: 3 * 1024 * 1024 };
      expect(validatePosterFile(png).valid).toBe(true);

      const webp = { name: 'poster.webp', type: 'image/webp', size: 1 * 1024 * 1024 };
      expect(validatePosterFile(webp).valid).toBe(true);
    });

    it('rejects poster images exceeding 10MB limit', () => {
      const oversizedImage = {
        name: 'huge-poster.jpg',
        type: 'image/jpeg',
        size: 12 * 1024 * 1024, // 12MB
      };
      const result = validatePosterFile(oversizedImage);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('exceeds 10MB limit');
    });

    it('rejects non-image formats for poster', () => {
      const invalid = { name: 'script.js', type: 'application/javascript', size: 500 };
      expect(validatePosterFile(invalid).valid).toBe(false);
    });
  });
});
