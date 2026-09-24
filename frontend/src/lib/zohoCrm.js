/**
 * Zoho CRM API Client Module
 *
 * Standalone client with automated OAuth token refresh caching, race-condition
 * deduplication, request timeout protection, automatic 401 retry, and safe error handling.
 */

let cachedToken = null;
let inflightTokenPromise = null;
let hasLoggedMissingConfig = false;

/**
 * Reads current Zoho configuration from environment variables.
 * Trailing slashes are stripped from URLs.
 */
function getZohoConfig() {
  return {
    clientId: process.env.ZOHO_CLIENT_ID?.trim() || '',
    clientSecret: process.env.ZOHO_CLIENT_SECRET?.trim() || '',
    refreshToken: process.env.ZOHO_REFRESH_TOKEN?.trim() || '',
    accountsUrl: (process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.com').trim().replace(/\/+$/, ''),
    apiDomain: (process.env.ZOHO_API_DOMAIN || 'https://www.zohoapis.com').trim().replace(/\/+$/, ''),
  };
}

/**
 * Checks whether all required Zoho credentials are present in the environment.
 * @returns {boolean}
 */
export function isZohoConfigured() {
  const config = getZohoConfig();
  return Boolean(config.clientId && config.clientSecret && config.refreshToken);
}

/**
 * Clears in-memory token cache and inflight promises.
 * Essential for deterministic testing.
 */
export function resetTokenCache() {
  cachedToken = null;
  inflightTokenPromise = null;
  hasLoggedMissingConfig = false;
}

/**
 * Retrieves a valid Zoho CRM access token, refreshing if necessary.
 * Caches tokens in-memory and proactively refreshes 5 minutes before expiry.
 * Concurrently deduplicates simultaneous refresh requests over the wire.
 *
 * @param {boolean} [forceRefresh=false] - When true, bypasses in-memory cache
 * @returns {Promise<string|null>} Access token string or null if unconfigured/failed
 */
export async function getAccessToken(forceRefresh = false) {
  if (!isZohoConfigured()) {
    if (!hasLoggedMissingConfig) {
      console.warn(
        '[Zoho CRM] Missing Zoho credentials (ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN). Operations will be skipped.',
      );
      hasLoggedMissingConfig = true;
    }
    return null;
  }

  // 5-minute safety buffer before token expiration (300,000 ms)
  const SAFETY_BUFFER_MS = 300000;
  if (cachedToken && !forceRefresh) {
    if (Date.now() < cachedToken.expiresAt - SAFETY_BUFFER_MS) {
      return cachedToken.accessToken;
    }
  }

  // Deduplicate concurrent token requests: share the active in-flight Promise
  if (inflightTokenPromise) {
    return inflightTokenPromise;
  }

  inflightTokenPromise = (async () => {
    const config = getZohoConfig();
    const tokenUrl = `${config.accountsUrl}/oauth/v2/token`;

    const bodyParams = new URLSearchParams({
      refresh_token: config.refreshToken,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: 'refresh_token',
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: bodyParams.toString(),
        signal: controller.signal,
      });

      if (!response.ok) {
        let errorDetail = `HTTP ${response.status}`;
        try {
          const errData = await response.json();
          if (errData?.error) {
            errorDetail = errData.error;
          }
        } catch {
          // Ignore JSON parse errors on non-OK responses
        }
        throw new Error(`Token refresh failed: ${errorDetail}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(`Zoho token error: ${data.error}`);
      }

      if (!data.access_token) {
        throw new Error('Zoho token response missing access_token');
      }

      const expiresInSeconds = Number(data.expires_in) || 3600;
      cachedToken = {
        accessToken: data.access_token,
        expiresAt: Date.now() + expiresInSeconds * 1000,
      };

      return cachedToken.accessToken;
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error('Token refresh timed out');
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
      inflightTokenPromise = null;
    }
  })();

  return inflightTokenPromise;
}

/**
 * Generic fetch wrapper for Zoho CRM API endpoints.
 * Handles timeouts, Authorization headers, JSON parsing, and 401 retry recovery.
 *
 * @param {string} endpoint - API path or full URL
 * @param {object} [options={}] - Request options (method, headers, body, timeoutMs)
 * @param {boolean} [retried=false] - Internal flag preventing infinite 401 retry loops
 * @returns {Promise<{ ok: boolean, status: number, data?: any, error?: string, skipped?: boolean, reason?: string }>}
 */
export async function executeZohoRequest(endpoint, options = {}, retried = false) {
  if (!isZohoConfigured()) {
    if (!hasLoggedMissingConfig) {
      console.warn(
        '[Zoho CRM] Missing Zoho credentials. Operations will be skipped.',
      );
      hasLoggedMissingConfig = true;
    }
    return { success: false, ok: false, status: 0, skipped: true, reason: 'missing_config' };
  }

  let token;
  try {
    token = await getAccessToken();
  } catch (err) {
    return {
      success: false,
      ok: false,
      status: 401,
      error: err.message || 'Failed to obtain access token',
    };
  }

  if (!token) {
    return { success: false, ok: false, status: 0, skipped: true, reason: 'missing_config' };
  }

  const config = getZohoConfig();
  const targetUrl = endpoint.startsWith('http://') || endpoint.startsWith('https://')
    ? endpoint
    : `${config.apiDomain}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const timeoutMs = options.timeoutMs || 8000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const fetchHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Zoho-oauthtoken ${token}`,
      ...options.headers,
    };

    let fetchBody = options.body;
    if (fetchBody && typeof fetchBody === 'object' && !(fetchBody instanceof URLSearchParams)) {
      fetchBody = JSON.stringify(fetchBody);
    }

    const response = await fetch(targetUrl, {
      method: options.method || 'GET',
      headers: fetchHeaders,
      body: fetchBody,
      signal: controller.signal,
    });

    let jsonData = null;
    if (response.status !== 204) {
      const text = await response.text();
      if (text) {
        try {
          jsonData = JSON.parse(text);
        } catch {
          jsonData = { rawText: text };
        }
      }
    }

    // Handle 401 or INVALID_TOKEN with a single automatic token refresh retry
    const isTokenInvalid = response.status === 401 || jsonData?.code === 'INVALID_TOKEN';
    if (isTokenInvalid && !retried) {
      cachedToken = null;
      try {
        await getAccessToken(true);
      } catch (refreshErr) {
        return {
          success: false,
          ok: false,
          status: 401,
          error: `Authentication retry failed: ${refreshErr.message}`,
        };
      }
      return executeZohoRequest(endpoint, options, true);
    }

    return {
      success: response.ok,
      ok: response.ok,
      status: response.status,
      data: jsonData,
      error: response.ok ? undefined : (jsonData?.message || jsonData?.code || `HTTP ${response.status}`),
    };
  } catch (err) {
    if (err.name === 'AbortError') {
      return {
        success: false,
        ok: false,
        status: 408,
        error: 'Request timeout',
      };
    }
    return {
      success: false,
      ok: false,
      status: 500,
      error: err.message || 'Network request failed',
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Upserts a Lead into Zoho CRM using duplicate check on Email.
 *
 * @param {object} leadPayload - Zoho CRM Lead field mapping
 * @param {object} [options={}] - Additional options (duplicateCheckFields, timeoutMs)
 * @returns {Promise<{ success: boolean, leadId?: string, action?: 'created'|'updated', raw?: any, error?: string, skipped?: boolean, reason?: string }>}
 */
export async function upsertLead(leadPayload, options = {}) {
  if (!isZohoConfigured()) {
    if (!hasLoggedMissingConfig) {
      console.warn(
        '[Zoho CRM] Missing Zoho credentials. Operations will be skipped.',
      );
      hasLoggedMissingConfig = true;
    }
    return { success: false, skipped: true, reason: 'missing_config' };
  }

  const payload = {
    data: [leadPayload],
    duplicate_check_fields: options.duplicateCheckFields || ['Email'],
  };

  const res = await executeZohoRequest('/crm/v3/Leads/upsert', {
    method: 'POST',
    body: payload,
    ...options,
  });

  if (res.skipped) {
    return { success: false, skipped: true, reason: res.reason };
  }

  if (!res.ok) {
    return {
      success: false,
      error: res.error || res.data?.message || 'Upsert failed',
      raw: res.data,
    };
  }

  const recordResult = res.data?.data?.[0];
  if (!recordResult) {
    return {
      success: false,
      error: 'Invalid response format from Zoho CRM',
      raw: res.data,
    };
  }

  if (recordResult.status === 'error') {
    return {
      success: false,
      error: recordResult.message || recordResult.code || 'Upsert failed',
      raw: res.data,
    };
  }

  const isCreated = recordResult.action === 'insert' || recordResult.action === 'created';
  return {
    success: true,
    leadId: recordResult.details?.id || recordResult.id || null,
    action: isCreated ? 'created' : 'updated',
    raw: res.data,
  };
}

/**
 * Creates a Lead in Zoho CRM without duplicate checking.
 *
 * @param {object} leadPayload - Zoho CRM Lead field mapping
 * @param {object} [options={}] - Additional options (timeoutMs)
 * @returns {Promise<{ success: boolean, leadId?: string, raw?: any, error?: string, skipped?: boolean, reason?: string }>}
 */
export async function createLead(leadPayload, options = {}) {
  if (!isZohoConfigured()) {
    if (!hasLoggedMissingConfig) {
      console.warn(
        '[Zoho CRM] Missing Zoho credentials. Operations will be skipped.',
      );
      hasLoggedMissingConfig = true;
    }
    return { success: false, skipped: true, reason: 'missing_config' };
  }

  const payload = {
    data: [leadPayload],
  };

  const res = await executeZohoRequest('/crm/v3/Leads', {
    method: 'POST',
    body: payload,
    ...options,
  });

  if (res.skipped) {
    return { success: false, skipped: true, reason: res.reason };
  }

  if (!res.ok) {
    return {
      success: false,
      error: res.error || res.data?.message || 'Create lead failed',
      raw: res.data,
    };
  }

  const recordResult = res.data?.data?.[0];
  if (!recordResult) {
    return {
      success: false,
      error: 'Invalid response format from Zoho CRM',
      raw: res.data,
    };
  }

  if (recordResult.status === 'error') {
    return {
      success: false,
      error: recordResult.message || recordResult.code || 'Create lead failed',
      raw: res.data,
    };
  }

  return {
    success: true,
    leadId: recordResult.details?.id || recordResult.id || null,
    raw: res.data,
  };
}

/**
 * Searches for existing Leads in Zoho CRM matching an email address.
 *
 * @param {string} email - Email address to search for
 * @param {object} [options={}] - Additional options (timeoutMs)
 * @returns {Promise<{ success: boolean, leads?: Array<any>, raw?: any, error?: string, skipped?: boolean, reason?: string }>}
 */
export async function searchLeadByEmail(email, options = {}) {
  if (!isZohoConfigured()) {
    if (!hasLoggedMissingConfig) {
      console.warn(
        '[Zoho CRM] Missing Zoho credentials. Operations will be skipped.',
      );
      hasLoggedMissingConfig = true;
    }
    return { success: false, skipped: true, reason: 'missing_config' };
  }

  const res = await executeZohoRequest(
    `/crm/v3/Leads/search?email=${encodeURIComponent(email)}`,
    {
      method: 'GET',
      ...options,
    },
  );

  if (res.skipped) {
    return { success: false, skipped: true, reason: res.reason };
  }

  // HTTP 204 No Content signifies no matching records found
  if (res.status === 204) {
    return {
      success: true,
      leads: [],
      raw: null,
    };
  }

  if (!res.ok) {
    return {
      success: false,
      error: res.error || res.data?.message || 'Search failed',
      raw: res.data,
    };
  }

  return {
    success: true,
    leads: Array.isArray(res.data?.data) ? res.data.data : [],
    raw: res.data,
  };
}

const zohoCrm = {
  isZohoConfigured,
  getAccessToken,
  executeZohoRequest,
  upsertLead,
  createLead,
  searchLeadByEmail,
  resetTokenCache,
};

export default zohoCrm;
