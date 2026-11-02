const supabaseFixtures = {
  services: [
    {
      id: 'service-claim-readiness',
      slug: 'claim-readiness-review',
      title: 'Claim Readiness Review',
      short_description: 'A clinician-led review to identify gaps before filing.',
      icon: 'file-search',
      category: 'claim strategy',
      is_active: true,
      features: ['Evidence gap review', 'Claim pathway guidance'],
      pricing: { base_price: 250 },
      updated_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'service-nexus-letter',
      slug: 'independent-medical-opinion-nexus-letter',
      title: 'Independent Medical Opinion (IMO) / Nexus Letter',
      short_description: 'Expert medical nexus opinions from licensed clinicians.',
      icon: 'file-text',
      category: 'medical evidence',
      is_active: true,
      features: ['IMO preparation', 'Nexus analysis'],
      pricing: { base_price: 945 },
      updated_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'service-va-1151',
      slug: 'va-1151-claim',
      title: '1151 Claim (VA Malpractice)',
      short_description: 'Expert opinions for VA medical negligence and malpractice cases.',
      icon: 'alert-triangle',
      category: 'legal medical',
      is_active: true,
      features: ['VA hospital injury review', 'Tort & 1151 nexus opinion'],
      pricing: { base_price: 2000 },
      updated_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'service-dbq',
      slug: 'disability-benefits-questionnaire-dbq',
      title: 'Disability Benefits Questionnaire (DBQ)',
      short_description: 'Clinician-completed DBQs for initial or supplemental VA claims.',
      icon: 'clipboard-check',
      category: 'medical evidence',
      is_active: true,
      features: ['DBQ completion', 'Medical exam review'],
      pricing: { base_price: 600 },
      updated_at: '2026-01-01T00:00:00.000Z',
    },
  ],
  pricing_tiers: [
    {
      id: 'tier-internist',
      slug: 'internist-specialist',
      name: 'Internist / Specialist',
      provider_description: 'Board-Certified (Specialty-Matched)',
      base_price: '$945–$1,800',
      mental_health_price: '$1,600–$2,400',
      note: 'All claim theories included',
      best_for: 'Secondary, denied, complex claims. All theories (presumptive, direct, secondary) in one letter.',
      features: ["Board-certified physician matched to condition", "All claim theories in single letter", "Detailed medical literature citations", "Addresses counterarguments & denials", "Rush 48–72hrs available", "One-on-one specialist consultation"],
      is_featured: true,
      display_order: 1,
    },
    {
      id: 'tier-complex',
      slug: 'complex-high-stakes',
      name: 'Complex / High-Stakes',
      provider_description: 'Sub-Specialist or Multi-Specialist',
      base_price: '$2,000+',
      mental_health_price: '$2,000+',
      note: 'Custom quote',
      best_for: '1151, oncology, multi-condition TDIU, BVA appeals.',
      features: ["Sub-specialist or multi-specialist team", "Forensic-level record analysis", "Multi-condition combined opinions", "Rebuttal of negative C&P opinions", "BVA hearing-ready documentation", "Attorney coordination"],
      is_featured: false,
      display_order: 2,
    }
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
    {
      id: 'blog-sleep-apnea',
      slug: 'sleep-apnea-va-disability-claims-guide',
      title: 'Sleep Apnea VA Disability Claims: Complete Guide',
      excerpt: 'Everything you need to know about secondary service connection for sleep apnea.',
      category: 'guides',
      read_time: '6 min read',
      featured_image: null,
      featured_image_alt: null,
      is_published: true,
      published_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
      tags: ['sleep apnea', 'secondary claims'],
    },
    {
      id: 'blog-ptsd-rating',
      slug: 'ptsd-va-rating-chart-explained',
      title: 'PTSD VA Rating Chart Explained',
      excerpt: 'Understand how the VA rates PTSD and mental health disorders.',
      category: 'guides',
      read_time: '5 min read',
      featured_image: null,
      featured_image_alt: null,
      is_published: true,
      published_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
      tags: ['ptsd', 'mental health'],
    },
  ],
  testimonials: [],
  case_studies: [
    {
      id: 'case-sleep-apnea-gerd',
      slug: 'veteran-awarded-50-sleep-apnea-secondary-to-ptsd',
      title: 'Veteran Awarded 50% for Sleep Apnea Secondary to PTSD',
      excerpt: 'How an IMO nexus letter overcame a previous VA denial for sleep apnea.',
      outcome: '50% Service Connection Granted',
      condition: 'Obstructive Sleep Apnea',
      is_published: true,
      created_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'case-ptsd-increase',
      slug: 'marine-veteran-70-ptsd-rating-increase',
      title: 'Marine Corps Veteran Achieves 70% PTSD Rating',
      excerpt: 'Comprehensive forensic psychiatric evaluation securing increased rating.',
      outcome: 'Rating increased from 30% to 70%',
      condition: 'Post-Traumatic Stress Disorder',
      is_published: true,
      created_at: '2026-01-01T00:00:00.000Z',
    },
  ],
  community_questions: [
    {
      id: 'question-sleep-apnea-nexus',
      slug: 'what-medical-evidence-is-needed-for-sleep-apnea-nexus',
      title: 'What medical evidence is needed for a sleep apnea nexus letter?',
      content: 'I was diagnosed with sleep apnea after service. Can I connect it to my service-connected rhinitis?',
      status: 'published',
      upvotes: 14,
      view_count: 320,
      created_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'question-ptsd-stressor',
      slug: 'how-to-prove-ptsd-stressor-without-combat-badge',
      title: 'How do I prove a PTSD stressor without a combat badge?',
      content: 'Guidance on buddy statements and military records for non-combat PTSD claims.',
      status: 'published',
      upvotes: 22,
      view_count: 510,
      created_at: '2026-01-01T00:00:00.000Z',
    },
  ],
  clinical_profiles: [],
  conditions: [
    {
      id: 'condition-sleep-apnea',
      slug: 'sleep-apnea-nexus-letter',
      hero_heading: 'Sleep Apnea Nexus Letter',
      page_title: 'Sleep Apnea Nexus Letter | VA Disability Claim',
      service_id: 'service-nexus-letter',
      body_system_id: 'body-system-pulmonology',
      is_published: true,
      service: { slug: 'independent-medical-opinion-nexus-letter' },
      body_system: { slug: 'pulmonology' },
      services: { slug: 'independent-medical-opinion-nexus-letter' },
      body_systems: { slug: 'pulmonology' },
    },
    {
      id: 'condition-tinnitus',
      slug: 'tinnitus-nexus-letter',
      hero_heading: 'Tinnitus Nexus Letter',
      page_title: 'Tinnitus Nexus Letter & Independent Medical Opinion',
      service_id: 'service-nexus-letter',
      body_system_id: 'body-system-audiology',
      is_published: true,
      service: { slug: 'independent-medical-opinion-nexus-letter' },
      body_system: { slug: 'audiology' },
      services: { slug: 'independent-medical-opinion-nexus-letter' },
      body_systems: { slug: 'audiology' },
    },
    {
      id: 'condition-ptsd',
      slug: 'ptsd-nexus-letter',
      hero_heading: 'PTSD Nexus Letter',
      page_title: 'PTSD Nexus Letter & Psychological Evaluation',
      service_id: 'service-nexus-letter',
      body_system_id: 'body-system-mental-health',
      is_published: true,
      service: { slug: 'independent-medical-opinion-nexus-letter' },
      body_system: { slug: 'mental-health' },
      services: { slug: 'independent-medical-opinion-nexus-letter' },
      body_systems: { slug: 'mental-health' },
    },
  ],
  body_systems: [
    { id: 'body-system-pulmonology', name: 'Pulmonology', slug: 'pulmonology' },
    { id: 'body-system-audiology', name: 'Audiology', slug: 'audiology' },
    { id: 'body-system-mental-health', name: 'Mental Health', slug: 'mental-health' },
  ],
  file_uploads: [],
};

const defaultSearchFixtures = {
  conditions: [
    {
      id: 'cond-sleep-apnea',
      title: 'Sleep Apnea Nexus Letter',
      category: 'conditions',
      url: '/services/independent-medical-opinion-nexus-letter/pulmonology/sleep-apnea-nexus-letter',
      description: 'Medical nexus opinion connecting sleep apnea to service-connected conditions.',
      badge: 'Condition',
      keywords: ['sleep', 'apnea', 'pulmonology', 'nexus'],
    },
    {
      id: 'cond-ptsd',
      title: 'PTSD Nexus Letter',
      category: 'conditions',
      url: '/services/independent-medical-opinion-nexus-letter/mental-health/ptsd-nexus-letter',
      description: 'Psychiatric nexus opinion and record review for post-traumatic stress disorder.',
      badge: 'Condition',
      keywords: ['ptsd', 'trauma', 'mental health', 'nexus'],
    },
    {
      id: 'cond-tinnitus',
      title: 'Tinnitus Nexus Letter',
      category: 'conditions',
      url: '/services/independent-medical-opinion-nexus-letter/audiology/tinnitus-nexus-letter',
      description: 'Audiology nexus opinion documenting military noise exposure and bilateral tinnitus.',
      badge: 'Condition',
      keywords: ['tinnitus', 'hearing', 'audiology', 'nexus'],
    },
  ],
  services: [
    {
      id: 'serv-nexus-letter',
      title: 'Independent Medical Opinion (IMO) / Nexus Letter',
      category: 'services',
      url: '/services/independent-medical-opinion-nexus-letter',
      description: 'Expert medical nexus opinions from licensed clinicians.',
      badge: 'Service',
      keywords: ['nexus letter', 'imo', 'medical opinion', 'service connection'],
    },
    {
      id: 'serv-claim-readiness',
      title: 'Claim Readiness Review',
      category: 'services',
      url: '/services/claim-readiness-review',
      description: 'A clinician-led review to identify gaps before filing.',
      badge: 'Service',
      keywords: ['claim readiness', 'review', 'pre-filing', 'gap analysis'],
    },
    {
      id: 'serv-1151',
      title: '1151 Claim (VA Malpractice)',
      category: 'services',
      url: '/services/va-1151-claim',
      description: 'Expert opinions for VA medical negligence and malpractice cases.',
      badge: 'Service',
      keywords: ['malpractice', '1151', 'negligence', 'hospital injury'],
    },
    {
      id: 'serv-dbq',
      title: 'Disability Benefits Questionnaire (DBQ)',
      category: 'services',
      url: '/services/disability-benefits-questionnaire-dbq',
      description: 'Clinician-completed DBQs for initial or supplemental VA claims.',
      badge: 'Service',
      keywords: ['dbq', 'questionnaire', 'rating increase', 'disability benefits'],
    },
  ],
  blog_posts: [
    {
      id: 'blog-sleep-apnea',
      title: 'Sleep Apnea VA Disability Claims: Complete Guide',
      category: 'blog_posts',
      url: '/blog/sleep-apnea-va-disability-claims-guide',
      description: 'Secondary service connection guide for sleep apnea and medical nexus evidence.',
      badge: 'Blog',
      keywords: ['sleep apnea', 'guide', 'secondary claim', 'nexus'],
    },
    {
      id: 'blog-ptsd-rating',
      title: 'PTSD VA Rating Chart Explained',
      category: 'blog_posts',
      url: '/blog/ptsd-va-rating-chart-explained',
      description: 'How the VA rates PTSD from 0% to 100% based on occupational impairment.',
      badge: 'Blog',
      keywords: ['ptsd', 'rating', 'chart', 'mental health'],
    },
    {
      id: 'blog-nexus-basics',
      title: 'Nexus Letter Basics: What the VA Requires',
      category: 'blog_posts',
      url: '/blog/nexus-letter-basics',
      description: 'A short guide to understanding medical nexus evidence and standards of proof.',
      badge: 'Blog',
      keywords: ['nexus letter', 'basics', 'evidence', 'as likely as not'],
    },
  ],
  community_questions: [
    {
      id: 'comm-sleep-apnea',
      title: 'What medical evidence is needed for sleep apnea nexus?',
      category: 'community_questions',
      url: '/community/question/what-medical-evidence-is-needed-for-sleep-apnea-nexus',
      description: 'Sleep study requirements and clinician rationale for secondary connection.',
      badge: 'Community Q&A',
      keywords: ['sleep apnea', 'sleep study', 'evidence', 'secondary'],
    },
    {
      id: 'comm-ptsd-stressor',
      title: 'How do I prove a PTSD stressor without combat badge?',
      category: 'community_questions',
      url: '/community/question/how-to-prove-ptsd-stressor-without-combat-badge',
      description: 'Buddy statements, personal statements, and non-combat stressor verification.',
      badge: 'Community Q&A',
      keywords: ['ptsd', 'stressor', 'buddy statement', 'combat'],
    },
  ],
  case_studies: [
    {
      id: 'case-sleep-apnea',
      title: 'Veteran Awarded 50% for Sleep Apnea Secondary to PTSD',
      category: 'case_studies',
      url: '/case-studies/veteran-awarded-50-sleep-apnea-secondary-to-ptsd',
      description: 'Overcame a previous denial with clinician-led nexus opinion and medical literature.',
      badge: 'Case Study',
      keywords: ['sleep apnea', 'ptsd', '50%', 'secondary', 'grant'],
    },
    {
      id: 'case-ptsd-increase',
      title: 'Marine Corps Veteran Achieves 70% PTSD Rating',
      category: 'case_studies',
      url: '/case-studies/marine-veteran-70-ptsd-rating-increase',
      description: 'Comprehensive psychiatric evaluation securing increased rating from 30% to 70%.',
      badge: 'Case Study',
      keywords: ['ptsd', 'marine', '70%', 'increase', 'rating'],
    },
  ],
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

async function mockSearchApi(page, customHandlerOrFixtures) {
  await page.route(/.*\/api\/search(\?.*)?$/, async (route) => {
    const request = route.request();
    if (request.method() !== 'GET') {
      await route.fulfill({
        status: 405,
        contentType: 'application/json',
        headers: {
          'allow': 'GET',
          'access-control-allow-origin': '*',
        },
        body: JSON.stringify({ error: 'Method not allowed' }),
      });
      return;
    }

    if (typeof customHandlerOrFixtures === 'function') {
      const handled = await customHandlerOrFixtures(route);
      if (handled) return;
    }

    if (customHandlerOrFixtures && typeof customHandlerOrFixtures === 'object') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          'access-control-allow-origin': '*',
          'cache-control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
        body: JSON.stringify(customHandlerOrFixtures),
      });
      return;
    }

    const url = new URL(request.url());
    const rawQ = url.searchParams.get('q') || '';
    const q = rawQ.trim();
    const categoryFilter = url.searchParams.get('category') || 'all';
    const limit = Math.max(1, Math.min(20, parseInt(url.searchParams.get('limit') || '5', 10)));

    if (!q || q.length < 2) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          'access-control-allow-origin': '*',
          'cache-control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
        body: JSON.stringify({
          query: q,
          total: 0,
          results: {
            conditions: [],
            services: [],
            blog_posts: [],
            community_questions: [],
            case_studies: [],
          },
        }),
      });
      return;
    }

    const searchTerms = q.toLowerCase().split(/\s+/).filter(Boolean);
    const filterCategory = (catKey) => {
      if (categoryFilter !== 'all' && categoryFilter !== catKey) {
        return [];
      }
      const items = defaultSearchFixtures[catKey] || [];
      return items.filter((item) => {
        const text = `${item.title} ${item.description} ${(item.keywords || []).join(' ')}`.toLowerCase();
        return searchTerms.some((term) => text.includes(term));
      }).slice(0, limit);
    };

    const conditions = filterCategory('conditions');
    const services = filterCategory('services');
    const blog_posts = filterCategory('blog_posts');
    const community_questions = filterCategory('community_questions');
    const case_studies = filterCategory('case_studies');

    const total = conditions.length + services.length + blog_posts.length + community_questions.length + case_studies.length;

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: {
        'access-control-allow-origin': '*',
        'cache-control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
      body: JSON.stringify({
        query: q,
        total,
        results: {
          conditions,
          services,
          blog_posts,
          community_questions,
          case_studies,
        },
      }),
    });
  });
}

async function quietThirdParties(page) {
  const emptyResponse = (route) =>
    route.fulfill({
      status: 204,
      body: '',
    });

  await page.route('https://militarydisabilitynexus.zohobookings.com/**', emptyResponse);
  await page.route('https://*.zohobookings.com/**', emptyResponse);
  await page.route('https://*.zoho.com/**', emptyResponse);
  await page.route('https://bookings.nimbuspop.com/**', emptyResponse);
  await page.route('https://app.cal.com/**', emptyResponse);
  await page.route('https://cal.com/**', emptyResponse);
  await page.route('https://scheduler.zoom.us/**', emptyResponse);
  await page.route('https://*.zoom.us/**', emptyResponse);
  await page.route('https://www.facebook.com/**', emptyResponse);
  await page.route('https://connect.facebook.net/**', emptyResponse);
  await page.route('https://us.i.posthog.com/**', emptyResponse);
}

async function stabilizeExternalRequests(page, options = {}) {
  await mockBrowserSupabase(page);
  await quietThirdParties(page);
  if (options.disableSearchMock !== true) {
    await mockSearchApi(page, options.searchResults);
  }
}

module.exports = {
  stabilizeExternalRequests,
  mockSearchApi,
  defaultSearchFixtures,
  supabaseFixtures,
};
