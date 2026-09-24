import { beforeEach, describe, expect, test, vi } from 'vitest';

const { createClient, upsertLead } = vi.hoisted(() => ({
  createClient: vi.fn(),
  upsertLead: vi.fn().mockResolvedValue({ success: true, action: 'created' }),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient,
}));

vi.mock('../../src/lib/zohoCrm', () => ({
  upsertLead,
}));

function createResponse() {
  return {
    statusCode: null,
    body: null,
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

function createRequest(body, headers = {}) {
  return {
    method: 'POST',
    body,
    headers,
    socket: { remoteAddress: '127.0.0.1' },
  };
}

function createTableChain(tableName, options = {}) {
  const chain = {};

  chain.select = vi.fn(() => chain);
  chain.eq = vi.fn(() => chain);
  chain.gte = vi.fn(async () => ({
    count: options.rateLimitCount ?? 0,
    error: options.rateLimitError ?? null,
  }));
  chain.insert = vi.fn((payload) => {
    if (tableName === 'submission_rate_limits') {
      return Promise.resolve({ error: options.rateLimitWriteError ?? null });
    }

    chain.insertPayload = payload;
    return chain;
  });
  chain.single = vi.fn(async () => {
    const insertError = options.insertError ?? null;
    return {
      data: insertError ? null : { id: `${tableName}-id`, ...chain.insertPayload },
      error: insertError,
    };
  });

  return chain;
}

function mockSupabase(options = {}) {
  const chains = {};
  const client = {
    from: vi.fn((tableName) => {
      chains[tableName] = chains[tableName] || createTableChain(tableName, options);
      return chains[tableName];
    }),
  };

  createClient.mockReturnValue(client);
  return { client, chains };
}

async function importHandlers() {
  vi.resetModules();
  const [{ default: submitContact }, { default: submitForm }] = await Promise.all([
    import('../../pages/api/submit-contact'),
    import('../../pages/api/submit-form'),
  ]);

  return { submitContact, submitForm };
}

const validContact = {
  name: 'Pat Veteran',
  email: 'pat@example.com',
  phone: '8885551212',
  message: 'Please help me understand the evidence needed for my VA claim.',
  serviceTypes: ['nexus_letter'],
  meta: { startedAt: Date.now() - 5000, submittedAt: Date.now() },
};

const validForm = {
  formType: 'nexus_letter',
  fullName: 'Pat Veteran',
  email: 'pat@example.com',
  phone: '8885551212',
  requiresUpload: true,
  formData: {
    selectedServices: ['nexus_letter'],
    message: 'Please review the evidence gaps in my claim.',
  },
  meta: { startedAt: Date.now() - 5000, submittedAt: Date.now() },
};

describe('submission API routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    upsertLead.mockResolvedValue({ success: true, action: 'created' });
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
  });

  test('rejects non-POST requests', async () => {
    const { submitContact } = await importHandlers();
    const res = createResponse();

    await submitContact({ method: 'GET', headers: {}, socket: {} }, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.body).toEqual({ error: 'Method not allowed' });
  });

  test('submits contact payloads with sanitized fields and attribution data', async () => {
    const { chains } = mockSupabase();
    const { submitContact } = await importHandlers();
    const res = createResponse();

    const contactWithAttribution = {
      ...validContact,
      attribution: {
        anonymous_journey_id: 'e1d2c3b4-a5f6-4a7b-8c9d-0e1f2a3b4c5d',
        first_touch_source: 'google',
        first_touch_medium: 'cpc',
        first_touch_campaign: 'spring_nexus',
        referrer_category: 'paid',
        device_class: 'mobile',
      },
    };

    await submitContact(createRequest(contactWithAttribution), res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(chains.contacts.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Pat Veteran',
        email: 'pat@example.com',
        service_interest: 'nexus_letter',
        status: 'new',
        anonymous_journey_id: 'e1d2c3b4-a5f6-4a7b-8c9d-0e1f2a3b4c5d',
        first_touch_source: 'google',
        first_touch_medium: 'cpc',
        first_touch_campaign: 'spring_nexus',
        referrer_category: 'paid',
        device_class: 'mobile',
        qualification_status: 'pending',
      }),
    );
    expect(upsertLead).toHaveBeenCalledWith(
      expect.objectContaining({
        First_Name: 'Pat',
        Last_Name: 'Veteran',
        Email: 'pat@example.com',
        Phone: '(888) 555-1212',
        Company: 'Veteran (Self)',
        Lead_Source: 'Google Ads',
        Description: expect.stringContaining('--- CONTACT FORM INQUIRY ---'),
      }),
    );
    expect(res.body.success).toBe(true);
  });

  test('submits form payloads with sanitized fields and attribution data', async () => {
    const { chains } = mockSupabase();
    const { submitForm } = await importHandlers();
    const res = createResponse();

    const formWithAttribution = {
      ...validForm,
      attribution: {
        anonymous_journey_id: 'e1d2c3b4-a5f6-4a7b-8c9d-0e1f2a3b4c5d',
        first_touch_source: 'perplexity',
        first_touch_medium: 'ai_search',
        referrer_category: 'social_ai',
        device_class: 'desktop',
      },
    };

    await submitForm(createRequest(formWithAttribution), res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(chains.form_submissions.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        form_type: 'nexus_letter',
        full_name: 'Pat Veteran',
        requires_upload: true,
        status: 'new',
        anonymous_journey_id: 'e1d2c3b4-a5f6-4a7b-8c9d-0e1f2a3b4c5d',
        first_touch_source: 'perplexity',
        referrer_category: 'social_ai',
        device_class: 'desktop',
        qualification_status: 'pending',
      }),
    );
    expect(upsertLead).toHaveBeenCalledWith(
      expect.objectContaining({
        First_Name: 'Pat',
        Last_Name: 'Veteran',
        Email: 'pat@example.com',
        Phone: '(888) 555-1212',
        Company: 'Veteran (Self)',
        Lead_Source: 'Perplexity',
        Description: expect.stringContaining('--- INTAKE FORM SUBMISSION ---'),
      }),
    );
    expect(res.body.success).toBe(true);
  });

  test('returns 200 and records contact even if upsertLead rejects or fails', async () => {
    mockSupabase();
    upsertLead.mockRejectedValueOnce(new Error('Zoho API network failure'));
    const { submitContact } = await importHandlers();
    const res = createResponse();

    await submitContact(createRequest(validContact), res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.body.success).toBe(true);
    expect(res.body.contact).toBeDefined();
    expect(res.body.contact.id).toBe('contacts-id');
  });

  test('returns 200 and records contact even if upsertLead returns error response', async () => {
    mockSupabase();
    upsertLead.mockResolvedValueOnce({ success: false, error: 'Zoho rate limit 429' });
    const { submitContact } = await importHandlers();
    const res = createResponse();

    await submitContact(createRequest(validContact), res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.body.success).toBe(true);
    expect(res.body.contact).toBeDefined();
    expect(res.body.contact.id).toBe('contacts-id');
  });

  test('returns 200 and records form submission even if upsertLead rejects or fails', async () => {
    mockSupabase();
    upsertLead.mockRejectedValueOnce(new Error('Zoho API network failure'));
    const { submitForm } = await importHandlers();
    const res = createResponse();

    await submitForm(createRequest(validForm), res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.body.success).toBe(true);
    expect(res.body.submission).toBeDefined();
    expect(res.body.submission.id).toBe('form_submissions-id');
  });

  test('returns 200 and records form submission even if upsertLead returns error response', async () => {
    mockSupabase();
    upsertLead.mockResolvedValueOnce({ success: false, error: 'Zoho invalid credentials' });
    const { submitForm } = await importHandlers();
    const res = createResponse();

    await submitForm(createRequest(validForm), res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.body.success).toBe(true);
    expect(res.body.submission).toBeDefined();
    expect(res.body.submission.id).toBe('form_submissions-id');
  });

  test('rejects honeypot submissions before writing to Supabase', async () => {
    const { client } = mockSupabase();
    const { submitContact } = await importHandlers();
    const res = createResponse();

    await submitContact(createRequest({ ...validContact, meta: { honeypot: 'bot' } }), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.body.success).toBe(false);
    expect(client.from).not.toHaveBeenCalled();
  });

  test('rate limits non-local clients', async () => {
    mockSupabase({ rateLimitCount: 99 });
    const { submitForm } = await importHandlers();
    const res = createResponse();

    await submitForm(
      createRequest(validForm, {
        'x-forwarded-for': '203.0.113.15',
      }),
      res,
    );

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.body.error).toMatch(/Too many submissions/);
  });

  test('returns generic failure on database insert errors', async () => {
    mockSupabase({ insertError: new Error('database unavailable') });
    const { submitForm } = await importHandlers();
    const res = createResponse();

    await submitForm(createRequest(validForm), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.body).toEqual({ success: false, error: 'Failed to submit form.' });
  });
});
