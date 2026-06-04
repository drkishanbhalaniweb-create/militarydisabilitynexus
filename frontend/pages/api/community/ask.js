import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const AVAILABLE_TAGS = [
  'Nexus Letter', '1151 Claim', 'Aid & Attendance/SMC', 'Primary Connection',
  'Secondary Connection', 'Migraine/Headaches', 'Tinnitus', 'Obstructive Sleep Apnea',
  'IBS', 'GERD', 'PACT Act', 'Mental Health', 'Orthopedic/Chronic Pain',
  'Evidence & Documentation', 'C&P Exam', 'Heart Condition/Hypertension',
  'Kidney Claims', 'Cancer', 'Others',
];

const DUMMY_USER_ID = '00000000-0000-0000-0000-000000000000';

// ---------------------------------------------------------------------------
// Rate limiter: max 5 questions per hour per community_user_id
// ---------------------------------------------------------------------------
const rateLimitMap = new Map();
const RATE_WINDOW = 60 * 60 * 1000;
const RATE_MAX = 5;

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

function wordCount(text) {
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
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
    // Auth via cookie
    const communityUserId = parseCookie(req.headers.cookie, 'community_user_id');
    if (!communityUserId) {
      return res.status(401).json({ error: 'You must be logged in to ask a question.' });
    }

    // Rate limit
    if (isRateLimited(communityUserId)) {
      return res.status(429).json({ error: 'You can ask up to 5 questions per hour.' });
    }

    // Parse & validate input
    const title = sanitize(req.body?.title || '');
    const content = sanitize(req.body?.content || '');
    const isAnonymous = Boolean(req.body?.is_anonymous);
    let tags = req.body?.tags;

    if (!title || title.length < 10 || title.length > 200) {
      return res
        .status(400)
        .json({ error: 'Title must be between 10 and 200 characters.' });
    }

    if (content && wordCount(content) > 200) {
      return res
        .status(400)
        .json({ error: 'Content must not exceed 200 words.' });
    }

    // Validate tags
    if (!Array.isArray(tags)) tags = [];
    tags = tags.filter((t) => AVAILABLE_TAGS.includes(t));

    // Fetch community user
    const { data: communityUser, error: userErr } = await supabaseAdmin
      .from('community_users')
      .select('*')
      .eq('id', communityUserId)
      .single();

    if (userErr || !communityUser) {
      return res.status(401).json({ error: 'Invalid community user session.' });
    }

    // Insert question
    const { data: question, error: insertErr } = await supabaseAdmin
      .from('community_questions')
      .insert({
        community_user_id: communityUser.id,
        user_id: communityUser.supabase_user_id || DUMMY_USER_ID,
        title,
        content: content || '',
        display_name: isAnonymous ? 'Anonymous' : communityUser.display_name,
        user_email: communityUser.email,
        is_anonymous: isAnonymous,
        tags,
        status: 'published',
        hot_score: 0, // will be recalculated by trigger on first update
      })
      .select('*')
      .single();

    if (insertErr) throw insertErr;

    // Set initial hot_score (trigger only fires on UPDATE, so calculate manually)
    const initialHotScore = 0 / Math.pow(2, 1.5); // score=0, hours_age~0 → 0
    await supabaseAdmin
      .from('community_questions')
      .update({ hot_score: initialHotScore })
      .eq('id', question.id);

    // Increment community_user.questions_count
    await supabaseAdmin
      .from('community_users')
      .update({ questions_count: communityUser.questions_count + 1 })
      .eq('id', communityUser.id);

    return res.status(201).json(question);
  } catch (err) {
    console.error('[community/ask] Error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
