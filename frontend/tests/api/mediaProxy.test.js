import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import handler from '../../pages/api/media/[...path]';

describe('Media Edge Proxy (/api/media/[...path])', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('rejects unsupported HTTP methods with 405 Method Not Allowed', async () => {
    const req = new Request('https://www.militarydisabilitynexus.com/api/media/testimonials/video.mp4', {
      method: 'POST',
    });
    const res = await handler(req);
    expect(res.status).toBe(405);
  });

  it('rejects path traversal attempts with 400', async () => {
    const req = new Request('https://www.militarydisabilitynexus.com/api/media/../secret.env', {
      method: 'GET',
    });
    const res = await handler(req);
    expect(res.status).toBe(400);
  });

  it('proxies upstream Supabase media, strips x-robots-tag, and applies public caching', async () => {
    const mockUpstreamHeaders = new Headers({
      'content-type': 'video/mp4',
      'content-length': '1024',
      'x-robots-tag': 'none',
      'cache-control': 'private, no-cache',
    });

    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response('fake video chunk bytes', {
        status: 200,
        headers: mockUpstreamHeaders,
      })
    );

    const req = new Request(
      'https://www.militarydisabilitynexus.com/media/testimonials/videos/test.mp4',
      {
        method: 'GET',
        headers: {
          range: 'bytes=0-1023',
        },
      }
    );

    const res = await handler(req);

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const calledUrl = globalThis.fetch.mock.calls[0][0];
    expect(calledUrl).toContain('/storage/v1/object/public/testimonials/videos/test.mp4');

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('video/mp4');

    // VERIFY CRITICAL SEO REQUIREMENT: x-robots-tag must be completely deleted
    expect(res.headers.get('x-robots-tag')).toBeNull();
    expect(res.headers.get('X-Robots-Tag')).toBeNull();

    // VERIFY EDGE CACHE REQUIREMENT: immutable public cache
    expect(res.headers.get('cache-control')).toBe('public, max-age=31536000, immutable');
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
  });

  it('supports HEAD requests without crashing', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(null, {
        status: 200,
        headers: new Headers({
          'content-type': 'image/jpeg',
          'x-robots-tag': 'none',
        }),
      })
    );

    const req = new Request(
      'https://www.militarydisabilitynexus.com/api/media/testimonials/posters/test.jpg',
      {
        method: 'HEAD',
      }
    );

    const res = await handler(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('x-robots-tag')).toBeNull();
  });
});
