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
        const redirects = [
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
            {
                source: '/va-1151-claim',
                destination: '/services/va-1151-claim',
                permanent: true,
            },
        ];

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
