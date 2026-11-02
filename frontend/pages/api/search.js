import { supabase } from '../../src/lib/supabase';

/**
 * Sanitizes user search input to prevent PostgREST syntax errors.
 * PostgREST uses [,()\"';{}] as logic tree and AST parser delimiters in .or(...) filters.
 *
 * @param {string} raw - Raw search query from request
 * @returns {string} Sanitized search string
 */
export function sanitizeQuery(raw) {
  if (typeof raw !== 'string') return '';
  let sanitized = '';
  for (let i = 0; i < raw.length; i += 1) {
    const code = raw.charCodeAt(i);
    if ((code >= 32 && code !== 127) || code === 9 || code === 10 || code === 13) {
      sanitized += raw[i];
    } else {
      sanitized += ' ';
    }
  }
  return sanitized
    .replace(/[,()"'\\;[\]{}]/g, ' ')
    .replace(/[%_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Clamps limit integer between min and max bounds.
 *
 * @param {any} limit - Raw limit input
 * @param {number} defaultLimit - Default limit if invalid
 * @param {number} min - Minimum allowed limit
 * @param {number} max - Maximum allowed limit
 * @returns {number} Clamped integer
 */
export function clampLimit(limit, defaultLimit = 5, min = 1, max = 20) {
  const parsed = parseInt(limit, 10);
  if (Number.isNaN(parsed)) return defaultLimit;
  return Math.max(min, Math.min(max, parsed));
}

/**
 * Category aliases to canonical category keys.
 */
const CATEGORY_MAP = {
  conditions: 'conditions',
  condition: 'conditions',
  services: 'services',
  service: 'services',
  blog: 'blog_posts',
  blog_posts: 'blog_posts',
  posts: 'blog_posts',
  articles: 'blog_posts',
  community: 'community_questions',
  community_questions: 'community_questions',
  qa: 'community_questions',
  questions: 'community_questions',
  case_studies: 'case_studies',
  case_study: 'case_studies',
  cases: 'case_studies',
};

/**
 * Default empty results container.
 */
function createEmptyResults() {
  return {
    conditions: [],
    services: [],
    blog_posts: [],
    community_questions: [],
    case_studies: [],
  };
}

/**
 * Executes multi-table search concurrently with resilience.
 *
 * @param {string} sanitizedQuery - Sanitized search term
 * @param {object} options - Search options
 * @param {string} [options.category] - Filter category or 'all'
 * @param {number} [options.limit] - Limit per category
 * @param {object} [options.client] - Supabase client instance
 * @returns {Promise<{ total: number, results: object }>}
 */
export async function executeSearch(sanitizedQuery, { category = 'all', limit = 5, client = supabase } = {}) {
  const results = createEmptyResults();
  if (!sanitizedQuery || sanitizedQuery.length < 2) {
    return { total: 0, results };
  }

  const normalizedCategory = typeof category === 'string' ? category.toLowerCase().trim() : 'all';
  const targetCategory = CATEGORY_MAP[normalizedCategory] || (normalizedCategory === 'all' ? 'all' : 'all');

  const plans = [];

  // 1. Conditions
  if (targetCategory === 'all' || targetCategory === 'conditions') {
    plans.push({
      key: 'conditions',
      query: client
        .from('conditions')
        .select('id, slug, hero_heading, page_title, short_description, hero_description, dc_code, dc_name, service:services(slug, is_active), body_system:body_systems(slug, is_published)')
        .eq('is_published', true)
        .or(`hero_heading.ilike.%${sanitizedQuery}%,page_title.ilike.%${sanitizedQuery}%,short_description.ilike.%${sanitizedQuery}%,dc_code.ilike.%${sanitizedQuery}%,dc_name.ilike.%${sanitizedQuery}%`)
        .limit(limit),
      mapper: (item) => {
        const serviceSlug = item.service?.slug;
        const systemSlug = item.body_system?.slug;
        const url = (serviceSlug && systemSlug)
          ? `/services/${serviceSlug}/${systemSlug}/${item.slug}`
          : `/conditions/${item.slug}`;

        return {
          id: item.id,
          title: item.hero_heading || item.page_title,
          category: 'conditions',
          url,
          description: item.short_description || item.hero_description || '',
          badge: 'Condition',
        };
      },
    });
  }

  // 2. Services
  if (targetCategory === 'all' || targetCategory === 'services') {
    plans.push({
      key: 'services',
      query: client
        .from('services')
        .select('id, slug, title, short_description, category')
        .eq('is_active', true)
        .or(`title.ilike.%${sanitizedQuery}%,short_description.ilike.%${sanitizedQuery}%`)
        .limit(limit),
      mapper: (item) => ({
        id: item.id,
        title: item.title,
        category: 'services',
        url: `/services/${item.slug}`,
        description: item.short_description || '',
        badge: 'Service',
      }),
    });
  }

  // 3. Blog Posts
  if (targetCategory === 'all' || targetCategory === 'blog_posts') {
    plans.push({
      key: 'blog_posts',
      query: client
        .from('blog_posts')
        .select('id, slug, title, excerpt, category')
        .eq('is_published', true)
        .or(`title.ilike.%${sanitizedQuery}%,excerpt.ilike.%${sanitizedQuery}%`)
        .limit(limit),
      mapper: (item) => ({
        id: item.id,
        title: item.title,
        category: 'blog_posts',
        url: `/blog/${item.slug}`,
        description: item.excerpt || '',
        badge: 'Blog',
      }),
    });
  }

  // 4. Community Questions
  if (targetCategory === 'all' || targetCategory === 'community_questions') {
    plans.push({
      key: 'community_questions',
      query: client
        .from('community_questions')
        .select('id, slug, title, content')
        .eq('status', 'published')
        .or(`title.ilike.%${sanitizedQuery}%,content.ilike.%${sanitizedQuery}%`)
        .limit(limit),
      mapper: (item) => {
        let snippet = '';
        if (item.content) {
          snippet = item.content.length > 160 ? `${item.content.slice(0, 157)}...` : item.content;
        }
        return {
          id: item.id,
          title: item.title,
          category: 'community_questions',
          url: `/community/question/${item.slug}`,
          description: snippet,
          badge: 'Community Q&A',
        };
      },
    });
  }

  // 5. Case Studies
  if (targetCategory === 'all' || targetCategory === 'case_studies') {
    plans.push({
      key: 'case_studies',
      query: client
        .from('case_studies')
        .select('id, slug, title, excerpt, challenge, key_takeaway')
        .eq('is_published', true)
        .or(`title.ilike.%${sanitizedQuery}%,excerpt.ilike.%${sanitizedQuery}%,challenge.ilike.%${sanitizedQuery}%,key_takeaway.ilike.%${sanitizedQuery}%`)
        .limit(limit),
      mapper: (item) => ({
        id: item.id,
        title: item.title,
        category: 'case_studies',
        url: `/case-studies/${item.slug}`,
        description: item.excerpt || item.key_takeaway || item.challenge || '',
        badge: 'Case Study',
      }),
    });
  }

  // Execute all planned category queries concurrently
  const settled = await Promise.allSettled(
    plans.map(async (plan) => {
      const response = await plan.query;
      if (response.error) {
        throw response.error;
      }
      return {
        key: plan.key,
        items: (response.data || []).map(plan.mapper),
      };
    })
  );

  for (const outcome of settled) {
    if (outcome.status === 'fulfilled') {
      results[outcome.value.key] = outcome.value.items;
    } else {
      console.error('[search] Query error in category:', outcome.reason?.message || outcome.reason);
    }
  }

  const total = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);
  return { total, results };
}

/**
 * Main Next.js API route handler for GET /api/search
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');

  try {
    const rawQuery = typeof req.query.q === 'string' ? req.query.q : '';
    const sanitized = sanitizeQuery(rawQuery);
    const category = typeof req.query.category === 'string' ? req.query.category : 'all';
    const limit = clampLimit(req.query.limit, 5, 1, 20);

    // Fast-path: short or empty queries return immediately without DB hit
    if (!sanitized || sanitized.length < 2) {
      return res.status(200).json({
        query: rawQuery.trim(),
        total: 0,
        results: createEmptyResults(),
      });
    }

    const { total, results } = await executeSearch(sanitized, { category, limit });

    return res.status(200).json({
      query: rawQuery.trim(),
      total,
      results,
    });
  } catch (err) {
    console.error('[search] Unhandled error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
