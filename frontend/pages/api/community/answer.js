import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ---------------------------------------------------------------------------
// Rate limiter: max 20 answers per hour per community_user_id
// ---------------------------------------------------------------------------
const rateLimitMap = new Map();
const RATE_WINDOW = 60 * 60 * 1000;
const RATE_MAX = 20;

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
      return res.status(401).json({ error: 'You must be logged in to answer.' });
    }

    // Rate limit
    if (isRateLimited(communityUserId)) {
      return res.status(429).json({ error: 'You can submit up to 20 answers per hour.' });
    }

    // Parse & validate
    const content = sanitize(req.body?.content || '');
    const questionId = req.body?.question_id;
    const isAnonymous = Boolean(req.body?.is_anonymous);

    if (!content || content.length < 1 || content.length > 5000) {
      return res
        .status(400)
        .json({ error: 'Answer content must be between 1 and 5,000 characters.' });
    }

    if (!questionId || !UUID_RE.test(questionId)) {
      return res.status(400).json({ error: 'A valid question_id is required.' });
    }

    // Check question exists and is published
    const { data: question, error: qErr } = await supabaseAdmin
      .from('community_questions')
      .select('id, status')
      .eq('id', questionId)
      .single();

    if (qErr || !question) {
      return res.status(404).json({ error: 'Question not found.' });
    }
    if (question.status !== 'published') {
      return res.status(400).json({ error: 'Cannot answer a non-published question.' });
    }

    // Fetch community user
    const { data: communityUser, error: userErr } = await supabaseAdmin
      .from('community_users')
      .select('*')
      .eq('id', communityUserId)
      .single();

    if (userErr || !communityUser) {
      return res.status(401).json({ error: 'Invalid community user session.' });
    }

    // Insert answer
    const { data: answer, error: insertErr } = await supabaseAdmin
      .from('community_answers')
      .insert({
        question_id: questionId,
        community_user_id: communityUser.id,
        user_id: communityUser.supabase_user_id || null,
        content,
        display_name: isAnonymous ? 'Anonymous' : communityUser.display_name,
        user_email: communityUser.email,
        is_anonymous: isAnonymous,
        status: 'published',
      })
      .select('*')
      .single();

    if (insertErr) throw insertErr;

    // Increment community_user.answers_count
    await supabaseAdmin
      .from('community_users')
      .update({ answers_count: communityUser.answers_count + 1 })
      .eq('id', communityUser.id);

    return res.status(201).json(answer);
  } catch (err) {
    console.error('[community/answer] Error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
