import { supabase } from '../src/lib/supabase';
import { buildConditionPath } from '../src/lib/conditionRouting';
import { extractYouTubeId, parseDurationInput } from '../src/lib/testimonials';

const SITE_URL = "https://www.militarydisabilitynexus.com";

// Helper to safely format dates
const formatDate = (dateString) => {
    if (!dateString) return new Date().toISOString();
    try {
        const d = new Date(dateString);
        return !Number.isNaN(d.getTime()) ? d.toISOString() : new Date().toISOString();
    } catch {
        return new Date().toISOString();
    }
};

// Helper to escape special characters in XML
const escapeXml = (unsafe) => {
    if (unsafe === null || unsafe === undefined) return '';
    const str = typeof unsafe === 'string' ? unsafe : String(unsafe);
    return str.replace(/[<>&'"]/g, (c) => {
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
        const [services, bodySystems, conditions, blogs, caseStudies, communityQuestions, clinicians, testimonials] = await Promise.all([
            fetchAll('services', 'id, slug, updated_at', { is_active: true }),
            fetchAll('body_systems', 'id, slug, updated_at', { is_published: true }),
            fetchAll('conditions', 'slug, service_id, body_system_id, updated_at', { is_published: true }),
            fetchAll('blog_posts', 'slug, updated_at, published_at', { is_published: true }),
            fetchAll('case_studies', 'slug, updated_at, published_at', { is_published: true }),
            fetchAll('community_questions', 'slug, updated_at', { status: 'published' }),
            fetchAll('clinical_profiles', 'slug, updated_at', { is_active: true }),
            fetchAll('testimonials', 'slug, name, feedback, video_url, video_thumbnail_url, video_duration, condition_tag, updated_at, created_at, tags'),
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

        // Dedicated Video Testimonials Spoke Pages (/testimonials/[slug])
        const videoTestimonials = (testimonials || []).filter(
            (t) => Boolean(t.slug && t.slug.trim()) && Boolean(t.video_url && t.video_url.trim())
        );

        videoTestimonials.forEach((vt) => {
            const videoId = extractYouTubeId(vt.video_url);
            const veteranName = vt.name?.trim() || 'Veteran';
            let rawThumb = vt.video_thumbnail_url?.trim() || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : `${SITE_URL}/android-chrome-512x512.png`);
            if (!rawThumb.startsWith('http://') && !rawThumb.startsWith('https://')) {
                rawThumb = `${SITE_URL}${rawThumb.startsWith('/') ? '' : '/'}${rawThumb}`;
            }
            const thumbnailLoc = rawThumb;

            const videoTitle = vt.condition_tag
                ? `${veteranName} - ${vt.condition_tag.trim()} VA Disability Review`
                : `${veteranName} VA Disability Review`;
            const rawDesc = vt.feedback
                ? vt.feedback
                : `${veteranName} shares their experience with Military Disability Nexus.`;
            const videoDesc = rawDesc.replace(/\s+/g, ' ').trim().slice(0, 1024);
            const isDirectMedia = Boolean(
                vt.video_provider === 'html5' ||
                !videoId ||
                /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(vt.video_url) ||
                vt.video_url.includes('/storage/')
            );
            let contentLoc = isDirectMedia ? vt.video_url.trim() : null;
            if (contentLoc && !contentLoc.startsWith('http://') && !contentLoc.startsWith('https://')) {
                contentLoc = `${SITE_URL}${contentLoc.startsWith('/') ? '' : '/'}${contentLoc}`;
            }
            const playerLoc = !contentLoc && videoId
                ? `https://www.youtube-nocookie.com/embed/${videoId}`
                : null;

            const safeTags = (vt.tags || [])
                .filter((t) => t && String(t).trim())
                .slice(0, 32)
                .map((t) => escapeXml(String(t).trim()));

            const parsedDuration = parseDurationInput(vt.video_duration);
            const validDuration = parsedDuration > 0
                ? Math.min(28800, Math.max(1, parsedDuration))
                : null;

            urls.push({
                loc: `${SITE_URL}/testimonials/${escapeXml(vt.slug.trim())}`,
                lastmod: formatDate(vt.updated_at || vt.created_at),
                priority: '0.8',
                changefreq: 'monthly',
                video: {
                    thumbnail_loc: escapeXml(thumbnailLoc),
                    title: escapeXml(videoTitle),
                    description: escapeXml(videoDesc),
                    content_loc: contentLoc ? escapeXml(contentLoc) : null,
                    player_loc: playerLoc ? escapeXml(playerLoc) : null,
                    duration: validDuration,
                    publication_date: formatDate(vt.created_at),
                    tags: safeTags,
                },
            });
        });

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urls
                .map(
                    (url) => `  <url>
    <loc>${url.loc}</loc>${url.lastmod ? `
    <lastmod>${url.lastmod}</lastmod>` : ''}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>${url.video ? `
    <video:video>
      <video:thumbnail_loc>${url.video.thumbnail_loc}</video:thumbnail_loc>
      <video:title>${url.video.title}</video:title>
      <video:description>${url.video.description}</video:description>${url.video.content_loc ? `
      <video:content_loc>${url.video.content_loc}</video:content_loc>` : ''}${url.video.player_loc ? `
      <video:player_loc>${url.video.player_loc}</video:player_loc>` : ''}${url.video.duration ? `
      <video:duration>${url.video.duration}</video:duration>` : ''}
      <video:publication_date>${url.video.publication_date}</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>${(url.video.tags || []).map((tag) => `
      <video:tag>${tag}</video:tag>`).join('')}
    </video:video>` : ''}
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
