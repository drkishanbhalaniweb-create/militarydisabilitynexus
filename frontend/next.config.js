/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // We will strictly migrate to NEXT_PUBLIC_, so we don't need env mappings here unless strictly necessary.

    images: {
        qualities: [75, 90],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'source.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },

    async redirects() {
        let redirects = [
            {
                source: '/index',
                destination: '/',
                permanent: true, // 301 redirect
            },
            {
                source: '/index/:path*',
                destination: '/',
                permanent: true, // 301 redirect
            },
            {
                source: '/intake-form',
                destination: '/forms',
                permanent: true,
            },
            {
                source: '/aid-attendance-form',
                destination: '/forms?service=aid-and-attendance',
                permanent: true,
            },
            {
                source: '/cp-exam-coaching',
                destination: '/services',
                permanent: false,
            },
        ];

        try {
            const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
            
            if (url && key) {
                const res = await fetch(`${url}/rest/v1/conditions?select=slug,services(slug),body_systems(slug)`, {
                    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                });
                
                if (res.ok) {
                    const conditions = await res.json();
                    if (Array.isArray(conditions)) {
                        for (const condition of conditions) {
                            if (condition.services?.slug && condition.body_systems?.slug) {
                                redirects.push({
                                    source: `/conditions/${condition.slug}`,
                                    destination: `/services/${condition.services.slug}/${condition.body_systems.slug}/${condition.slug}`,
                                    permanent: true,
                                });
                            }
                        }
                    }
                }
            }
        } catch (e) {
            console.error("Failed to generate dynamic condition redirects during build:", e);
        }

        // Fallback catch-all for any unknown condition slugs or failed fetch
        redirects.push({
            source: '/conditions/:slug',
            destination: '/services/independent-medical-opinion-nexus-letter/mental-health/:slug',
            permanent: false,
        });

        // Redirect the old index hub page
        redirects.push({
            source: '/conditions',
            destination: '/services',
            permanent: true,
        });

        return redirects;
    },
}

module.exports = nextConfig
