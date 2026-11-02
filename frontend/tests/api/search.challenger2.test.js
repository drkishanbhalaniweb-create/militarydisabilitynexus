import { beforeEach, describe, expect, test, vi } from 'vitest';
import handler from '../../pages/api/search';

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

function createRejectingChain(rejectionReason) {
  const chain = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    or: vi.fn(() => chain),
    limit: vi.fn(() => Promise.reject(rejectionReason)),
    then: (onFulfilled, onRejected) => Promise.reject(rejectionReason).then(onFulfilled, onRejected),
  };
  return chain;
}

describe('Challenger 2 Empirical Stress Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Canonical Condition Routing Contract & Fallbacks', () => {
    test('condition with null service relation falls back safely to /conditions/:slug', async () => {
      const mockCondition = [
        {
          id: 'c-null-service',
          slug: 'tinnitus-nexus',
          hero_heading: 'Tinnitus Nexus',
          service: null,
          body_system: { slug: 'audiology', is_published: true },
        },
      ];
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'conditions') return createQueryChain(mockCondition);
        return createQueryChain([]);
      });

      const req = createRequest({ query: { q: 'tinnitus', category: 'conditions' } });
      const res = createResponse();
      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.results.conditions).toHaveLength(1);
      expect(res.body.results.conditions[0].url).toBe('/conditions/tinnitus-nexus');
    });

    test('condition with null body_system relation falls back safely to /conditions/:slug', async () => {
      const mockCondition = [
        {
          id: 'c-null-system',
          slug: 'tinnitus-nexus',
          hero_heading: 'Tinnitus Nexus',
          service: { slug: 'nexus-letter', is_active: true },
          body_system: null,
        },
      ];
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'conditions') return createQueryChain(mockCondition);
        return createQueryChain([]);
      });

      const req = createRequest({ query: { q: 'tinnitus', category: 'conditions' } });
      const res = createResponse();
      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.results.conditions).toHaveLength(1);
      expect(res.body.results.conditions[0].url).toBe('/conditions/tinnitus-nexus');
    });

    test('condition with both relations missing/undefined falls back to /conditions/:slug', async () => {
      const mockCondition = [
        {
          id: 'c-no-relations',
          slug: 'orphan-condition',
          hero_heading: 'Orphan Condition',
        },
      ];
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'conditions') return createQueryChain(mockCondition);
        return createQueryChain([]);
      });

      const req = createRequest({ query: { q: 'orphan', category: 'conditions' } });
      const res = createResponse();
      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.results.conditions).toHaveLength(1);
      expect(res.body.results.conditions[0].url).toBe('/conditions/orphan-condition');
    });

    test('evaluates condition URL when service.is_active is false', async () => {
      const mockCondition = [
        {
          id: 'c-inactive-service',
          slug: 'cp-exam-condition',
          hero_heading: 'Condition under Inactive Service',
          service: { slug: 'cp-exam-coaching', is_active: false },
          body_system: { slug: 'mental-health', is_published: true },
        },
      ];
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'conditions') return createQueryChain(mockCondition);
        return createQueryChain([]);
      });

      const req = createRequest({ query: { q: 'inactive', category: 'conditions' } });
      const res = createResponse();
      await handler(req, res);

      expect(res.statusCode).toBe(200);
      const item = res.body.results.conditions[0];
      // Record empirical behavior: does it build the 3-tier URL despite is_active: false?
      expect(item.url).toBe('/services/cp-exam-coaching/mental-health/cp-exam-condition');
    });

    test('evaluates condition URL when body_system.is_published is false', async () => {
      const mockCondition = [
        {
          id: 'c-unpub-system',
          slug: 'draft-system-condition',
          hero_heading: 'Condition under Unpublished System',
          service: { slug: 'nexus-letter', is_active: true },
          body_system: { slug: 'experimental-system', is_published: false },
        },
      ];
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'conditions') return createQueryChain(mockCondition);
        return createQueryChain([]);
      });

      const req = createRequest({ query: { q: 'draft', category: 'conditions' } });
      const res = createResponse();
      await handler(req, res);

      expect(res.statusCode).toBe(200);
      const item = res.body.results.conditions[0];
      // Record empirical behavior: does it build the 3-tier URL despite is_published: false?
      expect(item.url).toBe('/services/nexus-letter/experimental-system/draft-system-condition');
    });

    test('condition with null or empty page_title and hero_heading returns undefined title gracefully', async () => {
      const mockCondition = [
        {
          id: 'c-untitled',
          slug: 'untitled-slug',
          hero_heading: null,
          page_title: null,
          service: { slug: 'service-a', is_active: true },
          body_system: { slug: 'system-a', is_published: true },
        },
      ];
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'conditions') return createQueryChain(mockCondition);
        return createQueryChain([]);
      });

      const req = createRequest({ query: { q: 'untitled', category: 'conditions' } });
      const res = createResponse();
      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.results.conditions[0].title).toBeNull();
    });
  });

  describe('2. Partial and Complete Table Failure Resilience (Promise.allSettled)', () => {
    test('1 table error response: conditions table returns error object', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'conditions') {
          return createQueryChain(null, { message: 'relation "conditions" does not exist', code: '42P01' });
        }
        return createQueryChain([{ id: 'mock-1', title: `Title ${table}`, slug: `slug-${table}` }]);
      });

      const req = createRequest({ query: { q: 'test' } });
      const res = createResponse();
      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.results.conditions).toEqual([]);
      expect(res.body.results.services).toHaveLength(1);
      expect(res.body.results.blog_posts).toHaveLength(1);
      expect(res.body.results.community_questions).toHaveLength(1);
      expect(res.body.results.case_studies).toHaveLength(1);
      expect(res.body.total).toBe(4);
    });

    test('2 tables reject: conditions and services reject with network exceptions', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'conditions') return createRejectingChain(new Error('Connection reset by peer'));
        if (table === 'services') return createRejectingChain(new Error('ETIMEDOUT'));
        return createQueryChain([{ id: 'mock-1', title: `Title ${table}`, slug: `slug-${table}` }]);
      });

      const req = createRequest({ query: { q: 'test' } });
      const res = createResponse();
      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.results.conditions).toEqual([]);
      expect(res.body.results.services).toEqual([]);
      expect(res.body.results.blog_posts).toHaveLength(1);
      expect(res.body.results.community_questions).toHaveLength(1);
      expect(res.body.results.case_studies).toHaveLength(1);
      expect(res.body.total).toBe(3);
    });

    test('3 tables reject: conditions, services, and blog_posts reject', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'conditions') return createRejectingChain(new Error('Pool exhaustion'));
        if (table === 'services') return createRejectingChain(new Error('Pool exhaustion'));
        if (table === 'blog_posts') return createRejectingChain(new Error('Pool exhaustion'));
        return createQueryChain([{ id: 'mock-1', title: `Title ${table}`, slug: `slug-${table}` }]);
      });

      const req = createRequest({ query: { q: 'test' } });
      const res = createResponse();
      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.results.conditions).toEqual([]);
      expect(res.body.results.services).toEqual([]);
      expect(res.body.results.blog_posts).toEqual([]);
      expect(res.body.results.community_questions).toHaveLength(1);
      expect(res.body.results.case_studies).toHaveLength(1);
      expect(res.body.total).toBe(2);
    });

    test('4 tables reject: only case_studies succeeds', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'case_studies') {
          return createQueryChain([{ id: 'case-1', title: 'Solo Case Study', slug: 'solo' }]);
        }
        return createRejectingChain(new Error('Gateway 504'));
      });

      const req = createRequest({ query: { q: 'test' } });
      const res = createResponse();
      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.results.conditions).toEqual([]);
      expect(res.body.results.services).toEqual([]);
      expect(res.body.results.blog_posts).toEqual([]);
      expect(res.body.results.community_questions).toEqual([]);
      expect(res.body.results.case_studies).toHaveLength(1);
      expect(res.body.total).toBe(1);
    });

    test('all 5 tables reject simultaneously: returns HTTP 200 with 0 total and empty arrays', async () => {
      mockSupabase.from.mockImplementation((table) => {
        return createRejectingChain(new Error(`Fatal outage on ${table}`));
      });

      const req = createRequest({ query: { q: 'test' } });
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
    });

    test('non-Error rejection reasons (null, string, primitive) do not crash error logger', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'conditions') return createRejectingChain('Raw string rejection');
        if (table === 'services') return createRejectingChain(null);
        if (table === 'blog_posts') return createRejectingChain(undefined);
        if (table === 'community_questions') return createRejectingChain({ status: 500 });
        return createRejectingChain(42);
      });

      const req = createRequest({ query: { q: 'test' } });
      const res = createResponse();
      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.total).toBe(0);
      expect(res.body.results.conditions).toEqual([]);
    });
  });

  describe('3. Prototype Pollution and Malformed Query Stress', () => {
    test('req.query with null prototype Object.create(null)', async () => {
      const bareQuery = Object.create(null);
      bareQuery.q = 'tinnitus';
      bareQuery.category = 'conditions';

      mockSupabase.from.mockImplementation(() => createQueryChain([{ id: '1', slug: 't', hero_heading: 'T' }]));

      const req = { method: 'GET', query: bareQuery };
      const res = createResponse();
      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.results.conditions).toHaveLength(1);
    });

    test('req.query with prototype pollution keys on category param', async () => {
      mockSupabase.from.mockImplementation(() => createQueryChain([]));

      const pollutionKeys = ['__proto__', 'constructor', 'prototype', 'toString', 'valueOf', 'isPrototypeOf'];
      for (const key of pollutionKeys) {
        const req = createRequest({ query: { q: 'tinnitus', category: key } });
        const res = createResponse();
        await handler(req, res);

        expect(res.statusCode).toBe(200);
        expect(res.body.total).toBe(0);
      }
    });

    test('req.query with unexpected object structures in q and limit', async () => {
      const malformedQueries = [
        { q: { nested: 'object' } },
        { q: null },
        { q: true },
        { q: 12345 },
        { q: () => 'function' },
        { q: 'tinnitus', limit: { nested: 'limit' } },
        { q: 'tinnitus', limit: [1, 2, 3] },
        { q: 'tinnitus', limit: '0x14' },
      ];

      mockSupabase.from.mockImplementation(() => createQueryChain([]));

      for (const qObj of malformedQueries) {
        const req = createRequest({ query: qObj });
        const res = createResponse();
        await handler(req, res);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('results');
      }
    });

    test('req.query with Symbol in limit falls into top-level try/catch with HTTP 500', async () => {
      // Symbol cannot be converted to number with parseInt
      const req = createRequest({ query: { q: 'tinnitus', limit: Symbol('attack') } });
      const res = createResponse();
      await handler(req, res);

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Internal server error.' });
    });
  });

  describe('4. High Concurrent Load and Data Isolation', () => {
    test('100 concurrent requests do not cross-contaminate results containers', async () => {
      // Return distinct items based on query
      mockSupabase.from.mockImplementation((table) => {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          or: vi.fn((pattern) => {
            // Pattern looks like `hero_heading.ilike.%req-X%,...`
            const match = pattern.match(/%req-(\d+)%/);
            const reqId = match ? match[1] : 'unknown';
            return {
              limit: vi.fn(() => Promise.resolve({
                data: [
                  {
                    id: `${table}-${reqId}`,
                    slug: `${table}-${reqId}`,
                    hero_heading: `${table} for req ${reqId}`,
                    title: `${table} for req ${reqId}`,
                  },
                ],
                error: null,
              })),
            };
          }),
        };
      });

      const concurrentRequests = Array.from({ length: 100 }, (_, i) => {
        const req = createRequest({ query: { q: `req-${i}`, category: 'all' } });
        const res = createResponse();
        return handler(req, res).then(() => ({ index: i, res }));
      });

      const results = await Promise.all(concurrentRequests);

      for (const { index, res } of results) {
        expect(res.statusCode).toBe(200);
        expect(res.body.query).toBe(`req-${index}`);
        expect(res.body.total).toBe(5);

        // Verify no crosstalk between parallel requests
        for (const cat of ['conditions', 'services', 'blog_posts', 'community_questions', 'case_studies']) {
          expect(res.body.results[cat]).toHaveLength(1);
          expect(res.body.results[cat][0].id).toBe(`${cat}-${index}`);
        }
      }
    });

    test('100 concurrent requests with random failures maintain isolation and 200 response', async () => {
      let callCount = 0;
      mockSupabase.from.mockImplementation((table) => {
        callCount += 1;
        // Inject intermittent errors on every 3rd call
        if (callCount % 3 === 0) {
          return createRejectingChain(new Error('Intermittent database network flap'));
        }
        return createQueryChain([{ id: `${table}-ok`, title: `${table} ok`, slug: `${table}-ok` }]);
      });

      const promises = Array.from({ length: 100 }, (_, i) => {
        const req = createRequest({ query: { q: `stress-${i}` } });
        const res = createResponse();
        return handler(req, res).then(() => res);
      });

      const responses = await Promise.all(promises);

      // Every single request must return 200 without throwing 500
      for (const res of responses) {
        expect(res.statusCode).toBe(200);
        expect(typeof res.body.total).toBe('number');
        expect(res.body.results).toHaveProperty('conditions');
      }
    });
  });
});
