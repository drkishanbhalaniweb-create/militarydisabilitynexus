import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const perPage = Math.min(50, Math.max(1, parseInt(req.query.per_page, 10) || 25));
    const sort = ['hot', 'new', 'top', 'unanswered'].includes(req.query.sort)
      ? req.query.sort
      : 'hot';
    const tag = typeof req.query.tag === 'string' ? req.query.tag.trim() : '';
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

    // ---- Build query ----
    let query = supabaseAdmin
      .from('community_questions')
      .select(
        '*, community_user:community_users(id, display_name, avatar_color, is_verified, role)',
        { count: 'exact' }
      )
      .eq('status', 'published');

    // Tag filter
    if (tag) {
      query = query.contains('tags', [tag]);
    }

    // Search filter
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,content.ilike.%${search}%`
      );
    }

    // Sort
    switch (sort) {
      case 'hot':
        query = query.order('hot_score', { ascending: false });
        break;
      case 'new':
        query = query.order('created_at', { ascending: false });
        break;
      case 'top':
        query = query.order('upvotes', { ascending: false });
        break;
      case 'unanswered':
        query = query.eq('answers_count', 0).order('created_at', { ascending: false });
        break;
    }

    // Pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);

    const { data: questions, count: total, error } = await query;
    if (error) throw error;

    const totalPages = Math.ceil((total || 0) / perPage);

    return res.status(200).json({
      questions: questions || [],
      total: total || 0,
      page,
      totalPages,
      perPage,
    });
  } catch (err) {
    console.error('[community/questions] Error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
