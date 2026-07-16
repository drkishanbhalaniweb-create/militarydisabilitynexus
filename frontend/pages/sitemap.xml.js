import { supabase } from '../src/lib/supabase';
import { buildConditionPath } from '../src/lib/conditionRouting';

const SITE_URL = "https://www.militarydisabilitynexus.com";

// Helper to safely format dates
const formatDate = (dateString) => {
    if (!dateString) return new Date().toISOString();
    return new Date(dateString).toISOString();
};

// Helper to escape special characters in XML
const escapeXml = (unsafe) => {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
};

// Helper to fetch all records with pagination safety
async function fetchAll(table, select = 'slug, updated_at', filters = {}) {
    let allData = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
        let query = supabase
            .from(table)
            .select(select)
            .range(page * pageSize, (page + 1) * pageSize - 1);

        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
            query = query.eq(key, value);
        });

        const { data, error } = await query;

        if (error) {
            console.error(`Error fetching ${table}:`, error);
            break;
        }

        if (data.length > 0) {
            allData = [...allData, ...data];
            page++;
            // If we got fewer records than asked for, we're done
            if (data.length < pageSize) {
                hasMore = false;
            }
        } else {
            hasMore = false;
        }
    }

    return allData;
}

const Sitemap = () => null;

export const getServerSideProps = async ({ res }) => {
    res.setHeader('Content-Type', 'text/xml');
    res.setHeader(
        'Cache-Control',
        'public, s-maxage=300, stale-while-revalidate=3600'
    );

    try {
        const [services, bodySystems, conditions, blogs, caseStudies, communityQuestions, clinicians] = await Promise.all([
            fetchAll('services', 'id, slug, updated_at', { is_active: true }),
            fetchAll('body_systems', 'id, slug, updated_at', { is_published: true }),
            fetchAll('conditions', 'slug, service_id, body_system_id, updated_at', { is_published: true }),
            fetchAll('blog_posts', 'slug, updated_at, published_at', { is_published: true }),
            fetchAll('case_studies', 'slug, updated_at, published_at', { is_published: true }),
            fetchAll('community_questions', 'slug, updated_at', { status: 'published' }),
            fetchAll('clinical_profiles', 'slug, updated_at', { is_active: true }),
        ]);

        // Static routes with priority and changefreq signals
        // Priority: 1.0 = homepage, 0.8 = core pages, 0.7 = content hubs, 0.5 = secondary pages
        // NOTE: /aid-attendance-form and /intake-form are excluded because they 301-redirect to /forms

        // Derive a "freshest" lastmod from dynamic content for hub pages
        const latestServiceDate = services.reduce((latest, s) => {
            const d = new Date(s.updated_at);
            return d > latest ? d : latest;
        }, new Date(0)).toISOString();

        const latestBlogDate = blogs.reduce((latest, b) => {
            const d = new Date(b.updated_at || b.published_at);
            return d > latest ? d : latest;
        }, new Date(0)).toISOString();

        const latestCaseStudyDate = caseStudies.reduce((latest, s) => {
            const d = new Date(s.updated_at || s.published_at);
            return d > latest ? d : latest;
        }, new Date(0)).toISOString();

        const now = new Date().toISOString();

        const staticRoutes = [
            { path: '', priority: '1.0', changefreq: 'weekly', lastmod: now },
            { path: '/services', priority: '0.9', changefreq: 'weekly', lastmod: latestServiceDate },
            { path: '/blog', priority: '0.8', changefreq: 'daily', lastmod: latestBlogDate },
            { path: '/case-studies', priority: '0.8', changefreq: 'weekly', lastmod: latestCaseStudyDate },
            { path: '/community', priority: '0.7', changefreq: 'daily', lastmod: now },
            { path: '/testimonials', priority: '0.7', changefreq: 'weekly' },
            { path: '/about', priority: '0.7', changefreq: 'monthly' },
            { path: '/contact', priority: '0.7', changefreq: 'monthly' },
            { path: '/forms', priority: '0.6', changefreq: 'monthly' },
            { path: '/claim-readiness-review', priority: '0.6', changefreq: 'monthly' },
            { path: '/cp-exam-coaching', priority: '0.6', changefreq: 'monthly' },
            { path: '/diagnostic', priority: '0.8', changefreq: 'monthly', lastmod: now },
            { path: '/editorial-policy', priority: '0.5', changefreq: 'monthly' },
            { path: '/medical-review-policy', priority: '0.5', changefreq: 'monthly' },
            { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
            { path: '/terms', priority: '0.3', changefreq: 'yearly' },
            { path: '/disclaimer', priority: '0.3', changefreq: 'yearly' },
        ];

        const urls = [];

        staticRoutes.forEach(route => {
            urls.push({
                loc: `${SITE_URL}${route.path}`,
                priority: route.priority,
                changefreq: route.changefreq,
                ...(route.lastmod && { lastmod: route.lastmod }),
            });
        });

        services.forEach(service => {
            if (service.slug) {
                urls.push({
                    loc: `${SITE_URL}/services/${escapeXml(service.slug)}`,
                    lastmod: formatDate(service.updated_at),
                    priority: '0.8',
                    changefreq: 'monthly',
                });
            }
        });

        const servicesById = new Map(services.map(service => [service.id, service]));
        const bodySystemsById = new Map(bodySystems.map(bodySystem => [bodySystem.id, bodySystem]));
        const addedBodySystemPaths = new Set();

        conditions.forEach(condition => {
            const service = servicesById.get(condition.service_id);
            const bodySystem = bodySystemsById.get(condition.body_system_id);
            if (!service || !bodySystem) return;

            const conditionPath = buildConditionPath({
                serviceSlug: service.slug,
                bodySystemSlug: bodySystem.slug,
                conditionSlug: condition.slug,
            });
            if (!conditionPath) return;

            const bodySystemPath = `/services/${service.slug}/${bodySystem.slug}`;
            if (!addedBodySystemPaths.has(bodySystemPath)) {
                urls.push({
                    loc: `${SITE_URL}${bodySystemPath}`,
                    lastmod: formatDate(bodySystem.updated_at),
                    priority: '0.7',
                    changefreq: 'monthly',
                });
                addedBodySystemPaths.add(bodySystemPath);
            }

            urls.push({
                loc: `${SITE_URL}${conditionPath}`,
                lastmod: formatDate(condition.updated_at),
                priority: '0.7',
                changefreq: 'monthly',
            });
        });

        blogs.forEach(post => {
            if (post.slug) {
                urls.push({
                    loc: `${SITE_URL}/blog/${escapeXml(post.slug)}`,
                    lastmod: formatDate(post.updated_at || post.published_at),
                    priority: '0.7',
                    changefreq: 'monthly',
                });
            }
        });

        caseStudies.forEach(study => {
            if (study.slug) {
                urls.push({
                    loc: `${SITE_URL}/case-studies/${escapeXml(study.slug)}`,
                    lastmod: formatDate(study.updated_at || study.published_at),
                    priority: '0.7',
                    changefreq: 'monthly',
                });
            }
        });

        communityQuestions.forEach(question => {
            if (question.slug) {
                urls.push({
                    loc: `${SITE_URL}/community/question/${escapeXml(question.slug)}`,
                    lastmod: formatDate(question.updated_at),
                    priority: '0.5',
                    changefreq: 'weekly',
                });
            }
        });

        clinicians.forEach(clinician => {
            if (clinician.slug) {
                urls.push({
                    loc: `${SITE_URL}/clinician/${escapeXml(clinician.slug)}`,
                    lastmod: formatDate(clinician.updated_at),
                    priority: '0.6',
                    changefreq: 'monthly',
                });
            }
        });

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
                .map(
                    (url) => `  <url>
    <loc>${url.loc}</loc>${url.lastmod ? `
    <lastmod>${url.lastmod}</lastmod>` : ''}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
                )
                .join('\n')}
</urlset>`;

        res.write(sitemap);
        res.end();
    } catch (e) {
        console.error('Sitemap generation error:', e);
        res.statusCode = 500;
        res.end();
    }

    return {
        props: {},
    };
};

export default Sitemap;
