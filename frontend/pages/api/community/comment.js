import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ---------------------------------------------------------------------------
// Rate limiter: max 30 comments per hour per community_user_id
// ---------------------------------------------------------------------------
const rateLimitMap = new Map();
const RATE_WINDOW = 60 * 60 * 1000;
const RATE_MAX = 30;

function isRateLimited(userId) {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }
  if (now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }
  if (entry.count >= RATE_MAX) return true;
  entry.count += 1;
  return false;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').trim();
}

function parseCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? match[1] : null;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_DEPTH = 3;

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Auth via cookie
    const communityUserId = parseCookie(req.headers.cookie, 'community_user_id');
    if (!communityUserId) {
      return res.status(401).json({ error: 'You must be logged in to comment.' });
    }

    // Rate limit
    if (isRateLimited(communityUserId)) {
      return res.status(429).json({ error: 'You can post up to 30 comments per hour.' });
    }

    // Parse & validate
    const content = sanitize(req.body?.content || '');
    const answerId = req.body?.answer_id;
    const parentCommentId = req.body?.parent_comment_id || null;
    const isAnonymous = Boolean(req.body?.is_anonymous);

    if (!content || content.length < 1 || content.length > 2000) {
      return res
        .status(400)
        .json({ error: 'Comment content must be between 1 and 2,000 characters.' });
    }

    if (!answerId || !UUID_RE.test(answerId)) {
      return res.status(400).json({ error: 'A valid answer_id is required.' });
    }

    // Verify answer exists
    const { data: answer, error: aErr } = await supabaseAdmin
      .from('community_answers')
      .select('id')
      .eq('id', answerId)
      .single();

    if (aErr || !answer) {
      return res.status(404).json({ error: 'Answer not found.' });
    }

    // Calculate depth
    let depth = 0;
    if (parentCommentId) {
      if (!UUID_RE.test(parentCommentId)) {
        return res.status(400).json({ error: 'Invalid parent_comment_id.' });
      }

      const { data: parent, error: pErr } = await supabaseAdmin
        .from('community_comments')
        .select('id, depth')
        .eq('id', parentCommentId)
        .single();

      if (pErr || !parent) {
        return res.status(404).json({ error: 'Parent comment not found.' });
      }

      depth = parent.depth + 1;
      if (depth > MAX_DEPTH) {
        return res
          .status(400)
          .json({ error: `Maximum comment nesting depth is ${MAX_DEPTH}.` });
      }
    }

    // Verify community user
    const { data: communityUser, error: userErr } = await supabaseAdmin
      .from('community_users')
      .select('id, display_name')
      .eq('id', communityUserId)
      .single();

    if (userErr || !communityUser) {
      return res.status(401).json({ error: 'Invalid community user session.' });
    }

    // Insert comment
    const { data: comment, error: insertErr } = await supabaseAdmin
      .from('community_comments')
      .insert({
        answer_id: answerId,
        parent_comment_id: parentCommentId,
        community_user_id: communityUser.id,
        content,
        depth,
        is_anonymous: isAnonymous,
        status: 'published',
      })
      .select('*')
      .single();

    if (insertErr) throw insertErr;

    return res.status(201).json(comment);
  } catch (err) {
    console.error('[community/comment] Error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
