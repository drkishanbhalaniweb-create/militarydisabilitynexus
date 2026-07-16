import { beforeEach, describe, expect, test, vi } from 'vitest';

const supabaseAdmin = vi.hoisted(() => ({
  auth: { getUser: vi.fn() },
  from: vi.fn(),
}));

vi.mock('../../src/lib/supabaseAdmin', () => ({ supabaseAdmin }));

const service = {
  id: '11111111-1111-4111-8111-111111111111',
  slug: 'independent-medical-opinion-nexus-letter',
};
const pulmonology = {
  id: '22222222-2222-4222-8222-222222222222',
  slug: 'pulmonology',
};
const sleepApnea = {
  slug: 'sleep-apnea-nexus-letter',
  service_id: service.id,
  body_system_id: pulmonology.id,
  service,
  body_system: pulmonology,
};

function createResponse({ failPath = null } = {}) {
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
    revalidate: vi.fn(async (path) => {
      if (path === failPath) throw new Error('revalidation failed');
    }),
  };
}

function mockDatabase() {
  supabaseAdmin.from.mockImplementation((table) => {
    if (table === 'admin_users') {
      const chain = {
        select: vi.fn(() => chain),
        eq: vi.fn(() => chain),
        maybeSingle: vi.fn(async () => ({ data: { id: 'admin-id' }, error: null })),
      };
      return chain;
    }

    if (table === 'services' || table === 'body_systems') {
      const data = table === 'services' ? [service] : [pulmonology];
      return {
        select: vi.fn(() => ({
          in: vi.fn(async () => ({ data, error: null })),
        })),
      };
    }

    if (table === 'conditions') {
      return {
        select: vi.fn(() => ({
          in: vi.fn(() => ({
            eq: vi.fn(async () => ({ data: [sleepApnea], error: null })),
          })),
        })),
      };
    }

    throw new Error(`Unexpected table ${table}`);
  });
}

async function loadHandler() {
  const { default: handler } = await import('../../pages/api/revalidate-condition');
  return handler;
}

describe('condition revalidation API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseAdmin.auth.getUser.mockResolvedValue({
      data: { user: { id: 'admin-id' } },
      error: null,
    });
    mockDatabase();
  });

  test('requires an authenticated active admin', async () => {
    supabaseAdmin.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
    const handler = await loadHandler();
    const res = createResponse();

    await handler({ method: 'POST', headers: {}, body: {} }, res);

    expect(res.statusCode).toBe(401);
    expect(res.revalidate).not.toHaveBeenCalled();
  });

  test('revalidates listings and the canonical condition page', async () => {
    const handler = await loadHandler();
    const res = createResponse();

    await handler({
      method: 'POST',
      headers: { authorization: 'Bearer valid-token' },
      body: {
        routes: [{
          serviceId: service.id,
          bodySystemId: pulmonology.id,
          conditionSlug: sleepApnea.slug,
        }],
      },
    }, res);

    expect(res.statusCode).toBe(200);
    expect(res.revalidate).toHaveBeenCalledWith('/services');
    expect(res.revalidate).toHaveBeenCalledWith(
      '/services/independent-medical-opinion-nexus-letter/pulmonology/sleep-apnea-nexus-letter',
    );
  });

  test('rejects unsafe route snapshots', async () => {
    const handler = await loadHandler();
    const res = createResponse();

    await handler({
      method: 'POST',
      headers: { authorization: 'Bearer valid-token' },
      body: {
        routes: [{
          serviceId: service.id,
          bodySystemId: pulmonology.id,
          conditionSlug: '../mental-health',
        }],
      },
    }, res);

    expect(res.statusCode).toBe(400);
    expect(res.revalidate).not.toHaveBeenCalled();
  });

  test('reports a cache refresh failure without hiding it', async () => {
    const conditionPath =
      '/services/independent-medical-opinion-nexus-letter/pulmonology/sleep-apnea-nexus-letter';
    const handler = await loadHandler();
    const res = createResponse({ failPath: conditionPath });

    await handler({
      method: 'POST',
      headers: { authorization: 'Bearer valid-token' },
      body: {
        routes: [{
          serviceId: service.id,
          bodySystemId: pulmonology.id,
          conditionSlug: sleepApnea.slug,
        }],
      },
    }, res);

    expect(res.statusCode).toBe(500);
    expect(res.body.failedPaths).toContain(conditionPath);
  });
});
