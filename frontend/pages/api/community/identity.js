import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ---------------------------------------------------------------------------
// Simple in-memory rate limiter (max 10 identity creations per IP per hour)
// ---------------------------------------------------------------------------
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 10;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }
  if (now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }
  if (entry.count >= RATE_LIMIT_MAX) return true;
  entry.count += 1;
  return false;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').trim();
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Rate limiting by IP
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      'unknown';
    if (isRateLimited(ip)) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    // Validate input
    const email = sanitize(req.body?.email || '').toLowerCase();
    const displayName = sanitize(req.body?.display_name || '');

    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }
    if (!displayName || displayName.length < 1 || displayName.length > 50) {
      return res
        .status(400)
        .json({ error: 'Display name must be between 1 and 50 characters.' });
    }

    // Check for existing community_user by email
    const { data: existing, error: lookupErr } = await supabaseAdmin
      .from('community_users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (lookupErr) throw lookupErr;

    let communityUser = existing;

    if (!communityUser) {
      // Check if a Supabase Auth user exists with this email
      let supabaseUserId = null;
      let isVerified = false;

      // Check if a Supabase Auth user exists with this email
      try {
        const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers({
          page: 1,
          perPage: 50,
        });
        const matchingUser = authUsers?.users?.find(
          (u) => u.email?.toLowerCase() === email
        );
        if (matchingUser) {
          supabaseUserId = matchingUser.id;
          isVerified = true;
        }
      } catch {
        // Auth lookup is best-effort; proceed without linking
      }

      // Create new community_user
      const { data: newUser, error: insertErr } = await supabaseAdmin
        .from('community_users')
        .insert({
          email,
          display_name: displayName,
          supabase_user_id: supabaseUserId,
          is_verified: isVerified,
        })
        .select('*')
        .single();

      if (insertErr) {
        // Handle race condition: another request created the user first
        if (insertErr.code === '23505') {
          const { data: raceUser } = await supabaseAdmin
            .from('community_users')
            .select('*')
            .eq('email', email)
            .single();
          communityUser = raceUser;
        } else {
          throw insertErr;
        }
      } else {
        communityUser = newUser;
      }
    }

    if (!communityUser) {
      return res.status(500).json({ error: 'Failed to create or retrieve community user.' });
    }

    // Set httpOnly cookie
    const maxAge = 30 * 24 * 60 * 60; // 30 days in seconds
    res.setHeader(
      'Set-Cookie',
      `community_user_id=${communityUser.id}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax`
    );

    return res.status(200).json({
      id: communityUser.id,
      display_name: communityUser.display_name,
      email: communityUser.email,
      avatar_color: communityUser.avatar_color,
      is_verified: communityUser.is_verified,
      role: communityUser.role,
    });
  } catch (err) {
    console.error('[community/identity] Error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
