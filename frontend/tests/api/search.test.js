import { beforeEach, describe, expect, test, vi } from 'vitest';
import handler, {
  sanitizeQuery,
  clampLimit,
  executeSearch,
} from '../../pages/api/search';

// Hoist mock Supabase client
const { mockSupabase } = vi.hoisted(() => ({
  mockSupabase: {
    from: vi.fn(),
  },
}));

vi.mock('../../src/lib/supabase', () => ({
  supabase: mockSupabase,
}));

function createResponse() {
  return {
    statusCode: null,
    body: null,
    headers: {},
    setHeader: vi.fn(function setHeader(name, value) {
      this.headers[name] = value;
      return this;
    }),
    status: vi.fn(function setStatus(code) {
      this.statusCode = code;
      return this;
    }),
    json: vi.fn(function setJson(body) {
      this.body = body;
      return this;
    }),
  };
}

function createRequest({ method = 'GET', query = {}, headers = {} } = {}) {
  return {
    method,
    query,
    headers,
  };
}

function createQueryChain(data = [], error = null) {
  const result = { data, error };
  const chain = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    or: vi.fn(() => chain),
    limit: vi.fn(() => Promise.resolve(result)),
    then: (onFulfilled, onRejected) => Promise.resolve(result).then(onFulfilled, onRejected),
  };
  return chain;
}

describe('GET /api/search API Endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Method Guard', () => {
    test.each(['POST', 'PUT', 'DELETE', 'PATCH'])(
      'rejects %s with 405 Method Not Allowed and sets Allow: GET header',
      async (method) => {
        const req = createRequest({ method });
        const res = createResponse();

        await handler(req, res);

        expect(res.statusCode).toBe(405);
        expect(res.headers['Allow']).toBe('GET');
        expect(res.body).toEqual({ error: 'Method not allowed' });
        expect(mockSupabase.from).not.toHaveBeenCalled();
      }
    );
  });

  describe('2. Fast-Path / Empty & Short Query Handling', () => {
    test.each([
      ['empty string', ''],
      ['whitespace string', '   \t  '],
      ['single character', 'a'],
      ['single punctuation', ';'],
      ['only postgrest control chars', '[,()"\']'],
      ['undefined query', undefined],
    ])('returns immediate 200 with zero DB queries for %s', async (_, queryParam) => {
      const req = createRequest({
        method: 'GET',
        query: queryParam !== undefined ? { q: queryParam } : {},
      });
      const res = createResponse();

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.total).toBe(0);
      expect(res.body.results).toEqual({
        conditions: [],
        services: [],
        blog_posts: [],
        community_questions: [],
        case_studies: [],
      });
      expect(mockSupabase.from).not.toHaveBeenCalled();
      expect(res.headers['Cache-Control']).toBe('public, s-maxage=60, stale-while-revalidate=300');
    });
  });

  describe('3. Query Sanitization & Utility Helpers', () => {
    test('sanitizeQuery strips control characters, PostgREST delimiters, and SQL wildcards', () => {
      expect(sanitizeQuery('tinnitus,sleep')).toBe('tinnitus sleep');
      expect(sanitizeQuery('test\'; DROP TABLE--')).toBe('test DROP TABLE--');
      expect(sanitizeQuery('migraines()')).toBe('migraines');
      expect(sanitizeQuery('[audiology]')).toBe('audiology');
      expect(sanitizeQuery('"ptsd"')).toBe('ptsd');
      expect(sanitizeQuery('100%_disability')).toBe('100 disability');
      expect(sanitizeQuery('  cervical   spine  ')).toBe('cervical spine');
      expect(sanitizeQuery(null)).toBe('');
      expect(sanitizeQuery(123)).toBe('');
    });

    test('clampLimit bounds limit between 1 and 20 with fallback to default 5', () => {
      expect(clampLimit(undefined)).toBe(5);
      expect(clampLimit('abc')).toBe(5);
      expect(clampLimit(10)).toBe(10);
      expect(clampLimit('15')).toBe(15);
      expect(clampLimit(100)).toBe(20);
      expect(clampLimit(-5)).toBe(1);
      expect(clampLimit(0)).toBe(1);
    });
  });

  describe('4. Multi-Category Retrieval & Canonical Routing', () => {
    test('queries all 5 tables in parallel and formats results with badges and canonical URLs', async () => {
      const mockConditions = [
        {
          id: 'cond-1',
          slug: 'tinnitus-nexus-letter',
          hero_heading: 'Tinnitus Nexus Letter',
          page_title: 'Tinnitus Nexus Letter Guide',
          short_description: 'Expert medical opinion for tinnitus claims.',
          dc_code: '6260',
          dc_name: 'Tinnitus',
          service: { slug: 'independent-medical-opinion-nexus-letter', is_active: true },
          body_system: { slug: 'audiology', is_published: true },
        },
        {
          id: 'cond-2',
          slug: 'unlinked-condition',
          hero_heading: 'Unlinked Condition',
          page_title: 'Unlinked Condition Guide',
          short_description: 'Fallback test description.',
          service: null,
          body_system: null,
        },
      ];

      const mockServices = [
        {
          id: 'serv-1',
          slug: 'independent-medical-opinion-nexus-letter',
          title: 'Independent Medical Opinion / Nexus Letter',
          short_description: 'Clinician nexus opinions for veterans.',
          category: 'nexus-letter',
        },
      ];

      const mockBlogPosts = [
        {
          id: 'blog-1',
          slug: 'tinnitus-va-rating-guide',
          title: 'Tinnitus VA Rating Guide 2026',
          excerpt: 'Everything veterans need to know about tinnitus claims.',
          category: 'nexus-letters',
        },
      ];

      const mockCommunityQuestions = [
        {
          id: 'comm-1',
          slug: 'how-to-connect-tinnitus',
          title: 'How to connect tinnitus to military service?',
          content: 'I worked around loud jet engines on the flight deck and now experience high pitched ringing daily.',
        },
      ];

      const mockCaseStudies = [
        {
          id: 'case-1',
          slug: 'tinnitus-secondary-claim-grant',
          title: 'Tinnitus Direct Service Connection Granted',
          excerpt: 'Veteran granted 10% disability with comprehensive medical nexus letter.',
          key_takeaway: 'MOS noise exposure records were pivotal.',
        },
      ];

      mockSupabase.from.mockImplementation((table) => {
        switch (table) {
          case 'conditions':
            return createQueryChain(mockConditions);
          case 'services':
            return createQueryChain(mockServices);
          case 'blog_posts':
            return createQueryChain(mockBlogPosts);
          case 'community_questions':
            return createQueryChain(mockCommunityQuestions);
          case 'case_studies':
            return createQueryChain(mockCaseStudies);
          default:
            return createQueryChain([]);
        }
      });

      const req = createRequest({
        method: 'GET',
        query: { q: 'tinnitus', limit: '10' },
      });
      const res = createResponse();

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.query).toBe('tinnitus');
      expect(res.body.total).toBe(6); // 2 conditions + 1 service + 1 blog + 1 community + 1 case

      // Verify Condition 1 (3-tier canonical URL)
      const condition1 = res.body.results.conditions[0];
      expect(condition1.id).toBe('cond-1');
      expect(condition1.title).toBe('Tinnitus Nexus Letter');
      expect(condition1.category).toBe('conditions');
      expect(condition1.url).toBe('/services/independent-medical-opinion-nexus-letter/audiology/tinnitus-nexus-letter');
      expect(condition1.badge).toBe('Condition');

      // Verify Condition 2 (Fallback URL when relations are missing)
      const condition2 = res.body.results.conditions[1];
      expect(condition2.id).toBe('cond-2');
      expect(condition2.url).toBe('/conditions/unlinked-condition');

      // Verify Service
      const serviceItem = res.body.results.services[0];
      expect(serviceItem.title).toBe('Independent Medical Opinion / Nexus Letter');
      expect(serviceItem.category).toBe('services');
      expect(serviceItem.url).toBe('/services/independent-medical-opinion-nexus-letter');
      expect(serviceItem.badge).toBe('Service');

      // Verify Blog Post
      const blogItem = res.body.results.blog_posts[0];
      expect(blogItem.title).toBe('Tinnitus VA Rating Guide 2026');
      expect(blogItem.category).toBe('blog_posts');
      expect(blogItem.url).toBe('/blog/tinnitus-va-rating-guide');
      expect(blogItem.badge).toBe('Blog');

      // Verify Community Question
      const commItem = res.body.results.community_questions[0];
      expect(commItem.title).toBe('How to connect tinnitus to military service?');
      expect(commItem.category).toBe('community_questions');
      expect(commItem.url).toBe('/community/question/how-to-connect-tinnitus');
      expect(commItem.badge).toBe('Community Q&A');

      // Verify Case Study
      const caseItem = res.body.results.case_studies[0];
      expect(caseItem.title).toBe('Tinnitus Direct Service Connection Granted');
      expect(caseItem.category).toBe('case_studies');
      expect(caseItem.url).toBe('/case-studies/tinnitus-secondary-claim-grant');
      expect(caseItem.badge).toBe('Case Study');
    });
  });

  describe('5. Category Filtering', () => {
    test.each([
      ['services', 'services', ['services']],
      ['service', 'services', ['services']],
      ['conditions', 'conditions', ['conditions']],
      ['condition', 'conditions', ['conditions']],
      ['blog', 'blog_posts', ['blog_posts']],
      ['blog_posts', 'blog_posts', ['blog_posts']],
      ['community', 'community_questions', ['community_questions']],
      ['community_questions', 'community_questions', ['community_questions']],
      ['case_studies', 'case_studies', ['case_studies']],
    ])('category="%s" queries only %s table', async (paramVal, expectedTable) => {
      mockSupabase.from.mockImplementation(() => createQueryChain([{ id: '1', title: 'Test Item', slug: 'test' }]));

      const req = createRequest({
        method: 'GET',
        query: { q: 'nexus', category: paramVal },
      });
      const res = createResponse();

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(mockSupabase.from).toHaveBeenCalledTimes(1);
      expect(mockSupabase.from).toHaveBeenCalledWith(expectedTable);
    });

    test('unrecognized category falls back to querying all 5 categories', async () => {
      mockSupabase.from.mockImplementation(() => createQueryChain([]));

      const req = createRequest({
        method: 'GET',
        query: { q: 'nexus', category: 'unknown_filter' },
      });
      const res = createResponse();

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(mockSupabase.from).toHaveBeenCalledTimes(5);
    });
  });

  describe('6. Limit Clamping in Route', () => {
    test('clamps limit to maximum 20 when limit exceeds boundary', async () => {
      const chain = createQueryChain([]);
      mockSupabase.from.mockImplementation(() => chain);

      const req = createRequest({
        method: 'GET',
        query: { q: 'nexus', limit: '100', category: 'services' },
      });
      const res = createResponse();

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(chain.limit).toHaveBeenCalledWith(20);
    });

    test('clamps limit to minimum 1 when limit is non-positive', async () => {
      const chain = createQueryChain([]);
      mockSupabase.from.mockImplementation(() => chain);

      const req = createRequest({
        method: 'GET',
        query: { q: 'nexus', limit: '-10', category: 'services' },
      });
      const res = createResponse();

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(chain.limit).toHaveBeenCalledWith(1);
    });
  });

  describe('7. Resilience & Partial Error Handling', () => {
    test('handles database error on one table gracefully via Promise.allSettled', async () => {
      const mockServices = [
        {
          id: 'serv-1',
          slug: 'claim-readiness-review',
          title: 'Claim Readiness Review',
          short_description: 'Review claims before filing.',
        },
      ];

      // Simulate conditions table throwing an error, while services succeeds
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'conditions') {
          return createQueryChain(null, new Error('Postgres connection timeout'));
        }
        if (table === 'services') {
          return createQueryChain(mockServices, null);
        }
        return createQueryChain([]);
      });

      const req = createRequest({
        method: 'GET',
        query: { q: 'claim' },
      });
      const res = createResponse();

      await handler(req, res);

      // Route must return 200 despite conditions query failure
      expect(res.statusCode).toBe(200);
      expect(res.body.results.conditions).toEqual([]);
      expect(res.body.results.services).toHaveLength(1);
      expect(res.body.results.services[0].id).toBe('serv-1');
      expect(res.body.total).toBe(1);
    });

    test('returns 500 when an unhandled top-level error occurs', async () => {
      // Force executeSearch to throw unexpectedly
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Fatal internal client failure');
      });

      const req = createRequest({
        method: 'GET',
        query: { q: 'sleep' },
      });
      const res = createResponse();

      await handler(req, res);

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Internal server error.' });
    });
  });

  describe('8. executeSearch Direct Function Tests', () => {
    test('returns empty results container if query is empty or too short', async () => {
      const result = await executeSearch('x');
      expect(result.total).toBe(0);
      expect(result.results.conditions).toEqual([]);
    });

    test('truncates community question content snippet over 160 characters', async () => {
      const longContent = 'A'.repeat(200);
      const customClient = {
        from: vi.fn(() => createQueryChain([
          { id: 'q1', slug: 'long-question', title: 'Question Title', content: longContent }
        ])),
      };

      const result = await executeSearch('question', {
        category: 'community',
        client: customClient,
      });

      expect(result.total).toBe(1);
      expect(result.results.community_questions[0].description).toHaveLength(160);
      expect(result.results.community_questions[0].description.endsWith('...')).toBe(true);
    });
  });
});
