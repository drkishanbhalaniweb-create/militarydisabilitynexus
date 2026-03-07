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
    res.setHeader('Content-Type', 'text/xml');
    res.setHeader(
        'Cache-Control',
        'public, s-maxage=3600, stale-while-revalidate=86400'
    );

    try {
        const services = await fetchAll('services', 'slug, updated_at', { is_active: true });
        const blogs = await fetchAll('blog_posts', 'slug, updated_at, published_at', { is_published: true });
        const caseStudies = await fetchAll('case_studies', 'slug, updated_at, published_at', { is_published: true });

        const staticRoutes = [
            '', // root
            '/services',
            '/blog',
            '/case-studies',
            '/testimonials',
            '/about',
            '/contact',
            '/forms',
            '/intake-form',
            '/aid-attendance-form',
            '/claim-readiness-review',
            '/diagnostic',
            '/community',
            '/privacy',
            '/terms',
            '/disclaimer',
        ];

        const urls = [];

        staticRoutes.forEach(route => {
            urls.push({
                loc: `${SITE_URL}${route}`,
            });
        });

        services.forEach(service => {
            if (service.slug) {
                urls.push({
                    loc: `${SITE_URL}/services/${escapeXml(service.slug)}`,
                    lastmod: formatDate(service.updated_at),
                });
            }
        });

        blogs.forEach(post => {
            if (post.slug) {
                urls.push({
                    loc: `${SITE_URL}/blog/${escapeXml(post.slug)}`,
                    lastmod: formatDate(post.updated_at || post.published_at),
                });
            }
        });

        caseStudies.forEach(study => {
            if (study.slug) {
                urls.push({
                    loc: `${SITE_URL}/case-studies/${escapeXml(study.slug)}`,
                    lastmod: formatDate(study.updated_at || study.published_at),
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
