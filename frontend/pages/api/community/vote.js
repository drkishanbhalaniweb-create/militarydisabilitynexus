import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function parseCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? match[1] : null;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VALID_TARGET_TYPES = ['question', 'answer', 'comment'];
const VALID_VOTE_TYPES = ['upvote', 'downvote'];

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
      return res.status(401).json({ error: 'You must be logged in to vote.' });
    }

    // Validate input
    const { target_type, target_id, vote_type } = req.body || {};

    if (!target_type || !VALID_TARGET_TYPES.includes(target_type)) {
      return res
        .status(400)
        .json({ error: 'target_type must be one of: question, answer, comment.' });
    }
    if (!target_id || !UUID_RE.test(target_id)) {
      return res.status(400).json({ error: 'A valid target_id is required.' });
    }
    if (!vote_type || !VALID_VOTE_TYPES.includes(vote_type)) {
      return res
        .status(400)
        .json({ error: 'vote_type must be one of: upvote, downvote.' });
    }

    // Verify community user exists
    const { data: communityUser, error: userErr } = await supabaseAdmin
      .from('community_users')
      .select('id')
      .eq('id', communityUserId)
      .single();

    if (userErr || !communityUser) {
      return res.status(401).json({ error: 'Invalid community user session.' });
    }

    // Call the v2 RPC
    const { data: rpcResult, error: rpcErr } = await supabaseAdmin.rpc(
      'handle_community_vote_v2',
      {
        p_community_user_id: communityUserId,
        p_target_type: target_type,
        p_target_id: target_id,
        p_vote_type: vote_type,
      }
    );

    if (rpcErr) throw rpcErr;

    const result = {
      action: rpcResult?.action,
      vote_type: rpcResult?.vote_type,
      new_upvotes: rpcResult?.new_upvotes ?? 0,
      new_downvotes: rpcResult?.new_downvotes ?? 0,
    };

    // For questions, also return the updated hot_score
    if (target_type === 'question') {
      const { data: updatedQ } = await supabaseAdmin
        .from('community_questions')
        .select('hot_score')
        .eq('id', target_id)
        .single();

      result.hot_score = updatedQ?.hot_score ?? 0;
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error('[community/vote] Error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
