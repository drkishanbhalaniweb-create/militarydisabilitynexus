const supabaseFixtures = {
  services: [
    {
      id: 'service-claim-readiness',
      slug: 'claim-readiness-review',
      title: 'Claim Readiness Review',
      short_description: 'A clinician-led review to identify gaps before filing.',
      icon: 'file-search',
      category: 'claim strategy',
      features: ['Evidence gap review', 'Claim pathway guidance'],
      pricing: { base_price: 250 },
      updated_at: '2026-01-01T00:00:00.000Z',
    },
  ],
  blog_posts: [
    {
      id: 'blog-nexus-letter',
      slug: 'nexus-letter-basics',
      title: 'Nexus Letter Basics',
      excerpt: 'A short guide to understanding medical nexus evidence.',
      category: 'nexus-letters',
      read_time: '4 min read',
      featured_image: null,
      featured_image_alt: null,
      is_published: true,
      published_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
      tags: ['nexus'],
    },
  ],
  testimonials: [],
  case_studies: [],
  community_questions: [],
  clinical_profiles: [],
  conditions: [],
  file_uploads: [],
};

function tableNameFromUrl(url) {
  const [, restPath = ''] = url.pathname.split('/rest/v1/');
  return restPath.split('/')[0];
}

function responseForTable(tableName, method) {
  if (method === 'OPTIONS') {
    return null;
  }

  if (method === 'POST') {
    if (tableName === 'contacts') {
      return { id: 'contact-e2e', status: 'new' };
    }

    if (tableName === 'form_submissions') {
      return { id: 'form-submission-e2e', status: 'new' };
    }

    if (tableName === 'diagnostic_sessions') {
      return { id: 'diagnostic-e2e', session_id: 'diagnostic-session-e2e' };
    }

    return {};
  }

  return supabaseFixtures[tableName] || [];
}

async function mockBrowserSupabase(page) {
  await page.route(/https?:\/\/(127\.0\.0\.1:54321|localhost:54321|[^/]+\.supabase\.co)\/.*/, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const corsHeaders = {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
      'access-control-allow-headers': '*',
      'access-control-expose-headers': 'content-range',
    };

    if (request.method() === 'OPTIONS') {
      await route.fulfill({
        status: 204,
        headers: corsHeaders,
        body: '',
      });
      return;
    }

    if (url.pathname.includes('/rest/v1/')) {
      const tableName = tableNameFromUrl(url);
      const body = responseForTable(tableName, request.method());

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          ...corsHeaders,
          'content-range': '0-0/1',
        },
        body: JSON.stringify(body),
      });
      return;
    }

    if (url.pathname.includes('/auth/v1/')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({ user: null, session: null }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: corsHeaders,
      body: '{}',
    });
  });
}

async function quietThirdParties(page) {
  const emptyResponse = (route) =>
    route.fulfill({
      status: 204,
      body: '',
    });

  await page.route('https://app.cal.com/**', emptyResponse);
  await page.route('https://cal.com/**', emptyResponse);
  await page.route('https://www.facebook.com/**', emptyResponse);
  await page.route('https://connect.facebook.net/**', emptyResponse);
  await page.route('https://us.i.posthog.com/**', emptyResponse);
}

async function stabilizeExternalRequests(page) {
  await mockBrowserSupabase(page);
  await quietThirdParties(page);
}

module.exports = {
  stabilizeExternalRequests,
};
