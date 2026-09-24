import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import zohoCrm, {
  createLead,
  executeZohoRequest,
  getAccessToken,
  isZohoConfigured,
  resetTokenCache,
  searchLeadByEmail,
  upsertLead,
} from '../../src/lib/zohoCrm';

describe('zohoCrm client', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    resetTokenCache();
    vi.restoreAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    resetTokenCache();
  });

  function setZohoEnv() {
    process.env.ZOHO_CLIENT_ID = 'test-client-id';
    process.env.ZOHO_CLIENT_SECRET = 'test-client-secret';
    process.env.ZOHO_REFRESH_TOKEN = 'test-refresh-token';
    process.env.ZOHO_ACCOUNTS_URL = 'https://accounts.zoho.com';
    process.env.ZOHO_API_DOMAIN = 'https://www.zohoapis.com';
  }

  function clearZohoEnv() {
    delete process.env.ZOHO_CLIENT_ID;
    delete process.env.ZOHO_CLIENT_SECRET;
    delete process.env.ZOHO_REFRESH_TOKEN;
    delete process.env.ZOHO_ACCOUNTS_URL;
    delete process.env.ZOHO_API_DOMAIN;
  }

  function createJsonResponse(data, status = 200, ok = true) {
    return {
      ok,
      status,
      text: vi.fn(async () => (data !== null ? JSON.stringify(data) : '')),
      json: vi.fn(async () => data),
    };
  }

  describe('1. Missing Configuration Graceful Fallback', () => {
    it('returns { skipped: true, reason: "missing_config" } and logs a single warning when credentials are not configured', async () => {
      clearZohoEnv();
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      expect(isZohoConfigured()).toBe(false);

      const token = await getAccessToken();
      expect(token).toBeNull();

      const upsertResult = await upsertLead({ Email: 'veteran@example.com' });
      expect(upsertResult).toEqual({
        success: false,
        skipped: true,
        reason: 'missing_config',
      });

      const createResult = await createLead({ Email: 'veteran@example.com' });
      expect(createResult).toEqual({
        success: false,
        skipped: true,
        reason: 'missing_config',
      });

      const searchResult = await searchLeadByEmail('veteran@example.com');
      expect(searchResult).toEqual({
        success: false,
        skipped: true,
        reason: 'missing_config',
      });

      const execResult = await executeZohoRequest('/crm/v3/Leads');
      expect(execResult).toEqual({
        success: false,
        ok: false,
        status: 0,
        skipped: true,
        reason: 'missing_config',
      });

      // Confirm fetch was never called
      expect(global.fetch).not.toHaveBeenCalled();

      // Confirm single warning logged even after multiple calls
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy.mock.calls[0][0]).toContain('Missing Zoho credentials');
    });
  });

  describe('2. Fetch and Cache Access Token', () => {
    it('fetches and caches access token successfully upon first request', async () => {
      setZohoEnv();

      global.fetch.mockResolvedValueOnce(
        createJsonResponse({
          access_token: '1000.initial-access-token',
          expires_in: 3600,
          api_domain: 'https://www.zohoapis.com',
          token_type: 'Bearer',
        }),
      );

      const token = await getAccessToken();

      expect(token).toBe('1000.initial-access-token');
      expect(global.fetch).toHaveBeenCalledTimes(1);

      const [fetchUrl, fetchOptions] = global.fetch.mock.calls[0];
      expect(fetchUrl).toBe('https://accounts.zoho.com/oauth/v2/token');
      expect(fetchOptions.method).toBe('POST');
      expect(fetchOptions.headers['Content-Type']).toBe(
        'application/x-www-form-urlencoded',
      );
      expect(fetchOptions.body).toContain('grant_type=refresh_token');
      expect(fetchOptions.body).toContain('client_id=test-client-id');
      expect(fetchOptions.body).toContain('refresh_token=test-refresh-token');
    });
  });

  describe('3. Token Caching & Safety Buffer', () => {
    it('reuses cached access token on consecutive calls within valid lifetime without re-fetching', async () => {
      setZohoEnv();

      global.fetch.mockResolvedValueOnce(
        createJsonResponse({
          access_token: 'cached-token-abc',
          expires_in: 3600,
        }),
      );

      const token1 = await getAccessToken();
      const token2 = await getAccessToken();
      const token3 = await getAccessToken();

      expect(token1).toBe('cached-token-abc');
      expect(token2).toBe('cached-token-abc');
      expect(token3).toBe('cached-token-abc');
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Force refresh should bypass the cache and fetch again
      global.fetch.mockResolvedValueOnce(
        createJsonResponse({
          access_token: 'forced-token-xyz',
          expires_in: 3600,
        }),
      );

      const tokenForced = await getAccessToken(true);
      expect(tokenForced).toBe('forced-token-xyz');
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('4. Race-Condition Concurrency Deduplication', () => {
    it('deduplicates simultaneous token refresh calls (only 1 fetch over the wire)', async () => {
      setZohoEnv();

      // Introduce a slight delay to simulate async network roundtrip
      global.fetch.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve(
                createJsonResponse({
                  access_token: 'concurrent-dedup-token',
                  expires_in: 3600,
                }),
              );
            }, 30);
          }),
      );

      // Trigger 5 concurrent token requests
      const promises = [
        getAccessToken(),
        getAccessToken(),
        getAccessToken(),
        getAccessToken(),
        getAccessToken(),
      ];

      const results = await Promise.all(promises);

      expect(results).toEqual([
        'concurrent-dedup-token',
        'concurrent-dedup-token',
        'concurrent-dedup-token',
        'concurrent-dedup-token',
        'concurrent-dedup-token',
      ]);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('5. Automatic 401 Retry & Token Recovery', () => {
    it('automatically refreshes token on 401 response and retries the request once', async () => {
      setZohoEnv();

      // 1. Initial token fetch
      global.fetch.mockResolvedValueOnce(
        createJsonResponse({
          access_token: 'expired-token-1',
          expires_in: 3600,
        }),
      );

      // 2. First API call returns 401 Unauthorized
      global.fetch.mockResolvedValueOnce(
        createJsonResponse({ code: 'INVALID_TOKEN', message: 'invalid token' }, 401, false),
      );

      // 3. Forced token refresh after 401
      global.fetch.mockResolvedValueOnce(
        createJsonResponse({
          access_token: 'refreshed-token-2',
          expires_in: 3600,
        }),
      );

      // 4. Retried API call succeeds
      global.fetch.mockResolvedValueOnce(
        createJsonResponse({
          data: [
            {
              code: 'SUCCESS',
              action: 'update',
              details: { id: '5013772000000099999' },
              status: 'success',
            },
          ],
        }),
      );

      const result = await upsertLead({
        Email: 'veteran@example.com',
        Last_Name: 'Davis',
      });

      expect(result.success).toBe(true);
      expect(result.leadId).toBe('5013772000000099999');
      expect(result.action).toBe('updated');

      expect(global.fetch).toHaveBeenCalledTimes(4);

      // Verify the 4th call used the refreshed token in Authorization header
      const [, retryOptions] = global.fetch.mock.calls[3];
      expect(retryOptions.headers.Authorization).toBe(
        'Zoho-oauthtoken refreshed-token-2',
      );
    });
  });

  describe('6. Response Parsing (created vs updated)', () => {
    it('handles upsertLead created action correctly', async () => {
      setZohoEnv();

      // Token request
      global.fetch.mockResolvedValueOnce(
        createJsonResponse({
          access_token: 'token-parse-test',
          expires_in: 3600,
        }),
      );

      // Upsert response for created lead
      global.fetch.mockResolvedValueOnce(
        createJsonResponse({
          data: [
            {
              code: 'SUCCESS',
              action: 'insert',
              details: { id: 'new-lead-id-123' },
              message: 'record added',
              status: 'success',
            },
          ],
        }),
      );

      const result = await upsertLead({
        Email: 'newbie@example.com',
        Last_Name: 'Miller',
      });

      expect(result).toEqual({
        success: true,
        leadId: 'new-lead-id-123',
        action: 'created',
        raw: expect.any(Object),
      });
    });

    it('handles upsertLead updated action correctly', async () => {
      setZohoEnv();

      // Token request
      global.fetch.mockResolvedValueOnce(
        createJsonResponse({
          access_token: 'token-parse-test',
          expires_in: 3600,
        }),
      );

      // Upsert response for existing lead update
      global.fetch.mockResolvedValueOnce(
        createJsonResponse({
          data: [
            {
              code: 'SUCCESS',
              action: 'update',
              details: { id: 'existing-lead-id-456' },
              message: 'record updated',
              status: 'success',
            },
          ],
        }),
      );

      const result = await upsertLead({
        Email: 'returning@example.com',
        Last_Name: 'Miller',
      });

      expect(result).toEqual({
        success: true,
        leadId: 'existing-lead-id-456',
        action: 'updated',
        raw: expect.any(Object),
      });
    });

    it('handles upsertLead API error gracefully', async () => {
      setZohoEnv();

      global.fetch.mockResolvedValueOnce(
        createJsonResponse({
          access_token: 'token-parse-test',
          expires_in: 3600,
        }),
      );

      global.fetch.mockResolvedValueOnce(
        createJsonResponse({
          data: [
            {
              code: 'MANDATORY_NOT_FOUND',
              message: 'required field not found: Last_Name',
              status: 'error',
            },
          ],
        }),
      );

      const result = await upsertLead({ Email: 'incomplete@example.com' });
      expect(result.success).toBe(false);
      expect(result.error).toContain('required field not found');
    });
  });

  describe('7. Upstream Hangs & Request Timeouts', () => {
    it('handles API network timeout gracefully without throwing uncaught exceptions', async () => {
      setZohoEnv();

      // Token request
      global.fetch.mockResolvedValueOnce(
        createJsonResponse({
          access_token: 'token-timeout-test',
          expires_in: 3600,
        }),
      );

      // Simulate AbortError on CRM endpoint
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';
      global.fetch.mockRejectedValueOnce(abortError);

      const result = await upsertLead(
        { Email: 'timeout@example.com' },
        { timeoutMs: 100 },
      );

      expect(result).toEqual({
        success: false,
        error: 'Request timeout',
        raw: undefined,
      });
    });

    it('handles token refresh timeout gracefully', async () => {
      setZohoEnv();

      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';
      global.fetch.mockRejectedValueOnce(abortError);

      const result = await upsertLead({ Email: 'timeout@example.com' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Token refresh timed out');
    });
  });

  describe('Additional Operations: createLead and searchLeadByEmail', () => {
    it('creates lead successfully with createLead()', async () => {
      setZohoEnv();

      global.fetch.mockResolvedValueOnce(
        createJsonResponse({
          access_token: 'token-create-test',
          expires_in: 3600,
        }),
      );

      global.fetch.mockResolvedValueOnce(
        createJsonResponse({
          data: [
            {
              code: 'SUCCESS',
              details: { id: 'created-lead-789' },
              status: 'success',
            },
          ],
        }),
      );

      const result = await createLead({
        Email: 'direct@example.com',
        Last_Name: 'Johnson',
      });

      expect(result.success).toBe(true);
      expect(result.leadId).toBe('created-lead-789');
    });

    it('searches lead by email returning matching records', async () => {
      setZohoEnv();

      global.fetch.mockResolvedValueOnce(
        createJsonResponse({
          access_token: 'token-search-test',
          expires_in: 3600,
        }),
      );

      global.fetch.mockResolvedValueOnce(
        createJsonResponse({
          data: [{ id: 'lead-searched-001', Email: 'found@example.com' }],
        }),
      );

      const result = await searchLeadByEmail('found@example.com');
      expect(result.success).toBe(true);
      expect(result.leads).toHaveLength(1);
      expect(result.leads[0].id).toBe('lead-searched-001');
    });

    it('handles searchLeadByEmail HTTP 204 No Content as empty leads array', async () => {
      setZohoEnv();

      global.fetch.mockResolvedValueOnce(
        createJsonResponse({
          access_token: 'token-search-test',
          expires_in: 3600,
        }),
      );

      // Zoho returns 204 when no records are found
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        text: vi.fn(async () => ''),
        json: vi.fn(async () => null),
      });

      const result = await searchLeadByEmail('notfound@example.com');
      expect(result.success).toBe(true);
      expect(result.leads).toEqual([]);
      expect(result.raw).toBeNull();
    });

    it('default export provides all exported functions', () => {
      expect(zohoCrm.isZohoConfigured).toBe(isZohoConfigured);
      expect(zohoCrm.getAccessToken).toBe(getAccessToken);
      expect(zohoCrm.executeZohoRequest).toBe(executeZohoRequest);
      expect(zohoCrm.upsertLead).toBe(upsertLead);
      expect(zohoCrm.createLead).toBe(createLead);
      expect(zohoCrm.searchLeadByEmail).toBe(searchLeadByEmail);
      expect(zohoCrm.resetTokenCache).toBe(resetTokenCache);
    });
  });
});
