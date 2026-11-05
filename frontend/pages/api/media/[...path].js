export const config = {
  runtime: 'edge',
};

const SUPABASE_URL = (
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.REACT_APP_SUPABASE_URL ||
  'https://ehwejkvlreyokfarjjeu.supabase.co'
).replace(/\/$/, '');

/**
 * Next.js Edge Media Proxy for Public Supabase Storage
 * 
 * Purpose:
 * 1. Overcomes Supabase Storage's default 'x-robots-tag: none' header which blocks Google Video indexing.
 * 2. Provides first-party branded URLs (https://www.militarydisabilitynexus.com/media/...) for media assets.
 * 3. Enforces public edge caching for immutable assets, accelerating TTFB/LCP.
 * 4. Supports HTTP Range requests for seamless video streaming and seeking.
 */
export default async function handler(req) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const url = new URL(req.url);
  // Match path after /api/media/ or /media/
  const match = url.pathname.match(/(?:\/api)?\/media\/(.+)$/);
  if (!match || !match[1]) {
    return new Response('Media path missing', { status: 400 });
  }

  const relativePath = match[1];

  // Prevent path traversal
  if (relativePath.includes('..') || relativePath.includes('\\')) {
    return new Response('Invalid path', { status: 400 });
  }

  const targetUrl = `${SUPABASE_URL}/storage/v1/object/public/${relativePath}`;

  // Forward critical client request headers (e.g. Range, If-None-Match)
  const forwardHeaders = new Headers();
  const range = req.headers.get('range');
  if (range) {
    forwardHeaders.set('range', range);
  }
  const ifNoneMatch = req.headers.get('if-none-match');
  if (ifNoneMatch) {
    forwardHeaders.set('if-none-match', ifNoneMatch);
  }

  try {
    const upstreamResponse = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
    });

    if (!upstreamResponse.ok && upstreamResponse.status !== 304 && upstreamResponse.status !== 206) {
      return new Response(upstreamResponse.body, {
        status: upstreamResponse.status,
        headers: {
          'Content-Type': upstreamResponse.headers.get('content-type') || 'text/plain',
        },
      });
    }

    const responseHeaders = new Headers(upstreamResponse.headers);

    // CRITICAL: Eradicate x-robots-tag to allow Google to index videos and poster images
    responseHeaders.delete('x-robots-tag');
    responseHeaders.delete('X-Robots-Tag');

    // Edge Caching: Allow public edge and CDN caching for immutable media objects
    responseHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');

    // CORS: Allow embedding from any origin
    responseHeaders.set('Access-Control-Allow-Origin', '*');

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  } catch {
    return new Response('Media Proxy Error', { status: 502 });
  }
}
