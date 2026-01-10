import { supabase } from '../src/lib/supabase';

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
    // 1. Set strict headers (Hardening Requirement #4)
    res.setHeader('Content-Type', 'text/xml');
    res.setHeader(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, proxy-revalidate'
    );

    try {
        // 2. Fetch all data with pagination safety (Hardening Requirement #3)
        // Services
        const services = await fetchAll('services', 'slug, updated_at', { is_active: true });

        // Blogs
        const blogs = await fetchAll('blog_posts', 'slug, updated_at, published_at', { is_published: true });

        // Case Studies
        const caseStudies = await fetchAll('case_studies', 'slug, updated_at, published_at', { is_published: true });

        // Community Questions (SEO Goldmine!)
        const communityQuestions = await fetchAll('community_questions', 'slug, created_at', { status: 'published' });

        // 3. Define Static Routes (Hardening Requirement #2 - No garbage)
        const staticRoutes = [
            '', // root
            '/services',
            '/blog',
            '/case-studies',
            '/about',
            '/contact',
            '/claim-readiness-review',
            '/diagnostic',
            '/community',
            '/privacy',
            '/terms',
            '/disclaimer',
        ];

        // 4. Build URL Maps
        const urls = [];

        // Add static routes
        staticRoutes.forEach(route => {
            urls.push({
                loc: `${SITE_URL}${route}`,
                lastmod: new Date().toISOString(),
                priority: route === '' ? '1.0' : (route.includes('claim') || route.includes('diagnostic')) ? '0.9' : '0.8',
            });
        });

        // Add Services
        services.forEach(service => {
            if (service.slug) {
                urls.push({
                    loc: `${SITE_URL}/services/${escapeXml(service.slug)}`,
                    lastmod: formatDate(service.updated_at),
                    priority: '0.9',
                });
            }
        });

        // Add Blogs
        blogs.forEach(post => {
            if (post.slug) {
                urls.push({
                    loc: `${SITE_URL}/blog/${escapeXml(post.slug)}`,
                    lastmod: formatDate(post.updated_at || post.published_at),
                    priority: '0.7',
                });
            }
        });

        // Add Case Studies
        caseStudies.forEach(study => {
            if (study.slug) {
                urls.push({
                    loc: `${SITE_URL}/case-studies/${escapeXml(study.slug)}`,
                    lastmod: formatDate(study.updated_at || study.published_at),
                    priority: '0.7',
                });
            }
        });

        // Add Community Questions
        communityQuestions.forEach(question => {
            if (question.slug) {
                urls.push({
                    loc: `${SITE_URL}/community/question/${escapeXml(question.slug)}`, // Matches /community/question/[slug].js
                    lastmod: formatDate(question.created_at), // Questions might not have updated_at, fallback to created_at
                    priority: '0.8', // High priority for user generated content
                });
            }
        });

        // 5. Generate XML
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
                .map(
                    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
  </url>`
                )
                .join('\n')}
</urlset>`;

        res.write(sitemap);
        res.end();
    } catch (e) {
        console.error('Sitemap generation error:', e);
        // In case of error, end the response to prevent timeout, but log it.
        // We might want to send a basic XML or status 500, but writing empty XML is safer than hanging.
        res.statusCode = 500;
        res.end();
    }

    return {
        props: {},
    };
};

export default Sitemap;
