import { beforeEach, describe, expect, test, vi } from 'vitest';
import handler, {
  sanitizeQuery,
  clampLimit,
  executeSearch,
} from '../../pages/api/search';

// Hoist mock Supabase client for Vitest isolation
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

describe('Adversarial Stress Testing: Search API & Sanitization Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. PostgREST AST Delimiter Neutralization', () => {
    const maliciousAstVectors = [
      ['comma separator injection', 'ptsd,sleep', 'ptsd sleep'],
      ['parentheses logic grouping', '(migraines)', 'migraines'],
      ['nested postgrest filter expression', 'title.eq.1,id.in.(1,2,3)', 'title.eq.1 id.in. 1 2 3'],
      ['bracket and brace delimiters', '[audiology]{disability}', 'audiology disability'],
      ['semicolon statement termination', 'test; select * from users;', 'test select * from users'],
      ['double and single quotes', '"ptsd" or \'tinnitus\'', 'ptsd or tinnitus'],
      ['backslash escape characters', 'path\\to\\danger', 'path to danger'],
      ['percent wildcard manipulation', '50%_rating', '50 rating'],
      ['multiple consecutive delimiters', '[,();"{}\\][\\]', ''],
      ['mixed delimiters in phrase', '(ptsd), "sleep apnea"; [tinnitus]', 'ptsd sleep apnea tinnitus'],
      ['colon and operator injection', 'status:eq:published,hero:ilike:foo', 'status:eq:published hero:ilike:foo'],
      ['exclamation and not operators', '!not.eq.draft', '!not.eq.draft'],
    ];

    test.each(maliciousAstVectors)('sanitizes %s safely: "%s" -> "%s"', (_, input, expected) => {
      expect(sanitizeQuery(input)).toBe(expected);
    });

    test('verifies that sanitized query stripped all delimiters before passing to .or()', async () => {
      const orSpy = vi.fn();
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: orSpy.mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
      mockSupabase.from.mockReturnValue(mockChain);

      const hostileInput = 'ptsd,sleep(migraines)[tinnitus]"cervical spine";100%_rating';
      const req = createRequest({
        query: { q: hostileInput },
      });
      const res = createResponse();

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(orSpy).toHaveBeenCalled();
      const passedFilter = orSpy.mock.calls[0][0];

      // Verify that no unescaped hostile delimiters exist in the filter string
      expect(passedFilter).not.toContain('(');
      expect(passedFilter).not.toContain(')');
      expect(passedFilter).not.toContain('[');
      expect(passedFilter).not.toContain(']');
      expect(passedFilter).not.toContain('{');
      expect(passedFilter).not.toContain('}');
      expect(passedFilter).not.toContain('"');
      expect(passedFilter).not.toContain("'");
      expect(passedFilter).not.toContain(';');
      expect(passedFilter).not.toContain('\\');
    });
  });

  describe('2. SQL Injection Neutralization & Fault Tolerance', () => {
    const sqlInjectionVectors = [
      ['classic tautology with comments', "' OR 1=1 --", 'OR 1=1 --'],
      ['statement termination & drop table', '"; DROP TABLE conditions; --', 'DROP TABLE conditions --'],
      ['union select injection', "' UNION SELECT id, email FROM auth.users --", 'UNION SELECT id email FROM auth.users --'],
      ['stacked statement sleep with underscore', "'; SELECT pg_sleep(5); --", 'SELECT pg sleep 5 --'],
      ['admin bypass', "admin'--", 'admin --'],
      ['hex encoded bypass', "0x27204f5220313d31", '0x27204f5220313d31'],
      ['dollar quoting tag', "$$ body $$", '$$ body $$'],
      ['null character injection', "test\0inject", 'test inject'],
    ];

    test.each(sqlInjectionVectors)('disarms SQL injection vector (%s): "%s"', (_, payload, expected) => {
      const sanitized = sanitizeQuery(payload);
      expect(sanitized).toBe(expected);
      expect(sanitized).not.toContain("'");
      expect(sanitized).not.toContain('"');
      expect(sanitized).not.toContain(';');
      expect(sanitized).not.toContain('\0');
      expect(sanitized).not.toContain('%');
      expect(sanitized).not.toContain('_');
    });

    test('returns clean 200 responses when database returns WAF 403 or syntax 400 errors', async () => {
      // Simulate Cloudflare WAF or PostgREST error
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Cloudflare WAF: 403 Forbidden', code: '403' },
        }),
      };
      mockSupabase.from.mockReturnValue(mockChain);

      const req = createRequest({
        query: { q: "' OR 1=1 --" },
      });
      const res = createResponse();

      await handler(req, res);

      // Must NOT fail with 500, must return 200 with empty results
      expect(res.statusCode).toBe(200);
      expect(res.body.total).toBe(0);
      expect(res.body.results.conditions).toEqual([]);
      expect(res.body.results.services).toEqual([]);
      expect(res.body.results.blog_posts).toEqual([]);
      expect(res.body.results.community_questions).toEqual([]);
      expect(res.body.results.case_studies).toEqual([]);
    });
  });

  describe('3. Unicode, Control Characters, Emojis, and Boundary Lengths', () => {
    test('handles ASCII control characters by replacing them with spaces', () => {
      const withNull = 'test\x00query';
      expect(sanitizeQuery(withNull)).toBe('test query');

      const withBellAndBackspace = 'bell\x07\x08alert';
      expect(sanitizeQuery(withBellAndBackspace)).toBe('bell alert');

      const withDel = 'delete\x7fchar';
      expect(sanitizeQuery(withDel)).toBe('delete char');

      const tabsAndNewlines = 'first\tsecond\nthird\rfourth';
      expect(sanitizeQuery(tabsAndNewlines)).toBe('first second third fourth');
    });

    test('preserves multi-byte Unicode, non-Latin alphabets, and emojis', () => {
      const emojis = '🔍 search 🧠 brain 🩺 doctor';
      expect(sanitizeQuery(emojis)).toBe('🔍 search 🧠 brain 🩺 doctor');

      const cyrillic = 'Посттравматический синдром';
      expect(sanitizeQuery(cyrillic)).toBe('Посттравматический синдром');

      const arabic = 'متلازمة ما بعد الصدمة';
      expect(sanitizeQuery(arabic)).toBe('متلازمة ما بعد الصدمة');

      const cjk = '創傷後壓力症候群';
      expect(sanitizeQuery(cjk)).toBe('創傷後壓力症候群');

      const hindi = 'तनाव विकार';
      expect(sanitizeQuery(hindi)).toBe('तनाव विकार');
    });

    test('processes massive 10,000 character strings in linear time without ReDoS', () => {
      const massiveString = 'a'.repeat(10000);
      const start = performance.now();
      const sanitized = sanitizeQuery(massiveString);
      const duration = performance.now() - start;

      expect(sanitized).toHaveLength(10000);
      expect(duration).toBeLessThan(100);
    });

    test('processes massive 50,000 character string containing hostile delimiters in linear time', () => {
      const hostileChars = '[,()"\';{}%_\\ \t\n\r]';
      const repeatedHostile = hostileChars.repeat(2500); // 50,000 chars
      const start = performance.now();
      const sanitized = sanitizeQuery(repeatedHostile);
      const duration = performance.now() - start;

      expect(sanitized).toBe('');
      expect(duration).toBeLessThan(200);
    });

    test('handler gracefully handles massive 10,000 char query without crash', async () => {
      const mockChain = createQueryChain([]);
      mockSupabase.from.mockReturnValue(mockChain);

      const req = createRequest({
        query: { q: 'x'.repeat(10000) },
      });
      const res = createResponse();

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.total).toBe(0);
    });
  });

  describe('4. Category Parameter Fuzzing & Type Confusion', () => {
    test.each([
      ['UPPERCASE category', 'CONDITIONS', 'conditions'],
      ['padded category with spaces', '   services   ', 'services'],
      ['mixed-case category', 'bLoG_pOsTs', 'blog_posts'],
      ['alias qa', 'qa', 'community_questions'],
      ['alias cases', 'cases', 'case_studies'],
      ['non-existent category', 'non_existent_category', 'all'],
      ['empty category', '', 'all'],
    ])('category parameter handling: "%s" (%s)', async (_, paramVal, expected) => {
      const chain = createQueryChain([]);
      mockSupabase.from.mockImplementation(() => chain);

      const req = createRequest({
        query: { q: 'nexus', category: paramVal },
      });
      const res = createResponse();

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      if (expected === 'all') {
        expect(mockSupabase.from).toHaveBeenCalledTimes(5);
      } else {
        expect(mockSupabase.from).toHaveBeenCalledTimes(1);
        expect(mockSupabase.from).toHaveBeenCalledWith(expected);
      }
    });

    test('handles prototype pollution keys safely without throwing 500', async () => {
      const chain = createQueryChain([]);
      mockSupabase.from.mockImplementation(() => chain);

      for (const dangerousKey of ['__proto__', 'constructor', 'toString', 'valueOf']) {
        const req = createRequest({
          query: { q: 'nexus', category: dangerousKey },
        });
        const res = createResponse();

        await handler(req, res);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('results');
      }
    });

    test('handles non-string category types in request query', async () => {
      const chain = createQueryChain([]);
      mockSupabase.from.mockImplementation(() => chain);

      const req = createRequest({
        query: { q: 'nexus', category: ['conditions', 'services'] }, // Array query
      });
      const res = createResponse();

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(mockSupabase.from).toHaveBeenCalledTimes(5); // Defaults safely to 'all'
    });
  });

  describe('5. Limit Parameter Boundary Values', () => {
    test.each([
      ['NaN string', 'NaN', 5],
      ['Infinity string', 'Infinity', 5],
      ['-Infinity string', '-Infinity', 5],
      ['negative limit', '-50', 1],
      ['zero limit', '0', 1],
      ['excessive positive limit', '99999999', 20],
      ['floating point limit', '7.85', 7],
      ['hexadecimal string', '0x10', 1],
      ['exponential notation', '1e5', 1],
      ['alphanumeric mix', '12items', 12],
      ['empty string', '', 5],
      ['null', null, 5],
      ['undefined', undefined, 5],
      ['object', {}, 5],
      ['array', ['15'], 15],
    ])('clamps boundary limit value (%s): %p -> %i', (_, inputVal, expected) => {
      expect(clampLimit(inputVal)).toBe(expected);
    });

    test('clamps limit correctly through API handler to max 20', async () => {
      const chain = createQueryChain([]);
      mockSupabase.from.mockImplementation(() => chain);

      const req = createRequest({
        query: { q: 'nexus', limit: '9999', category: 'services' },
      });
      const res = createResponse();

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(chain.limit).toHaveBeenCalledWith(20);
    });

    test('clamps negative limit correctly through API handler to min 1', async () => {
      const chain = createQueryChain([]);
      mockSupabase.from.mockImplementation(() => chain);

      const req = createRequest({
        query: { q: 'nexus', limit: '-999', category: 'services' },
      });
      const res = createResponse();

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(chain.limit).toHaveBeenCalledWith(1);
    });
  });

  describe('6. HTTP Methods & Malformed Request Invariants', () => {
    test.each(['POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'])(
      'rejects %s with 405 Method Not Allowed and sets Allow: GET',
      async (method) => {
        const req = createRequest({ method });
        const res = createResponse();

        await handler(req, res);

        expect(res.statusCode).toBe(405);
        expect(res.headers['Allow']).toBe('GET');
        expect(res.body.error).toBe('Method not allowed');
      }
    );

    test('handles array query parameter q: ["ptsd", "sleep"] by fast-pathing to 200 empty results', async () => {
      const req = createRequest({
        query: { q: ['ptsd', 'sleep'] },
      });
      const res = createResponse();

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.total).toBe(0);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    test('handles missing query object gracefully without unhandled exception', async () => {
      const req = { method: 'GET', query: {} };
      const res = createResponse();

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.total).toBe(0);
    });

    test('fast-paths queries that reduce to < 2 characters after sanitization', async () => {
      const inputs = ['   a   ', ';', ',,,', ' " " ', '%', '_', '\t\n'];
      for (const input of inputs) {
        const req = createRequest({ query: { q: input } });
        const res = createResponse();

        await handler(req, res);

        expect(res.statusCode).toBe(200);
        expect(res.body.total).toBe(0);
        expect(mockSupabase.from).not.toHaveBeenCalled();
      }
    });
  });

  describe('7. Direct executeSearch Stress Verification', () => {
    test('executeSearch handles rejected database client gracefully', async () => {
      const rejectingClient = {
        from: vi.fn(() => ({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          or: vi.fn().mockReturnThis(),
          limit: vi.fn().mockRejectedValue(new Error('Connection abort')),
        })),
      };

      const result = await executeSearch('stress', {
        category: 'conditions',
        client: rejectingClient,
      });

      expect(result.total).toBe(0);
      expect(result.results.conditions).toEqual([]);
    });

    test('executeSearch returns empty results container when query is sanitized to empty', async () => {
      const result = await executeSearch('  ', { category: 'all' });
      expect(result.total).toBe(0);
      expect(result.results.conditions).toEqual([]);
      expect(result.results.services).toEqual([]);
    });
  });
});
