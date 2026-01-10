/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // We will strictly migrate to NEXT_PUBLIC_, so we don't need env mappings here unless strictly necessary.

    images: {
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
}

module.exports = nextConfig
